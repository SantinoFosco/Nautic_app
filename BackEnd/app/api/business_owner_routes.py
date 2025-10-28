from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Usuario, Negocio
from datetime import datetime

router = APIRouter(prefix="/business_owner", tags=["Business Owner"])


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

    return {"message": "Dueño registrado correctamente", "id_dueno": nuevo_dueno.id_dueno}


# ------------------------------------------------------
# Iniciar sesión
# ------------------------------------------------------
@router.post("/login")
def login_owner(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == email).first()

    if not user or user.hashed_password != password:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    return {"message": "Inicio de sesión exitoso", "id_dueno": user.id_dueno, "email": user.email}


# ------------------------------------------------------
# Ver perfil del dueño
# ------------------------------------------------------
@router.get("/me")
def get_my_profile(id_dueno: int, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.id_dueno == id_dueno).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {
        "id_dueno": user.id_dueno,
        "nombre": user.nombre,
        "apellido": user.apellido,
        "telefono": user.telefono,
        "email": user.email,
        "fecha_creacion": user.fecha_creacion
    }


# ------------------------------------------------------
# Actualizar perfil del dueño
# ------------------------------------------------------
@router.put("/me")
def update_my_profile(
    id_dueno: int,
    nombre: str = None,
    apellido: str = None,
    telefono: str = None,
    db: Session = Depends(get_db)
):
    user = db.query(Usuario).filter(Usuario.id_dueno == id_dueno).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if nombre:
        user.nombre = nombre
    if apellido:
        user.apellido = apellido
    if telefono:
        user.telefono = telefono

    db.commit()
    return {"message": "Perfil actualizado correctamente"}


# ------------------------------------------------------
# Crear negocio
# ------------------------------------------------------
@router.post("/business")
def create_business(
    id_dueno: int,
    nombre_fantasia: str,
    rubro: str = None,
    sitio_web: str = None,
    telefono: str = None,
    email: str = None,
    direccion: str = None,
    coordenadas: str = None,
    horarios: str = None,
    descripcion: str = None,
    db: Session = Depends(get_db)
):
    dueno = db.query(Usuario).filter(Usuario.id_dueno == id_dueno).first()
    if not dueno:
        raise HTTPException(status_code=404, detail="Dueño no encontrado")

    nuevo_negocio = Negocio(
        id_dueno=id_dueno,
        nombre_fantasia=nombre_fantasia,
        rubro=rubro,
        sitio_web=sitio_web,
        telefono=telefono,
        email=email,
        direccion=direccion,
        coordenadas=coordenadas,
        horarios=horarios,
        descripcion=descripcion,
        activo=True,
        fecha_creacion=datetime.utcnow()
    )

    db.add(nuevo_negocio)
    db.commit()
    db.refresh(nuevo_negocio)
    return {"message": "Negocio creado correctamente", "id_negocio": nuevo_negocio.id_negocio}


# ------------------------------------------------------
# Listar negocios del dueño
# ------------------------------------------------------
@router.get("/businesses")
def list_my_businesses(id_dueno: int, db: Session = Depends(get_db)):
    negocios = db.query(Negocio).filter(Negocio.id_dueno == id_dueno).all()
    return [
        {
            "id_negocio": n.id_negocio,
            "nombre_fantasia": n.nombre_fantasia,
            "rubro": n.rubro,
            "activo": n.activo
        }
        for n in negocios
    ]


# ------------------------------------------------------
# Actualizar negocio
# ------------------------------------------------------
@router.put("/business/{id_negocio}")
def update_business(
    id_negocio: int,
    nombre_fantasia: str = None,
    telefono: str = None,
    horarios: str = None,
    descripcion: str = None,
    db: Session = Depends(get_db)
):
    negocio = db.query(Negocio).filter(Negocio.id_negocio == id_negocio).first()
    if not negocio:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")

    if nombre_fantasia:
        negocio.nombre_fantasia = nombre_fantasia
    if telefono:
        negocio.telefono = telefono
    if horarios:
        negocio.horarios = horarios
    if descripcion:
        negocio.descripcion = descripcion

    db.commit()
    return {"message": "Negocio actualizado correctamente"}


# ------------------------------------------------------
# Desactivar negocio
# ------------------------------------------------------
@router.delete("/business/{id_negocio}")
def deactivate_business(id_negocio: int, db: Session = Depends(get_db)):
    negocio = db.query(Negocio).filter(Negocio.id_negocio == id_negocio).first()
    if not negocio:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")

    negocio.activo = False
    db.commit()
    return {"message": "Negocio desactivado correctamente"}