// backend/index.js
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const port = 3001;
// const db = require('/db');

app.use(cors());
app.use(express.json());

app.use('/api/elections', require('./ElectionAdminPanel/routes/elections'));
app.use('/api/utilisateurs', require('./ElectionAdminPanel/routes/utilisateurs'));
app.use('/api/postes', require('./ElectionAdminPanel/routes/postes'));
app.use('/api/departements', require('./ElectionAdminPanel/routes/departements'));
app.use('/api/electeurs', require('./ElectionAdminPanel/routes/electeurs'));
app.use('/api/superviseurs', require('./ElectionAdminPanel/routes/superviseurs'));
app.use('/api/candidats', require('./ElectionAdminPanel/routes/candidats'));
app.use('/api/login', require('./ElectionAdminPanel/routes/login'));
app.use('/api/register', require('./ElectionAdminPanel/routes/register.js'));
// app.use('/api/login', require('./ElectionAdminPanel/routes/login.js'));
// app.use('/api/login', require('./ElecteurPanel/routes/login.js'));

// app.use('/api/PostulerCandidat', require('./ElecteurPanel/routes/PostulerCandidat'));
// app.use('/api/login', require('./ElecteurPanel/routes/login.js'));


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'election_db'
});

db.connect(err => {
    if (err) throw err;
    console.log("Connected to MySQL");
});

app.get('/api/elections', (req, res) => {
    db.query("SELECT * FROM elections", (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});