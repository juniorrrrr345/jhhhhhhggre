require('dotenv').config();
const mongoose = require('mongoose');
const Config = require('../src/models/Config');

async function fixDatabase() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 2000,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 300000,
    });
    
    console.log('✅ MongoDB connecté avec succès');
    
    // Vérifier si la configuration existe
    const existingConfig = await Config.findById('main');
    
    if (!existingConfig) {
      console.log('📝 Création de la configuration par défaut...');
      
      const defaultConfig = new Config({
        _id: 'main',
        welcome: {
          text: '🌟 Bienvenue sur notre bot !\n\nDécouvrez nos meilleurs plugs sélectionnés avec soin pour vous offrir un service de qualité premium.\n\n🔥 Section VIP mise à jour quotidiennement\n✅ Services vérifiés',
          image: '',
          socialMedia: []
        },
        buttons: {
          topPlugs: {
            text: '🔌 Top Des Plugs',
            enabled: true
          },
          contact: {
            text: '📞 Contact',
            content: 'Besoin d\'aide ou d\'informations ?\n\n📧 Email: support@botplugs.com\n📱 Support disponible 24h/7j\n\n🔒 Toutes vos communications sont cryptées et sécurisées.',
            enabled: true
          },
          info: {
            text: 'ℹ️ Info',
            content: '🤖 Bot Telegram VIP System\n\n🎯 Plateforme premium de mise en relation\n🔐 Sécurité et discrétion garanties\n⭐ Sélection VIP mise à jour en temps réel\n🌍 Couverture internationale',
            enabled: true
          }
        },
        socialMedia: {
          telegram: '',
          instagram: '',
          whatsapp: '',
          website: ''
        },
        vip: {
          enabled: true,
          title: '🌟 SECTION VIP PREMIUM',
          description: 'Nos plugs premium sélectionnés pour leur fiabilité et qualité de service',
          position: 'top'
        },
        filters: {
          byService: '🔍 Filtrer par service',
          byCountry: '🌍 Filtrer par pays',
          all: '📋 Tous les plugs'
        },
        messages: {
          noPlugsFound: '😅 Aucun plug trouvé pour ces critères.\nEssayez d\'autres filtres ou contactez-nous.',
          errorOccurred: '❌ Une erreur est survenue, veuillez réessayer dans quelques instants.'
        },
        boutique: {
          name: 'Bot Plugs VIP',
          logo: '',
          subtitle: 'Votre plateforme premium',
          backgroundImage: '',
          vipTitle: '👑 Boutiques VIP Premium',
          vipSubtitle: '✨ Découvrez nos boutiques sélectionnées',
          searchTitle: '🔍 Rechercher',
          searchSubtitle: 'Trouvez ce que vous cherchez'
        }
      });
      
      await defaultConfig.save();
      console.log('✅ Configuration par défaut créée avec succès');
      
    } else {
      console.log('ℹ️ Configuration existante trouvée');
      console.log('📋 Données:', {
        welcome: existingConfig.welcome?.text ? 'Défini' : 'Non défini',
        buttons: existingConfig.buttons ? 'Défini' : 'Non défini',
        boutique: existingConfig.boutique?.name || 'Non défini'
      });
    }
    
    // Test de la configuration publique
    const config = await Config.findById('main');
    const publicConfig = {
      boutique: config?.boutique || {},
      welcome: config?.welcome || {},
      socialMedia: config?.socialMedia || {},
      messages: config?.messages || {},
      buttons: config?.buttons || {}
    };
    
    console.log('✅ Configuration publique prête:', Object.keys(publicConfig));
    
    console.log('🎉 Base de données réparée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la réparation:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter la réparation
if (require.main === module) {
  fixDatabase()
    .then(() => {
      console.log('✅ Réparation terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Échec de la réparation:', error);
      process.exit(1);
    });
}

module.exports = fixDatabase;