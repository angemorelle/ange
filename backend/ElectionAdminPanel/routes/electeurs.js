const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔹 Lister tous les électeurs
router.get('/', (req, res) => {
  const sql = `
    SELECT Electeurs.*, Departement.nom AS departement_nom
    FROM Electeurs
    LEFT JOIN Departement ON Electeurs.departement_id = Departement.id
    ORDER BY Electeurs.id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erreur récupération électeurs :", err);
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

// 🔹 Ajouter un électeur
router.post('/', (req, res) => {
  const { nom, email, pwd, tel, profession, type, departement_id } = req.body;

  if (!nom || !email || !pwd || !departement_id) {
    return res.status(400).json({ 
      success: false, 
      error: "Champs obligatoires manquants (nom, email, mot de passe, département)" 
    });
  }

  const sql = `
    INSERT INTO Electeurs
    (nom, email, pwd, tel, profession, type, departement_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [nom, email, pwd, tel, profession, type || 'electeur', departement_id];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Erreur ajout électeur :", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.status(201).json({ 
      success: true,
      message: "Électeur ajouté avec succès", 
      data: { id: result.insertId }
    });
  });
});

// 🔹 Supprimer un électeur
router.delete('/:id', (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ 
      success: false, 
      error: "ID électeur manquant" 
    });
  }

  db.query("DELETE FROM Electeurs WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erreur suppression électeur :", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Électeur non trouvé" 
      });
    }
    
    res.json({ 
      success: true,
      message: "Électeur supprimé avec succès" 
    });
  });
});

module.exports = router;
