EJECUCION DEL backEnd

Generar un archivo .env dentro de la carpeta backEnd
Agregar las siguientes lineas
(Tanto url como api keys deben ir sin comillas y sin espacios antes o despues del =)
-
DATABASE_URL="tu-url"
GOOGLE_API_KEY="tu-google-api-key"
STORMGLASS_API_KEY="tu-stormglass-api-key"
-

Abrir una terminal y posicionarse en la carpeta backEnd
Ejecutar los siguientes comandos (se ejecuta lo que esta luego del simbolo $)

Creamos el ambiente virtual (solo se hace si aun no fue creado)
$ py -m venv env

Activamos el ambiente virtual (En caso de dar error de permisos de ejecucion de scripts buscar en google como solucionarlo)
$ env\Scripts\activate

Instalamos dependencias (tambien se ejecuta una sola vez, a menos que borremos y volvamos a crear el ambiente virtual)
(env) $ py -m pip install fastapi uvicorn requests arrow python-dotenv sqlalchemy psycopg2-binary

Ejecutamos el BackEnd
(env) $ uvicorn app.main:app --reload

--Aclaracion--
Siempre que abrimos una nueva terminal para la ejecucion del back, debemos activar el abmeinte virtual y
luego ejecutar el comando de ejecucion, ya que si no entramos al ambiente virtual, el sistema no encuentra
las dependencias