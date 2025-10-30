from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Usuario, Negocio
from datetime import datetime

router = APIRouter(prefix="/business_owner", tags=["Business Owner"])

# ------------------------------------------------------
# Ver perfil del dueño
# ------------------------------------------------------
@router.get("/profile")
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
@router.put("/update_profile")
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
@router.post("/new_business")
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
@router.get("/my_business")
def list_my_business(id_dueno: int, db: Session = Depends(get_db)):
    negocio = db.query(Negocio).filter(Negocio.id_dueno == id_dueno).first()
    return [
        {
            "nombre_fantasia": negocio.nombre_fantasia,
            "rubro": negocio.rubro,
            "sitio_web": negocio.sitio_web,
            "telefono": negocio.telefono,
            "email": negocio.email,
            "direccion": negocio.direccion,
            "horarios": negocio.horarios,
            "descripcion": negocio.descripcion,
            "activo": negocio.activo
        }
    ]

# ------------------------------------------------------
# Actualizar negocio
# ------------------------------------------------------
@router.put("/update_business")
def update_business(
    id_dueno: int,
    nombre_fantasia: str = None,
    rubro: str = None,
    sitio_web: str = None,
    telefono: str = None,
    email: str = None,
    direccion: str = None,
    horarios: str = None,
    descripcion: str = None,
    db: Session = Depends(get_db)
):
    negocio = db.query(Negocio).filter(Negocio.id_dueno == id_dueno).first()
    if not negocio:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")

    if nombre_fantasia:
        negocio.nombre_fantasia = nombre_fantasia
    if rubro:
        negocio.rubro = rubro
    if sitio_web:
        negocio.sitio_web = sitio_web
    if telefono:
        negocio.telefono = telefono
    if email:
        negocio.email = email
    if direccion:
        negocio.direccion = direccion
    if horarios:
        negocio.horarios = horarios
    if descripcion:
        negocio.descripcion = descripcion

    db.commit()
    return {"message": "Negocio actualizado correctamente"}

# ------------------------------------------------------
# Activar negocio
# ------------------------------------------------------
@router.put("/activate_business")
def deactivate_business(id_dueno: int, db: Session = Depends(get_db)):
    negocio = db.query(Negocio).filter(Negocio.id_dueno == id_dueno).first()
    if not negocio:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")

    negocio.activo = True
    db.commit()
    return {"message": "Negocio activado correctamente"}

# ------------------------------------------------------
# Desactivar negocio
# ------------------------------------------------------
@router.put("/desactivate_business")
def deactivate_business(id_dueno: int, db: Session = Depends(get_db)):
    negocio = db.query(Negocio).filter(Negocio.id_dueno == id_dueno).first()
    if not negocio:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")

    negocio.activo = False
    db.commit()
    return {"message": "Negocio desactivado correctamente"}