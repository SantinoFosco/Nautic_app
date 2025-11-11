from decimal import Decimal
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Usuario, Negocio, EstadoNegocio, Deporte, NegocioDeporte
from datetime import datetime

router = APIRouter(prefix="/business_owner", tags=["Business Owner"])

# ------------------------------------------------------
# Ver perfil del dueño
# ------------------------------------------------------
@router.get("/profile")
def get_my_profile(id_dueno: int, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.id == id_dueno).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {
        "id_dueno": user.id,
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
    user = db.query(Usuario).filter(Usuario.id == id_dueno).first()
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
# Crear negocio (con hasta 3 deportes)
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
    horarios: str = None,
    descripcion: str = None,
    deportes: list[str] = None,
    db: Session = Depends(get_db)
):
    dueno = db.query(Usuario).filter(Usuario.id == id_dueno).first()
    if not dueno:
        raise HTTPException(status_code=404, detail="Dueño no encontrado")

    have_business = db.query(Negocio).filter(Negocio.id_dueno == id_dueno).first()
    if have_business:
        raise HTTPException(status_code=400, detail="Ya tienes un negocio")
    
    ultimo_negocio = db.query(Negocio).order_by(Negocio.id_negocio.desc()).first()
    siguiente_num = 1 if not ultimo_negocio else (ultimo_negocio.id_negocio + 1)

    nuevo_negocio = Negocio(
        id_negocio=siguiente_num,
        id_dueno=dueno.id,
        nombre_fantasia=nombre_fantasia,
        rubro=rubro,
        sitio_web=sitio_web,
        telefono=telefono,
        email=email,
        direccion=direccion,
        lat=Decimal("0.0"),
        lon=Decimal("0.0"),
        horarios=horarios,
        descripcion=descripcion,
        estado=EstadoNegocio.pendiente,
        fecha_creacion=datetime.utcnow()
    )

    db.add(nuevo_negocio)
    db.commit()
    db.refresh(nuevo_negocio)

    if deportes:
        for nombre_deporte in deportes:
            deporte = db.query(Deporte).filter(Deporte.nombre == nombre_deporte).first()
            if not deporte:
                continue
            nuevo_negocio_deporte = NegocioDeporte(
                id_negocio=nuevo_negocio.id_negocio,
                id_deporte=deporte.id
            )
            db.add(nuevo_negocio_deporte)
        db.commit()

    return "Negocio creado correctamente"

# ------------------------------------------------------
# Listar negocios del dueño
# ------------------------------------------------------
@router.get("/my_business")
def list_my_business(id_dueno: int, db: Session = Depends(get_db)):
    negocio = db.query(Negocio).filter(Negocio.id_dueno == id_dueno).first()
    if not negocio:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")

    if negocio.estado == EstadoNegocio.pendiente:
        raise HTTPException(status_code=403, detail="Negocio pendiente de aprobación")

    deportes = []
    for rel in negocio.deportes_rel or []:
        deportes.append(
            {
                "id_deporte": rel.id_deporte,
                "nombre": rel.deporte.nombre if rel.deporte else None,
            }
        )

    return {
        "nombre_fantasia": negocio.nombre_fantasia,
        "rubro": negocio.rubro,
        "sitio_web": negocio.sitio_web,
        "telefono": negocio.telefono,
        "email": negocio.email,
        "sitio_web": negocio.sitio_web,
        "direccion": negocio.direccion,
        "lat": float(negocio.lat) if negocio.lat else None,
        "lon": float(negocio.lon) if negocio.lon else None,
        "horarios": negocio.horarios,
        "descripcion": negocio.descripcion,
        "deportes": deportes,
    }

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
    horarios: str = None,
    descripcion: str = None,
    id_deporte1: int = None,
    id_deporte2: int = None,
    id_deporte3: int = None,
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
    if horarios:
        negocio.horarios = horarios
    if descripcion:
        negocio.descripcion = descripcion

    # ✅ Actualizar deportes si se pasan
    if id_deporte1:
        negocio.id_deporte1 = id_deporte1
    if id_deporte2 is not None:
        negocio.id_deporte2 = id_deporte2
    if id_deporte3 is not None:
        negocio.id_deporte3 = id_deporte3

    db.commit()
    return {"message": "Negocio actualizado correctamente"}

# ------------------------------------------------------
# Activar negocio
# ------------------------------------------------------
@router.put("/activate_business")
def activate_business(id_dueno: int, db: Session = Depends(get_db)):
    negocio = db.query(Negocio).filter(Negocio.id_dueno == id_dueno).first()
    if not negocio:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")

    negocio.estado = EstadoNegocio.activo
    db.commit()
    return {"message": "Negocio activado correctamente"}

# ------------------------------------------------------
# Desactivar negocio
# ------------------------------------------------------
@router.put("/deactivate_business")
def deactivate_business(id_dueno: int, db: Session = Depends(get_db)):
    negocio = db.query(Negocio).filter(Negocio.id_dueno == id_dueno).first()
    if not negocio:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")

    negocio.estado = EstadoNegocio.inactivo
    db.commit()
    return {"message": "Negocio desactivado correctamente"}
