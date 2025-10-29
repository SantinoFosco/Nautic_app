import arrow
import requests
from app.core.config import STORMGLASS_API_KEY

start = arrow.now()
end = start.shift(days=+5)

def get_marea_conditions(lat, lon):
    response = requests.get(
      'https://api.stormglass.io/v2/weather/point',
      params={
        'lat': lat,
        'lng': lon,
        'params': ','.join(['waterTemperature', 'waveHeight', 'wavePeriod']),
        'start': start.to('UTC').timestamp(),  # Convert to UTC timestamp
        'end': end.to('UTC').timestamp()  # Convert to UTC timestamp
      },
      headers={
        'Authorization': STORMGLASS_API_KEY
      }
    )
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Unable to fetch data"}
