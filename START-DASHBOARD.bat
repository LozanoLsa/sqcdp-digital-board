@echo off
title DMS SQCDP Dashboard
echo.
echo  ================================================
echo   DMS SQCDP Dashboard - Iniciando...
echo  ================================================
echo.

:: ── Intenta con Python (pre-instalado en la mayoria de Windows 10/11) ──
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo  [OK] Python encontrado. Iniciando servidor...
    echo  [OK] Abriendo dashboard en el navegador...
    timeout /t 2 /nobreak >nul
    start http://localhost:3000
    python -m http.server 3000
    goto :end
)

:: ── Intenta con Node.js ──
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo  [OK] Node.js encontrado. Iniciando servidor...
    timeout /t 2 /nobreak >nul
    start http://localhost:3000
    npx serve . -p 3000
    goto :end
)

:: ── Ninguno disponible ──
echo.
echo  [ERROR] No se encontro Python ni Node.js en este equipo.
echo.
echo  Pide a IT que instale una de estas opciones (gratis):
echo.
echo    Python:  https://www.python.org/downloads/
echo    Node.js: https://nodejs.org/
echo.
echo  O activa GitHub Pages y usa la URL directamente:
echo    https://lozanolsa.github.io/sqcdp-digital-board/
echo.
pause

:end
