from dataclasses import dataclass
from datetime import datetime, date
from statistics import mean
from typing import Dict, Optional, List, Tuple

from sqlalchemy.orm import Session
from sqlalchemy import and_

# APIs externas
from app.services.WeatherAPI import get_weather_conditions
from app.services.MareaAPI import get_marea_conditions

# Modelos SQLAlchemy
from app.models.models import (
    VariableMeteorologica,
    TipoVariableMeteorologica,
)

# ============================
# Config/Constantes del dominio
# ============================

# Nombres EXACTOS tal como están seedados en tipoVariable_data.py
NOMBRE_V_VIENTO = "Viento - velocidad"
NOMBRE_O_ALTURA = "Oleaje - altura"
NOMBRE_O_PERIODO = "Oleaje - período"
NOMBRE_M_MAREA = "Marea - altura"
NOMBRE_P_INTENSIDAD = "Precipitación - intensidad"
NOMBRE_T_AIRE = "Temperatura del aire"
NOMBRE_T_AGUA = "Temperatura del agua"

def safe_mean(values: List[float]) -> Optional[float]:
    vals = [v for v in values if v is not None]
    return mean(vals) if vals else None

# ============================
# Estructura temporal interna
# ============================

@dataclass
class WeatherDayAgg:
    # Google - daytimeForecast (diario)
    wind_speed_kmh: Optional[float]              # asumimos km/h por default (ver parámetro)
    precip_qpf_mm: Optional[float]               # cantidad total en mm (día completo)
    air_temp_max_c: Optional[float]
    air_temp_min_c: Optional[float]
    # StormGlass (horario -> agregamos 24h)
    water_temp_avg_c: Optional[float]
    wave_height_avg_m: Optional[float]
    wave_period_avg_s: Optional[float]
    tide_height_avg_m: Optional[float]           # si está disponible en la API de mareas

# ============================
# Core
# ============================

def _fetch_tipo_variables(session: Session) -> Dict[str, int]:
    """
    Trae todos los TipoVariableMeteorologica y arma un mapping nombre -> id.
    """
    rows = session.query(TipoVariableMeteorologica).all()
    return {r.nombre.strip(): r.id for r in rows if r and r.nombre}

def _extract_day_key(day_obj: dict) -> date:
    """
    Convierte 'displayDate' del provider Weather en un date (YYYY-MM-DD).
    """
    dd = day_obj.get("displayDate", {})
    return date(dd.get("year"), dd.get("month"), dd.get("day"))

def _try_get_tide_hour_value(hour: dict) -> Optional[float]:
    """
    Intenta obtener altura de marea desde distintos campos posibles del JSON de la API de mareas.
    Ajustá las llaves si tu provider usa otros nombres.
    """
    # Algunos providers exponen 'seaLevel.sg' o 'tideHeight.sg'
    for key in ("seaLevel", "tideHeight"):
        v = hour.get(key, {})
        if isinstance(v, dict):
            x = v.get("sg")
            if x is not None:
                return x
    return None

def _aggregate_by_day(
    forecast_weather_json: dict,
    forecast_marea_json: dict,
) -> Dict[date, WeatherDayAgg]:
    """
    Une la info diario (weather) con los promedios 24h de horario (marea/olas/agua).
    Devuelve un dict {fecha: WeatherDayAgg}
    """
    result: Dict[date, WeatherDayAgg] = {}

    # Indexar horas de marea/olas por fecha UTC (el JSON viene con Z o +00:00)
    hours = forecast_marea_json.get("hours", [])
    horas_por_fecha: Dict[date, List[dict]] = {}
    for hour in hours:
        # Ej: "2025-10-13T14:00:00+00:00" o ...Z
        dt = datetime.fromisoformat(hour["time"].replace("Z", "+00:00"))
        d = dt.date()
        horas_por_fecha.setdefault(d, []).append(hour)

    # Recorrer días del pronóstico meteorológico (Google)
    for day in forecast_weather_json.get("forecastDays", []):
        d = _extract_day_key(day)
        daytime = day.get("daytimeForecast", {}) or {}

        # ---- Google (diario) ----
        wind_speed_val = (
            ((daytime.get("wind", {}) or {}).get("speed", {}) or {}).get("value")
        )
        qpf_quantity_mm = (
            ((daytime.get("precipitation", {}) or {}).get("qpf", {}) or {}).get("quantity")
        )
        t_max = (day.get("maxTemperature", {}) or {}).get("degrees")
        t_min = (day.get("minTemperature", {}) or {}).get("degrees")

        # ---- StormGlass (horario → agregación 24h) ----
        water_temps = []
        wave_heights = []
        wave_periods = []
        tide_heights = []

        for hour in horas_por_fecha.get(d, []):
            wt = (hour.get("waterTemperature", {}) or {}).get("sg")
            wh = (hour.get("waveHeight", {}) or {}).get("sg")
            wp = (hour.get("wavePeriod", {}) or {}).get("sg")
            th = _try_get_tide_hour_value(hour)

            water_temps.append(wt if wt is not None else None)
            wave_heights.append(wh if wh is not None else None)
            wave_periods.append(wp if wp is not None else None)
            tide_heights.append(th if th is not None else None)

        agg = WeatherDayAgg(
            wind_speed_kmh=wind_speed_val,
            precip_qpf_mm=qpf_quantity_mm,
            air_temp_max_c=t_max,
            air_temp_min_c=t_min,
            water_temp_avg_c=safe_mean(water_temps),
            wave_height_avg_m=safe_mean(wave_heights),
            wave_period_avg_s=safe_mean(wave_periods),
            tide_height_avg_m=safe_mean(tide_heights),
        )
        result[d] = agg

    return result

def _upsert_variable(
    session: Session,
    id_tipo_variable: int,
    id_proveedor: int,
    id_spot: int,
    fecha: date,
    valor: Optional[float],
) -> Optional[int]:
    """
    Inserta/actualiza una VariableMeteorologica. Devuelve el id creado/actualizado o None si valor es None.
    - Si 'valor' es None, no inserta nada (política de faltantes = NULL → omitimos fila).
    - Como no hay constraint único a nivel DB, hacemos "upsert" lógico:
      buscamos primera fila por (tipo, proveedor, spot, fecha) y actualizamos; si no existe, creamos.
    """
    if valor is None:
        return None

    existing = session.query(VariableMeteorologica).filter(
        and_(
            VariableMeteorologica.id_tipo_variable == id_tipo_variable,
            VariableMeteorologica.id_proveedor == id_proveedor,
            VariableMeteorologica.id_spot == id_spot,
            VariableMeteorologica.fecha == fecha,
        )
    ).one_or_none()

    valor_str = str(valor)

    if existing:
        existing.valor = valor_str
        session.add(existing)
        session.flush()
        return existing.id
    else:
        obj = VariableMeteorologica(
            id_tipo_variable=id_tipo_variable,
            id_proveedor=id_proveedor,
            id_spot=id_spot,
            fecha=fecha,
            valor=valor_str,
        )
        session.add(obj)
        session.flush()
        return obj.id

def persist_forecast_daily(
    session: Session,
    *,
    spot_id: int,
    proveedor_id: int,
    lat: float,
    lon: float,
    wind_input_units: str = "km/h",   # "km/h" | "m/s" 
) -> Dict[str, int]:
    """
    Orquesta:
      1) Llama APIs
      2) Agrega por día (24h)
      3) Inserta/actualiza filas en variable_meteorologica

    Retorna un resumen con cantidad de filas afectadas por variable.
    """
    # 1) Llamadas a providers
    forecast_weather_json = get_weather_conditions(lat, lon)
    forecast_marea_json = get_marea_conditions(lat, lon)

    # 2) Mapping nombre->id de TipoVariable (según seed)
    tipos = _fetch_tipo_variables(session)

    # Validar que existan los tipos esperados (si falta alguno, simplemente no insertaremos esa variable)
    def tipo_id(nombre: str) -> Optional[int]:
        return tipos.get(nombre)

    # 3) Agregación por día
    por_dia = _aggregate_by_day(forecast_weather_json, forecast_marea_json)

    # 4) Inserts/updates
    counters: Dict[str, int] = {
        NOMBRE_V_VIENTO: 0,
        NOMBRE_O_ALTURA: 0,
        NOMBRE_O_PERIODO: 0,
        NOMBRE_M_MAREA: 0,
        NOMBRE_P_INTENSIDAD: 0,
        NOMBRE_T_AIRE: 0,
        NOMBRE_T_AGUA: 0,
    }

    # Helper conversión viento → nudos (según unidad de entrada)
    def to_knots(v: Optional[float]) -> Optional[float]:
        if v is None:
            return None

        return v

    for d, agg in por_dia.items():
        # Viento - velocidad (nudos)
        v_wind = to_knots(agg.wind_speed_kmh)
        tv_id = tipo_id(NOMBRE_V_VIENTO)
        if tv_id:
            if _upsert_variable(session, tv_id, proveedor_id, spot_id, d, v_wind) is not None:
                counters[NOMBRE_V_VIENTO] += 1

        # Oleaje - altura (m)
        tv_id = tipo_id(NOMBRE_O_ALTURA)
        if tv_id:
            if _upsert_variable(session, tv_id, proveedor_id, spot_id, d, agg.wave_height_avg_m) is not None:
                counters[NOMBRE_O_ALTURA] += 1

        # Oleaje - período (s)
        tv_id = tipo_id(NOMBRE_O_PERIODO)
        if tv_id:
            if _upsert_variable(session, tv_id, proveedor_id, spot_id, d, agg.wave_period_avg_s) is not None:
                counters[NOMBRE_O_PERIODO] += 1

        # Marea - altura (m) (solo si la API trae algo; si no, se omite)
        tv_id = tipo_id(NOMBRE_M_MAREA)
        if tv_id:
            if _upsert_variable(session, tv_id, proveedor_id, spot_id, d, agg.tide_height_avg_m) is not None:
                counters[NOMBRE_M_MAREA] += 1

        # Precipitación - intensidad (mm/h) -> qpf_mm / 24
        tv_id = tipo_id(NOMBRE_P_INTENSIDAD)
        if tv_id:
            precip_intensity = None
            if agg.precip_qpf_mm is not None:
                precip_intensity = agg.precip_qpf_mm / 24.0
            if _upsert_variable(session, tv_id, proveedor_id, spot_id, d, precip_intensity) is not None:
                counters[NOMBRE_P_INTENSIDAD] += 1

        # Temperatura del aire (°C) -> promedio de (min, max) si ambos existen; si no, el que haya
        tv_id = tipo_id(NOMBRE_T_AIRE)
        if tv_id:
            t_air = None
            if agg.air_temp_max_c is not None and agg.air_temp_min_c is not None:
                t_air = (agg.air_temp_max_c + agg.air_temp_min_c) / 2.0
            elif agg.air_temp_max_c is not None:
                t_air = agg.air_temp_max_c
            elif agg.air_temp_min_c is not None:
                t_air = agg.air_temp_min_c
            if _upsert_variable(session, tv_id, proveedor_id, spot_id, d, t_air) is not None:
                counters[NOMBRE_T_AIRE] += 1

        # Temperatura del agua (°C)
        tv_id = tipo_id(NOMBRE_T_AGUA)
        if tv_id:
            if _upsert_variable(session, tv_id, proveedor_id, spot_id, d, agg.water_temp_avg_c) is not None:
                counters[NOMBRE_T_AGUA] += 1

    return counters
