# ✅ Configuration Synchronisée avec Render

## 🎯 **Source de données :**
**URL :** `https://safepluglink-6hzr.onrender.com`

## 📊 **Boutique synchronisée :**
- **Nom :** "teste"
- **ID :** 68835c4222586e073b5d57c3
- **Type :** VIP
- **Services :** Livraison, Postal, Meetup

## 🔧 **Configuration appliquée :**

### 1. `vercel.json`
```json
{
  "env": {
    "BOT_API_URL": "https://safepluglink-6hzr.onrender.com",
    "NEXT_PUBLIC_BOT_URL": "https://safepluglink-6hzr.onrender.com", 
    "NEXT_PUBLIC_API_URL": "https://safepluglink-6hzr.onrender.com"
  }
}
```

### 2. `pages/api/cors-proxy.js`
```javascript
const apiUrl = process.env.BOT_API_URL || 'https://safepluglink-6hzr.onrender.com'
```

## 🚀 **Déploiement :**

### Automatique :
```bash
./deploy-vercel.sh
```

### Manuel :
```bash
npm run build
vercel --prod
```

## ✅ **Résultat :**
Après déploiement, la boutique Vercel affichera uniquement la boutique "teste" synchronisée depuis l'instance Render.

## 🔍 **Vérification :**
```bash
# Test URL Render
curl https://safepluglink-6hzr.onrender.com/api/public/plugs

# Test après déploiement Vercel
curl https://[votre-url].vercel.app/api/cors-proxy \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"/api/public/plugs","method":"GET"}'
```