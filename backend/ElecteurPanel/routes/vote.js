const express = require('express');
const router = express.Router();
const db = require('../../ElectionAdminPanel/db');
const { authenticateToken } = require('../../middleware/auth');

// Route pour récupérer les candidats d'une élection pour voter
router.get('/candidates/:electionId', authenticateToken, (req, res) => {
  try {
    const { electionId } = req.params;
    const userId = req.user.id;

    // Vérifier si l'utilisateur a déjà voté
    const checkVoteSql = 'SELECT id FROM Bulletin WHERE electeur_id = ? AND elections_id = ?';
    
    db.query(checkVoteSql, [userId, electionId], (err, voteResults) => {
      if (err) {
        console.error('Erreur vérification vote:', err);
        return res.status(500).json({ success: false, error: 'Erreur serveur' });
      }

      if (voteResults.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Vous avez déjà voté pour cette élection' 
        });
      }

      // Récupérer les candidats de l'élection
      const candidatsSql = `
        SELECT 
          c.id,
          c.programme,
          c.statut,
          e.nom as electeur_nom,
          e.email as electeur_email,
          el.nom as election_nom,
          el.description as election_description
        FROM Candidats c
        JOIN Electeurs e ON c.electeur_id = e.id
        JOIN Elections el ON c.elections_id = el.id
        WHERE c.elections_id = ? AND c.statut = 'approuve'
        ORDER BY c.id ASC
      `;

      db.query(candidatsSql, [electionId], (candidatsErr, candidatsResults) => {
        if (candidatsErr) {
          console.error('Erreur récupération candidats:', candidatsErr);
          return res.status(500).json({ success: false, error: 'Erreur serveur' });
        }

        res.json({
          success: true,
          data: candidatsResults
        });
      });
    });
  } catch (error) {
    console.error('Erreur candidats pour vote:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Route pour soumettre un vote
router.post('/submit', authenticateToken, (req, res) => {
  try {
    const { electionId, candidatId } = req.body;
    const userId = req.user.id;

    if (!electionId || !candidatId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Paramètres manquants (electionId, candidatId)' 
      });
    }

    // Vérifier si l'utilisateur a déjà voté
    const checkVoteSql = 'SELECT id FROM Bulletin WHERE electeur_id = ? AND elections_id = ?';
    
    db.query(checkVoteSql, [userId, electionId], (err, voteResults) => {
      if (err) {
        console.error('Erreur vérification vote:', err);
        return res.status(500).json({ success: false, error: 'Erreur serveur' });
      }

      if (voteResults.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Vous avez déjà voté pour cette élection' 
        });
      }

      // Vérifier que l'élection est active
      const checkElectionSql = 'SELECT id, status FROM Elections WHERE id = ? AND status = "ouverte"';
      
      db.query(checkElectionSql, [electionId], (electionErr, electionResults) => {
        if (electionErr) {
          console.error('Erreur vérification élection:', electionErr);
          return res.status(500).json({ success: false, error: 'Erreur serveur' });
        }

        if (electionResults.length === 0) {
          return res.status(400).json({ 
            success: false, 
            error: 'Élection non trouvée ou fermée' 
          });
        }

        // Vérifier que le candidat existe et est approuvé
        const checkCandidatSql = 'SELECT id FROM Candidats WHERE id = ? AND elections_id = ? AND statut = "approuve"';
        
        db.query(checkCandidatSql, [candidatId, electionId], (candidatErr, candidatResults) => {
          if (candidatErr) {
            console.error('Erreur vérification candidat:', candidatErr);
            return res.status(500).json({ success: false, error: 'Erreur serveur' });
          }

          if (candidatResults.length === 0) {
            return res.status(400).json({ 
              success: false, 
              error: 'Candidat non trouvé ou non approuvé' 
            });
          }

          // Enregistrer le vote
          const insertVoteSql = `
            INSERT INTO Bulletin (electeur_id, elections_id, candidat_id, created_at)
            VALUES (?, ?, ?, NOW())
          `;

          db.query(insertVoteSql, [userId, electionId, candidatId], (insertErr, result) => {
            if (insertErr) {
              console.error('Erreur insertion vote:', insertErr);
              return res.status(500).json({ success: false, error: 'Erreur lors de l\'enregistrement du vote' });
            }

            res.json({
              success: true,
              message: 'Vote enregistré avec succès',
              data: {
                voteId: result.insertId,
                timestamp: new Date().toISOString()
              }
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Erreur soumission vote:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Route pour vérifier si l'utilisateur a voté pour une élection
router.get('/check/:electionId', authenticateToken, (req, res) => {
  try {
    const { electionId } = req.params;
    const userId = req.user.id;

    const checkSql = `
      SELECT 
        b.id,
        b.created_at,
        c.programme,
        e.nom as candidat_nom
      FROM Bulletin b
      JOIN Candidats c ON b.candidat_id = c.id
      JOIN Electeurs e ON c.electeur_id = e.id
      WHERE b.electeur_id = ? AND b.elections_id = ?
    `;

    db.query(checkSql, [userId, electionId], (err, results) => {
      if (err) {
        console.error('Erreur vérification vote:', err);
        return res.status(500).json({ success: false, error: 'Erreur serveur' });
      }

      if (results.length > 0) {
        const vote = results[0];
        res.json({
          success: true,
          data: {
            hasVoted: true,
            voteDate: vote.created_at,
            candidatName: vote.candidat_nom
          }
        });
      } else {
        res.json({
          success: true,
          data: {
            hasVoted: false
          }
        });
      }
    });
  } catch (error) {
    console.error('Erreur vérification vote:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router; 