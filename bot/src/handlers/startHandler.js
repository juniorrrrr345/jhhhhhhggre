const Config = require('../models/Config');
const Plug = require('../models/Plug');
const { createMainKeyboard, createVIPKeyboard } = require('../utils/keyboards');

const handleStart = async (ctx) => {
  try {
    // Récupérer la configuration
    const config = await Config.findById('main');
    if (!config) {
      return ctx.reply('❌ Configuration non trouvée');
    }

    // Récupérer les plugs VIP si activés
    let vipPlugs = [];
    if (config.vip.enabled) {
      vipPlugs = await Plug.find({ 
        isVip: true, 
        isActive: true 
      }).sort({ vipOrder: 1, createdAt: -1 }).limit(5);
    }

    // Construire le message d'accueil (sans section VIP)
    let welcomeMessage = config.welcome.text;

    // Créer le clavier principal
    const keyboard = createMainKeyboard(config);

    // Envoyer le message avec image si disponible
    if (config.welcome.image) {
      try {
        await ctx.replyWithPhoto(config.welcome.image, {
          caption: welcomeMessage,
          reply_markup: keyboard.reply_markup,
          parse_mode: 'HTML'
        });
      } catch (error) {
        console.error('Erreur envoi photo:', error);
        // Fallback sans image
        await ctx.reply(welcomeMessage, keyboard);
      }
    } else {
      await ctx.reply(welcomeMessage, keyboard);
    }

    // Si la section VIP est en position 'bottom', l'envoyer séparément
    if (config.vip.enabled && config.vip.position === 'bottom' && vipPlugs.length > 0) {
      let vipMessage = `✨ ${config.vip.title} ✨\n${config.vip.description}\n`;
      
      vipPlugs.forEach((plug, index) => {
        vipMessage += `\n⭐ ${plug.name}`;
        if (plug.description && plug.description.length < 50) {
          vipMessage += ` - ${plug.description}`;
        }
      });

      const vipKeyboard = createVIPKeyboard(vipPlugs);
      await ctx.reply(vipMessage, vipKeyboard);
    }

  } catch (error) {
    console.error('Erreur dans handleStart:', error);
    await ctx.reply('❌ Une erreur est survenue, veuillez réessayer.');
  }
};

// Gestionnaire pour retour au menu principal
const handleBackMain = async (ctx) => {
  try {
    const config = await Config.findById('main');
    if (!config) {
      return ctx.answerCbQuery('❌ Configuration non trouvée');
    }

    // Récupérer les plugs VIP si activés pour l'affichage
    let vipPlugs = [];
    if (config.vip.enabled) {
      vipPlugs = await Plug.find({ 
        isVip: true, 
        isActive: true 
      }).sort({ vipOrder: 1, createdAt: -1 }).limit(5);
    }

    // Construire le même message d'accueil que dans handleStart
    let welcomeMessage = config.welcome.text;

    // Ajouter la section VIP si elle est en position 'top' et qu'il y a des plugs VIP
    if (config.vip.enabled && config.vip.position === 'top' && vipPlugs.length > 0) {
      welcomeMessage += `\n\n✨ ${config.vip.title} ✨\n${config.vip.description}\n`;
      
      vipPlugs.forEach((plug, index) => {
        welcomeMessage += `\n⭐ ${plug.name}`;
        if (plug.description && plug.description.length < 50) {
          welcomeMessage += ` - ${plug.description}`;
        }
      });
      
      welcomeMessage += '\n';
    }
    
    const keyboard = createMainKeyboard(config);
    
    // Utiliser editMessageText pour une navigation fluide
    await ctx.editMessageText(welcomeMessage, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'HTML'
    });
    
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Erreur dans handleBackMain:', error);
    // Fallback : répondre avec le message de démarrage
    await ctx.answerCbQuery('❌ Erreur lors du retour au menu');
  }
};

module.exports = {
  handleStart,
  handleBackMain
};