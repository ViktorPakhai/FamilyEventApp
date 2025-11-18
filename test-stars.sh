#!/bin/bash

echo "🧪 Тестування функціоналу зірочок"
echo "=================================="

# 1. Login as user
echo "1. Логін користувача..."
curl -s -c /tmp/test-cookies.txt -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"userName": "Тестовий користувач", "eventId": 1}' > /dev/null

# 2. Create question
echo "2. Створення тестового питання..."
QUESTION=$(curl -s -b /tmp/test-cookies.txt -X POST http://localhost:3000/api/user/questions \
  -H "Content-Type: application/json" \
  -d '{"questionText": "Тестове питання для зірочок"}' | jq -r '.question.id')

echo "   Створено питання ID: $QUESTION"

# 3. Check initial stars
echo "3. Перевірка початкового рейтингу..."
STARS=$(curl -s http://localhost:3000/api/admin/events/1/user-questions | \
  jq -r ".questions[] | select(.id == $QUESTION) | .stars")
echo "   stars = $STARS (має бути 0)"

# 4. Set stars to 3
echo "4. Встановлення рейтингу 3 зірки..."
curl -s -X PATCH http://localhost:3000/api/admin/user-questions/$QUESTION/stars \
  -H "Content-Type: application/json" \
  -d '{"stars": 3}' > /dev/null
STARS=$(curl -s http://localhost:3000/api/admin/events/1/user-questions | \
  jq -r ".questions[] | select(.id == $QUESTION) | .stars")
echo "   stars = $STARS (має бути 3)"

# 5. Set stars to 5
echo "5. Встановлення рейтингу 5 зірок..."
curl -s -X PATCH http://localhost:3000/api/admin/user-questions/$QUESTION/stars \
  -H "Content-Type: application/json" \
  -d '{"stars": 5}' > /dev/null
STARS=$(curl -s http://localhost:3000/api/admin/events/1/user-questions | \
  jq -r ".questions[] | select(.id == $QUESTION) | .stars")
echo "   stars = $STARS (має бути 5)"

echo ""
echo "✅ Backend тест зірочок пройшов успішно!"
