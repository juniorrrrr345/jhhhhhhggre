# 🔄 Guide de Test - Synchronisation Temps Réel

## 🎯 Fonctionnalité Ajoutée

**Synchronisation automatique des réseaux sociaux** entre le panel admin et la boutique publique.

## ✅ Tests à Effectuer

### 1. **Test de Modification en Temps Réel**

#### A. Ouvrir deux onglets
- **Onglet 1** : Panel Admin - `/admin/social-media`
- **Onglet 2** : Boutique publique - `/shop`

#### B. Modifier un réseau social
1. Dans l'admin, changer le **nom** d'un réseau social
2. Attendre 1.5 secondes (debounce)
3. ✅ **Vérifier** : Notification "🔄 Synchronisé avec la boutique"
4. **Actualiser** la boutique → Le nom doit être mis à jour

#### C. Modifier l'URL
1. Changer l'**URL** d'un réseau social
2. Attendre la synchronisation automatique
3. ✅ **Vérifier** : URL mise à jour sur la boutique

#### D. Toggle Activer/Désactiver
1. Cliquer sur **Activé/Désactivé** d'un réseau
2. ✅ **Vérifier** : Synchronisation immédiate
3. **Actualiser** la boutique → Le réseau doit apparaître/disparaître

### 2. **Test d'Ajout de Réseau**

#### A. Ajouter un nouveau réseau
1. Remplir le formulaire "Ajouter un réseau social"
2. Cliquer **"Ajouter"**
3. ✅ **Vérifier** : Message "Réseau social [nom] ajouté et synchronisé"
4. **Actualiser** la boutique → Nouveau réseau visible

### 3. **Test de Suppression**

#### A. Supprimer un réseau
1. Cliquer **"Supprimer"** sur un réseau
2. ✅ **Vérifier** : Synchronisation automatique
3. **Actualiser** la boutique → Réseau supprimé

### 4. **Test de Synchronisation Manuelle**

#### A. Bouton "Sync Boutique"
1. Cliquer le bouton **"🔄 Sync Boutique"**
2. ✅ **Vérifier** : Indicateur "🔄 Synchronisation..."
3. ✅ **Vérifier** : Notification de succès

### 5. **Test de l'Interface Utilisateur**

#### A. Indicateurs visuels
- **Spinner bleu** pendant la synchronisation
- **Notifications toast** de confirmation
- **Boutons désactivés** pendant le processus

#### B. Messages informatifs
- **En-tête** : "Synchronisation automatique : Les modifications..."
- **Notifications** : Succès et erreurs

## 🔧 Fonctionnalités Techniques

### Synchronisation Automatique
```javascript
// Debounce de 1.5 secondes pour éviter trop de requêtes
clearTimeout(updateTimeoutRef.current)
updateTimeoutRef.current = setTimeout(() => {
  syncToBotAPI(updated)
}, 1500)
```

### Double Synchronisation
```javascript
const configData = {
  socialMediaList: socialMedias,        // Pour le bot
  shopSocialMediaList: socialMedias,    // Pour la boutique
  socialMedia: { /* compatibilité */ }
}
```

### Gestion des États
- `isSyncing` : Indicateur de synchronisation
- `updateTimeoutRef` : Gestion du debounce
- Nettoyage automatique des timeouts

## 🚨 Scénarios d'Erreur à Tester

### 1. **Serveur Bot Indisponible**
1. Arrêter temporairement le serveur bot
2. Modifier un réseau social
3. ✅ **Vérifier** : Message d'erreur affiché
4. **Redémarrer** le serveur
5. **Cliquer** "Sync Boutique" → Doit fonctionner

### 2. **Connexion Lente**
1. Simuler une connexion lente
2. Modifier plusieurs réseaux rapidement
3. ✅ **Vérifier** : Debounce fonctionne (une seule sync à la fin)

### 3. **Mode Local**
1. Si le mode local s'active
2. ✅ **Vérifier** : Indicateur orange visible
3. Modifications sauvées localement

## 📱 URLs de Test

### Local
- **Admin** : `http://localhost:3000/admin/social-media`
- **Boutique** : `http://localhost:3000/shop`

### Production (après déploiement)
- **Admin** : `https://votre-app.vercel.app/admin/social-media`
- **Boutique** : `https://votre-app.vercel.app/shop`

## 🎉 Résultats Attendus

### ✅ Succès
- **Modifications instantanées** visibles sur la boutique
- **Notifications positives** dans l'interface
- **Synchronisation fluide** sans bugs
- **Interface réactive** avec indicateurs visuels

### ⚡ Performance
- **Debounce efficace** : Pas de spam de requêtes
- **Réponse rapide** : < 2 secondes pour la sync
- **UI non bloquante** : Interface reste réactive

### 🔒 Robustesse
- **Gestion d'erreurs** : Messages clairs en cas de problème
- **Fallback** : Mode local si serveur indisponible
- **Nettoyage** : Pas de fuite mémoire avec les timeouts

---

## 🚀 Commande Rapide de Test

```bash
# Démarrer en local pour tester
cd admin-panel
npm run dev

# Ouvrir deux onglets :
# 1. http://localhost:3000/admin/social-media
# 2. http://localhost:3000/shop

# Tester toutes les modifications !
```

**🎯 L'objectif : Toute modification dans l'admin doit être visible immédiatement sur la boutique après actualisation.**