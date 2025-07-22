# 🚀 GUIDE DE DUPLICATION - BOT TELEGRAM & PANEL ADMIN

## 📋 **PRÉREQUIS**

### **1. Comptes requis :**
- ✅ **GitHub** - Pour le code source
- ✅ **Render** - Pour le bot Telegram (gratuit)
- ✅ **Vercel** - Pour le panel admin (gratuit)
- ✅ **MongoDB Atlas** - Pour la base de données (gratuit)
- ✅ **Telegram Bot API** - Pour créer le bot

### **2. Outils nécessaires :**
- ✅ **Node.js** (version 18+)
- ✅ **Git**
- ✅ **Un éditeur de code** (VS Code recommandé)

---

## 🔧 **ÉTAPE 1 : PRÉPARATION DU CODE**

### **1.1 Cloner le projet**
```bash
git clone https://github.com/VOTRE_USERNAME/jhhhhhhggre.git
cd jhhhhhhggre
```

### **1.2 Installer les dépendances**
```bash
# Dépendances du bot
cd bot
npm install

# Dépendances du panel admin
cd ../admin-panel
npm install
```

---

## 🤖 **ÉTAPE 2 : CONFIGURATION DU BOT TELEGRAM**

### **2.1 Créer un bot Telegram**
1. Allez sur [@BotFather](https://t.me/botfather) sur Telegram
2. Envoyez `/newbot`
3. Choisissez un nom pour votre bot
4. Choisissez un username (doit finir par "bot")
5. **SAUVEGARDEZ LE TOKEN** - vous en aurez besoin !

### **2.2 Variables d'environnement du bot**
Créez un fichier `.env` dans le dossier `bot/` :

```env
# Bot Telegram
TELEGRAM_BOT_TOKEN=votre_token_bot_ici

# Base de données MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority

# Admin Telegram ID (votre ID Telegram)
ADMIN_TELEGRAM_ID=votre_id_telegram

# URL du panel admin (à configurer plus tard)
ADMIN_URL=https://votre-panel.vercel.app

# Mot de passe admin
ADMIN_PASSWORD=votre_mot_de_passe_admin

# URL de l'API (sera l'URL Render)
API_BASE_URL=https://votre-bot.onrender.com
```

---

## 🗄️ **ÉTAPE 3 : CONFIGURATION MONGODB**

### **3.1 Créer un cluster MongoDB Atlas**
1. Allez sur [MongoDB Atlas](https://cloud.mongodb.com)
2. Créez un compte gratuit
3. Créez un nouveau cluster (gratuit)
4. Créez un utilisateur de base de données
5. Ajoutez votre IP à la liste blanche (0.0.0.0/0 pour tout autoriser)
6. **Récupérez l'URI de connexion**

### **3.2 Structure de la base de données**
La base de données contiendra automatiquement :
- **Plugs** - Les boutiques/plugs
- **Users** - Les utilisateurs
- **PlugApplications** - Les demandes d'inscription
- **Config** - Configuration du bot

---

## 🌐 **ÉTAPE 4 : DÉPLOIEMENT DU BOT (RENDER)**

### **4.1 Créer un compte Render**
1. Allez sur [Render.com](https://render.com)
2. Créez un compte gratuit
3. Connectez votre compte GitHub

### **4.2 Déployer le bot**
1. **New Web Service**
2. **Connect GitHub** → Sélectionnez votre repo
3. **Configuration :**
   - **Name :** `votre-bot-telegram`
   - **Root Directory :** `bot`
   - **Runtime :** `Node`
   - **Build Command :** `npm install`
   - **Start Command :** `node index.js`

### **4.3 Variables d'environnement Render**
Dans les settings du service, ajoutez :
```env
TELEGRAM_BOT_TOKEN=votre_token_bot
MONGODB_URI=votre_uri_mongodb
ADMIN_TELEGRAM_ID=votre_id_telegram
ADMIN_URL=https://votre-panel.vercel.app
ADMIN_PASSWORD=votre_mot_de_passe
NODE_ENV=production
```

### **4.4 URL du bot**
Votre bot sera accessible sur : `https://votre-bot-telegram.onrender.com`

---

## 🎛️ **ÉTAPE 5 : DÉPLOIEMENT DU PANEL ADMIN (VERCEL)**

### **5.1 Créer un compte Vercel**
1. Allez sur [Vercel.com](https://vercel.com)
2. Créez un compte gratuit
3. Connectez votre compte GitHub

### **5.2 Déployer le panel admin**
1. **New Project**
2. **Import Git Repository** → Sélectionnez votre repo
3. **Configuration :**
   - **Framework Preset :** `Next.js`
   - **Root Directory :** `admin-panel`
   - **Build Command :** `npm run build`
   - **Output Directory :** `.next`

### **5.3 Variables d'environnement Vercel**
Dans les settings du projet, ajoutez :
```env
API_BASE_URL=https://votre-bot-telegram.onrender.com
NEXT_PUBLIC_API_URL=https://votre-bot-telegram.onrender.com
NODE_ENV=production
```

### **5.4 URL du panel admin**
Votre panel sera accessible sur : `https://votre-panel.vercel.app`

---

## 🔄 **ÉTAPE 6 : SYNCHRONISATION**

### **6.1 Mettre à jour les URLs**
1. Dans **Render** (bot) : Mettez à jour `ADMIN_URL` avec l'URL Vercel
2. Dans **Vercel** (panel) : Mettez à jour `API_BASE_URL` avec l'URL Render

### **6.2 Tester la connexion**
1. Testez le bot : `/start` sur Telegram
2. Testez le panel : Accédez à l'URL Vercel
3. Connectez-vous avec le mot de passe admin

---

## 📝 **ÉTAPE 7 : PERSONNALISATION**

### **7.1 Modifier les textes du bot**
Éditez `bot/src/models/Config.js` pour personnaliser :
- Messages d'accueil
- Textes des boutons
- Configuration générale

### **7.2 Modifier l'apparence du panel**
Éditez `admin-panel/styles/globals.css` pour personnaliser :
- Couleurs
- Police
- Layout

### **7.3 Ajouter des fonctionnalités**
- **Bot** : Modifiez les handlers dans `bot/src/handlers/`
- **Panel** : Modifiez les pages dans `admin-panel/pages/`

---

## 🚀 **ÉTAPE 8 : DÉPLOIEMENT AUTOMATIQUE**

### **8.1 Configuration Git**
```bash
# Ajouter vos modifications
git add .
git commit -m "Configuration initiale"
git push origin main
```

### **8.2 Déploiement automatique**
- **Render** : Se déploie automatiquement à chaque push
- **Vercel** : Se déploie automatiquement à chaque push

---

## 🔧 **ÉTAPE 9 : MAINTENANCE**

### **9.1 Logs et monitoring**
- **Render** : Dashboard → Logs
- **Vercel** : Dashboard → Functions → Logs
- **MongoDB** : Atlas → Logs

### **9.2 Sauvegarde**
- **Code** : GitHub (automatique)
- **Base de données** : MongoDB Atlas (automatique)

### **9.3 Mise à jour**
```bash
git pull origin main
# Les déploiements se font automatiquement
```

---

## 📊 **ÉTAPE 10 : ANALYTICS**

### **10.1 Statistiques du bot**
- Utilisateurs actifs
- Messages envoyés
- Plugs créés

### **10.2 Statistiques du panel**
- Visites
- Actions admin
- Performance

---

## 🆘 **DÉPANNAGE**

### **Problèmes courants :**

**❌ Bot ne répond pas**
- Vérifiez le token Telegram
- Vérifiez les logs Render
- Vérifiez la connexion MongoDB

**❌ Panel admin ne fonctionne pas**
- Vérifiez les variables d'environnement Vercel
- Vérifiez la connexion à l'API du bot
- Vérifiez les logs Vercel

**❌ Base de données inaccessible**
- Vérifiez l'URI MongoDB
- Vérifiez les permissions utilisateur
- Vérifiez la liste blanche IP

---

## 📞 **SUPPORT**

### **Ressources utiles :**
- 📚 [Documentation Telegram Bot API](https://core.telegram.org/bots/api)
- 📚 [Documentation Render](https://render.com/docs)
- 📚 [Documentation Vercel](https://vercel.com/docs)
- 📚 [Documentation MongoDB Atlas](https://docs.atlas.mongodb.com)

### **Contact :**
- 🐛 **Bugs** : Créez une issue sur GitHub
- 💡 **Améliorations** : Proposez une pull request
- 📧 **Support** : Contactez l'équipe de développement

---

## ✅ **CHECKLIST FINALE**

- [ ] Bot Telegram créé et configuré
- [ ] Base de données MongoDB configurée
- [ ] Bot déployé sur Render
- [ ] Panel admin déployé sur Vercel
- [ ] Variables d'environnement configurées
- [ ] Connexions testées
- [ ] Personnalisations effectuées
- [ ] Déploiement automatique activé
- [ ] Monitoring configuré
- [ ] Sauvegardes vérifiées

**🎉 Félicitations ! Votre bot Telegram et panel admin sont maintenant opérationnels !** 