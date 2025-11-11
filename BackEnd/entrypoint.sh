#!/usr/bin/env sh
set -e

echo "[ENTRYPOINT] Esperando base de datos..."
python - <<'PY'
import time
from sqlalchemy import text
from app.core.database import engine
while True:
    try:
        with engine.connect() as c:
            c.execute(text("SELECT 1"))
        break
    except Exception:
        time.sleep(1)
PY

echo "[ENTRYPOINT] Creando tablas y cargando taxonomias base (scripts db_creation/*)"
# Usa tus scripts existentes, en el mismo orden del .bat
python - <<'PY'
import importlib
from app.core.database import Base, engine, SessionLocal
from app.models import models  # aseguro modelos importados para create_all

Base.metadata.create_all(bind=engine)

# === Orden histórico del .bat (no invento nombres) ===
sequence = [
    ("app.models.db_creation.create_db",              None),  # al importar ya hace create_all y loguea
    ("app.models.db_creation.provider_data",          "seed_providers"),
    ("app.models.db_creation.sports_data",            "seed_sports"),
    ("app.models.db_creation.tipoVariable_data",      "seed_tipo_variable_meteorologica"),
    ("app.models.db_creation.spots_data",             "seed_spots"),
    ("app.models.db_creation.users_data",             "seed_users"),
    ("app.models.db_creation.deporteVariable_data",   "seed_deporte_variable"),
]

for mod_name, func in sequence:
    m = importlib.import_module(mod_name)
    if func:
        fn = getattr(m, func, None)
        if not callable(fn):
            raise RuntimeError(f"{mod_name}.{func} no encontrado")
        # algunas funciones esperan Session, otras no: respetamos tu firma
        if fn.__code__.co_argcount == 0:
            fn()
        else:
            from app.core.database import SessionLocal
            db = SessionLocal()
            try:
                fn(db)
                db.commit()
            finally:
                db.close()
PY

echo "[ENTRYPOINT] Ingestion meteorologica desde APIs (WeatherLogic)..."
# Ejecuta TU servicio tal cual, como modulo
python -m app.services.WeatherLogic

echo "[ENTRYPOINT] Calculo/pesos por deporte (SportsWeighting)..."
python -m app.services.SportsWeighting

echo "[ENTRYPOINT] Iniciando backend..."
PORT="${BACKEND_PORT:-8000}"
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --reload --reload-dir /app/app --proxy-headers --forwarded-allow-ips '*'