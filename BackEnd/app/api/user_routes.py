from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Usuario, Negocio
from datetime import datetime

router = APIRouter(prefix="/user", tags=["User"])

# ------------------------------------------------------
# Registrar dueño (sin passlib)
# ------------------------------------------------------
@router.post("/register")
def register_owner(
    nombre: str,
    apellido: str,
    email: str,
    telefono: str,
    password: str,
    db: Session = Depends(get_db)
):
    existing_user = db.query(Usuario).filter(Usuario.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado.")

    # 🔹 Guardamos la contraseña en texto plano (solo para desarrollo)
    nuevo_dueno = Usuario(
        nombre=nombre,
        apellido=apellido,
        telefono=telefono,
        email=email,
        hashed_password=password,
        fecha_creacion=datetime.utcnow()
    )
    db.add(nuevo_dueno)
    db.commit()
    db.refresh(nuevo_dueno)

    return {"message": "Dueño registrado correctamente", "id_dueno": nuevo_dueno}


# ------------------------------------------------------
# Iniciar sesión
# ------------------------------------------------------
@router.post("/login")
def login_owner(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == email).first()

    if not user or user.hashed_password != password:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    # Verificar si el usuario tiene un negocio asociado
    have_business = (
        db.query(Negocio)
        .filter(Negocio.id_dueno == user.id)
        .first()
        is not None
    )

    return {
        "message": "Inicio de sesión exitoso",
        "id_dueno": user.id,
        "email": user.email,
        "tipo_usuario": user.tipo_usuario,
        "haveBusiness": have_business,
    }