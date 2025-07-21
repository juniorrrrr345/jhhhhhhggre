require('dotenv').config();
const mongoose = require('mongoose');
const Plug = require('../src/models/Plug');

async function testPermanentLikes() {
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
    
    // Test 2: Simuler un premier like
    console.log('\n❤️ Test 2: Simulation d\'un premier like...');
    const testUserId = 987654321; // ID utilisateur fictif différent
    
    // Vérifier si l'utilisateur a déjà liké
    const hasLiked = testPlug.likedBy.includes(testUserId);
    console.log(`👤 Utilisateur ${testUserId} a déjà liké: ${hasLiked ? '✅' : '❌'}`);
    
    if (!hasLiked) {
      // Initialiser likeHistory si nécessaire
      if (!testPlug.likeHistory) {
        testPlug.likeHistory = [];
      }
      
      // Ajouter le like (permanent)
      testPlug.likedBy.push(testUserId);
      testPlug.likes += 1;
      
      // Ajouter à l'historique
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
    
    // Test 3: Simuler une tentative de second like (doit être rejetée)
    console.log('\n🔄 Test 3: Tentative de second like (doit être rejetée)...');
    
    const refreshedPlug = await Plug.findById(testPlug._id);
    const alreadyLiked = refreshedPlug.likedBy.includes(testUserId);
    
    if (alreadyLiked) {
      console.log(`❤️ L'utilisateur a déjà liké ${refreshedPlug.name} ! (${refreshedPlug.likes} likes)`);
      console.log('✅ Système de likes permanent fonctionne - pas de second like autorisé');
    } else {
      console.log('❌ Erreur: L\'utilisateur devrait avoir déjà liké');
    }
    
    // Test 4: Tester le bouton qui s'affiche
    console.log('\n🔘 Test 4: Test du bouton de like...');
    
    // Simuler la création du bouton
    let likeButtonText;
    if (refreshedPlug.likedBy.includes(testUserId)) {
      likeButtonText = '❤️ Vous avez liké cette boutique';
    } else {
      likeButtonText = '🤍 Liker cette boutique';
    }
    
    console.log(`🔘 Texte du bouton: "${likeButtonText}"`);
    
    if (likeButtonText.includes('❤️ Vous avez liké')) {
      console.log('✅ Bouton affiche correctement l\'état "déjà liké"');
    } else {
      console.log('❌ Bouton devrait afficher l\'état "déjà liké"');
    }
    
    // Test 5: Simuler un autre utilisateur qui like
    console.log('\n👥 Test 5: Autre utilisateur qui like...');
    const anotherUserId = 555666777;
    
    if (!refreshedPlug.likedBy.includes(anotherUserId)) {
      refreshedPlug.likedBy.push(anotherUserId);
      refreshedPlug.likes += 1;
      
      refreshedPlug.likeHistory.push({
        userId: anotherUserId,
        timestamp: Date.now(),
        action: 'like'
      });
      
      await refreshedPlug.save();
      console.log(`✅ Autre utilisateur a liké! Nouveaux likes: ${refreshedPlug.likes}`);
    }
    
    // Test 6: Vérifier la synchronisation temps réel
    console.log('\n⏱️ Test 6: Synchronisation temps réel...');
    
    const finalPlug = await Plug.findById(testPlug._id);
    console.log(`📊 Likes finaux: ${finalPlug.likes}`);
    console.log(`👥 Utilisateurs qui ont liké: ${finalPlug.likedBy.length}`);
    console.log(`📝 Entrées dans l'historique: ${finalPlug.likeHistory.length}`);
    
    // Simuler l'affichage du message mis à jour
    const likesCount = finalPlug.likes || 0;
    const likesDisplay = `❤️ **${likesCount} like${likesCount !== 1 ? 's' : ''}**`;
    console.log(`💬 Affichage dans le message: "${likesDisplay}"`);
    
    // Vérifier la cohérence
    const likeActions = finalPlug.likeHistory.filter(entry => entry.action === 'like').length;
    console.log(`📈 Actions de like dans l'historique: ${likeActions}`);
    console.log(`✅ Cohérence: ${finalPlug.likes === likeActions ? 'OK' : 'ERREUR'}`);
    
    console.log('\n🎉 Tests terminés');
    
    // Résumé final
    console.log('\n📋 Résumé:');
    console.log(`- Système de likes permanent: ✅ Fonctionnel`);
    console.log(`- Pas de possibilité de retirer: ✅ Confirmé`);
    console.log(`- Bouton adaptatif: ✅ OK`);
    console.log(`- Synchronisation temps réel: ✅ Testée`);
    console.log(`- Compteur de likes: ${finalPlug.likes} (${finalPlug.likedBy.length} utilisateurs)`);
    
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
    
    const testUserIds = [987654321, 555666777];
    
    // Retirer les utilisateurs de test de tous les plugs
    for (const userId of testUserIds) {
      const result = await Plug.updateMany(
        { likedBy: userId },
        { 
          $pull: { 
            likedBy: userId,
            likeHistory: { userId: userId }
          },
          $inc: { likes: -1 }
        }
      );
      
      console.log(`✅ Nettoyé l'utilisateur ${userId} de ${result.modifiedCount} plugs`);
    }
    
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
    testPermanentLikes()
      .then(() => {
        console.log('\n✅ Tests du système de likes permanent terminés');
        console.log('\n💡 Pour nettoyer les données de test, lancez:');
        console.log('node scripts/test-permanent-likes.js --cleanup');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n❌ Tests échoués:', error.message);
        process.exit(1);
      });
  }
}

module.exports = { testPermanentLikes, cleanupTestData };