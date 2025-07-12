#!/bin/bash

# 🔗 Script de configuration Blockchain pour le système électoral

echo "🔗 Configuration de l'environnement Blockchain..."

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
if [ ! -d "ElectionContrat" ] || [ ! -d "backend" ]; then
    log_error "Veuillez exécuter ce script depuis la racine du projet (répertoire 'ange')"
    log_info "Répertoire actuel: $(pwd)"
    log_info "Contenu: $(ls -la)"
    exit 1
fi

echo
log_info "Étape 1: Installation des dépendances backend..."
cd backend
if npm install; then
    log_success "Dépendances backend installées"
else
    log_error "Erreur lors de l'installation des dépendances backend"
    exit 1
fi

echo
log_info "Étape 2: Installation des dépendances smart contracts..."
cd ../ElectionContrat
if npm install; then
    log_success "Dépendances smart contracts installées"
else
    log_error "Erreur lors de l'installation des dépendances smart contracts"
    exit 1
fi

echo
log_info "Étape 3: Vérification de Ganache..."
if pgrep -f "ganache" > /dev/null; then
    log_success "Ganache est en cours d'exécution"
else
    log_warning "Ganache n'est pas détecté"
    echo "         Pour démarrer Ganache :"
    echo "         1. Installer : npm install -g ganache-cli"
    echo "         2. Démarrer : ganache-cli -p 7545 -h 0.0.0.0 --deterministic"
    echo
fi

echo
log_info "Étape 4: Test de Web3..."
cd ../backend
if node -e "const { Web3 } = require('web3'); const web3 = new Web3('http://localhost:7545'); console.log('Web3 connecté :', web3.version);" 2>/dev/null; then
    log_success "Web3 fonctionne correctement"
else
    log_warning "Impossible de se connecter à Web3 (Ganache requis)"
fi

echo
log_info "Étape 5: Compilation des smart contracts..."
cd ../ElectionContrat
if npx truffle compile; then
    log_success "Smart contracts compilés"
else
    log_error "Erreur lors de la compilation"
fi

echo
log_info "Étape 6: Déploiement des smart contracts..."
if npx truffle migrate --reset; then
    log_success "Smart contracts déployés"
    
    # Copier l'ABI vers le frontend
    if [ -f "build/contracts/ElectionDapp.json" ]; then
        cp build/contracts/ElectionDapp.json ../frontend/src/abis/
        log_success "ABI copié vers le frontend"
    fi
else
    log_warning "Erreur lors du déploiement (vérifiez que Ganache est démarré)"
fi

echo
log_info "Étape 7: Nettoyage..."
cd ../backend
rm -f test_web3.js
log_success "Fichiers temporaires supprimés"

echo
echo "🎉 Configuration terminée !"
echo
echo "📋 Pour démarrer le système complet :"
echo "   ./start.sh"
echo
echo "🔧 Commandes utiles :"
echo "   - Compiler les contracts : cd ElectionContrat && npm run compile"
echo "   - Déployer les contracts : cd ElectionContrat && npm run migrate"
echo "   - Console truffle       : cd ElectionContrat && npm run console"
echo

cd ../ 