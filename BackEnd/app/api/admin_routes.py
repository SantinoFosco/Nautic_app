from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func
from app.core.database import get_db
from app.models.models import (
    Spot, 
    Deporte, 
    DeporteVariable, 
    Negocio,
    EstadoNegocio, 
    Usuario,
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

    pesos_default = {
        "wind_speed": 10,
        "wind_gustValue": 8,
        "waveHeight": 10,
    }

    # Variables principales con pesos automáticos
    if variables:
        for v in variables:
            nombre_variable = v.get("nombre_variable")
            operador = v.get("operador")
            if nombre_variable in pesos_default and operador in {"min", "max", "between"}:
                nueva_var = DeporteVariable(
                    id_deporte=nuevo_deporte.id,
                    nombre_variable=nombre_variable,
                    umbral_min=v.get("umbral_min"),
                    umbral_max=v.get("umbral_max"),
                    peso=pesos_default[nombre_variable],
                    operador=operador,
                    estado="activo"
                )
                db.add(nueva_var)

    variables_secundarias = [
        {"nombre_variable": "uvIndex",                     "umbral_min": 0,   "umbral_max": 9,    "peso": 4,  "operador": "between"},
        {"nombre_variable": "precipitation_probability",   "umbral_min": 0,   "umbral_max": 30,   "peso": 6,  "operador": "min"},
        {"nombre_variable": "precipitation_qpfCuantity",   "umbral_min": 0,   "umbral_max": 3,    "peso": 6,  "operador": "min"},
        {"nombre_variable": "cloudCover",                  "umbral_min": 0,   "umbral_max": 80,   "peso": 4,  "operador": "min"},
        {"nombre_variable": "maxTemperature",              "umbral_min": 18,  "umbral_max": 35,   "peso": 5,  "operador": "between"},
        {"nombre_variable": "minTemperature",              "umbral_min": 10,  "umbral_max": 30,   "peso": 5,  "operador": "between"},
        {"nombre_variable": "feelsLikeMaxTemperature",     "umbral_min": 18,  "umbral_max": 38,   "peso": 5,  "operador": "between"},
        {"nombre_variable": "feelsLikeMinTemperature",     "umbral_min": 12,  "umbral_max": 30,   "peso": 5,  "operador": "between"},
        {"nombre_variable": "waterTemperature",            "umbral_min": 15,  "umbral_max": 30,   "peso": 6,  "operador": "between"},
        {"nombre_variable": "wavePeriod",                  "umbral_min": 0,   "umbral_max": 8,    "peso": 2,  "operador": "between"}
    ]

    for v in variables_secundarias:
        nueva_var = DeporteVariable(
            id_deporte=nuevo_deporte.id,
            nombre_variable=v["nombre_variable"],
            umbral_min=v["umbral_min"],
            umbral_max=v["umbral_max"],
            peso=v["peso"],
            operador=v["operador"],
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
    pendientes = db.query(Negocio).filter(Negocio.estado == EstadoNegocio.pendiente).all()
    return pendientes

@router.put("/negocios/{negocio_id}")
def aprobar_negocio(negocio_id: int, aprobado: bool = Query(...), lat: float = Query(...), lon: float = Query(...), db: Session = Depends(get_db)):
    negocio = db.query(Negocio).filter(Negocio.id_negocio == negocio_id).first()
    if not negocio:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")
    if(aprobado == True):
        negocio.estado = EstadoNegocio.activo
        negocio.lat = Decimal(str(lat))
        negocio.lon = Decimal(str(lon))
    else:
        db.delete(negocio)
    db.commit()
    return {"mensaje": f"Negocio {'aprobado y activado' if aprobado else 'rechazado y eliminado'} correctamente"}


@router.put("/negocios/{negocio_id}/toggle_status")
def toggle_business_status(negocio_id: int, db: Session = Depends(get_db)):
    negocio = db.query(Negocio).filter(Negocio.id_negocio == negocio_id).first()
    
    if not negocio:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")

    # Solo permitimos cambiar entre activo e inactivo
    if negocio.estado == EstadoNegocio.activo:
        negocio.estado = EstadoNegocio.inactivo
        new_status = "inactivo"
    elif negocio.estado == EstadoNegocio.inactivo:
        negocio.estado = EstadoNegocio.activo
        new_status = "activo"
    else:
        # No se puede activar/desactivar un negocio pendiente desde aqui
        raise HTTPException(status_code=400, detail=f"No se puede cambiar el estado de un negocio {negocio.estado.value}")

    db.commit()
    db.refresh(negocio)
    return {"mensaje": f"Negocio {negocio.nombre_fantasia} ahora está {new_status}", "nuevo_estado": new_status}


@router.delete("/negocios/{negocio_id}")
def eliminar_negocio(negocio_id: int, db: Session = Depends(get_db)):
    negocio = db.query(Negocio).filter(Negocio.id_negocio == negocio_id).first()
    if not negocio:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")
    
    db.delete(negocio)
    db.commit()
    return {"mensaje": f"Negocio con ID {negocio_id} eliminado correctamente"}

# ------------------------------------------------------------
# 🔹 Métricas generales
# ------------------------------------------------------------
@router.get("/estadisticas")
def estadisticas(db: Session = Depends(get_db)):
    total_negocios = db.query(func.count(Negocio.id_negocio)).scalar()
    pendientes = db.query(Negocio).filter(Negocio.estado == EstadoNegocio.pendiente).count()
    activos = db.query(Negocio).filter(Negocio.estado == EstadoNegocio.activo).count()
    usuarios = db.query(func.count(Usuario.id)).filter(Usuario.tipo_usuario == "owner").scalar()

    return {
        "negocios_totales": total_negocios,
        "negocios_pendientes": pendientes,
        "negocios_activos": activos,
        "usuarios_registrados": usuarios
    }

# ------------------------------------------------------------
# 🔹 Spots activos (lista completa)
# ------------------------------------------------------------
@router.get("/spots/activos")
def spots_activos(db: Session = Depends(get_db)):
    spots_activos = db.query(Spot).filter(Spot.activo == True).all()

    return [
        {
            "id": s.id,
            "nombre": s.nombre,
            "tipo": s.tipo,
            "lat": float(s.lat),
            "lon": float(s.lon),
        }
        for s in spots_activos
    ]

# ------------------------------------------------------------
# 🔹 Información de todos los negocios
# ------------------------------------------------------------
@router.get("/negocios/info")
def info_negocios(db: Session = Depends(get_db)):
    business_db = db.query(Negocio).all()

    business_list = []

    for b in business_db:
        business_list.append({
            "id": b.id_negocio,
            "name": b.nombre_fantasia,
            "estado": b.estado,
            "direccion": b.direccion,
            "telefono": b.telefono,
            "email": b.email,
        })

    return business_list
