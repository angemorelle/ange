// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const {
  authService,
  validateLogin,
  validateRegister,
  handleValidationErrors,
  authenticateToken
} = require('../middleware/auth');

// Route de connexion
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, pwd, userType } = req.body;
    
    const result = await authService.login(email, pwd, userType);
    
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: result
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// Route d'inscription
router.post('/register', validateRegister, handleValidationErrors, async (req, res) => {
  try {
    const result = await authService.register(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: result
    });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Route de déconnexion
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      await authService.logout(token);
    }
    
    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur logout:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la déconnexion'
    });
  }
});

// Route de vérification du token
router.get('/verify', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token valide',
    user: {
      id: req.user.id,
      email: req.user.email,
      type: req.user.type,
      departement_id: req.user.departement_id
    }
  });
});

// Route de rafraîchissement du token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const { generateToken } = require('../middleware/auth');
    const newToken = generateToken(req.user, req.user.type);
    
    res.status(200).json({
      success: true,
      message: 'Token rafraîchi',
      token: newToken
    });
  } catch (error) {
    console.error('Erreur refresh:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du rafraîchissement'
    });
  }
});

module.exports = router; 