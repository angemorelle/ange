// backend/ElecteurPanel/routes/dashboard.js
const express = require('express');
const router = express.Router();
const db = require('../../ElectionAdminPanel/db');
const { authenticateToken } = require('../../middleware/auth');
const WalletService = require('../../services/WalletService');

// Route pour récupérer les informations du dashboard
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer les informations de l'électeur
    const electeurSql = `
      SELECT e.*, d.nom as departement_nom
      FROM Electeurs e
      LEFT JOIN Departement d ON e.departement_id = d.id
      WHERE e.id = ?
    `;
    
    db.query(electeurSql, [userId], (err, electeurResults) => {
      if (err) {
        console.error('Erreur récupération électeur:', err);
        return res.status(500).json({ success: false, error: 'Erreur serveur' });
      }
      
      if (electeurResults.length === 0) {
        return res.status(404).json({ success: false, error: 'Électeur non trouvé' });
      }
      
      const electeur = electeurResults[0];
      
      // Récupérer les statistiques
      const statsSql = `
        SELECT
          (SELECT COUNT(*) FROM Bulletin WHERE electeur_id = ?) as votes_effectues,
          (SELECT COUNT(*) FROM Candidats WHERE electeur_id = ?) as candidatures_total,
          (SELECT COUNT(*) FROM Candidats WHERE electeur_id = ? AND statut = 'approuve') as candidatures_approuvees,
          (SELECT COUNT(*) FROM Elections WHERE status = 'ouverte') as elections_actives,
          (SELECT COUNT(*) FROM Elections) as elections_total
      `;
      
      db.query(statsSql, [userId, userId, userId], (statsErr, statsResults) => {
        if (statsErr) {
          console.error('Erreur récupération statistiques:', statsErr);
          return res.status(500).json({ success: false, error: 'Erreur serveur' });
        }
        
        const stats = statsResults[0];
        const tauxParticipation = stats.elections_total > 0 
          ? Math.round((stats.votes_effectues / stats.elections_total) * 100) 
          : 87;
        
        res.json({
          success: true,
          data: {
            electeur: {
              id: electeur.id,
              nom: electeur.nom,
              email: electeur.email,
              tel: electeur.tel,
              profession: electeur.profession,
              departement_nom: electeur.departement_nom,
              blockchain_address: electeur.blockchain_address,
              created_at: electeur.created_at
            },
            stats: {
              votes_effectues: stats.votes_effectues,
              candidatures_total: stats.candidatures_total,
              candidatures_approuvees: stats.candidatures_approuvees,
              elections_actives: stats.elections_actives,
              elections_total: stats.elections_total,
              taux_participation: tauxParticipation
            }
          }
        });
      });
    });
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Route pour récupérer les informations blockchain
router.get('/blockchain-info', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔍 Récupération blockchain info pour user ID:', userId);
    
    const sql = 'SELECT id, nom, email, blockchain_address FROM Electeurs WHERE id = ?';
    db.query(sql, [userId], async (err, results) => {
      if (err) {
        console.error('❌ Erreur récupération blockchain:', err);
        return res.status(500).json({ success: false, error: 'Erreur serveur' });
      }
      
      console.log('📊 Résultats DB pour blockchain info:', results);
      
      if (results.length === 0) {
        console.log('❌ Électeur non trouvé pour ID:', userId);
        return res.status(404).json({ success: false, error: 'Électeur non trouvé' });
      }
      
      const electeur = results[0];
      console.log('👤 Données électeur:', {
        id: electeur.id,
        nom: electeur.nom,
        email: electeur.email,
        blockchain_address: electeur.blockchain_address
      });
      
      if (electeur.blockchain_address) {
        console.log('✅ Adresse blockchain trouvée:', electeur.blockchain_address);
        
        // Récupérer le solde
        const balance = await WalletService.getBalance(electeur.blockchain_address);
        console.log('💰 Solde récupéré:', balance);
        
        res.json({
          success: true,
          data: {
            address: electeur.blockchain_address,
            balance: balance,
            formatted_address: WalletService.formatAddressForDisplay(electeur.blockchain_address),
            valid: WalletService.validateAddress(electeur.blockchain_address)
          }
        });
      } else {
        console.log('❌ Pas d\'adresse blockchain pour cet électeur');
        res.json({
          success: true,
          data: {
            address: null,
            balance: '0.0000',
            formatted_address: null,
            valid: false
          }
        });
      }
    });
  } catch (error) {
    console.error('❌ Erreur blockchain info:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Route pour générer une adresse blockchain
router.post('/generate-blockchain-address', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Vérifier si l'électeur a déjà une adresse
    const checkSql = 'SELECT blockchain_address FROM Electeurs WHERE id = ?';
    db.query(checkSql, [userId], async (err, results) => {
      if (err) {
        console.error('Erreur vérification adresse:', err);
        return res.status(500).json({ success: false, error: 'Erreur serveur' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ success: false, error: 'Électeur non trouvé' });
      }
      
      const electeur = results[0];
      
      if (electeur.blockchain_address) {
        return res.status(400).json({ 
          success: false, 
          error: 'Une adresse blockchain existe déjà pour cet électeur' 
        });
      }
      
      try {
        // Récupérer les informations de l'électeur pour générer l'adresse
        const electeurInfoSql = 'SELECT nom, email FROM Electeurs WHERE id = ?';
        db.query(electeurInfoSql, [userId], async (infoErr, infoResults) => {
          if (infoErr || infoResults.length === 0) {
            return res.status(500).json({ success: false, error: 'Erreur récupération informations' });
          }
          
          const userData = infoResults[0];
          
          // Générer l'adresse blockchain
          const wallet = WalletService.generateDeterministicWallet(userData);
          
          // Mettre à jour la base de données
          const updateSql = 'UPDATE Electeurs SET blockchain_address = ? WHERE id = ?';
          db.query(updateSql, [wallet.address, userId], async (updateErr) => {
            if (updateErr) {
              console.error('Erreur mise à jour adresse:', updateErr);
              return res.status(500).json({ success: false, error: 'Erreur sauvegarde' });
            }
            
            // Récupérer le solde initial
            const balance = await WalletService.getBalance(wallet.address);
            
            res.json({
              success: true,
              message: 'Adresse blockchain générée avec succès',
              data: {
                address: wallet.address,
                balance: balance,
                formatted_address: WalletService.formatAddressForDisplay(wallet.address),
                valid: true
              }
            });
          });
        });
      } catch (walletError) {
        console.error('Erreur génération wallet:', walletError);
        res.status(500).json({ 
          success: false, 
          error: 'Erreur lors de la génération de l\'adresse blockchain' 
        });
      }
    });
  } catch (error) {
    console.error('Erreur génération adresse blockchain:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Route pour récupérer l'activité récente
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const sql = `
      SELECT 
        'vote' as type,
        e.nom as election_nom,
        b.created_at,
        'Vote enregistré' as action,
        CONCAT('Vote pour l\'élection ', e.nom) as description
      FROM Bulletin b
      JOIN Elections e ON b.elections_id = e.id
      WHERE b.electeur_id = ?
      
      UNION
      
      SELECT 
        'candidature' as type,
        e.nom as election_nom,
        c.created_at,
        'Candidature soumise' as action,
        CONCAT('Candidature pour l\'élection ', e.nom) as description
      FROM Candidats c
      JOIN Elections e ON c.elections_id = e.id
      WHERE c.electeur_id = ?
      
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    db.query(sql, [userId, userId], (err, results) => {
      if (err) {
        console.error('Erreur récupération activité:', err);
        return res.status(500).json({ success: false, error: 'Erreur serveur' });
      }
      
      const activities = results.map(activity => ({
        type: activity.type,
        title: activity.action,
        description: activity.description,
        time: activity.created_at,
        election: activity.election_nom
      }));
      
      res.json({
        success: true,
        data: activities
      });
    });
  } catch (error) {
    console.error('Erreur activité:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router; 