# Guide de Redéploiement sur Render

## 🔧 Configuration du Token Admin

Le token admin par défaut est : `JuniorAdmon123`

Si vous avez changé le token, vous devez le mettre à jour sur Render.

## 🚀 Étapes pour redéployer sur Render

### 1. Connectez-vous à Render
- Allez sur https://dashboard.render.com
- Connectez-vous à votre compte

### 2. Trouvez votre service
- Cherchez le service `jhhhhhhggre`
- Cliquez dessus pour accéder aux détails

### 3. Mettez à jour les variables d'environnement
- Allez dans l'onglet "Environment"
- Vérifiez/Ajoutez ces variables :
  ```
  BOT_TOKEN = [Votre token Telegram Bot]
  MONGODB_URI = [Votre URI MongoDB]
  ADMIN_PASSWORD = JuniorAdmon123
  NODE_ENV = production
  ```

### 4. Redéployez manuellement
- Allez dans l'onglet "Settings"
- Cliquez sur "Manual Deploy" > "Deploy latest commit"
- Ou utilisez "Clear build cache & deploy" si vous voulez un déploiement complet

### 5. Vérifiez le déploiement
- Attendez que le statut passe à "Live"
- Vérifiez les logs pour s'assurer qu'il n'y a pas d'erreurs

## ✅ Vérification

Une fois déployé, testez :

1. **API Health Check** :
   ```bash
   curl https://jhhhhhhggre.onrender.com/health
   ```

2. **Test d'authentification admin** :
   ```bash
   curl https://jhhhhhhggre.onrender.com/api/plugs \
     -H "Authorization: Bearer JuniorAdmon123"
   ```

## 🔑 Important

- Le token par défaut est `JuniorAdmon123`
- Si vous voulez le changer, modifiez la variable `ADMIN_PASSWORD` sur Render
- Le panel admin sur Vercel utilise ce même token

## 🆘 En cas de problème

1. Vérifiez les logs sur Render
2. Assurez-vous que MongoDB est accessible
3. Vérifiez que le token Bot Telegram est correct
4. Essayez "Clear build cache & deploy" si le déploiement normal échoue

---

**Note** : Le redéploiement prend généralement 3-5 minutes.