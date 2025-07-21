require('dotenv').config();
const mongoose = require('mongoose');
const Config = require('./src/models/Config');

async function forceCleanConfig() {
  try {
    console.log('🔧 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');

    const config = await Config.findById('main');
    
    if (!config) {
      console.log('❌ Configuration non trouvée');
      return;
    }
    
    console.log('🧹 Reconstruction complète des réseaux sociaux...');
    
    // Créer un nouvel objet socialMedia avec seulement les champs valides
    const newSocialMedia = {};
    
    if (config.socialMedia) {
      for (const [key, url] of Object.entries(config.socialMedia)) {
        if (url && typeof url === 'string' && url.trim() !== '') {
          newSocialMedia[key] = url.trim();
          console.log(`✅ Conservé: ${key} = ${url.trim()}`);
        } else {
          console.log(`❌ Supprimé: ${key} = ${url || 'undefined'}`);
        }
      }
    }
    
    // Remplacer complètement l'objet socialMedia
    config.socialMedia = newSocialMedia;
    
    // Marquer explicitement le champ comme modifié
    config.markModified('socialMedia');
    
    // Sauvegarder
    await config.save();
    console.log('✅ Configuration forcée et sauvegardée');
    
    // Vérifier le résultat
    const verifyConfig = await Config.findById('main');
    console.log('\n📋 Vérification finale:');
    if (verifyConfig.socialMedia) {
      console.log('Réseaux sociaux globaux:');
      for (const [key, url] of Object.entries(verifyConfig.socialMedia)) {
        console.log(`  ${key}: ${url}`);
      }
    } else {
      console.log('Aucun réseau social global');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

forceCleanConfig();