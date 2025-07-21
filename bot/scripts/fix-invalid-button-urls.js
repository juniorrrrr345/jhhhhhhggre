#!/usr/bin/env node

/**
 * Script de correction des URLs invalides dans la configuration
 * Résout l'erreur BUTTON_URL_INVALID en supprimant les adresses email
 * et autres URLs invalides des réseaux sociaux
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Config = require('../src/models/Config');

async function fixInvalidButtonUrls() {
  console.log('🔧 Correction des URLs invalides des boutons...\n');
  
  try {
    // Connexion à MongoDB
    console.log('📡 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté avec succès');

    // Récupération de la configuration
    const config = await Config.findById('main');
    if (!config) {
      console.log('❌ Configuration non trouvée');
      return;
    }

    let hasChanges = false;

    // Fonction pour valider une URL
    const isValidUrl = (url) => {
      if (!url || typeof url !== 'string' || url.trim() === '') return false;
      
      // Rejeter les adresses email
      if (url.includes('@') && !url.startsWith('http')) {
        return false;
      }
      
      try {
        let testUrl = url.trim();
        if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
          testUrl = 'https://' + testUrl;
        }
        new URL(testUrl);
        return true;
      } catch {
        return false;
      }
    };

    // Corriger les réseaux sociaux du message d'accueil
    if (config.welcome && config.welcome.socialMedia) {
      console.log('🔍 Vérification des réseaux sociaux d\'accueil...');
      
      const originalLength = config.welcome.socialMedia.length;
      config.welcome.socialMedia = config.welcome.socialMedia.filter(social => {
        if (!social || !social.name || !social.emoji || !social.url) {
          console.log(`❌ Suppression: réseau social incomplet`);
          return false;
        }
        
        if (!isValidUrl(social.url)) {
          console.log(`❌ Suppression: ${social.name} (URL invalide: ${social.url})`);
          return false;
        }
        
        // Nettoyer l'URL
        let cleanUrl = social.url.trim();
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          cleanUrl = 'https://' + cleanUrl;
          social.url = cleanUrl;
        }
        
        console.log(`✅ Conservé: ${social.name} -> ${social.url}`);
        return true;
      });
      
      if (config.welcome.socialMedia.length !== originalLength) {
        hasChanges = true;
        console.log(`📊 ${originalLength - config.welcome.socialMedia.length} réseaux sociaux supprimés`);
      }
    }

    // Corriger les réseaux sociaux globaux
    if (config.socialMedia) {
      console.log('🔍 Vérification des réseaux sociaux globaux...');
      
      const newSocialMedia = {};
      for (const [key, url] of Object.entries(config.socialMedia)) {
        if (url && typeof url === 'string' && url.trim() !== '' && isValidUrl(url)) {
          let cleanUrl = url.trim();
          if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = 'https://' + cleanUrl;
          }
          newSocialMedia[key] = cleanUrl;
          console.log(`✅ Conservé: ${key} -> ${cleanUrl}`);
        } else if (url && url.trim() !== '') {
          console.log(`❌ Supprimé: ${key} (URL invalide: ${url})`);
          hasChanges = true;
        }
      }
      
      config.socialMedia = newSocialMedia;
      config.markModified('socialMedia');
    }

    // Sauvegarder si nécessaire
    if (hasChanges) {
      console.log('\n💾 Sauvegarde des modifications...');
      await config.save();
      console.log('✅ Configuration mise à jour avec succès');
    } else {
      console.log('\nℹ️ Aucune modification nécessaire');
    }

    // Afficher le résumé final
    console.log('\n📋 Configuration finale:');
    if (config.welcome && config.welcome.socialMedia && config.welcome.socialMedia.length > 0) {
      console.log('Réseaux sociaux d\'accueil:');
      config.welcome.socialMedia.forEach((social, index) => {
        console.log(`  ${index + 1}. ${social.emoji} ${social.name}: ${social.url}`);
      });
    }
    
    if (config.socialMedia && Object.keys(config.socialMedia).length > 0) {
      console.log('Réseaux sociaux globaux:');
      for (const [key, url] of Object.entries(config.socialMedia)) {
        console.log(`  ${key}: ${url}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Connexion MongoDB fermée');
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  fixInvalidButtonUrls();
}

module.exports = { fixInvalidButtonUrls };