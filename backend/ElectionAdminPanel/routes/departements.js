const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔹 Obtenir la liste des départements
router.get('/', (req, res) => {
  const sql = "SELECT * FROM Departement ORDER BY nom ASC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des départements :", err);
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

// 🔹 Ajouter un département
router.post('/', (req, res) => {
  const { nom, code } = req.body;
  
  if (!nom) {
    return res.status(400).json({ 
      success: false, 
      error: "Le nom du département est obligatoire" 
    });
  }
  
  const sql = "INSERT INTO Departement (nom, code) VALUES (?, ?)";
  db.query(sql, [nom, code], (err, result) => {
    if (err) {
      console.error("Erreur ajout département :", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    res.status(201).json({ 
      success: true,
      message: "Département ajouté avec succès", 
      data: { id: result.insertId }
    });
  });
});

// 🔹 Supprimer un département
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ 
      success: false, 
      error: "ID département manquant" 
    });
  }
  
  db.query("DELETE FROM Departement WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erreur suppression département :", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Département non trouvé" 
      });
    }
    
    res.json({ 
      success: true,
      message: "Département supprimé avec succès" 
    });
  });
});

module.exports = router;
