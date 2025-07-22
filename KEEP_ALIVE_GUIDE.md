# 🚀 Guide Keep-Alive pour Bot Telegram sur Render

## Problème
Les services gratuits de Render s'endorment après 15 minutes d'inactivité, ce qui rend votre bot Telegram inaccessible.

## Solutions disponibles

### 1. 💰 **Solution payante (Recommandée)**
- Passez à un plan payant Render ($7/mois minimum)
- Le bot reste actif 24/7 automatiquement
- Pas de configuration supplémentaire nécessaire

### 2. 🔄 **Keep-Alive interne (Gratuit)**
J'ai déjà ajouté les endpoints nécessaires à votre bot :
- `/health` - Retourne l'état détaillé du bot
- `/ping` - Simple endpoint pour vérifications rapides

### 3. 🌐 **UptimeRobot (Gratuit - Recommandé)**

#### Étapes :
1. Allez sur [uptimerobot.com](https://uptimerobot.com)
2. Créez un compte gratuit
3. Ajoutez un nouveau monitor :
   - **Type** : HTTP(s)
   - **URL** : `https://votre-bot-name.onrender.com/health`
   - **Monitoring Interval** : 5 minutes (gratuit)
   - **Nom** : "Bot Telegram Keep-Alive"

4. UptimeRobot pingera votre bot toutes les 5 minutes
5. Votre bot restera éveillé automatiquement !

### 4. 🤖 **Keep-Alive Script automatique**

Si vous voulez un script qui tourne en parallèle :

```bash
# Dans votre terminal local ou sur un autre serveur
node keep-alive.js
```

### 5. 📱 **GitHub Actions (Gratuit)**

Créez `.github/workflows/keep-alive.yml` :

```yaml
name: Keep Bot Alive
on:
  schedule:
    - cron: '*/10 * * * *'  # Toutes les 10 minutes
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Bot
        run: |
          curl -f https://votre-bot-name.onrender.com/health || exit 1
```

## Configuration Render

### Variables d'environnement à ajouter :
- `RENDER_EXTERNAL_URL` : L'URL de votre service Render

### Dans le dashboard Render :
1. Allez dans votre service
2. Settings → Environment
3. Ajoutez : `RENDER_EXTERNAL_URL=https://votre-service.onrender.com`

## Vérification

Pour vérifier que ça marche :
1. Allez sur `https://votre-bot.onrender.com/health`
2. Vous devriez voir :
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 1234.56,
  "botConnected": true,
  "message": "Bot Telegram actif"
}
```

## Recommandations

**Pour un usage professionnel** : Plan payant Render
**Pour des tests/hobby** : UptimeRobot + endpoints que j'ai ajoutés

## Logs à surveiller
Dans Render, vous verrez ces logs si le keep-alive fonctionne :
```
✅ Ping réussi - Status: 200 - Durée: 123ms - 10:30:15
```

Le bot restera maintenant actif en permanence ! 🎉