from fastapi import APIRouter, Query
from random import choice, randint
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from datetime import datetime, timedelta
from app.models.models import VariableMeteorologica, TipoVariableMeteorologica, Spot, Deporte, DeporteSpot, Negocio, NegocioDeporte
from sqlalchemy import and_

# Creamos el router específico para este grupo de endpoints
router = APIRouter(prefix="/spot", tags=["Spots"])

@router.get("/list")
async def get_spots(day: int = Query(...), db: Session = Depends(get_db)):
    """Devuelve todos los spots disponibles desde la base de datos"""
    spots_db = db.query(Spot).filter(Spot.activo == True).all()
    target_date = (datetime.utcnow() + timedelta(days=day)).date()  # corregido

    spots = []
    for spot in spots_db:
        rows = (
            db.query(Deporte.nombre, DeporteSpot.ponderacion)
            .join(Deporte, Deporte.id == DeporteSpot.id_deporte)
            .filter(
                and_(
                    DeporteSpot.id_spot == spot.id,
                    DeporteSpot.fecha == target_date,
                )
            )
            .order_by(Deporte.nombre.asc())
            .all()
        )

        scores = [{"sport": n, "score": float(p or 0)} for (n, p) in rows]
        best = None
        if scores:
            best_item = max(scores, key=lambda x: x["score"])
            best = best_item["sport"]

        spots.append({
            "name": spot.nombre,
            "lat": float(spot.lat),
            "lon": float(spot.lon),
            "type": spot.tipo,
            "best_sport": best
        })

    return spots

@router.get("/business_list")
async def get_business_spots(db: Session = Depends(get_db)):
    """Devuelve todos los negocios activos con sus coordenadas y deportes asociados"""
    business_db = db.query(Negocio).filter(Negocio.activo == True).all()

    business_list = []

    for b in business_db:
        # Convertir coordenadas (lat, lon) desde Numeric a float
        lat = float(b.lat) if b.lat is not None else None
        lon = float(b.lon) if b.lon is not None else None

        # Obtener nombres de deportes asociados al negocio
        deportes = (
            db.query(Deporte.nombre)
            .join(NegocioDeporte, Deporte.id == NegocioDeporte.id_deporte)
            .filter(NegocioDeporte.id_negocio == b.id_negocio)
            .all()
        )

        deportes_nombres = [d[0] for d in deportes]  # convertir a lista simple

        business_list.append({
            "name": b.nombre_fantasia,
            "lat": lat,
            "lon": lon,
            "type": "business",
            "sports": deportes_nombres
        })

    return business_list

@router.get("/weather_average")
async def get_weather_average(
    lat: float = Query(...),
    lon: float = Query(...),
    day: int = Query(...),
    db: Session = Depends(get_db),
):
    """Devuelve condiciones meteorológicas promedio en el popup (desde la BD)."""

    # 1) Fecha objetivo (día 0 = hoy, en UTC)
    target_date = (datetime.utcnow() + timedelta(days=day)).date()

    # 2) Resolver el spot por coincidencia EXACTA de coordenadas ("lon,lat")
    spot = (
        db.query(Spot)
        .filter(Spot.activo == True, Spot.lat == lat, Spot.lon == lon)
        .one_or_none()
    )
    if not spot:
        return {}

    # 3) Variables necesarias para este endpoint
    needed = [
        "minTemperature",
        "maxTemperature",
        "wind_speed",
        "precipitation_qpfCuantity",
        "waveHeight",
    ]

    # 4) Traer valores del día para esas variables (tomamos el último por variable)
    q = (
        db.query(VariableMeteorologica.valor, TipoVariableMeteorologica.nombre)
        .join(
            TipoVariableMeteorologica,
            VariableMeteorologica.id_tipo_variable == TipoVariableMeteorologica.id,
        )
        .filter(
            VariableMeteorologica.id_spot == spot.id,
            VariableMeteorologica.fecha == target_date,
            TipoVariableMeteorologica.nombre.in_(needed),
        )
        .order_by(
            VariableMeteorologica.ultima_actualizacion.desc(),
            VariableMeteorologica.id.desc(),
        )
    )
    rows = q.all()

    latest = {}
    for valor, nombre in rows:
        if nombre in latest:
            continue  # ya tomamos la más reciente por el ORDER BY
        latest[nombre] = valor

    # 5) Calcular promedios y formatear la respuesta
    tmin = float(latest.get("minTemperature"))
    tmax = float(latest.get("maxTemperature"))
    # si falta uno de los dos, usamos el que esté
    if tmin == 0.0 and tmax == 0.0:
        temperature = 0
    elif tmin == 0.0:
        temperature = round(tmax)
    elif tmax == 0.0:
        temperature = round(tmin)
    else:
        temperature = round((tmin + tmax) / 2)

    wind_speed = round(float(latest.get("wind_speed")))
    precipitation = round(float(latest.get("precipitation_qpfCuantity")))
    wave_height = round(float(latest.get("waveHeight")))

    return {
        "temperature_2m": temperature,
        "wind_speed_10m": wind_speed,
        "precipitation": precipitation,
        "wave_height": wave_height,
    }

@router.get("/sportspoints")
async def get_sportspoints(
    lat: float = Query(...),
    lon: float = Query(...),
    day: int = Query(...),
    db: Session = Depends(get_db),
):
    """
    Devuelve la ponderación de TODOS los deportes para el spot cuyas coordenadas
    coinciden exactamente con (lon,lat) en la fecha 'hoy + day'.

    Respuesta:
    [
      {"sport": "Kitesurf", "score": 83.5},
      {"sport": "Surf", "score": 71.0},
      {"sport": "Kayak", "score": 64.0}
    ]
    """
    # 1) Calcular fecha objetivo
    target_date = (datetime.utcnow() + timedelta(days=day - 1)).date()

    # 2) Buscar spot exacto por coordenadas (ahora usando Numeric → convertir a Decimal)
    from decimal import Decimal
    spot = (
        db.query(Spot)
        .filter(
            Spot.activo == True,
            Spot.lat == Decimal(str(lat)),
            Spot.lon == Decimal(str(lon)),
        )
        .one_or_none()
    )

    if not spot:
        return []  # si no existe el spot, devolver lista vacía

    # 3) Obtener las ponderaciones de ese spot en esa fecha
    rows = (
        db.query(Deporte.nombre, DeporteSpot.ponderacion)
        .join(Deporte, Deporte.id == DeporteSpot.id_deporte)
        .filter(
            and_(
                DeporteSpot.id_spot == spot.id,
                DeporteSpot.fecha == target_date,
            )
        )
        .order_by(Deporte.nombre.asc())
        .all()
    )

    # 4) Formatear lista de scores
    scores = [{"sport": n, "score": float(p or 0)} for (n, p) in rows]

    return scores


@router.get("/general_weather")
async def get_general_weather(
    lat: float = Query(...),
    lon: float = Query(...),
    day: int = Query(...),
    db: Session = Depends(get_db),
):
    """
    Devuelve {nombreVariable: valor} para el spot cuyas coordenadas coinciden exactamente
    con las recibidas (formato 'lon,lat') en la fecha 'hoy + day'.
    """
    # 1) Fecha objetivo (día 0 = hoy, en UTC)
    target_date = (datetime.utcnow() + timedelta(days=day)).date()

    # 2) Resolver el spot por coincidencia exacta de coordenadas
    best_spot = (
        db.query(Spot)
        .filter(Spot.activo == True, Spot.lat == lat, Spot.lon == lon)
        .one_or_none()
    )

    if not best_spot:
        # No hay spot con esas coordenadas exactas
        return {}

    # 3) Traer variables del día para ese spot, uniendo el nombre de la variable
    q = (
        db.query(VariableMeteorologica, TipoVariableMeteorologica)
        .join(TipoVariableMeteorologica, VariableMeteorologica.id_tipo_variable == TipoVariableMeteorologica.id)
        .filter(
            VariableMeteorologica.id_spot == best_spot.id,
            VariableMeteorologica.fecha == target_date,
        )
        .order_by(
            # Tomamos la más reciente por variable (si hay varias filas por día/proveedor)
            VariableMeteorologica.ultima_actualizacion.desc(),
            VariableMeteorologica.id.desc(),
        )
    )

    rows = q.all()

    # 4) Armar {nombreVariable: valor} tomando el último por variable
    result = {}
    for vm, tv in rows:
        if tv.nombre in result:
            continue
        result[tv.nombre] = vm.valor  # 'valor' es TEXT en tu modelo

    return result