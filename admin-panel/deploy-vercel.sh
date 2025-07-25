#!/bin/bash

echo "🚀 Déploiement Vercel avec configuration Render"
echo "📍 URL: https://jhhhhhhggre.onrender.com"

# Build du projet
echo "📦 Build du projet..."
npm run build

# Si vercel n'est pas installé, l'installer
if ! command -v vercel &> /dev/null; then
    echo "⚙️ Installation de Vercel CLI..."
    npm install -g vercel
fi

# Déploiement
echo "🚀 Déploiement en cours..."
vercel --prod --confirm

echo "✅ Déploiement terminé !"
echo "🔗 La boutique Vercel utilisera maintenant la boutique 'teste' depuis Render"