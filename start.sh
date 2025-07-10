#!/bin/bash

# 🗳️ Script de démarrage automatique - Système Électoral Blockchain
# Version: 1.0.0

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}🗳️  Système Électoral Blockchain - Démarrage${NC}"
    echo -e "${BLUE}================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Vérifier les prérequis
check_prerequisites() {
    print_info "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé. Veuillez l'installer (version 16+)"
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 16 ]; then
        print_error "Node.js version 16+ requis. Version actuelle: $(node --version)"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        print_error "npm n'est pas installé"
        exit 1
    fi
    
    # Vérifier MySQL
    if ! command -v mysql &> /dev/null; then
        print_warning "MySQL CLI non trouvé. Assurez-vous que MySQL est installé et accessible"
    fi
    
    print_success "Prérequis validés"
}

# Installation des dépendances
install_dependencies() {
    print_info "Installation des dépendances..."
    
    # Backend
    print_info "Installation dépendances backend..."
    cd backend
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Dépendances backend installées"
    else
        print_info "Dépendances backend déjà installées"
    fi
    cd ..
    
    # Frontend
    print_info "Installation dépendances frontend..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Dépendances frontend installées"
    else
        print_info "Dépendances frontend déjà installées"
    fi
    cd ..
    
    # Smart Contracts
    print_info "Installation dépendances blockchain..."
    cd ElectionContrat
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Dépendances blockchain installées"
    else
        print_info "Dépendances blockchain déjà installées"
    fi
    cd ..
}

# Configuration de la base de données
setup_database() {
    print_info "Configuration de la base de données..."
    
    # Vérifier si le fichier de configuration existe
    if [ ! -f "backend/.env" ]; then
        print_warning "Fichier .env non trouvé. Création d'un exemple..."
        cat > backend/.env << EOF
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=election_db

# JWT
JWT_SECRET=votre-clé-secrète-très-longue-et-sécurisée-32-caractères-minimum-$(date +%s)
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
        print_warning "Fichier .env créé. Veuillez configurer vos paramètres de base de données"
    fi
    
    # Importer le schéma si possible
    if command -v mysql &> /dev/null; then
        print_info "Tentative d'import du schéma de base de données..."
        read -p "Voulez-vous importer le schéma de base de données? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Utilisateur MySQL: " db_user
            read -s -p "Mot de passe MySQL: " db_password
            echo
            
            mysql -u "$db_user" -p"$db_password" -e "CREATE DATABASE IF NOT EXISTS election_db;"
            mysql -u "$db_user" -p"$db_password" election_db < database/schema.sql
            print_success "Schéma de base de données importé"
        fi
    fi
}

# Configuration frontend
setup_frontend() {
    print_info "Configuration frontend..."
    
    if [ ! -f "frontend/.env" ]; then
        cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:3001/api
EOF
        print_success "Configuration frontend créée"
    fi
}

# Démarrage Ganache
start_ganache() {
    print_info "Démarrage de Ganache..."
    
    # Vérifier si ganache-cli est installé
    if ! command -v ganache-cli &> /dev/null; then
        print_warning "ganache-cli non trouvé. Installation..."
        npm install -g ganache-cli
    fi
    
    # Vérifier si Ganache est déjà en cours d'exécution
    if lsof -Pi :7545 -sTCP:LISTEN -t >/dev/null ; then
        print_info "Ganache déjà en cours d'exécution sur le port 7545"
    else
        print_info "Démarrage de Ganache sur le port 7545..."
        ganache-cli -p 7545 -h 0.0.0.0 --deterministic > ganache.log 2>&1 &
        GANACHE_PID=$!
        echo $GANACHE_PID > ganache.pid
        sleep 3
        print_success "Ganache démarré (PID: $GANACHE_PID)"
    fi
}

# Déploiement des smart contracts
deploy_contracts() {
    print_info "Déploiement des smart contracts..."
    
    cd ElectionContrat
    if [ -f "truffle-config.js" ]; then
        npx truffle migrate --reset --network development
        print_success "Smart contracts déployés"
    else
        print_warning "Configuration Truffle non trouvée"
    fi
    cd ..
}

# Démarrage des services
start_services() {
    print_info "Démarrage des services..."
    
    # Créer le dossier de logs
    mkdir -p logs
    
    # Démarrer le backend
    print_info "Démarrage du backend..."
    cd backend
    npm run dev > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../backend.pid
    cd ..
    
    # Attendre que le backend soit prêt
    sleep 5
    
    # Vérifier si le backend répond
    if curl -s http://localhost:3001/api/health > /dev/null; then
        print_success "Backend démarré (PID: $BACKEND_PID)"
    else
        print_error "Échec du démarrage du backend"
        exit 1
    fi
    
    # Démarrer le frontend
    print_info "Démarrage du frontend..."
    cd frontend
    npm start > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    cd ..
    
    print_success "Frontend démarré (PID: $FRONTEND_PID)"
}

# Arrêt des services
stop_services() {
    print_info "Arrêt des services..."
    
    # Arrêter le frontend
    if [ -f "frontend.pid" ]; then
        kill $(cat frontend.pid) 2>/dev/null || true
        rm -f frontend.pid
    fi
    
    # Arrêter le backend
    if [ -f "backend.pid" ]; then
        kill $(cat backend.pid) 2>/dev/null || true
        rm -f backend.pid
    fi
    
    # Arrêter Ganache
    if [ -f "ganache.pid" ]; then
        kill $(cat ganache.pid) 2>/dev/null || true
        rm -f ganache.pid
    fi
    
    print_success "Services arrêtés"
}

# Fonction de nettoyage
cleanup() {
    print_info "Nettoyage..."
    
    # Arrêter tous les processus
    stop_services
    
    # Nettoyer les fichiers temporaires
    rm -f *.pid
    
    print_success "Nettoyage terminé"
}

# Afficher le statut
show_status() {
    print_info "Statut des services:"
    
    # Backend
    if [ -f "backend.pid" ] && kill -0 $(cat backend.pid) 2>/dev/null; then
        print_success "Backend: ✅ En cours (http://localhost:3001)"
    else
        print_error "Backend: ❌ Arrêté"
    fi
    
    # Frontend
    if [ -f "frontend.pid" ] && kill -0 $(cat frontend.pid) 2>/dev/null; then
        print_success "Frontend: ✅ En cours (http://localhost:3000)"
    else
        print_error "Frontend: ❌ Arrêté"
    fi
    
    # Ganache
    if [ -f "ganache.pid" ] && kill -0 $(cat ganache.pid) 2>/dev/null; then
        print_success "Ganache: ✅ En cours (http://localhost:7545)"
    else
        print_error "Ganache: ❌ Arrêté"
    fi
}

# Afficher l'aide
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Démarrer tous les services (par défaut)"
    echo "  stop      Arrêter tous les services"
    echo "  restart   Redémarrer tous les services"
    echo "  status    Afficher le statut des services"
    echo "  setup     Configuration initiale uniquement"
    echo "  logs      Afficher les logs en temps réel"
    echo "  clean     Nettoyer les fichiers temporaires"
    echo "  help      Afficher cette aide"
}

# Afficher les logs
show_logs() {
    print_info "Affichage des logs (Ctrl+C pour quitter)..."
    tail -f logs/*.log 2>/dev/null || print_warning "Aucun fichier de log trouvé"
}

# Gestion des signaux pour nettoyage propre
trap cleanup EXIT INT TERM

# Fonction principale
main() {
    print_header
    
    case "${1:-start}" in
        "start")
            check_prerequisites
            install_dependencies
            setup_database
            setup_frontend
            start_ganache
            deploy_contracts
            start_services
            
            print_success "🎉 Système démarré avec succès!"
            echo ""
            print_info "📱 Frontend: http://localhost:3000"
            print_info "🔧 Backend: http://localhost:3001"
            print_info "⛓️  Ganache: http://localhost:7545"
            echo ""
            print_info "Utilisez '$0 stop' pour arrêter les services"
            print_info "Utilisez '$0 status' pour voir le statut"
            print_info "Utilisez '$0 logs' pour voir les logs"
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            sleep 2
            start_services
            ;;
        "status")
            show_status
            ;;
        "setup")
            check_prerequisites
            install_dependencies
            setup_database
            setup_frontend
            print_success "Configuration terminée"
            ;;
        "logs")
            show_logs
            ;;
        "clean")
            cleanup
            rm -rf logs/
            print_success "Nettoyage terminé"
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Commande inconnue: $1"
            show_help
            exit 1
            ;;
    esac
}

# Exécuter la fonction principale
main "$@" 