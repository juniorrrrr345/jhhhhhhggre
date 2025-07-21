#!/usr/bin/env node

/**
 * Script de correction du système de likes
 * Corrige les problèmes identifiés dans la gestion des likes
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Plug = require('../src/models/Plug');

async function fixLikesSystem() {
  console.log('🔧 Correction du système de likes...\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');
    
    // 1. Audit des données existantes
    console.log('\n1. 📊 Audit des données de likes:');
    const allPlugs = await Plug.find({});
    console.log(`   Total plugs: ${allPlugs.length}`);
    
    let fixedPlugs = 0;
    let problems = [];
    
    for (const plug of allPlugs) {
      let needsFix = false;
      let issues = [];
      
      // Vérifier que likedBy est un array
      if (!Array.isArray(plug.likedBy)) {
        plug.likedBy = [];
        needsFix = true;
        issues.push('likedBy not array');
      }
      
      // Vérifier que likes est un nombre
      if (typeof plug.likes !== 'number' || isNaN(plug.likes)) {
        plug.likes = 0;
        needsFix = true;
        issues.push('likes not number');
      }
      
      // Corriger les likes négatifs
      if (plug.likes < 0) {
        plug.likes = 0;
        needsFix = true;
        issues.push('negative likes');
      }
      
      // Synchroniser likes avec likedBy.length
      if (plug.likes !== plug.likedBy.length) {
        const oldLikes = plug.likes;
        plug.likes = plug.likedBy.length;
        needsFix = true;
        issues.push(`likes mismatch: ${oldLikes} -> ${plug.likes}`);
      }
      
      // Supprimer les doublons dans likedBy
      const uniqueLikedBy = [...new Set(plug.likedBy)];
      if (uniqueLikedBy.length !== plug.likedBy.length) {
        plug.likedBy = uniqueLikedBy;
        plug.likes = uniqueLikedBy.length;
        needsFix = true;
        issues.push('duplicate likes removed');
      }
      
      if (needsFix) {
        await plug.save();
        fixedPlugs++;
        problems.push({
          name: plug.name,
          id: plug._id,
          issues: issues
        });
      }
    }
    
    console.log(`   ✅ ${fixedPlugs} plugs corrigés`);
    if (problems.length > 0) {
      console.log('\n   📋 Détails des corrections:');
      problems.forEach(problem => {
        console.log(`   - ${problem.name}: ${problem.issues.join(', ')}`);
      });
    }
    
    // 2. Vérification finale
    console.log('\n2. ✅ Vérification finale:');
    const verificationPlugs = await Plug.find({});
    let allGood = true;
    
    verificationPlugs.forEach(plug => {
      if (!Array.isArray(plug.likedBy) || 
          typeof plug.likes !== 'number' || 
          plug.likes !== plug.likedBy.length ||
          plug.likes < 0) {
        console.log(`   ❌ ${plug.name}: encore des problèmes`);
        allGood = false;
      }
    });
    
    if (allGood) {
      console.log('   ✅ Tous les plugs ont des données de likes cohérentes');
    }
    
    // 3. Statistiques finales
    console.log('\n3. 📈 Statistiques finales:');
    const totalLikes = verificationPlugs.reduce((sum, plug) => sum + plug.likes, 0);
    const plugsWithLikes = verificationPlugs.filter(plug => plug.likes > 0).length;
    
    console.log(`   Total likes: ${totalLikes}`);
    console.log(`   Plugs avec likes: ${plugsWithLikes}/${verificationPlugs.length}`);
    
    if (plugsWithLikes > 0) {
      console.log('\n   🏆 Top 5 plugs les plus likés:');
      const topPlugs = verificationPlugs
        .filter(plug => plug.likes > 0)
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 5);
      
      topPlugs.forEach((plug, index) => {
        console.log(`   ${index + 1}. ${plug.name}: ${plug.likes} like${plug.likes > 1 ? 's' : ''}`);
      });
    }
    
    console.log('\n🎉 Correction du système de likes terminée !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

// Exécuter le script
if (require.main === module) {
  fixLikesSystem();
}

module.exports = { fixLikesSystem };