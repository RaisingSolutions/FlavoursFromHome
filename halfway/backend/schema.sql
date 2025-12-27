-- Users table
CREATE TABLE halfway_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Shifts table
CREATE TABLE halfway_shifts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES halfway_users(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sample admin user (password: admin123)
INSERT INTO halfway_users (username, password, name, role) 
VALUES ('admin', '$2b$10$rKvVPZqGhF8YvF8YvF8YvOqGhF8YvF8YvF8YvF8YvF8YvF8YvF8Yv', 'Admin User', 'admin');
