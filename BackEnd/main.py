from fastapi import FastAPI,  Query
from fastapi.middleware.cors import CORSMiddleware
from random import *
from WeatherLogic import parse_weather_forecast
from WeatherAPI import get_weather_conditions

app = FastAPI()

# Habilitamos comunicacion entre front y back, evitando que el navegador bloquee las peticiones
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Esto habilita que cualquiera consulte el backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lista de spots - Consultar en la BD cuando este conectada
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

@app.get("/spots")
async def get_spots():
    return spots

# http://127.0.0.1:8000/spots/weather_average?lat=[LATITUD]&lon=[LONGITUD]&day=[DIA]
# Endpoint para mostrar las condicoines meteorologicas promedio en el PopUp dependiendo del dia
@app.get("/spots/weather_average")
async def get_weather_average(lat: float = Query(...), lon: float = Query(...), day: int = Query(...)):
    data_list = parse_weather_forecast(lat, lon)[day]

    temperature = round((data_list.minTemperature + data_list.maxTemperature) / 2)
    wind_speed = round(data_list.wind_speed)
    precipitation = round(data_list.precipitation_qpfCuantity)
    wave_height = round(data_list.waveHeight)

    return {
        "temperature_2m": temperature,
        "wind_speed_10m": wind_speed,
        "precipitation": precipitation,
        "wave_height": wave_height
    }
    
# http://127.0.0.1:8000/spots/recomended_sport?lat=[LATITUD]&lon=[LONGITUD]&day=[DIA]
# Endpoint para la recomendacion del deporte en el PopUp dependiendo del dia
@app.get("/spots/recomended_sport")
async def get_recomended_sport(lat: float = Query(...), lon: float = Query(...), day: int = Query(...)):
    choices = ["SURF", "KITE", "SURF Y KITE"]
    return {"sport": choice(choices)}

# http://127.0.0.1:8000/sportspoints?lat=[LATITUD]&lon=[LONGITUD]&day=[DIA]
#Endpoint para obtener puntos de kite y surf en base al dia para la ForecastPage
@app.get("/sportspoints")
async def get_sportspoints(lat: float = Query(...), lon: float = Query(...), day: int = Query(...)):
    kite_points = randint(0, 10)
    sufr_points = randint(0, 10)
    return {"kite": kite_points, "surf": sufr_points}

# http://127.0.0.1:8000/general_weather?lat=[LATITUD]&lon=[LONGITUD]&day=[DIA]
#Endpoint para obtener puntos de kite y surf en base al dia para la ForecastPage
@app.get("/general_weather")
async def get_general_weather(lat: float = Query(...), lon: float = Query(...), day: int = Query(...)):
    data_list = parse_weather_forecast(lat, lon)
    return data_list[day]