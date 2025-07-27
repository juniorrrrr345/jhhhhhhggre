#!/bin/bash

# 🚀 Script de Déploiement Automatique FindYourPlug sur Vercel
# Usage: ./deploy-vercel.sh [message]

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage
print_status() {
    echo -e "${BLUE}🚀 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Message de commit par défaut
COMMIT_MESSAGE="${1:-🚀 Déploiement automatique $(date '+%Y-%m-%d %H:%M:%S')}"

print_status "Déploiement FindYourPlug sur Vercel..."
echo ""

# 1. Vérification des prérequis
print_status "Vérification des prérequis..."

# Vérifier si on est dans un repo git
if [ ! -d ".git" ]; then
    print_error "Ce n'est pas un repository Git !"
    exit 1
fi

# Vérifier si Vercel CLI est installé (optionnel)
if command -v vercel &> /dev/null; then
    VERCEL_CLI=true
    print_success "Vercel CLI détecté"
else
    VERCEL_CLI=false
    print_warning "Vercel CLI non détecté (déploiement manuel nécessaire)"
fi

# 2. Vérification de l'état du repository
print_status "Vérification de l'état du repository..."
git status --porcelain

# 3. Tests de l'API bot
print_status "Test de connectivité avec l'API bot..."
if curl -s --max-time 10 "https://jhhhhhhggre.onrender.com/api/public/config" > /dev/null; then
    print_success "API bot accessible"
else
    print_warning "API bot non accessible (sera testé après déploiement)"
fi

# 4. Vérification du build local (optionnel)
read -p "Voulez-vous tester le build local avant déploiement ? (y/N): " test_build
if [[ $test_build =~ ^[Yy]$ ]]; then
    print_status "Test du build local..."
    cd admin-panel
    
    # Installer les dépendances si nécessaire
    if [ ! -d "node_modules" ]; then
        print_status "Installation des dépendances..."
        npm install
    fi
    
    # Tester le build
    print_status "Build de test..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Build local réussi"
    else
        print_error "Échec du build local"
        exit 1
    fi
    
    cd ..
fi

# 5. Commit et push des changements
print_status "Sauvegarde des modifications..."

# Ajouter tous les fichiers
git add .

# Vérifier s'il y a des changements à commiter
if git diff --staged --quiet; then
    print_warning "Aucune modification à commiter"
else
    # Commiter les changements
    git commit -m "$COMMIT_MESSAGE"
    print_success "Modifications commitées"
fi

# Push vers GitHub
print_status "Push vers GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    print_success "Push réussi vers GitHub"
else
    print_error "Échec du push vers GitHub"
    exit 1
fi

# 6. Déploiement Vercel
if [ "$VERCEL_CLI" = true ]; then
    print_status "Déploiement avec Vercel CLI..."
    cd admin-panel
    
    # Déploiement en production
    vercel --prod --yes
    
    if [ $? -eq 0 ]; then
        print_success "Déploiement Vercel réussi"
    else
        print_error "Échec du déploiement Vercel"
        exit 1
    fi
    
    cd ..
else
    print_status "Déploiement automatique via GitHub..."
    print_warning "Vercel déploiera automatiquement depuis GitHub"
    print_warning "Surveillez les logs sur https://vercel.com/dashboard"
fi

# 7. Tests post-déploiement
print_status "Informations de déploiement..."
echo ""
echo "📋 URLs importantes :"
echo "   • Repository: https://github.com/juniorrrrr345/jhhhhhhggre"
echo "   • Dashboard Vercel: https://vercel.com/dashboard"
echo "   • API Bot: https://jhhhhhhggre.onrender.com"
echo ""
echo "🔗 URLs à tester après déploiement :"
echo "   • Panel Admin: https://votre-app.vercel.app"
echo "   • Boutique: https://votre-app.vercel.app/shop"
echo "   • Réseaux sociaux: https://votre-app.vercel.app/admin/social-media"
echo ""

# 8. Vérifications recommandées
print_status "Vérifications recommandées :"
echo "   1. ✅ Tester la page de connexion"
echo "   2. ✅ Vérifier l'affichage des réseaux sociaux sur /shop"
echo "   3. ✅ S'assurer que le mode local ne s'active pas en permanence"
echo "   4. ✅ Tester la gestion des réseaux sociaux dans l'admin"
echo ""

print_success "Déploiement terminé avec succès !"
print_status "Votre application FindYourPlug est maintenant déployée sur Vercel"

# 9. Option pour ouvrir les URLs
read -p "Voulez-vous ouvrir le dashboard Vercel ? (y/N): " open_vercel
if [[ $open_vercel =~ ^[Yy]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "https://vercel.com/dashboard"
    elif command -v open &> /dev/null; then
        open "https://vercel.com/dashboard"
    else
        print_warning "Impossible d'ouvrir automatiquement. Allez sur https://vercel.com/dashboard"
    fi
fi

echo ""
print_success "Script de déploiement terminé !"