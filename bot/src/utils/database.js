const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('✅ Base de données déjà connectée');
    return;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log(`✅ MongoDB connecté: ${connection.connection.host}`);

    // Initialiser la configuration par défaut si elle n'existe pas
    const Config = require('../models/Config');
    const existingConfig = await Config.findById('main');
    
    if (!existingConfig) {
      const defaultConfig = new Config({ _id: 'main' });
      await defaultConfig.save();
      console.log('✅ Configuration par défaut créée');
    }

  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

// Gérer les déconnexions
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB déconnecté');
  isConnected = false;
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Erreur MongoDB:', error);
  isConnected = false;
});

module.exports = { connectDB };