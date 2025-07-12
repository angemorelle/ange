#!/bin/bash

# 🗳️ Script de démarrage du système électoral blockchain

echo "🗳️ Démarrage du Système Électoral Blockchain..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier si nous sommes dans le bon répertoire
if [ ! -d "ElectionContrat" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    log_error "Veuillez exécuter ce script depuis la racine du projet (répertoire 'ange')"
    exit 1
fi

echo
log_info "Étape 1: Vérification de Ganache..."

# Vérifier si Ganache est déjà en cours
if curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_accounts","params":[],"id":1}' http://localhost:7545 > /dev/null 2>&1; then
    log_success "Ganache est déjà en cours d'exécution"
else
    log_info "Démarrage de Ganache..."
    ganache-cli -p 7545 -h 0.0.0.0 --deterministic > ganache.log 2>&1 &
    GANACHE_PID=$!
    echo $GANACHE_PID > ganache.pid
    
    # Attendre que Ganache soit prêt
    echo -n "Attente de Ganache"
    for i in {1..10}; do
        if curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_accounts","params":[],"id":1}' http://localhost:7545 > /dev/null 2>&1; then
            break
        fi
        echo -n "."
        sleep 1
    done
    echo
    
    if curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_accounts","params":[],"id":1}' http://localhost:7545 > /dev/null 2>&1; then
        log_success "Ganache démarré avec succès sur le port 7545"
    else
        log_error "Impossible de démarrer Ganache"
        exit 1
    fi
fi

echo
log_info "Étape 2: Déploiement des Smart Contracts..."
cd ElectionContrat
if npx truffle migrate --reset > ../truffle.log 2>&1; then
    log_success "Smart contracts déployés avec succès"
    
    # Copier l'ABI vers le frontend
    if cp build/contracts/ElectionDapp.json ../frontend/src/abis/ 2>/dev/null; then
        log_success "ABI copié vers le frontend"
    else
        log_warning "Impossible de copier l'ABI vers le frontend"
    fi
else
    log_error "Échec du déploiement des smart contracts"
    cd ..
    exit 1
fi
cd ..

echo
log_info "Étape 3: Démarrage du Backend..."
cd backend
if [ ! -d "node_modules" ]; then
    log_info "Installation des dépendances backend..."
    npm install > ../backend-install.log 2>&1
fi

# Vérifier si le fichier .env existe
if [ ! -f ".env" ]; then
    log_warning "Fichier .env manquant dans backend/"
    log_info "Création d'un fichier .env d'exemple..."
    cat > .env << 'EOF'
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
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
EOF
    log_warning "Veuillez configurer le fichier backend/.env avant de continuer"
fi

# Démarrer le backend en arrière-plan
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > backend.pid

# Attendre que le backend soit prêt
echo -n "Attente du backend"
for i in {1..15}; do
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        break
    fi
    echo -n "."
    sleep 1
done
echo

if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    log_success "Backend démarré avec succès sur le port 3001"
else
    log_warning "Le backend met du temps à démarrer (normal)"
fi
cd ..

echo
log_info "Étape 4: Démarrage du Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    log_info "Installation des dépendances frontend..."
    npm install > ../frontend-install.log 2>&1
fi

# Vérifier si le fichier .env existe
if [ ! -f ".env" ]; then
    log_info "Création du fichier .env pour le frontend..."
    echo "REACT_APP_API_URL=http://localhost:3001/api" > .env
fi

# Démarrer le frontend en arrière-plan
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > frontend.pid
cd ..

echo
log_success "🎉 Système électoral démarré avec succès !"
echo
echo "📊 Services disponibles :"
echo "  🔗 Blockchain (Ganache): http://localhost:7545"
echo "  🔧 Backend API:          http://localhost:3001"
echo "  🖥️  Frontend Web:         http://localhost:3000"
echo
echo "📋 Comptes de test Ganache :"
echo "  0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1"
echo "  0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0"
echo "  (et 8 autres comptes avec 100 ETH chacun)"
echo
echo "🛑 Pour arrêter le système :"
echo "   ./stop-system.sh"
echo
echo "📊 Logs en temps réel :"
echo "   Ganache:  tail -f ganache.log"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo "   Truffle:  tail -f truffle.log"
echo

# Attendre que le frontend soit prêt
log_info "Attente du frontend (peut prendre 1-2 minutes)..."
echo -n "Démarrage"
for i in {1..60}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        break
    fi
    echo -n "."
    sleep 2
done
echo

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    log_success "Frontend prêt ! Ouvrez http://localhost:3000"
    
    # Ouvrir automatiquement le navigateur (si disponible)
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:3000 2>/dev/null &
    elif command -v open > /dev/null; then
        open http://localhost:3000 2>/dev/null &
    fi
else
    log_info "Le frontend est en cours de démarrage... Veuillez patienter"
fi 