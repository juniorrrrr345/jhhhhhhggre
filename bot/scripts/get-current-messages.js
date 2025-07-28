const mongoose = require('mongoose');
const Config = require('../src/models/Config');
require('dotenv').config({ path: '../.env' });

async function getCurrentMessages() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-bot');
    console.log('✅ Connecté à MongoDB');
    
    // Récupérer la configuration
    const config = await Config.findById('main');
    
    if (!config) {
      console.log('❌ Configuration non trouvée');
      return;
    }
    
    console.log('\n📞 MESSAGE CONTACT ACTUEL:');
    console.log('------------------------');
    console.log(config.buttons?.contact?.content || 'Non défini');
    
    console.log('\n\nℹ️ MESSAGE INFO ACTUEL:');
    console.log('--------------------');
    console.log(config.buttons?.info?.content || 'Non défini');
    
    // Afficher aussi les traductions personnalisées si elles existent
    if (config.buttons?.contact?.contentTranslations?.size > 0) {
      console.log('\n\n🌐 TRADUCTIONS CONTACT EXISTANTES:');
      console.log('----------------------------------');
      for (const [lang, text] of config.buttons.contact.contentTranslations) {
        console.log(`${lang}: ${text}`);
      }
    }
    
    if (config.buttons?.info?.contentTranslations?.size > 0) {
      console.log('\n\n🌐 TRADUCTIONS INFO EXISTANTES:');
      console.log('-------------------------------');
      for (const [lang, text] of config.buttons.info.contentTranslations) {
        console.log(`${lang}: ${text}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');
  }
}

getCurrentMessages();