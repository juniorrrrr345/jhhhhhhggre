const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://teste:Junior@junior.jiy8uam.mongodb.net/?retryWrites=true&w=majority&appName=Junior';

async function checkAndFixIndexes() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Lister tous les index
    console.log('\n📋 Index actuels sur la collection users:');
    const indexes = await usersCollection.indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${JSON.stringify(index)}`);
    });

    // Chercher l'index problématique userId_1
    const problematicIndex = indexes.find(idx => idx.name === 'userId_1');
    
    if (problematicIndex) {
      console.log('\n⚠️ Index problématique trouvé: userId_1');
      console.log('🔧 Suppression de l\'index userId_1...');
      
      try {
        await usersCollection.dropIndex('userId_1');
        console.log('✅ Index userId_1 supprimé avec succès');
      } catch (dropError) {
        console.error('❌ Erreur lors de la suppression:', dropError.message);
      }
    }

    // Vérifier si l'index telegramId existe
    const telegramIdIndex = indexes.find(idx => idx.key && idx.key.telegramId);
    
    if (!telegramIdIndex) {
      console.log('\n📝 Création de l\'index unique sur telegramId...');
      try {
        await usersCollection.createIndex({ telegramId: 1 }, { unique: true });
        console.log('✅ Index telegramId créé avec succès');
      } catch (createError) {
        console.error('❌ Erreur lors de la création:', createError.message);
      }
    } else {
      console.log('\n✅ L\'index telegramId existe déjà');
    }

    // Afficher les index après modification
    console.log('\n📋 Index après modification:');
    const newIndexes = await usersCollection.indexes();
    newIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${JSON.stringify(index)}`);
    });

    // Tester l'ajout d'un utilisateur
    console.log('\n🧪 Test d\'ajout d\'utilisateur...');
    const testUser = {
      telegramId: 999999999,
      username: 'test_after_fix',
      firstName: 'Test',
      lastName: 'Fix',
      isActive: true,
      lastActivity: new Date()
    };

    try {
      const result = await usersCollection.findOneAndUpdate(
        { telegramId: testUser.telegramId },
        { $set: testUser },
        { upsert: true, returnDocument: 'after' }
      );
      console.log('✅ Utilisateur test ajouté avec succès:', result.username);
      
      // Supprimer l'utilisateur test
      await usersCollection.deleteOne({ telegramId: 999999999 });
      console.log('🗑️ Utilisateur test supprimé');
    } catch (testError) {
      console.error('❌ Erreur lors du test:', testError.message);
    }

    // Compter les utilisateurs
    const count = await usersCollection.countDocuments({});
    console.log(`\n📊 Nombre total d'utilisateurs: ${count}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

checkAndFixIndexes();