from fastapi import APIRouter, Query
from random import choice, randint
from app.services.WeatherLogic import parse_weather_forecast
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.models.models import Spot, DeporteSpot

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

@router.get("/weather_average")
async def get_weather_average(lat: float = Query(...), lon: float = Query(...), day: int = Query(...)):
    """Devuelve condiciones meteorológicas promedio en el popup"""
    data_list = parse_weather_forecast(lat, lon)[day]

    temperature = round((data_list.minTemperature + data_list.maxTemperature) / 2)
    wind_speed = round(data_list.wind_speed)
    precipitation = round(data_list.precipitation_qpfCuantity)
    wave_height = round(data_list.waveHeight)

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
async def get_general_weather(lat: float = Query(...), lon: float = Query(...), day: int = Query(...)):
    """Devuelve datos generales de clima"""
    data_list = parse_weather_forecast(lat, lon)
    return data_list[day]
