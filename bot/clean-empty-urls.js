require('dotenv').config();
const mongoose = require('mongoose');
const Config = require('./src/models/Config');

async function cleanEmptyUrls() {
  try {
    console.log('🔧 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');

    const config = await Config.findById('main');
    
    if (config && config.socialMedia) {
      let hasChanges = false;
      
      console.log('🧹 Nettoyage des champs vides...');
      
      // Supprimer les champs vides ou undefined
      for (const [key, url] of Object.entries(config.socialMedia)) {
        if (!url || url.trim() === '') {
          delete config.socialMedia[key];
          hasChanges = true;
          console.log(`❌ Suppression du champ vide: ${key}`);
        } else {
          console.log(`✅ Champ valide: ${key} = ${url}`);
        }
      }
      
      if (hasChanges) {
        await config.save();
        console.log('✅ Configuration nettoyée et sauvegardée');
      } else {
        console.log('ℹ️ Aucun nettoyage nécessaire');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

cleanEmptyUrls();