import arrow
import requests

start = arrow.now()
end = start.shift(days=+5)

api_key = "a4a16d9c-a955-11f0-b808-0242ac130006-a4a16e8c-a955-11f0-b808-0242ac130006"

def get_marea_conditions(lat, lon):
    response = requests.get(
      'https://api.stormglass.io/v2/weather/point',
      params={
        'lat': lat,
        'lng': lon,
        'params': ','.join(['waterTemperature', 'waveHeight', 'wavePeriod']),
        'start': start.to('UTC').timestamp(),  
        'end': end.to('UTC').timestamp()  
      },
      headers={
        'Authorization': api_key
      }
    )
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Unable to fetch data"}
