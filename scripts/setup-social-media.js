const mongoose = require('mongoose');

// Connexion MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error.message);
    process.exit(1);
  }
};

// Schéma Config simplifié
const configSchema = new mongoose.Schema({
  _id: { type: String, default: 'main' },
  buttons: {
    socialMedia: {
      enabled: { type: Boolean, default: true },
      text: { type: String, default: '📱 Réseaux sociaux' },
      content: { type: String, default: 'Suivez-nous sur nos réseaux sociaux !' }
    }
  },
  socialMedia: [
    {
      name: String,
      emoji: String,
      url: String
    }
  ]
}, { 
  timestamps: true,
  strict: false 
});

const Config = mongoose.model('Config', configSchema);

const setupSocialMedia = async () => {
  try {
    await connectDB();
    
    console.log('🔄 Configuration des réseaux sociaux d\'exemple...');
    
    // Trouver ou créer la config principale
    let config = await Config.findById('main');
    
    if (!config) {
      console.log('⚠️ Aucune config trouvée, création d\'une nouvelle...');
      config = new Config({
        _id: 'main'
      });
    }
    
    // S'assurer que buttons existe
    if (!config.buttons) {
      config.buttons = {};
    }
    
    // S'assurer que socialMedia button config existe
    if (!config.buttons.socialMedia) {
      config.buttons.socialMedia = {};
    }
    
    // Configurer le bouton réseaux sociaux
    config.buttons.socialMedia = {
      enabled: true,
      text: '📱 Réseaux Sociaux',
      content: 'Rejoignez notre communauté sur nos différents réseaux sociaux ! 🚀'
    };
    
    // Configurer des réseaux sociaux d'exemple
    config.socialMedia = [
      {
        name: 'Telegram',
        emoji: '📱',
        url: 'https://t.me/votre_canal_telegram'
      },
      {
        name: 'Discord',
        emoji: '💬',
        url: 'https://discord.gg/votre-serveur'
      },
      {
        name: 'Instagram',
        emoji: '📷',
        url: 'https://instagram.com/votre_compte'
      },
      {
        name: 'Twitter',
        emoji: '🐦',
        url: 'https://twitter.com/votre_compte'
      },
      {
        name: 'Site Web',
        emoji: '🌐',
        url: 'https://votre-site-web.com'
      }
    ];
    
    await config.save();
    
    console.log('✅ Configuration des réseaux sociaux terminée !');
    console.log('📋 Réseaux configurés:');
    config.socialMedia.forEach((social, index) => {
      console.log(`   ${index + 1}. ${social.emoji} ${social.name}: ${social.url}`);
    });
    console.log('🎛️ Bouton activé:', config.buttons.socialMedia.enabled);
    console.log('📝 Texte bouton:', config.buttons.socialMedia.text);
    console.log('💬 Message intro:', config.buttons.socialMedia.content);
    
    // Tester la structure de données
    console.log('\n🔍 Test de la structure:');
    console.log('- socialMedia est un array:', Array.isArray(config.socialMedia));
    console.log('- Nombre d\'éléments:', config.socialMedia.length);
    console.log('- Premier élément:', JSON.stringify(config.socialMedia[0], null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

// Lancer le script
require('dotenv').config();
setupSocialMedia();