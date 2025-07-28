const Config = require('../models/Config');
const { createMainKeyboard } = require('../utils/keyboards');
const { getTranslation } = require('../utils/translations');
const { getFreshConfig } = require('../utils/configHelper');
const { editMessageWithImage } = require('../utils/messageHelper');

// Gestionnaire pour le bouton Contact - Affiche le texte configurable comme Info
const handleContact = async (ctx) => {
  try {
    // Confirmer immédiatement la callback pour éviter le loading
    await ctx.answerCbQuery();
    
    // TOUJOURS récupérer la config ACTUELLE
    const config = await getFreshConfig(true);
    
    if (!config) {
      console.log('❌ Configuration ACTUELLE non trouvée pour Contact');
      return;
    }

    // Récupérer la langue ACTUELLE et les traductions
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    console.log(`📞 Contact affiché en langue ACTUELLE: ${currentLang}`);
    
    // Affichage contact avec texte configurable (comme Info)
    const contactTitle = getTranslation('menu_contact', currentLang, customTranslations);
    
    // PRIORITÉ : Texte du panel admin, sinon traductions par défaut
    const panelContactText = config?.buttons?.contact?.content;
    const defaultContactText = getTranslation('contact_default_text', currentLang, customTranslations) || 'Contactez-nous pour plus d\'informations !';
    
    // Utiliser le texte du panel admin si disponible, sinon les traductions
    const finalContactText = panelContactText || defaultContactText;
    console.log('📞 Contact content ACTUEL utilisé:', finalContactText);
    
    const message = `${contactTitle}\n\n${finalContactText}`;

    // Créer le clavier avec la config ACTUELLE
    const keyboard = await createMainKeyboard(config);

    // Utiliser la fonction centralisée pour l'affichage
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
    console.log('✅ Contact affiché avec configuration ACTUELLE');

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
    
    // TOUJOURS récupérer la config ACTUELLE
    const config = await getFreshConfig(true);
    
    if (!config) {
      console.log('❌ Configuration ACTUELLE non trouvée pour Info');
      return;
    }

    // Vérifier si le info menu personnalisé est activé
    if (config?.infoMenu?.enabled) {
      return handleInfoMenu(ctx, config);
    }

    // Récupérer la langue ACTUELLE et les traductions
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    console.log(`ℹ️ Info affiché en langue ACTUELLE: ${currentLang}`);
    
    // Affichage info avec texte configurable depuis l'admin ACTUEL
    const infoTitle = getTranslation('menu_info', currentLang, customTranslations);
    
    // PRIORITÉ : Texte du panel admin SEULEMENT en français, sinon traductions par défaut
    const panelInfoText = config?.buttons?.info?.content;
    const defaultInfoText = getTranslation('info_default_text', currentLang, customTranslations) || 'Découvrez notre plateforme premium.';
    
    // Utiliser le texte du panel admin SEULEMENT si on est en français ET qu'il existe
    // Pour les autres langues, toujours utiliser les traductions
    const finalInfoText = (currentLang === 'fr' && panelInfoText) ? panelInfoText : defaultInfoText;
    console.log('ℹ️ Info content ACTUEL utilisé:', finalInfoText);
    
    const message = `${infoTitle}\n\n${finalInfoText}`;

    // Créer le clavier avec la config ACTUELLE
    const keyboard = await createMainKeyboard(config);

    // Utiliser la fonction centralisée pour l'affichage
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
    console.log('✅ Info affiché avec configuration ACTUELLE');

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