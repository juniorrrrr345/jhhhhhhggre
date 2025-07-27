const Config = require('../models/Config');
const { Markup } = require('telegraf');

// Gestionnaire pour le bouton Réseaux Sociaux
const handleSocialMedia = async (ctx) => {
  try {
    // Confirmer immédiatement la callback pour éviter le loading
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    
    if (!config) {
      return;
    }

    // Message d'introduction
    let message = `📱 **Réseaux Sociaux**\n\n${config?.buttons?.socialMedia?.content || 'Suivez-nous sur nos réseaux sociaux !'}`;

    // Créer les boutons des réseaux sociaux
    const socialButtons = [];
    
    if (config?.socialMedia && Array.isArray(config.socialMedia) && config.socialMedia.length > 0) {
      // Grouper les réseaux sociaux par lignes de 2
      const socialRows = [];
      let currentRow = [];
      
      config.socialMedia.forEach((social, index) => {
        if (social.name && social.url) {
          const emoji = social.emoji || '🌐';
          const buttonText = `${emoji} ${social.name}`;
          currentRow.push(Markup.button.url(buttonText, social.url));
          
          // Créer une nouvelle ligne tous les 2 boutons ou au dernier élément
          if (currentRow.length === 2 || index === config.socialMedia.length - 1) {
            socialRows.push([...currentRow]);
            currentRow = [];
          }
        }
      });
      
      socialButtons.push(...socialRows);
    } else {
      // Aucun réseau social configuré
      message += '\n\n_Aucun réseau social configuré pour le moment._';
    }
    
    // Bouton retour au menu principal
    socialButtons.push([Markup.button.callback('🔙 Retour au menu', 'back_main')]);
    
    const keyboard = Markup.inlineKeyboard(socialButtons);

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
    console.error('Erreur dans handleSocialMedia:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement').catch(() => {});
  }
};

module.exports = {
  handleSocialMedia
};