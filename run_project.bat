@echo off
echo ====================================================================
echo  Smart Food Waste Prediction ^& Dynamic Discount Recommendation System
echo ====================================================================
echo.
echo Starting Flask Backend Server (Port 5000)...
start "FoodWaste-Backend" cmd /k "cd /d %~dp0 && python backend/app.py"

timeout /t 2 /nobreak > nul

echo Starting React + Vite Frontend (Port 5173)...
start "FoodWaste-Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo ====================================================================
echo  Both servers are launching!
echo  Backend:  http://127.0.0.1:5000
echo  Frontend: http://localhost:5173
echo ====================================================================
timeout /t 4 /nobreak > nul
start http://localhost:5173
