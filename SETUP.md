# Campus Posgrado v2.0 - Setup Guide

## Fase 1: Infraestructura + Autenticación ✅

Estructura del proyecto creada con:
- ✅ React + TypeScript frontend (Vite)
- ✅ NestJS + TypeORM backend
- ✅ PostgreSQL database schema
- ✅ JWT authentication
- ✅ Login/Register pages

---

## 1. Prerequisitos

- **Node.js** 18+ ([descargar](https://nodejs.org/))
- **npm** o **yarn**
- **Git**
- **PostgreSQL** 14+ o **Supabase** account

---

## 2. Setup Backend

### 2.1 Configurar base de datos

**Opción A: PostgreSQL Local**

```bash
# Levantar PostgreSQL con Docker Compose
docker-compose up -d

# Crear base de datos (si no existe)
createdb -U postgres campus_posgrado
```

**Opción B: Supabase (Recomendado)**

1. Ir a https://supabase.com
2. Crear nuevo proyecto
3. Copiar conexión PostgreSQL

### 2.2 Instalar dependencias backend

```bash
cd backend
npm install
```

### 2.3 Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
DB_HOST=localhost          # O host de Supabase
DB_PORT=5432
DB_USERNAME=postgres       # Tu usuario
DB_PASSWORD=postgres       # Tu password
DB_DATABASE=campus_posgrado
JWT_SECRET=cambiar-esto-en-produccion
JWT_EXPIRATION=3600
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 2.4 Iniciar servidor backend

```bash
npm run start:dev
```

✅ Backend corriendo en `http://localhost:3001/api`

---

## 3. Setup Frontend

### 3.1 Instalar dependencias

```bash
cd ../frontend
npm install
```

### 3.2 Configurar variables de entorno

```bash
cp .env.example .env
```

Contenido de `.env`:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Campus Posgrado
VITE_JWT_TOKEN_KEY=auth_token
```

### 3.3 Iniciar servidor frontend

```bash
npm run dev
```

✅ Frontend corriendo en `http://localhost:5173`

---

## 4. Prueba de Login

1. Abre http://localhost:5173
2. Haz clic en "Regístrate aquí"
3. Completa el formulario:
   - Email: `test@example.com`
   - Nombre: `Test User`
   - Contraseña: `password123`
4. Regístrate
5. Vuelve a login con las credenciales

✅ Deberías ver el Dashboard

---

## 5. Próximos Pasos (Fase 2)

En Fase 2 implementaremos:
- [ ] Endpoints CRUD para Cursos
- [ ] Endpoints CRUD para Módulos y Recursos
- [ ] Dashboard con datos reales
- [ ] Course View con tabs
- [ ] API de Progreso

---

## Troubleshooting

### Error: "EADDRINUSE: address already in use :::3001"

Puerto 3001 ya está en uso. Cambia en `.env`:

```env
PORT=3002
```

### Error: "connect ECONNREFUSED 127.0.0.1:5432"

PostgreSQL no está corriendo. Usa Docker:

```bash
docker-compose up -d
```

### Error: "Password authentication failed"

Revisa credenciales en `.env` y que PostgreSQL está corriendo.

---

## Estructura de Archivos

```
campus-posgrado-v2/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # Autenticación
│   │   │   ├── users/         # Usuarios
│   │   │   ├── courses/       # Cursos (stub)
│   │   │   ├── resources/     # Recursos (stub)
│   │   │   ├── submissions/   # Entregas (stub)
│   │   │   ├── grades/        # Calificaciones (stub)
│   │   │   └── progress/      # Progreso (stub)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── CourseView.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── auth.ts
│   │   ├── state/
│   │   │   └── store.ts        # Zustand store
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── docker-compose.yml
├── README.md
├── SETUP.md
└── .gitignore
```

---

## Siguientes Pasos

1. **Push a GitHub** (crear nuevo repositorio)
   ```bash
   git init
   git add .
   git commit -m "Fase 1: Infraestructura + Autenticación"
   git remote add origin <tu-repo>
   git push -u origin main
   ```

2. **Fase 2: Dashboard + Course View** (comenzar en 1 semana)
   - Implementar endpoints CRUD
   - Crear componentes de curso
   - Conectar con API

---

**¡Listo! Campus Posgrado v2.0 Fase 1 está completa.** 🚀
