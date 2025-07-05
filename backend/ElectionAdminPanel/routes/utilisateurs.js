const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔹 Obtenir tous les électeurs
router.get('/', (req, res) => {
  const sql = "SELECT * FROM electeurs";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des électeurs :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 🔹 Ajouter un nouvel électeur
router.post('/', (req, res) => {
  const { nom, email, pwd, tel, profession, type, departement_id, elections_id } = req.body;
  const sql = `
    INSERT INTO electeurs 
    (nom, email, pwd, tel, profession, type, departement_id, elections_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [nom, email, pwd, tel, profession, type, departement_id, elections_id];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de l'insertion :", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "Électeur ajouté", id: result.insertId });
  });
});

// 🔹 Supprimer un électeur
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM electeurs WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Électeur supprimé" });
  });
});

// 🔹 Mettre à jour un électeur (optionnel)
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { nom, email, tel, profession, type, departement_id, elections_id } = req.body;
  const sql = `
    UPDATE Electeurs SET nom=?, email=?, tel=?, profession=?, type=?, departement_id=?, elections_id=?
    WHERE id=?
  `;
  const values = [nom, email, tel, profession, type, departement_id, elections_id, id];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de la mise à jour :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Électeur mis à jour" });
  });
});

module.exports = router;
