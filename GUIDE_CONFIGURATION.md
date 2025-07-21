# 🎨 Guide Configuration Boutique

## ✅ **Page Configuration Simplifiée**

La page de configuration a été **complètement refaite** pour être simple et focalisée uniquement sur l'apparence de votre boutique.

### 📍 **Accès**
```
http://localhost:3001/admin/config
```
**Mot de passe :** `JuniorAdmon123`

---

## 🎯 **Fonctionnalités**

### 1. **📱 Aperçu en temps réel**
- Voir immédiatement l'apparence de votre boutique
- Aperçu du titre, des lignes de texte et de l'image de fond

### 2. **🎨 Configuration personnalisée**
- **Titre principal** : Le nom affiché en haut (ex: "PLUGS FINDER")
- **Première ligne** : Texte avant le highlight (ex: "JUSTE UNE")
- **Texte mis en avant** : Texte dans l'encadré bleu (ex: "MINI-APP TELEGRAM")
- **Dernière ligne** : Texte après le highlight (ex: "CHILL")
- **Image de fond** : URL d'une image pour l'arrière-plan

### 3. **💾 Sauvegarde rapide**
- Bouton "Sauvegarder les modifications"
- Rafraîchissement automatique du cache
- Notification de succès

### 4. **👁️ Prévisualisation**
- Bouton "Voir la boutique" pour tester immédiatement
- Les changements sont appliqués sur toutes les pages

---

## 🔧 **Utilisation**

### **Étape 1 : Connexion**
1. Aller sur `http://localhost:3001`
2. Saisir le mot de passe : `JuniorAdmon123`
3. Cliquer sur "Configuration" dans le menu

### **Étape 2 : Personnalisation**
1. Modifier le **titre principal** (obligatoire)
2. Personnaliser les **3 lignes de texte**
3. Ajouter une **URL d'image de fond** (optionnel)
4. Voir l'**aperçu** en temps réel

### **Étape 3 : Sauvegarde**
1. Cliquer sur "💾 Sauvegarder les modifications"
2. Attendre la confirmation "Configuration sauvée avec succès !"
3. Cliquer sur "👁️ Voir la boutique"

---

## ✅ **Test de fonctionnement**

### **Test API :**
```bash
curl "http://localhost:3000/api/public/config" | grep "interface"
```

### **Test boutique :**
```
http://localhost:3001/shop
```

---

## 🚀 **Résultat**

- ✅ **Page d'accueil** : `{titre}` 
- ✅ **Page VIP** : `VIP {titre}`
- ✅ **Page recherche** : `RECHERCHE {titre}`
- ✅ **Image de fond** : Appliquée sur toutes les pages
- ✅ **Responsive** : Fonctionne sur mobile et desktop

---

## 🛠️ **Dépannage**

### **Si les changements n'apparaissent pas :**

1. **Forcer le cache :**
```bash
curl -X POST "http://localhost:3000/api/cache/refresh" -H "Authorization: Bearer JuniorAdmon123"
```

2. **Vérifier l'API :**
```bash
curl "http://localhost:3000/api/config" -H "Authorization: Bearer JuniorAdmon123"
```

3. **Redémarrer les serveurs :**
```bash
# Terminal 1
cd bot && node index.js

# Terminal 2  
cd admin-panel && npx next dev
```

---

## ⚠️ **Important**

- **Les paramètres du bot** (messages, boutons, etc.) restent **inchangés**
- Seule la **configuration visuelle de la boutique** a été simplifiée
- La **configuration du bot** reste accessible via d'autres pages admin si nécessaire

**La page est maintenant simple, rapide et focalisée uniquement sur l'apparence de votre boutique !** 🎯