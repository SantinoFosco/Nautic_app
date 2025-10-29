@echo off
setlocal

REM === Ruta absoluta a la carpeta del script (raíz del proyecto) ===
set "ROOT=%~dp0"

echo ============================
echo 🚀 Iniciando Nautic App...
echo ============================

REM ================= BACKEND =================
echo.
echo 🔧 Preparando Backend...
pushd "%ROOT%BackEnd"

REM Crear venv si no existe
if not exist "env\Scripts\activate.bat" (
    echo 🐍 Creando entorno virtual...
    py -m venv env

    REM Instalar deps dentro del venv (sin depender de activar en esta ventana)
    echo 📦 Instalando dependencias del backend...
    "env\Scripts\python.exe" -m pip install --upgrade pip >nul
    "env\Scripts\python.exe" -m pip install fastapi uvicorn requests arrow python-dotenv sqlalchemy psycopg2-binary >nul
)

REM Abrir el backend en una ventana nueva, con el directorio correcto
echo ▶️ Levantando FastAPI...
start "Nautic Backend" /D "%ROOT%BackEnd" cmd /k "call env\Scripts\activate.bat && uvicorn app.main:app --reload"

popd

REM ================= FRONTEND =================
echo.
echo 💻 Preparando Frontend...
pushd "%ROOT%FrontEnd"

REM Instalar node_modules si faltan
if not exist "node_modules" (
    echo 📦 Instalando dependencias del frontend...
    npm install
)

REM Abrir el frontend en una ventana nueva, con el directorio correcto
echo ▶️ Levantando Vite/Next...
start "Nautic Frontend" /D "%ROOT%FrontEnd" cmd /k "npm run dev"

popd

echo.
echo ============================
echo ✅ Nautic App iniciada.
echo (se abrieron dos ventanas: Backend y Frontend)
echo ============================
pause