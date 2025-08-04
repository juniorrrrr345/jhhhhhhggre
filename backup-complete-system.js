const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

const MONGODB_URI = 'mongodb+srv://teste:Junior@junior.jiy8uam.mongodb.net/?retryWrites=true&w=majority&appName=Junior';

// Fonction pour créer un dossier s'il n'existe pas
async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`Erreur création dossier ${dirPath}:`, error);
  }
}

async function backupCompleteSystem() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Créer le dossier de sauvegarde avec timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `backup-${timestamp}`;
    await ensureDir(backupDir);

    console.log(`\n📁 Dossier de sauvegarde créé: ${backupDir}`);

    // Liste des collections à sauvegarder
    const collections = [
      'plugs',          // Toutes les boutiques
      'configs',        // Configuration du bot et panel admin
      'users',          // Utilisateurs
      'plugapplications', // Applications/formulaires
      'votes',          // Votes
      'notifications',  // Notifications
      'usercontexts',   // Contextes utilisateurs
      'reports'         // Rapports
    ];

    const backup = {
      timestamp: new Date().toISOString(),
      mongoUri: MONGODB_URI,
      collections: {}
    };

    // Sauvegarder chaque collection
    for (const collectionName of collections) {
      try {
        console.log(`\n📊 Sauvegarde de la collection: ${collectionName}`);
        const collection = mongoose.connection.db.collection(collectionName);
        const documents = await collection.find({}).toArray();
        
        backup.collections[collectionName] = {
          count: documents.length,
          data: documents
        };
        
        // Sauvegarder aussi dans un fichier séparé
        const filePath = path.join(backupDir, `${collectionName}.json`);
        await fs.writeFile(
          filePath,
          JSON.stringify(documents, null, 2),
          'utf8'
        );
        
        console.log(`✅ ${documents.length} documents sauvegardés`);
      } catch (error) {
        console.error(`❌ Erreur pour ${collectionName}:`, error.message);
        backup.collections[collectionName] = {
          count: 0,
          error: error.message,
          data: []
        };
      }
    }

    // Statistiques de la sauvegarde
    console.log('\n📈 Résumé de la sauvegarde:');
    console.log('========================');
    
    let totalDocuments = 0;
    for (const [collection, data] of Object.entries(backup.collections)) {
      console.log(`${collection}: ${data.count} documents`);
      totalDocuments += data.count;
    }
    
    console.log(`\nTotal: ${totalDocuments} documents sauvegardés`);

    // Sauvegarder le fichier de sauvegarde complet
    const fullBackupPath = path.join(backupDir, 'complete-backup.json');
    await fs.writeFile(
      fullBackupPath,
      JSON.stringify(backup, null, 2),
      'utf8'
    );

    // Créer un fichier README pour la sauvegarde
    const readmeContent = `# Sauvegarde complète du système FindYourPlug

## Date: ${new Date().toLocaleString('fr-FR')}

## Contenu de la sauvegarde:

### Collections sauvegardées:
${Object.entries(backup.collections)
  .map(([name, data]) => `- **${name}**: ${data.count} documents`)
  .join('\n')}

### Total: ${totalDocuments} documents

## Structure des fichiers:
- \`complete-backup.json\`: Sauvegarde complète avec métadonnées
- \`plugs.json\`: Toutes les boutiques
- \`configs.json\`: Configuration du bot et panel admin
- \`users.json\`: Tous les utilisateurs
- \`plugapplications.json\`: Toutes les applications/formulaires
- \`votes.json\`: Tous les votes
- \`notifications.json\`: Toutes les notifications
- \`usercontexts.json\`: Contextes des utilisateurs
- \`reports.json\`: Rapports

## Pour restaurer:
1. Utilisez le script \`restore-from-backup.js\`
2. Spécifiez le dossier de sauvegarde
3. Confirmez la restauration

## Notes importantes:
- Cette sauvegarde contient TOUTES les données du système
- Les IDs MongoDB sont préservés
- Les dates sont au format ISO 8601
`;

    await fs.writeFile(
      path.join(backupDir, 'README.md'),
      readmeContent,
      'utf8'
    );

    console.log(`\n✅ Sauvegarde complète terminée!`);
    console.log(`📁 Dossier: ${backupDir}`);
    console.log(`📄 Fichiers créés: ${collections.length + 2} fichiers`);

    // Afficher quelques détails importants
    if (backup.collections.plugs) {
      console.log(`\n🏪 Boutiques: ${backup.collections.plugs.count}`);
      const activePlugs = backup.collections.plugs.data.filter(p => p.isActive).length;
      console.log(`   - Actives: ${activePlugs}`);
      console.log(`   - Inactives: ${backup.collections.plugs.count - activePlugs}`);
    }

    if (backup.collections.configs && backup.collections.configs.data.length > 0) {
      const config = backup.collections.configs.data.find(c => c._id === 'main');
      if (config) {
        console.log(`\n⚙️ Configuration principale trouvée`);
        console.log(`   - Message d'accueil: ${config.welcome?.text?.substring(0, 50)}...`);
        console.log(`   - Mode maintenance: ${config.maintenanceMode ? 'Activé' : 'Désactivé'}`);
      }
    }

    return backupDir;

  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter la sauvegarde
backupCompleteSystem().then(backupDir => {
  if (backupDir) {
    console.log('\n💡 Pour télécharger la sauvegarde, utilisez:');
    console.log(`   tar -czf ${backupDir}.tar.gz ${backupDir}/`);
  }
});