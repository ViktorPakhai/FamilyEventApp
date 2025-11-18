FROM node:18-alpine as builder

WORKDIR /app

# Скопіювати тільки package файли для кешування npm install
COPY package*.json ./

# Встановити залежності та очистити кеш
RUN npm ci --only=production=false && \
    npm cache clean --force

# Скопіювати решту файлів
COPY . .

# Зібрати production build
RUN npm run build

# Production stage з nginx
FROM nginx:alpine

# Скопіювати зібрані файли
COPY --from=builder /app/dist /usr/share/nginx/html

# Скопіювати nginx конфіг
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Додати healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
