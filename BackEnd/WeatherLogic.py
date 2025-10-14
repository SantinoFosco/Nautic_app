from WeatherAPI import get_conditions
from dataclasses import dataclass

# A guardar

#daytimeForecast
#    uvIndex
#    precipitation
#        probability.persent
#        qpf.cuantity
#    wind
#       speed.value
#       direction.degrees
#       direction.cardinal
#       gust.value
#    cloudCover

#Temperaturas
#   maxTemperature.degrees
#   minTemperature.degrees
#   feelsLikeMaxTemperature.degrees
#   feelsLikeMinTemperature.degrees

@dataclass
class weather_day:
    uvIndex: float
    precipitation_probability: float
    precipitation_qpfCuantity: float
    wind_speed: float
    wind_directionDegrees: float
    wind_directionCardinal: str
    wind_gustValue: float
    cloudCover: float
    maxTemperature: float
    minTemperature: float
    feelsLikeMaxTemperature: float
    feelsLikeMinTemperature: float

def parse_weather_forecast(forecast_json):
    days_list = []

    for day in forecast_json.get("forecastDays", []):
        daytime = day.get("daytimeForecast", {})

        wd = weather_day(
            uvIndex = daytime.get("uvIndex", 0),
            precipitation_probability = daytime.get("precipitation", {}).get("probability", {}).get("percent", 0),
            precipitation_qpfCuantity = daytime.get("precipitation", {}).get("qpf", {}).get("quantity", 0),
            wind_speed = daytime.get("wind", {}).get("speed", {}).get("value", 0),
            wind_directionDegrees = daytime.get("wind", {}).get("direction", {}).get("degrees", 0),
            wind_directionCardinal = daytime.get("wind", {}).get("direction", {}).get("cardinal", ""),
            wind_gustValue = daytime.get("wind", {}).get("gust", {}).get("value", 0),
            cloudCover = daytime.get("cloudCover", 0),
            maxTemperature = day.get("maxTemperature", {}).get("degrees", 0),
            minTemperature = day.get("minTemperature", {}).get("degrees", 0),
            feelsLikeMaxTemperature = day.get("feelsLikeMaxTemperature", {}).get("degrees", 0),
            feelsLikeMinTemperature = day.get("feelsLikeMinTemperature", {}).get("degrees", 0),
        )

        days_list.append(wd)

    return days_list

