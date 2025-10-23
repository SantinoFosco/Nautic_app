# app/services/WeatherLogic.py
# ----------------------------------------------------------
# Inserta pronóstico diario en variable_meteorologica
# - Google Weather (diario): uvIndex, precip, viento, nubes, T
# - StormGlass (horario → promedios diarios): waterTemperature, waveHeight, wavePeriod
# ----------------------------------------------------------

import json
from dataclasses import dataclass
from datetime import datetime
from statistics import mean
from typing import Dict, List, Tuple

from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from app.core.database import SessionLocal
from app.models.models import (
    Spot,
    ProveedorDatos,
    TipoVariableMeteorologica,
    VariableMeteorologica,
)

from app.services.WeatherAPI import get_weather_conditions
from app.services.MareaAPI import get_marea_conditions


# --------------------------
# Config
# --------------------------
PROVIDER_BY_VAR = {
    "uvIndex": "GOOGLE",
    "precipitation_probability": "GOOGLE",
    "precipitation_qpfCuantity": "GOOGLE",
    "wind_speed": "GOOGLE",
    "wind_gustValue": "GOOGLE",
    "cloudCover": "GOOGLE",
    "maxTemperature": "GOOGLE",
    "minTemperature": "GOOGLE",
    "feelsLikeMaxTemperature": "GOOGLE",
    "feelsLikeMinTemperature": "GOOGLE",
    "waterTemperature": "STORMGLASS",
    "waveHeight": "STORMGLASS",
    "wavePeriod": "STORMGLASS",
}
VAR_NAMES = list(PROVIDER_BY_VAR.keys())


# --------------------------
# Helpers
# --------------------------
def _safe_get(dct, *keys, default=None):
    cur = dct or {}
    for k in keys:
        if not isinstance(cur, dict) or k not in cur:
            return default
        cur = cur[k]
    return cur

def _avg(values):
    vals = [v for v in values if v is not None]
    return mean(vals) if vals else 0

def _parse_coords(coord_text: str) -> Tuple[float, float]:
    data = json.loads(coord_text) if coord_text else {}
    return float(data.get("lat")), float(data.get("lon"))

def _get_or_create_proveedor(session: Session, nombre: str) -> int:
    row = session.query(ProveedorDatos).filter(ProveedorDatos.nombre == nombre).one_or_none()
    if row:
        return row.id
    codigo = f"PRV_{nombre.upper()[:10]}"
    row = ProveedorDatos(codigo=codigo, nombre=nombre)
    session.add(row)
    session.flush()
    return row.id

def _tipo_variable_map(session: Session) -> Dict[str, int]:
    rows = session.query(TipoVariableMeteorologica).all()
    return {r.nombre: r.id for r in rows}

def _upsert_variable(
    session: Session,
    id_tipo_variable: int,
    id_proveedor: int,
    id_spot: int,
    fecha,
    valor_text: str,
) -> VariableMeteorologica:
    existing = (
        session.query(VariableMeteorologica)
        .filter(
            and_(
                VariableMeteorologica.id_tipo_variable == id_tipo_variable,
                VariableMeteorologica.id_proveedor == id_proveedor,
                VariableMeteorologica.id_spot == id_spot,
                VariableMeteorologica.fecha == fecha,
            )
        )
        .one_or_none()
    )
    if existing:
        existing.valor = valor_text
        existing.ultima_actualizacion = func.now()
        return existing

    row = VariableMeteorologica(
        id_tipo_variable=id_tipo_variable,
        id_proveedor=id_proveedor,
        id_spot=id_spot,
        fecha=fecha,
        valor=valor_text,
    )
    session.add(row)
    return row


# --------------------------
# Core (inserta en BD)
# --------------------------
def insert_forecast_for_spot(session: Session, spot: Spot) -> int:
    """
    Obtiene el forecast del spot y lo inserta en variable_meteorologica.
    Retorna cantidad de registros insertados/actualizados.
    """
    # 1) Resolver lat/lon
    lat, lon = _parse_coords(spot.coordenadas)

    # 2) Cargar mapas de tipos y proveedores
    tipo_map = _tipo_variable_map(session)                     # {nombre_variable -> id_tipo}
    proveedor_ids = {p: _get_or_create_proveedor(session, p) for p in set(PROVIDER_BY_VAR.values())}

    # 3) Consultar APIs
    forecast_weather_json = get_weather_conditions(lat, lon)   # Google (diario)
    forecast_marea_json = get_marea_conditions(lat, lon)       # StormGlass (horario)

    # 4) Indexar horas StormGlass por fecha YYYY-MM-DD
    horas_por_fecha: Dict[str, List[dict]] = {}
    for hour in forecast_marea_json.get("hours", []):
        iso = hour.get("time", "")
        if not iso:
            continue
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        key = str(dt.date())
        horas_por_fecha.setdefault(key, []).append(hour)

    # 5) Recorrer días de Google y persistir variables
    count = 0
    for day in forecast_weather_json.get("forecastDays", []):
        disp = day.get("displayDate", {})
        try:
            date_str = f"{disp['year']}-{disp['month']:02d}-{disp['day']:02d}"
        except Exception:
            continue
        fecha = datetime.strptime(date_str, "%Y-%m-%d").date()

        daytime = day.get("daytimeForecast", {}) or {}

        # Promedios StormGlass para esa fecha
        sg_hours = horas_por_fecha.get(date_str, [])
        avg_water_temp = _avg([_safe_get(h, "waterTemperature", "sg") for h in sg_hours])
        avg_wave_height = _avg([_safe_get(h, "waveHeight", "sg") for h in sg_hours])
        avg_wave_period = _avg([_safe_get(h, "wavePeriod", "sg") for h in sg_hours])

        # Construir valores por variable (solo las definidas)
        values = {
            "uvIndex": _safe_get(daytime, "uvIndex", default=0),
            "precipitation_probability": _safe_get(daytime, "precipitation", "probability", "percent", default=0),
            "precipitation_qpfCuantity": _safe_get(daytime, "precipitation", "qpf", "quantity", default=0),
            "wind_speed": _safe_get(daytime, "wind", "speed", "value", default=0),
            "wind_gustValue": _safe_get(daytime, "wind", "gust", "value", default=0),
            "cloudCover": _safe_get(daytime, "cloudCover", default=0),
            "maxTemperature": _safe_get(day, "maxTemperature", "degrees", default=0),
            "minTemperature": _safe_get(day, "minTemperature", "degrees", default=0),
            "feelsLikeMaxTemperature": _safe_get(day, "feelsLikeMaxTemperature", "degrees", default=0),
            "feelsLikeMinTemperature": _safe_get(day, "feelsLikeMinTemperature", "degrees", default=0),
            "waterTemperature": avg_water_temp,
            "waveHeight": avg_wave_height,
            "wavePeriod": avg_wave_period,
        }

        # Persistir cada variable
        for var_name, val in values.items():
            if var_name not in tipo_map:
                # Si el tipo no existe, lo saltamos (o podría crearse on-the-fly)
                continue
            id_tipo = tipo_map[var_name]
            id_prov = proveedor_ids[PROVIDER_BY_VAR[var_name]]
            valor_text = "" if val is None else f"{val}"

            _upsert_variable(
                session=session,
                id_tipo_variable=id_tipo,
                id_proveedor=id_prov,
                id_spot=spot.id,
                fecha=fecha,
                valor_text=valor_text,
            )
            count += 1

    return count


def insert_forecast_for_all_spots() -> None:
    """
    Itera todos los spots y los inserta en variable_meteorologica.
    """
    db = SessionLocal()
    try:
        print("⛅ Iniciando ingesta meteorológica para todos los spots...")
        spots = db.query(Spot).all()
        for sp in spots:
            try:
                inserted = insert_forecast_for_spot(db, sp)
                db.commit()
                print(f"✅ Spot {sp.id} ('{sp.nombre}') → {inserted} upserts.")
            except Exception as e:
                db.rollback()
                print(f"❌ Error en spot {sp.id} ('{sp.nombre}'): {e}")
        print("🏁 Ingesta completada.")
    finally:
        db.close()


# Si querés ejecutar directo este módulo:
if __name__ == "__main__":
    insert_forecast_for_all_spots()
