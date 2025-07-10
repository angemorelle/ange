// backend/routes/blockchain.js
const express = require('express');
const router = express.Router();
const db = require('../ElectionAdminPanel/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Service de synchronisation blockchain
class BlockchainService {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.initialized = false;
  }

  async init() {
    try {
      // Initialisation Web3 (à adapter selon votre configuration)
      const Web3 = require('web3');
      this.web3 = new Web3(process.env.ETHEREUM_RPC_URL || 'http://localhost:7545');
      
      // Chargement du contrat
      const contractABI = require('../../ElectionContrat/build/contracts/ElectionDapp.json');
      const networkId = await this.web3.eth.net.getId();
      const deployedNetwork = contractABI.networks[networkId];
      
      if (deployedNetwork) {
        this.contract = new this.web3.eth.Contract(
          contractABI.abi,
          deployedNetwork.address
        );
        this.initialized = true;
        console.log('✅ Blockchain service initialisé');
      } else {
        console.warn('⚠️ Contrat non déployé sur ce réseau');
      }
    } catch (error) {
      console.error('❌ Erreur initialisation blockchain:', error);
    }
  }

  async syncElectionToBlockchain(electionId) {
    if (!this.initialized) {
      throw new Error('Service blockchain non initialisé');
    }

    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Elections WHERE id = ?';
      db.query(sql, [electionId], async (err, results) => {
        if (err || results.length === 0) {
          return reject(new Error('Élection non trouvée'));
        }

        const election = results[0];
        
        try {
          // Obtenir les comptes disponibles
          const accounts = await this.web3.eth.getAccounts();
          
          // Ajouter l'élection à la blockchain
          const receipt = await this.contract.methods
            .addElection(election.nom)
            .send({ from: accounts[0], gas: 300000 });

          // Obtenir l'ID blockchain de l'élection
          const blockchainElectionId = await this.contract.methods
            .electionsCount()
            .call();

          // Mettre à jour la DB avec l'ID blockchain
          const updateSql = 'UPDATE Elections SET blockchain_id = ? WHERE id = ?';
          db.query(updateSql, [blockchainElectionId, electionId], (updateErr) => {
            if (updateErr) {
              return reject(updateErr);
            }

            // Enregistrer la synchronisation
            this.recordSync('Elections', electionId, blockchainElectionId, receipt.transactionHash, receipt.blockNumber);
            
            resolve({
              blockchainId: blockchainElectionId,
              txHash: receipt.transactionHash,
              blockNumber: receipt.blockNumber
            });
          });
        } catch (blockchainError) {
          reject(blockchainError);
        }
      });
    });
  }

  async voteOnBlockchain(bulletinData) {
    if (!this.initialized) {
      throw new Error('Service blockchain non initialisé');
    }

    const { electeur_id, elections_id, candidat_id } = bulletinData;

    return new Promise((resolve, reject) => {
      // Vérifier les IDs blockchain
      const sql = `
        SELECT 
          e.blockchain_id as election_blockchain_id,
          c.blockchain_id as candidat_blockchain_id,
          el.blockchain_address
        FROM Elections e
        JOIN Candidats c ON c.elections_id = e.id AND c.id = ?
        JOIN Electeurs el ON el.id = ?
        WHERE e.id = ?
      `;
      
      db.query(sql, [candidat_id, electeur_id, elections_id], async (err, results) => {
        if (err || results.length === 0) {
          return reject(new Error('Données de vote invalides'));
        }

        const voteData = results[0];
        
        if (!voteData.election_blockchain_id || !voteData.candidat_blockchain_id) {
          return reject(new Error('Élection ou candidat non synchronisé'));
        }

        try {
          const accounts = await this.web3.eth.getAccounts();
          
          // Voter sur la blockchain
          const receipt = await this.contract.methods
            .vote(voteData.election_blockchain_id, voteData.candidat_blockchain_id)
            .send({ 
              from: voteData.blockchain_address || accounts[0], 
              gas: 200000 
            });

          resolve({
            txHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber
          });
        } catch (blockchainError) {
          reject(blockchainError);
        }
      });
    });
  }

  recordSync(tableName, recordId, blockchainId, txHash, blockNumber) {
    const sql = `
      INSERT INTO Blockchain_Sync 
      (table_name, record_id, blockchain_id, tx_hash, block_number, sync_status)
      VALUES (?, ?, ?, ?, ?, 'synced')
    `;
    
    db.query(sql, [tableName, recordId, blockchainId, txHash, blockNumber], (err) => {
      if (err) {
        console.error('Erreur enregistrement sync:', err);
      }
    });
  }
}

// Instance globale du service
const blockchainService = new BlockchainService();
blockchainService.init();

// Voter sur la blockchain
router.post('/vote', authenticateToken, async (req, res) => {
  try {
    const { elections_id, candidat_id } = req.body;
    const electeur_id = req.user.id;

    // Vérifier si l'électeur a déjà voté
    const checkVoteSql = 'SELECT id FROM Bulletin WHERE electeur_id = ? AND elections_id = ?';
    
    db.query(checkVoteSql, [electeur_id, elections_id], async (err, existing) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Erreur serveur' });
      }

      if (existing.length > 0) {
        return res.status(400).json({ success: false, error: 'Vous avez déjà voté' });
      }

      try {
        // Voter sur la blockchain
        const blockchainResult = await blockchainService.voteOnBlockchain({
          electeur_id, elections_id, candidat_id
        });

        // Enregistrer le vote dans la DB
        const insertVoteSql = `
          INSERT INTO Bulletin (electeur_id, elections_id, candidat_id, blockchain_tx_hash)
          VALUES (?, ?, ?, ?)
        `;
        
        db.query(insertVoteSql, [electeur_id, elections_id, candidat_id, blockchainResult.txHash], (insertErr) => {
          if (insertErr) {
            console.error('Erreur sauvegarde vote:', insertErr);
            return res.status(500).json({ success: false, error: 'Erreur sauvegarde' });
          }

          res.json({
            success: true,
            message: 'Vote enregistré avec succès',
            data: blockchainResult
          });
        });
      } catch (voteError) {
        res.status(500).json({
          success: false,
          error: 'Erreur lors du vote: ' + voteError.message
        });
      }
    });
  } catch (error) {
    console.error('Erreur vote blockchain:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 