#!/usr/bin/env pwsh

Write-Host "🚀 Campus Posgrado v2.0 - Setup Automático" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Get-Location

# 1. Levantar Docker
Write-Host "1️⃣ Levantando PostgreSQL con Docker..." -ForegroundColor Yellow
docker-compose up -d
Start-Sleep -Seconds 5

if (-not $?) {
    Write-Host "❌ Error levantando Docker. ¿Docker Desktop está abierto?" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PostgreSQL levantado en docker" -ForegroundColor Green
Write-Host ""

# 2. Setup Backend
Write-Host "2️⃣ Setup Backend..." -ForegroundColor Yellow

# Crear .env backend si no existe
$backendEnv = "$projectRoot\backend\.env"
if (-not (Test-Path $backendEnv)) {
    Write-Host "   - Creando .env backend..."
    @"
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=campus_posgrado
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRATION=3600
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
"@ | Out-File -FilePath $backendEnv -Encoding UTF8
    Write-Host "   ✅ .env backend creado"
} else {
    Write-Host "   ✓ .env backend ya existe"
}

# Instalar dependencias backend
Write-Host "   - Instalando dependencias backend..."
Push-Location "$projectRoot\backend"
npm install --silent | Out-Null
Pop-Location
Write-Host "   ✅ Dependencias backend instaladas"
Write-Host ""

# 3. Setup Frontend
Write-Host "3️⃣ Setup Frontend..." -ForegroundColor Yellow

# Crear .env frontend si no existe
$frontendEnv = "$projectRoot\frontend\.env"
if (-not (Test-Path $frontendEnv)) {
    Write-Host "   - Creando .env frontend..."
    @"
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Campus Posgrado
VITE_JWT_TOKEN_KEY=auth_token
VITE_JWT_REFRESH_KEY=refresh_token
"@ | Out-File -FilePath $frontendEnv -Encoding UTF8
    Write-Host "   ✅ .env frontend creado"
} else {
    Write-Host "   ✓ .env frontend ya existe"
}

# Instalar dependencias frontend
Write-Host "   - Instalando dependencias frontend..."
Push-Location "$projectRoot\frontend"
npm install --silent | Out-Null
Pop-Location
Write-Host "   ✅ Dependencias frontend instaladas"
Write-Host ""

# 4. Levantando servidores
Write-Host "4️⃣ Levantando servidores..." -ForegroundColor Yellow
Write-Host ""

# Backend en background
Write-Host "   - Iniciando Backend (puerto 3001)..." -ForegroundColor Cyan
Push-Location "$projectRoot\backend"
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "start:dev" -PassThru | Out-Null
Pop-Location
Start-Sleep -Seconds 3
Write-Host "   ✅ Backend iniciado" -ForegroundColor Green

# Frontend en background
Write-Host "   - Iniciando Frontend (puerto 5173)..." -ForegroundColor Cyan
Push-Location "$projectRoot\frontend"
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "dev" -PassThru | Out-Null
Pop-Location
Start-Sleep -Seconds 3
Write-Host "   ✅ Frontend iniciado" -ForegroundColor Green

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ SETUP COMPLETADO" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 URLs disponibles:" -ForegroundColor Yellow
Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Backend:   http://localhost:3001/api" -ForegroundColor Cyan
Write-Host "   pgAdmin:   http://localhost:5050" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Test Credentials:" -ForegroundColor Yellow
Write-Host "   Email:    test@example.com" -ForegroundColor Cyan
Write-Host "   Password: Password123" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Abre http://localhost:5173 en el navegador" -ForegroundColor White
Write-Host "   2. Haz clic en 'Regístrate aquí'" -ForegroundColor White
Write-Host "   3. Usa las credenciales de test" -ForegroundColor White
Write-Host ""
Write-Host "Para cerrar los servidores, cierra estas ventanas de PowerShell" -ForegroundColor Gray
Write-Host ""
