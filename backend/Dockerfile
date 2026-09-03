FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY backend/package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar código
COPY backend .

# Exponer puerto
EXPOSE 3001

# Ejecutar servidor
CMD ["node", "simple-server.js"]
