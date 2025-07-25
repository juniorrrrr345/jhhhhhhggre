require('dotenv').config();
const mongoose = require('mongoose');
const Config = require('./bot/src/models/Config');
const { createMainKeyboard } = require('./bot/src/utils/keyboards');

async function debugSocialMedia() {
  try {
    console.log('🔗 Connexion MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Récupérer la config
    const config = await Config.findById('main');
    if (!config) {
      console.log('❌ Aucune config trouvée');
      return;
    }

    console.log('\n📋 CONFIG ACTUELLE:');
    console.log('- socialMedia:', !!config.socialMedia, typeof config.socialMedia);
    if (config.socialMedia) {
      if (Array.isArray(config.socialMedia)) {
        console.log('  Array length:', config.socialMedia.length);
        config.socialMedia.forEach((social, i) => {
          console.log(`  [${i}] ${social?.name}: ${social?.url} (enabled: ${social?.enabled})`);
        });
      } else {
        console.log('  Object keys:', Object.keys(config.socialMedia));
        Object.entries(config.socialMedia).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      }
    }

    console.log('- socialMediaList:', !!config.socialMediaList, Array.isArray(config.socialMediaList) ? config.socialMediaList.length : 'not array');
    if (config.socialMediaList && Array.isArray(config.socialMediaList)) {
      config.socialMediaList.forEach((social, i) => {
        console.log(`  [${i}] ${social?.name}: ${social?.url} (enabled: ${social?.enabled})`);
      });
    }

    console.log('\n🔍 TEST CRÉATION CLAVIER:');
    
    // Activer le debug
    process.env.DEBUG_SOCIAL_MEDIA = 'true';
    
    // Créer le clavier
    const keyboard = createMainKeyboard(config);
    
    // Analyser le clavier
    const allButtons = keyboard?.reply_markup?.inline_keyboard?.flat() || [];
    const urlButtons = allButtons.filter(btn => btn.url);
    
    console.log('\n📱 BOUTONS CLAVIER:');
    console.log('Total boutons:', allButtons.length);
    console.log('Boutons URL (réseaux sociaux):', urlButtons.length);
    
    urlButtons.forEach((btn, i) => {
      console.log(`  [${i}] ${btn.text} -> ${btn.url}`);
    });

    if (urlButtons.length === 0) {
      console.log('\n❌ AUCUN BOUTON RÉSEAU SOCIAL TROUVÉ !');
      
      // Forcer un nettoyage et une mise à jour
      console.log('\n🔧 NETTOYAGE FORCÉ...');
      
      // Nettoyer socialMedia s'il est vide
      if (config.socialMedia && typeof config.socialMedia === 'object' && !Array.isArray(config.socialMedia)) {
        const isEmpty = Object.values(config.socialMedia).every(v => !v || v.trim() === '');
        if (isEmpty) {
          console.log('🗑️ Suppression socialMedia vide...');
          config.socialMedia = undefined;
        }
      }
      
      // S'assurer que socialMediaList est utilisé
      if (!config.socialMediaList || !Array.isArray(config.socialMediaList)) {
        config.socialMediaList = [];
      }
      
      // Ajouter un réseau social de test s'il n'y en a pas
      if (config.socialMediaList.length === 0) {
        console.log('➕ Ajout réseau social de test...');
        config.socialMediaList = [{
          name: 'Test Social',
          emoji: '🔗',
          url: 'https://example.com',
          enabled: true,
          order: 0
        }];
      }
      
      await config.save();
      console.log('💾 Config mise à jour et sauvegardée');
      
      // Re-tester
      const newKeyboard = createMainKeyboard(config);
      const newUrlButtons = newKeyboard?.reply_markup?.inline_keyboard?.flat()?.filter(btn => btn.url) || [];
      console.log('🔄 Nouveaux boutons URL:', newUrlButtons.length);
    } else {
      console.log('\n✅ RÉSEAUX SOCIAUX DÉTECTÉS CORRECTEMENT');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

debugSocialMedia();