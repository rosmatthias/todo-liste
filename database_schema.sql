-- SQL Schema für die To-Do Liste Datenbank

CREATE DATABASE IF NOT EXISTS todo_app;
USE todo_app;

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT UNIQUE NOT NULL,
    task_text VARCHAR(255) NOT NULL,
    task_type ENUM('predefined', 'custom') NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index für bessere Performance
CREATE INDEX idx_task_id ON tasks(task_id);
CREATE INDEX idx_completed ON tasks(completed);
