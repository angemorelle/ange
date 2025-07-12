// db.js - Configuration MySQL avec variables d'environnement
require('dotenv').config();
const mysql = require('mysql');

// Configuration avec variables d'environnement
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'election_db',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4'
};

const db = mysql.createConnection(dbConfig);

// Gestion de la connexion
db.connect((err) => {
  if (err) {
    console.error('❌ Erreur connexion MySQL (db.js):', err.message);
    // Ne pas faire exit ici car c'est un module
  } else {
    console.log('✅ DB module connecté à MySQL');
  }
});

// Gestion des erreurs de connexion
db.on('error', (err) => {
  console.error('Erreur MySQL (db.js):', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Reconnexion MySQL (db.js)...');
    db.connect();
  }
});

module.exports = db;
