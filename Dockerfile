FROM node:18-alpine
WORKDIR /app
COPY backend/simple-server.js ./simple-server.js
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "simple-server.js"]
