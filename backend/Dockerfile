FROM node:18-alpine

# Встановити залежності для компіляції better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Скопіювати тільки package файли для кешування npm install
COPY package*.json ./

# Встановити залежності з повним логуванням для діагностики
RUN npm install --omit=dev --verbose && \
    npm cache clean --force

# Скопіювати решту файлів
COPY src ./src
COPY database ./database

# Створити директорію для бази даних
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "src/index.js"]
