





const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔹 Liste des candidats
router.get('/', (req, res) => {
  const sql = `
    SELECT Candidats.*, Electeurs.nom AS electeur_nom, Elections.nom AS election_nom
    FROM Candidats
    JOIN Electeurs ON Candidats.electeur_id = Electeurs.id
    JOIN Elections ON Candidats.elections_id = Elections.id
    ORDER BY Candidats.id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erreur récupération candidats :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 🔹 Ajouter un candidat
router.post('/', (req, res) => {
  const { electeur_id, elections_id, programme } = req.body;
  if (!electeur_id || !elections_id) {
    return res.status(400).json({ error: "Champs obligatoires manquants." });
  }

  const sql = `
    INSERT INTO Candidats (electeur_id, elections_id, programme)
    VALUES (?, ?, ?)
  `;
  db.query(sql, [electeur_id, elections_id, programme], (err, result) => {
    if (err) {
      console.error("Erreur ajout candidat :", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "Candidat ajouté", id: result.insertId });
  });
});

// 🔹 Supprimer un candidat
router.delete('/:id', (req, res) => {
  db.query("DELETE FROM Candidats WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      console.error("Erreur suppression candidat :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Candidat supprimé" });
  });
});

module.exports = router;
