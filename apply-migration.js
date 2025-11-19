// Script to apply migration for removing stars column
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH || './backend/data/database.db';
const migrationPath = './backend/database/migration-remove-stars.sql';

console.log('🔄 Applying migration: Remove stars column');
console.log('Database:', dbPath);

try {
  // Read migration SQL
  const migration = fs.readFileSync(migrationPath, 'utf8');

  // Open database
  const db = new Database(dbPath);

  // Execute migration
  db.exec(migration);

  console.log('✅ Migration applied successfully!');

  // Verify - check table structure
  const columns = db.pragma('table_info(user_questions)');
  console.log('\nTable structure:');
  columns.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
  });

  db.close();
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
