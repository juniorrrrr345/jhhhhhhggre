const Config = require('../models/Config');
const Plug = require('../models/Plug');
const { createMainKeyboard, createVIPKeyboard } = require('../utils/keyboards');

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
    console.log('🔙 Retour au menu principal demandé');
    
    // Toujours récupérer la config fraîche
    const config = await Config.findById('main');
    if (!config) {
      console.log('❌ Configuration non trouvée');
      return ctx.answerCbQuery('❌ Configuration non trouvée');
    }

    console.log('📋 Configuration récupérée pour le retour');

    // Utiliser le même message d'accueil que dans handleStart
    const welcomeMessage = config.welcome?.text || '🌟 Bienvenue sur notre bot !';
    const keyboard = createMainKeyboard(config);
    
    console.log('📝 Message d\'accueil préparé pour le retour');
    
    // Vérifier le type de message et agir en conséquence
    try {
      // Essayer d'abord d'éditer le message texte
      await ctx.editMessageText(welcomeMessage, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'HTML'
      });
      console.log('✅ Message texte édité avec succès');
    } catch (editError) {
      console.log('⚠️ Impossible d\'éditer le message (probablement une photo), suppression et envoi d\'un nouveau message');
      
      try {
        // Supprimer le message actuel
        await ctx.deleteMessage();
        console.log('🗑️ Message précédent supprimé');
      } catch (deleteError) {
        console.log('⚠️ Impossible de supprimer le message précédent:', deleteError.message);
      }
      
      // Envoyer un nouveau message
      const welcomeImage = config.welcome?.image || null;
      
      if (welcomeImage) {
        try {
          console.log('📸 Envoi nouveau message avec image');
          await ctx.replyWithPhoto(welcomeImage, {
            caption: welcomeMessage,
            reply_markup: keyboard.reply_markup,
            parse_mode: 'HTML'
          });
          console.log('✅ Nouveau message avec image envoyé');
        } catch (photoError) {
          console.error('❌ Erreur envoi photo, fallback vers texte:', photoError);
          await ctx.reply(welcomeMessage, keyboard);
        }
      } else {
        console.log('📝 Envoi nouveau message texte');
        await ctx.reply(welcomeMessage, keyboard);
      }
    }
    
    console.log('✅ Retour au menu principal terminé');
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('❌ Erreur dans handleBackMain:', error);
    // Fallback : répondre avec le message de démarrage
    try {
      await ctx.answerCbQuery('❌ Erreur lors du retour au menu');
    } catch (cbError) {
      console.error('❌ Erreur lors de answerCbQuery:', cbError);
    }
  }
};

module.exports = {
  handleStart,
  handleBackMain
};