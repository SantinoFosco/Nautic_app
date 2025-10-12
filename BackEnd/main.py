from fastapi import FastAPI,  Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 🔹 Permitir que tu frontend (React/Vite) se comunique con el backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Podés restringirlo a ["http://localhost:5173"] si usás Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Tu lista de spots
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

# fetch(`http://127.0.0.1:8000/spots/weather_average?lat=${spot.lat}&lon=${spot.lon}&day=${day}`)
@app.get("/spots/weather_average_mon")
async def get_weather_average(lat: float = Query(...), lon: float = Query(...), day: int = Query(...)):
    if day == 0:
        return {
            "temperature_2m": 20,
            "wind_speed_10m": 10,
            "precipitation": 2,
            "wave_height": 3
        }
    if day == 1:
        return {
            "temperature_2m": 22,
            "wind_speed_10m": 15,
            "precipitation": 5,
            "wave_height": 1.5
        }
    if day == 2:
        return {
            "temperature_2m": 18,
            "wind_speed_10m": 8,
            "precipitation": 0,
            "wave_height": 2
        }
    if day == 3:
        return {
            "temperature_2m": 25,
            "wind_speed_10m": 12,
            "precipitation": 1,
            "wave_height": 2.5
        }
    if day == 4:
        return {
            "temperature_2m": 19,
            "wind_speed_10m": 20,
            "precipitation": 3,
            "wave_height": 3.5
        }
    if day == 5:
        return {
            "temperature_2m": 21,
            "wind_speed_10m": 18,
            "precipitation": 4,
            "wave_height": 2.8
        }
    if day == 6:
        return {
            "temperature_2m": 23,
            "wind_speed_10m": 14,
            "precipitation": 2,
            "wave_height": 1.8
        }
    