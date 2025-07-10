// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const db = require('../ElectionAdminPanel/db');
const WalletService = require('../services/WalletService');

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

// Génération de token JWT
const generateToken = (user, userType) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      type: userType,
      departement_id: user.departement_id
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré' });
    }
    req.user = user;
    next();
  });
};

// Middleware d'autorisation par rôle
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    if (!allowedRoles.includes(req.user.type)) {
      return res.status(403).json({ error: 'Permissions insuffisantes' });
    }

    next();
  };
};

// Middleware de validation des entrées
const validateRegister = [
  body('nom')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('pwd')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre'),
  body('tel')
    .optional()
    .isMobilePhone('fr-FR')
    .withMessage('Numéro de téléphone invalide'),
  body('departement_id')
    .isInt({ min: 1 })
    .withMessage('Département invalide')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('pwd')
    .notEmpty()
    .withMessage('Mot de passe requis'),
  body('userType')
    .isIn(['electeur', 'superviseur'])
    .withMessage('Type d\'utilisateur invalide')
];

// Middleware de gestion des erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Données invalides',
      details: errors.array()
    });
  }
  next();
};

// Service d'authentification
const authService = {
  async login(email, password, userType) {
    try {
      // Déterminer la table à utiliser
      const table = userType === 'electeur' ? 'Electeurs' : 'Superviseur';
      
      const sql = `SELECT * FROM ${table} WHERE email = ? AND is_active = TRUE`;
      
      return new Promise((resolve, reject) => {
        db.query(sql, [email], async (err, results) => {
          if (err) {
            reject(new Error('Erreur serveur'));
            return;
          }

          if (results.length === 0) {
            reject(new Error('Utilisateur non trouvé ou inactif'));
            return;
          }

          const user = results[0];

          // Vérification du mot de passe
          const isMatch = await bcrypt.compare(password, user.pwd);
          if (!isMatch) {
            reject(new Error('Mot de passe incorrect'));
            return;
          }

          // Génération du token
          const token = generateToken(user, userType);

          // Enregistrement de la session
          const sessionSql = `
            INSERT INTO User_Sessions (user_id, user_type, session_token, expires_at)
            VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))
          `;
          
          db.query(sessionSql, [user.id, userType, token], (sessionErr) => {
            if (sessionErr) {
              console.error('Erreur enregistrement session:', sessionErr);
            }
          });

          resolve({
            token,
            user: {
              id: user.id,
              nom: user.nom,
              email: user.email,
              tel: user.tel,
              profession: user.profession,
              departement_id: user.departement_id,
              type: userType
            }
          });
        });
      });
    } catch (error) {
      throw error;
    }
  },

  async register(userData) {
    try {
      const { nom, email, pwd, tel, profession, departement_id } = userData;

      // Vérification email unique
      const checkEmailSql = 'SELECT id FROM Electeurs WHERE email = ?';
      
      return new Promise(async (resolve, reject) => {
        db.query(checkEmailSql, [email], async (err, results) => {
          if (err) {
            reject(new Error('Erreur serveur'));
            return;
          }

          if (results.length > 0) {
            reject(new Error('Email déjà utilisé'));
            return;
          }

          try {
            // Hachage du mot de passe
            const hashedPwd = await bcrypt.hash(pwd, 12);

            // Génération automatique d'une adresse blockchain
            const wallet = WalletService.generateDeterministicWallet({ email, nom });
            const blockchainAddress = wallet.address;

            // Enregistrement de l'électeur avec son adresse blockchain
            const insertSql = `
              INSERT INTO Electeurs (nom, email, pwd, tel, profession, departement_id, blockchain_address)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(insertSql, [nom, email, hashedPwd, tel, profession, departement_id, blockchainAddress], (insertErr, result) => {
              if (insertErr) {
                console.error('Erreur insertion électeur:', insertErr);
                reject(new Error('Erreur lors de l\'inscription'));
                return;
              }

              // Log de l'activité
              const activitySql = `
                INSERT INTO Activity_Log (user_id, user_type, action, details, ip_address)
                VALUES (?, 'electeur', 'registration', ?, ?)
              `;
              
              const details = JSON.stringify({
                nom,
                email,
                departement_id,
                blockchain_address: blockchainAddress
              });

              db.query(activitySql, [result.insertId, details, ''], (logErr) => {
                if (logErr) {
                  console.error('Erreur log activité:', logErr);
                }
              });

              resolve({
                id: result.insertId,
                message: 'Inscription réussie',
                blockchain_address: blockchainAddress,
                wallet_info: {
                  address: wallet.address,
                  // Note: On ne retourne PAS la clé privée pour des raisons de sécurité
                  // L'utilisateur devra utiliser son mot de passe pour récupérer sa clé privée si nécessaire
                }
              });
            });
          } catch (walletError) {
            console.error('Erreur génération portefeuille:', walletError);
            reject(new Error('Erreur lors de la génération du portefeuille blockchain'));
          }
        });
      });
    } catch (error) {
      throw error;
    }
  },

  async logout(token) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM User_Sessions WHERE session_token = ?';
      db.query(sql, [token], (err) => {
        if (err) {
          reject(new Error('Erreur lors de la déconnexion'));
          return;
        }
        resolve({ message: 'Déconnexion réussie' });
      });
    });
  }
};

// Middleware de nettoyage des sessions expirées
const cleanExpiredSessions = () => {
  const sql = 'DELETE FROM User_Sessions WHERE expires_at < NOW()';
  db.query(sql, (err) => {
    if (err) {
      console.error('Erreur nettoyage sessions:', err);
    }
  });
};

// Nettoyage automatique toutes les heures
setInterval(cleanExpiredSessions, 60 * 60 * 1000);

module.exports = {
  generateToken,
  authenticateToken,
  requireRole,
  validateRegister,
  validateLogin,
  handleValidationErrors,
  authService,
  cleanExpiredSessions
}; 