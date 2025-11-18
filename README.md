# Family Evening 🎉

Веб-додаток для проведення інтерактивних ігор на івентах. Оптимізований для мобільних пристроїв, підтримує 40-100 одночасних користувачів.

## Основні можливості

### Для користувачів:
- ✅ Вхід за іменем (без реєстрації)
- ❓ Задавання питань для спікера
- 🎮 Участь в інтерактивних іграх з питаннями
- 📊 Перегляд результатів гри

### Для адміністраторів:
- 🔐 Вхід за паролем (логін: `admin`, пароль: `password`)
- 📅 Створення та управління подіями
- 🎯 Створення ігор з питаннями (4 варіанти відповіді)
- ⭐ Модерація питань від учасників зі зірочками
- 🔄 Активація/деактивація ігор

## Технологічний стек

- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **База даних**: SQLite (better-sqlite3)
- **Deployment**: Docker + Docker Compose

## Швидкий старт ⚡

### Вимоги
- Docker та Docker Compose
- Node.js 18+ (опціонально, для локальної розробки)

### Запуск з Docker (Рекомендовано)

#### Метод 1: Використання готового образу з Docker Hub (найшвидший)
```bash
# Завантажити та запустити контейнер
docker run -d \
  -p 80:80 \
  -p 3000:3000 \
  -v familyevening-data:/app/data \
  --name familyevening \
  sdgadmin/familyevening:latest

# Відкрити в браузері
open http://localhost
```

Або з docker-compose - створіть `docker-compose.yml`:
```yaml
services:
  app:
    image: sdgadmin/familyevening:v0.3.0
    ports:
      - "80:80"
      - "3000:3000"
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

#### Метод 2: Збірка з вихідного коду (автоматичний запуск)
```bash
git clone <repository-url>
cd familyevening
./first-run.sh
```

#### Метод 3: Використання Makefile
```bash
git clone <repository-url>
cd familyevening
make quick-start
```

#### Метод 4: Ручний запуск
```bash
git clone <repository-url>
cd familyevening

# Увімкнути BuildKit для швидшої збірки
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Паралельна збірка та запуск
docker-compose build --parallel
docker-compose up -d
```

### Час запуску
- ⚡ **Перша збірка**: 2-3 хвилини
- 🚀 **Наступні запуски**: 5-10 секунд (завдяки кешуванню)

### Доступ до додатку
- 📱 **Frontend**: http://localhost
- 🔧 **Backend API**: http://localhost:3000
- 👤 **Адмін панель**: http://localhost/admin/login
  - Логін: `admin`
  - Пароль: `password`

4. Зупинка сервісів:
```bash
docker-compose down
```

### Локальна розробка

#### 1. Запустити тільки базу даних:
```bash
docker-compose up -d postgres
```

#### 2. Встановити залежності:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

#### 3. Створити .env файл в корені проекту:
```bash
cp .env.example .env
```

#### 4. Запустити backend (в одному терміналі):
```bash
cd backend
npm run dev
```

#### 5. Запустити frontend (в іншому терміналі):
```bash
cd frontend
npm run dev
```

Frontend буде доступний на http://localhost:5173

### Альтернативний запуск обох сервісів одночасно:
```bash
npm run dev
```

## Структура проекту

```
familyevening/
├── backend/
│   ├── src/
│   │   ├── index.js       # Головний файл сервера
│   │   └── db.js          # Підключення до бази даних
│   ├── database/
│   │   └── init.sql       # Схема бази даних
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/         # Сторінки додатку
│   │   ├── styles/        # CSS стилі
│   │   ├── App.jsx        # Головний компонент
│   │   └── main.jsx       # Точка входу
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Endpoints

### Користувацькі endpoints:

- `POST /api/user/login` - Вхід за іменем
- `GET /api/user/session` - Отримати поточну сесію
- `POST /api/user/logout` - Вихід
- `POST /api/user/questions` - Задати питання
- `GET /api/user/games` - Отримати доступні ігри
- `GET /api/user/games/:gameId/questions` - Отримати питання гри
- `POST /api/user/games/answer` - Відповісти на питання
- `GET /api/user/games/:gameId/results` - Отримати результати гри

### Адміністраторські endpoints:

- `GET /api/admin/events` - Отримати всі події
- `POST /api/admin/events` - Створити подію
- `GET /api/admin/events/:eventId/games` - Отримати ігри події
- `POST /api/admin/games` - Створити гру
- `PATCH /api/admin/games/:gameId/toggle` - Активувати/деактивувати гру
- `GET /api/admin/games/:gameId/questions` - Отримати питання гри
- `POST /api/admin/games/:gameId/questions` - Додати питання до гри
- `DELETE /api/admin/questions/:questionId` - Видалити питання
- `GET /api/admin/events/:eventId/user-questions` - Отримати питання від користувачів
- `PATCH /api/admin/user-questions/:questionId/stars` - Змінити зірочки питання

## Схема бази даних

### Основні таблиці:

- **events** - Події
- **user_sessions** - Сесії користувачів (4 години)
- **user_questions** - Питання від користувачів
- **games** - Ігри
- **game_questions** - Питання для ігор
- **game_answers** - Відповіді користувачів на питання ігор
- **admins** - Адміністратори (для майбутнього використання)

## Налаштування Production

1. Змініть `SESSION_SECRET` в docker-compose.yml
2. Налаштуйте безпечні паролі для PostgreSQL
3. Встановіть HTTPS (nginx reverse proxy або Traefik)
4. Налаштуйте регулярні бекапи бази даних

## Розробка

### Додавання нових функцій:

1. Backend: додайте endpoints в `backend/src/index.js`
2. Frontend: створіть компоненти в `frontend/src/`
3. База даних: оновіть схему в `backend/database/init.sql`

### Збірка для production:

```bash
# Backend
cd backend
npm run start

# Frontend
cd frontend
npm run build
```

## Troubleshooting

### Порти зайняті:
Змініть порти в `docker-compose.yml`:
```yaml
ports:
  - "8080:80"     # Frontend
  - "3001:3000"   # Backend
  - "5433:5432"   # PostgreSQL
```

### База даних не ініціалізується:
```bash
docker-compose down -v
docker-compose up -d
```

### Frontend не підключається до backend:
Перевірте CORS налаштування в `backend/src/index.js` та proxy в `frontend/vite.config.js`

## Публікація на Docker Hub 🚀

### Готовий образ
Образ доступний на Docker Hub: **sdgadmin/familyevening**

📦 https://hub.docker.com/r/sdgadmin/familyevening

### Публікація нової версії (для розробників)

```bash
# 1. Увійдіть в Docker Hub
docker login

# 2. Зберіть образ
make build

# 3. Опублікуйте (використає версію з git tag)
make publish

# Або вкажіть конкретну версію
make publish-version VERSION=v0.3.0

# Або використайте скрипт напряму
./docker-publish.sh v0.3.0
```

Скрипт автоматично створить теги `latest` та вказану версію.

Детальніше див. [DOCKER_HUB.md](DOCKER_HUB.md)

## Ліцензія

MIT

## Підтримка

Для питань та пропозицій створіть issue в репозиторії.
