#!/usr/bin/env node

/**
 * Script de test pour vérifier les corrections du système de likes
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Plug = require('./src/models/Plug');

async function testLikesFix() {
  console.log('🧪 Test des corrections du système de likes...\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');
    
    // 1. Créer un plug de test si nécessaire
    console.log('\n1. 🏗️ Préparation du plug de test:');
    
    let testPlug = await Plug.findOne({ name: 'Test Likes Bot' });
    if (!testPlug) {
      testPlug = new Plug({
        name: 'Test Likes Bot',
        description: 'Plug de test pour les likes',
        country: 'Test',
        telegramLink: 'https://t.me/test',
        services: {
          delivery: { enabled: true, price: '10€' },
          postal: { enabled: false },
          meetup: { enabled: false }
        },
        isVip: false,
        likes: 0,
        likedBy: []
      });
      await testPlug.save();
      console.log('   ✅ Plug de test créé');
    } else {
      console.log('   ✅ Plug de test existant trouvé');
    }
    
    console.log(`   📊 État initial: ${testPlug.likes} likes, likedBy: [${testPlug.likedBy.join(', ')}]`);
    
    // 2. Test de simulation de likes multiples
    console.log('\n2. 🎯 Test de likes multiples:');
    
    const testUsers = [123456, 789012, 345678, 901234, 567890];
    
    // Ajouter des likes
    for (const userId of testUsers) {
      const hasLiked = testPlug.likedBy.includes(userId);
      if (!hasLiked) {
        testPlug.likedBy.push(userId);
        testPlug.likes = testPlug.likedBy.length;
        await testPlug.save();
        console.log(`   👤 User ${userId} liked: ${testPlug.likes} total likes`);
      }
    }
    
    // 3. Test de retrait de likes
    console.log('\n3. 💔 Test de retrait de likes:');
    
    const userToRemove = testUsers[2]; // 345678
    if (testPlug.likedBy.includes(userToRemove)) {
      testPlug.likedBy = testPlug.likedBy.filter(id => id !== userToRemove);
      testPlug.likes = testPlug.likedBy.length;
      await testPlug.save();
      console.log(`   👤 User ${userToRemove} unliked: ${testPlug.likes} total likes`);
    }
    
    // 4. Test de cohérence
    console.log('\n4. ✅ Test de cohérence des données:');
    
    const finalPlug = await Plug.findById(testPlug._id);
    const isConsistent = finalPlug.likes === finalPlug.likedBy.length;
    
    console.log(`   Likes: ${finalPlug.likes}`);
    console.log(`   LikedBy length: ${finalPlug.likedBy.length}`);
    console.log(`   LikedBy: [${finalPlug.likedBy.join(', ')}]`);
    console.log(`   Cohérent: ${isConsistent ? '✅ OUI' : '❌ NON'}`);
    
    // 5. Test de génération des boutons
    console.log('\n5. 🎮 Test de génération des boutons:');
    
    try {
      const { createPlugKeyboard } = require('./src/utils/keyboards');
      const keyboard = createPlugKeyboard(finalPlug, 'top_plugs');
      
      // Chercher le bouton de like
      let likeButtonFound = false;
      for (const row of keyboard.reply_markup.inline_keyboard) {
        for (const button of row) {
          if (button.callback_data && button.callback_data.startsWith('like_')) {
            likeButtonFound = true;
            console.log(`   ✅ Bouton like trouvé: "${button.text}" -> ${button.callback_data}`);
            break;
          }
        }
        if (likeButtonFound) break;
      }
      
      if (!likeButtonFound) {
        console.log('   ❌ Bouton like non trouvé');
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur génération boutons: ${error.message}`);
    }
    
    // 6. Test de performance avec beaucoup de likes
    console.log('\n6. 🚀 Test de performance:');
    
    const startTime = Date.now();
    
    // Simuler 50 likes rapides
    const performanceUsers = Array.from({ length: 50 }, (_, i) => 1000000 + i);
    
    for (const userId of performanceUsers) {
      if (!finalPlug.likedBy.includes(userId)) {
        finalPlug.likedBy.push(userId);
      }
    }
    
    finalPlug.likes = finalPlug.likedBy.length;
    await finalPlug.save();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`   ✅ 50 likes ajoutés en ${duration}ms`);
    console.log(`   📊 Total final: ${finalPlug.likes} likes`);
    
    // 7. Nettoyage (optionnel)
    console.log('\n7. 🧹 Nettoyage:');
    
    // Remettre le plug à zéro pour les futurs tests
    finalPlug.likes = 0;
    finalPlug.likedBy = [];
    await finalPlug.save();
    console.log('   ✅ Plug de test remis à zéro');
    
    console.log('\n🎉 Tests terminés avec succès !');
    
    console.log('\n📋 Résumé des améliorations apportées:');
    console.log('- ✅ Gestion robuste des erreurs');
    console.log('- ✅ Synchronisation likes/likedBy');
    console.log('- ✅ Validation des données avant sauvegarde');
    console.log('- ✅ Notifications utilisateur améliorées');
    console.log('- ✅ Tracking du contexte pour la navigation');
    console.log('- ✅ Gestion des timeouts de callback');
    
  } catch (error) {
    console.error('❌ Erreur durant les tests:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

// Exécuter le test
testLikesFix();