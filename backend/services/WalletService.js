// backend/services/WalletService.js
const { ethers } = require('ethers');
const crypto = require('crypto');

class WalletService {
  /**
   * Génère un nouveau portefeuille Ethereum aléatoire
   * @returns {Object} {address, privateKey, mnemonic}
   */
  static generateWallet() {
    try {
      // Générer un portefeuille aléatoire
      const wallet = ethers.Wallet.createRandom();
      
      return {
        address: wallet.address,           // 0x742d35Cc6635C0532925a3b8D2FDaF2...
        privateKey: wallet.privateKey,    // Clé privée (à chiffrer avant stockage)
        mnemonic: wallet.mnemonic.phrase   // Phrase de récupération
      };
    } catch (error) {
      console.error('Erreur génération portefeuille:', error);
      throw new Error('Impossible de générer un portefeuille');
    }
  }

  /**
   * Génère un portefeuille déterministe basé sur les données utilisateur
   * @param {Object} userData - {email, nom}
   * @returns {Object} {address, privateKey}
   */
  static generateDeterministicWallet(userData) {
    try {
      const { email, nom } = userData;
      
      // Créer un seed déterministe (mais unique par utilisateur)
      const salt = process.env.JWT_SECRET || 'default-salt';
      const seed = crypto
        .createHash('sha256')
        .update(email + nom + salt)
        .digest('hex');

      // Créer un portefeuille à partir du seed
      const wallet = new ethers.Wallet(seed);
      
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        seed: seed
      };
    } catch (error) {
      console.error('Erreur génération portefeuille déterministe:', error);
      throw new Error('Impossible de générer un portefeuille déterministe');
    }
  }

  /**
   * Valide une adresse Ethereum
   * @param {string} address - Adresse à valider
   * @returns {boolean} true si l'adresse est valide
   */
  static validateAddress(address) {
    try {
      if (!address || typeof address !== 'string') {
        return false;
      }
      
      // Vérifier le format Ethereum (0x + 40 caractères hex)
      return ethers.utils.isAddress(address);
    } catch (error) {
      console.error('Erreur validation adresse:', error);
      return false;
    }
  }

  /**
   * Récupère le solde d'une adresse (nécessite un provider)
   * @param {string} address - Adresse Ethereum
   * @returns {Promise<string>} Solde en ETH
   */
  static async getBalance(address) {
    try {
      if (!this.validateAddress(address)) {
        throw new Error('Adresse invalide');
      }

      // Tenter de se connecter au provider configuré
      const providerUrl = process.env.ETHEREUM_RPC_URL || 'http://localhost:7545';
      
      let provider;
      try {
        provider = new ethers.providers.JsonRpcProvider(providerUrl);
        
        // Tester la connexion
        await provider.getNetwork();
      } catch (providerError) {
        console.warn('Provider Ethereum non disponible:', providerError.message);
        return '0.0'; // Retourner 0 si le provider n'est pas disponible
      }

      // Récupérer le solde
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.utils.formatEther(balance);
      
      return parseFloat(balanceInEth).toFixed(4);
    } catch (error) {
      console.error('Erreur récupération solde:', error);
      return '0.0'; // Retourner 0 en cas d'erreur
    }
  }

  /**
   * Génère une adresse courte pour l'affichage
   * @param {string} address - Adresse complète
   * @returns {string} Adresse tronquée
   */
  static formatAddressForDisplay(address) {
    if (!address || !this.validateAddress(address)) {
      return 'Adresse invalide';
    }
    
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  }

  /**
   * Chiffre une clé privée pour le stockage (optionnel - non recommandé)
   * @param {string} privateKey - Clé privée à chiffrer
   * @param {string} password - Mot de passe de chiffrement
   * @returns {string} Clé privée chiffrée
   */
  static encryptPrivateKey(privateKey, password) {
    try {
      const cipher = crypto.createCipher('aes256', password);
      let encrypted = cipher.update(privateKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      console.error('Erreur chiffrement clé privée:', error);
      throw new Error('Impossible de chiffrer la clé privée');
    }
  }

  /**
   * Déchiffre une clé privée (optionnel - non recommandé)
   * @param {string} encryptedPrivateKey - Clé privée chiffrée
   * @param {string} password - Mot de passe de déchiffrement
   * @returns {string} Clé privée déchiffrée
   */
  static decryptPrivateKey(encryptedPrivateKey, password) {
    try {
      const decipher = crypto.createDecipher('aes256', password);
      let decrypted = decipher.update(encryptedPrivateKey, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Erreur déchiffrement clé privée:', error);
      throw new Error('Impossible de déchiffrer la clé privée');
    }
  }

  /**
   * Génère un hash de transaction pour vérification
   * @param {Object} transactionData - Données de la transaction
   * @returns {string} Hash de la transaction
   */
  static generateTransactionHash(transactionData) {
    try {
      const dataString = JSON.stringify(transactionData, Object.keys(transactionData).sort());
      return crypto
        .createHash('sha256')
        .update(dataString)
        .digest('hex');
    } catch (error) {
      console.error('Erreur génération hash transaction:', error);
      throw new Error('Impossible de générer le hash de transaction');
    }
  }

  /**
   * Vérifie la connectivité au réseau Ethereum
   * @returns {Promise<Object>} Informations sur le réseau
   */
  static async checkNetworkConnection() {
    try {
      const providerUrl = process.env.ETHEREUM_RPC_URL || 'http://localhost:7545';
      const provider = new ethers.providers.JsonRpcProvider(providerUrl);
      
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      
      return {
        connected: true,
        network: network.name,
        chainId: network.chainId,
        blockNumber: blockNumber,
        provider: providerUrl
      };
    } catch (error) {
      console.error('Erreur connexion réseau Ethereum:', error);
      return {
        connected: false,
        error: error.message,
        provider: process.env.ETHEREUM_RPC_URL || 'http://localhost:7545'
      };
    }
  }
}

module.exports = WalletService; 