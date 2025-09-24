-- Simple MySQL schema for Sakae Tutor
-- Run in phpMyAdmin or mysql client

CREATE DATABASE IF NOT EXISTS sakae_tutor DEFAULT CHARACTER SET = 'utf8mb4' COLLATE = 'utf8mb4_unicode_ci';
USE sakae_tutor;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(512) DEFAULT NULL,
  level ENUM('Iniciante','Intermediário','Avançado') DEFAULT 'Iniciante',
  xp INT DEFAULT 0,
  streak INT DEFAULT 0,
  join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example seed user (password = 123456) - generate a hashed password with PHP before inserting
-- Em PHP: <?php echo password_hash('123456', PASSWORD_DEFAULT); ?>
-- Replace <HASHED_PASSWORD> with the generated hash or create user via phpMyAdmin UI
-- INSERT INTO users (name, email, password_hash, level, xp, streak)
-- VALUES ('Demo User', 'demo@example.com', '<HASHED_PASSWORD>', 'Iniciante', 420, 7);
