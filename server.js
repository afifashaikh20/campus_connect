const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

//  Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//  Database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error(err.message);
  else console.log(" Connected to SQLite");
});

//  Create tables automatically
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      department TEXT,
      password TEXT,
      trust_score INTEGER DEFAULT 100,
      total_lent INTEGER DEFAULT 0,
      total_borrowed INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS resources (
      resource_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      category TEXT,
      owner_id INTEGER,
      location TEXT,
      max_duration INTEGER,
      description TEXT,
      status TEXT DEFAULT 'available'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS requests (
      request_id INTEGER PRIMARY KEY AUTOINCREMENT,
      resource_id INTEGER,
      borrower_id INTEGER,
      owner_id INTEGER,
      duration_days INTEGER,
      note TEXT,
      status TEXT DEFAULT 'pending'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      message TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log(" Database initialized");
});


// AUTH


//  REGISTER
app.post('/api/register', (req, res) => {
  const { name, email, department, password } = req.body;

  if (!name || !email || !department || !password) {
    return res.json({ ok: false, error: "Missing fields" });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (user) {
      return res.json({ ok: false, error: "User already exists" });
    }

    db.run(
      `INSERT INTO users (name, email, department, password)
       VALUES (?, ?, ?, ?)`,
      [name, email, department, password],
      function (err) {
        if (err) {
          return res.json({ ok: false, error: err.message });
        }

        db.get("SELECT * FROM users WHERE user_id = ?", [this.lastID], (err, newUser) => {
          res.json({ ok: true, data: newUser });
        });
      }
    );
  });
});


//  LOGIN
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, user) => {
      if (!user) {
        return res.json({ ok: false, error: "Invalid email or password" });
      }

      res.json({ ok: true, data: user });
    }
  );
});



// USERS


app.get('/api/users', (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    res.json({ ok: true, data: rows });
  });
});

app.get('/api/users/:id', (req, res) => {
  db.get("SELECT * FROM users WHERE user_id = ?", [req.params.id], (err, row) => {
    res.json({ ok: true, data: row });
  });
});



// RESOURCES


app.get('/api/resources', (req, res) => {
  db.all("SELECT * FROM resources", [], (err, rows) => {
    res.json({ ok: true, data: rows });
  });
});

app.post('/api/resources', (req, res) => {
  const { name, category, owner_id, location, max_duration, description } = req.body;

  db.run(
    `INSERT INTO resources (name, category, owner_id, location, max_duration, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, category, owner_id, location, max_duration, description],
    function (err) {
      if (err) return res.json({ ok: false, error: err.message });

      db.get("SELECT * FROM resources WHERE resource_id = ?", [this.lastID], (err, row) => {
        res.json({ ok: true, data: row });
      });
    }
  );
});

app.delete('/api/resources/:id', (req, res) => {
  db.run("DELETE FROM resources WHERE resource_id = ?", [req.params.id], function () {
    res.json({ ok: true });
  });
});



// REQUESTS


app.get('/api/requests', (req, res) => {
  db.all("SELECT * FROM requests", [], (err, rows) => {
    res.json({ ok: true, data: rows });
  });
});

app.post('/api/requests', (req, res) => {
  const { resource_id, borrower_id, duration_days, note } = req.body;

  db.get("SELECT owner_id FROM resources WHERE resource_id = ?", [resource_id], (err, resource) => {
    const owner_id = resource.owner_id;

    db.run(
      `INSERT INTO requests (resource_id, borrower_id, owner_id, duration_days, note)
       VALUES (?, ?, ?, ?, ?)`,
      [resource_id, borrower_id, owner_id, duration_days, note],
      function (err) {
        if (err) return res.json({ ok: false, error: err.message });

        db.get("SELECT * FROM requests WHERE request_id = ?", [this.lastID], (err, row) => {
          res.json({ ok: true, data: row });
        });
      }
    );
  });
});

app.patch('/api/requests/:id', (req, res) => {
  const { status } = req.body;

  db.run(
    "UPDATE requests SET status = ? WHERE request_id = ?",
    [status, req.params.id],
    function () {
      db.get("SELECT * FROM requests WHERE request_id = ?", [req.params.id], (err, row) => {
        res.json({ ok: true, data: row });
      });
    }
  );
});



// NOTIFICATIONS


app.get('/api/notifications/:userId', (req, res) => {
  db.all(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
    [req.params.userId],
    (err, rows) => {
      res.json({ ok: true, data: rows });
    }
  );
});



// START SERVER


app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});