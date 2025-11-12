from app.core.database import SessionLocal
from app.models.models import NegocioDeporte

negocio_deportes = [
    {"id_negocio": 1, "id_deporte": 2},
    {"id_negocio": 2, "id_deporte": 3},
    {"id_negocio": 3, "id_deporte": 1},
]

def seed_negocio_deportes():
    db = SessionLocal()
    try:
        print("🏪 Insertando relaciones de negocio y deporte")

        for negocio_deporte in negocio_deportes:
            nuevo_negocio_deporte = NegocioDeporte(
                id_negocio=negocio_deporte["id_negocio"],
                id_deporte=negocio_deporte["id_deporte"],
            )
            db.add(nuevo_negocio_deporte)

        db.commit()
        print("✅ Relaciones insertadas correctamente.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error al insertar relaciones: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_negocio_deportes()

