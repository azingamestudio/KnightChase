const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'game.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      device_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_wins INTEGER DEFAULT 0,
      total_games INTEGER DEFAULT 0
    )
  `);

  // Migration for existing databases (try to add device_id if missing)
  db.run("ALTER TABLE users ADD COLUMN device_id TEXT", (err) => {
    // Ignore error if column already exists
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      username TEXT,
      score INTEGER,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(username) REFERENCES users(username)
    )
  `);
});

module.exports = db;
