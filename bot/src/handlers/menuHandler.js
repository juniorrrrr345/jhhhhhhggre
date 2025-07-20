const Config = require('../models/Config');
const { createMainKeyboard } = require('../utils/keyboards');

// Gestionnaire pour le bouton Contact
const handleContact = async (ctx) => {
  try {
    const config = await Config.findById('main');
    
    if (!config) {
      return ctx.answerCbQuery('❌ Configuration non trouvée');
    }

    let message = `📞 **Contact**\n\n${config.buttons.contact.content}`;

    // Ajouter les réseaux sociaux globaux
    if (config.socialMedia.telegram || config.socialMedia.whatsapp) {
      message += '\n\n📱 **Nous contacter :**\n';
      
      if (config.socialMedia.telegram) {
        message += `• Telegram : ${config.socialMedia.telegram}\n`;
      }
      if (config.socialMedia.whatsapp) {
        message += `• WhatsApp : ${config.socialMedia.whatsapp}\n`;
      }
    }

    const keyboard = createMainKeyboard(config);

    await ctx.editMessageText(message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });

  } catch (error) {
    console.error('Erreur dans handleContact:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement');
  }
};

// Gestionnaire pour le bouton Info
const handleInfo = async (ctx) => {
  try {
    const config = await Config.findById('main');
    
    if (!config) {
      return ctx.answerCbQuery('❌ Configuration non trouvée');
    }

    let message = `ℹ️ **Informations**\n\n${config.buttons.info.content}`;

    // Ajouter des statistiques générales
    const Plug = require('../models/Plug');
    const totalPlugs = await Plug.countDocuments({ isActive: true });
    const vipPlugs = await Plug.countDocuments({ isActive: true, isVip: true });
    const countries = await Plug.distinct('countries', { isActive: true });

    message += '\n\n📊 **Nos statistiques :**\n';
    message += `• ${totalPlugs} plugs actifs\n`;
    message += `• ${vipPlugs} plugs VIP\n`;
    message += `• ${countries.length} pays couverts\n`;

    // Services disponibles
    const deliveryCount = await Plug.countDocuments({ 
      isActive: true, 
      'services.delivery.enabled': true 
    });
    const postalCount = await Plug.countDocuments({ 
      isActive: true, 
      'services.postal.enabled': true 
    });
    const meetupCount = await Plug.countDocuments({ 
      isActive: true, 
      'services.meetup.enabled': true 
    });

    message += '\n🔧 **Services proposés :**\n';
    message += `• 🚚 Livraison : ${deliveryCount} plugs\n`;
    message += `• ✈️ Envoi postal : ${postalCount} plugs\n`;
    message += `• 🏠 Meetup : ${meetupCount} plugs`;

    const keyboard = createMainKeyboard(config);

    await ctx.editMessageText(message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });

  } catch (error) {
    console.error('Erreur dans handleInfo:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement');
  }
};

// Gestionnaire générique pour les callbacks ignorés
const handleIgnoredCallback = async (ctx) => {
  await ctx.answerCbQuery();
};

module.exports = {
  handleContact,
  handleInfo,
  handleIgnoredCallback
};