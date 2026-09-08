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

El repo ya trae `Dockerfile` (raíz) y `railway.toml`. No hay que escribir nada.

1. Ir a https://railway.app/new → **Deploy from GitHub** → `campus-posgrado-v2`, rama `main`.
2. Añadir el plugin **PostgreSQL** (inyecta `DATABASE_URL`).
3. **Backup de la base** antes del primer deploy con las migraciones nuevas
   (`004_certificates_kind.sql` cambia una constraint de `certificates`).
4. Configurar las variables del servicio — ver la lista completa en
   `DEPLOYMENT_QUICK_START.md` (PASO 4). Mínimo operativo:
   `PORT=3001`, `AUTO_SEED=sync`, `SEED_DEMO_DATA=false`. Para el tutor IA:
   `LLM_PROVIDER=anthropic`, `LLM_MODEL=claude-sonnet-5`,
   `LLM_MODEL_HEAVY=claude-opus-5`, `ANTHROPIC_API_KEY=<secreto>`.
5. Las migraciones corren solas al arrancar; con `AUTO_SEED=sync` el seed
   (no destructivo) también.

✅ Obtendrás: `https://campus-posgrado-v2-production.up.railway.app`

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
