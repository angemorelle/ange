const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔹 Lister tous les postes
router.get('/', (req, res) => {
  db.query("SELECT * FROM Poste", (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des postes :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 🔹 Ajouter un poste
router.post('/', (req, res) => {
  const { nom } = req.body;
  if (!nom) return res.status(400).json({ error: "Le nom du poste est requis" });

  db.query("INSERT INTO Poste (nom) VALUES (?)", [nom], (err, result) => {
    if (err) {
      console.error("Erreur lors de l’ajout :", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "Poste ajouté", id: result.insertId });
  });
});

// 🔹 Supprimer un poste
router.delete('/:id', (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM Poste WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Poste supprimé" });
  });
});

module.exports = router;
