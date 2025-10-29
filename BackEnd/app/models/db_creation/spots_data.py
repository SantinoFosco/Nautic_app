from app.core.database import SessionLocal
from app.models.models import Spot

# Lista de spots a insertar
spots_data = [
    {"nombre": "Islas del Delta", "tipo": "Isla", "coordenadas": "-58.5085, -34.4455"},
    {"nombre": "San Clemente del Tuyú", "tipo": "Playa", "coordenadas": "-56.7233, -36.3567"},
    {"nombre": "San Bernardo", "tipo": "Playa", "coordenadas": "-56.7, -36.7"},
    {"nombre": "Villa Gesell", "tipo": "Playa", "coordenadas": "-56.9729, -37.2645"},
    {"nombre": "Mar del Plata", "tipo": "Playa", "coordenadas": "-57.5426, -38.0055"},
    {"nombre": "Necochea", "tipo": "Playa", "coordenadas": "-58.739, -38.5545"},
    {"nombre": "Claromecó", "tipo": "Playa", "coordenadas": "-60.0833, -38.8667"},
    {"nombre": "Monte Hermoso", "tipo": "Playa", "coordenadas": "-61.2833, -38.9833"},
]

# Función para generar el código del tipo "SPT0001"
def generar_codigo(prefix, id_num):
    return f"{prefix}{str(id_num).zfill(4)}"

def seed_spots():
    db = SessionLocal()
    try:
        print("🌊 Insertando spots en la base de datos...")

        for i, spot_data in enumerate(spots_data, start=1):
            codigo = generar_codigo("SPT", i)
            nuevo_spot = Spot(
                codigo=codigo,
                nombre=spot_data["nombre"],
                tipo=spot_data["tipo"],
                coordenadas=spot_data["coordenadas"],
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
