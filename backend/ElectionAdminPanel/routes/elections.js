const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔹 Récupérer toutes les élections
router.get('/', (req, res) => {
  const sql = `
    SELECT Elections.*, Poste.nom AS poste_nom
    FROM Elections
    LEFT JOIN Poste ON Elections.poste_id = Poste.id
    ORDER BY Elections.id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erreur récupération des élections :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 🔹 Ajouter une nouvelle élection
router.post('/', (req, res) => {
  const { nom, date_ouverture, date_fermeture, poste_id } = req.body;
  if (!nom || !date_ouverture || !date_fermeture || !poste_id) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  const sql = `
    INSERT INTO Elections (nom, date_ouverture, date_fermeture, poste_id)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [nom, date_ouverture, date_fermeture, poste_id], (err, result) => {
    if (err) {
      console.error("Erreur ajout élection :", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "Élection ajoutée", id: result.insertId });
  });
});

// 🔹 Supprimer une élection
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM Elections WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Erreur suppression élection :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Élection supprimée" });
  });
});

module.exports = router;
