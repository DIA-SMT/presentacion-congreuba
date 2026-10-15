@echo off
REM Presentacion del panel UBA: levanta el servidor local y abre la presentacion.
REM La botonera se abre en el celular con la direccion que muestra esta ventana.
cd /d "%~dp0"
start "Servidor UBA" cmd /k node server.js
timeout /t 2 /nobreak >nul
start "" "http://localhost:8080"
