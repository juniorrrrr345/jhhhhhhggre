require('dotenv').config();
const mongoose = require('mongoose');
const Config = require('../src/models/Config');

async function createDefaultConfig() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Connecté à MongoDB');
    
    // Vérifier si la configuration existe
    const existingConfig = await Config.findById('main');
    
    if (existingConfig) {
      console.log('ℹ️ Configuration existe déjà');
      console.log('📋 Données existantes:', {
        boutique: !!existingConfig.boutique,
        welcome: !!existingConfig.welcome,
        socialMedia: !!existingConfig.socialMedia,
        messages: !!existingConfig.messages
      });
    } else {
      console.log('🆕 Création de la configuration par défaut...');
      
      const defaultConfig = await Config.create({
        _id: 'main',
        welcome: {
          text: '🌟 Bienvenue sur notre bot !\n\nDécouvrez nos meilleurs plugs sélectionnés avec soin.',
          image: '', // Image d'accueil pour les menus
          socialMedia: [] // Réseaux sociaux d'accueil personnalisés
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
          topPlugs: { text: '🔌 Top Des Plugs', enabled: true },
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
      
      console.log('✅ Configuration par défaut créée avec succès');
      console.log('📋 ID:', defaultConfig._id);
    }
    
    // Vérifier que la configuration est accessible
    const verifyConfig = await Config.findById('main');
    if (verifyConfig) {
      console.log('✅ Configuration vérifiée et accessible');
    } else {
      console.error('❌ Erreur: Configuration non accessible après création');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la configuration:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  createDefaultConfig()
    .then(() => {
      console.log('🎉 Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Échec du script:', error.message);
      process.exit(1);
    });
}

module.exports = createDefaultConfig;