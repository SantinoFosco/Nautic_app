from app.core.database import SessionLocal
from app.models.models import Spot
from decimal import Decimal

# Lista de spots a insertar
spots_data = [
    {"nombre": "Islas del Delta", "tipo": "Isla", "lat": "-34.4455", "lon": "-58.5085"},
    {"nombre": "Mar del Plata", "tipo": "Playa", "lat": "-38.0055", "lon": "-57.5426"},
    {"nombre": "Pipeline", "tipo": "Playa", "lat": "21.6643", "lon": "-158.0530"},  # Hawái, surf
    {"nombre": "Chamonix", "tipo": "Montaña", "lat": "45.9237", "lon": "6.8694"},  # Francia, ski y alpinismo
    {"nombre": "Bondi Beach", "tipo": "Playa", "lat": "-33.8908", "lon": "151.2743"},  # Australia, surf
    {"nombre": "Whistler", "tipo": "Montaña", "lat": "50.1163", "lon": "-122.9574"},  # Canadá, ski y mountain bike
    {"nombre": "Lake Placid", "tipo": "Lago", "lat": "44.2795", "lon": "-73.9799"},  # EE. UU., deportes de invierno y kayak
    {"nombre": "Queenstown", "tipo": "Montaña", "lat": "-45.0312", "lon": "168.6626"},  # Nueva Zelanda, deportes extremos
    {"nombre": "Teahupo'o", "tipo": "Playa", "lat": "-17.8333", "lon": "-149.2667"},  # Tahití, surf
    {"nombre": "Interlaken", "tipo": "Montaña", "lat": "46.6863", "lon": "7.8632"},  # Suiza, parapente y senderismo
    {"nombre": "Tarifa", "tipo": "Playa", "lat": "36.0139", "lon": "-5.6060"},  # España, kitesurf y windsurf
    {"nombre": "Maui North Shore", "tipo": "Playa", "lat": "20.9084", "lon": "-156.4204"},  # Hawái, surf y windsurf
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
