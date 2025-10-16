Para poder ejecutar el backEnd hay que hacer lo siguiente
Por lineas de comandos (no hay que copiar el simbolo pesos)

El comando inicial puede ser py o python, depende de su pc

$ py -m venv env
$ env\Scripts\activate
$ py -m pip install fastapi uvicorn
$ uvicorn main:app --reload
