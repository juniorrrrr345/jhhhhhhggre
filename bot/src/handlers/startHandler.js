const Config = require('../models/Config');
const Plug = require('../models/Plug');
const { createMainKeyboard, createVIPKeyboard } = require('../utils/keyboards');

const handleStart = async (ctx) => {
  try {
    console.log('🚀 Commande /start reçue de:', ctx.from.id);
    
    // Récupérer la configuration avec fallback
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