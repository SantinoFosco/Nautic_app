# app/models/db_creation/deporteVariable_data.py
# Seed de DeporteVariable

from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Iterable, Dict

from app.models.models import DeporteVariable  # ajusta la ruta según tu proyecto

# -----------------------------
# Datos base (solo cruce deporte x variable)
# id_deporte: 1=Kitesurf, 2=Surf, 3=Kayak
# operador: "between" para interpretar [umbral_min, umbral_max]
# -----------------------------
DATA: Iterable[Dict] = [
    # ===== KITESURF (id_deporte = 1) =====
    {"id_deporte": 1, "nombre_variable": "uvIndex",                     "umbral_min": 0,   "umbral_max": 9,    "peso": 4,  "estado": "activo", "operador": "between"},
    {"id_deporte": 1, "nombre_variable": "precipitation_probability",   "umbral_min": 0,   "umbral_max": 30,   "peso": 6,  "estado": "activo", "operador": "between"},
    {"id_deporte": 1, "nombre_variable": "precipitation_qpfCuantity",   "umbral_min": 0,   "umbral_max": 3,    "peso": 5,  "estado": "activo", "operador": "between"},
    {"id_deporte": 1, "nombre_variable": "wind_speed",                  "umbral_min": 12,  "umbral_max": 25,   "peso": 10, "estado": "activo", "operador": "between"},
    {"id_deporte": 1, "nombre_variable": "wind_directionDegrees",       "umbral_min": 0,   "umbral_max": 360,  "peso": 7,  "estado": "activo", "operador": "between"},
    {"id_deporte": 1, "nombre_variable": "wind_gustValue",              "umbral_min": 0,   "umbral_max": 35,   "peso": 8,  "estado": "activo", "operador": "between"},
    {"id_deporte": 1, "nombre_variable": "cloudCover",                  "umbral_min": 0,   "umbral_max": 80,   "peso": 4,  "estado": "activo", "operador": "between"},
    {"id_deporte": 1, "nombre_variable": "maxTemperature",              "umbral_min": 18,  "umbral_max": 35,   "peso": 5,  "estado": "activo", "operador": "between"},
    {"id_deporte": 1, "nombre_variable": "minTemperature",              "umbral_min": 10,  "umbral_max": 30,   "peso": 5,  "estado": "activo", "operador": "between"},
    {"id_deporte": 1, "nombre_variable": "feelsLikeMaxTemperature",     "umbral_min": 18,  "umbral_max": 38,   "peso": 5,  "estado": "activo", "operador": "between"},
    {"id_deporte": 1, "nombre_variable": "feelsLikeMinTemperature",     "umbral_min": 12,  "umbral_max": 30,   "peso": 5,  "estado": "activo", "operador": "between"},
    {"id_deporte": 1, "nombre_variable": "waterTemperature",            "umbral_min": 15,  "umbral_max": 30,   "peso": 6,  "estado": "activo", "operador": "between"},
    {"id_deporte": 1, "nombre_variable": "waveHeight",                  "umbral_min": 0,   "umbral_max": 2.5,  "peso": 8,  "estado": "activo", "operador": "between"},
    {"id_deporte": 1, "nombre_variable": "wavePeriod",                  "umbral_min": 6,   "umbral_max": 12,   "peso": 7,  "estado": "activo", "operador": "between"},

    # ===== SURF (id_deporte = 2) =====
    {"id_deporte": 2, "nombre_variable": "uvIndex",                     "umbral_min": 0,   "umbral_max": 9,    "peso": 3,  "estado": "activo", "operador": "between"},
    {"id_deporte": 2, "nombre_variable": "precipitation_probability",   "umbral_min": 0,   "umbral_max": 40,   "peso": 6,  "estado": "activo", "operador": "between"},
    {"id_deporte": 2, "nombre_variable": "precipitation_qpfCuantity",   "umbral_min": 0,   "umbral_max": 5,    "peso": 6,  "estado": "activo", "operador": "between"},
    {"id_deporte": 2, "nombre_variable": "wind_speed",                  "umbral_min": 0,   "umbral_max": 10,   "peso": 4,  "estado": "activo", "operador": "between"},
    {"id_deporte": 2, "nombre_variable": "wind_directionDegrees",       "umbral_min": 0,   "umbral_max": 360,  "peso": 7,  "estado": "activo", "operador": "between"},
    {"id_deporte": 2, "nombre_variable": "wind_gustValue",              "umbral_min": 0,   "umbral_max": 20,   "peso": 5,  "estado": "activo", "operador": "between"},
    {"id_deporte": 2, "nombre_variable": "cloudCover",                  "umbral_min": 0,   "umbral_max": 100,  "peso": 2,  "estado": "activo", "operador": "between"},
    {"id_deporte": 2, "nombre_variable": "maxTemperature",              "umbral_min": 16,  "umbral_max": 35,   "peso": 5,  "estado": "activo", "operador": "between"},
    {"id_deporte": 2, "nombre_variable": "minTemperature",              "umbral_min": 10,  "umbral_max": 30,   "peso": 5,  "estado": "activo", "operador": "between"},
    {"id_deporte": 2, "nombre_variable": "feelsLikeMaxTemperature",     "umbral_min": 16,  "umbral_max": 38,   "peso": 5,  "estado": "activo", "operador": "between"},
    {"id_deporte": 2, "nombre_variable": "feelsLikeMinTemperature",     "umbral_min": 10,  "umbral_max": 30,   "peso": 5,  "estado": "activo", "operador": "between"},
    {"id_deporte": 2, "nombre_variable": "waterTemperature",            "umbral_min": 14,  "umbral_max": 28,   "peso": 5,  "estado": "activo", "operador": "between"},
    {"id_deporte": 2, "nombre_variable": "waveHeight",                  "umbral_min": 0.8, "umbral_max": 3.0,  "peso": 9,  "estado": "activo", "operador": "between"},
    {"id_deporte": 2, "nombre_variable": "wavePeriod",                  "umbral_min": 8,   "umbral_max": 16,   "peso": 8,  "estado": "activo", "operador": "between"},

    # ===== KAYAK (id_deporte = 3) =====
    {"id_deporte": 3, "nombre_variable": "uvIndex",                     "umbral_min": 0,   "umbral_max": 9,    "peso": 4,  "estado": "activo", "operador": "between"},
    {"id_deporte": 3, "nombre_variable": "precipitation_probability",   "umbral_min": 0,   "umbral_max": 50,   "peso": 7,  "estado": "activo", "operador": "between"},
    {"id_deporte": 3, "nombre_variable": "precipitation_qpfCuantity",   "umbral_min": 0,   "umbral_max": 4,    "peso": 7,  "estado": "activo", "operador": "between"},
    {"id_deporte": 3, "nombre_variable": "wind_speed",                  "umbral_min": 0,   "umbral_max": 10,   "peso": 5,  "estado": "activo", "operador": "between"},
    {"id_deporte": 3, "nombre_variable": "wind_directionDegrees",       "umbral_min": 0,   "umbral_max": 360,  "peso": 4,  "estado": "activo", "operador": "between"},
    {"id_deporte": 3, "nombre_variable": "wind_gustValue",              "umbral_min": 0,   "umbral_max": 15,   "peso": 6,  "estado": "activo", "operador": "between"},
    {"id_deporte": 3, "nombre_variable": "cloudCover",                  "umbral_min": 0,   "umbral_max": 100,  "peso": 3,  "estado": "activo", "operador": "between"},
    {"id_deporte": 3, "nombre_variable": "maxTemperature",              "umbral_min": 15,  "umbral_max": 35,   "peso": 6,  "estado": "activo", "operador": "between"},
    {"id_deporte": 3, "nombre_variable": "minTemperature",              "umbral_min": 10,  "umbral_max": 30,   "peso": 6,  "estado": "activo", "operador": "between"},
    {"id_deporte": 3, "nombre_variable": "feelsLikeMaxTemperature",     "umbral_min": 15,  "umbral_max": 38,   "peso": 6,  "estado": "activo", "operador": "between"},
    {"id_deporte": 3, "nombre_variable": "feelsLikeMinTemperature",     "umbral_min": 10,  "umbral_max": 30,   "peso": 6,  "estado": "activo", "operador": "between"},
    {"id_deporte": 3, "nombre_variable": "waterTemperature",            "umbral_min": 14,  "umbral_max": 30,   "peso": 6,  "estado": "activo", "operador": "between"},
    {"id_deporte": 3, "nombre_variable": "waveHeight",                  "umbral_min": 0,   "umbral_max": 1.0,  "peso": 3,  "estado": "activo", "operador": "between"},
    {"id_deporte": 3, "nombre_variable": "wavePeriod",                  "umbral_min": 0,   "umbral_max": 8,    "peso": 2,  "estado": "activo", "operador": "between"},
]

# -----------------------------
# Upsert (evita duplicados por PK compuesta)
# -----------------------------
def _upsert_deporte_variable(session: Session, data: Dict) -> DeporteVariable:
    existing = (
        session.query(DeporteVariable)
        .filter(
            and_(
                DeporteVariable.id_deporte == data["id_deporte"],
                DeporteVariable.nombre_variable == data["nombre_variable"],
            )
        )
        .one_or_none()
    )

    if existing is None:
        obj = DeporteVariable(**data)
        session.add(obj)
        return obj

    # actualiza campos
    existing.umbral_min = data.get("umbral_min")
    existing.umbral_max = data.get("umbral_max")
    existing.peso = data.get("peso")
    existing.estado = data.get("estado")
    existing.operador = data.get("operador")
    return existing

# -----------------------------
# Seed
# -----------------------------
def seed_deporte_variable(session: Session) -> None:
    """
    Inserta o actualiza las combinaciones de Deporte + Variable.
    Uso:
        with Session(engine) as s:
            seed_deporte_variable(s)
            s.commit()
    """
    for item in DATA:
        _upsert_deporte_variable(session, item)
