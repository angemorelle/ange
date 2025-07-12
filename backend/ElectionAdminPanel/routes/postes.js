const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔹 Lister tous les postes
router.get('/', (req, res) => {
  const sql = "SELECT * FROM Poste ORDER BY nom ASC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des postes :", err);
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

// 🔹 Ajouter un poste
router.post('/', (req, res) => {
  const { nom, description } = req.body;
  
  if (!nom) {
    return res.status(400).json({ 
      success: false, 
      error: "Le nom du poste est obligatoire" 
    });
  }
  
  const sql = "INSERT INTO Poste (nom, description) VALUES (?, ?)";
  db.query(sql, [nom, description], (err, result) => {
    if (err) {
      console.error("Erreur ajout poste :", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.status(201).json({ 
      success: true,
      message: "Poste ajouté avec succès", 
      data: { id: result.insertId }
    });
  });
});

// 🔹 Supprimer un poste
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ 
      success: false, 
      error: "ID poste manquant" 
    });
  }
  
  db.query("DELETE FROM Poste WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erreur suppression poste :", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Poste non trouvé" 
      });
    }
    
    res.json({ 
      success: true,
      message: "Poste supprimé avec succès" 
    });
  });
});

module.exports = router;
