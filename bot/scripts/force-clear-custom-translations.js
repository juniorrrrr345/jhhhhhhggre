const mongoose = require('mongoose');
const Config = require('../src/models/Config');
require('dotenv').config();

async function clearCustomTranslations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    const config = await Config.findById('main');
    if (!config) {
      console.log('❌ Configuration non trouvée');
      return;
    }
    
    // Effacer les traductions personnalisées pour contact et info
    if (config.languages && config.languages.translations) {
      config.languages.translations.delete('contact_default_text');
      config.languages.translations.delete('info_default_text');
      console.log('🗑️ Traductions personnalisées effacées pour contact et info');
    }
    
    // Forcer le texte du panel admin à null pour utiliser les traductions
    if (config.buttons) {
      if (config.buttons.contact) {
        config.buttons.contact.content = null;
        console.log('🗑️ Contenu contact du panel admin effacé');
      }
      if (config.buttons.info) {
        config.buttons.info.content = null;
        console.log('🗑️ Contenu info du panel admin effacé');
      }
    }
    
    await config.save();
    console.log('✅ Configuration sauvegardée');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnecté de MongoDB');
  }
}

clearCustomTranslations();