const Config = require('../models/Config');
const Plug = require('../models/Plug');
const { createMainKeyboard, createVIPKeyboard } = require('../utils/keyboards');
const { editMessageRobust, answerCallbackSafe, logHandler } = require('../utils/messageUtils');

const handleStart = async (ctx) => {
  try {
    console.log('🚀 Commande /start reçue de:', ctx.from.id);
    
    // Récupérer la configuration avec fallback (toujours fresh)
    let config;
    try {
      config = await Config.findById('main');
      console.log('📋 Config trouvée:', !!config);
    } catch (error) {
      console.error('❌ Erreur récupération config:', error);
    }
    
    if (!config) {
      console.log('⚠️ Pas de config, utilisation des valeurs par défaut');
      return ctx.reply('🌟 Bienvenue sur notre bot !\n\nConfiguration en cours...');
    }

    // Vérifications de sécurité
    const welcomeText = config.welcome?.text || '🌟 Bienvenue sur notre bot !';
    const welcomeImage = config.welcome?.image || null;
    
    console.log('📝 Message d\'accueil préparé:', welcomeText.substring(0, 50) + '...');

    // Construire le message d'accueil (sans section VIP)
    let welcomeMessage = welcomeText;

    // Créer le clavier principal
    const keyboard = createMainKeyboard(config);

    // Envoyer le message avec image si disponible
    if (welcomeImage) {
      try {
        console.log('📸 Envoi avec image:', welcomeImage);
        await ctx.replyWithPhoto(welcomeImage, {
          caption: welcomeMessage,
          reply_markup: keyboard.reply_markup,
          parse_mode: 'HTML'
        });
        console.log('✅ Message avec image envoyé');
      } catch (error) {
        console.error('❌ Erreur envoi photo:', error);
        // Fallback sans image
        console.log('🔄 Fallback vers message texte');
        await ctx.reply(welcomeMessage, keyboard);
      }
    } else {
      console.log('📝 Envoi message texte simple');
      await ctx.reply(welcomeMessage, keyboard);
    }
    
    console.log('✅ Commande /start terminée avec succès');

  } catch (error) {
    console.error('Erreur dans handleStart:', error);
    await ctx.reply('❌ Une erreur est survenue, veuillez réessayer.');
  }
};

// Gestionnaire pour retour au menu principal
const handleBackMain = async (ctx) => {
  try {
    logHandler('BackMain', 'Début');
    
    // Toujours récupérer la config fraîche
    const config = await Config.findById('main');
    if (!config) {
      logHandler('BackMain', 'Configuration non trouvée');
      return await answerCallbackSafe(ctx, '❌ Configuration non trouvée');
    }

    logHandler('BackMain', 'Configuration récupérée');

    // Utiliser le même message d'accueil que dans handleStart
    const welcomeMessage = config.welcome?.text || '🌟 Bienvenue sur notre bot !';
    const welcomeImage = config.welcome?.image || null;
    const keyboard = createMainKeyboard(config);
    
    logHandler('BackMain', 'Message préparé', { 
      hasImage: !!welcomeImage,
      textLength: welcomeMessage.length 
    });
    
    // Utiliser l'utilitaire robuste pour éditer le message
    const success = await editMessageRobust(ctx, welcomeMessage, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'HTML'
    }, welcomeImage);
    
    if (success) {
      logHandler('BackMain', 'Succès');
    } else {
      logHandler('BackMain', 'Échec édition message');
    }
    
    await answerCallbackSafe(ctx);
    
  } catch (error) {
    logHandler('BackMain', 'Erreur', { error: error.message });
    // Fallback : répondre avec le message de démarrage
    await answerCallbackSafe(ctx, '❌ Erreur lors du retour au menu');
  }
};

module.exports = {
  handleStart,
  handleBackMain
};