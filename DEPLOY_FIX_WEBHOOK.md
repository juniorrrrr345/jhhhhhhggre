# 🔧 Guide de Correction du Webhook sur Render

## ✅ État Actuel

Le webhook a été configuré avec succès :
- **URL**: `https://safepluglink-6hzr.onrender.com/webhook/8049816368:AAHyroX2rkSFeT3HEMesn_qgqD6nFCYxciY`
- **Token**: `8049816368:AAHyroX2rkSFeT3HEMesn_qgqD6nFCYxciY`
- **Statut**: ✅ Configuré sans erreur

## 🚀 Actions à Effectuer

### 1. Pousser les Modifications sur GitHub

```bash
cd /workspace
git add bot/index.js
git commit -m "Fix: Correction du double slash dans l'URL du webhook et ajout de logs"
git push origin main
```

### 2. Vérifier le Déploiement sur Render

1. Allez sur [Render Dashboard](https://dashboard.render.com)
2. Trouvez votre service `telegram-bot-vip` ou `safepluglink-6hzr`
3. Vérifiez que le déploiement automatique se lance
4. Attendez que le statut passe à "Live" (environ 2-3 minutes)

### 3. Vérifier les Logs sur Render

Dans les logs, vous devriez voir :
```
✅ Webhook configuré: https://safepluglink-6hzr.onrender.com/webhook/8049816368:AAHyroX2rkSFeT3HEMesn_qgqD6nFCYxciY
```

Et quand vous envoyez `/start`, vous devriez voir :
```
🔔 Webhook reçu: {
  updateType: 'Update',
  hasMessage: true,
  messageText: '/start'
}
```

### 4. Variables d'Environnement sur Render

Assurez-vous que ces variables sont définies :
- `TELEGRAM_BOT_TOKEN`: `8049816368:AAHyroX2rkSFeT3HEMesn_qgqD6nFCYxciY`
- `WEBHOOK_URL`: `https://safepluglink-6hzr.onrender.com` (sans slash à la fin)
- `NODE_ENV`: `production`
- `PORT`: `10000`

## 🧪 Test Final

1. Ouvrez Telegram
2. Trouvez votre bot
3. Envoyez `/start`
4. Le bot devrait répondre avec le menu principal

## ❌ Si Ça Ne Fonctionne Toujours Pas

### Option 1: Redémarrer le Service
1. Sur Render Dashboard, cliquez sur "Manual Deploy" > "Clear build cache & deploy"

### Option 2: Vérifier le Handler
Le problème pourrait venir du handler `/start`. Vérifiez que :
- La commande est bien enregistrée : `bot.command('start', handleStart)`
- Le handler existe et fonctionne
- La base de données MongoDB est accessible

### Option 3: Mode Debug
Ajoutez temporairement plus de logs dans `handleStart` :
```javascript
async function handleStart(ctx) {
  console.log('🚀 /start reçu de:', ctx.from.id);
  // ... reste du code
}
```

## 📝 Commandes Utiles

```bash
# Vérifier l'état du webhook
curl https://api.telegram.org/bot8049816368:AAHyroX2rkSFeT3HEMesn_qgqD6nFCYxciY/getWebhookInfo

# Tester manuellement le webhook
curl -X POST https://safepluglink-6hzr.onrender.com/webhook/8049816368:AAHyroX2rkSFeT3HEMesn_qgqD6nFCYxciY \
  -H "Content-Type: application/json" \
  -d '{"update_id":1,"message":{"message_id":1,"text":"/start","chat":{"id":123,"type":"private"}}}'
```

## ✅ Résumé des Corrections

1. **Double slash corrigé** : L'URL du webhook n'a plus de double slash
2. **Logs ajoutés** : Chaque webhook reçu est maintenant loggé
3. **Webhook reconfiguré** : Le webhook pointe vers la bonne URL

Le bot devrait maintenant fonctionner correctement ! 🎉