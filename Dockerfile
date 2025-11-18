# Multi-stage build: Frontend builder
FROM node:18-alpine AS frontend-builder

WORKDIR /frontend

# Скопіювати package файли frontend
COPY frontend/package*.json ./
RUN npm install && npm cache clean --force

# Скопіювати frontend код та зібрати
COPY frontend/ ./
RUN npm run build

# Multi-stage build: Backend + Nginx
FROM node:18-alpine

# Встановити nginx та залежності для компіляції better-sqlite3
RUN apk add --no-cache nginx python3 make g++

# Налаштувати nginx
RUN mkdir -p /run/nginx

# Backend
WORKDIR /app

# Скопіювати package файли backend
COPY backend/package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Скопіювати backend код
COPY backend/src ./src
COPY backend/database ./database

# Створити директорію для бази даних
RUN mkdir -p /app/data

# Frontend - скопіювати зібрані файли
COPY --from=frontend-builder /frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/http.d/default.conf

# Створити startup скрипт
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'nginx' >> /start.sh && \
    echo 'cd /app && node src/index.js' >> /start.sh && \
    chmod +x /start.sh

EXPOSE 80 3000

CMD ["/start.sh"]
