# app/models/db_creation/meteorology_data.py
# Seed de TipoVariableMeteorologica (uniforme a sports_data.py)

from sqlalchemy.orm import Session
from typing import Iterable, Dict
import re

from app.models.models import TipoVariableMeteorologica  # ajusta si tu import real difiere

# -----------------------------
# Datos (human readable)
# -----------------------------
TIPOS_METEOROLOGICOS: Iterable[Dict] = [
    {
        "nombre": "VientoVelocidad",
        "unidad": "kmh",
        "tipo": "numerico",
        "descripcion": (
            "Intensidad media del viento a 10 m. Rango útil kitesurf 12–25 kt, ideal 15–20 kt, "
            "laminar y estable. Pesos (1–10): Kitesurf=10 | Surf=4 | Kayak=5."
        ),
    },
    {
        "nombre": "OleajeAltura",
        "unidad": "m",
        "tipo": "numerico",
        "descripcion": (
            "Altura significativa de ola (Hs). Clave para surf; en kitesurf de olas define tamaño del lip y paredes. "
            "Pesos (1–10): Kitesurf=8 | Surf=9 | Kayak=3."
        ),
    },
    {
        "nombre": "OleajePeríodo",
        "unidad": "s",
        "tipo": "numerico",
        "descripcion": (
            "Período pico (Tp). Períodos >10 s suelen dar olas más ordenadas y potentes. "
            "Pesos (1–10): Kitesurf=7 | Surf=8 | Kayak=2."
        ),
    },
    {
        "nombre": "MareaAltura",
        "unidad": "m",
        "tipo": "numerico",
        "descripcion": (
            "Nivel de marea respecto del cero local. Afecta dónde rompe y el largo útil de la ola/playa. "
            "Pesos (1–10): Kitesurf=6 | Surf=7 | Kayak=5."
        ),
    },
    {
        "nombre": "PrecipitacionIntensidad",
        "unidad": "mm/h",
        "tipo": "numerico",
        "descripcion": (
            "Tasa de precipitación. Lluvia leve suele ser practicable; tormenta fuerte/eléctrica es criterio de cancelación. "
            "Pesos (1–10): Kitesurf=5 | Surf=6 | Kayak=7."
        ),
    },
    {
        "nombre": "TemperaturaAire",
        "unidad": "°C",
        "tipo": "numerico",
        "descripcion": (
            "Condiciona equipamiento (neoprene, guantes, botines) y riesgos de hipotermia/estrés térmico. "
            "Pesos (1–10): Kitesurf=5 | Surf=5 | Kayak=6."
        ),
    },
    {
        "nombre": "TemperaturaAgua",
        "unidad": "°C",
        "tipo": "numerico",
        "descripcion": (
            "Confort térmico y duración segura de la sesión. Relevante para exposición prolongada. "
            "Pesos (1–10): Kitesurf=5 | Surf=5 | Kayak=6."
        ),
    },
]

# -----------------------------
# Helpers
# -----------------------------

_STOPWORDS = {"de", "del", "la", "el", "los", "las", "y", "a", "en", "por", "para", "-", "–"}

def _slug_iniciales(nombre: str) -> str:
    """
    Genera iniciales significativas del nombre.
    Ej.: 'Viento - velocidad' -> 'VV'; 'Temperatura del agua' -> 'TDA'
    """
    # Normaliza separadores y quita tildes simples para robustez visual (opcional).
    tokens = re.split(r"[^\wáéíóúüñÁÉÍÓÚÜÑ]+", nombre.lower())
    tokens = [t for t in tokens if t and t not in _STOPWORDS]
    iniciales = "".join(t[0].upper() for t in tokens)
    return iniciales or "GEN"

def _gen_codigo(nombre: str) -> str:
    return f"VAR_{_slug_iniciales(nombre)}"

def _upsert_tipo_variable(session: Session, data: Dict) -> TipoVariableMeteorologica:
    """
    Evita duplicados por 'nombre' (unique). Si existe, actualiza unidad/tipo/descripcion/codigo.
    """
    nombre = data["nombre"].strip()
    obj = session.query(TipoVariableMeteorologica).filter_by(nombre=nombre).one_or_none()
    codigo = _gen_codigo(nombre)

    if obj is None:
        obj = TipoVariableMeteorologica(
            nombre=nombre,
            unidad=data.get("unidad"),
            tipo=data.get("tipo"),
            descripcion=data.get("descripcion"),
            codigo=codigo,  # generado automáticamente
        )
        session.add(obj)
    else:
        # Sin duplicar: actualizar campos si cambiaron (mantiene human readable)
        obj.unidad = data.get("unidad")
        obj.tipo = data.get("tipo")
        obj.descripcion = data.get("descripcion")
        obj.codigo = codigo

    return obj

# -----------------------------
# Entry point (similar a sports_data.py)
# -----------------------------

def seed_tipo_variable_meteorologica(session: Session) -> None:
    """
    Inserta/actualiza las variables meteorológicas base.
    Uso:
        with Session(engine) as s:
            seed_tipo_variable_meteorologica(s)
            s.commit()
    """
    for item in TIPOS_METEOROLOGICOS:
        _upsert_tipo_variable(session, item)
