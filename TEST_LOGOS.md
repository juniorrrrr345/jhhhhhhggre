# 🎨 Guide de Test - Système de Logos

## 🎯 Nouvelle Fonctionnalité

**Affichage uniquement par logos** : Les réseaux sociaux n'utilisent plus les emojis mais uniquement les logos/images.

## ✅ Tests à Effectuer

### 1. **Test d'Affichage Logos**

#### A. Dans le Panel Admin (`/admin/social-media`)
1. **Vérifier** : Logos affichés à gauche des noms (32x32px)
2. **Tester** : Modification du logo en cliquant ✏️ 
3. **Changer URL logo** et voir le changement immédiat
4. **Fallback** : Entrer une URL incorrecte → Logo Telegram par défaut

#### B. Dans la Boutique (`/shop`)
1. **Vérifier** : Logos circulaires 50x50px
2. **Pas d'emojis** visibles
3. **Hover effect** : Agrandissement au survol
4. **Fallback** : Si logo cassé → Logo Telegram par défaut

### 2. **Test d'Auto-Assignment de Logos**

#### A. Ajouter nouveaux réseaux avec auto-détection
Tester ces noms pour voir l'auto-assignation :

| Nom à tester | Logo attendu | URL attendue |
|-------------|--------------|--------------|
| `Telegram` | ![](https://i.imgur.com/PP2GVMv.png) | Telegram logo |
| `Discord` | ![](https://i.imgur.com/JgmWPPZ.png) | Discord logo |
| `Instagram` | ![](https://i.imgur.com/YBE4cnb.jpeg) | Instagram logo |
| `WhatsApp` | ![](https://i.imgur.com/WhatsApp.png) | WhatsApp logo |
| `Twitter` ou `X` | ![](https://i.imgur.com/twitter.png) | Twitter logo |
| `Facebook` | ![](https://i.imgur.com/facebook.png) | Facebook logo |
| `YouTube` | ![](https://i.imgur.com/youtube.png) | YouTube logo |
| `TikTok` | ![](https://i.imgur.com/tiktok.png) | TikTok logo |
| `Potato` | ![](https://i.imgur.com/LaRHc9L.png) | Potato logo |
| `Luffa` | ![](https://i.imgur.com/zkZtY0m.png) | Luffa logo |
| `MonReseauCustom` | ![](https://i.imgur.com/PP2GVMv.png) | Fallback Telegram |

### 3. **Test de Modification de Logo**

#### A. Changer logo existant
1. **Aller** dans `/admin/social-media`
2. **Cliquer** ✏️ sur un réseau social
3. **Modifier** le champ "Logo (URL)"
4. **Valider** → Logo change immédiatement
5. **Aller** sur `/shop` → Logo mis à jour

#### B. Logo personnalisé
1. **Utiliser** une URL d'image personnalisée
2. **Exemple** : `https://i.imgur.com/VotreImage.png`
3. **Vérifier** : Affichage correct dans admin et boutique

### 4. **Test de Synchronisation**

#### A. Modification logo → Synchronisation boutique
1. **Modifier** logo dans admin
2. **Attendre** 1.5s (debounce)
3. **Vérifier** : Notification "🔄 Synchronisé avec la boutique"
4. **Actualiser** boutique → Logo mis à jour

#### B. Ajout avec logo personnalisé
1. **Ajouter** réseau avec logo custom
2. **Vérifier** : Sync automatique
3. **Boutique** : Nouveau réseau avec bon logo

### 5. **Test de Fallback et Erreurs**

#### A. URL de logo incorrecte
1. **Entrer** URL invalide : `https://image-inexistante.com/logo.png`
2. **Vérifier** : Logo Telegram par défaut s'affiche
3. **Pas de broken image** dans l'interface

#### B. Logo vide
1. **Laisser** champ logo vide
2. **Vérifier** : Auto-assignation selon le nom
3. **Si nom non reconnu** : Logo Telegram par défaut

### 6. **Test de Compatibilité**

#### A. Anciens réseaux avec emojis
1. **Vérifier** : Anciens réseaux gardent leurs logos
2. **Auto-génération** logos pour ceux qui n'en ont pas
3. **Émojis** conservés en base mais non affichés

#### B. Migration automatique
1. **Premier chargement** : Auto-assignation logos manquants
2. **Sauvegarde** : Logos conservés pour futurs chargements

## 🔧 Fonctionnalités Techniques

### Auto-Assignation
```javascript
const getLogoByName = (name) => {
  const lowercaseName = name.toLowerCase()
  if (lowercaseName.includes('telegram')) return 'https://i.imgur.com/PP2GVMv.png'
  if (lowercaseName.includes('discord')) return 'https://i.imgur.com/JgmWPPZ.png'
  // ... autres mappings
  return 'https://i.imgur.com/PP2GVMv.png' // Fallback
}
```

### Gestion d'Erreur
```javascript
onError={(e) => {
  e.target.src = 'https://i.imgur.com/PP2GVMv.png'; // Fallback
}}
```

### Synchronisation
- **Modification logo** → Sync automatique avec boutique
- **Double mise à jour** : `socialMediaList` + `shopSocialMediaList`
- **Debounce 1.5s** pour éviter spam

## 📱 Interface Utilisateur

### Panel Admin
- **Logos 32x32px** à côté des noms
- **Champ "Logo (URL)"** modifiable en live
- **Preview immédiat** des changements
- **Indication "Aucun logo"** si vide

### Boutique Publique
- **Logos circulaires 50x50px**
- **Hover effects** : Scale 1.1x
- **Pas d'emojis** affichés
- **Layout responsive** avec flex wrap

## 🎯 Résultats Attendus

### ✅ Succès
- **Logos uniquement** : Plus d'emojis dans l'affichage
- **Auto-assignation** : Logos corrects selon les noms
- **Synchronisation** : Changements visibles immédiatement
- **Fallback robuste** : Jamais d'image cassée

### ⚡ Performance
- **Chargement rapide** : Images optimisées
- **Cache navigateur** : Logos mis en cache
- **Fallback instantané** : En cas d'erreur

### 🔒 Robustesse
- **URLs invalides** gérées proprement
- **Compatibilité** avec anciens réseaux
- **Migration automatique** des données existantes

---

## 🚀 Commande de Test

```bash
# Démarrer en local
cd admin-panel
npm run dev

# Tester les URLs :
# 1. http://localhost:3000/admin/social-media
# 2. http://localhost:3000/shop
```

**🎯 L'objectif : Tous les réseaux sociaux affichent des logos beaux et cohérents, sans emojis !**