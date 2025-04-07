const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, '../instance/todo.sqlite');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Create DB connection
function connectDB() {
  return new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) console.error('DB Connection Error:', err.message);
    else console.log('Connected to SQLite database.');
  });
}

// Initialize schema only if DB file does not exist
function initializeDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    console.log('Initializing database...');
    const db = connectDB();
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schema, (err) => {
      if (err) console.error('Schema init error:', err.message);
      else console.log('Database schema initialized.');
    });
  } else {
    console.log('Database already exists. Skipping initialization.');
  }
}

module.exports = {
  connectDB,
  initializeDatabase,
  DB_PATH
};
