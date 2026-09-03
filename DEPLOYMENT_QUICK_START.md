# 🚀 DEPLOYMENT QUICK START - 5 MINUTOS

## PASO 1: Crear GitHub Repository

1. Ir a https://github.com/new
2. **Repository name:** `campus-posgrado-v2`
3. **Descripción:** Campus Posgrado LMS - Phase 2
4. **Public** (para conectar con Vercel/Railway)
5. **Create repository**

---

## PASO 2: Push a GitHub (En tu máquina)

Abre PowerShell en la carpeta del proyecto:

```powershell
cd 'C:\Users\edilson.alvarez\Documents\campus-posgrado-v2'

git init
git add .
git commit -m "Fase 2: Dashboard + Course View - Ready for cloud deployment"
git branch -M main

# Reemplaza TU-USUARIO con tu usuario de GitHub
git remote add origin https://github.com/TU-USUARIO/campus-posgrado-v2.git
git push -u origin main
```

**Confirma que el push fue exitoso en:** https://github.com/TU-USUARIO/campus-posgrado-v2

---

## PASO 3: Desplegar Frontend a Vercel (2 min)

1. Ir a https://vercel.com/new
2. **Import Git Repository**
3. Buscar: `campus-posgrado-v2`
4. **Import**

### Configurar:
- **Root Directory:** `frontend`
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Environment Variables:
```
VITE_API_URL = https://campus-posgrado-v2-api.railway.app/api
```
(Cambiar después con URL de Railway)

**Deploy!** ✅

**Tu URL será:** `https://campus-posgrado-v2.vercel.app`

---

## PASO 4: Desplegar Backend a Railway (2 min)

1. Ir a https://railway.app/new
2. **Deploy from GitHub**
3. Conectar tu cuenta GitHub
4. Seleccionar: `campus-posgrado-v2`
5. **Deploy**

Railway detectará automáticamente el Dockerfile

### Configurar Variables:
```
PORT=3001
NODE_ENV=production
```

**Tu URL será:** `https://campus-posgrado-v2-api.railway.app`

---

## PASO 5: Actualizar Vercel con URL de Railway

1. Ir a https://vercel.com/dashboard
2. Proyecto: `campus-posgrado-v2`
3. **Settings → Environment Variables**
4. Editar `VITE_API_URL`:
   ```
   https://campus-posgrado-v2-api.railway.app/api
   ```
5. **Save**
6. **Redeploy** (ir a Deployments → More → Redeploy)

---

## ✅ RESULTADO FINAL

| Componente | URL | Status |
|-----------|-----|--------|
| Frontend | https://campus-posgrado-v2.vercel.app | ✅ Live |
| Backend | https://campus-posgrado-v2-api.railway.app | ✅ Live |
| Database | Railway Postgres | ✅ Connected |

---

## 🧪 Test en Producción

1. Abre: https://campus-posgrado-v2.vercel.app
2. **Register:**
   - Email: `prod@test.com`
   - Name: `Production Test`
   - Password: `Test123456`
3. **Login** con las credenciales
4. Deberías ver **3 cursos** en el Dashboard

---

## 🔐 Test Credentials

Cuenta de prueba ya lista:
```
Email: test@example.com
Password: Password123
```

---

## 📊 URLs en Producción

**Comparte estas URLs:**
- 🌐 Frontend: https://campus-posgrado-v2.vercel.app
- 🔌 API: https://campus-posgrado-v2-api.railway.app/api

---

## 🆘 Si algo falla

### Frontend no carga
- Vercel → Deployments → Check build logs
- Revisar VITE_API_URL en Environment Variables

### Backend error
- Railway → Logs → Check Node.js errors
- Verificar que Dockerfile existe en backend/

### API no conecta
- Probar: `https://campus-posgrado-v2-api.railway.app/api/health`
- Debe retornar status 404 (endpoint no existe pero servidor está activo)

---

## ⏭️ SIGUIENTE: Fase 3

Una vez deployed, continuamos con:
- Sistema de entregas (submissions)
- Calificaciones y feedback
- Panel de instructor

**Tiempo estimado:** 3 horas

---

**¡Listo para producción!** 🎉
