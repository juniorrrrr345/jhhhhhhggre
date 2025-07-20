# 🚀 Guide de Déploiement - Bot Telegram VIP System

## 📋 Prérequis

### 1. Comptes requis
- [MongoDB Atlas](https://cloud.mongodb.com/) (gratuit)
- [Render](https://render.com/) (pour le bot)
- [Vercel](https://vercel.com/) (pour le panel admin)
- [BotFather Telegram](https://t.me/botfather) (pour créer le bot)

### 2. Outils locaux
- Node.js 18+ 
- Git
- Terminal

---

## 🤖 Étape 1 : Création du Bot Telegram

1. **Contacter BotFather**
   ```
   /start
   /newbot
   ```

2. **Configurer le bot**
   - Nom : `Votre Bot VIP`
   - Username : `votre_bot_vip_bot`
   - Récupérer le **TOKEN**

3. **Commands optionnelles**
   ```
   /setcommands
   start - Accueil et section VIP
   ```

---

## 🗃️ Étape 2 : Configuration MongoDB Atlas

1. **Créer un cluster gratuit**
   - Région : Europe (Frankfurt)
   - Tier : M0 (gratuit)

2. **Configurer l'accès**
   - Database Access → Add User
   - Network Access → Add IP (0.0.0.0/0 pour démo)

3. **Récupérer l'URI de connexion**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database
   ```

---

## 🚢 Étape 3 : Déploiement du Bot (Render)

### 3.1 Préparation du code

1. **Fork/Clone le repository**
   ```bash
   git clone <votre-repo>
   cd telegram-bot-vip-system
   ```

2. **Tester localement** (optionnel)
   ```bash
   cd bot
   cp .env.example .env
   # Éditer .env avec vos valeurs
   npm install
   npm run dev
   ```

### 3.2 Déploiement sur Render

1. **Connecter le repository à Render**
   - Nouveau Web Service
   - Connect GitHub/GitLab
   - Sélectionner votre repo

2. **Configuration du service**
   ```yaml
   Name: telegram-bot-vip
   Region: Frankfurt
   Branch: main
   Root Directory: bot
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Variables d'environnement**
   ```env
   NODE_ENV=production
   TELEGRAM_BOT_TOKEN=votre_token_telegram
   MONGODB_URI=mongodb+srv://...
   ADMIN_PASSWORD=VotreMotDePasseSecure123!
   WEBHOOK_URL=https://votre-app.onrender.com
   PORT=10000
   ```

4. **Déployer**
   - Cliquer "Create Web Service"
   - Attendre le déploiement (~3-5 min)

### 3.3 Vérification

1. **Vérifier le bot**
   - URL : `https://votre-app.onrender.com/health`
   - Réponse : `{"status":"OK"}`

2. **Tester Telegram**
   ```
   /start dans votre bot
   ```

---

## 🌐 Étape 4 : Déploiement Panel Admin (Vercel)

### 4.1 Configuration Vercel

1. **Connecter à Vercel**
   - Import Git Repository
   - Sélectionner votre repo

2. **Configuration du projet**
   ```yaml
   Framework: Next.js
   Root Directory: admin
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Variables d'environnement**
   ```env
   ADMIN_PASSWORD=VotreMotDePasseSecure123!
   API_BASE_URL=https://votre-bot.onrender.com
   NEXTAUTH_SECRET=VotreSecretUltraSecure456!
   NEXTAUTH_URL=https://votre-admin.vercel.app
   ```

4. **Déployer**
   - Cliquer "Deploy"
   - Attendre le déploiement (~2-3 min)

### 4.2 Vérification

1. **Accéder au panel**
   - URL : `https://votre-admin.vercel.app`
   - Se connecter avec `ADMIN_PASSWORD`

2. **Tester l'API**
   - Dashboard doit afficher les statistiques
   - Vérifier la connexion au bot

---

## 🗃️ Étape 5 : Initialisation des Données

### 5.1 Données de test automatiques

Le bot se charge automatiquement avec une configuration par défaut. Pour ajouter des données de test :

1. **Via le script de seed**
   ```bash
   cd bot
   node scripts/seed.js
   ```

2. **Via le panel admin**
   - Aller dans "Plugs" → "Nouveau Plug"
   - Remplir les informations
   - Activer le statut VIP si désiré

### 5.2 Configuration personnalisée

1. **Panel Admin → Configuration**
   - Modifier les textes d'accueil
   - Uploader une image personnalisée
   - Configurer les réseaux sociaux
   - Paramétrer la section VIP

2. **Section VIP**
   - Panel Admin → Section VIP
   - Ajouter/retirer des plugs VIP
   - Modifier l'ordre d'affichage
   - Configurer la position (haut/bas)

---

## ⚙️ Configuration Avancée

### URLs et Webhooks

Render configurera automatiquement le webhook Telegram. Si nécessaire :

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://votre-app.onrender.com/webhook/<TOKEN>"}'
```

### Monitoring

1. **Logs Render**
   - Dashboard Render → Logs
   - Surveillance en temps réel

2. **Health Check**
   - `https://votre-bot.onrender.com/health`
   - Vérifie le status de l'API

3. **Métriques Vercel**
   - Dashboard Vercel → Analytics
   - Performance du panel admin

---

## 🔧 Maintenance

### Mise à jour du code

1. **Push vers Git**
   ```bash
   git add .
   git commit -m "Update features"
   git push origin main
   ```

2. **Auto-déploiement**
   - Render et Vercel déploient automatiquement
   - Surveillance via les dashboards

### Sauvegarde

- **MongoDB Atlas** : Sauvegardes automatiques
- **Code** : Versionné sur Git
- **Config** : Exportable via API

---

## 🐛 Dépannage

### Bot ne répond pas

1. **Vérifier les variables d'environnement**
2. **Logs Render** : erreurs de connexion ?
3. **Health check** : `/health` répond-il ?
4. **Webhook** : Bien configuré sur Telegram ?

### Panel admin inaccessible

1. **Variables Vercel** : bien configurées ?
2. **API_BASE_URL** : pointe vers Render ?
3. **ADMIN_PASSWORD** : identique dans les deux apps ?

### Base de données

1. **URI MongoDB** : correcte et accessible ?
2. **IP autorisées** : 0.0.0.0/0 configuré ?
3. **Credentials** : utilisateur/mot de passe valides ?

---

## 📞 Support

- **Logs détaillés** dans Render et Vercel
- **Health checks** disponibles
- **Documentation API** : `https://votre-bot.onrender.com/`

### URLs importantes

- **Bot API** : `https://votre-bot.onrender.com`
- **Panel Admin** : `https://votre-admin.vercel.app`
- **Health Check** : `https://votre-bot.onrender.com/health`
- **API Docs** : `https://votre-bot.onrender.com/`

---

✅ **Votre système est maintenant opérationnel !**

🤖 Bot Telegram avec section VIP fonctionnel
🌐 Panel admin responsive et sécurisé  
📊 Gestion complète des plugs et configuration
🔄 Synchronisation temps réel entre bot et admin