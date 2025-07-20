# Guide complet : Images des Plugs (Boutiques)

## Comment ça fonctionne ? 🖼️

Oui, vous pouvez ajouter des images aux boutiques (plugs) et **elles s'afficheront automatiquement** :
- ✅ **Dans le bot Telegram** quand on consulte un plug
- ✅ **Sur le site web** (pages accueil, recherche, VIP)
- ✅ **Dans le panel admin** pour la gestion

## Où ajouter les images ? 📝

### 1. **Création d'une nouvelle boutique**
Dans le panel admin → **Boutiques** → **Nouvelle boutique** :
```
┌─────────────────────────────────┐
│ 📝 Formulaire nouvelle boutique │
├─────────────────────────────────┤
│ Nom: Ma Boutique               │
│ Description: ...               │
│ URL de l'image: [VOTRE_URL]    │ ← ICI
│ ...                            │
└─────────────────────────────────┘
```

### 2. **Modification d'une boutique existante**
Panel admin → **Boutiques** → **Modifier** une boutique :
```
┌─────────────────────────────────┐
│ ✏️ Modifier boutique           │
├─────────────────────────────────┤
│ URL de l'image: [VOTRE_URL]    │ ← ICI
│ ...                            │
└─────────────────────────────────┘
```

## Formats d'images supportés 🎨

### **URLs d'images acceptées :**
- ✅ **HTTPS obligatoire** : `https://exemple.com/image.jpg`
- ✅ **Formats** : `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- ✅ **Services recommandés** : 
  - [imgur.com](https://imgur.com) - Gratuit et facile
  - [cloudinary.com](https://cloudinary.com) - Professionnel
  - [unsplash.com](https://unsplash.com) - Images gratuites
  - Google Drive/Dropbox (liens publics)

### **Tailles recommandées :**
- 📐 **Dimensions idéales** : 300x200 pixels minimum
- 📐 **Ratio optimal** : 3:2 (largeur:hauteur)
- 📦 **Poids** : Moins de 2MB pour de bonnes performances

## Comment obtenir une URL d'image ? 🔗

### **Méthode 1 : Imgur (Recommandé - Gratuit)**
1. Allez sur [imgur.com](https://imgur.com)
2. Cliquez sur **"Upload"**
3. Sélectionnez votre image
4. **Clic droit** sur l'image → **"Copier l'adresse de l'image"**
5. Collez l'URL dans le champ image : `https://i.imgur.com/XXXXX.jpg`

### **Méthode 2 : Google Drive**
1. Uploadez votre image sur Google Drive
2. Clic droit → **"Partager"** → **"Modifier l'accès"** → **"Visible par tous"**
3. Récupérez l'ID du fichier dans l'URL
4. Utilisez : `https://drive.google.com/uc?id=VOTRE_ID`

### **Méthode 3 : Sites d'images gratuites**
- [Unsplash](https://unsplash.com) - Clic droit → Copier l'adresse
- [Pexels](https://pexels.com) - Télécharger → Uploader sur Imgur

## Où les images s'affichent ? 👀

### **1. Dans le Bot Telegram** 🤖
Quand un utilisateur consulte une boutique :
```
┌─────────────────────────────┐
│ [IMAGE DE LA BOUTIQUE]      │ ← Votre image ici
├─────────────────────────────┤
│ 🏪 Nom de la boutique       │
│ 📝 Description...           │
│ 🌍 Pays: France, Belgique   │
│ 📱 Boutons contact          │
└─────────────────────────────┘
```

### **2. Sur le site web** 🌐
- **Page d'accueil** (`/shop`) : Grille des boutiques
- **Page recherche** (`/shop/search`) : Résultats de recherche  
- **Page VIP** (`/shop/vip`) : Boutiques premium
- **Page détails** (`/shop/[id]`) : Fiche complète

### **3. Panel Admin** ⚙️
- **Liste des boutiques** : Miniatures
- **Détails d'une boutique** : Image complète
- **Formulaires** : Prévisualisation en temps réel

## Prévisualisation en temps réel ⚡

Dans le formulaire admin, dès que vous collez une URL :
```
┌─────────────────────────────────┐
│ URL: https://i.imgur.com/xxx.jpg│
├─────────────────────────────────┤
│ 📷 Prévisualisation            │
│ [IMAGE AFFICHÉE ICI]           │ ← Aperçu immédiat
└─────────────────────────────────┘
```

## Gestion d'erreur automatique 🛡️

Si l'image ne charge pas :
- ✅ **Bot** : Envoie le message texte sans image
- ✅ **Site web** : Affiche un placeholder (`/placeholder.jpg`)
- ✅ **Admin** : Cache l'aperçu défaillant

## Exemples d'URLs valides ✅

```bash
# Imgur
https://i.imgur.com/ABC123.jpg

# Cloudinary  
https://res.cloudinary.com/demo/image/upload/sample.jpg

# Unsplash
https://images.unsplash.com/photo-123456789

# Google Drive (après configuration)
https://drive.google.com/uc?id=1ABC123DEF456

# Site web direct
https://monsite.com/images/boutique.png
```

## Exemples d'URLs invalides ❌

```bash
# HTTP (non sécurisé)
http://site.com/image.jpg  ❌

# Fichier local
C:\Images\boutique.jpg  ❌

# Lien Google Drive direct
https://drive.google.com/file/d/123/view  ❌

# Extension non supportée
https://site.com/image.pdf  ❌
```

## Optimisation des images 🚀

### **Pour de meilleures performances :**
1. **Compressez vos images** avec [TinyPNG](https://tinypng.com)
2. **Utilisez WebP** si possible (meilleure compression)
3. **Redimensionnez** à 600x400px maximum
4. **CDN recommandé** : Cloudinary pour usage intensif

### **Qualité vs Taille :**
- **Petites boutiques** : 300x200px, ~50KB
- **Images de qualité** : 600x400px, ~200KB  
- **Maximum conseillé** : 800x600px, ~500KB

## API d'upload (Futur) 📤

**Note :** L'API d'upload existe (`/api/upload`) mais génère actuellement des URLs temporaires. 

**Pour la production, il faudra :**
1. Configurer un service cloud (Cloudinary, AWS S3)
2. Modifier l'API pour stocker les images
3. Ajouter un bouton "Upload" dans le formulaire

## Workflow recommandé 📋

1. **Préparez votre image** (300x200px minimum)
2. **Uploadez sur Imgur** (gratuit, rapide)
3. **Copiez l'URL** de l'image
4. **Collez dans le formulaire** admin
5. **Vérifiez la prévisualisation**
6. **Sauvegardez** la boutique

## Questions fréquentes ❓

**Q: L'image ne s'affiche pas dans le bot ?**
R: Vérifiez que l'URL est HTTPS et que l'image est accessible publiquement.

**Q: Puis-je changer l'image plus tard ?**
R: Oui, modifiez la boutique et changez l'URL de l'image.

**Q: L'image est trop grande/petite ?**
R: L'affichage s'adapte automatiquement, mais 300x200px est optimal.

**Q: Puis-je mettre plusieurs images ?**
R: Actuellement une seule image par boutique. Vous pouvez créer un collage.

**Q: Ça marche sur mobile ?**
R: Oui, l'affichage est responsive sur tous les appareils.

---

**✅ En résumé :** Ajoutez simplement une URL d'image HTTPS dans le formulaire de boutique, et elle s'affichera automatiquement dans le bot ET sur le site web !