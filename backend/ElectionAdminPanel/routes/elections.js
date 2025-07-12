const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const db = require('../db');
const { authenticateToken, optionalAuth, requireRole } = require('../../middleware/auth');

// Validation des données d'élection
const validateElection = [
  body('nom')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Le nom doit contenir entre 3 et 255 caractères')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La description ne peut pas dépasser 1000 caractères')
    .escape(),
  body('date_ouverture')
    .isISO8601()
    .withMessage('Date d\'ouverture invalide (format: YYYY-MM-DD HH:mm:ss)')
    .custom((value, { req }) => {
      const now = new Date();
      const openDate = new Date(value);
      if (openDate <= now) {
        throw new Error('La date d\'ouverture doit être dans le futur');
      }
      return true;
    }),
  body('date_fermeture')
    .isISO8601()
    .withMessage('Date de fermeture invalide (format: YYYY-MM-DD HH:mm:ss)')
    .custom((value, { req }) => {
      const openDate = new Date(req.body.date_ouverture);
      const closeDate = new Date(value);
      if (closeDate <= openDate) {
        throw new Error('La date de fermeture doit être postérieure à la date d\'ouverture');
      }
      return true;
    }),
  body('poste_id')
    .isInt({ min: 1 })
    .withMessage('ID du poste invalide')
    .custom(async (value) => {
      return new Promise((resolve, reject) => {
        db.query('SELECT id FROM Poste WHERE id = ?', [value], (err, results) => {
          if (err || results.length === 0) {
            reject(new Error('Le poste spécifié n\'existe pas'));
          } else {
            resolve(true);
          }
        });
      });
    })
];

const validateElectionId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID d\'élection invalide')
];

// Middleware de gestion des erreurs de validation
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

// 🔹 Récupérer toutes les élections
router.get('/', optionalAuth, (req, res) => {
  const { limit, offset, status } = req.query;
  const userId = req.user ? req.user.id : null;
  
  let sql = `
    SELECT Elections.*, 
           Poste.nom AS poste_nom,
           COUNT(DISTINCT CASE WHEN Candidats.status = 'approuve' THEN Candidats.id END) AS candidat_count,
           CASE 
             WHEN NOW() < Elections.date_ouverture THEN 'planifiee'
             WHEN NOW() BETWEEN Elections.date_ouverture AND Elections.date_fermeture THEN 'ouverte'
             ELSE 'fermee'
           END AS status,
           CASE WHEN Bulletin_User.id IS NOT NULL THEN 1 ELSE 0 END AS user_has_voted
    FROM Elections 
    LEFT JOIN Poste ON Elections.poste_id = Poste.id
    LEFT JOIN Candidats ON Elections.id = Candidats.elections_id
    LEFT JOIN Bulletin Bulletin_User ON Elections.id = Bulletin_User.elections_id AND Bulletin_User.electeur_id = ?
  `;
  
  const conditions = [];
  const params = [userId || 0]; // Si pas d'utilisateur, utiliser 0 pour ne pas matcher
  
  if (status) {
    conditions.push('Elections.statut = ?');
    params.push(status);
  }
  
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  
  sql += ' GROUP BY Elections.id, Elections.nom, Elections.description, Elections.date_ouverture, Elections.date_fermeture, Elections.poste_id, Elections.blockchain_id, Elections.status, Elections.created_at, Elections.updated_at, Poste.nom ORDER BY Elections.date_ouverture DESC';
  
  if (limit) {
    sql += ' LIMIT ?';
    params.push(parseInt(limit));
    
    if (offset) {
      sql += ' OFFSET ?';
      params.push(parseInt(offset));
    }
  }
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Erreur récupération élections:', err);
      return res.status(500).json({ 
        success: false, 
        error: err.message,
        data: []
      });
    }
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  });
});

// 🔹 Récupérer une élection spécifique
router.get('/:id', validateElectionId, handleValidationErrors, (req, res) => {
  const electionId = req.params.id;
  
  const sql = `
    SELECT 
      Elections.*,
      Poste.nom AS poste_nom,
      Poste.description AS poste_description,
      COUNT(DISTINCT Candidats.id) AS nombre_candidats,
      COUNT(DISTINCT Bulletin.id) AS nombre_votes,
      CASE 
        WHEN NOW() < Elections.date_ouverture THEN 'upcoming'
        WHEN NOW() BETWEEN Elections.date_ouverture AND Elections.date_fermeture THEN 'active'
        ELSE 'closed'
      END AS statut
    FROM Elections
    LEFT JOIN Poste ON Elections.poste_id = Poste.id
    LEFT JOIN Candidats ON Elections.id = Candidats.elections_id AND Candidats.status = 'approuve'
    LEFT JOIN Bulletin ON Elections.id = Bulletin.elections_id
    WHERE Elections.id = ?
    GROUP BY Elections.id, Poste.id
  `;

  db.query(sql, [electionId], (err, results) => {
    if (err) {
      console.error('Erreur récupération élection:', err);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération de l\'élection'
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Élection non trouvée'
      });
    }

    res.json({
      success: true,
      data: results[0]
    });
  });
});

// 🔹 Ajouter une nouvelle élection (Admin seulement)
router.post('/', 
  authenticateToken, 
  requireRole(['admin']), 
  validateElection, 
  handleValidationErrors, 
  async (req, res) => {
    try {
      const { nom, description, date_ouverture, date_fermeture, poste_id } = req.body;
      const created_by = req.user.id;

      const sql = `
        INSERT INTO Elections (nom, description, date_ouverture, date_fermeture, poste_id, created_by, status)
        VALUES (?, ?, ?, ?, ?, ?, 'planifiee')
      `;

      db.query(sql, [nom, description, date_ouverture, date_fermeture, poste_id, created_by], (err, result) => {
        if (err) {
          console.error('Erreur ajout élection:', err);
          return res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'ajout de l\'élection'
          });
        }

        // Log de l'action
        const logSql = `
          INSERT INTO Activity_Log (user_id, action, table_name, record_id, details)
          VALUES (?, 'CREATE', 'Elections', ?, ?)
        `;
        
        db.query(logSql, [
          created_by, 
          result.insertId, 
          JSON.stringify({ nom, poste_id })
        ], (logErr) => {
          if (logErr) {
            console.error('Erreur log activité:', logErr);
          }
        });

        res.status(201).json({
          success: true,
          message: 'Élection créée avec succès',
          data: {
            id: result.insertId,
            nom,
            status: 'planifiee'
          }
        });
      });
    } catch (error) {
      console.error('Erreur création élection:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }
);

// 🔹 Modifier une élection (Admin seulement, avant ouverture)
router.put('/:id',
  authenticateToken,
  requireRole(['admin']),
  validateElectionId,
  validateElection,
  handleValidationErrors,
  (req, res) => {
    const electionId = req.params.id;
    const { nom, description, date_ouverture, date_fermeture, poste_id } = req.body;

    // Vérifier que l'élection peut être modifiée
    const checkSql = `
      SELECT status, date_ouverture 
      FROM Elections 
      WHERE id = ? AND date_ouverture > NOW()
    `;

    db.query(checkSql, [electionId], (checkErr, checkResults) => {
      if (checkErr) {
        console.error('Erreur vérification élection:', checkErr);
        return res.status(500).json({
          success: false,
          error: 'Erreur serveur'
        });
      }

      if (checkResults.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Impossible de modifier une élection déjà ouverte ou fermée'
        });
      }

      const updateSql = `
        UPDATE Elections 
        SET nom = ?, description = ?, date_ouverture = ?, date_fermeture = ?, poste_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      db.query(updateSql, [nom, description, date_ouverture, date_fermeture, poste_id, electionId], (err) => {
        if (err) {
          console.error('Erreur modification élection:', err);
          return res.status(500).json({
            success: false,
            error: 'Erreur lors de la modification'
          });
        }

        // Log de l'action
        const logSql = `
          INSERT INTO Activity_Log (user_id, action, table_name, record_id, details)
          VALUES (?, 'UPDATE', 'Elections', ?, ?)
        `;
        
        db.query(logSql, [
          req.user.id, 
          electionId, 
          JSON.stringify({ nom, poste_id })
        ], (logErr) => {
          if (logErr) {
            console.error('Erreur log activité:', logErr);
          }
        });

        res.json({
          success: true,
          message: 'Élection modifiée avec succès'
        });
      });
    });
  }
);

// 🔹 Supprimer une élection (Admin seulement, avant ouverture)
router.delete('/:id',
  authenticateToken,
  requireRole(['admin']),
  validateElectionId,
  handleValidationErrors,
  (req, res) => {
    const electionId = req.params.id;

    // Vérifier que l'élection peut être supprimée
    const checkSql = `
      SELECT nom, date_ouverture 
      FROM Elections 
      WHERE id = ? AND date_ouverture > NOW()
    `;

    db.query(checkSql, [electionId], (checkErr, checkResults) => {
      if (checkErr) {
        console.error('Erreur vérification élection:', checkErr);
        return res.status(500).json({
          success: false,
          error: 'Erreur serveur'
        });
      }

      if (checkResults.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Impossible de supprimer une élection déjà ouverte ou fermée'
        });
      }

      db.query('DELETE FROM Elections WHERE id = ?', [electionId], (err) => {
        if (err) {
          console.error('Erreur suppression élection:', err);
          return res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression'
          });
        }

        // Log de l'action
        const logSql = `
          INSERT INTO Activity_Log (user_id, action, table_name, record_id, details)
          VALUES (?, 'DELETE', 'Elections', ?, ?)
        `;
        
        db.query(logSql, [
          req.user.id, 
          electionId, 
          JSON.stringify({ nom: checkResults[0].nom })
        ], (logErr) => {
          if (logErr) {
            console.error('Erreur log activité:', logErr);
          }
        });

        res.json({
          success: true,
          message: 'Élection supprimée avec succès'
        });
      });
    });
  }
);

// 🔹 Obtenir les résultats d'une élection fermée
router.get('/:id/resultats', validateElectionId, handleValidationErrors, (req, res) => {
  const electionId = req.params.id;

  // Vérifier que l'élection est fermée
  const checkSql = `
    SELECT nom, date_fermeture, status
    FROM Elections 
    WHERE id = ? AND date_fermeture < NOW()
  `;

  db.query(checkSql, [electionId], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }

    if (checkResults.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Élection non fermée ou inexistante'
      });
    }

    // Récupérer les résultats
    const resultsSql = `
      SELECT 
        c.id,
        c.nom as candidat_nom,
        c.programme,
        e.nom as electeur_nom,
        e.prenom as electeur_prenom,
        COUNT(b.id) as nombre_votes,
        ROUND((COUNT(b.id) * 100.0 / (
          SELECT COUNT(*) 
          FROM Bulletin 
          WHERE elections_id = ?
        )), 2) as pourcentage
      FROM Candidats c
      JOIN Electeurs e ON c.electeur_id = e.id
      LEFT JOIN Bulletin b ON c.id = b.candidat_id
      WHERE c.elections_id = ? AND c.status = 'approuve'
      GROUP BY c.id, c.nom, c.programme, e.nom, e.prenom
      ORDER BY nombre_votes DESC
    `;

    db.query(resultsSql, [electionId, electionId], (resultsErr, results) => {
      if (resultsErr) {
        console.error('Erreur récupération résultats:', resultsErr);
        return res.status(500).json({
          success: false,
          error: 'Erreur lors de la récupération des résultats'
        });
      }

      // Récupérer les statistiques générales
      const statsSql = `
        SELECT 
          COUNT(DISTINCT b.electeur_id) as votes_uniques,
          COUNT(b.id) as total_bulletins,
          (SELECT COUNT(*) FROM Electeurs WHERE departement_id IN (
            SELECT DISTINCT departement_id FROM Electeurs e2
            JOIN Bulletin b2 ON e2.id = b2.electeur_id
            WHERE b2.elections_id = ?
          )) as electeurs_eligibles
        FROM Bulletin b
        WHERE b.elections_id = ?
      `;

      db.query(statsSql, [electionId, electionId], (statsErr, statsResults) => {
        if (statsErr) {
          console.error('Erreur statistiques:', statsErr);
          return res.status(500).json({
            success: false,
            error: 'Erreur lors du calcul des statistiques'
          });
        }

        const stats = statsResults[0];
        const participation = stats.electeurs_eligibles > 0 
          ? ((stats.votes_uniques / stats.electeurs_eligibles) * 100).toFixed(2)
          : 0;

        res.json({
          success: true,
          data: {
            election: checkResults[0],
            candidats: results,
            statistiques: {
              ...stats,
              taux_participation: parseFloat(participation)
            }
          }
        });
      });
    });
  });
});

module.exports = router;
