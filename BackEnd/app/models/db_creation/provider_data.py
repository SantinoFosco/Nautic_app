from app.core.database import SessionLocal
from app.models.models import ProveedorDatos

# Lista de proveedores de datos a insertar
provider_data = [
    {"nombre": "StormGlass", "url_base": "https://api.stormglass.io/v2/weather/point", "politica_licencia": "https://docs.stormglass.io"},
    {"nombre": "Google Maps Platform", "url_base": "https://weather.googleapis.com/v1/forecast/days:lookup", "politica_licencia": "https://developers.google.com/maps/documentation/weather"},
]

# Función para generar el código del tipo "PRV0001"
def generar_codigo(prefix, id_num):
    return f"{prefix}{str(id_num).zfill(4)}"

def seed_providers():
    db = SessionLocal()
    try:
        print("📡 Insertando proveedores de datos en la base de datos...")

        for i, provider in enumerate(provider_data, start=1):
            codigo = generar_codigo("PRV", i)
            nuevo_proveedor = ProveedorDatos(
                codigo=codigo,
                nombre=provider["nombre"],
                url_base=provider["url_base"],
                politica_licencia=provider["politica_licencia"]
            )
            db.add(nuevo_proveedor)

        db.commit()
        print("✅ Proveedores de datos insertados correctamente.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error al insertar proveedores de datos: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_providers()