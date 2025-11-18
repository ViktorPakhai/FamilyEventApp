#!/bin/bash

echo "🧪 Тестування функціоналу відміток питань"
echo "=========================================="

# 1. Login
echo "1. Логін користувача..."
curl -s -c /tmp/test-cookies.txt -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"userName": "Тестовий користувач", "eventId": 1}' > /dev/null

# 2. Create question
echo "2. Створення тестового питання..."
QUESTION=$(curl -s -b /tmp/test-cookies.txt -X POST http://localhost:3000/api/user/questions \
  -H "Content-Type: application/json" \
  -d '{"questionText": "Тестове питання для відміток"}' | jq -r '.question.id')

echo "   Створено питання ID: $QUESTION"

# 3. Get initial status
echo "3. Перевірка початкового статусу..."
STATUS=$(curl -s http://localhost:3000/api/admin/events/1/user-questions | \
  jq -r ".questions[] | select(.id == $QUESTION) | .is_answered")
echo "   is_answered = $STATUS (має бути 0)"

# 4. Toggle to answered
echo "4. Перемикання на 'відповіджено'..."
curl -s -X PATCH http://localhost:3000/api/admin/user-questions/$QUESTION/toggle-answered > /dev/null
STATUS=$(curl -s http://localhost:3000/api/admin/events/1/user-questions | \
  jq -r ".questions[] | select(.id == $QUESTION) | .is_answered")
echo "   is_answered = $STATUS (має бути 1)"

# 5. Toggle back
echo "5. Перемикання назад..."
curl -s -X PATCH http://localhost:3000/api/admin/user-questions/$QUESTION/toggle-answered > /dev/null
STATUS=$(curl -s http://localhost:3000/api/admin/events/1/user-questions | \
  jq -r ".questions[] | select(.id == $QUESTION) | .is_answered")
echo "   is_answered = $STATUS (має бути 0)"

echo ""
echo "✅ Backend тести пройшли успішно!"
echo ""
echo "📱 Тепер перевірте frontend:"
echo "   1. Відкрийте http://localhost/admin/login"
echo "   2. Увійдіть (admin / password)"
echo "   3. Перейдіть на вкладку 'Питання'"
echo "   4. Натисніть чекбокс біля питання"
echo "   5. Перевірте консоль браузера (F12) на наявність логів"
echo ""
