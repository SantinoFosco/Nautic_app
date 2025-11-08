from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func
from app.core.database import get_db
from app.models.models import (
    Spot, 
    Deporte, 
    DeporteVariable, 
    Negocio, 
    Usuario
)
import random

router = APIRouter(prefix="/admin", tags=["Admin"])

# ------------------------------------------------------------
# 🔹 Alta y baja de Spots
# ------------------------------------------------------------
@router.post("/spots")
def crear_spot(nombre: str, tipo: str, lat: float, lon: float, db: Session = Depends(get_db)):
    codigo = f"SPOT-{random.randint(1000,9999)}"
    nuevo_spot = Spot(codigo=codigo, nombre=nombre, tipo=tipo, lat=lat, lon=lon, activo=True)
    db.add(nuevo_spot)
    db.commit()
    db.refresh(nuevo_spot)
    return {"mensaje": "Spot creado con éxito", "spot": nuevo_spot}

@router.get("/spots")
def listar_spots(db: Session = Depends(get_db)):
    spots = db.query(Spot).all()
    return [(spot.codigo, spot.nombre, spot.tipo, spot.lat, spot.lon, spot.activo) for spot in spots]

@router.put("/spots/{spot_id}/toggle")
def cambiar_estado_spot(spot_id: int, db: Session = Depends(get_db)):
    spot = db.query(Spot).filter(Spot.id == spot_id).first()
    if not spot:
        raise HTTPException(status_code=404, detail="Spot no encontrado")
    spot.activo = not spot.activo
    db.commit()
    return {"mensaje": f"Spot {'activado' if spot.activo else 'desactivado'} correctamente"}

# ------------------------------------------------------------
# 🔹 Alta y baja de Deportes
# ------------------------------------------------------------
def generar_codigo(prefix, id_num):
    return f"{prefix}{str(id_num).zfill(4)}"

@router.post("/deportes")
def crear_deporte(
    nombre: str,
    descripcion: str = None,
    variables: list[dict] = None,
    db: Session = Depends(get_db)
):
    # Buscar el último código existente (prefijo DPT)
    ultimo_deporte = db.query(Deporte).order_by(Deporte.id.desc()).first()
    siguiente_num = 1 if not ultimo_deporte else (ultimo_deporte.id + 1)
    codigo = generar_codigo("SPT", siguiente_num)

    nuevo_deporte = Deporte(codigo=codigo, nombre=nombre, descripcion=descripcion, activo=True)
    db.add(nuevo_deporte)
    db.commit()
    db.refresh(nuevo_deporte)

    # Variables (umbral, peso, operador, etc.)
    if variables:
        for v in variables:
            if(v.get("nombre_variable") is "wind_speed" and v.get("operador") is "min" or v.get("operador") is "max" or v.get("operador") is "between"):
                nueva_var = DeporteVariable(
                    id_deporte=nuevo_deporte.id,
                    nombre_variable="wind_speed",
                    umbral_min=v.get("umbral_min"),
                    umbral_max=v.get("umbral_max"),
                    peso=v.get("peso"),
                    operador=v.get("operador"),
                    estado="activo"
                )
            if(v.get("nombre_variable") is "wind_gustValue" and v.get("operador") is "min" or v.get("operador") is "max" or v.get("operador") is "between"):
                nueva_var = DeporteVariable(
                    id_deporte=nuevo_deporte.id,
                    nombre_variable="wind_gustValue",
                    umbral_min=v.get("umbral_min"),
                    umbral_max=v.get("umbral_max"),
                    peso=v.get("peso"),
                    operador=v.get("operador"),
                    estado="activo"
                )
            if(v.get("nombre_variable") is "waveHeight" and v.get("operador") is "min" or v.get("operador") is "max" or v.get("operador") is "between"):
                nueva_var = DeporteVariable(
                    id_deporte=nuevo_deporte.id,
                    nombre_variable="waveHeight",
                    umbral_min=v.get("umbral_min"),
                    umbral_max=v.get("umbral_max"),
                    peso=v.get("peso"),
                    operador=v.get("operador"),
                    estado="activo"
                )
            db.add(nueva_var)
        db.commit()

    return {"mensaje": "Deporte creado correctamente", "deporte": nuevo_deporte}

@router.get("/deportes")
def listar_deportes(db: Session = Depends(get_db)):
    deportes = db.query(Deporte).all()
    return [(deporte.id, deporte.nombre, deporte.activo) for deporte in deportes]

@router.put("/deportes/{deporte_id}/toggle")
def cambiar_estado_deporte(deporte_id: int, db: Session = Depends(get_db)):
    deporte = db.query(Deporte).filter(Deporte.id == deporte_id).first()
    if not deporte:
        raise HTTPException(status_code=404, detail="Deporte no encontrado")
    deporte.activo = not deporte.activo
    db.commit()
    return {"mensaje": f"Deporte {'activado' if deporte.activo else 'desactivado'} correctamente"}

# ------------------------------------------------------------
# 🔹 Negocios pendientes / aprobación
# ------------------------------------------------------------
@router.get("/negocios/pendientes")
def negocios_pendientes(db: Session = Depends(get_db)):
    pendientes = db.query(Negocio).filter(Negocio.activo == None).all()
    return pendientes

@router.put("/negocios/{negocio_id}/estado")
def aprobar_negocio(negocio_id: int, estado: bool, db: Session = Depends(get_db)):
    negocio = db.query(Negocio).filter(Negocio.id_negocio == negocio_id).first()
    if not negocio:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")
    negocio.activo = estado
    db.commit()
    return {"mensaje": f"Negocio {'aprobado y activado' if estado else 'rechazado o inactivo'} correctamente"}

# ------------------------------------------------------------
# 🔹 Métricas generales
# ------------------------------------------------------------
@router.get("/estadisticas")
def estadisticas(db: Session = Depends(get_db)):
    total_negocios = db.query(func.count(Negocio.id_negocio)).scalar()
    pendientes = db.query(Negocio).filter(Negocio.activo == None).count()
    activos = db.query(Negocio).filter(Negocio.activo == True).count()
    usuarios = db.query(func.count(Usuario.id)).scalar()

    return {
        "negocios_totales": total_negocios,
        "negocios_pendientes": pendientes,
        "negocios_activos": activos,
        "usuarios_registrados": usuarios
    }

# ------------------------------------------------------------
# 🔹 3 Spots aleatorios activos
# ------------------------------------------------------------
@router.get("/spots/aleatorios")
def spots_aleatorios(db: Session = Depends(get_db)):
    spots_activos = db.query(Spot).filter(Spot.activo == True).all()
    seleccion = random.sample(spots_activos, min(3, len(spots_activos)))
    return seleccion

# ------------------------------------------------------------
# 🔹 Información de todos los negocios
# ------------------------------------------------------------
@router.get("/negocios/info")
def info_negocios(db: Session = Depends(get_db)):
    negocios = db.query(
        Negocio.id_negocio,
        Negocio.nombre_fantasia,
        Negocio.activo,
        Negocio.direccion,
        Negocio.telefono,
        Negocio.email
    ).all()
    return [{"id": n.id_negocio, "nombre": n.nombre_fantasia, "activo": n.activo, "direccion": n.direccion, "telefono": n.telefono, "email": n.email} for n in negocios]
