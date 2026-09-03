FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

COPY simple-server.js ./simple-server.js
COPY db ./db
COPY scripts ./scripts

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "simple-server.js"]
