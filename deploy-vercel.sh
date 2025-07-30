#!/bin/bash

echo "🚀 Déploiement du Panel Admin sur Vercel"
echo "========================================"

# Aller dans le dossier admin-panel
cd admin-panel

# Vérifier si le projet est lié à Vercel
if [ -d ".vercel" ]; then
    echo "✅ Projet déjà lié à Vercel"
else
    echo "📦 Liaison du projet à Vercel..."
    echo "⚠️  IMPORTANT: Quand demandé:"
    echo "   - Set up and deploy: Y"
    echo "   - Which scope: Choisissez votre compte"
    echo "   - Link to existing project: N (si première fois)"
    echo "   - Project name: jhhhhhhggre-admin"
    echo "   - In which directory: ./ (appuyez Enter)"
    echo "   - Override settings: N"
fi

echo ""
echo "🔧 Configuration détectée:"
echo "   - Framework: Next.js"
echo "   - Root Directory: admin-panel"
echo "   - Build Command: next build"
echo "   - Output Directory: .next"

echo ""
echo "📝 Variables d'environnement (déjà dans vercel.json):"
echo "   - NEXT_PUBLIC_API_URL: https://jhhhhhhggre.onrender.com"
echo "   - NEXT_PUBLIC_BOT_URL: https://jhhhhhhggre.onrender.com"
echo "   - API_BASE_URL: https://jhhhhhhggre.onrender.com"

echo ""
echo "🎯 Pour déployer manuellement:"
echo "   1. Allez sur https://vercel.com/dashboard"
echo "   2. Cliquez sur 'Add New Project'"
echo "   3. Importez: github.com/juniorrrrr345/jhhhhhhggre"
echo "   4. Root Directory: admin-panel"
echo "   5. Cliquez sur 'Deploy'"

echo ""
echo "✨ Ou utilisez la commande suivante dans le dossier admin-panel:"
echo "   vercel --prod"

echo ""
echo "📱 URLs après déploiement:"
echo "   - Admin: https://[votre-projet].vercel.app/admin"
echo "   - Shop: https://[votre-projet].vercel.app/shop"

echo ""
echo "✅ Tout est prêt pour le déploiement !"