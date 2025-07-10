// backend/index.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configuration
const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configuration CORS sécurisée
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Configuration Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 1000, // limite par IP
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives de connexion par IP
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer plus tard',
    retryAfter: 900
  }
});

// Middlewares de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuration base de données avec pool de connexions
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'election_db',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4'
};

const db = mysql.createConnection(dbConfig);

// Gestion de la connexion DB
db.connect((err) => {
  if (err) {
    console.error('❌ Erreur connexion MySQL:', err);
    process.exit(1);
  }
  console.log('✅ Connecté à MySQL');
});

// Gestion des erreurs de connexion
db.on('error', (err) => {
  console.error('Erreur MySQL:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Reconnexion à MySQL...');
    db.connect();
  } else {
    throw err;
  }
});

// Middleware de santé de l'API
app.use('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: NODE_ENV
  });
});

// Routes d'authentification avec limitation
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes API principales
app.use('/api/auth', require('./routes/auth'));
app.use('/api/elections', require('./ElectionAdminPanel/routes/elections'));
app.use('/api/postes', require('./ElectionAdminPanel/routes/postes'));
app.use('/api/departements', require('./ElectionAdminPanel/routes/departements'));
app.use('/api/electeurs', require('./ElectionAdminPanel/routes/electeurs'));
app.use('/api/superviseurs', require('./ElectionAdminPanel/routes/superviseurs'));
app.use('/api/candidats', require('./ElectionAdminPanel/routes/candidats'));
app.use('/api/bulletins', require('./ElectionAdminPanel/routes/bulletins'));
app.use('/api/blockchain', require('./routes/blockchain'));

// Routes spécifiques aux électeurs
app.use('/api/electeur', require('./ElecteurPanel/routes/dashboard'));

// Middleware de gestion d'erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON invalide' });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Erreur de validation', 
      details: err.message 
    });
  }
  
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Données en conflit (doublon)' });
  }
  
  // Erreur générique
  res.status(500).json({ 
    error: NODE_ENV === 'production' 
      ? 'Erreur interne du serveur' 
      : err.message 
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.originalUrl 
  });
});

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu, arrêt en cours...');
  db.end(() => {
    console.log('Connexion MySQL fermée');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT reçu, arrêt en cours...');
  db.end(() => {
    console.log('Connexion MySQL fermée');
    process.exit(0);
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📊 Mode: ${NODE_ENV}`);
  console.log(`🔒 Sécurité: ${NODE_ENV === 'production' ? 'Production' : 'Développement'}`);
});

module.exports = app;