FROM node:18-alpine

# Встановити залежності для компіляції better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

# Створити директорію для бази даних
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "src/index.js"]
