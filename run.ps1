#!/usr/bin/env pwsh

Write-Host "Killing existing processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process npm -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3

Write-Host "Starting Backend Mock (port 3001)..." -ForegroundColor Cyan
Start-Process -WorkingDirectory "C:\Users\edilson.alvarez\Documents\campus-posgrado-v2\backend" -FilePath "node" -ArgumentList "simple-server.js"
Start-Sleep -Seconds 2

Write-Host "Starting Frontend (port 5173)..." -ForegroundColor Cyan
Start-Process -WorkingDirectory "C:\Users\edilson.alvarez\Documents\campus-posgrado-v2\frontend" -FilePath "npm" -ArgumentList "run", "dev"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "CAMPUS POSGRADO v2.0 - PHASE 2" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:   http://localhost:3001/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login with: test@example.com / Password123" -ForegroundColor Yellow
Write-Host ""
