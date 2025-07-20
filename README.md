# 🤖 Bot Telegram VIP System

Système complet de bot Telegram avec panel admin et gestion VIP.

## 📋 Architecture

- **Bot Telegram** (Node.js) → Render
- **Panel Admin** (Next.js) → Vercel
- **Base de données** MongoDB Atlas

## 🚀 Installation

### 1. Cloner et installer
```bash
git clone <votre-repo>
cd telegram-bot-vip-system
npm run install:all
```

### 2. Configuration

#### Bot Telegram
Créez `bot/.env` :
```env
TELEGRAM_BOT_TOKEN=votre_token_bot
MONGODB_URI=mongodb+srv://...
ADMIN_PASSWORD=votre_mot_de_passe_admin
WEBHOOK_URL=https://votre-app.onrender.com
PORT=3000
```

#### Panel Admin
Créez `admin/.env.local` :
```env
MONGODB_URI=mongodb+srv://...
ADMIN_PASSWORD=votre_mot_de_passe_admin
NEXTAUTH_SECRET=votre_secret_nextauth
NEXTAUTH_URL=https://votre-app.vercel.app
API_BASE_URL=https://votre-bot.onrender.com
```

### 3. Développement local

**Démarrage rapide :**
```bash
# Script automatique
chmod +x scripts/quick-start.sh
./scripts/quick-start.sh
```

**Démarrage manuel :**
```bash
# Bot Telegram
cd bot && npm run dev

# Panel Admin (nouveau terminal)
cd admin && npm run dev

# Initialiser les données de test
cd bot && npm run seed
```

## 🌐 Déploiement

### Render (Bot)
1. Connectez votre repo à Render
2. Choisissez "Web Service"
3. Root Directory: `bot`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Ajoutez les variables d'environnement

### Vercel (Admin)
1. Connectez votre repo à Vercel
2. Root Directory: `admin`
3. Framework: Next.js
4. Ajoutez les variables d'environnement

## 📱 Fonctionnalités

### Bot Telegram
- ✅ Page d'accueil avec section VIP
- ✅ Liste des plugs avec filtres
- ✅ Système de sous-menus
- ✅ Recherche par service et pays

### Panel Admin
- ✅ Interface responsive
- ✅ Gestion des plugs
- ✅ Configuration section VIP
- ✅ Upload d'images
- ✅ Modification des textes

## 🔧 Structure

```
├── bot/                 # Bot Telegram (Render)
│   ├── src/
│   │   ├── handlers/    # Gestionnaires des commandes
│   │   ├── models/      # Modèles MongoDB
│   │   └── utils/       # Utilitaires
│   └── package.json
├── admin/               # Panel Admin (Vercel)
│   ├── pages/           # Pages Next.js
│   ├── components/      # Composants React
│   └── package.json
└── shared/              # Code partagé
    └── models/          # Modèles de données
```