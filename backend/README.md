# Campus Posgrado - Backend

NestJS + TypeScript API server for Campus Posgrado LMS.

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL (or Supabase)

### Installation

```bash
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run start:dev
```

## Environment Variables

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=campus_posgrado
JWT_SECRET=your-secret-key
JWT_EXPIRATION=3600
PORT=3001
```

## Scripts

- `npm run start:dev` - Start dev server with hot reload
- `npm run start:prod` - Start production server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## API Documentation

### Auth Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

## Project Structure

```
src/
├── modules/        # Feature modules (auth, courses, etc)
├── common/         # Guards, decorators, pipes
├── config/         # Configuration files
├── app.module.ts   # Root module
└── main.ts         # Entry point
```

## Technologies

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- JWT
- bcrypt
