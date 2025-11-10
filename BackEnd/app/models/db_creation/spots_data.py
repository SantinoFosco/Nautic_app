from app.core.database import SessionLocal
from app.models.models import Spot
from decimal import Decimal

# Lista de spots a insertar
spots_data = [
    {"nombre": "Mar del Plata", "tipo": "Playa", "lat": "-38.0055", "lon": "-57.5426"},
    {"nombre": "Anse Source d'Argent", "tipo": "Playa", "lat": "-4.371675504663671", "lon": "55.827215038447946"},
    {"nombre": "Bondi Beach", "tipo": "Playa", "lat": "-33.89151910396984", "lon": "151.27730217855867"},
    {"nombre": "Playa Blanca", "tipo": "Playa", "lat": "28.85559870495888", "lon": "-13.839609538166144"},
    {"nombre": "Paralia Navagio", "tipo": "Playa", "lat": "37.85968238319725", "lon": "20.624881060787857"},
    {"nombre": "South Beach", "tipo": "Playa", "lat": "25.774548115347358", "lon": "-80.1298678456566"},
    {"nombre": "Lago Nahuel Huapi", "tipo": "Lago", "lat": "-41.03004929637477", "lon": "-71.49125114645692"},
    {"nombre": "Pragser Wildsee", "tipo": "Lago", "lat": "46.69701612661271", "lon": "12.084074523933168"},
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
