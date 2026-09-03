# Campus Posgrado v2.0

Plataforma LMS (Learning Management System) moderna para gestión de programas de posgrado.

**Stack:** React 18 + TypeScript + Tailwind CSS | NestJS + TypeORM | PostgreSQL (Supabase) | JWT Auth

---

## Estructura del Proyecto

```
campus-posgrado-v2/
├── frontend/          # React + Vite application
├── backend/           # NestJS API server
├── docker-compose.yml # Development environment
├── README.md
└── .gitignore
```

---

## Setup Rápido

### 1. Clonar repositorio
```bash
git clone <repo-url>
cd campus-posgrado-v2
```

### 2. Configurar Backend (Fase 1)
```bash
cd backend
npm install
cp .env.example .env  # Configurar Supabase
npm run dev
```

El backend corre en `http://localhost:3001`

### 3. Configurar Frontend (Fase 1)
```bash
cd frontend
npm install
cp .env.example .env  # Configurar API URL
npm run dev
```

El frontend corre en `http://localhost:5173`

---

## Fases de Desarrollo

- **FASE 1** (2 semanas): Infraestructura + Autenticación
- **FASE 2** (3 semanas): Dashboard + Course View
- **FASE 3** (3 semanas): Entregas + Evaluación + Admin
- **FASE 4** (2 semanas): Instructor UI + Wizard
- **FASE 5** (2 semanas): Pulido + Deploy

---

## Tecnologías Principales

### Frontend
- React 18
- TypeScript
- Vite (bundler)
- Tailwind CSS
- React Router v6
- Zustand (state management)
- React Query / TanStack Query
- Axios (HTTP client)

### Backend
- NestJS
- TypeScript
- TypeORM (database)
- PostgreSQL (via Supabase)
- JWT (authentication)
- bcrypt (password hashing)
- Class Validator (DTOs)

### Base de Datos
- PostgreSQL (Supabase)
- Migrations (TypeORM)

### Auth
- JWT tokens
- bcrypt password hashing
- Refresh tokens
- Role-based access control (RBAC)

---

## Documentación

- [Frontend Setup](./frontend/README.md)
- [Backend Setup](./backend/README.md)
- [API Docs](./backend/API.md)
- [Database Schema](./backend/DATABASE.md)

---

## Contribuir

1. Crear rama desde `main`
2. Hacer cambios
3. Crear pull request
4. Code review + merge

---

## Licencia

Propiedad de Sumi Medical
