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
    
    // Confirmer la callback pour éviter le loading
    await ctx.answerCbQuery();

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

    // Utiliser uniquement le contenu personnalisé du panel admin
    const message = config.buttons.info.content;

    const keyboard = createMainKeyboard(config);

    await ctx.editMessageText(message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });
    
    // Confirmer la callback pour éviter le loading
    await ctx.answerCbQuery();

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