# app/models/db_creation/meteorology_data.py
# Seed de TipoVariableMeteorologica (uniforme a sports_data.py)

from sqlalchemy.orm import Session
from typing import Iterable, Dict
import re

from app.models.models import TipoVariableMeteorologica  # ajusta si tu import real difiere

# -----------------------------
# Datos (human readable)
# -----------------------------
DATA = [
    {
        "id": 1,
        "codigo": "VAR_UVINDEX",
        "nombre": "uvIndex",
        "unidad": "",
        "tipo": "numerico",
        "descripcion": "Índice ultravioleta instantáneo (0–11+). Valores >6 requieren protección elevada; crítico para exposición prolongada en agua.",
    },
    {
        "id": 2,
        "codigo": "VAR_PCPPROB",
        "nombre": "precipitation_probability",
        "unidad": "%",
        "tipo": "numerico",
        "descripcion": "Probabilidad de precipitación en la ventana de pronóstico (0–100%). Útil para planeamiento y gestión de riesgo meteorológico.",
    },
    {
        "id": 3,
        "codigo": "VAR_QPFMMH",
        "nombre": "precipitation_qpfCuantity",
        "unidad": "mm/h",
        "tipo": "numerico",
        "descripcion": "Tasa de precipitación (QPF). Lluvia intensa >4–5 mm/h suele degradar visibilidad y seguridad; tormentas eléctricas: cancelar.",
    },
    {
        "id": 4,
        "codigo": "VAR_WSPD_KMH",
        "nombre": "wind_speed",
        "unidad": "km/h",
        "tipo": "numerico",
        "descripcion": "Velocidad media del viento a 10 m. Kitesurf operativo típico 20–45 km/h; kayak prefiere <20 km/h; surf ideal con offshore leve.",
    },
    {
        "id": 5,
        "codigo": "VAR_WGST_KMH",
        "nombre": "wind_gustValue",
        "unidad": "km/h",
        "tipo": "numerico",
        "descripcion": "Ráfaga máxima. Diferenciales ráfaga–media altos indican viento arrachado y mayor riesgo operativo (especialmente en kitesurf).",
    },
    {
        "id": 6,
        "codigo": "VAR_CLDCOV",
        "nombre": "cloudCover",
        "unidad": "%",
        "tipo": "numerico",
        "descripcion": "Cobertura nubosa (0–100%). Afecta térmicos, lectura del viento, radiación y visibilidad para navegación costera.",
    },
    {
        "id": 7,
        "codigo": "VAR_TMAX_C",
        "nombre": "maxTemperature",
        "unidad": "°C",
        "tipo": "numerico",
        "descripcion": "Temperatura máxima del aire en el período. Impacta confort, hidratación y elección de equipamiento (neoprene vs. lycra).",
    },
    {
        "id": 8,
        "codigo": "VAR_TMIN_C",
        "nombre": "minTemperature",
        "unidad": "°C",
        "tipo": "numerico",
        "descripcion": "Temperatura mínima del aire en el período. Clave para madrugadas/noches y cálculo de riesgo de hipotermia al salir del agua.",
    },
    {
        "id": 9,
        "codigo": "VAR_FLTMAX_C",
        "nombre": "feelsLikeMaxTemperature",
        "unidad": "°C",
        "tipo": "numerico",
        "descripcion": "Temperatura aparente máxima considerando viento/humedad/sol. Mejora la estimación de confort térmico real en superficie.",
    },
    {
        "id": 10,
        "codigo": "VAR_FLTMIN_C",
        "nombre": "feelsLikeMinTemperature",
        "unidad": "°C",
        "tipo": "numerico",
        "descripcion": "Temperatura aparente mínima. Útil para definir protección térmica (guantes/botines/capucha) en sesiones largas.",
    },
    {
        "id": 11,
        "codigo": "VAR_WATERT_C",
        "nombre": "waterTemperature",
        "unidad": "°C",
        "tipo": "numerico",
        "descripcion": "Temperatura del agua. Determina grosor de neoprene, riesgo de hipotermia y duración segura de la sesión.",
    },
    {
        "id": 12,
        "codigo": "VAR_WVHGT_M",
        "nombre": "waveHeight",
        "unidad": "m",
        "tipo": "numerico",
        "descripcion": "Altura significativa del oleaje (Hs). Métrica base para calidad de surf y condiciones de mar para navegación ligera.",
    },
    {
        "id": 13,
        "codigo": "VAR_WVPER_S",
        "nombre": "wavePeriod",
        "unidad": "s",
        "tipo": "numerico",
        "descripcion": "Período pico del oleaje (Tp). Períodos largos indican mayor energía y olas más ordenadas; crítico en evaluación de spots.",
    },
]


# -----------------------------
# Entry point (similar a sports_data.py)
# -----------------------------

def seed_tipo_variable_meteorologica(db: Session):
    try:
        print("🌦️ Insertando variables meteorológicas en la base de datos...")

        for var in DATA:
            existe = db.query(TipoVariableMeteorologica).filter_by(nombre=var["nombre"]).first()
            if not existe:
                nueva_var = TipoVariableMeteorologica(
                    id=var["id"],
                    codigo=var["codigo"],
                    nombre=var["nombre"],
                    unidad=var["unidad"],
                    tipo=var["tipo"],
                    descripcion=var["descripcion"],
                )
                db.add(nueva_var)

        db.commit()
        print("✅ Variables meteorológicas insertadas correctamente.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error al insertar variables meteorológicas: {e}")
    finally:
        db.close()
