@echo off
echo ===================================================
echo   Starting Student Information Management System
echo ===================================================
echo.

echo [1/2] Starting Backend Server...
start "Backend API" cmd /k "title Backend Server && backend\venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting Frontend Server...
start "Frontend UI" cmd /k "title Frontend Server && cd frontend && npm.cmd run dev"

echo.
echo Both servers are launching in separate windows!
echo.
echo - Your web app will be at:   http://localhost:5173
echo - Your backend API is at:    http://127.0.0.1:8000
echo.
pause
