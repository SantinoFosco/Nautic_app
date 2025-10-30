from app.core.database import SessionLocal
from app.models.models import Spot
from decimal import Decimal

# Lista de spots a insertar
spots_data = [
    {"nombre": "Islas del Delta", "tipo": "Isla", "lat": "-34.4455", "lon": "-58.5085"},
    {"nombre": "San Clemente del Tuyú", "tipo": "Playa", "lat": "-36.3567", "lon": "-56.7233"},
    {"nombre": "San Bernardo", "tipo": "Playa", "lat": "-36.7", "lon": "-56.7"},
    {"nombre": "Villa Gesell", "tipo": "Playa", "lat": "-37.2645", "lon": "-56.9729"},
    {"nombre": "Mar del Plata", "tipo": "Playa", "lat": "-38.0055", "lon": "-57.5426"},
    {"nombre": "Necochea", "tipo": "Playa", "lat": "-38.5545", "lon": "-58.739"},
    {"nombre": "Claromecó", "tipo": "Playa", "lat": "-38.8667", "lon": "-60.0833"},
    {"nombre": "Monte Hermoso", "tipo": "Playa", "lat": "-38.9833", "lon": "-61.2833"},
]

def generar_codigo(prefix, id_num):
    return f"{prefix}{str(id_num).zfill(4)}"

def seed_spots():
    db = SessionLocal()
    try:
        print("🌊 Insertando spots en la base de datos...")

        for i, spot_data in enumerate(spots_data, start=1):
            nuevo_spot = Spot(
                codigo=generar_codigo("SPT", i),
                nombre=spot_data["nombre"],
                tipo=spot_data["tipo"],
                lat=Decimal(spot_data["lat"]),
                lon=Decimal(spot_data["lon"]),
                activo=True
            )
            db.add(nuevo_spot)

        db.commit()
        print("✅ Spots insertados correctamente.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error al insertar spots: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_spots()
