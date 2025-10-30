from app.core.database import SessionLocal
from app.models.models import Deporte

# Lista de deportes a insertar
sports_data = [
    {"nombre": "Kitesurf", "descripcion": "Deporte acuático que utiliza una cometa para propulsarse sobre el agua."},
    {"nombre": "Surf", "descripcion": "Deporte acuático que consiste en deslizarse sobre las olas con una tabla."},
    {"nombre": "Kayak", "descripcion": "Deporte acuático que utiliza una pequeña embarcación llamada kayak para navegar."},
]

def generar_codigo(prefix, id_num):
    return f"{prefix}{str(id_num).zfill(4)}"

def seed_sports():
    db = SessionLocal()
    try:
        print("🏄‍♂️ Insertando deportes en la base de datos...")

        for i, sport_data in enumerate(sports_data, start=1):
            nuevo_deporte = Deporte(
                codigo = generar_codigo("SPT", i),
                nombre=sport_data["nombre"],
                descripcion=sport_data["descripcion"],
                activo=True
            )
            db.add(nuevo_deporte)

        db.commit()
        print("✅ Deportes insertados correctamente.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error al insertar deportes: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_sports()