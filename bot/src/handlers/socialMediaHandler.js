const Config = require('../models/Config');
const { Markup } = require('telegraf');

// Gestionnaire pour le bouton Réseaux Sociaux
const handleSocialMedia = async (ctx) => {
  try {
    // Confirmer immédiatement la callback pour éviter le loading
    await ctx.answerCbQuery();
    
    let socialMediaData = null;
    let message = `📱 **Réseaux Sociaux**\n\nRejoignez notre communauté sur nos différents réseaux sociaux ! 🚀`;
    
    // Essayer de charger depuis la base de données COMME AVANT
    try {
      const config = await Config.findById('main');
      if (config) {
        // Utiliser la configuration personnalisée comme vous l'aviez configurée
        if (config.socialMedia && Array.isArray(config.socialMedia) && config.socialMedia.length > 0) {
          socialMediaData = config.socialMedia;
        } else if (config.socialMediaList && Array.isArray(config.socialMediaList) && config.socialMediaList.length > 0) {
          socialMediaData = config.socialMediaList;
        }
        
        // Utiliser le message personnalisé si disponible
        if (config.buttons?.socialMedia?.content) {
          message = `📱 **Réseaux Sociaux**\n\n${config.buttons.socialMedia.content}`;
        }
      }
    } catch (dbError) {
      console.log('⚠️ Base de données temporairement indisponible, utilisation des valeurs par défaut');
    }
    
    // Si pas de config dans la DB, utiliser vos liens par défaut
    if (!socialMediaData || socialMediaData.length === 0) {
      socialMediaData = [
        {
          name: 'Telegram',
          emoji: '📱',
          url: 'https://t.me/+zcP68c4M_3NlM2Y0'
        },
        {
          name: 'Contact', 
          emoji: '📞',
          url: 'https://t.me/findyourplugsav'
        }
      ];
    }

    // Créer les boutons
    const socialButtons = [];
    
    socialMediaData.forEach(social => {
      if (social.name && social.url && social.enabled !== false) {
        const emoji = social.emoji || '🌐';
        const buttonText = `${emoji} ${social.name}`;
        socialButtons.push([Markup.button.url(buttonText, social.url)]);
      }
    });
    
    // Bouton retour
    socialButtons.push([Markup.button.callback('🔙 Retour au menu', 'back_main')]);
    
    const keyboard = Markup.inlineKeyboard(socialButtons);

    await ctx.editMessageText(message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });

  } catch (error) {
    console.error('Erreur dans handleSocialMedia:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement').catch(() => {});
  }
};

module.exports = {
  handleSocialMedia
};