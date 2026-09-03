# Campus Posgrado - Frontend

React + TypeScript + Vite application for Campus Posgrado LMS.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts

- `npm run dev` - Start dev server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript check

## Project Structure

```
src/
├── pages/          # Page components (routes)
├── components/     # Reusable components
├── hooks/          # Custom React hooks
├── services/       # API and auth services
├── state/          # Zustand store
├── types/          # TypeScript types
├── styles/         # Global styles
└── App.tsx         # Root component
```

## Technologies

- React 18
- TypeScript
- Tailwind CSS
- React Router
- React Query
- Zustand
- Axios
