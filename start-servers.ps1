#!/usr/bin/env pwsh

$projectRoot = 'C:\Users\edilson.alvarez\Documents\campus-posgrado-v2'

Write-Host "Starting Campus Posgrado..." -ForegroundColor Cyan

# Backend
Write-Host "Starting Backend (port 3001)..." -ForegroundColor Yellow
Start-Process -NoNewWindow -WorkingDirectory "$projectRoot\backend" -FilePath "npm" -ArgumentList "run", "start:dev"
Start-Sleep -Seconds 2

# Frontend
Write-Host "Starting Frontend (port 5173)..." -ForegroundColor Yellow
Start-Process -NoNewWindow -WorkingDirectory "$projectRoot\frontend" -FilePath "npm" -ArgumentList "run", "dev"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "SERVERS STARTED" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:   http://localhost:3001/api" -ForegroundColor Cyan
Write-Host "pgAdmin:   http://localhost:5050" -ForegroundColor Cyan
Write-Host ""
