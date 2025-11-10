# app/api/test_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.core.dependencies import get_db
from app.core.database import Base
from app.models.models import (
    Spot,
    Deporte,
    DeporteVariable,
    VariableMeteorologica,
    TipoVariableMeteorologica,
    DeporteSpot,
    ProveedorDatos,
    Negocio,
)

router = APIRouter(
    prefix="/test",
    tags=["Test - Visualización de datos"]
)

# ----------------------------
# SPOTS
# ----------------------------
@router.get("/spots")
def get_all_spots(db: Session = Depends(get_db)):
    """Devuelve todos los spots con sus datos"""
    spots = db.query(Spot).all()
    return [
        {
            "id": s.id,
            "codigo": s.codigo,
            "nombre": s.nombre,
            "tipo": s.tipo,
            "coordenadas": s.coordenadas,
            "activo": s.activo,
        }
        for s in spots
    ]


# ----------------------------
# DEPORTES
# ----------------------------
@router.get("/deportes")
def get_all_deportes(db: Session = Depends(get_db)):
    """Devuelve todos los deportes"""
    deportes = db.query(Deporte).all()
    return [
        {
            "id": d.id,
            "codigo": d.codigo,
            "nombre": d.nombre,
            "descripcion": d.descripcion,
        }
        for d in deportes
    ]


# ----------------------------
# DEPORTE - VARIABLE
# ----------------------------
@router.get("/deporte_variable")
def get_all_deporte_variable(db: Session = Depends(get_db)):
    """Devuelve las reglas de variables por deporte"""
    reglas = db.query(DeporteVariable).all()
    return [
        {
            "id_deporte": r.id_deporte,
            "nombre_variable": r.nombre_variable,
            "umbral_min": r.umbral_min,
            "umbral_max": r.umbral_max,
            "peso": r.peso,
            "operador": r.operador,
            "estado": r.estado,
        }
        for r in reglas
    ]


# ----------------------------
# VARIABLES METEOROLÓGICAS
# ----------------------------
@router.get("/variables_meteorologicas")
def get_all_variables_meteorologicas(db: Session = Depends(get_db)):
    """Devuelve todos los registros meteorológicos"""
    variables = db.query(VariableMeteorologica).order_by(VariableMeteorologica.fecha.desc()).all()  # limit por performance
    return [
        {
            "id": v.id,
            "id_spot": v.id_spot,
            "id_tipo_variable": v.id_tipo_variable,
            "fecha": v.fecha,
            "valor": v.valor,
        }
        for v in variables
    ]


# ----------------------------
# TIPO VARIABLE METEOROLÓGICA
# ----------------------------
@router.get("/tipo_variable")
def get_all_tipo_variable(db: Session = Depends(get_db)):
    """Devuelve los tipos de variables meteorológicas"""
    tipos = db.query(TipoVariableMeteorologica).all()
    return [
        {
            "id": t.id,
            "codigo": t.codigo,
            "nombre": t.nombre,
            "unidad": t.unidad,
            "tipo": t.tipo,
            "descripcion": t.descripcion,
        }
        for t in tipos
    ]


# ----------------------------
# PONDERACIONES DE DEPORTES POR SPOT
# ----------------------------
@router.get("/deporte_spot")
def get_all_deporte_spot(db: Session = Depends(get_db)):
    """Devuelve las ponderaciones de cada deporte por spot"""
    ponderaciones = db.query(DeporteSpot).order_by(DeporteSpot.fecha.desc()).all()
    return [
        {
            "id_spot": p.id_spot,
            "id_deporte": p.id_deporte,
            "ponderacion": p.ponderacion,
            "fecha": p.fecha,
            "ultima_actualizacion": p.ultima_actualizacion,
        }
        for p in ponderaciones
    ]


# ----------------------------
# PROVEEDORES DE DATOS
# ----------------------------
@router.get("/proveedores")
def get_all_proveedores(db: Session = Depends(get_db)):
    """Devuelve todos los proveedores de datos"""
    proveedores = db.query(ProveedorDatos).all()
    return [
        {
            "id": p.id,
            "codigo": p.codigo,
            "nombre": p.nombre,
            "url_base": p.url_base,
        }
        for p in proveedores
    ]


# ------------------------------------------------------------
# 🔹 Eliminar Spot por ID
# ------------------------------------------------------------
@router.delete("/spots/{spot_id}")
def eliminar_spot(spot_id: int, db: Session = Depends(get_db)):
    spot = db.query(Spot).filter(Spot.id == spot_id).first()
    if not spot:
        raise HTTPException(status_code=404, detail="Spot no encontrado")

    # Eliminar variables meteorológicas asociadas al spot
    db.query(VariableMeteorologica).filter(
        VariableMeteorologica.id_spot == spot_id
    ).delete(synchronize_session=False)

    # Eliminar asociaciones de deportes con el spot
    db.query(DeporteSpot).filter(
        DeporteSpot.id_spot == spot_id
    ).delete(synchronize_session=False)

    db.delete(spot)
    db.commit()
    return {"mensaje": f"Spot con ID {spot_id} eliminado correctamente"}


# ------------------------------------------------------------
# 🔹 Eliminar Negocio por ID
# ------------------------------------------------------------
@router.delete("/negocios/{negocio_id}")
def eliminar_negocio(negocio_id: int, db: Session = Depends(get_db)):
    negocio = db.query(Negocio).filter(Negocio.id_negocio == negocio_id).first()
    if not negocio:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")
    
    db.delete(negocio)
    db.commit()
    return {"mensaje": f"Negocio con ID {negocio_id} eliminado correctamente"}


# ------------------------------------------------------------
# 🔹 Vaciar tabla VariableMeteorologica
# ------------------------------------------------------------
@router.delete("/variables_meteorologicas")
def eliminar_todas_variables_meteorologicas(db: Session = Depends(get_db)):
    eliminadas = db.query(VariableMeteorologica).delete(synchronize_session=False)
    db.commit()
    return {
        "mensaje": "Registros de 'variable_meteorologica' eliminados correctamente",
        "cantidad": eliminadas,
    }


# ------------------------------------------------------------
# 🔹 Vaciar tabla Spot
# ------------------------------------------------------------
@router.delete("/spots")
def eliminar_todos_los_spots(db: Session = Depends(get_db)):
    db.query(VariableMeteorologica).delete(synchronize_session=False)
    db.query(DeporteSpot).delete(synchronize_session=False)
    eliminados = db.query(Spot).delete(synchronize_session=False)
    db.commit()
    return {
        "mensaje": "Registros de 'spot' eliminados correctamente",
        "cantidad": eliminados,
    }


# ------------------------------------------------------------
# 🔹 Eliminar todas las tablas de la base de datos
# ------------------------------------------------------------
@router.delete("/database/drop_all")
def drop_all_tables(db: Session = Depends(get_db)):
    try:
        Base.metadata.drop_all(bind=db.get_bind())
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar todas las tablas: {exc}",
        )

    return {"mensaje": "Todas las tablas se eliminaron correctamente"}
