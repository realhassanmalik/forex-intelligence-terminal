@echo off
REM ===========================================================================
REM  Forex Intelligence Terminal - one-click launcher (Windows)
REM  Double-click this file. It sets up and starts the backend + frontend,
REM  then opens the terminal in your browser. Close the two server windows
REM  (or this window) to stop.
REM ===========================================================================
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Forex Intelligence Terminal

echo(
echo  ==============================================
echo     FOREX INTELLIGENCE TERMINAL  --  starting
echo  ==============================================
echo(

REM --- locate Python ---------------------------------------------------------
set "PY="
where py >nul 2>nul && set "PY=py -3"
if not defined PY ( where python >nul 2>nul && set "PY=python" )
if not defined PY (
  echo  [X] Python not found.
  echo      Install Python 3.10+ from https://www.python.org/downloads/
  echo      and tick "Add python.exe to PATH" during setup, then re-run this.
  pause & exit /b 1
)

REM --- locate Node -----------------------------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo  [X] Node.js not found.
  echo      Install Node 20+ from https://nodejs.org then re-run this.
  pause & exit /b 1
)
for /f "delims=" %%v in ('node --version') do echo  [ok] Node %%v

REM --- backend: venv + dependencies (self-healing) ---------------------------
echo  ^> Preparing backend...
cd backend
if not exist ".venv\Scripts\uvicorn.exe" (
  echo      Setting up Python environment ^(first run, ~1 min^)...
  if not exist ".venv" ( %PY% -m venv .venv )
  call ".venv\Scripts\python.exe" -m pip install --upgrade pip >nul 2>nul
  call ".venv\Scripts\pip.exe" install -r requirements.txt
)
echo  [ok] Backend dependencies ready
cd ..

REM --- frontend: env + dependencies ------------------------------------------
echo  ^> Preparing frontend...
cd frontend
if not exist ".env.local" ( echo NEXT_PUBLIC_API_BASE_URL=http://localhost:8000> ".env.local" )
if not exist "node_modules" (
  echo      Installing frontend packages ^(first run, a few minutes^)...
  call npm install
)
echo  [ok] Frontend dependencies ready
cd ..

REM --- launch servers in their own windows -----------------------------------
echo(
echo  ^> Starting backend  ^(http://localhost:8000^)
start "Forex Backend" /d "%~dp0backend" cmd /k ".venv\Scripts\uvicorn.exe app.main:app --port 8000"

echo  ^> Starting frontend ^(http://localhost:3000^)
start "Forex Frontend" /d "%~dp0frontend" cmd /k "npm run dev"

REM --- wait for the frontend, then open the browser --------------------------
echo(
echo  Waiting for the terminal to come online...
set /a tries=0
:waitloop
timeout /t 2 >nul
set /a tries+=1
powershell -NoProfile -Command "try{Invoke-WebRequest -UseBasicParsing http://localhost:3000 -TimeoutSec 2 ^| Out-Null; exit 0}catch{exit 1}" && goto ready
if %tries% GEQ 45 ( echo  [!] Taking longer than expected - check the two server windows. & goto done )
goto waitloop

:ready
start "" http://localhost:3000
:done
echo(
echo  ==============================================
echo   Terminal UI : http://localhost:3000
echo   API docs    : http://localhost:8000/docs
echo  ==============================================
echo   Close the two server windows to stop everything.
echo(
pause
