const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../../middleware/auth');

// Route placeholder pour les attributions
router.get('/', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json({
    success: true,
    message: 'Module attributions - En développement',
    data: []
  });
});

module.exports = router;
