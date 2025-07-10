// backend/config/environment.js
require('dotenv').config();

const config = {
  // Configuration de la base de données
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'election_db',
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    charset: 'utf8mb4'
  },

  // Configuration JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production-must-be-at-least-32-chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // Configuration du serveur
  server: {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  // Configuration blockchain
  blockchain: {
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'http://localhost:7545',
    networkId: process.env.ETHEREUM_NETWORK_ID || 5777
  },

  // Configuration CORS
  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  },

  // Configuration de sécurité
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5
  },

  // Configuration email (optionnel)
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || ''
  },

  // Configuration de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  }
};

// Validation de la configuration en production
if (config.server.nodeEnv === 'production') {
  const requiredEnvVars = [
    'DB_PASSWORD',
    'JWT_SECRET',
    'ETHEREUM_RPC_URL'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Variables d\'environnement manquantes en production:', missingVars);
    process.exit(1);
  }

  // Vérifier la longueur de la clé JWT
  if (config.jwt.secret.length < 32) {
    console.error('❌ JWT_SECRET doit contenir au moins 32 caractères en production');
    process.exit(1);
  }
}

module.exports = config; 