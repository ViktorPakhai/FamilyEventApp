# Stage 1: Frontend builder
FROM node:18-alpine AS frontend-builder

WORKDIR /frontend

# Copy frontend package files and install dependencies
COPY frontend/package*.json ./
RUN npm install && npm cache clean --force

# Copy frontend code and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend dependencies builder (with native compilation)
FROM node:18-alpine AS backend-builder

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy backend package files and install dependencies
COPY backend/package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Stage 3: Final runtime image
FROM node:18-alpine

# Install only runtime dependencies (nginx only, no build tools)
RUN apk add --no-cache nginx && \
    mkdir -p /run/nginx && \
    rm -rf /var/cache/apk/*

# Setup backend
WORKDIR /app

# Copy backend dependencies from builder (includes compiled better-sqlite3)
COPY --from=backend-builder /app/node_modules ./node_modules

# Copy backend source code
COPY backend/package*.json ./
COPY backend/src ./src
COPY backend/database ./database

# Create database directory
RUN mkdir -p /app/data

# Copy frontend static files
COPY --from=frontend-builder /frontend/dist /usr/share/nginx/html

# Copy nginx config
COPY frontend/nginx.conf /etc/nginx/http.d/default.conf

# Create optimized startup script
RUN printf '#!/bin/sh\nnginx\nexec node src/index.js\n' > /start.sh && \
    chmod +x /start.sh

# Remove unnecessary files
RUN rm -rf /tmp/* /var/tmp/* /usr/share/man /usr/share/doc

EXPOSE 80 3000

CMD ["/start.sh"]
