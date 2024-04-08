DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email_address VARCHAR(255),
  password VARCHAR(255)
);

DROP TABLE IF EXISTS properties CASCADE;

CREATE TABLE properties(
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  thumbnail_url VARCHAR(255),
  cover_url VARCHAR(255),
  cost_per_night INTEGER,
  parking_spaces SMALLINT,
  bathrooms SMALLINT,
  bedrooms SMALLINT,
  country VARCHAR(255),
  street VARCHAR(255),
  city VARCHAR(255),
  province VARCHAR(255),
  postal_code VARCHAR(255),
  is_active BOOLEAN DEFAULT true
);