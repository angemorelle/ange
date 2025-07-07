// const express = require('express');
// const bcrypt = require('bcrypt');
// const router = express.Router();
// const db = require('../db');

// // ✅ Route de connexion (login électeur)
// router.post('/', (req, res) => {
//   const { email, pwd } = req.body;

//   const sql = `SELECT * FROM Electeurs WHERE email = ?`;

//   db.query(sql, [email], (err, results) => {
//     if (err) {
//       console.error('Erreur MySQL :', err);
//       return res.status(500).json({ error: "Erreur serveur" });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ error: "Utilisateur non trouvé" });
//     }

//     const utilisateur = results[0];

//     // Utilisation de bcrypt.compare avec .then()
//     bcrypt.compare(pwd, utilisateur.pwd)
//       .then((isMatch) => {
//         if (!isMatch) {
//           return res.status(401).json({ error: "Mot de passe incorrect" });
//         }

//         // Connexion réussie
//         res.status(200).json({
//           message: "Connexion réussie",
//           utilisateur: {
//             id: utilisateur.id,
//             nom: utilisateur.nom,
//             email: utilisateur.email,
//             tel: utilisateur.tel,
//             profession: utilisateur.profession,
//             departement_id: utilisateur.departement_id
//           }
//         });
//       })
//       .catch((err) => {
//         console.error('Erreur de comparaison bcrypt :', err);
//         res.status(500).json({ error: "Erreur interne" });
//       });
//   });
// });

// module.exports = router;

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db');

// ✅ Connexion électeur ou superviseur selon userType
router.post('/', (req, res) => {
  const { email, pwd, userType } = req.body;

  // Déterminer la table à utiliser
  let table = "";
  if (userType === "electeur") table = "Electeurs";
  else if (userType === "superviseur") table = "Superviseur";
  else return res.status(400).json({ error: "Type d'utilisateur invalide" });

  const sql = `SELECT * FROM ${table} WHERE email = ?`;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Erreur MySQL :', err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const utilisateur = results[0];

    // Comparer le mot de passe hashé
    bcrypt.compare(pwd, utilisateur.pwd)
      .then((isMatch) => {
        if (!isMatch) {
          return res.status(401).json({ error: "Mot de passe incorrect" });
        }

        // ✅ Connexion réussie
        res.status(200).json({
          message: "Connexion réussie",
          utilisateur: {
            id: utilisateur.id,
            nom: utilisateur.nom,
            email: utilisateur.email,
            tel: utilisateur.tel,
            profession: utilisateur.profession,
            departement_id: utilisateur.departement_id,
            type: userType
          }
        });
      })
      .catch((err) => {
        console.error('Erreur bcrypt :', err);
        res.status(500).json({ error: "Erreur interne" });
      });
  });
});

module.exports = router;
