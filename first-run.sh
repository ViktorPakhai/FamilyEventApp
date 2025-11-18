#!/bin/bash

# Скрипт для першого запуску Family Evening додатку
# Оптимізований для максимальної швидкості

set -e

echo "🚀 Family Evening - Швидкий старт"
echo "=================================="

# Перевірка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не встановлено. Встановіть Docker і спробуйте знову."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не встановлено. Встановіть Docker Compose і спробуйте знову."
    exit 1
fi

# Очистити старі контейнери якщо існують
echo "🧹 Очищення старих контейнерів..."
docker-compose down -v 2>/dev/null || true

# Запустити збірку та старт
echo "🔨 Збірка та запуск контейнерів..."
echo "⏱️  Це може зайняти 2-3 хвилини при першому запуску..."

# Використовуємо BuildKit для швидшої збірки
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Паралельна збірка
time docker-compose build --parallel

# Запуск
echo "▶️  Запуск сервісів..."
docker-compose up -d

# Очікування готовності backend
echo "⏳ Очікування запуску backend..."
max_attempts=30
attempt=0
while ! curl -s http://localhost:3000/api/admin/events > /dev/null; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo "❌ Backend не запустився за 30 секунд"
        docker-compose logs backend
        exit 1
    fi
    echo -n "."
    sleep 1
done

echo ""
echo "✅ Backend готовий!"

# Перевірка frontend
echo "⏳ Очікування запуску frontend..."
max_attempts=15
attempt=0
while ! curl -s http://localhost/ > /dev/null; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo "❌ Frontend не запустився за 15 секунд"
        docker-compose logs frontend
        exit 1
    fi
    echo -n "."
    sleep 1
done

echo ""
echo "✅ Frontend готовий!"

# Показати статус
echo ""
echo "=================================="
echo "🎉 Додаток успішно запущено!"
echo "=================================="
echo ""
echo "📱 Frontend:  http://localhost"
echo "🔧 Backend:   http://localhost:3000"
echo "👤 Admin:     http://localhost/admin/login"
echo "   Login:     admin"
echo "   Password:  password"
echo ""
echo "📊 Контейнер працює:"
docker ps --filter name=familyevening
echo ""
echo "📝 Для перегляду логів: docker logs -f familyevening"
echo "🛑 Для зупинки: docker-compose down"
echo ""
echo "⚡ Перша збірка: ~25-30 секунд"
echo "🚀 Наступні запуски: ~2-3 секунди"
echo ""
