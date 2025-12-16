const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Apka MySQL username
    password: 'password', // Apka MySQL password
    database: 'my_app'
});

// Database connect karein
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL Database.');
});

// HTML serve karein
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

// Data insert karne ka route
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    
    db.query(sql, [username, email, password], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.send("Email already exists!");
            }
            throw err;
        }
        res.send(`<h1>Success!</h1><p>User ${username} saved to database.</p>`);
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
