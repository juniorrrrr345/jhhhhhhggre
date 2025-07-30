# 🛍️ Guide pour Ajouter et Modifier des Boutiques

## 🚨 Problème avec le panneau admin

Le panneau admin sur le site web semble avoir un problème de rechargement de page. En attendant la résolution, voici des solutions alternatives pour gérer vos boutiques.

## 📝 Solution 1 : Scripts directs (Recommandé)

J'ai créé 3 scripts pour gérer les boutiques directement :

### 1️⃣ **Lister les boutiques existantes**
```bash
cd /workspace/bot
node ../list-shops.js
```
Affiche toutes les boutiques avec leurs IDs et informations.

### 2️⃣ **Ajouter une nouvelle boutique**
```bash
# 1. Ouvrir le fichier pour modifier les informations
nano /workspace/add-shop-direct.js

# 2. Modifier les lignes 16-55 avec vos informations :
#    - name: 'Nom de votre boutique'
#    - telegram: '@votreusername'
#    - countries: ['France', 'Belgique']
#    - services (delivery, meetup, postal)
#    - etc.

# 3. Exécuter le script
cd /workspace/bot
node ../add-shop-direct.js
```

### 3️⃣ **Modifier une boutique existante**
```bash
# 1. D'abord, lister les boutiques pour obtenir l'ID
cd /workspace/bot
node ../list-shops.js

# 2. Ouvrir le fichier de modification
nano /workspace/modify-shop-direct.js

# 3. Modifier :
#    - Ligne 18 : Mettre l'ID ou le nom exact de la boutique
#    - Lignes 21-57 : Modifier SEULEMENT ce que vous voulez changer
#    - Laisser null pour ne pas modifier un champ

# 4. Exécuter
cd /workspace/bot
node ../modify-shop-direct.js
```

## 📋 Exemple d'ajout de boutique

Voici un exemple concret pour ajouter une boutique :

```javascript
// Dans add-shop-direct.js, modifiez ces lignes :
const newShop = {
  name: 'PlugParis75',  // Nom unique
  description: 'Livraison rapide sur Paris et région parisienne',
  countries: ['France'],  // Pays desservis
  isVip: false,  // true pour VIP
  image: 'https://exemple.com/logo.jpg',  // Optionnel
  services: {
    delivery: {
      enabled: true,
      description: 'Livraison discrète en 24h',
      departments: ['75', '92', '93', '94', '77', '78', '91', '95']
    },
    meetup: {
      enabled: true,
      description: 'Rencontre possible sur Paris',
      departments: ['75', '92']
    },
    postal: {
      enabled: false,
      description: '',
      countries: []
    }
  },
  contact: {
    telegram: '@plugparis75',  // OBLIGATOIRE
    instagram: '@plugparis75',
    whatsapp: '+33612345678'
  },
  socialMedia: [
    { name: 'Telegram', emoji: '💬', url: 'https://t.me/plugparis75' },
    { name: 'Instagram', emoji: '📸', url: 'https://instagram.com/plugparis75' }
  ]
};
```

## 🌍 Codes départements français

Voici les principaux codes départements :
- **Paris** : 75
- **Hauts-de-Seine** : 92
- **Seine-Saint-Denis** : 93
- **Val-de-Marne** : 94
- **Seine-et-Marne** : 77
- **Yvelines** : 78
- **Essonne** : 91
- **Val-d'Oise** : 95
- **Lyon** : 69
- **Marseille** : 13
- **Toulouse** : 31
- **Nice** : 06
- **Nantes** : 44
- **Strasbourg** : 67
- **Montpellier** : 34
- **Bordeaux** : 33
- **Lille** : 59
- **Rennes** : 35

## ✅ Vérification

Après avoir ajouté ou modifié une boutique :

1. **Vérifier dans la liste** :
   ```bash
   cd /workspace/bot
   node ../list-shops.js
   ```

2. **Vérifier sur le bot Telegram** :
   - Ouvrez votre bot
   - Allez dans "Toutes les boutiques"
   - Votre nouvelle boutique devrait apparaître

3. **Vérifier sur le site web** :
   - https://sfeplugslink.vercel.app/shop
   - La boutique devrait être visible

## ⚠️ Points importants

1. **Le champ `telegram` est OBLIGATOIRE** dans contact
2. **Les départements** doivent être des codes à 2 chiffres (ex: '75', pas 'Paris')
3. **Les pays** doivent correspondre exactement à ceux disponibles
4. **L'ID MongoDB** fait 24 caractères hexadécimaux

## 🆘 En cas de problème

- Vérifiez que MongoDB est accessible
- Assurez-vous d'être dans le dossier `/workspace/bot` pour exécuter les scripts
- Les erreurs s'affichent dans le terminal avec des détails

## 🔧 Solution temporaire

Ces scripts sont une solution temporaire pendant que le problème du panneau admin est résolu. Une fois corrigé, vous pourrez utiliser l'interface web normale sur https://sfeplugslink.vercel.app