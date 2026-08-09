require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'UP', database: 'CONNECTED' });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      database: 'NOT_CONNECTED',
      error: error.message
    });
  }
});

app.get('/api/students', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, course, age, created_at FROM students ORDER BY id DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, course, age, created_at FROM students WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/students', async (req, res) => {
  const { name, email, course, age } = req.body;

  if (!name || !email || !course || age === undefined) {
    return res.status(400).json({
      message: 'name, email, course and age are required'
    });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO students (name, email, course, age) VALUES (?, ?, ?, ?)',
      [name, email, course, age]
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, course, age, created_at FROM students WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  const { name, email, course, age } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE students SET name = ?, email = ?, course = ?, age = ? WHERE id = ?',
      [name, email, course, age, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, course, age, created_at FROM students WHERE id = ?',
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM students WHERE id = ?',
      [req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Serve the compiled Angular application from the same container.
const frontendPath = path.join(__dirname, 'public');
app.use(express.static(frontendPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`Student application running on port ${port}`);
});
