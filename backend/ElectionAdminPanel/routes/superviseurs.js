const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔹 Lister tous les superviseurs
router.get('/', (req, res) => {
  const sql = `
    SELECT Superviseur.*, Departement.nom AS departement_nom
    FROM Superviseur
    LEFT JOIN Departement ON Superviseur.departement_id = Departement.id
    ORDER BY Superviseur.id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erreur récupération superviseurs :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 🔹 Ajouter un superviseur
router.post('/', (req, res) => {
  const { nom, email, pwd, tel, profession, departement_id } = req.body;

  const sql = `
    INSERT INTO Superviseur (nom, email, pwd, tel, profession, departement_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [nom, email, pwd, tel, profession, departement_id];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Erreur ajout superviseur :", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "Superviseur ajouté", id: result.insertId });
  });
});

// 🔹 Supprimer un superviseur
router.delete('/:id', (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM Superviseur WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Erreur suppression superviseur :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Superviseur supprimé" });
  });
});

module.exports = router;
