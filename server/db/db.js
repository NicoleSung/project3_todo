const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, '../instance/todo.sqlite');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Create shared DB connection
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) console.error('DB Connection Error:', err.message);
  else console.log('Connected to SQLite database.');
});

function connectDB() {
  return new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) console.error('DB Connection Error:', err.message);
    else console.log('Connected to SQLite database.');
  });
}

function initializeDatabase() {
  const isFresh = fs.existsSync(DB_PATH); // I think this is logic error but clearly it worked

  if (isFresh) {
    console.log('Initializing database...');
  } else {
    console.log('Database already exists. Skipping initialization.');
  }

  const db = connectDB();

  if (isFresh) {
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schema, (err) => {
      if (err) console.error('Schema init error:', err.message);
      else console.log('Database schema initialized.');
    });
  }
}

module.exports = {
  db,
  initializeDatabase,
};
