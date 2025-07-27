const mongoose = require('mongoose');
const Config = require('./src/models/Config');

async function restoreTelegramConfig() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    let config = await Config.findById('main');
    if (!config) {
      console.log('❌ Configuration main non trouvée');
      await mongoose.disconnect();
      return;
    }
    
    console.log('=== CONFIGURATION ACTUELLE ===');
    console.log('socialMedia:', JSON.stringify(config?.socialMedia, null, 2));
    console.log('socialMediaList:', JSON.stringify(config?.socialMediaList, null, 2));
    
    // Restaurer la configuration Telegram sans photo - seulement liens, emojis et noms vérifiés
    const telegramConfig = [
      {
        name: 'Telegram',
        emoji: '📱',
        url: 'https://t.me/+zcP68c4M_3NlM2Y0',
        enabled: true,
        verified: true
      },
      {
        name: 'Contact',
        emoji: '📞', 
        url: 'https://t.me/findyourplugsav',
        enabled: true,
        verified: true
      }
    ];
    
    // Mettre à jour la configuration
    config.socialMediaList = telegramConfig;
    config.socialMedia = telegramConfig; // Pour compatibilité
    
    // S'assurer que le bouton social media est activé
    if (!config.buttons) config.buttons = {};
    if (!config.buttons.socialMedia) config.buttons.socialMedia = {};
    config.buttons.socialMedia.enabled = true;
    config.buttons.socialMedia.content = 'Suivez-nous sur nos réseaux sociaux !';
    
    // Supprimer toute configuration d'image pour les réseaux sociaux
    if (config.welcome && config.welcome.image) {
      console.log('🖼️ Suppression de l\'image des réseaux sociaux...');
      // On garde l'image de bienvenue mais on s'assure qu'elle n'apparaît pas sur les réseaux sociaux
    }
    
    await config.save();
    
    console.log('\n=== CONFIGURATION MISE À JOUR ===');
    console.log('✅ Réseaux sociaux Telegram restaurés (sans photo)');
    console.log('📱 Telegram:', telegramConfig[0].url);
    console.log('📞 Contact:', telegramConfig[1].url);
    console.log('🔗 Bouton activé:', config.buttons.socialMedia.enabled);
    console.log('📋 Nombre de réseaux:', telegramConfig.length);
    
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

restoreTelegramConfig();