#!/bin/bash

# 🛑 Script d'arrêt du système électoral blockchain

echo "🛑 Arrêt du Système Électoral Blockchain..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Fonction pour arrêter un processus
stop_process() {
    local name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            log_info "Arrêt de $name (PID: $pid)..."
            kill $pid 2>/dev/null
            
            # Attendre que le processus s'arrête
            for i in {1..10}; do
                if ! ps -p $pid > /dev/null 2>&1; then
                    break
                fi
                sleep 1
            done
            
            # Forcer l'arrêt si nécessaire
            if ps -p $pid > /dev/null 2>&1; then
                log_warning "Arrêt forcé de $name..."
                kill -9 $pid 2>/dev/null
            fi
            
            log_success "$name arrêté"
        else
            log_info "$name n'était pas en cours d'exécution"
        fi
        rm -f "$pid_file"
    else
        log_info "Aucun fichier PID trouvé pour $name"
    fi
}

# Arrêter le frontend
if [ -f "frontend/frontend.pid" ]; then
    stop_process "Frontend" "frontend/frontend.pid"
fi

# Arrêter le backend
if [ -f "backend/backend.pid" ]; then
    stop_process "Backend" "backend/backend.pid"
fi

# Arrêter Ganache
if [ -f "ganache.pid" ]; then
    stop_process "Ganache" "ganache.pid"
fi

# Nettoyer les processus restants par port
log_info "Vérification des processus restants..."

# Tuer les processus sur les ports utilisés
for port in 3000 3001 7545; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        log_info "Arrêt du processus sur le port $port (PID: $pid)..."
        kill $pid 2>/dev/null
        sleep 1
        # Forcer si nécessaire
        if kill -0 $pid 2>/dev/null; then
            kill -9 $pid 2>/dev/null
        fi
    fi
done

# Nettoyer les processus Node.js liés au projet
log_info "Nettoyage des processus Node.js du projet..."
pkill -f "ganache-cli" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null
pkill -f "nodemon.*index.js" 2>/dev/null

# Supprimer les fichiers de logs (optionnel)
read -p "Voulez-vous supprimer les fichiers de logs ? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Suppression des fichiers de logs..."
    rm -f ganache.log backend.log frontend.log truffle.log
    rm -f backend-install.log frontend-install.log
    log_success "Fichiers de logs supprimés"
fi

echo
log_success "🎉 Système électoral arrêté avec succès !"
echo
echo "💡 Pour redémarrer le système :"
echo "   ./start-system.sh"
echo
echo "🔧 Pour vérifier qu'aucun processus n'est en cours :"
echo "   lsof -i :3000,3001,7545"
echo 