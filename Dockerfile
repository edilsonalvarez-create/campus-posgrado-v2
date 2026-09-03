FROM node:20-alpine
WORKDIR /app

# Dependencias del backend (solo pg)
COPY backend/package.json backend/package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# Código + migraciones + datos de seed
COPY backend/simple-server.js ./simple-server.js
COPY backend/db ./db
COPY backend/scripts ./scripts

ENV NODE_ENV=production
EXPOSE 3001

# Las migraciones corren al arrancar (idempotentes). El seed se ejecuta aparte
# con `railway run npm run seed` la primera vez.
CMD ["node", "simple-server.js"]
