import requests

apikey = "AIzaSyCEEuGU-IbSMIM5cASYA5_HqMMOIz0rF2w"

latitude = -38.0055
longitude = -57.5426

response = requests.get("https://weather.googleapis.com/v1/forecast/days:lookup?key={apikey}&location.latitude={latitude}&location.longitude={longitude}&days=7")

print(response.json())