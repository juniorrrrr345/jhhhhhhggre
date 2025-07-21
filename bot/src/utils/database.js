const mongoose = require('mongoose');

let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 5;

const connectDB = async (retryAttempt = 0) => {
  // Vérifier l'état réel de la connexion mongoose
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    console.log('✅ Base de données déjà connectée');
    return;
  }

  try {
    connectionAttempts++;
    console.log(`🔄 Tentative de connexion MongoDB #${connectionAttempts}...`);
    
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 secondes timeout
      heartbeatFrequencyMS: 2000, // Ping toutes les 2 secondes
      maxPoolSize: 10, // Maximum 10 connexions
      minPoolSize: 1,  // Minimum 1 connexion
      maxIdleTimeMS: 30000, // Fermer les connexions inactives après 30s
    });

    isConnected = true;
    connectionAttempts = 0; // Reset counter on success
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
    isConnected = false;
    console.error(`❌ Erreur de connexion MongoDB (tentative #${connectionAttempts}):`, error.message);
    
    if (retryAttempt < MAX_RETRY_ATTEMPTS) {
      console.log(`🔄 Nouvelle tentative dans 3 secondes... (${retryAttempt + 1}/${MAX_RETRY_ATTEMPTS})`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return connectDB(retryAttempt + 1);
    } else {
      console.error('❌ Impossible de se connecter à MongoDB après plusieurs tentatives');
      throw error;
    }
  }
};

// Fonction pour vérifier et reconnecter si nécessaire
const ensureConnection = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.log('⚠️ Connexion MongoDB perdue, reconnexion...');
    isConnected = false;
    await connectDB();
  }
  return true;
};

// Gérer les déconnexions avec tentative de reconnexion
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB déconnecté - tentative de reconnexion...');
  isConnected = false;
  
  // Tentative de reconnexion après 5 secondes
  setTimeout(async () => {
    try {
      if (mongoose.connection.readyState === 0) { // Disconnected
        await connectDB();
      }
    } catch (error) {
      console.error('❌ Échec de la reconnexion automatique:', error.message);
    }
  }, 5000);
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Erreur MongoDB:', error.message);
  isConnected = false;
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB reconnecté avec succès');
  isConnected = true;
});

module.exports = { connectDB, ensureConnection };