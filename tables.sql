-- USERS
CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  department TEXT,
  trust_score INTEGER,
  total_lent INTEGER,
  total_borrowed INTEGER,
  join_date TEXT
);

-- RESOURCES
CREATE TABLE resources (
  resource_id TEXT PRIMARY KEY,
  name TEXT,
  category TEXT,
  owner_id TEXT,
  location TEXT,
  status TEXT,
  created_at TEXT
);

-- BORROW REQUESTS
CREATE TABLE borrow_requests (
  request_id TEXT PRIMARY KEY,
  resource_id TEXT,
  borrower_id TEXT,
  owner_id TEXT,
  duration_days INTEGER,
  status TEXT,
  created_at TEXT
);