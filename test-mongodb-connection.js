const { MongoClient } = require('mongodb');

// Test de connexion pour les deux URIs
const testConnections = async () => {
  // URI 1 - À tester
  const uri1 = 'mongodb+srv://teste:SfePlug@tesye.qazpla.mongodb.net/?retryWrites=true&w=majority&appName=Tesye';
  
  // URI 2 - Nouvelle base
  const uri2 = 'mongodb+srv://teste:SfePlug@junior.jiy8uam.mongodb.net/?retryWrites=true&w=majority&appName=Junior';
  
  console.log('🔍 Test de connexion MongoDB...\n');
  
  // Test URI 1
  console.log('📡 Test URI 1...');
  try {
    const client1 = new MongoClient(uri1);
    await client1.connect();
    console.log('✅ URI 1 connectée avec succès');
    
    // Lister les bases de données
    const dbs = await client1.db().admin().listDatabases();
    console.log('   Bases de données disponibles:');
    dbs.databases.forEach(db => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    await client1.close();
  } catch (error) {
    console.log('❌ Erreur URI 1:', error.message);
  }
  
  console.log('\n📡 Test URI 2...');
  try {
    const client2 = new MongoClient(uri2);
    await client2.connect();
    console.log('✅ URI 2 connectée avec succès');
    
    // Lister les bases de données
    const dbs = await client2.db().admin().listDatabases();
    console.log('   Bases de données disponibles:');
    dbs.databases.forEach(db => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    await client2.close();
  } catch (error) {
    console.log('❌ Erreur URI 2:', error.message);
  }
};

testConnections();