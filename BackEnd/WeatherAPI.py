import requests

api_key = "NUESTRA_API_KEY"
latitude = -34.6037
longitude = -58.3816

response = requests.get(f"https://weather.googleapis.com/v1/forecast/days:lookup?key={api_key}&location.latitude={latitude}&location.longitude={longitude}")

print(response.json())