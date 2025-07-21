require('dotenv').config();
const mongoose = require('mongoose');
const Plug = require('../src/models/Plug');

async function testLikeSystem() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Connecté à MongoDB');
    
    // Test 1: Trouver un plug pour tester
    console.log('\n📋 Test 1: Recherche d\'un plug pour test...');
    const plugs = await Plug.find({ isActive: true }).limit(1);
    
    if (plugs.length === 0) {
      console.log('❌ Aucun plug actif trouvé pour les tests');
      return;
    }
    
    const testPlug = plugs[0];
    console.log(`✅ Plug de test trouvé: ${testPlug.name}`);
    console.log(`📊 Likes actuels: ${testPlug.likes || 0}`);
    console.log(`👥 Utilisateurs qui ont liké: ${testPlug.likedBy?.length || 0}`);
    
    // Test 2: Vérifier la structure du modèle
    console.log('\n🏗️ Test 2: Vérification de la structure...');
    if (!testPlug.likeHistory) {
      console.log('📝 Initialisation de likeHistory...');
      testPlug.likeHistory = [];
      await testPlug.save();
    }
    console.log(`✅ likeHistory initialisé: ${testPlug.likeHistory.length} entrées`);
    
    // Test 3: Simuler un like d'un utilisateur test
    console.log('\n❤️ Test 3: Simulation d\'un like...');
    const testUserId = 123456789; // ID utilisateur fictif
    
    // Vérifier si l'utilisateur a déjà liké
    const hasLiked = testPlug.likedBy.includes(testUserId);
    console.log(`👤 Utilisateur ${testUserId} a déjà liké: ${hasLiked ? '✅' : '❌'}`);
    
    if (!hasLiked) {
      // Ajouter un like
      testPlug.likedBy.push(testUserId);
      testPlug.likes += 1;
      testPlug.likeHistory.push({
        userId: testUserId,
        timestamp: Date.now(),
        action: 'like'
      });
      await testPlug.save();
      console.log(`✅ Like ajouté! Nouveaux likes: ${testPlug.likes}`);
    } else {
      console.log('ℹ️ L\'utilisateur a déjà liké ce plug');
    }
    
    // Test 4: Tester le cooldown (simulation)
    console.log('\n⏰ Test 4: Test du système de cooldown...');
    const userLikeData = testPlug.likeHistory?.find(entry => entry.userId === testUserId);
    
    if (userLikeData) {
      const timeSinceLastLike = Date.now() - userLikeData.timestamp;
      const cooldownPeriod = 2 * 60 * 60 * 1000; // 2 heures
      const remainingCooldown = cooldownPeriod - timeSinceLastLike;
      
      console.log(`📅 Dernier like: ${new Date(userLikeData.timestamp).toLocaleString()}`);
      console.log(`⏱️ Temps écoulé: ${Math.floor(timeSinceLastLike / (60 * 1000))} minutes`);
      
      if (remainingCooldown > 0) {
        const remainingMinutes = Math.ceil(remainingCooldown / (60 * 1000));
        const hours = Math.floor(remainingMinutes / 60);
        const minutes = remainingMinutes % 60;
        const timeDisplay = hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}` : `${minutes}min`;
        
        console.log(`⏰ Cooldown actif: ${timeDisplay} restant`);
        console.log('❌ L\'utilisateur ne peut pas retirer son like maintenant');
      } else {
        console.log('✅ Cooldown expiré, l\'utilisateur peut retirer son like');
      }
    }
    
    // Test 5: Simuler un unlike (seulement si le cooldown est expiré)
    console.log('\n💔 Test 5: Simulation d\'un unlike...');
    
    if (userLikeData) {
      const timeSinceLastLike = Date.now() - userLikeData.timestamp;
      const cooldownPeriod = 2 * 60 * 60 * 1000;
      
      if (timeSinceLastLike >= cooldownPeriod) {
        // Retirer le like
        testPlug.likedBy = testPlug.likedBy.filter(id => id !== testUserId);
        testPlug.likes -= 1;
        
        // Mettre à jour l'historique
        const userLikeIndex = testPlug.likeHistory.findIndex(entry => entry.userId === testUserId);
        if (userLikeIndex !== -1) {
          testPlug.likeHistory[userLikeIndex].timestamp = Date.now();
          testPlug.likeHistory[userLikeIndex].action = 'unlike';
        }
        
        await testPlug.save();
        console.log(`✅ Like retiré! Nouveaux likes: ${testPlug.likes}`);
      } else {
        console.log('⏰ Cooldown encore actif, simulation d\'unlike ignorée');
      }
    }
    
    // Test 6: Vérifier la cohérence des données
    console.log('\n🔍 Test 6: Vérification de la cohérence...');
    const refreshedPlug = await Plug.findById(testPlug._id);
    
    console.log(`📊 Likes finaux: ${refreshedPlug.likes}`);
    console.log(`👥 Utilisateurs qui ont liké: ${refreshedPlug.likedBy.length}`);
    console.log(`📝 Entrées dans l'historique: ${refreshedPlug.likeHistory.length}`);
    
    // Vérifier la cohérence
    const likeHistoryCount = refreshedPlug.likeHistory.filter(entry => entry.action === 'like').length;
    const unlikeHistoryCount = refreshedPlug.likeHistory.filter(entry => entry.action === 'unlike').length;
    const expectedLikes = Math.max(0, likeHistoryCount - unlikeHistoryCount);
    
    console.log(`📈 Likes dans l'historique: ${likeHistoryCount}`);
    console.log(`📉 Unlikes dans l'historique: ${unlikeHistoryCount}`);
    console.log(`🧮 Likes attendus: ${expectedLikes}`);
    console.log(`✅ Cohérence: ${refreshedPlug.likes === expectedLikes ? 'OK' : 'ERREUR'}`);
    console.log(`✅ Array likedBy cohérent: ${refreshedPlug.likedBy.length === refreshedPlug.likes ? 'OK' : 'ATTENTION'}`);
    
    console.log('\n🎉 Tests terminés');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
  }
}

// Fonction pour nettoyer les données de test
async function cleanupTestData() {
  try {
    console.log('🧹 Nettoyage des données de test...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    
    const testUserId = 123456789;
    
    // Retirer l'utilisateur de test de tous les plugs
    const result = await Plug.updateMany(
      { likedBy: testUserId },
      { 
        $pull: { 
          likedBy: testUserId,
          likeHistory: { userId: testUserId }
        },
        $inc: { likes: -1 }
      }
    );
    
    console.log(`✅ Nettoyé ${result.modifiedCount} plugs`);
    
    // Corriger les likes négatifs
    await Plug.updateMany(
      { likes: { $lt: 0 } },
      { likes: 0 }
    );
    
    console.log('✅ Likes négatifs corrigés');
    
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Exécuter les tests
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--cleanup')) {
    cleanupTestData()
      .then(() => {
        console.log('\n✅ Nettoyage terminé');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n❌ Nettoyage échoué:', error.message);
        process.exit(1);
      });
  } else {
    testLikeSystem()
      .then(() => {
        console.log('\n✅ Tests du système de likes terminés');
        console.log('\n💡 Pour nettoyer les données de test, lancez:');
        console.log('node scripts/test-like-system.js --cleanup');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n❌ Tests échoués:', error.message);
        process.exit(1);
      });
  }
}

module.exports = { testLikeSystem, cleanupTestData };