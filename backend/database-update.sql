-- Drop existing tables and recreate with simple integer IDs
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;

-- Categories table with simple integer ID
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table with simple integer ID
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  weight VARCHAR(50),
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Rice', 'Premium quality rice varieties from India'),
('Lentils', 'Fresh dal and pulses');

-- Insert sample products
INSERT INTO products (name, description, price, category_id, weight, stock_quantity) VALUES
-- Rice varieties
('Basmati Rice Premium', 'Long grain aromatic basmati rice', 15.99, 1, '5kg', 50),
('Jasmine Rice', 'Fragrant Thai jasmine rice', 12.99, 1, '5kg', 40),
('Brown Rice Organic', 'Healthy organic brown rice', 18.99, 1, '5kg', 30),
-- Lentil varieties
('Moong Dal', 'Yellow split lentils', 6.99, 2, '1kg', 75),
('Masoor Dal', 'Red split lentils', 7.49, 2, '1kg', 60);