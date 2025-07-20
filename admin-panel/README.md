# 🎨 Panel Admin - Bot Telegram

Panel d'administration moderne pour gérer votre bot Telegram et vos boutiques.

## 🚀 Déploiement sur Vercel

### 1. Préparation
```bash
cd admin-panel
npm install
```

### 2. Déploiement
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel --prod
```

### 3. Variables d'environnement
Configurez ces variables sur Vercel :

```
API_BASE_URL=https://jhhhhhhggre.onrender.com
ADMIN_PASSWORD=JuniorAdmon123
```

## 🎯 Fonctionnalités

### ✅ Déjà implémentées :
- 🔐 **Page de connexion** sécurisée
- 📊 **Dashboard** avec statistiques
- 🎨 **Design moderne** avec Tailwind CSS
- 📱 **Responsive** mobile/desktop
- 🔄 **API intégration** avec le bot Render

### 🚧 À implémenter prochainement :
- 🏪 **Gestion des boutiques/plugs**
- ⚙️ **Configuration du bot**
- 📝 **Modification des messages**
- 📊 **Statistiques avancées**

## 🌐 URLs

- **Connexion :** `https://votre-admin.vercel.app/`
- **Dashboard :** `https://votre-admin.vercel.app/admin`

## 🔧 Architecture

```
Panel Admin (Vercel) ←→ API Bot (Render)
     ↓                        ↓
  Interface Web           Base de données
```

## 💡 Utilisation

1. **Accès :** Tapez `/admin` dans votre bot Telegram
2. **Connexion :** Utilisez le mot de passe fourni
3. **Gestion :** Interface complète pour tout gérer

## 🎨 Design

- **Framework :** Next.js 14
- **Styling :** Tailwind CSS
- **Icons :** Heroicons
- **Notifications :** React Hot Toast