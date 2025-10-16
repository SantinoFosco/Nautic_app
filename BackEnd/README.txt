Para poder ejecutar el backEnd hay que hacer lo siguiente
Por lineas de comandos

El comando inicial puede ser py o python, depende de se pc

$ py -m venv env
$ env\Scripts\activate - source env/bin/activate 
$ py -m pip install fastapi uvicorn requests arrow - python -m pip install fastapi uvicorn requests arrow
$ uvicorn main:app --reload
