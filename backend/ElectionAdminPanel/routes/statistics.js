const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔹 Statistiques générales du dashboard
router.get('/dashboard', (req, res) => {
  const queries = {
    // Statistiques des élections par statut
    elections: `
      SELECT 
        status,
        COUNT(*) as count
      FROM Elections 
      GROUP BY status
      ORDER BY count DESC
    `,
    
    // Statistiques des candidats par statut
    candidats: `
      SELECT 
        status,
        COUNT(*) as count
      FROM Candidats 
      GROUP BY status
    `,
    
    // Statistiques des électeurs par type
    electeurs: `
      SELECT 
        type,
        COUNT(*) as count,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as actifs
      FROM Electeurs 
      GROUP BY type
    `,
    
    // Statistiques des départements
    departements: `
      SELECT 
        COUNT(DISTINCT d.id) as total_departements,
        COUNT(DISTINCT e.id) as electeurs_total,
        AVG(electeurs_par_dept.count) as moyenne_electeurs_par_dept
      FROM Departement d
      LEFT JOIN Electeurs e ON d.id = e.departement_id
      LEFT JOIN (
        SELECT departement_id, COUNT(*) as count 
        FROM Electeurs 
        GROUP BY departement_id
      ) electeurs_par_dept ON d.id = electeurs_par_dept.departement_id
    `,
    
    // Élections actives et à venir
    elections_actives: `
      SELECT 
        id,
        nom,
        date_ouverture,
        date_fermeture,
        CASE 
          WHEN NOW() < date_ouverture THEN 'À venir'
          WHEN NOW() BETWEEN date_ouverture AND date_fermeture THEN 'En cours'
          ELSE 'Terminée'
        END as statut_temps,
        (SELECT COUNT(*) FROM Candidats WHERE elections_id = Elections.id AND status = 'approuve') as candidats_approuves,
        (SELECT COUNT(*) FROM Bulletin WHERE elections_id = Elections.id) as votes_recus
      FROM Elections 
      WHERE date_fermeture >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY date_ouverture DESC
      LIMIT 10
    `,
    
    // Statistiques des votes
    votes: `
      SELECT 
        COUNT(*) as total_votes,
        COUNT(DISTINCT electeur_id) as electeurs_ont_vote,
        COUNT(DISTINCT elections_id) as elections_avec_votes
      FROM Bulletin
    `,
    
    // Statistiques des superviseurs (table séparée)
    superviseurs: `
      SELECT 
        COUNT(*) as total_superviseurs,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as superviseurs_actifs
      FROM Superviseur
    `
  };

  // Exécuter toutes les requêtes en parallèle
  const promises = Object.keys(queries).map(key => {
    return new Promise((resolve, reject) => {
      db.query(queries[key], (err, results) => {
        if (err) {
          console.error(`Erreur requête ${key}:`, err);
          resolve({ [key]: [] });
        } else {
          resolve({ [key]: results });
        }
      });
    });
  });

  Promise.all(promises)
    .then(results => {
      const stats = {};
      results.forEach(result => {
        Object.assign(stats, result);
      });

      // Calculer des métriques supplémentaires
      const electeursTotal = stats.electeurs.reduce((sum, item) => sum + item.count, 0);
      const electionsTotal = stats.elections.reduce((sum, item) => sum + item.count, 0);
      const candidatsTotal = stats.candidats.reduce((sum, item) => sum + item.count, 0);

      const response = {
        success: true,
        data: {
          resume: {
            total_elections: electionsTotal,
            total_candidats: candidatsTotal,
            total_electeurs: electeursTotal,
            total_votes: stats.votes[0]?.total_votes || 0,
            taux_participation: electeursTotal > 0 ? 
              ((stats.votes[0]?.electeurs_ont_vote || 0) / electeursTotal * 100).toFixed(1) : 0
          },
          elections: {
            par_statut: stats.elections,
            actives_et_a_venir: stats.elections_actives,
            total: electionsTotal
          },
          candidats: {
            par_statut: stats.candidats,
            total: candidatsTotal
          },
          electeurs: {
            par_type: stats.electeurs,
            total: electeursTotal,
            actifs: stats.electeurs.reduce((sum, item) => sum + item.actifs, 0)
          },
          departements: stats.departements[0] || {
            total_departements: 0,
            electeurs_total: 0,
            moyenne_electeurs_par_dept: 0
          },
          votes: {
            ...stats.votes[0],
            taux_participation_globale: electeursTotal > 0 ? 
              ((stats.votes[0]?.electeurs_ont_vote || 0) / electeursTotal * 100).toFixed(1) : 0
          },
          superviseurs: stats.superviseurs[0] || {
            total_superviseurs: 0,
            superviseurs_actifs: 0
          }
        }
      };

      res.json(response);
    })
    .catch(error => {
      console.error('Erreur agrégation statistiques:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des statistiques'
      });
    });
});

// 🔹 Statistiques détaillées par période
router.get('/dashboard/period/:days', (req, res) => {
  const days = parseInt(req.params.days) || 30;
  
  const query = `
    SELECT 
      DATE(created_at) as date,
      'election' as type,
      COUNT(*) as count
    FROM Elections 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY DATE(created_at)
    
    UNION ALL
    
    SELECT 
      DATE(created_at) as date,
      'candidat' as type,
      COUNT(*) as count
    FROM Candidats 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY DATE(created_at)
    
    UNION ALL
    
    SELECT 
      DATE(created_at) as date,
      'electeur' as type,
      COUNT(*) as count
    FROM Electeurs 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY DATE(created_at)
    
    ORDER BY date DESC
  `;

  db.query(query, [days, days, days], (err, results) => {
    if (err) {
      console.error('Erreur statistiques période:', err);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des statistiques par période'
      });
    }

    res.json({
      success: true,
      data: results,
      period: `${days} derniers jours`
    });
  });
});

// 🔹 Top départements par activité
router.get('/departements/top', (req, res) => {
  const query = `
    SELECT 
      d.nom as departement,
      COUNT(DISTINCT e.id) as nombre_electeurs,
      COUNT(DISTINCT c.id) as nombre_candidats,
      COUNT(DISTINCT el.id) as nombre_elections_avec_candidats,
      COUNT(DISTINCT b.id) as nombre_votes
    FROM Departement d
    LEFT JOIN Electeurs e ON d.id = e.departement_id
    LEFT JOIN Candidats c ON e.id = c.electeur_id
    LEFT JOIN Elections el ON c.elections_id = el.id
    LEFT JOIN Bulletin b ON e.id = b.electeur_id
    GROUP BY d.id, d.nom
    HAVING nombre_electeurs > 0
    ORDER BY (nombre_electeurs + nombre_candidats + nombre_votes) DESC
    LIMIT 10
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur top départements:', err);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération du classement des départements'
      });
    }

    res.json({
      success: true,
      data: results
    });
  });
});

// 🔹 Statistiques des élections en cours
router.get('/elections/current', (req, res) => {
  const query = `
    SELECT 
      e.id,
      e.nom,
      e.date_ouverture,
      e.date_fermeture,
      p.nom as poste_nom,
      COUNT(DISTINCT c.id) as candidats_total,
      COUNT(DISTINCT CASE WHEN c.status = 'approuve' THEN c.id END) as candidats_approuves,
      COUNT(DISTINCT b.id) as votes_recus,
      COUNT(DISTINCT b.electeur_id) as electeurs_ont_vote,
      TIMESTAMPDIFF(HOUR, NOW(), e.date_fermeture) as heures_restantes
    FROM Elections e
    LEFT JOIN Poste p ON e.poste_id = p.id
    LEFT JOIN Candidats c ON e.id = c.elections_id
    LEFT JOIN Bulletin b ON e.id = b.elections_id
    WHERE NOW() BETWEEN e.date_ouverture AND e.date_fermeture
    GROUP BY e.id, e.nom, e.date_ouverture, e.date_fermeture, p.nom
    ORDER BY e.date_fermeture ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur élections en cours:', err);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des élections en cours'
      });
    }

    res.json({
      success: true,
      data: results
    });
  });
});

module.exports = router; 