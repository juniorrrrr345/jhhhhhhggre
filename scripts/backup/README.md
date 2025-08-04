# Scripts de Sauvegarde FindYourPlug

## 🔧 Installation

Assurez-vous d'avoir Node.js installé et les dépendances nécessaires :
```bash
npm install mongoose
```

## 📊 Sauvegarde Complète

### Utilisation
```bash
node scripts/backup/backup-complete-system.js
```

### Ce qui est sauvegardé
- ✅ Toutes les boutiques (plugs)
- ✅ Configuration complète (bot + panel admin)
- ✅ Tous les utilisateurs
- ✅ Toutes les applications/formulaires
- ✅ Tous les votes
- ✅ Toutes les notifications
- ✅ Contextes utilisateurs
- ✅ Rapports

### Résultat
- Un dossier `backup-YYYY-MM-DDTHH-mm-ss-sssZ/` contenant :
  - `complete-backup.json` : Sauvegarde complète
  - `plugs.json` : Toutes les boutiques
  - `configs.json` : Configuration
  - `users.json` : Utilisateurs
  - Et autres collections...
  - `README.md` : Documentation de la sauvegarde

## 🔄 Restauration

### Utilisation
```bash
node scripts/backup/restore-from-backup.js <dossier-de-sauvegarde>
```

### Exemple
```bash
node scripts/backup/restore-from-backup.js backup-2025-08-04T15-19-01-953Z
```

### ⚠️ ATTENTION
La restauration REMPLACE toutes les données existantes !

## 💾 Archivage

Pour créer une archive compressée :
```bash
tar -czf ma-sauvegarde.tar.gz backup-YYYY-MM-DDTHH-mm-ss-sssZ/
```

## 🔐 Configuration MongoDB

Les scripts utilisent l'URI MongoDB :
```
mongodb+srv://teste:Junior@junior.jiy8uam.mongodb.net/?retryWrites=true&w=majority&appName=Junior
```

Pour utiliser une autre base de données, modifiez la variable `MONGODB_URI` dans les scripts.

## 📅 Sauvegardes Automatiques

Pour automatiser les sauvegardes (Linux/Mac) :
```bash
# Ajouter au crontab pour une sauvegarde quotidienne à 2h du matin
0 2 * * * cd /chemin/vers/projet && node scripts/backup/backup-complete-system.js
```

## 🚀 Bonnes Pratiques

1. **Fréquence** : Sauvegardez au moins une fois par jour
2. **Stockage** : Conservez les sauvegardes sur un service cloud (Google Drive, Dropbox, etc.)
3. **Rotation** : Gardez au moins 7 jours de sauvegardes
4. **Test** : Testez régulièrement la restauration sur un environnement de test