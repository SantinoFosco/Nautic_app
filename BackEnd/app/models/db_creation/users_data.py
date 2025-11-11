from app.core.database import SessionLocal
from app.models.models import Usuario

# Lista de deportes a insertar
users_data = [
    {"nombre": "User", "apellido": "user", "telefono": "1234567890", "email": "user@user.com", "hashed_password": "user", "tipo_usuario": "owner"},
    {"nombre": "Admin", "apellido": "admin", "telefono": "0123456789", "email": "admin@admin.com", "hashed_password": "admin", "tipo_usuario": "admin"},
    {"nombre": "Laura", "apellido": "Lagos", "telefono": "1111111111", "email": "laura@example.com", "hashed_password": "laura123", "tipo_usuario": "owner"},
    {"nombre": "Carlos", "apellido": "Cano", "telefono": "2222222222", "email": "carlos@example.com", "hashed_password": "carlos123", "tipo_usuario": "owner"},
    {"nombre": "Marina", "apellido": "Mar", "telefono": "3333333333", "email": "marina@example.com", "hashed_password": "marina123", "tipo_usuario": "owner"},
    {"nombre": "Diego", "apellido": "Delta", "telefono": "4444444444", "email": "diego@example.com", "hashed_password": "diego123", "tipo_usuario": "owner"},
]


def seed_users():
    db = SessionLocal()
    try:
        print("👤 Insertando usuarios en la base de datos...")

        for user_data in users_data:
            existing = db.query(Usuario).filter(Usuario.email == user_data["email"]).first()
            if existing:
                print(f"ℹ️  Usuario {user_data['email']} ya existe, se omite.")
                continue

            nuevo_usuario = Usuario(
                nombre=user_data["nombre"],
                apellido=user_data["apellido"],
                telefono=user_data["telefono"],
                email=user_data["email"],
                hashed_password=user_data["hashed_password"],
                tipo_usuario=user_data["tipo_usuario"]
            )
            db.add(nuevo_usuario)

        db.commit()
        print("✅ Usuarios insertados correctamente.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error al insertar usuarios: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_users()