# 📸 Guide - Image d'Accueil du Bot Telegram

## 🎯 **Fonctionnalité Implémentée**

Vous pouvez maintenant **ajouter une image d'accueil** qui s'affichera automatiquement dans tous les menus et sous-menus du bot Telegram, **sauf dans les détails des plugs** (qui utilisent leur propre image).

## 🔧 **Comment Configurer l'Image d'Accueil**

### **1. 📱 Via le Panel d'Administration**

1. **Accéder au panel :** Ouvrez votre panel d'administration
2. **Aller à Configuration Simple :** Cliquez sur "🔧 Configuration Simple"
3. **Section "🎉 Message d'Accueil Bot" :**
   - **Champ "Image d'accueil (URL)" :** Collez l'URL de votre image
   - **Exemple :** `https://example.com/welcome-image.jpg`
4. **Sauvegarder :** Cliquez sur "💾 Sauvegarder"

### **2. 🖼️ Format d'Image Recommandé**

- **Dimensions :** 800x400 pixels (ratio 2:1)
- **Format :** JPG, PNG, WebP
- **Taille :** Maximum 5MB
- **URL :** Doit être accessible publiquement (https://)

### **3. 🌐 Hébergement d'Images**

**Options recommandées :**
- **Imgur :** Gratuit, simple
- **Cloudinary :** Professionnel
- **Discord CDN :** Via un serveur Discord
- **Google Drive :** (avec lien public)

## 📍 **Où l'Image s'Affiche**

### **✅ L'image d'accueil apparaît dans :**

- **🏠 Menu principal** - Commande `/start`
- **🔌 Menu "Top Des Plugs"** - Liste des options
- **👑 Menu "Boutiques VIP"** - Liste des plugs VIP
- **📋 Menu "Tous les plugs"** - Liste complète
- **🔍 Menus de filtrage** - Par service, par pays
- **🔙 Retours aux menus** - Navigation arrière

### **❌ L'image d'accueil N'apparaît PAS dans :**

- **📄 Détails des plugs** - Utilise l'image du plug uniquement
- **💬 Messages d'erreur** - Texte simple
- **🔔 Notifications** - Toasts et alertes

## 🎨 **Exemples d'Utilisation**

### **1. Logo de Boutique**
```
URL: https://votre-site.com/logo-boutique.png
Usage: Branding consistent dans tous les menus
```

### **2. Image de Bienvenue Personnalisée**
```
URL: https://imgur.com/abc123.jpg
Usage: Message visuel accueillant pour les utilisateurs
```

### **3. Image Promotionnelle**
```
URL: https://cloudinary.com/promo-image.webp
Usage: Promotion d'offres spéciales
```

## 🔄 **Logique d'Affichage (Technique)**

```javascript
// Dans les menus et sous-menus
const imageToUse = plugImage || (!isPlugDetails ? welcomeImage : null);

// ✅ Menu principal: utilise welcome.image
// ✅ Menu plugs: utilise welcome.image
// ❌ Détails plug: utilise SEULEMENT plug.image (pas de fallback)
```

## 🧪 **Tester la Configuration**

### **1. Via le Script de Test**
```bash
cd bot
node scripts/test-welcome-image.js
```

### **2. Dans le Bot Telegram**
1. **Commande `/start`** → Doit afficher l'image
2. **Cliquer "🔌 Top Des Plugs"** → Doit afficher l'image
3. **Cliquer sur un plug** → Doit afficher l'image du plug (pas d'accueil)
4. **Cliquer "🔙 Retour"** → Doit afficher l'image d'accueil

## ⚡ **Dépannage**

### **❌ L'image ne s'affiche pas**

**Causes possibles :**
1. **URL incorrecte** → Vérifiez que l'URL est accessible
2. **Protocole HTTP** → Utilisez HTTPS uniquement
3. **Image trop lourde** → Réduisez la taille (< 5MB)
4. **Format non supporté** → Utilisez JPG/PNG/WebP

**Solutions :**
```bash
# Tester l'URL dans un navigateur
curl -I https://votre-image.jpg

# Vérifier la configuration
cd bot
node scripts/debug-config-api.js
```

### **🔄 L'image ne se met pas à jour**

**Actions :**
1. **Vider le cache Telegram** → Redémarrer l'app
2. **Redémarrer le bot** → Sur Render.com
3. **Vérifier la sauvegarde** → Console F12 dans admin panel

## 📊 **Monitoring et Logs**

### **Console Logs à Surveiller**
```bash
# Image d'accueil détectée
🖼️ Images: plug=false, welcome=true, isPlugDetails=false, using=true
📸 URL image utilisée: https://example.com/image.jpg...

# Détails de plug (pas d'image d'accueil)
🖼️ Images: plug=false, welcome=true, isPlugDetails=true, using=false
📝 Pas d'image, édition texte seulement
```

## 🎯 **Meilleures Pratiques**

### **🎨 Design**
- **Cohérence :** Utilisez votre charte graphique
- **Lisibilité :** Texte contrasté sur l'image
- **Simplicité :** Évitez les images trop chargées

### **⚡ Performance**
- **Optimisation :** Compressez vos images
- **CDN :** Utilisez un hébergement rapide
- **Cache :** Les images sont mises en cache par Telegram

### **🔄 Maintenance**
- **Backup :** Gardez une copie locale
- **Versioning :** Numérotez vos images
- **Tests :** Vérifiez après chaque changement

## 📋 **Checklist de Configuration**

- [ ] **URL d'image configurée** dans le panel admin
- [ ] **Image accessible** via HTTPS
- [ ] **Format supporté** (JPG/PNG/WebP)
- [ ] **Taille optimisée** (< 5MB, 800x400 recommandé)
- [ ] **Test menu principal** → Image s'affiche
- [ ] **Test menus plugs** → Image s'affiche
- [ ] **Test détails plug** → Image du plug uniquement
- [ ] **Bot redémarré** pour prise en compte
- [ ] **Cache vidé** si nécessaire

## 🚀 **Exemple Complet**

```bash
# 1. Configuration
Image URL: https://imgur.com/VotreLogo.png
Text: "🎉 Bienvenue dans notre boutique premium !"

# 2. Test
cd bot && node scripts/test-welcome-image.js

# 3. Validation
/start → ✅ Image visible
🔌 Top Plugs → ✅ Image visible  
📄 Détails plug → ✅ Image du plug uniquement
```

---

**🎉 Résultat :** Votre bot aura maintenant une image d'accueil professionnelle qui s'affiche de manière cohérente dans tous les menus, renforçant votre image de marque tout en préservant l'individualité des plugs dans leurs détails.