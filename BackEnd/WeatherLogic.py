from WeatherAPI import get_weather_conditions
from MareaAPI import get_marea_conditions
from dataclasses import dataclass

# A guardar

#Google
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

#StormGlass
#   waterTemperature.sg
#   waveHeight.sg
#   wavePeriod.sg

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

from datetime import datetime
from statistics import mean

def parse_weather_forecast(lat, lon):
    forecast_weather_json = get_weather_conditions(lat, lon)
    forecast_marea_json = get_marea_conditions(lat, lon)
    days_list = []

    # --- Paso 1: Procesar pronóstico diario (weather) ---
    for day in forecast_weather_json.get("forecastDays", []):
        daytime = day.get("daytimeForecast", {})

        # Obtenemos la fecha (ej: '2025-10-13')
        day_str = f"{day['displayDate']['year']}-{day['displayDate']['month']:02d}-{day['displayDate']['day']:02d}"

        # --- Paso 2: Filtrar las horas de StormGlass correspondientes a ese día ---
        water_temps = []
        wave_heights = []
        wave_periods = []

        for hour in forecast_marea_json.get("hours", []):
            # Ejemplo: 2025-10-13T14:00:00+00:00
            date_obj = datetime.fromisoformat(hour["time"].replace("Z", "+00:00"))
            if str(date_obj.date()) == day_str:
                # Evitamos errores si algún campo falta
                wt = hour.get("waterTemperature", {}).get("sg")
                wh = hour.get("waveHeight", {}).get("sg")
                wp = hour.get("wavePeriod", {}).get("sg")

                if wt is not None: water_temps.append(wt)
                if wh is not None: wave_heights.append(wh)
                if wp is not None: wave_periods.append(wp)

        # Si no hay datos, devolvemos 0 para evitar error
        avg_water_temp = mean(water_temps) if water_temps else 0
        avg_wave_height = mean(wave_heights) if wave_heights else 0
        avg_wave_period = mean(wave_periods) if wave_periods else 0

        # --- Paso 3: Crear objeto weather_day ---
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
            waterTemperature = avg_water_temp,
            waveHeight = avg_wave_height,
            wavePeriod = avg_wave_period
        )

        days_list.append(wd)

    return days_list