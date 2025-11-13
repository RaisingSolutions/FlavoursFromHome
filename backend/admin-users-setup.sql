-- Admin users table
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (password: Nitin@2002)
INSERT INTO admin_users (username, password_hash) VALUES
('Nitin', '$2b$10$3xB5NTykiuNrsIdzuFGMIOLvNrjhET64D0LZfe/EMIJknegnIND1e');