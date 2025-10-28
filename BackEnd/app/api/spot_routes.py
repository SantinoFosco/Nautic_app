from fastapi import APIRouter, Query
from random import choice, randint
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from datetime import datetime, timedelta
from app.models.models import VariableMeteorologica, TipoVariableMeteorologica, Spot, Deporte, DeporteSpot
from sqlalchemy import and_

# Creamos el router específico para este grupo de endpoints
router = APIRouter(prefix="/spot", tags=["Spots"])

@router.get("/list")
async def get_spots(db: Session = Depends(get_db)):
    """Devuelve todos los spots disponibles desde la base de datos"""
    spots_db = db.query(Spot).filter(Spot.activo == True).all()

    spots = []
    for spot in spots_db:
        # Parseamos las coordenadas que guardaste como string JSON, ej: "-37.26,-56.97"
        lat, lon = None, None
        if spot.coordenadas:
            try:
                lon_str, lat_str = spot.coordenadas.split(",")
                lat, lon = float(lat_str), float(lon_str)
            except:
                pass

        spots.append({
            "name": spot.nombre,
            "lat": lat,
            "lon": lon,
            "sports": ["kite", "surf"]
        })

    return spots

def _to_float(val) -> float:
    try:
        return float(val)
    except Exception:
        return 0.0

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
    coord_str = f"{lon}, {lat}"
    spot = (
        db.query(Spot)
        .filter(Spot.activo == True, Spot.coordenadas == coord_str)
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
    tmin = _to_float(latest.get("minTemperature"))
    tmax = _to_float(latest.get("maxTemperature"))
    # si falta uno de los dos, usamos el que esté
    if tmin == 0.0 and tmax == 0.0:
        temperature = 0
    elif tmin == 0.0:
        temperature = round(tmax)
    elif tmax == 0.0:
        temperature = round(tmin)
    else:
        temperature = round((tmin + tmax) / 2)

    wind_speed = round(_to_float(latest.get("wind_speed")))
    precipitation = round(_to_float(latest.get("precipitation_qpfCuantity")))
    wave_height = round(_to_float(latest.get("waveHeight")))

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
    {
      "date": "2025-10-30",
      "spot": { "id": 1, "name": "...", "lat": -37.26, "lon": -56.97 },
      "scores": [
        {"sport": "Kitesurf", "score": 83.5},
        {"sport": "Surf", "score": 71.0},
        {"sport": "Kayak", "score": 64.0}
      ],
      "best": {"sport": "Kitesurf", "score": 83.5}
    }
    """
    # 1) Fecha objetivo (día 0 = hoy, en UTC)
    target_date = (datetime.utcnow() + timedelta(days=day-1)).date()

    # 2) Resolver spot por coincidencia EXACTA de coordenadas ("lon,lat")
    coord_str = f"{lon}, {lat}"
    spot = (
        db.query(Spot)
        .filter(Spot.activo == True, Spot.coordenadas == coord_str)
        .one_or_none()
    )
    print(spot.nombre if spot else "No spot found")
    if not spot:
        # coherente con tus otros endpoints: devolver vacío si no existe
        return {"date": str(target_date), "spot": None, "scores": [], "best": None}

    # 3) Traer ponderaciones de ese spot en esa fecha, uniendo con Deporte para el nombre
    rows = (
        db.query(Deporte.nombre, DeporteSpot.ponderacion)
        .join(Deporte, Deporte.id == DeporteSpot.id_deporte)
        .filter(
            and_(
                DeporteSpot.id_spot == spot.id,
                DeporteSpot.fecha == target_date,   # importante: distinguir por fecha
            )
        )
        .order_by(Deporte.nombre.asc())
        .all()
    )

    # 4) Formatear respuesta
    scores = [{"sport": n, "score": float(p or 0)} for (n, p) in rows]
    best = None
    if scores:
        best_item = max(scores, key=lambda x: x["score"])
        best = {"sport": best_item["sport"], "score": best_item["score"]}

    # Parsear lat/lon desde el string guardado (igual que en /spot/list)
    spot_lat, spot_lon = None, None
    try:
        lon_str, lat_str = spot.coordenadas.split(",")
        spot_lat, spot_lon = float(lat_str), float(lon_str)
    except Exception:
        pass

    return {
        "date": str(target_date),
        "spot": {"id": spot.id, "name": spot.nombre, "lat": spot_lat, "lon": spot_lon},
        "scores": scores,
        "best": best,
    }


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

    # 2) Resolver el spot por coincidencia exacta de coordenadas ("lon,lat")
    coord_str = f"{lon}, {lat}"
    best_spot = (
        db.query(Spot)
        .filter(Spot.activo == True, Spot.coordenadas == coord_str)
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
