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

const fixSocialMedia = async () => {
  try {
    await connectDB();
    
    console.log('🔄 Correction de la configuration des réseaux sociaux...');
    
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
    
    // Forcer les valeurs par défaut
    config.buttons.socialMedia.enabled = true;
    config.buttons.socialMedia.text = '📱 Réseaux sociaux';
    config.buttons.socialMedia.content = 'Suivez-nous sur nos réseaux sociaux !';
    
    // S'assurer que socialMedia est un array
    if (!Array.isArray(config.socialMedia)) {
      console.log('🔄 Conversion socialMedia en array...');
      
      if (config.socialMedia && typeof config.socialMedia === 'object') {
        // Convertir objet en array
        const socialArray = [];
        for (const [key, value] of Object.entries(config.socialMedia)) {
          if (value && typeof value === 'string' && value.trim()) {
            const mapping = {
              telegram: { name: 'Telegram', emoji: '📱' },
              instagram: { name: 'Instagram', emoji: '📷' },
              whatsapp: { name: 'WhatsApp', emoji: '💬' },
              website: { name: 'Site Web', emoji: '🌐' }
            };
            
            const info = mapping[key] || { name: key, emoji: '🌐' };
            socialArray.push({
              name: info.name,
              emoji: info.emoji,
              url: value.trim()
            });
          }
        }
        config.socialMedia = socialArray;
      } else {
        config.socialMedia = [];
      }
    }
    
    // Ajouter un réseau social d'exemple si aucun n'existe
    if (config.socialMedia.length === 0) {
      console.log('➕ Ajout d\'un réseau social d\'exemple...');
      config.socialMedia = [
        {
          name: 'Telegram',
          emoji: '📱',
          url: 'https://t.me/votre_canal'
        }
      ];
    }
    
    await config.save();
    
    console.log('✅ Configuration mise à jour avec succès !');
    console.log('📋 Réseaux sociaux configurés:', config.socialMedia.length);
    console.log('🎛️ Bouton activé:', config.buttons.socialMedia.enabled);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

// Lancer le script
require('dotenv').config();
fixSocialMedia();