const { MongoClient } = require('mongodb');

// URIs des bases de données
const SOURCE_URI = 'mongodb+srv://teste:SfePlug@tesye.qazpla.mongodb.net/?retryWrites=true&w=majority&appName=Tesye';
const TARGET_URI = 'mongodb+srv://teste:SfePlug@junior.jiy8uam.mongodb.net/?retryWrites=true&w=majority&appName=Junior';

// Nom de la base de données
const DB_NAME = 'test'; // Base de données source (MongoDB utilise 'test' par défaut)
const TARGET_DB_NAME = 'test'; // Base de données cible

async function migrateData() {
  const sourceClient = new MongoClient(SOURCE_URI);
  const targetClient = new MongoClient(TARGET_URI);
  
  try {
    console.log('🔄 Connexion aux bases de données...');
    await sourceClient.connect();
    await targetClient.connect();
    console.log('✅ Connecté aux deux bases de données');
    
    const sourceDb = sourceClient.db(DB_NAME);
    const targetDb = targetClient.db(TARGET_DB_NAME);
    
    // Lister toutes les collections
    const collections = await sourceDb.listCollections().toArray();
    console.log(`📋 ${collections.length} collections trouvées:`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    // Statistiques
    const stats = {
      total: 0,
      collections: {}
    };
    
    // Migrer chaque collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      
      // Ignorer les collections système
      if (collectionName.startsWith('system.')) {
        console.log(`⏭️  Ignoré: ${collectionName} (collection système)`);
        continue;
      }
      
      console.log(`\n🔄 Migration de la collection: ${collectionName}`);
      
      const sourceCollection = sourceDb.collection(collectionName);
      const targetCollection = targetDb.collection(collectionName);
      
      // Compter les documents
      const count = await sourceCollection.countDocuments();
      console.log(`   📊 ${count} documents à migrer`);
      
      if (count > 0) {
        // Récupérer tous les documents
        const documents = await sourceCollection.find({}).toArray();
        
        // Vider la collection cible si elle existe
        try {
          await targetCollection.drop();
          console.log(`   🗑️  Collection cible vidée`);
        } catch (e) {
          // La collection n'existe pas, c'est OK
        }
        
        // Insérer les documents
        const result = await targetCollection.insertMany(documents);
        console.log(`   ✅ ${result.insertedCount} documents insérés`);
        
        stats.collections[collectionName] = result.insertedCount;
        stats.total += result.insertedCount;
      } else {
        console.log(`   ⏭️  Aucun document à migrer`);
        stats.collections[collectionName] = 0;
      }
      
      // Copier les index
      const indexes = await sourceCollection.indexes();
      for (const index of indexes) {
        if (index.name !== '_id_') { // Ignorer l'index _id par défaut
          try {
            await targetCollection.createIndex(index.key, {
              name: index.name,
              unique: index.unique,
              sparse: index.sparse,
              background: index.background
            });
            console.log(`   📑 Index créé: ${index.name}`);
          } catch (e) {
            console.log(`   ⚠️  Impossible de créer l'index ${index.name}: ${e.message}`);
          }
        }
      }
    }
    
    // Afficher le résumé
    console.log('\n\n✅ MIGRATION TERMINÉE !');
    console.log('📊 Résumé:');
    console.log(`   Total: ${stats.total} documents migrés`);
    console.log('   Par collection:');
    Object.entries(stats.collections).forEach(([name, count]) => {
      console.log(`     - ${name}: ${count} documents`);
    });
    
    // Vérification finale
    console.log('\n🔍 Vérification des données migrées...');
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      if (collectionName.startsWith('system.')) continue;
      
      const sourceCount = await sourceDb.collection(collectionName).countDocuments();
      const targetCount = await targetDb.collection(collectionName).countDocuments();
      
      if (sourceCount === targetCount) {
        console.log(`   ✅ ${collectionName}: ${targetCount} documents (OK)`);
      } else {
        console.log(`   ❌ ${collectionName}: Source=${sourceCount}, Target=${targetCount} (ERREUR)`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await sourceClient.close();
    await targetClient.close();
    console.log('\n🔒 Connexions fermées');
  }
}

// Fonction pour sauvegarder uniquement (sans migration)
async function backupOnly() {
  const sourceClient = new MongoClient(SOURCE_URI);
  
  try {
    console.log('🔄 Connexion à la base source...');
    await sourceClient.connect();
    console.log('✅ Connecté');
    
    const sourceDb = sourceClient.db(DB_NAME);
    const collections = await sourceDb.listCollections().toArray();
    
    const backup = {
      date: new Date().toISOString(),
      database: DB_NAME,
      collections: {}
    };
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      if (collectionName.startsWith('system.')) continue;
      
      const collection = sourceDb.collection(collectionName);
      const documents = await collection.find({}).toArray();
      const indexes = await collection.indexes();
      
      backup.collections[collectionName] = {
        documents: documents,
        indexes: indexes,
        count: documents.length
      };
      
      console.log(`✅ Sauvegardé: ${collectionName} (${documents.length} documents)`);
    }
    
    // Sauvegarder dans un fichier
    const fs = require('fs');
    const filename = `backup-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(backup, null, 2));
    
    console.log(`\n✅ Sauvegarde complète dans: ${filename}`);
    console.log(`📊 Total: ${Object.values(backup.collections).reduce((sum, col) => sum + col.count, 0)} documents`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sourceClient.close();
  }
}

// Menu principal
console.log('🚀 MIGRATION MONGODB');
console.log('====================');
console.log('Source:', SOURCE_URI.replace(/:[^:@]+@/, ':****@'));
console.log('Target:', TARGET_URI.replace(/:[^:@]+@/, ':****@'));
console.log('');

const args = process.argv.slice(2);

if (args[0] === '--backup-only') {
  console.log('Mode: SAUVEGARDE UNIQUEMENT\n');
  backupOnly();
} else if (args[0] === '--migrate') {
  console.log('Mode: MIGRATION COMPLÈTE\n');
  console.log('⚠️  ATTENTION: Ceci va REMPLACER toutes les données dans la base cible!');
  console.log('Appuyez sur Ctrl+C pour annuler, ou attendez 5 secondes...\n');
  setTimeout(() => {
    migrateData();
  }, 5000);
} else {
  console.log('Usage:');
  console.log('  node migrate-mongodb.js --backup-only    # Faire une sauvegarde uniquement');
  console.log('  node migrate-mongodb.js --migrate        # Migrer toutes les données');
}