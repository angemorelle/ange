const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
// const db = require('../config/db');
const db = require('../../ElectionAdminPanel/db');

// POST /api/electeurs/register
router.post('/', async (req, res) => {
  try {
    const { nom, email, pwd, tel, profession, departement_id } = req.body;

    // Hash du mot de passe
    const hashedPwd = await bcrypt.hash(pwd, 10); // 10 = nombre de "salt rounds"

    const sql = `
      INSERT INTO Electeurs (nom, email, pwd, tel, profession, departement_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [nom, email, hashedPwd, tel, profession, departement_id], (err, result) => {
      if (err) {
        console.error('Erreur MySQL :', err);
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({ message: "Inscription réussie", id: result.insertId });
    });
  } catch (error) {
    console.error('Erreur lors du hash ou de l’insertion :', error);
    res.status(500).json({ error: "Une erreur est survenue lors de l’inscription." });
  }
});

module.exports = router;

// const express = require('express');
// const bcrypt = require('bcrypt');
// const router = express.Router();
// // const db = require('../config/db');
// const db = require('../../ElectionAdminPanel/db');

// // ✅ Route d'inscription (register)
// router.post('/register', async (req, res) => {
//   try {
//     const { nom, email, pwd, tel, profession, departement_id } = req.body;

//     // Hachage du mot de passe
//     const hashedPwd = await bcrypt.hash(pwd, 10); // 10 = nombre de salt rounds

//     const sql = `
//       INSERT INTO Electeurs (nom, email, pwd, tel, profession, departement_id)
//       VALUES (?, ?, ?, ?, ?, ?)
//     `;

//     db.query(sql, [nom, email, hashedPwd, tel, profession, departement_id], (err, result) => {
//       if (err) {
//         console.error('Erreur MySQL :', err);
//         return res.status(500).json({ error: err.message });
//       }

//       res.status(201).json({ message: "Inscription réussie", id: result.insertId });
//     });
//   } catch (error) {
//     console.error('Erreur lors de l’inscription :', error);
//     res.status(500).json({ error: "Une erreur est survenue lors de l’inscription." });
//   }
// });

// // ✅ Route de connexion (login)
// router.post('/login', (req, res) => {
//   const { email, pwd } = req.body;

//   // Rechercher l'utilisateur
//   const sql = `SELECT * FROM Electeurs WHERE email = ?`;
//   db.query(sql, [email], async (err, results) => {
//     if (err) {
//       console.error('Erreur MySQL :', err);
//       return res.status(500).json({ error: "Erreur serveur" });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ error: "Utilisateur non trouvé" });
//     }

//     const utilisateur = results[0];

//     // Vérification du mot de passe
//     const isMatch = await bcrypt.compare(pwd, utilisateur.pwd);
//     if (!isMatch) {
//       return res.status(401).json({ error: "Mot de passe incorrect" });
//     }

//     // Connexion réussie
//     res.status(200).json({
//       message: "Connexion réussie",
//       utilisateur: {
//         id: utilisateur.id,
//         nom: utilisateur.nom,
//         email: utilisateur.email,
//         tel: utilisateur.tel,
//         profession: utilisateur.profession,
//         departement_id: utilisateur.departement_id
//       }
//     });
//   });
// });

// module.exports = router;
