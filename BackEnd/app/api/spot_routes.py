from fastapi import APIRouter, Query
from random import choice, randint
from app.services.WeatherLogic import parse_weather_forecast
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from datetime import datetime, timedelta
from app.models.models import VariableMeteorologica, TipoVariableMeteorologica, Spot

# Creamos el router específico para este grupo de endpoints
router = APIRouter(prefix="/spot", tags=["Spots"])

# Lista temporal de spots (después se consultará en la BD)
spots = [
    {"name": "San Clemente del Tuyú", "lat": -36.3567, "lon": -56.7233, "sports": ["kite"]},
    {"name": "San Bernardo", "lat": -36.7000, "lon": -56.7000, "sports": ["kite"]},
    {"name": "Villa Gesell", "lat": -37.2645, "lon": -56.9729, "sports": ["surf", "kite"]},
    {"name": "Mar del Plata", "lat": -38.0055, "lon": -57.5426, "sports": ["surf", "kite"]},
    {"name": "Miramar", "lat": -38.2667, "lon": -57.8333, "sports": ["surf"]},
    {"name": "Necochea", "lat": -38.5545, "lon": -58.7390, "sports": ["surf"]},
    {"name": "Claromecó", "lat": -38.8667, "lon": -60.0833, "sports": ["surf"]},
    {"name": "Monte Hermoso", "lat": -38.9833, "lon": -61.2833, "sports": ["surf"]},
]

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
    coord_str = f"{lon},{lat}"
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


@router.get("/recomended_sport")
async def get_recomended_sport(lat: float = Query(...), lon: float = Query(...), day: int = Query(...)):
    """Devuelve un deporte recomendado según las condiciones del día"""
    choices_list = ["SURF", "KITE", "SURF Y KITE"]
    return {"sport": choice(choices_list)}


@router.get("/sportspoints")
async def get_sportspoints(lat: float = Query(...), lon: float = Query(...), day: int = Query(...)):
    """Devuelve puntajes de surf y kite según las condiciones"""
    kite_points = randint(0, 10)
    surf_points = randint(0, 10)
    return {"kite": kite_points, "surf": surf_points}


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
    coord_str = f"{lon},{lat}"
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
