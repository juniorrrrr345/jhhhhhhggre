const mongoose = require('mongoose');
require('dotenv').config();

// Modèle Config simplifié
const configSchema = new mongoose.Schema({
  _id: String,
  boutique: {
    inscriptionTelegramLink: String,
    servicesTelegramLink: String
  }
}, { collection: 'configs' });

const Config = mongoose.model('Config', configSchema);

const updateTelegramLinks = async () => {
  try {
    // Utiliser la variable d'environnement MONGODB_URI si disponible
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://admin:lCGYmBzwZwkpTgvT@tesye.qazpla.mongodb.net/testdatabase?retryWrites=true&w=majority';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connecté');

    // Trouver la config principale
    let config = await Config.findById('main');
    
    if (!config) {
      console.log('❌ Configuration principale non trouvée');
      return;
    }

    console.log('🔍 Config actuelle:', {
      inscription: config.boutique?.inscriptionTelegramLink,
      services: config.boutique?.servicesTelegramLink
    });

    // Initialiser boutique si nécessaire
    if (!config.boutique) {
      config.boutique = {};
    }

    // Mettre à jour les liens vers findyourplugsav
    config.boutique.inscriptionTelegramLink = 'https://t.me/findyourplugsav';
    config.boutique.servicesTelegramLink = 'https://t.me/findyourplugsav';

    await config.save();
    
    console.log('✅ Liens Telegram mis à jour vers: https://t.me/findyourplugsav');
    console.log('🔗 Nouveaux liens:', {
      inscription: config.boutique.inscriptionTelegramLink,
      services: config.boutique.servicesTelegramLink
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB déconnecté');
  }
};

updateTelegramLinks();