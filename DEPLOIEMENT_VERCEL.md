# 🚀 Guide de Déploiement Vercel - FindYourPlug

## 📋 Corrections Appliquées

### ✅ Problèmes Résolus
1. **Réseaux sociaux boutique** : Utilise maintenant `socialMediaList` comme fallback si `shopSocialMediaList` est vide
2. **Mode local agressif** : Ne s'active plus que pour les erreurs critiques de réseau (502, 503, 504, NetworkError, etc.)
3. **Timeouts trop courts** : Augmentés de 6s à 15s pour éviter les fausses erreurs
4. **Affichage automatique** : Les réseaux sociaux configurés dans l'API s'affichent automatiquement

## 🎯 Déploiement sur Vercel

### 1. Prérequis
- Repository GitHub à jour avec les dernières corrections
- Compte Vercel connecté à GitHub
- Accès au panel admin du bot Telegram

### 2. Configuration Vercel - Panel Admin

#### A. Depuis le Dashboard Vercel
1. **Nouveau Projet** : Cliquez sur "New Project"
2. **Import Git Repository** : Sélectionnez `juniorrrrr345/jhhhhhhggre`
3. **Configuration du déploiement** :
   ```
   Framework Preset: Next.js
   Root Directory: admin-panel
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

#### B. Variables d'Environnement
Configurez ces variables dans Vercel :
```env
NODE_ENV=production
BOT_API_URL=https://jhhhhhhggre.onrender.com
NEXT_PUBLIC_BOT_URL=https://jhhhhhhggre.onrender.com
NEXT_PUBLIC_API_URL=https://jhhhhhhggre.onrender.com
```

#### C. Configuration Avancée
```json
{
  "functions": {
    "pages/admin/messages.js": { "memory": 1024 },
    "pages/api/image-proxy.js": { "memory": 512, "maxDuration": 15 }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### 3. Déploiement du Bot (Optionnel)

Si vous voulez aussi déployer le bot sur Vercel :

#### Configuration Bot
```
Framework Preset: Other
Root Directory: bot
Build Command: npm install
Output Directory: (laisser vide)
Install Command: npm install
```

#### Variables d'Environnement Bot
```env
NODE_ENV=production
TELEGRAM_BOT_TOKEN=votre_token_bot
MONGO_URI=votre_mongodb_uri
PORT=3000
```

### 4. Vérification du Déploiement

#### Tests à Effectuer
1. **Page de connexion** : `/` - Vérifier que la page se charge
2. **Boutique publique** : `/shop` - Vérifier l'affichage des réseaux sociaux
3. **Panel admin** : `/admin` - Vérifier qu'il n'y a pas de "Mode local" permanent
4. **Réseaux sociaux** : `/admin/social-media` - Tester la gestion des réseaux

#### URLs de Test
```
Panel Admin: https://votre-app.vercel.app
Boutique: https://votre-app.vercel.app/shop
Configuration: https://votre-app.vercel.app/admin/config
Réseaux sociaux: https://votre-app.vercel.app/admin/social-media
```

### 5. Commandes de Déploiement Local

#### Script de Déploiement Automatique
```bash
#!/bin/bash
# deploy-vercel.sh

echo "🚀 Déploiement FindYourPlug sur Vercel..."

# Vérification du repository
echo "📡 Vérification des modifications..."
git status

# Commit et push des changements
echo "💾 Sauvegarde des modifications..."
git add .
git commit -m "🚀 Déploiement Vercel $(date)"
git push origin main

# Déploiement Vercel
echo "🌟 Déploiement sur Vercel..."
cd admin-panel
vercel --prod

echo "✅ Déploiement terminé !"
echo "🔗 Votre application est maintenant disponible"
```

#### Commandes Manuelles
```bash
# 1. Preparation
git add .
git commit -m "🚀 Mise à jour pour déploiement"
git push origin main

# 2. Déploiement
cd admin-panel
npm install
npm run build

# 3. Déploiement Vercel (si CLI installé)
vercel --prod
```

### 6. Configuration Post-Déploiement

#### A. DNS et Domaine (Optionnel)
1. **Domaine personnalisé** : Ajoutez votre domaine dans Vercel
2. **SSL automatique** : Activé par défaut par Vercel
3. **Redirections** : Configurez si nécessaire

#### B. Monitoring
1. **Analytics Vercel** : Activez les analytics dans les paramètres
2. **Logs** : Surveillez les logs de déploiement
3. **Performance** : Vérifiez les Core Web Vitals

### 7. Dépannage

#### Erreurs Courantes

**Erreur de build Next.js**
```bash
# Solution
cd admin-panel
rm -rf .next node_modules
npm install
npm run build
```

**Problème de Variables d'Environnement**
- Vérifiez que toutes les variables sont définies dans Vercel
- Redéployez après avoir ajouté les variables

**Erreur de connexion API**
- Vérifiez que `BOT_API_URL` pointe vers le bon serveur
- Testez l'URL avec curl : `curl https://jhhhhhhggre.onrender.com/api/public/config`

#### Logs Utiles
```bash
# Logs Vercel
vercel logs --follow

# Logs locaux
npm run dev
# ou
npm run build && npm start
```

### 8. Maintenance

#### Mises à Jour
1. **Automatiques** : Vercel redéploie automatiquement sur push vers `main`
2. **Manuelles** : Utilisez `vercel --prod` pour forcer un redéploiement

#### Surveillance
- **Uptime** : Utilisez les analytics Vercel
- **Erreurs** : Surveillez les logs d'erreur
- **Performance** : Vérifiez régulièrement les métriques

### 9. URLs Importantes

#### Production
- **Panel Admin** : `https://votre-app.vercel.app`
- **Boutique** : `https://votre-app.vercel.app/shop`
- **API Bot** : `https://jhhhhhhggre.onrender.com`

#### Documentation
- **Vercel Docs** : https://vercel.com/docs
- **Next.js Docs** : https://nextjs.org/docs
- **GitHub Repository** : https://github.com/juniorrrrr345/jhhhhhhggre

---

## 🎉 Félicitations !

Votre application FindYourPlug est maintenant déployée sur Vercel avec :
- ✅ Affichage correct des réseaux sociaux
- ✅ Mode local optimisé
- ✅ Timeouts améliorés
- ✅ Performance optimisée

Pour toute question, consultez la documentation ou les logs de déploiement.