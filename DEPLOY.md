# Campus Posgrado v2.0 - Cloud Deployment Guide

**Fase 2 COMPLETADA:** Dashboard + Course View con 3 cursos de ejemplo, progreso real, y conexión API funcional.

---

## 🚀 Deploy a Vercel + Railway (5 min)

### PASO 1: Preparar repositorio Git

```bash
cd C:\Users\edilson.alvarez\Documents\campus-posgrado-v2

# Inicializar Git
git init
git add .
git commit -m "Fase 2: Dashboard + Course View"

# Crear repositorio en GitHub
# 1. Ir a https://github.com/new
# 2. Nombre: campus-posgrado-v2
# 3. Crear repositorio
# 4. Copiar el comando:

git remote add origin https://github.com/TU-USUARIO/campus-posgrado-v2.git
git branch -M main
git push -u origin main
```

---

### PASO 2: Deploy Frontend a Vercel

1. Ir a https://vercel.com/new
2. Importar proyecto desde GitHub
3. Seleccionar: `campus-posgrado-v2`
4. Configurar:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Agregar variable de entorno:
   ```
   VITE_API_URL=https://campus-backend-xxxx.railway.app/api
   ```
   (Reemplazar con URL de Railway después)
6. **Deploy!**

✅ Obtendrás: `https://campus-posgrado-v2.vercel.app`

---

### PASO 3: Deploy Backend a Railway

1. Ir a https://railway.app/new
2. Crear proyecto vacío
3. Agregar servicio: **Dockerfile**
4. Crear `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --legacy-peer-deps
COPY backend .
EXPOSE 3001
CMD ["node", "simple-server.js"]
```

5. Hacer push:
```bash
git push -u origin main
```

6. En Railway:
   - Conectar repositorio GitHub
   - Rama: `main`
   - Directorio raíz: `.`
   - Build command: (dejar vacío)
   - Start command: `node backend/simple-server.js`

✅ Obtendrás: `https://campus-backend-xxxx.railway.app`

---

### PASO 4: Actualizar variable de entorno en Vercel

1. Ir a Vercel → proyecto campus-posgrado-v2
2. Settings → Environment Variables
3. Actualizar `VITE_API_URL`:
   ```
   https://campus-backend-xxxx.railway.app/api
   ```
4. Redeploy

---

## 📊 Resultado Final

| Componente | URL |
|-----------|-----|
| **Frontend** | https://campus-posgrado-v2.vercel.app |
| **Backend** | https://campus-backend-xxxx.railway.app/api |
| **PostgreSQL** | Railway managed |

---

## 🔐 Test Credentials

```
Email: test@example.com
Password: Password123
```

---

## 📋 Fase 2: Completada ✅

Implementado:
- [x] 3 cursos de ejemplo con datos realistas
- [x] Sistema de progreso por estudiante
- [x] Dashboard con stats en tiempo real
- [x] CourseCard component reutilizable
- [x] Conexión API funcional
- [x] React Query para caching
- [x] Zustand para estado global

---

## 🎯 Fase 3: Próxima

- [ ] Entregas (submissions)
- [ ] Sistema de calificaciones
- [ ] Panel de admin
- [ ] Evaluaciones

---

## 🆘 Troubleshooting

**Railway no inicia backend:**
- Revisar logs: `railway logs`
- Asegurar que `backend/simple-server.js` existe
- Verificar PORT = 3001

**Vercel no conecta con backend:**
- Verificar VITE_API_URL en environment variables
- CORS habilitado en backend
- Redeploy en Vercel después de cambiar variables

---

**Contacto:** edilson.alvarez@sumimedical.com
**Repositorio:** https://github.com/tu-usuario/campus-posgrado-v2
