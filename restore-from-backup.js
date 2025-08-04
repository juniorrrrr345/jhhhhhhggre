const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const MONGODB_URI = 'mongodb+srv://teste:Junior@junior.jiy8uam.mongodb.net/?retryWrites=true&w=majority&appName=Junior';

// Fonction pour demander confirmation
function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question + ' (oui/non): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'oui' || answer.toLowerCase() === 'yes');
    });
  });
}

async function restoreFromBackup(backupDir) {
  try {
    // Vérifier que le dossier existe
    try {
      await fs.access(backupDir);
    } catch {
      console.error(`❌ Le dossier ${backupDir} n'existe pas`);
      return;
    }

    // Lire le fichier de sauvegarde principal
    const backupFilePath = path.join(backupDir, 'complete-backup.json');
    const backupData = JSON.parse(await fs.readFile(backupFilePath, 'utf8'));

    console.log('\n📊 Informations de la sauvegarde:');
    console.log(`📅 Date: ${new Date(backupData.timestamp).toLocaleString('fr-FR')}`);
    console.log(`📁 Collections: ${Object.keys(backupData.collections).length}`);
    
    let totalDocs = 0;
    console.log('\n📋 Contenu:');
    for (const [collection, data] of Object.entries(backupData.collections)) {
      console.log(`   - ${collection}: ${data.count} documents`);
      totalDocs += data.count;
    }
    console.log(`\n📊 Total: ${totalDocs} documents`);

    // Demander confirmation
    console.log('\n⚠️  ATTENTION: Cette opération va REMPLACER toutes les données actuelles!');
    const confirm = await askConfirmation('Voulez-vous vraiment restaurer cette sauvegarde?');
    
    if (!confirm) {
      console.log('❌ Restauration annulée');
      return;
    }

    console.log('\n🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Restaurer chaque collection
    for (const [collectionName, collectionData] of Object.entries(backupData.collections)) {
      if (collectionData.count === 0) continue;

      console.log(`\n📥 Restauration de ${collectionName}...`);
      const collection = mongoose.connection.db.collection(collectionName);
      
      try {
        // Supprimer les données existantes
        const deleteResult = await collection.deleteMany({});
        console.log(`   🗑️  ${deleteResult.deletedCount} documents supprimés`);
        
        // Insérer les nouvelles données
        if (collectionData.data && collectionData.data.length > 0) {
          const insertResult = await collection.insertMany(collectionData.data);
          console.log(`   ✅ ${insertResult.insertedCount} documents restaurés`);
        }
      } catch (error) {
        console.error(`   ❌ Erreur pour ${collectionName}:`, error.message);
      }
    }

    console.log('\n✅ Restauration terminée avec succès!');

    // Afficher un résumé
    console.log('\n📈 Résumé de la restauration:');
    const db = mongoose.connection.db;
    
    for (const collectionName of Object.keys(backupData.collections)) {
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments({});
      console.log(`   - ${collectionName}: ${count} documents`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Récupérer le dossier de sauvegarde depuis les arguments
const backupDir = process.argv[2];

if (!backupDir) {
  console.log('Usage: node restore-from-backup.js <dossier-de-sauvegarde>');
  console.log('Exemple: node restore-from-backup.js backup-2025-01-08T12-00-00-000Z');
  process.exit(1);
}

restoreFromBackup(backupDir);