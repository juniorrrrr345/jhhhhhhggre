const Config = require('../models/Config');
const { createMainKeyboard } = require('../utils/keyboards');
const { getTranslation } = require('../utils/translations');
const { getFreshConfig } = require('../utils/configHelper');

// Gestionnaire pour le bouton Contact
const handleContact = async (ctx) => {
  try {
    // Confirmer immédiatement la callback pour éviter le loading
    await ctx.answerCbQuery();
    
    const config = await getFreshConfig();
    
    if (!config) {
      return;
    }

    // Vérifier si le support menu personnalisé est activé
    if (config?.supportMenu?.enabled) {
      return handleSupportMenu(ctx, config);
    }

    // Récupérer la langue actuelle et les traductions
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    // Affichage contact classique avec traductions
    const contactTitle = getTranslation('menu_contact', currentLang, customTranslations);
    const defaultContactText = getTranslation('contact_default_text', currentLang, customTranslations) || 'Contactez-nous pour plus d\'informations !';
    
    // Utiliser le contenu du panel admin en priorité, sinon traduction par défaut
    const contactContent = config?.buttons?.contact?.content;
    const finalContactText = contactContent || defaultContactText;
    console.log('📞 Contact content utilisé:', finalContactText);
    
    let message = `${contactTitle}\n\n${finalContactText}`;

    // Ajouter les réseaux sociaux globaux - PRIORITÉ socialMediaList
    const socialMediaData = config?.socialMediaList || config?.socialMedia || [];
    const activeSocials = socialMediaData.filter(social => 
      social && social.name && social.url && social.enabled !== false
    );
    
    if (activeSocials.length > 0) {
      const contactUsText = getTranslation('contact_us_text', currentLang, customTranslations) || 'Nous contacter';
      message += `\n\n📱 **${contactUsText} :**\n`;
      
      activeSocials.forEach(social => {
        const emoji = social.emoji || '🌐';
        message += `• ${emoji} ${social.name} : ${social.url}\n`;
      });
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

// Nouveau gestionnaire pour le Support Menu personnalisé
const handleSupportMenu = async (ctx, config) => {
  try {
    const { Markup } = require('telegraf');
    
    // Message du support avec texte personnalisé
    let message = `🔧 **Support SwissQuality**\n\n${config.supportMenu.text || 'Contactez notre équipe pour toute assistance.'}`;

    // Bouton retour au menu principal
    const buttons = [
      [Markup.button.callback('🔙 Retour au menu', 'back_main')]
    ];
    
    const keyboard = Markup.inlineKeyboard(buttons);

    // Utiliser l'image du support ou l'image d'accueil par défaut
    const imageToUse = config.supportMenu.image || config.welcome?.image;

    if (imageToUse) {
      try {
        await ctx.editMessageMedia({
          type: 'photo',
          media: imageToUse,
          caption: message,
          parse_mode: 'Markdown'
        }, {
          reply_markup: keyboard.reply_markup
        });
      } catch (error) {
        console.log('⚠️ Erreur édition image support, fallback texte');
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
    console.error('Erreur dans handleSupportMenu:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement').catch(() => {});
  }
};

// Gestionnaire pour le bouton Info
const handleInfo = async (ctx) => {
  try {
    // Confirmer immédiatement la callback pour éviter le loading
    await ctx.answerCbQuery();
    
    const config = await getFreshConfig();
    
    if (!config) {
      return;
    }

    // Vérifier si le info menu personnalisé est activé
    if (config?.infoMenu?.enabled) {
      return handleInfoMenu(ctx, config);
    }

    // Récupérer la langue actuelle et les traductions
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    // Affichage info classique avec traductions
    const infoTitle = getTranslation('menu_info', currentLang, customTranslations);
    const defaultInfoText = getTranslation('info_default_text', currentLang, customTranslations) || 'Découvrez notre plateforme premium.';
    
    // Utiliser le contenu du panel admin en priorité, sinon traduction par défaut
    const infoContent = config?.buttons?.info?.content;
    const finalInfoText = infoContent || defaultInfoText;
    console.log('ℹ️ Info content utilisé:', finalInfoText);
    
    const message = `${infoTitle}\n\n${finalInfoText}`;

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

// Nouveau gestionnaire pour le Info Menu personnalisé
const handleInfoMenu = async (ctx, config) => {
  try {
    const { Markup } = require('telegraf');
    
    // Message info avec texte personnalisé
    let message = `ℹ️ **Informations**\n\n${config.infoMenu.text || 'Informations sur notre service.'}`;

    // Bouton retour au menu principal
    const buttons = [
      [Markup.button.callback('🔙 Retour au menu', 'back_main')]
    ];
    
    const keyboard = Markup.inlineKeyboard(buttons);

    // Utiliser l'image info ou l'image d'accueil par défaut
    const imageToUse = config.infoMenu.image || config.welcome?.image;

    if (imageToUse) {
      try {
        await ctx.editMessageMedia({
          type: 'photo',
          media: imageToUse,
          caption: message,
          parse_mode: 'Markdown'
        }, {
          reply_markup: keyboard.reply_markup
        });
      } catch (error) {
        console.log('⚠️ Erreur édition image info, fallback texte');
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
    console.error('Erreur dans handleInfoMenu:', error);
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
  handleIgnoredCallback,
  handleSupportMenu,
  handleInfoMenu
};