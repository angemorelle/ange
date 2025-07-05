const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔹 Lister tous les électeurs
router.get('/', (req, res) => {
  const sql = `
    SELECT Electeurs.*, Departement.nom AS departement_nom, Elections.nom AS election_nom
    FROM Electeurs
    LEFT JOIN Departement ON Electeurs.departement_id = Departement.id
    LEFT JOIN Elections ON Electeurs.elections_id = Elections.id
    ORDER BY Electeurs.id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erreur récupération électeurs :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 🔹 Ajouter un électeur
router.post('/', (req, res) => {
  const { nom, email, pwd, tel, profession, type, departement_id, elections_id } = req.body;

  const sql = `
    INSERT INTO Electeurs
    (nom, email, pwd, tel, profession, type, departement_id, elections_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [nom, email, pwd, tel, profession, type, departement_id, elections_id];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Erreur ajout électeur :", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "Électeur ajouté", id: result.insertId });
  });
});

// 🔹 Supprimer un électeur
router.delete('/:id', (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM Electeurs WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Erreur suppression électeur :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Électeur supprimé" });
  });
});

module.exports = router;
