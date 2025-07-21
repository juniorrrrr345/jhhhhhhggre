const Config = require('../models/Config');
const { createMainKeyboard } = require('../utils/keyboards');

// Gestionnaire pour le bouton Contact
const handleContact = async (ctx) => {
  try {
    // Confirmer immédiatement la callback pour éviter le loading
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    
    if (!config) {
      return;
    }

    let message = `📞 **Contact**\n\n${config?.buttons?.contact?.content || 'Contactez-nous pour plus d\'informations !'}`;

    // Ajouter les réseaux sociaux globaux
    if (config?.socialMedia?.telegram || config?.socialMedia?.whatsapp) {
      message += '\n\n📱 **Nous contacter :**\n';
      
      if (config.socialMedia.telegram) {
        message += `• Telegram : ${config.socialMedia.telegram}\n`;
      }
      if (config.socialMedia.whatsapp) {
        message += `• WhatsApp : ${config.socialMedia.whatsapp}\n`;
      }
    }

    const keyboard = createMainKeyboard(config);

    if (config?.welcome?.image) {
      try {
        await ctx.editMessageMedia({
          type: 'photo',
          media: config.welcome.image,
          caption: message,
          parse_mode: 'Markdown'
        }, {
          reply_markup: keyboard.reply_markup
        });
      } catch (error) {
        await ctx.editMessageText(message, {
          reply_markup: keyboard.reply_markup,
          parse_mode: 'Markdown'
        });
      }
    } else {
      await ctx.editMessageText(message, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown'
      });
    }

  } catch (error) {
    console.error('Erreur dans handleContact:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement').catch(() => {});
  }
};

// Gestionnaire pour le bouton Info
const handleInfo = async (ctx) => {
  try {
    // Confirmer immédiatement la callback pour éviter le loading
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    
    if (!config) {
      return;
    }

    // Utiliser le contenu personnalisé du panel admin
    const message = `ℹ️ **Informations**\n\n${config?.buttons?.info?.content || 'Découvrez notre plateforme premium.'}`;

    const keyboard = createMainKeyboard(config);

    if (config?.welcome?.image) {
      try {
        await ctx.editMessageMedia({
          type: 'photo',
          media: config.welcome.image,
          caption: message,
          parse_mode: 'Markdown'
        }, {
          reply_markup: keyboard.reply_markup
        });
      } catch (error) {
        await ctx.editMessageText(message, {
          reply_markup: keyboard.reply_markup,
          parse_mode: 'Markdown'
        });
      }
    } else {
      await ctx.editMessageText(message, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown'
      });
    }

  } catch (error) {
    console.error('Erreur dans handleInfo:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement').catch(() => {});
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