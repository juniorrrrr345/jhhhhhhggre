#!/bin/bash

echo "🤖 Bot Telegram VIP System - Démarrage rapide"
echo "=============================================="

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Créer les fichiers .env s'ils n'existent pas
echo "📝 Configuration des variables d'environnement..."

if [ ! -f "bot/.env" ]; then
    cp bot/.env.example bot/.env
    echo "⚠️  Veuillez configurer bot/.env avec vos valeurs réelles"
fi

if [ ! -f "admin/.env.local" ]; then
    cp admin/.env.local.example admin/.env.local
    echo "⚠️  Veuillez configurer admin/.env.local avec vos valeurs réelles"
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."

echo "🤖 Installation bot..."
cd bot && npm install
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances du bot"
    exit 1
fi

echo "🌐 Installation panel admin..."
cd ../admin && npm install
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances de l'admin"
    exit 1
fi

cd ..

echo ""
echo "✅ Installation terminée !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Configurez bot/.env avec vos valeurs (TELEGRAM_BOT_TOKEN, MONGODB_URI, etc.)"
echo "2. Configurez admin/.env.local avec vos valeurs"
echo "3. Initialisez la base de données : cd bot && node scripts/seed.js"
echo "4. Démarrez le bot : cd bot && npm run dev"
echo "5. Dans un autre terminal, démarrez l'admin : cd admin && npm run dev"
echo ""
echo "🌐 URLs locales :"
echo "- Bot API: http://localhost:3000"
echo "- Panel Admin: http://localhost:3001"
echo "- Health Check: http://localhost:3000/health"
echo ""
echo "📚 Documentation complète dans DEPLOYMENT.md"