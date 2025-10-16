Para poder ejecutar el backEnd hay que hacer lo siguiente
Por lineas de comandos (no hay que copiar el simbolo pesos)

El comando inicial puede ser py o python, depende de su pc

Ir a la carpeta backend (Ej en pc de santi: C:\Users\santi\OneDrive\Documentos\UADE\2do Cuatrimestre 2025\Trabajo Final\Nautic_app\BackEnd>)
$ py -m venv env (Este se ejecuta una sola vez para crear el entorno virtual, la segunda vez que levantan no hace falta)
$ env\Scripts\activate

Verifiquen que estan accedieron al entorno virtual (aparece un (env) o algo asi en la terminal)
$ py -m pip install fastapi uvicorn requests arrow (Esto tambien se hace una unica vez, a menos que en algun momento tire error de dependencias)
$ uvicorn main:app --reload

Luego de que hacen esto por primera vez deberian poder arrancar solo con
$ env\Scripts\activate (si no esta activo aun)
$ uvicorn main:app --reload