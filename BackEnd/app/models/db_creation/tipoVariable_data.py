from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import TipoVariableMeteorologica

DATA = [
    {"id": 1, "codigo": "VAR_UVINDEX", "nombre": "uvIndex", "unidad": "", "tipo": "numerico", "descripcion": "Índice ultravioleta instantáneo (0–11+). Valores >6 requieren protección elevada; crítico para exposición prolongada en agua."},
    {"id": 2, "codigo": "VAR_PCPPROB", "nombre": "precipitation_probability", "unidad": "%", "tipo": "numerico", "descripcion": "Probabilidad de precipitación en la ventana de pronóstico (0–100%)."},
    {"id": 3, "codigo": "VAR_QPFMMH", "nombre": "precipitation_qpfCuantity", "unidad": "mm/h", "tipo": "numerico", "descripcion": "Tasa de precipitación (QPF)."},
    {"id": 4, "codigo": "VAR_WSPD_KMH", "nombre": "wind_speed", "unidad": "km/h", "tipo": "numerico", "descripcion": "Velocidad media del viento a 10 m."},
    {"id": 5, "codigo": "VAR_WGST_KMH", "nombre": "wind_gustValue", "unidad": "km/h", "tipo": "numerico", "descripcion": "Ráfaga máxima."},
    {"id": 6, "codigo": "VAR_CLDCOV", "nombre": "cloudCover", "unidad": "%", "tipo": "numerico", "descripcion": "Cobertura nubosa (0–100%)."},
    {"id": 7, "codigo": "VAR_TMAX_C", "nombre": "maxTemperature", "unidad": "°C", "tipo": "numerico", "descripcion": "Temperatura máxima del aire en el período."},
    {"id": 8, "codigo": "VAR_TMIN_C", "nombre": "minTemperature", "unidad": "°C", "tipo": "numerico", "descripcion": "Temperatura mínima del aire en el período."},
    {"id": 9, "codigo": "VAR_FLTMAX_C", "nombre": "feelsLikeMaxTemperature", "unidad": "°C", "tipo": "numerico", "descripcion": "Temperatura aparente máxima considerando viento/humedad/sol."},
    {"id": 10, "codigo": "VAR_FLTMIN_C", "nombre": "feelsLikeMinTemperature", "unidad": "°C", "tipo": "numerico", "descripcion": "Temperatura aparente mínima."},
    {"id": 11, "codigo": "VAR_WATERT_C", "nombre": "waterTemperature", "unidad": "°C", "tipo": "numerico", "descripcion": "Temperatura del agua."},
    {"id": 12, "codigo": "VAR_WVHGT_M", "nombre": "waveHeight", "unidad": "m", "tipo": "numerico", "descripcion": "Altura significativa del oleaje (Hs)."},
    {"id": 13, "codigo": "VAR_WVPER_S", "nombre": "wavePeriod", "unidad": "s", "tipo": "numerico", "descripcion": "Período pico del oleaje (Tp)."},
]

def seed_tipo_variable_meteorologica(db: Session):
    try:
        print("🌦️ Insertando tipos de variables meteorológicas en la base de datos...")

        for var in DATA:
            existe = db.query(TipoVariableMeteorologica).filter_by(nombre=var["nombre"]).first()
            if not existe:
                nueva_var = TipoVariableMeteorologica(**var)
                db.add(nueva_var)

        db.commit()
        print("✅ Variables meteorológicas insertadas correctamente.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error al insertar variables meteorológicas: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    from app.core.database import engine, Base

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    seed_tipo_variable_meteorologica(db)