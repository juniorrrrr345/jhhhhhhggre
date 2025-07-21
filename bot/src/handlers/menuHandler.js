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

    // Vérifier si le support menu personnalisé est activé
    if (config?.supportMenu?.enabled) {
      return handleSupportMenu(ctx, config);
    }

    // Affichage contact classique
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

// Nouveau gestionnaire pour le Support Menu personnalisé
const handleSupportMenu = async (ctx, config) => {
  try {
    const { Markup } = require('telegraf');
    
    // Message du support avec texte personnalisé
    let message = `🔧 **Support SwissQuality**\n\n${config.supportMenu.text || 'Contactez notre équipe pour toute assistance.'}`;

    // Créer les boutons de réseaux sociaux personnalisés
    const buttons = [];
    
    if (config.supportMenu.socialMedia && Array.isArray(config.supportMenu.socialMedia)) {
      const validSocialMedia = config.supportMenu.socialMedia.filter(social => 
        social && social.name && social.emoji && social.url && social.url.trim() !== ''
      );
      
      console.log(`📱 Support Menu: ${validSocialMedia.length} réseaux sociaux configurés`);
      
      // Grouper les réseaux sociaux par lignes de 2
      for (let i = 0; i < validSocialMedia.length; i += 2) {
        const socialRow = [];
        const social1 = validSocialMedia[i];
        
        try {
          socialRow.push(Markup.button.url(`${social1.emoji} ${social1.name}`, social1.url));
          console.log(`📱 Bouton support créé: ${social1.emoji} ${social1.name} -> ${social1.url}`);
          
          if (validSocialMedia[i + 1]) {
            const social2 = validSocialMedia[i + 1];
            socialRow.push(Markup.button.url(`${social2.emoji} ${social2.name}`, social2.url));
            console.log(`📱 Bouton support créé: ${social2.emoji} ${social2.name} -> ${social2.url}`);
          }
          
          buttons.push(socialRow);
        } catch (error) {
          console.error(`❌ Erreur création bouton social support:`, error);
        }
      }
    }
    
    // Bouton retour au menu principal
    buttons.push([Markup.button.callback('🔙 Retour au menu', 'back_main')]);
    
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
  handleIgnoredCallback,
  handleSupportMenu
};