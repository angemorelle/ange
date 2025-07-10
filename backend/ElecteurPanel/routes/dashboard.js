// backend/ElecteurPanel/routes/dashboard.js
const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const db = require('../../ElectionAdminPanel/db');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const WalletService = require('../../services/WalletService');

// Middleware de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Erreurs de validation',
      details: errors.array()
    });
  }
  next();
};

// 🔹 Dashboard principal de l'électeur
router.get('/dashboard', authenticateToken, requireRole(['electeur']), (req, res) => {
  const electeurId = req.user.id;

  // Récupérer les informations de l'électeur
  const electeurSql = `
    SELECT 
      e.*,
      d.nom as departement_nom,
      COUNT(DISTINCT c.id) as candidatures_actives,
      COUNT(DISTINCT b.id) as votes_effectues
    FROM Electeurs e
    LEFT JOIN Departement d ON e.departement_id = d.id
    LEFT JOIN Candidats c ON e.id = c.electeur_id AND c.statut = 'approuve'
    LEFT JOIN Bulletin b ON e.id = b.electeur_id
    WHERE e.id = ?
    GROUP BY e.id, d.id
  `;

  db.query(electeurSql, [electeurId], (err, electeurResults) => {
    if (err) {
      console.error('Erreur récupération électeur:', err);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des données'
      });
    }

    if (electeurResults.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Électeur non trouvé'
      });
    }

    const electeur = electeurResults[0];

    // Récupérer les élections disponibles
    const electionsSql = `
      SELECT 
        e.*,
        p.nom as poste_nom,
        COUNT(DISTINCT c.id) as nombre_candidats,
        CASE 
          WHEN EXISTS(SELECT 1 FROM Bulletin WHERE electeur_id = ? AND elections_id = e.id) THEN 1
          ELSE 0
        END as a_vote,
        CASE 
          WHEN NOW() < e.date_ouverture THEN 'upcoming'
          WHEN NOW() BETWEEN e.date_ouverture AND e.date_fermeture THEN 'active'
          ELSE 'closed'
        END AS statut
      FROM Elections e
      LEFT JOIN Poste p ON e.poste_id = p.id
      LEFT JOIN Candidats c ON e.id = c.elections_id AND c.statut = 'approuve'
      WHERE e.date_fermeture >= CURDATE() - INTERVAL 30 DAY
      GROUP BY e.id, p.id
      ORDER BY 
        CASE 
          WHEN NOW() BETWEEN e.date_ouverture AND e.date_fermeture THEN 1
          WHEN NOW() < e.date_ouverture THEN 2
          ELSE 3
        END,
        e.date_ouverture ASC
      LIMIT 10
    `;

    db.query(electionsSql, [electeurId], (electionsErr, electionsResults) => {
      if (electionsErr) {
        console.error('Erreur récupération élections:', electionsErr);
        return res.status(500).json({
          success: false,
          error: 'Erreur lors de la récupération des élections'
        });
      }

      res.json({
        success: true,
        data: {
          electeur: {
            id: electeur.id,
            nom: electeur.nom,
            prenom: electeur.prenom,
            email: electeur.email,
            departement: electeur.departement_nom,
            candidatures_actives: electeur.candidatures_actives,
            votes_effectues: electeur.votes_effectues
          },
          elections: electionsResults
        }
      });
    });
  });
});

// 🔹 Informations blockchain de l'électeur
router.get('/blockchain-info', authenticateToken, requireRole(['electeur']), (req, res) => {
  const electeurId = req.user.id;

  const sql = `
    SELECT 
      blockchain_address,
      nom,
      email,
      created_at
    FROM Electeurs 
    WHERE id = ?
  `;

  db.query(sql, [electeurId], async (err, results) => {
    if (err) {
      console.error('Erreur récupération blockchain info:', err);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des informations blockchain'
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Électeur non trouvé'
      });
    }

    const electeur = results[0];

    try {
      // Récupérer le solde de l'adresse (si disponible)
      let balance = '0.0';
      if (electeur.blockchain_address) {
        balance = await WalletService.getBalance(electeur.blockchain_address);
      }

      res.json({
        success: true,
        data: {
          blockchain_address: electeur.blockchain_address,
          balance: balance,
          address_valid: WalletService.validateAddress(electeur.blockchain_address || ''),
          info: {
            nom: electeur.nom,
            email: electeur.email,
            inscription_date: electeur.created_at
          }
        }
      });
    } catch (blockchainErr) {
      console.error('Erreur vérification blockchain:', blockchainErr);
      res.json({
        success: true,
        data: {
          blockchain_address: electeur.blockchain_address,
          balance: '0.0',
          address_valid: WalletService.validateAddress(electeur.blockchain_address || ''),
          info: {
            nom: electeur.nom,
            email: electeur.email,
            inscription_date: electeur.created_at
          },
          warning: 'Impossible de vérifier le solde blockchain'
        }
      });
    }
  });
});

// 🔹 Générer une nouvelle adresse blockchain (si l'électeur n'en a pas)
router.post('/generate-blockchain-address', authenticateToken, requireRole(['electeur']), (req, res) => {
  const electeurId = req.user.id;

  // Vérifier si l'électeur a déjà une adresse
  const checkSql = `SELECT blockchain_address, nom, email FROM Electeurs WHERE id = ?`;

  db.query(checkSql, [electeurId], (err, results) => {
    if (err) {
      console.error('Erreur vérification électeur:', err);
      return res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Électeur non trouvé'
      });
    }

    const electeur = results[0];

    if (electeur.blockchain_address) {
      return res.status(400).json({
        success: false,
        error: 'L\'électeur possède déjà une adresse blockchain',
        current_address: electeur.blockchain_address
      });
    }

    try {
      // Générer une nouvelle adresse
      const wallet = WalletService.generateDeterministicWallet({
        email: electeur.email,
        nom: electeur.nom
      });

      // Mettre à jour la base de données
      const updateSql = `UPDATE Electeurs SET blockchain_address = ? WHERE id = ?`;

      db.query(updateSql, [wallet.address, electeurId], (updateErr) => {
        if (updateErr) {
          console.error('Erreur mise à jour adresse:', updateErr);
          return res.status(500).json({
            success: false,
            error: 'Erreur lors de la sauvegarde de l\'adresse'
          });
        }

        // Log de l'activité
        const activitySql = `
          INSERT INTO Activity_Log (user_id, user_type, action, details, ip_address)
          VALUES (?, 'electeur', 'blockchain_address_generated', ?, ?)
        `;
        
        const details = JSON.stringify({
          blockchain_address: wallet.address,
          generated_at: new Date().toISOString()
        });

        db.query(activitySql, [electeurId, details, req.ip || ''], (logErr) => {
          if (logErr) {
            console.error('Erreur log activité:', logErr);
          }
        });

        res.status(201).json({
          success: true,
          message: 'Adresse blockchain générée avec succès',
          data: {
            blockchain_address: wallet.address,
            generated_at: new Date().toISOString()
          }
        });
      });
    } catch (walletError) {
      console.error('Erreur génération adresse:', walletError);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération de l\'adresse blockchain'
      });
    }
  });
});

module.exports = router; 