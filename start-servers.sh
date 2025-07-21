#!/bin/bash

echo "🚀 Démarrage des serveurs pour la synchronisation boutique..."
echo ""

# Créer des terminaux séparés pour chaque serveur
echo "1️⃣ Démarrage du serveur BOT (port 3000)..."
echo "   📁 Dossier: /workspace/bot"
echo "   🔗 API publique: http://localhost:3000/api/public/config"
echo ""
echo "2️⃣ Démarrage du serveur ADMIN PANEL (port 3001)..."
echo "   📁 Dossier: /workspace/admin-panel" 
echo "   🌐 Interface: http://localhost:3001"
echo ""

echo "⚡ INSTRUCTIONS POUR VOUS :"
echo ""
echo "Terminal 1 - Serveur Bot:"
echo "cd /workspace/bot && npm start"
echo ""
echo "Terminal 2 - Admin Panel:"
echo "cd /workspace/admin-panel && npm run dev"
echo ""
echo "Une fois les 2 serveurs démarrés:"
echo "1. Allez sur http://localhost:3001/admin/configuration"
echo "2. Cliquez sur '🔄 Test Sync' pour vérifier"
echo "3. Si ça affiche '✅ Synchronisation OK', le problème est résolu!"
echo ""
echo "🔍 Pour diagnostiquer: http://localhost:3001/admin/config/boutique-debug"