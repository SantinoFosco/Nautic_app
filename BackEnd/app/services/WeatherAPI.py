import requests
from app.core.config import GOOGLE_API_KEY

def get_weather_conditions(lat, lon):
    response = requests.get(f"https://weather.googleapis.com/v1/forecast/days:lookup?key={GOOGLE_API_KEY}&location.latitude={lat}&location.longitude={lon}&days=5")
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Unable to fetch data"}