# 🚀 Guide de Démarrage Rapide - Système Électoral Blockchain

## ✅ Problèmes Résolus
- ❌ "Cannot find module 'web3'" → ✅ **CORRIGÉ** (Web3 v4.16.0 installé)
- ❌ "truffle: command not found" → ✅ **CORRIGÉ** (Truffle v5.11.5 installé)
- ❌ Syntaxe Web3 v4.x → ✅ **CORRIGÉ** (Nouvelle syntaxe d'import)
- ❌ Package.json corrompu → ✅ **CORRIGÉ** (Configuration propre)

## 🎯 Démarrage en Une Commande

```bash
# Démarrer tout le système automatiquement
./start-system.sh
```

**Le script automatique :**
1. 🔗 Démarre Ganache (blockchain locale)
2. 📝 Compile et déploie les smart contracts
3. 🔧 Lance le backend API (port 3001)
4. 🖥️ Lance le frontend React (port 3000)
5. 🌐 Ouvre automatiquement le navigateur

## 🛑 Arrêt du Système

```bash
# Arrêter tous les services proprement
./stop-system.sh
```

## 📊 Services Disponibles

| Service | URL | Description |
|---------|-----|-------------|
| 🖥️ **Frontend** | http://localhost:3000 | Interface utilisateur React |
| 🔧 **Backend API** | http://localhost:3001 | API REST Node.js |
| 🔗 **Blockchain** | http://localhost:7545 | Ganache (blockchain locale) |

## 🔧 Configuration Manuelle (si nécessaire)

### 1. Prérequis
```bash
# Vérifier Node.js (requis: 16+)
node --version

# Vérifier npm
npm --version

# Installer Ganache globalement (optionnel)
npm install -g ganache-cli
```

### 2. Installation Backend
```bash
cd backend
npm install

# Créer le fichier .env
cp .env.example .env
# Puis éditer backend/.env avec vos paramètres
```

### 3. Installation Frontend
```bash
cd frontend
npm install

# Configuration automatique
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env
```

### 4. Blockchain
```bash
# Démarrer Ganache
ganache-cli -p 7545 --deterministic

# Dans un autre terminal :
cd ElectionContrat
npm install
npx truffle migrate --reset

# Copier l'ABI vers le frontend
cp build/contracts/ElectionDapp.json ../frontend/src/abis/
```

## 🧪 Test de l'Installation

### Vérification Web3
```bash
cd backend
node -e "const { Web3 } = require('web3'); console.log('✅ Web3 OK');"
```

### Vérification Truffle
```bash
cd ElectionContrat
npx truffle version
```

### Vérification Ganache
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_accounts","params":[],"id":1}' \
  http://localhost:7545
```

## 🔐 Comptes de Test

**Ganache génère automatiquement 10 comptes avec 100 ETH chacun :**

```
Compte 1: 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
Compte 2: 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0
Compte 3: 0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b
...
```

## 📋 Utilisation

### 1. Interface Électeur
- **URL**: http://localhost:3000/electeur
- **Fonctionnalités**:
  - ✅ Inscription/Connexion
  - ✅ Dashboard personnalisé
  - ✅ Gestion adresse blockchain
  - ✅ Vote sécurisé
  - ✅ Historique des votes

### 2. Interface Administrateur
- **URL**: http://localhost:3000/admin
- **Fonctionnalités**:
  - ✅ Gestion des élections
  - ✅ Validation des candidatures
  - ✅ Synchronisation blockchain
  - ✅ Rapports et statistiques

### 3. API Backend
- **Base URL**: http://localhost:3001/api
- **Documentation**: [Swagger/OpenAPI à venir]
- **Authentification**: JWT Bearer Token

## 🔍 Débogage

### Logs en Temps Réel
```bash
# Voir les logs de chaque service
tail -f ganache.log      # Blockchain
tail -f backend.log      # API
tail -f frontend.log     # React
tail -f truffle.log      # Smart contracts
```

### Problèmes Courants

#### ❌ Port déjà utilisé
```bash
# Vérifier les ports occupés
lsof -i :3000,3001,7545

# Arrêter les processus
./stop-system.sh
```

#### ❌ Web3 ne se connecte pas
```bash
# Vérifier que Ganache est démarré
curl http://localhost:7545

# Redémarrer Ganache
pkill ganache-cli
ganache-cli -p 7545 --deterministic
```

#### ❌ Smart contracts non déployés
```bash
cd ElectionContrat
npx truffle migrate --reset
cp build/contracts/ElectionDapp.json ../frontend/src/abis/
```

#### ❌ Frontend ne démarre pas
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📚 Documentation Complète

- **Architecture**: [README.md](README.md)
- **Blockchain**: [BLOCKCHAIN_WALLET_IMPLEMENTATION.md](BLOCKCHAIN_WALLET_IMPLEMENTATION.md)
- **Troubleshooting**: [BLOCKCHAIN_TROUBLESHOOTING.md](BLOCKCHAIN_TROUBLESHOOTING.md)
- **Refonte**: [REFONTE_COMPLETE.md](REFONTE_COMPLETE.md)

## 🎉 Statut du Projet

**✅ SYSTÈME OPÉRATIONNEL**

- ✅ Backend Node.js + Express sécurisé
- ✅ Frontend React moderne (Material-UI)
- ✅ Smart Contracts Solidity déployés
- ✅ Intégration Web3 v4.x fonctionnelle
- ✅ Base de données MySQL configurée
- ✅ Authentification JWT sécurisée
- ✅ Gestion des adresses blockchain
- ✅ Scripts d'automatisation complets

**🚀 Prêt pour la production !**

---

**Version**: 1.0.0 - Système Stabilisé  
**Dernière mise à jour**: $(date)  
**Support**: Consultez les fichiers de documentation pour plus de détails 