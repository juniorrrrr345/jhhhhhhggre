const mongoose = require('mongoose');
const Config = require('../src/models/Config');

async function setupSocialMedia() {
  try {
    console.log('🔗 Configuration des réseaux sociaux pour le bot Telegram...');
    
    // Configuration complète de vos réseaux sociaux
    const socialMediaConfig = [
      {
        id: 'telegram',
        name: 'Telegram',
        emoji: '📱',
        url: 'https://t.me/+zcP68c4M_3NlM2Y0',
        enabled: true
      },
      {
        id: 'find_your_plug',
        name: 'Find Your Plug',
        emoji: '🌐', 
        url: 'https://dym168.org/findyourplug',
        enabled: true
      },
      {
        id: 'instagram',
        name: 'Instagram',
        emoji: '📸',
        url: 'https://www.instagram.com/find.yourplug?igsh=ajRwcjE1eGhoaXMz&utm_source=qr',
        enabled: true
      },
      {
        id: 'luffa',
        name: 'Luffa',
        emoji: '🧽',
        url: 'https://callup.luffa.im/c/EnvtiTHkbvP',
        enabled: true
      },
      {
        id: 'discord',
        name: 'Discord',
        emoji: '🎮',
        url: 'https://discord.gg/g2dACUC3',
        enabled: true
      },
      {
        id: 'contact',
        name: 'Contact',
        emoji: '📞',
        url: 'https://t.me/findyourplugsav',
        enabled: true
      }
    ];

    // Chercher ou créer la configuration principale
    let config = await Config.findById('main');
    if (!config) {
      config = new Config({ _id: 'main' });
    }

    // Mettre à jour la configuration avec les nouveaux réseaux sociaux
    config.socialMedia = socialMediaConfig;
    config.socialMediaList = socialMediaConfig;
    config.shopSocialMediaList = socialMediaConfig;

    // Maintenir compatibilité avec l'ancien format
    config.socialMedia = {
      telegram: 'https://t.me/+zcP68c4M_3NlM2Y0',
      whatsapp: '',
      instagram: 'https://www.instagram.com/find.yourplug?igsh=ajRwcjE1eGhoaXMz&utm_source=qr'
    };

    await config.save();

    console.log('✅ Configuration des réseaux sociaux mise à jour avec succès !');
    console.log('📱 Réseaux configurés :');
    socialMediaConfig.forEach((social, index) => {
      console.log(`   ${index + 1}. ${social.emoji} ${social.name} - ${social.url}`);
    });
    
    return socialMediaConfig;
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration des réseaux sociaux:', error);
    throw error;
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => setupSocialMedia())
    .then(() => {
      console.log('🔌 Configuration terminée, fermeture de la connexion...');
      return mongoose.disconnect();
    })
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
} else {
  module.exports = setupSocialMedia;
}