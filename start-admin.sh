#!/bin/bash

echo "🚀 Démarrage du Panel Admin..."
echo ""

# Aller dans le répertoire admin-panel
cd /workspace/admin-panel

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    echo ""
fi

# Démarrer le panel admin
echo "✨ Lancement du Panel Admin sur http://localhost:3001"
echo "🔗 Serveur API: https://jhhhhhhggre.onrender.com"
echo "🔑 Mot de passe: JuniorAdmon123"
echo ""

NEXT_PUBLIC_API_URL=https://jhhhhhhggre.onrender.com npx next dev --port 3001 --hostname 0.0.0.0