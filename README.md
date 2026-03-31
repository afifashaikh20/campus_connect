# 🎓 CampusShare — Web-Based Campus Resource Sharing System

A full-stack Node.js + SQLite + HTML/CSS/JS web application.

---

## 📁 Project Structure

```
campusshare/
├── server.js          ← Express backend (API + serial monitor logging)
├── package.json       ← Dependencies
├── tables.sql         ← SQLite schema + seed data
├── campusshare.db     ← Auto-created on first run
└── public/
    └── index.html     ← Frontend (talks to backend via fetch API)
```

---

## 🚀 Run Locally (Serial Monitor / Development)

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Start the server
```bash
npm start
```

### Step 3 — Open in browser
```
http://localhost:3000
```

### Step 4 — Watch the Serial Monitor
All API requests and responses are logged to your terminal in colour:

```
[2025-01-10 14:32:01] ▶ POST  /api/login
  body   → { email: 'afifa@jhu.edu', password: '••••••' }
  ◀ 200  { ok: true, data: { user_id: 'u-001', name: 'Shaikh Afifa', ... } }

[2025-01-10 14:32:05] ▶ GET   /api/resources
  ◀ 200  [{ resource_id: 'r-001', name: 'Lab Coat', ... }, ...]

[2025-01-10 14:32:12] ▶ POST  /api/requests
  body   → { resource_id: 'r-003', borrower_id: 'u-001', duration_days: 2 }
  ◀ 200  { request_id: 'req-...', status: 'pending', ... }
```

---

## 🔑 Demo Accounts

| Email | Password |
|-------|----------|
| afifa@jhu.edu | 123456 |
| farha@jhu.edu | 123456 |
| maaz@jhu.edu  | 123456 |
| ilham@jhu.edu | 123456 |
| asna@jhu.edu  | 123456 |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/login | Log in |
| POST | /api/register | Create account |
| GET | /api/users | All users |
| GET | /api/users/:id | One user |
| GET | /api/resources | All resources (supports ?category=&status=&q=) |
| POST | /api/resources | Add a resource |
| DELETE | /api/resources/:id | Remove a resource |
| GET | /api/requests | All requests (supports ?borrower_id=&owner_id=&status=) |
| POST | /api/requests | Submit borrow request |
| PATCH | /api/requests/:id | Update status: approved / rejected / returned |
| GET | /api/notifications/:userId | Notifications for a user |
| PATCH | /api/notifications/:id/read | Mark notification as read |
| GET | /api/trust-log/:userId | Trust score history |

---

## ☁️ Hosting on Render (Free)

1. Push your project to a GitHub repository
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Set environment: `Node`
7. Click **Deploy**

> ⚠️ Render's free tier uses ephemeral storage — the SQLite database resets on each deploy.  
> For a persistent database on Render, use their **PostgreSQL** addon or switch to **Railway**.

## ☁️ Hosting on Railway (Recommended — Persistent DB)

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Railway auto-detects Node.js
4. Your app is live with a public URL in ~2 minutes
5. The SQLite file persists on Railway's volume storage

## ☁️ Hosting on Vercel (Serverless — needs DB change)

Vercel doesn't support persistent file storage. You would need to replace SQLite  
with a cloud DB like PlanetScale or Supabase for Vercel deployment.

---

## 🗄️ Database

The SQLite database is auto-initialised from `tables.sql` on first run.  
It includes 5 users, 8 resources, 3 borrow requests, 5 notifications and trust score logs.

To reset the database:
```bash
rm campusshare.db
npm start
```
