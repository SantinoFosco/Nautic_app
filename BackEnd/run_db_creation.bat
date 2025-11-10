@echo off
setlocal

echo ==== Inicializando base de datos de Nautic_app ====

REM 1. Activar entorno virtual si existe
if exist "%~dp0env\Scripts\activate.bat" (
    echo Activando entorno virtual...
    call "%~dp0env\Scripts\activate.bat"
) else (
    echo Advertencia: no se encontro el entorno virtual en %~dp0env
)

REM 2. Ejecutar scripts de creacion en orden
set SCRIPT_DIR=%~dp0app\models\db_creation

echo Ejecutando create_db.py...
py -m app.models.db_creation.create_db || goto :error

echo Ejecutando provider_data.py...
py -m app.models.db_creation.provider_data || goto :error

echo Ejecutando tipoVariable_data.py...
py -m app.models.db_creation.tipoVariable_data || goto :error

echo Ejecutando sports_data.py...
py -m app.models.db_creation.sports_data || goto :error

echo Ejecutando users_data.py...
py -m app.models.db_creation.users_data || goto :error

echo Ejecutando business_data.py...
py -m app.models.db_creation.business_data || goto :error

echo Ejecutando spots_data.py...
py -m app.models.db_creation.spots_data || goto :error

echo Ejecutando deporteVariable_data.py...
py -m app.models.db_creation.deporteVariable_data || goto :error

echo Ejecutando WeatherLogic.py...
py -m app.services.WeatherLogic || goto :error

echo ==== Base de datos creada correctamente ====
goto :eof

:error
echo.
echo ==== Se produjo un error durante la ejecucion. Abortando. ====
exit /b 1

