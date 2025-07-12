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

// 🔹 Ajouter un superviseur
router.post('/', (req, res) => {
  const { nom, email, pwd, tel, profession, departement_id } = req.body;

  if (!nom || !email || !pwd || !departement_id) {
    return res.status(400).json({ 
      success: false, 
      error: "Champs obligatoires manquants (nom, email, mot de passe, département)" 
    });
  }

  const sql = `
    INSERT INTO Superviseur (nom, email, pwd, tel, profession, departement_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [nom, email, pwd, tel, profession, departement_id];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Erreur ajout superviseur :", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.status(201).json({ 
      success: true,
      message: "Superviseur ajouté avec succès", 
      data: { id: result.insertId }
    });
  });
});

// 🔹 Supprimer un superviseur
router.delete('/:id', (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ 
      success: false, 
      error: "ID superviseur manquant" 
    });
  }

  db.query("DELETE FROM Superviseur WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erreur suppression superviseur :", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Superviseur non trouvé" 
      });
    }
    
    res.json({ 
      success: true,
      message: "Superviseur supprimé avec succès" 
    });
  });
});

module.exports = router;
