import requests

# Tu API key
api_key = "8514ad20-7c48-4254-b3a8-9997b76ee27e"

# Endpoint de predicción de mareas
url = "https://api.marea.ooo/v2/stations"

# Hacer la request GET
response = requests.get(url, auth = ("", api_key))

# Revisar el resultado
if response.status_code == 200:
    data = response.json()
    print("Predicción recibida:")
    print(data)
else:
    print(f"Error {response.status_code}: {response.text}")
