# Docker Hub - Family Evening App

## Публікація образу на Docker Hub

### Multi-Platform Build (Рекомендовано) 🌟

Підтримує обидві архітектури: **amd64** (Intel/AMD) та **arm64** (Apple Silicon/ARM)

```bash
# 1. Увійдіть в Docker Hub (один раз)
docker login

# 2. Запустіть multi-platform публікацію
./docker-publish-multiplatform.sh

# Або вкажіть конкретну версію
./docker-publish-multiplatform.sh v0.5.0

# Або через Makefile
make publish-multi
make publish-multi-version VERSION=v0.5.0
```

Скрипт автоматично:
- ✅ Налаштує Docker buildx для multi-platform
- ✅ Зберіть образи для linux/amd64 та linux/arm64
- ✅ Створить теги для `latest` та версії
- ✅ Відправить обидва образи на Docker Hub
- ✅ Docker автоматично вибере правильну платформу при pull

---

### Single Platform Build (швидший для тестування)

```bash
# 1. Увійдіть в Docker Hub (один раз)
docker login

# 2. Запустіть скрипт публікації
./docker-publish.sh

# Або вкажіть конкретну версію
./docker-publish.sh v0.3.0
```

**Примітка:** Зберіє тільки для вашої поточної архітектури.

---

### Ручний спосіб

#### 1. Авторизація в Docker Hub
```bash
docker login
# Введіть username: sdgadmin
# Введіть password або access token
```

#### 2. Створення тегів
```bash
# Тег для конкретної версії
docker tag familyevening-app:latest sdgadmin/familyevening:v0.3.0

# Тег для latest
docker tag familyevening-app:latest sdgadmin/familyevening:latest
```

#### 3. Публікація на Docker Hub
```bash
# Відправити версію
docker push sdgadmin/familyevening:v0.3.0

# Відправити latest
docker push sdgadmin/familyevening:latest
```

---

## Використання опублікованого образу

### Швидкий старт для інших користувачів

```bash
# 1. Завантажити образ
docker pull sdgadmin/familyevening:latest

# 2. Запустити контейнер
docker run -d \
  -p 80:80 \
  -p 3000:3000 \
  -v familyevening-data:/app/data \
  --name familyevening \
  sdgadmin/familyevening:latest

# 3. Відкрити в браузері
open http://localhost
```

### Використання з docker-compose

Створіть `docker-compose.yml`:

```yaml
services:
  app:
    image: sdgadmin/familyevening:v0.3.0
    container_name: familyevening
    ports:
      - "80:80"
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      SESSION_SECRET: your-secret-key-change-in-production
      DB_PATH: /app/data/database.db
    volumes:
      - app-data:/app/data
    restart: unless-stopped

volumes:
  app-data:
```

Потім:
```bash
docker-compose up -d
```

---

## Управління версіями

### Стратегія тегування

1. **latest** - завжди вказує на останню стабільну версію
2. **v0.3.0** - конкретні версії для стабільності
3. **v0.3** - minor версії (опціонально)

### Публікація нової версії

```bash
# 1. Створіть новий git tag
git tag v0.4.0

# 2. Зберіть новий образ
docker-compose build

# 3. Опублікуйте з новою версією
./docker-publish.sh v0.4.0
```

---

## Посилання

- **Docker Hub репозиторій**: https://hub.docker.com/r/sdgadmin/familyevening
- **GitHub репозиторій**: https://github.com/ViktorPakhai/FamilyEventApp

---

## Переваги використання Docker Hub

✅ **Швидке розгортання**: Не потрібно збирати образ локально
✅ **Версійність**: Легко повернутися до попередніх версій
✅ **Портативність**: Працює на будь-якій машині з Docker
✅ **Розподіл**: Легко поділитися з командою або клієнтами
✅ **CI/CD**: Інтеграція з автоматичними процесами

---

## Розмір образу

- **v0.3.0**: 206 MB (оптимізований multi-stage build)
- **Compression**: Додаткове стиснення при push/pull

---

## Безпека

### Приватні образи

Якщо потрібно зробити образ приватним:
1. Зайдіть на https://hub.docker.com/r/sdgadmin/familyevening
2. Settings → Make Private

### Access Tokens (рекомендовано)

Замість пароля використовуйте access token:
1. Docker Hub → Account Settings → Security → New Access Token
2. Використовуйте token замість пароля при `docker login`

```bash
docker login -u sdgadmin
# Password: [вставте access token]
```

---

## Автоматична публікація (GitHub Actions)

Додайте `.github/workflows/docker-publish.yml` для автоматичної публікації при створенні тегу:

```yaml
name: Publish to Docker Hub

on:
  push:
    tags:
      - 'v*'

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            sdgadmin/familyevening:latest
            sdgadmin/familyevening:${{ github.ref_name }}
```
