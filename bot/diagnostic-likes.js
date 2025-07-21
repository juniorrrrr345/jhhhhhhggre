require('dotenv').config();
const mongoose = require('mongoose');
const Plug = require('./src/models/Plug');

async function diagnosticLikes() {
  try {
    console.log('🔍 Diagnostic du système de likes...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');
    
    // 1. Vérifier la structure des plugs
    console.log('\n1. 📊 Analyse des plugs existants:');
    const allPlugs = await Plug.find({});
    console.log(`   Total plugs: ${allPlugs.length}`);
    
    let plugsWithLikes = 0;
    let totalLikes = 0;
    let plugsWithLikedBy = 0;
    let problemPlugs = [];
    
    allPlugs.forEach(plug => {
      if (plug.likes > 0) {
        plugsWithLikes++;
        totalLikes += plug.likes;
      }
      
      if (plug.likedBy && plug.likedBy.length > 0) {
        plugsWithLikedBy++;
        
        // Vérifier la cohérence likes vs likedBy
        if (plug.likes !== plug.likedBy.length) {
          problemPlugs.push({
            id: plug._id,
            name: plug.name,
            likes: plug.likes,
            likedByLength: plug.likedBy.length,
            likedBy: plug.likedBy
          });
        }
      }
    });
    
    console.log(`   Plugs avec likes > 0: ${plugsWithLikes}`);
    console.log(`   Total likes: ${totalLikes}`);
    console.log(`   Plugs avec likedBy: ${plugsWithLikedBy}`);
    
    // 2. Vérifier la cohérence des données
    console.log('\n2. 🔍 Vérification de la cohérence:');
    if (problemPlugs.length > 0) {
      console.log(`   ❌ ${problemPlugs.length} plugs avec incohérence likes/likedBy:`);
      problemPlugs.forEach(plug => {
        console.log(`   - ${plug.name}: likes=${plug.likes}, likedBy.length=${plug.likedByLength}`);
        console.log(`     likedBy: [${plug.likedBy.join(', ')}]`);
      });
    } else {
      console.log('   ✅ Toutes les données sont cohérentes');
    }
    
    // 3. Tester la logique de like
    console.log('\n3. 🧪 Test de la logique de like:');
    
    // Créer un plug test s'il n'y en a pas
    let testPlug = await Plug.findOne({ name: { $regex: /test.*like/i } });
    if (!testPlug && allPlugs.length > 0) {
      testPlug = allPlugs[0];
      console.log(`   🎯 Utilisation du plug "${testPlug.name}" pour les tests`);
    } else if (allPlugs.length === 0) {
      console.log('   ⚠️ Aucun plug disponible pour les tests');
      return;
    }
    
    const testUserId = 999999; // ID utilisateur fictif
    const originalLikes = testPlug.likes;
    const originalLikedBy = [...testPlug.likedBy];
    
    console.log(`   📝 État initial: ${originalLikes} likes, likedBy: [${originalLikedBy.join(', ')}]`);
    
    // Test 1: Ajouter un like
    const hasAlreadyLiked = testPlug.likedBy.includes(testUserId);
    if (!hasAlreadyLiked) {
      testPlug.likedBy.push(testUserId);
      testPlug.likes += 1;
      await testPlug.save();
      
      console.log(`   ✅ Like ajouté: ${testPlug.likes} likes, likedBy: [${testPlug.likedBy.join(', ')}]`);
      
      // Test 2: Retirer le like
      testPlug.likedBy = testPlug.likedBy.filter(id => id !== testUserId);
      testPlug.likes -= 1;
      await testPlug.save();
      
      console.log(`   ✅ Like retiré: ${testPlug.likes} likes, likedBy: [${testPlug.likedBy.join(', ')}]`);
    } else {
      console.log(`   ℹ️ L'utilisateur test ${testUserId} a déjà liké ce plug`);
      
      // Retirer puis remettre
      testPlug.likedBy = testPlug.likedBy.filter(id => id !== testUserId);
      testPlug.likes -= 1;
      await testPlug.save();
      console.log(`   ✅ Like retiré: ${testPlug.likes} likes`);
      
      testPlug.likedBy.push(testUserId);
      testPlug.likes += 1;
      await testPlug.save();
      console.log(`   ✅ Like remis: ${testPlug.likes} likes`);
    }
    
    // 4. Vérifier les boutons de like
    console.log('\n4. 🎮 Test de génération des boutons:');
    const { createPlugKeyboard } = require('./src/utils/keyboards');
    
    try {
      const keyboard = createPlugKeyboard(testPlug, 'top_plugs');
      const likeButton = keyboard.reply_markup.inline_keyboard.find(row => 
        row.some(button => button.callback_data && button.callback_data.startsWith('like_'))
      );
      
      if (likeButton) {
        const likeButtonData = likeButton.find(button => 
          button.callback_data && button.callback_data.startsWith('like_')
        );
        console.log(`   ✅ Bouton like trouvé: "${likeButtonData.text}" -> ${likeButtonData.callback_data}`);
      } else {
        console.log('   ❌ Bouton like non trouvé dans le clavier');
      }
    } catch (error) {
      console.log(`   ❌ Erreur génération clavier: ${error.message}`);
    }
    
    console.log('\n🎉 Diagnostic terminé !');
    
  } catch (error) {
    console.error('❌ Erreur during diagnostic:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

diagnosticLikes();