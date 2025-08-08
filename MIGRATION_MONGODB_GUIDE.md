# Guide de Migration MongoDB

## ✅ État actuel

La nouvelle base de données MongoDB a été configurée avec succès !

### 🔗 Nouvelle URI MongoDB
```
mongodb+srv://teste:Junior@junior.jiy8uam.mongodb.net/?retryWrites=true&w=majority&appName=Junior
```

### 📊 Configuration initiale créée
- ✅ Collection `configs` avec la configuration de base
- ✅ Message de bienvenue configuré
- ✅ Langues disponibles : FR, EN, ES, AR
- ✅ Logo et image de fond par défaut

## 📋 Étapes pour finaliser la migration

### 1. Mettre à jour l'URI sur Render

1. Connectez-vous à [Render Dashboard](https://dashboard.render.com)
2. Sélectionnez votre service **bot**
3. Cliquez sur **"Environment"** dans le menu de gauche
4. Trouvez la variable `MONGODB_URI`
5. Remplacez la valeur actuelle par :
   ```
   mongodb+srv://teste:Junior@junior.jiy8uam.mongodb.net/?retryWrites=true&w=majority&appName=Junior
   ```
6. Cliquez sur **"Save Changes"**
7. Le bot redémarrera automatiquement

### 2. Vérifier que tout fonctionne

Après le redémarrage :
1. Testez le bot sur Telegram avec `/start`
2. Vérifiez que le panel admin fonctionne : https://safepluglink-6hzr.onrender.com/admin
3. Connectez-vous avec le mot de passe : `ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1`

### 3. Recréer vos boutiques

Depuis le panel admin :
1. Allez dans **"Gestion des Plugs"**
2. Cliquez sur **"Ajouter un Plug"**
3. Recréez vos 13 boutiques une par une

### 4. Reconfigurer le bot (optionnel)

Depuis le panel admin :
1. **Configuration** : Personnalisez les messages de bienvenue
2. **Messages** : Configurez les messages Contact/Info
3. **Réseaux sociaux** : Ajoutez vos liens sociaux

## ⚠️ Important

- La nouvelle base est **vide** (sauf la configuration de base)
- Vous devrez recréer :
  - ✅ Les boutiques (plugs)
  - ✅ Les utilisateurs viendront automatiquement quand ils utiliseront le bot
  - ✅ Les statistiques repartiront de zéro

## 🔧 En cas de problème

Si quelque chose ne fonctionne pas :
1. Vérifiez les logs sur Render
2. Assurez-vous que l'URI est correctement copiée (sans espaces)
3. Attendez 2-3 minutes que le service redémarre complètement

## 💾 Sauvegarde de l'ancienne URI

Pour référence, voici l'ancienne URI (au cas où vous voudriez revenir en arrière) :
```
mongodb+srv://teste:SfePlug@tesye.qazpla.mongodb.net/?retryWrites=true&w=majority&appName=Tesye
```
⚠️ Note : Cette URI semble avoir des problèmes de connexion DNS.

---

✅ **Tout est prêt !** Suivez les étapes ci-dessus pour finaliser la migration.