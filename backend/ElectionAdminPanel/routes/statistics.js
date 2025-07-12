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

// 🔹 Résultats détaillés d'une élection
router.get('/elections/:electionId/results', (req, res) => {
  const electionId = parseInt(req.params.electionId);
  
  if (!electionId) {
    return res.status(400).json({
      success: false,
      error: 'ID d\'élection invalide'
    });
  }

  const queries = {
    // Informations de l'élection
    election: `
      SELECT 
        e.id,
        e.nom,
        e.description,
        e.date_ouverture,
        e.date_fermeture,
        e.status,
        p.nom as poste_nom,
        p.description as poste_description,
        TIMESTAMPDIFF(HOUR, NOW(), e.date_fermeture) as heures_restantes,
        CASE 
          WHEN NOW() < e.date_ouverture THEN 'À venir'
          WHEN NOW() BETWEEN e.date_ouverture AND e.date_fermeture THEN 'En cours'
          ELSE 'Terminée'
        END as statut_temps
      FROM Elections e
      LEFT JOIN Poste p ON e.poste_id = p.id
      WHERE e.id = ?
    `,
    
    // Résultats par candidat
    candidats_results: `
      SELECT 
        c.id,
        c.programme,
        c.status as candidat_status,
        e.nom as electeur_nom,
        e.email as electeur_email,
        d.nom as departement_nom,
        COUNT(b.id) as votes_recus,
        ROUND(COUNT(b.id) * 100.0 / (
          SELECT COUNT(*) 
          FROM Bulletin 
          WHERE elections_id = ?
        ), 2) as pourcentage_votes
      FROM Candidats c
      JOIN Electeurs e ON c.electeur_id = e.id
      LEFT JOIN Departement d ON e.departement_id = d.id
      LEFT JOIN Bulletin b ON c.id = b.candidat_id
      WHERE c.elections_id = ?
      GROUP BY c.id, c.programme, c.status, e.nom, e.email, d.nom
      ORDER BY votes_recus DESC
    `,
    
    // Statistiques générales de l'élection
    stats_generales: `
      SELECT 
        COUNT(DISTINCT c.id) as total_candidats,
        COUNT(DISTINCT CASE WHEN c.status = 'approuve' THEN c.id END) as candidats_approuves,
        COUNT(DISTINCT b.id) as total_votes,
        COUNT(DISTINCT b.electeur_id) as electeurs_ont_vote,
        (
          SELECT COUNT(DISTINCT e.id) 
          FROM Electeurs e 
          WHERE e.type = 'electeur'
        ) as total_electeurs_eligibles,
        ROUND(
          COUNT(DISTINCT b.electeur_id) * 100.0 / (
            SELECT COUNT(DISTINCT e.id) 
            FROM Electeurs e 
            WHERE e.type = 'electeur'
          ), 2
        ) as taux_participation
      FROM Elections el
      LEFT JOIN Candidats c ON el.id = c.elections_id
      LEFT JOIN Bulletin b ON el.id = b.elections_id
      WHERE el.id = ?
    `,
    
    // Votes par département
    votes_par_departement: `
      SELECT 
        d.nom as departement,
        COUNT(DISTINCT e.id) as electeurs_eligibles,
        COUNT(DISTINCT b.electeur_id) as electeurs_ont_vote,
        ROUND(
          COUNT(DISTINCT b.electeur_id) * 100.0 / COUNT(DISTINCT e.id), 2
        ) as taux_participation_dept
      FROM Departement d
      LEFT JOIN Electeurs e ON d.id = e.departement_id AND e.type = 'electeur'
      LEFT JOIN Bulletin b ON e.id = b.electeur_id AND b.elections_id = ?
      GROUP BY d.id, d.nom
      HAVING electeurs_eligibles > 0
      ORDER BY taux_participation_dept DESC
    `,
    
    // Évolution des votes dans le temps (si l'élection est en cours)
    evolution_votes: `
      SELECT 
        DATE(b.vote_timestamp) as date_vote,
        HOUR(b.vote_timestamp) as heure_vote,
        COUNT(*) as votes_jour
      FROM Bulletin b
      WHERE b.elections_id = ?
      GROUP BY DATE(b.vote_timestamp), HOUR(b.vote_timestamp)
      ORDER BY date_vote DESC, heure_vote DESC
      LIMIT 48
    `
  };

  // Exécuter toutes les requêtes en parallèle
  const promises = [
    new Promise((resolve, reject) => {
      db.query(queries.election, [electionId], (err, results) => {
        if (err) {
          console.error('Erreur récupération élection:', err);
          resolve({ election: [] });
        } else {
          resolve({ election: results });
        }
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.candidats_results, [electionId, electionId], (err, results) => {
        if (err) {
          console.error('Erreur récupération résultats candidats:', err);
          resolve({ candidats_results: [] });
        } else {
          resolve({ candidats_results: results });
        }
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.stats_generales, [electionId], (err, results) => {
        if (err) {
          console.error('Erreur récupération stats générales:', err);
          resolve({ stats_generales: [] });
        } else {
          resolve({ stats_generales: results });
        }
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.votes_par_departement, [electionId], (err, results) => {
        if (err) {
          console.error('Erreur récupération votes par département:', err);
          resolve({ votes_par_departement: [] });
        } else {
          resolve({ votes_par_departement: results });
        }
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.evolution_votes, [electionId], (err, results) => {
        if (err) {
          console.error('Erreur récupération évolution votes:', err);
          resolve({ evolution_votes: [] });
        } else {
          resolve({ evolution_votes: results });
        }
      });
    })
  ];

  Promise.all(promises)
    .then(results => {
      const data = {};
      results.forEach(result => {
        Object.assign(data, result);
      });

      // Vérifier si l'élection existe
      if (!data.election || data.election.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Élection non trouvée'
        });
      }

      const election = data.election[0];
      const stats = data.stats_generales[0] || {};
      
      // Calculer le gagnant
      const candidats = data.candidats_results || [];
      const gagnant = candidats.length > 0 ? candidats[0] : null;
      
      // Calculer les métriques supplémentaires
      const totalVotes = stats.total_votes || 0;
      const tauxParticipation = stats.taux_participation || 0;
      
      const response = {
        success: true,
        data: {
          election: {
            ...election,
            peut_afficher_resultats: election.status === 'fermee' || 
                                   (election.status === 'ouverte' && election.heures_restantes <= 0)
          },
          resultats: {
            candidats: candidats,
            gagnant: gagnant,
            total_votes: totalVotes,
            taux_participation: tauxParticipation,
            stats_generales: stats,
            votes_par_departement: data.votes_par_departement || [],
            evolution_votes: data.evolution_votes || []
          }
        }
      };

      res.json(response);
    })
    .catch(error => {
      console.error('Erreur agrégation résultats:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des résultats'
      });
    });
});

module.exports = router; 