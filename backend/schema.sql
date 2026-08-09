CREATE DATABASE IF NOT EXISTS studentdb;
USE studentdb;

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    course VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO students (name, email, course, age)
VALUES
('Rahul Sharma', 'rahul@example.com', 'Computer Science', 22),
('Priya Singh', 'priya@example.com', 'Information Technology', 21)
ON DUPLICATE KEY UPDATE email = email;
