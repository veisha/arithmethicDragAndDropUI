require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

app.use(express.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', // Set in .env if needed
    database: process.env.DB_NAME || 'MathGame_user_auth'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

//save-score endpoint
app.post('/save-score', (req, res) => {
    const { userId, difficulty, type, score, timeTaken } = req.body;

    if (!userId || !difficulty || !type || !score || !timeTaken) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const query = `
        INSERT INTO scores (user_id, difficulty, type, score, time_taken)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [userId, difficulty, type, score, timeTaken], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Failed to save score' });
        }
        res.status(200).json({ message: 'Score saved successfully' });
    });
});

// Register Endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
            if (err) return res.status(500).json({ message: 'Error registering user' });
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login Endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

        // Return both the token and the userId
        console.log("USER ID SENT", user.id);
        res.json({ message: 'Login successful', token, userId: user.id });
    });
});

// Leaderboard Endpoint
app.get('/leaderboard', (req, res) => {
    const { difficulty, type } = req.query; // Optional filtering parameters

    let query = `
        SELECT users.username, scores.difficulty, scores.type, scores.score, 
               SEC_TO_TIME(scores.time_taken) AS formatted_time 
        FROM scores 
        JOIN users ON scores.user_id = users.id
    `;

    const params = [];
    if (difficulty || type) {
        query += " WHERE ";
        if (difficulty) {
            query += "scores.difficulty = ?";
            params.push(difficulty);
        }
        if (difficulty && type) {
            query += " AND ";
        }
        if (type) {
            query += "scores.type = ?";
            params.push(type);
        }
    }

    query += " ORDER BY scores.score DESC, scores.time_taken ASC"; // Sort by best score

    db.query(query, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Failed to fetch leaderboard' });
        }
        res.json(results);
    });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
