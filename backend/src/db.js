import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Створити з'єднання з базою даних
const dbPath = process.env.DB_PATH || join(__dirname, '../data/database.db')
const db = new Database(dbPath, { verbose: console.log })

// Увімкнути foreign keys
db.pragma('foreign_keys = ON')

// Ініціалізувати схему бази даних
function initDatabase() {
  const schemaPath = join(__dirname, '../database/init-sqlite.sql')
  const schema = readFileSync(schemaPath, 'utf8')

  // Виконати всі команди зі схеми
  db.exec(schema)

  console.log('Database initialized successfully')
}

// Ініціалізувати базу при запуску
initDatabase()

export default db
