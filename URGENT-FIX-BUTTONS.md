# 🚨 CORRECTION URGENTE DES BOUTONS BOT

## ❌ ACTUELLEMENT (À CHANGER)
```
📞 Contact
Contactez-nous pour plus d'informations.
@findyourplugsav

ℹ️ Info
Nous listons les plugs du monde entier par Pays / Ville découvrez notre mini-app 🌍🔌
Pour toute demande spécifique contacter nous @findyourplugsav 📲
```

## ✅ NOUVEAU (CE QUE VOUS VOULEZ)
```
📞 Contact
Contactez-nous pour plus d'informations.
@Findyourplugadmin

ℹ️ Info
Nous listons les plugs du monde entier par Pays / Ville découvrez notre mini-app 🌍🔌
Pour toute demande spécifique contacter nous @Findyourplugadmin 📲
```

## 🔧 SOLUTION IMMÉDIATE

### Option 1: Via Render (RECOMMANDÉ - 5 minutes)
1. Allez sur https://dashboard.render.com
2. Trouvez votre service `safepluglink-6hzr`
3. Cliquez sur "Environment"
4. Ajoutez ces variables:
   ```
   BOT_CONTACT_CONTENT=Contactez-nous pour plus d'informations.\n@Findyourplugadmin
   BOT_INFO_CONTENT=Nous listons les plugs du monde entier par Pays / Ville découvrez notre mini-app 🌍🔌\n\nPour toute demande spécifique contacter nous @Findyourplugadmin 📲
   ```
5. Cliquez sur "Save Changes"
6. Le bot redémarrera automatiquement avec les nouveaux textes

### Option 2: Modification directe du code bot
1. Dans `/workspace/bot/index.js`, cherchez les lignes avec les textes des boutons
2. Remplacez `@findyourplugsav` par `@Findyourplugadmin`
3. Committez et poussez les changements
4. Redéployez sur Render

## ⚠️ IMPORTANT
- Le bot DOIT être redémarré pour appliquer les changements
- Les changements via le panel admin ne fonctionnent pas à cause du bug `invalidateConfigCache`
- La solution la plus rapide est d'utiliser les variables d'environnement (Option 1)

## 📝 Configuration finale
Les boutons afficheront:
- Contact: `@Findyourplugadmin` (avec majuscule F)
- Info: `@Findyourplugadmin` (avec majuscule F)