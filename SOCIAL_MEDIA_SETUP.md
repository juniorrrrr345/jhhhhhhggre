# 📱 Configuration des Réseaux Sociaux - Bot Telegram

Ce guide vous explique comment configurer les réseaux sociaux pour votre bot Telegram "Find Your Plug".

## 🌟 Configuration Actuelle

Vos réseaux sociaux sont configurés avec les liens suivants :

1. **📱 Telegram** - `https://t.me/+zcP68c4M_3NlM2Y0`
2. **🌐 Find Your Plug** - `https://dym168.org/findyourplug`
3. **📸 Instagram** - `https://www.instagram.com/find.yourplug?igsh=ajRwcjE1eGhoaXMz&utm_source=qr`
4. **🧽 Luffa** - `https://callup.luffa.im/c/EnvtiTHkbvP`
5. **🎮 Discord** - `https://discord.gg/g2dACUC3`
6. **📞 Contact** - `https://t.me/findyourplugsav`

## 🔧 Méthodes de Configuration

### Méthode 1: Interface d'Administration (Recommandée)

1. **Accéder au panneau d'administration :**
   - Ouvrez : `https://sfeplugslink-h2zx77561-lucas-projects-34f60a70.vercel.app/admin/social-media`
   - Connectez-vous avec vos identifiants admin

2. **Configuration des réseaux sociaux :**
   - **Ajouter** un nouveau réseau : Utilisez le formulaire en bas à droite
   - **Modifier** un réseau existant : Cliquez sur ✏️ à côté du réseau
   - **Supprimer** un réseau : Cliquez sur 🗑️
   - **Activer/Désactiver** : Cliquez sur le statut (Activé/Désactivé)
   - **Réinitialiser** : Cliquez sur "🔄 Réinitialiser" pour remettre la config par défaut

3. **Synchronisation automatique :**
   - Les modifications se synchronisent automatiquement avec le bot
   - Un indicateur de synchronisation apparaît lors des mises à jour

### Méthode 2: Script Automatique

Pour réinitialiser rapidement avec votre configuration complète :

```bash
# Depuis le répertoire du projet
cd bot
node scripts/setup-social-media.js
```

### Méthode 3: Configuration Boutique

Pour configurer les réseaux sociaux spécifiquement pour la boutique :

1. Accéder à : `https://sfeplugslink-h2zx77561-lucas-projects-34f60a70.vercel.app/admin/shop-social`
2. Même interface que pour le bot principal
3. Synchronisation automatique avec l'accueil boutique

## 📋 Format des Données

Chaque réseau social suit cette structure :

```javascript
{
  id: 'telegram',              // Identifiant unique
  name: 'Telegram',            // Nom affiché
  emoji: '📱',                 // Emoji du bouton
  url: 'https://t.me/...',     // Lien du réseau
  enabled: true                // Activé ou non
}
```

## 🔄 Synchronisation

Le système synchronise automatiquement :
- **Bot Telegram** : Les boutons dans le message d'accueil
- **Boutique Vercel** : Les liens sur la page d'accueil
- **Admin Panel** : Interface de gestion
- **Local Storage** : Sauvegarde de secours

## 🎯 Utilisation dans le Bot

Les réseaux sociaux apparaissent :
1. **Message d'accueil** : Boutons cliquables sous le message de bienvenue
2. **Menu Réseaux Sociaux** : Accessible via le bouton "📱 Réseaux Sociaux"
3. **Format des boutons** : `[Emoji] Nom du réseau` → ouvre le lien

## 🛠️ Dépannage

### Problème : Les boutons n'apparaissent pas
- Vérifiez que les réseaux sont `enabled: true`
- Contrôlez que les URLs sont valides
- Redémarrez le bot si nécessaire

### Problème : Synchronisation échouée
- Utilisez le bouton "🔄 Synchroniser" dans l'admin
- Vérifiez la connexion internet
- Consultez les logs du serveur

### Problème : Mode local activé
- Cela signifie que le serveur principal est indisponible
- Les modifications sont sauvegardées localement
- Utilisez "🔄 Synchroniser" quand le serveur revient

## 📱 Test des Liens

Pour tester vos liens :
1. Ouvrez le bot Telegram
2. Tapez `/start` pour voir le message d'accueil
3. Cliquez sur "📱 Réseaux Sociaux"
4. Testez chaque bouton

## 🔐 Sécurité

- Seuls les administrateurs peuvent modifier les réseaux sociaux
- Les URLs sont validées avant sauvegarde
- Sauvegarde automatique en local et serveur
- Historique des modifications dans les logs

---

**Note :** Cette configuration est spécifiquement adaptée pour votre bot "Find Your Plug" avec vos liens officiels.