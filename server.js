const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
// Use Railway's port or default to 3000
const PORT = process.env.PORT || 3000;

// Ensure the /data directory exists for the SQLite volume
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Middleware
app.use(express.json());

// Serve static files from the root and 'public' folder
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// --- DATABASE SETUP ---
const dbPath = path.join(dataDir, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error(err.message);
  else console.log("Connected to SQLite at " + dbPath);
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, email TEXT UNIQUE, department TEXT, password TEXT,
    trust_score INTEGER DEFAULT 100, total_lent INTEGER DEFAULT 0, total_borrowed INTEGER DEFAULT 0
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS resources (
    resource_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, category TEXT, owner_id INTEGER, location TEXT,
    max_duration INTEGER, description TEXT, status TEXT DEFAULT 'available'
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS requests (
    request_id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id INTEGER, borrower_id INTEGER, owner_id INTEGER,
    duration_days INTEGER, note TEXT, status TEXT DEFAULT 'pending'
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, message TEXT, is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  console.log("Database initialized");
});

// --- ROUTES ---

// ROOT ROUTE: Fixes "Cannot GET /"
app.get('/', (req, res) => {
  const rootPath = path.join(__dirname, 'index.html');
  const publicPath = path.join(__dirname, 'public', 'index.html');
  
  if (fs.existsSync(publicPath)) {
    res.sendFile(publicPath);
  } else if (fs.existsSync(rootPath)) {
    res.sendFile(rootPath);
  } else {
    res.status(404).send("index.html not found in root or public folder.");
  }
});

// AUTH
app.post('/api/register', (req, res) => {
  const { name, email, department, password } = req.body;
  if (!name || !email || !department || !password) return res.json({ ok: false, error: "Missing fields" });
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (user) return res.json({ ok: false, error: "User already exists" });
    db.run(`INSERT INTO users (name, email, department, password) VALUES (?, ?, ?, ?)`,
      [name, email, department, password], function (err) {
        if (err) return res.json({ ok: false, error: err.message });
        db.get("SELECT * FROM users WHERE user_id = ?", [this.lastID], (err, newUser) => {
          res.json({ ok: true, data: newUser });
        });
      });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, user) => {
    if (!user) return res.json({ ok: false, error: "Invalid email or password" });
    res.json({ ok: true, data: user });
  });
});

// API Endpoints (Users, Resources, Requests)
app.get('/api/users', (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => res.json({ ok: true, data: rows }));
});

app.get('/api/resources', (req, res) => {
  db.all("SELECT * FROM resources", [], (err, rows) => res.json({ ok: true, data: rows }));
});

app.post('/api/resources', (req, res) => {
  const { name, category, owner_id, location, max_duration, description } = req.body;
  db.run(`INSERT INTO resources (name, category, owner_id, location, max_duration, description) VALUES (?, ?, ?, ?, ?, ?)`,
    [name, category, owner_id, location, max_duration, description], function (err) {
      if (err) return res.json({ ok: false, error: err.message });
      db.get("SELECT * FROM resources WHERE resource_id = ?", [this.lastID], (err, row) => res.json({ ok: true, data: row }));
    });
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
