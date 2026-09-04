@echo off
setlocal
cd /d "%~dp0"
if not exist package.json (
  echo No se encontro package.json.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo Error al instalar dependencias.
    pause
    exit /b 1
  )
)
start "ReservaPro JSON Server" cmd /k "cd /d %~dp0 && npm run server"
timeout /t 2 /nobreak >nul
start "ReservaPro Vite" cmd /k "cd /d %~dp0 && npm run dev"
endlocal
