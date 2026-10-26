# Windows PowerShell launcher for Smart Food Waste Prediction & Dynamic Discount System

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host " Smart Food Waste Prediction & Dynamic Discount System Launcher" -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Cyan

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Backend
Write-Host "`n[1/2] Starting Flask Backend on http://127.0.0.1:5000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root'; python backend/app.py"

Start-Sleep -Seconds 2

# 2. Start Frontend
Write-Host "[2/2] Starting React + Vite Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\frontend'; npm run dev"

Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

Write-Host "`nApplication launched successfully!" -ForegroundColor Green
