const mongoose = require('mongoose');
const Config = require('../src/models/Config');
require('dotenv').config({ path: '../.env' });

const MESSAGES = {
  contact: 'Contactez-nous pour plus d\'informations.\n@findyourplugsav',
  info: 'Nous listons les plugs du monde entier par Pays / Ville découvrez notre mini-app 🌍🔌\n\nPour toute demande spécifique contacter nous @findyourplugsav 📲'
};

async function forceUpdateMessages() {
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
    
    // Forcer la mise à jour des messages
    if (!config.buttons) config.buttons = {};
    if (!config.buttons.contact) config.buttons.contact = {};
    if (!config.buttons.info) config.buttons.info = {};
    
    config.buttons.contact.content = MESSAGES.contact;
    config.buttons.info.content = MESSAGES.info;
    
    // Supprimer les traductions personnalisées pour forcer l'utilisation du message principal
    if (config.buttons.contact.contentTranslations) {
      config.buttons.contact.contentTranslations = new Map();
    }
    if (config.buttons.info.contentTranslations) {
      config.buttons.info.contentTranslations = new Map();
    }
    
    await config.save();
    
    console.log('\n✅ Messages mis à jour avec succès !');
    console.log('\n📞 MESSAGE CONTACT:');
    console.log('-------------------');
    console.log(MESSAGES.contact);
    console.log('\n\nℹ️ MESSAGE INFO:');
    console.log('----------------');
    console.log(MESSAGES.info);
    console.log('\n✅ Ces messages seront maintenant affichés dans TOUTES les langues !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');
  }
}

forceUpdateMessages();