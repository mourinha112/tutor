-- Full schema for Sakae Tutor
-- Run in phpMyAdmin or mysql client

CREATE DATABASE IF NOT EXISTS sakae_tutor FULL TEXT; -- ensure existence
USE sakae_tutor;

-- Users
CREATE TABLE IF NOT EXISTS users (
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

-- Lessons (catalog)
CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  is_locked TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-Lesson progress
CREATE TABLE IF NOT EXISTS user_lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  progress INT DEFAULT 0,
  completed TINYINT(1) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Achievements catalog
CREATE TABLE IF NOT EXISTS achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  icon VARCHAR(64) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  achievement_id INT NOT NULL,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

-- Seed lessons
INSERT INTO lessons (title, description, is_locked) VALUES
('Básico 1', 'Saudações e apresentações', 0),
('Saudações', 'Como cumprimentar pessoas', 1),
('Família', 'Vocabulário de família', 1),
('Números', 'Números e contagem', 1);

-- Seed achievements
INSERT INTO achievements (title, icon, description) VALUES
('Primeira Lição', '🎯', 'Completou a primeira lição'),
('Sequência de 3', '🔥', 'Manter sequência de 3 dias'),
('Estudioso', '📚', 'Completar 10 lições'),
('Campeão', '👑', 'Alcançar 5000 XP');

-- Optional: create a demo user with password '123456' (generate hash in PHP)
-- Em PHP: <?php echo password_hash('123456', PASSWORD_DEFAULT); ?>
-- INSERT INTO users (name, email, password_hash, level, xp, streak)
-- VALUES ('Demo User', 'demo@example.com', '<HASH>', 'Iniciante', 420, 7);
