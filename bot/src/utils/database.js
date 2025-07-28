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
      serverSelectionTimeoutMS: 10000, // 10 secondes timeout
      socketTimeoutMS: 45000, // 45 secondes socket timeout
      heartbeatFrequencyMS: 2000, // Ping toutes les 2 secondes
      maxPoolSize: 10, // Maximum 10 connexions
      minPoolSize: 2,  // Minimum 2 connexions pour éviter les déconnexions
      maxIdleTimeMS: 300000, // 5 minutes avant fermeture des connexions inactives
    });

    isConnected = true;
    connectionAttempts = 0; // Reset counter on success
    console.log(`✅ MongoDB connecté: ${connection.connection.host}`);

    // Initialiser la configuration par défaut si elle n'existe pas
    const Config = require('../models/Config');
    let existingConfig = null;
    
    try {
      existingConfig = await Config.findById('main');
    } catch (error) {
      console.log('⚠️ Erreur lors de la recherche de configuration:', error.message);
    }
    
    if (!existingConfig) {
      console.log('📝 Création de la configuration par défaut...');
      try {
        const defaultConfig = await Config.create({
          _id: 'main',
          welcome: {
            text: '🌟 Bienvenue sur notre bot !\n\nDécouvrez nos meilleurs plugs sélectionnés avec soin.',
            image: '', // Image d'accueil pour les menus
            socialMedia: []
          },
          boutique: {
            name: '',
            logo: '',
            subtitle: '',
            backgroundImage: '',
            vipTitle: '',
            vipSubtitle: '',
            searchTitle: '',
            searchSubtitle: ''
          },
          socialMedia: {
            telegram: '',
            instagram: '',
            whatsapp: '',
            website: ''
          },
          messages: {
            welcome: '',
            noPlugsFound: 'Aucun plug trouvé pour ces critères.',
            errorOccurred: 'Une erreur est survenue, veuillez réessayer.'
          },
          buttons: {
            topPlugs: { text: 'VOTER POUR VOTRE PLUG 🗳️', enabled: true },
            contact: { text: '📞 Contact', content: 'Contactez-nous pour plus d\'informations.', enabled: true },
            info: { text: 'ℹ️ Info', content: 'Informations sur notre plateforme.', enabled: true }
          },
          vip: {
            enabled: true,
            title: '🌟 SECTION VIP',
            description: 'Nos plugs premium sélectionnés pour vous',
            position: 'top'
          },
          filters: {
            byService: '🔍 Filtrer par service',
            byCountry: '🌍 Filtrer par pays',
            all: '📋 Tous les plugs'
          }
        });
        
        // Vérifier que la création a réussi
        const verifyConfig = await Config.findById('main');
        if (verifyConfig) {
          console.log('✅ Configuration par défaut créée et vérifiée');
        } else {
          throw new Error('Configuration créée mais non trouvée lors de la vérification');
        }
      } catch (createError) {
        console.error('❌ Erreur lors de la création de la configuration:', createError.message);
        throw createError;
      }
    } else {
      console.log('ℹ️ Configuration existante trouvée');
    }

  } catch (error) {
    isConnected = false;
    console.error(`❌ Erreur de connexion MongoDB (tentative #${connectionAttempts}):`, error.message);
    
    if (retryAttempt < MAX_RETRY_ATTEMPTS) {
      console.log(`🔄 Nouvelle tentative dans 5 secondes... (${retryAttempt + 1}/${MAX_RETRY_ATTEMPTS})`);
      await new Promise(resolve => setTimeout(resolve, 5000));
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

// Améliorer la gestion des événements de connexion
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connecté avec succès');
  isConnected = true;
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Erreur MongoDB:', error.message);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB déconnecté');
  isConnected = false;
  
  // Tentative de reconnexion après 5 secondes (plus conservateur)
  setTimeout(async () => {
    try {
      if (mongoose.connection.readyState === 0) { // Disconnected
        console.log('🔄 Tentative de reconnexion automatique...');
        await connectDB();
      }
    } catch (error) {
      console.error('❌ Échec de la reconnexion automatique:', error.message);
    }
  }, 5000);
});

// Empêcher la fermeture prématurée de la connexion
mongoose.connection.on('close', () => {
  console.log('🔌 Connexion MongoDB fermée');
  isConnected = false;
});

module.exports = { connectDB, ensureConnection };