const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Voter pour un candidat
router.post('/', (req, res) => {
  const { electeur_id, elections_id, candidat_id } = req.body;

  const checkQuery = `
    SELECT * FROM Bulletin WHERE electeur_id = ? AND elections_id = ?
  `;
  db.query(checkQuery, [electeur_id, elections_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });

    if (result.length > 0) {
      return res.status(400).json({ error: "Vous avez déjà voté à cette élection." });
    }

    const insertQuery = `
      INSERT INTO Bulletin (electeur_id, elections_id, candidat_id)
      VALUES (?, ?, ?)
    `;
    db.query(insertQuery, [electeur_id, elections_id, candidat_id], (err2) => {
      if (err2) return res.status(500).json({ error: "Erreur lors de l’enregistrement du vote" });
      res.status(200).json({ message: "Vote enregistré avec succès." });
    });
  });
});

module.exports = router;
