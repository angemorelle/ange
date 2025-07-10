# 🗳️ Système Électoral Blockchain - Refonte Architecturale

## 📋 Vue d'Ensemble

Ce projet implémente un **système électoral décentralisé** moderne combinant une application web sécurisée avec la technologie blockchain. La refonte architecturale complète assure une sécurité, une performance et une maintenabilité optimales.

## 🏗️ Architecture

### Structure du Projet
```
ange/
├── backend/                 # API Node.js/Express sécurisée
│   ├── config/             # Configuration d'environnement
│   ├── middleware/         # Middlewares d'authentification et sécurité
│   ├── routes/            # Routes API centralisées
│   ├── ElectionAdminPanel/ # Routes d'administration
│   └── ElecteurPanel/     # Routes des électeurs
├── frontend/               # Application React moderne
│   ├── src/
│   │   ├── components/    # Composants React réutilisables
│   │   │   ├── auth/      # Composants d'authentification
│   │   │   ├── admin/     # Interface d'administration
│   │   │   ├── electeur/  # Interface électeur
│   │   │   └── common/    # Composants partagés
│   │   └── services/      # Services API avec Axios
├── ElectionContrat/        # Smart Contracts Solidity
├── database/              # Schémas et migrations SQL
└── docs/                  # Documentation
```

## 🔧 Technologies Utilisées

### Backend
- **Node.js 16+** & **Express.js** - Serveur API REST
- **MySQL** - Base de données relationnelle
- **JWT** - Authentification sécurisée
- **bcrypt** - Hachage des mots de passe
- **express-validator** - Validation des données
- **helmet** - Sécurité HTTP
- **express-rate-limit** - Protection DDoS

### Frontend
- **React 18** - Interface utilisateur moderne
- **Material-UI 5** - Composants UI élégants
- **React Router 6** - Routage SPA
- **Axios** - Client HTTP
- **React Hook Form** - Gestion des formulaires
- **React Query** - Cache et synchronisation des données

### Blockchain
- **Solidity** - Smart Contracts
- **Truffle** - Framework de développement
- **Web3.js** - Intégration blockchain
- **Ganache** - Blockchain de développement

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 16+ et npm 8+
- MySQL 8.0+
- Git

### 1. Cloner le Projet
```bash
git clone <repository-url>
cd ange
```

### 2. Configuration Backend

#### Installation des dépendances
```bash
cd backend
npm install
```

#### Configuration de la base de données
```bash
# Créer la base de données
mysql -u root -p
CREATE DATABASE election_db;
USE election_db;
SOURCE ../database/schema.sql;
```

#### Variables d'environnement
Créer un fichier `.env` dans `backend/`:
```env
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=election_db

# JWT
JWT_SECRET=votre-clé-secrète-très-longue-et-sécurisée-32-caractères-minimum
JWT_EXPIRES_IN=24h

# Serveur
PORT=3001
NODE_ENV=development

# Blockchain
ETHEREUM_RPC_URL=http://localhost:7545
ETHEREUM_NETWORK_ID=5777

# Sécurité
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5
```

#### Démarrer le serveur backend
```bash
npm run dev
```

### 3. Configuration Frontend

#### Installation des dépendances
```bash
cd ../frontend
npm install
```

#### Variables d'environnement
Créer un fichier `.env` dans `frontend/`:
```env
REACT_APP_API_URL=http://localhost:3001/api
```

#### Démarrer l'application frontend
```bash
npm start
```

### 4. Configuration Blockchain

#### Installation et démarrage Ganache
```bash
# Installer Ganache CLI globalement
npm install -g ganache-cli

# Démarrer Ganache
ganache-cli -p 7545 -h 0.0.0.0 --deterministic
```

#### Déploiement des Smart Contracts
```bash
cd ../ElectionContrat
npm install
truffle migrate --reset
```

## 🔐 Sécurité Implémentée

### Authentification et Autorisation
- **JWT** avec expiration automatique
- **Hachage bcrypt** des mots de passe (12 rounds)
- **Middleware de vérification** des rôles
- **Protection CSRF** et XSS

### Sécurité API
- **Rate limiting** (100 req/15min global, 5 req/15min auth)
- **Helmet.js** pour les headers de sécurité
- **CORS** configuré selon l'environnement
- **Validation stricte** des entrées avec express-validator

### Sécurité Base de Données
- **Requêtes préparées** (protection injection SQL)
- **Schéma normalisé** avec contraintes d'intégrité
- **Indexation optimisée** pour les performances
- **Audit trail** avec Activity_Log

## 📱 Fonctionnalités

### Interface Électeur
- ✅ **Dashboard personnalisé** avec statistiques
- ✅ **Vote sécurisé** avec vérification blockchain
- ✅ **Candidature automatisée** avec validation
- ✅ **Historique des votes** chiffrés
- ✅ **Interface responsive** mobile-first

### Interface Administrateur
- ✅ **Gestion complète des élections** (CRUD)
- ✅ **Validation des candidatures** avec workflow
- ✅ **Synchronisation blockchain** automatique
- ✅ **Rapports et statistiques** en temps réel
- ✅ **Gestion des utilisateurs** et permissions

### Intégration Blockchain
- ✅ **Smart contracts Solidity** optimisés
- ✅ **Synchronisation bidirectionnelle** DB ↔ Blockchain
- ✅ **Traçabilité complète** des transactions
- ✅ **Vérification d'intégrité** automatique
- ✅ **Génération automatique d'adresses** Ethereum pour chaque électeur
- ✅ **Portefeuille blockchain** intégré dans le dashboard électeur
- ✅ **Validation des adresses** et vérification des soldes
- ✅ **Interface utilisateur** pour la gestion des adresses blockchain

## 🔗 Gestion des Adresses Blockchain

### Génération Automatique d'Adresses
Chaque électeur peut obtenir une **adresse Ethereum unique** pour sécuriser ses votes :

#### Méthodes d'Obtention
```javascript
// 1. Génération automatique lors de l'inscription
const wallet = WalletService.generateDeterministicWallet({
  email: electeur.email,
  nom: electeur.nom
});

// 2. Génération manuelle via dashboard électeur
POST /api/electeur/dashboard/generate-blockchain-address
```

#### Fonctionnalités du Portefeuille
- ✅ **Affichage de l'adresse** Ethereum (format 0x...)
- ✅ **Validation automatique** de l'adresse
- ✅ **Vérification du solde** ETH en temps réel
- ✅ **Copie rapide** de l'adresse dans le presse-papiers
- ✅ **Interface intuitive** avec Material-UI

#### Sécurité des Adresses
```sql
-- Stockage sécurisé dans la base de données
ALTER TABLE Electeurs ADD COLUMN blockchain_address VARCHAR(42);
-- Format Ethereum standard : 42 caractères (0x + 40 hex)
```

#### API Endpoints
```bash
# Récupérer les informations blockchain de l'électeur
GET /api/electeur/dashboard/blockchain-info

# Générer une nouvelle adresse (si inexistante)
POST /api/electeur/dashboard/generate-blockchain-address
```

## 🗄️ Base de Données

### Tables Principales
- **Electeurs** - Informations des électeurs + `blockchain_address`
- **Elections** - Données des élections
- **Candidats** - Candidatures avec statuts
- **Bulletin** - Votes avec hash blockchain
- **Departement** - Circonscriptions
- **Poste** - Postes électifs
- **Activity_Log** - Audit des actions (+ génération d'adresses)
- **Blockchain_Sync** - Synchronisation blockchain

## 🧪 Tests et Qualité

### Tests Backend
```bash
cd backend
npm test
```

### Tests Frontend
```bash
cd frontend
npm test
```

### Linting
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## 📊 Monitoring et Performance

### Métriques Backend
- **Temps de réponse API** < 200ms
- **Rate limiting** configuré
- **Logs structurés** avec niveaux
- **Health check** endpoint `/api/health`

### Métriques Frontend
- **Lighthouse score** > 90
- **Bundle size** optimisé
- **Lazy loading** des composants
- **Cache intelligent** avec React Query

## 🔄 Workflow de Développement

### Branches
- `main` - Production stable
- `develop` - Développement actif
- `feature/*` - Nouvelles fonctionnalités
- `hotfix/*` - Corrections urgentes

### Convention de Commits
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: backend, frontend, blockchain, docs
```

## 🚀 Déploiement

### Environnement de Production

#### Backend (Node.js)
```bash
# Variables d'environnement production
NODE_ENV=production
JWT_SECRET=clé-super-sécurisée-production
DB_PASSWORD=mot-de-passe-fort

# Build et démarrage
npm install --production
npm start
```

#### Frontend (React)
```bash
# Build optimisé
npm run build

# Servir avec nginx ou Apache
# Fichiers dans ./build/
```

#### Base de Données
```sql
-- Optimisations production
SET GLOBAL innodb_buffer_pool_size = 2G;
SET GLOBAL max_connections = 200;
```

## 🔧 Maintenance

### Sauvegarde Base de Données
```bash
# Sauvegarde quotidienne
mysqldump -u root -p election_db > backup_$(date +%Y%m%d).sql
```

### Logs
```bash
# Rotation des logs
logrotate /etc/logrotate.d/election-app
```

### Mises à Jour
```bash
# Sécurité npm
npm audit fix

# Dépendances
npm update
```

## 📞 Support

### Issues et Bugs
- Créer une issue GitHub avec:
  - Description détaillée
  - Étapes de reproduction
  - Environnement (OS, versions)
  - Logs d'erreur

### Contact
- **Email technique**: tech@election-app.com
- **Documentation**: [Wiki GitHub](link)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)

## 📄 Licence

MIT License - Voir [LICENSE](LICENSE) pour les détails.

---

## 🎯 Prochaines Étapes

### Phase 4 - Optimisations
- [ ] Cache Redis pour les sessions
- [ ] CDN pour les assets statiques
- [ ] Monitoring avec Prometheus
- [ ] Tests e2e avec Cypress

### Phase 5 - Fonctionnalités Avancées
- [ ] Notifications en temps réel (WebSocket)
- [ ] API mobile (React Native)
- [ ] Intelligence artificielle (détection fraude)
- [ ] Rapports avancés (PDF, Excel)

**Version**: 1.0.0 - Architecture Refactored  
**Dernière mise à jour**: $(date)  
**Statut**: ✅ Production Ready 