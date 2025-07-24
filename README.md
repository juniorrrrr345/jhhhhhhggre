# 🤖 SafePlugLink - Bot Telegram & Boutique Web

## 🌐 **ACCÈS DIRECT**

### 🔗 **Site Web:** https://sfeplugslink.vercel.app

### 📱 **Accès Rapide:**
- **🏪 Boutique Publique:** https://sfeplugslink.vercel.app/shop
- **🔍 Recherche:** https://sfeplugslink.vercel.app/shop/search  
- **💎 VIP:** https://sfeplugslink.vercel.app/shop/vip
- **👨‍💼 Panel Admin:** https://sfeplugslink.vercel.app (mot de passe: `JuniorAdmon123`)

## 📋 Description

Système complet de bot Telegram avec boutique web pour la gestion de "plugs" (boutiques/services). 

### 🔧 Composants

- **🤖 Bot Telegram** - Interface utilisateur avec navigation, filtres et détails
- **🏪 Boutique Web (Vercel)** - Site vitrine avec recherche et catalogue
- **⚙️ Panel Admin** - Interface d'administration pour gérer le contenu

## ✨ Fonctionnalités Principales

### 🤖 Bot Telegram
- **Navigation intuitive** avec menus et boutons
- **Détails des plugs** avec images personnalisées
- **Filtres avancés** par service et pays
- **Section VIP** pour les plugs premium
- **Système de likes** pour les boutiques
- **Messages personnalisables** via l'admin

### 🏪 Boutique Web
- **Catalogue complet** avec filtres
- **Page de recherche** avancée
- **Design responsive** et moderne
- **Synchronisation temps réel** avec le bot

### ⚙️ Panel Admin
- **Configuration séparée** Bot et Boutique
- **Gestion des plugs** (CRUD complet)
- **Upload d'images** et gestion médias
- **Statistiques** et analytics
- **Diagnostic** et outils de debug

## 🔄 Améliorations Récentes

### ✅ Images des Plugs
- **Images personnalisées** dans les détails des plugs
- **Plus d'image d'accueil générique** dans les détails
- **Synchronisation** admin panel → bot telegram

### ✅ Configuration Séparée
- **Configuration Bot** (`/admin/config`) - Messages, textes, bienvenue
- **Configuration Boutique** (`/admin/configuration`) - Apparence, nom, logo
- **Plus de conflits** entre les paramètres
- **Stabilité améliorée** des sauvegardes

### ✅ Navigation Bot Améliorée
- **Pas de loading** lors des navigations
- **Nouveaux messages** pour les détails (au lieu de remplacer)
- **Retours fluides** vers les menus précédents

### ✅ Nettoyage Codebase
- **Fichiers inutiles supprimés** (tests, debug, docs temporaires)
- **Structure simplifiée** et plus maintenable
- **Performance optimisée**

## 🚀 Technologies

- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Bot:** Telegraf (Telegram Bot Framework)
- **Frontend:** Next.js, React, Tailwind CSS
- **Hosting:** Render (Bot), Vercel (Admin + Boutique)
- **Database:** MongoDB Atlas

## 📱 Utilisation

### 🤖 Configuration Bot
1. Admin Panel → **Configuration Bot**
2. Modifier messages, textes, bienvenue
3. Sauvegarder → Recharge automatique du bot

### 🏪 Configuration Boutique
1. Admin Panel → **Configuration**
2. Modifier nom, logo, apparence
3. Sauvegarder → Synchronisation automatique

### 📦 Gestion Plugs
1. Admin Panel → **Boutiques/Plugs**
2. Ajouter/Modifier avec images
3. Synchronisation automatique bot ↔ boutique

## 🔧 API Endpoints

### 🔐 Authentifiés (Admin)
- `GET/PUT /api/config` - Configuration du système
- `GET/POST/PUT/DELETE /api/plugs` - Gestion des plugs
- `POST /api/config/clean-boutique` - Nettoyage configuration

### 🌐 Publics (Boutique)
- `GET /api/public/config` - Configuration publique
- `GET /api/public/plugs` - Liste des plugs actifs

## 📈 Monitoring

- **Logs détaillés** pour debugging
- **Diagnostic en temps réel** pour la boutique
- **Synchronisation vérifiée** admin ↔ bot ↔ boutique

---

*Dernière mise à jour: Décembre 2024*