# app/models/db_creation/deporteVariable_data.py
# Seed de DeporteVariable (uniforme al formato de meteorology_data.py)

from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Iterable, Dict

from app.models.models import DeporteVariable  # ruta real según tu estructura

# -----------------------------
# Datos base
# -----------------------------
DATA: Iterable[Dict] = [
    # ===== KITESURF (id_deporte = 1) =====
    {"id_deporte": "SPR0001", "nombre_variable": "VientoVelocidad",       "umbral_min": 12,  "umbral_max": 25,  "peso": 10, "estado": "activo", "operador": None},
    {"id_deporte": "SPR0001", "nombre_variable": "OleajeAltura",          "umbral_min": 0, "umbral_max": 2.5, "peso": 8,  "estado": "activo", "operador": None},
    {"id_deporte": "SPR0001", "nombre_variable": "OleajePeríodo",         "umbral_min": 6,   "umbral_max": 12,  "peso": 1,  "estado": "activo", "operador": None},
    {"id_deporte": "SPR0001", "nombre_variable": "MareaAltura",           "umbral_min": -0.5,"umbral_max": 1.5, "peso": 6,  "estado": "activo", "operador": None},
    {"id_deporte": "SPR0001", "nombre_variable": "PrecipitaciónIntensidad","umbral_min": 0,  "umbral_max": 3,   "peso": 5,  "estado": "activo", "operador": None},
    {"id_deporte": "SPR0001", "nombre_variable": "TemperaturaAire",     "umbral_min": 15,  "umbral_max": 35,  "peso": 5,  "estado": "activo", "operador": None},
    {"id_deporte": "SPR0001", "nombre_variable": "TemperaturaAgua",     "umbral_min": 15,  "umbral_max": 30,  "peso": 5,  "estado": "activo", "operador": None},

    # ===== SURF (id_deporte = 2) =====
    {"id_deporte": "SPR0002", "nombre_variable": "VientoVelocidad",       "umbral_min": 0,   "umbral_max": 10,  "peso": 4,  "estado": "activo", "operador": None},
    {"id_deporte": "SPR0002", "nombre_variable": "OleajeAltura",          "umbral_min": 0.8, "umbral_max": 3.0, "peso": 9,  "estado": "activo", "operador": None},
    {"id_deporte": "SPR0002", "nombre_variable": "OleajePeríodo",         "umbral_min": 8,   "umbral_max": 16,  "peso": 1,  "estado": "activo", "operador": None},
    {"id_deporte": "SPR0002", "nombre_variable": "MareaAltura",           "umbral_min": -0.3,"umbral_max": 1.5, "peso": 7,  "estado": "activo", "operador": None},
    {"id_deporte": "SPR0002", "nombre_variable": "PrecipitaciónIntensidad","umbral_min": 0,  "umbral_max": 5,   "peso": 6,  "estado": "activo", "operador": None},
    {"id_deporte": "SPR0002", "nombre_variable": "TemperaturaAire",     "umbral_min": 10,  "umbral_max": 32,  "peso": 5,  "estado": "activo", "operador": None},
    {"id_deporte": "SPR0002", "nombre_variable": "TemperaturaAgua",     "umbral_min": 14,  "umbral_max": 28,  "peso": 5,  "estado": "activo", "operador": None},

    # ===== KAYAK (id_deporte = 3) =====
    {"id_deporte": "SPR0003", "nombre_variable": "VientoVelocidad",       "umbral_min": 0,   "umbral_max": 10,  "peso": 5,  "estado": "activo", "operador": None},
    {"id_deporte": "SPR0003", "nombre_variable": "OleajeAltura",          "umbral_min": 0,   "umbral_max": 1.0, "peso": 3,  "estado": "activo", "operador": None},
    {"id_deporte": "SPR0003", "nombre_variable": "OleajePeríodo",         "umbral_min": 0,   "umbral_max": 8,   "peso": 1,  "estado": "activo", "operador": None},
    {"id_deporte": "SPR0003", "nombre_variable": "MareaAltura",           "umbral_min": -0.5,"umbral_max": 1.5, "peso": 5,  "estado": "activo", "operador": None},
    {"id_deporte": "SPR0003", "nombre_variable": "PrecipitaciónIntensidad","umbral_min": 0,  "umbral_max": 4,   "peso": 7,  "estado": "activo", "operador": None},
    {"id_deporte": "SPR0003", "nombre_variable": "TemperaturaAire",     "umbral_min": 12,  "umbral_max": 35,  "peso": 6,  "estado": "activo", "operador": None},
    {"id_deporte": "SPR0003", "nombre_variable": "TemperaturaAgua",     "umbral_min": 14,  "umbral_max": 30,  "peso": 6,  "estado": "activo", "operador": None},
]

# -----------------------------
# Helper: upsert (sin duplicados)
# -----------------------------
def _upsert_deporte_variable(session: Session, data: Dict) -> DeporteVariable:
    """
    Evita duplicados (por id_deporte + nombre_variable).
    Si existe, actualiza los campos; si no, inserta.
    """
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
    else:
        existing.umbral_min = data.get("umbral_min")
        existing.umbral_max = data.get("umbral_max")
        existing.peso = data.get("peso")
        existing.estado = data.get("estado")
        existing.operador = data.get("operador")
        # fecha_creacion se mantiene

    return existing or obj

# -----------------------------
# Entry point (seed)
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
