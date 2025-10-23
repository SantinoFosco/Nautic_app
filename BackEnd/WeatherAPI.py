import requests

api_key = "AIzaSyDRyFpdl-jTyt9LvyQ0q_jA6HQt7MdaLa8"

# response = requests.get(f"https://weather.googleapis.com/v1/forecast/days:lookup?key={api_key}&location.latitude={latitude}&location.longitude={longitude}")

def get_weather_conditions(lat, lon):
    response = requests.get(f"https://weather.googleapis.com/v1/forecast/days:lookup?key={api_key}&location.latitude={lat}&location.longitude={lon}&days=5")
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Unable to fetch data"}