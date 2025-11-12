from decimal import Decimal

from app.core.database import SessionLocal
from app.models.models import Negocio, Usuario, EstadoNegocio

businesses_data = [
    {
        "email_dueno": "laura@example.com",
        "nombre_fantasia": "South Beach Surf School",
        "rubro": "Escuela",
        "lat": Decimal("25.764479209778173"),
        "lon": Decimal("-80.13054403645144"),
        "telefono": "1155550001",
        "email": "contacto@southsurf.com",
        "direccion": "South Beach, Miami, FL",
        "sitio_web": "https://www.southbeachsurfclub.com",
        "horarios": "Mar-Dom 09:00-19:00",
        "descripcion": "Clases de surf en South Beach, Miami.",
        "estado": EstadoNegocio.activo,
    },
    {
        "email_dueno": "carlos@example.com",
        "nombre_fantasia": "Nahuel Huapi Kayak",
        "rubro": "Alquiler",
        "lat": Decimal("-41.0472885583598"),
        "lon": Decimal("-71.47176790749023"),
        "telefono": "1155550002",
        "email": "hola@kayakers.com",
        "direccion": "Lago Nahuel Huapi, Argentina",
        "horarios": "Mar-Dom 08:00-20:00",
        "descripcion": "Veni a kayakear en el lago Nahuel Huapi, Argentina.",
        "estado": EstadoNegocio.activo,
    },
    {
        "email_dueno": "marina@example.com",
        "nombre_fantasia": "Wind & Kite Club",
        "rubro": "Tienda",
        "lat": Decimal("-28.859068133827407"),
        "lon": Decimal("-13.875517853544011"),
        "telefono": "1155550003",
        "email": "info@windkiteclub.com",
        "direccion": "Montaña Roja, Las Palmas, España",
        "horarios": "Mie-Dom 10:00-18:00",
        "descripcion": "Tienda de velas y equipo de kitesurf.",
        "estado": EstadoNegocio.pendiente,
    },
]

def seed_businesses():
    db = SessionLocal()
    try:
        print("🏪 Insertando negocios en la base de datos...")

        for negocio_data in businesses_data:
            dueno = db.query(Usuario).filter(Usuario.email == negocio_data["email_dueno"]).first()
            if not dueno:
                print(f"⚠️  No se encontró usuario con email {negocio_data['email_dueno']}, se omite negocio.")
                continue

            existing = (
                db.query(Negocio)
                .filter(
                    Negocio.id_dueno == dueno.id,
                    Negocio.nombre_fantasia == negocio_data["nombre_fantasia"],
                )
                .first()
            )
            if existing:
                print(
                    f"ℹ️  El negocio '{negocio_data['nombre_fantasia']}' ya existe para {negocio_data['email_dueno']}, se omite."
                )
                continue

            nuevo_negocio = Negocio(
                id_dueno=dueno.id,
                nombre_fantasia=negocio_data["nombre_fantasia"],
                rubro=negocio_data["rubro"],
                lat=negocio_data["lat"],
                lon=negocio_data["lon"],
                telefono=negocio_data["telefono"],
                email=negocio_data["email"],
                direccion=negocio_data["direccion"],
                horarios=negocio_data["horarios"],
                descripcion=negocio_data["descripcion"],
                estado=negocio_data["estado"],
            )
            db.add(nuevo_negocio)

        db.commit()

        print("✅ Negocios insertados correctamente.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error al insertar negocios: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_businesses()

