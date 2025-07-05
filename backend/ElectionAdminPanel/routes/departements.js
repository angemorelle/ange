const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔹 Obtenir la liste des départements
router.get('/', (req, res) => {
  const sql = "SELECT * FROM Departement";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des départements :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 🔹 Ajouter un nouveau département
router.post('/', (req, res) => {
  const { nom } = req.body;
  if (!nom) {
    return res.status(400).json({ error: "Le nom du département est requis" });
  }

  const sql = "INSERT INTO Departement (nom) VALUES (?)";
  db.query(sql, [nom], (err, result) => {
    if (err) {
      console.error("Erreur lors de l'insertion :", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "Département ajouté", id: result.insertId });
  });
});

// 🔹 Supprimer un département
router.delete('/:id', (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM Departement WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Département supprimé" });
  });
});

module.exports = router;
