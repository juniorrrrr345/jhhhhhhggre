#!/bin/bash

# 🚀 SCRIPT DE CONFIGURATION AUTOMATIQUE - DUPLICATION BOT TELEGRAM & PANEL ADMIN
# Ce script vous aide à configurer rapidement votre propre instance

echo "🚀 DÉMARRAGE DE LA CONFIGURATION AUTOMATIQUE"
echo "=============================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier les prérequis
print_status "Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
    exit 1
else
    print_success "Node.js détecté: $(node --version)"
fi

# Vérifier Git
if ! command -v git &> /dev/null; then
    print_error "Git n'est pas installé. Veuillez l'installer."
    exit 1
else
    print_success "Git détecté: $(git --version)"
fi

# Vérifier npm
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé."
    exit 1
else
    print_success "npm détecté: $(npm --version)"
fi

print_success "Tous les prérequis sont satisfaits !"

echo ""
print_status "Configuration du projet..."

# Demander les informations de configuration
echo ""
echo "📋 CONFIGURATION REQUISE"
echo "========================"

read -p "🤖 Nom de votre bot Telegram: " BOT_NAME
read -p "🔗 Token de votre bot Telegram: " BOT_TOKEN
read -p "🗄️ URI MongoDB Atlas: " MONGODB_URI
read -p "👤 Votre ID Telegram (admin): " ADMIN_ID
read -p "🔐 Mot de passe admin: " ADMIN_PASSWORD
read -p "🌐 Nom de votre projet Render (ex: mon-bot): " RENDER_NAME
read -p "🎛️ Nom de votre projet Vercel (ex: mon-panel): " VERCEL_NAME

# Créer le fichier .env pour le bot
print_status "Création du fichier .env pour le bot..."

cat > bot/.env << EOF
# Configuration du Bot Telegram
TELEGRAM_BOT_TOKEN=$BOT_TOKEN

# Base de données MongoDB
MONGODB_URI=$MONGODB_URI

# Admin Telegram ID
ADMIN_TELEGRAM_ID=$ADMIN_ID

# URL du panel admin (à mettre à jour après déploiement)
ADMIN_URL=https://$VERCEL_NAME.vercel.app

# Mot de passe admin
ADMIN_PASSWORD=$ADMIN_PASSWORD

# URL de l'API (sera l'URL Render)
API_BASE_URL=https://$RENDER_NAME.onrender.com

# Environnement
NODE_ENV=production
EOF

print_success "Fichier .env créé pour le bot"

# Créer le fichier .env pour le panel admin
print_status "Création du fichier .env pour le panel admin..."

cat > admin-panel/.env.local << EOF
# URL de l'API du bot
API_BASE_URL=https://$RENDER_NAME.onrender.com
NEXT_PUBLIC_API_URL=https://$RENDER_NAME.onrender.com

# Environnement
NODE_ENV=production
EOF

print_success "Fichier .env.local créé pour le panel admin"

# Installer les dépendances
print_status "Installation des dépendances..."

echo "📦 Installation des dépendances du bot..."
cd bot
npm install
cd ..

echo "📦 Installation des dépendances du panel admin..."
cd admin-panel
npm install
cd ..

print_success "Dépendances installées avec succès !"

# Créer le fichier de configuration Render
print_status "Création du fichier render.yaml..."

cat > render.yaml << EOF
services:
  - type: web
    name: $RENDER_NAME
    env: node
    buildCommand: cd bot && npm install
    startCommand: cd bot && node index.js
    envVars:
      - key: TELEGRAM_BOT_TOKEN
        value: $BOT_TOKEN
      - key: MONGODB_URI
        value: $MONGODB_URI
      - key: ADMIN_TELEGRAM_ID
        value: $ADMIN_ID
      - key: ADMIN_URL
        value: https://$VERCEL_NAME.vercel.app
      - key: ADMIN_PASSWORD
        value: $ADMIN_PASSWORD
      - key: NODE_ENV
        value: production
EOF

print_success "Fichier render.yaml créé"

# Créer le fichier de configuration Vercel
print_status "Création du fichier vercel.json..."

cat > admin-panel/vercel.json << EOF
{
  "functions": {
    "pages/admin/messages.js": {
      "memory": 1024
    },
    "pages/api/image-proxy.js": {
      "memory": 512,
      "maxDuration": 15
    }
  },
  "headers": [
    {
      "source": "/admin/messages",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/api/image-proxy",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOF

print_success "Fichier vercel.json créé"

# Créer un script de déploiement
print_status "Création du script de déploiement..."

cat > deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 DÉPLOIEMENT AUTOMATIQUE"
echo "=========================="

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[INFO]${NC} Ajout des fichiers..."
git add .

echo -e "${BLUE}[INFO]${NC} Commit des modifications..."
git commit -m "Configuration automatique - $(date)"

echo -e "${BLUE}[INFO]${NC} Push vers GitHub..."
git push origin main

echo -e "${GREEN}[SUCCESS]${NC} Déploiement déclenché !"
echo ""
echo "📋 PROCHAINES ÉTAPES :"
echo "1. Connectez votre repo GitHub à Render"
echo "2. Connectez votre repo GitHub à Vercel"
echo "3. Configurez les variables d'environnement"
echo "4. Testez votre bot et panel admin"
EOF

chmod +x deploy.sh

print_success "Script de déploiement créé"

# Créer un fichier README personnalisé
print_status "Création du README personnalisé..."

cat > README_DUPLICATION.md << EOF
# 🤖 $BOT_NAME - Bot Telegram & Panel Admin

## 📋 Configuration

- **Bot Telegram :** $BOT_NAME
- **Panel Admin :** https://$VERCEL_NAME.vercel.app
- **API Bot :** https://$RENDER_NAME.onrender.com
- **Base de données :** MongoDB Atlas

## 🚀 Déploiement

### 1. Render (Bot Telegram)
1. Allez sur [Render.com](https://render.com)
2. Créez un nouveau Web Service
3. Connectez votre repo GitHub
4. Configuration :
   - **Name :** $RENDER_NAME
   - **Root Directory :** bot
   - **Build Command :** npm install
   - **Start Command :** node index.js

### 2. Vercel (Panel Admin)
1. Allez sur [Vercel.com](https://vercel.com)
2. Créez un nouveau projet
3. Importez votre repo GitHub
4. Configuration :
   - **Framework Preset :** Next.js
   - **Root Directory :** admin-panel
   - **Build Command :** npm run build
   - **Output Directory :** .next

## 🔧 Variables d'environnement

### Render (Bot)
\`\`\`env
TELEGRAM_BOT_TOKEN=$BOT_TOKEN
MONGODB_URI=$MONGODB_URI
ADMIN_TELEGRAM_ID=$ADMIN_ID
ADMIN_URL=https://$VERCEL_NAME.vercel.app
ADMIN_PASSWORD=$ADMIN_PASSWORD
NODE_ENV=production
\`\`\`

### Vercel (Panel)
\`\`\`env
API_BASE_URL=https://$RENDER_NAME.onrender.com
NEXT_PUBLIC_API_URL=https://$RENDER_NAME.onrender.com
NODE_ENV=production
\`\`\`

## 🧪 Test

1. **Bot Telegram :** Envoyez \`/start\` à votre bot
2. **Panel Admin :** Accédez à https://$VERCEL_NAME.vercel.app
3. **Connexion Admin :** Utilisez le mot de passe : $ADMIN_PASSWORD

## 📞 Support

- 🐛 **Bugs :** Créez une issue sur GitHub
- 💡 **Améliorations :** Proposez une pull request
- 📧 **Support :** Contactez l'équipe de développement

---

**🎉 Votre bot Telegram et panel admin sont maintenant configurés !**
EOF

print_success "README personnalisé créé"

echo ""
echo "🎉 CONFIGURATION TERMINÉE !"
echo "============================"
echo ""
echo "📋 FICHIERS CRÉÉS :"
echo "✅ bot/.env - Configuration du bot"
echo "✅ admin-panel/.env.local - Configuration du panel"
echo "✅ render.yaml - Configuration Render"
echo "✅ admin-panel/vercel.json - Configuration Vercel"
echo "✅ deploy.sh - Script de déploiement"
echo "✅ README_DUPLICATION.md - Documentation personnalisée"
echo ""
echo "🚀 PROCHAINES ÉTAPES :"
echo "1. Commitez et poussez vers GitHub : ./deploy.sh"
echo "2. Déployez sur Render avec le fichier render.yaml"
echo "3. Déployez sur Vercel avec le dossier admin-panel"
echo "4. Configurez les variables d'environnement"
echo "5. Testez votre bot et panel admin"
echo ""
echo "📚 Consultez DUPLICATION_GUIDE.md pour plus de détails"
echo ""
print_success "Configuration terminée avec succès ! 🎉" 