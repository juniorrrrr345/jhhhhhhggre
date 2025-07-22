const Config = require('../models/Config');
const Plug = require('../models/Plug');
const User = require('../models/User');
const { createMainKeyboard, createVIPKeyboard } = require('../utils/keyboards');
const { sendMessageWithImage, editMessageWithImage } = require('../utils/messageHelper');
const { ensureConnection } = require('../utils/database');
const { handleReferral } = require('./referralHandler');

const handleStart = async (ctx) => {
  try {
    console.log('🚀 Commande /start reçue de:', ctx.from.id);
    
    // Vérifier et s'assurer que MongoDB est connecté
    await ensureConnection();

    // Vérifier s'il y a un code de parrainage ou redirection directe
    const startPayload = ctx.message.text.split(' ')[1];
    if (startPayload) {
      // Format parrainage: ref_ID_BOUTIQUE_TIMESTAMP
      if (startPayload.startsWith('ref_')) {
        console.log('🔗 Code de parrainage détecté:', startPayload);
        console.log('👤 Utilisateur:', ctx.from.id, ctx.from.username || 'sans username');
        const referralHandled = await handleReferral(ctx, startPayload);
        console.log('🔄 handleReferral returned:', referralHandled);
        if (referralHandled) {
          console.log('✅ Parrainage traité avec succès - STOP ici');
          return; // Le message de bienvenue personnalisé a été envoyé
        } else {
          console.log('⚠️ Parrainage pas traité - continue vers message accueil');
        }
      }
      // Format direct: plug_ID_BOUTIQUE ou ID_BOUTIQUE
      else if (startPayload.startsWith('plug_') || startPayload.match(/^[a-f\d]{24}$/)) {
        console.log('🎯 Redirection directe vers boutique détectée:', startPayload);
        const plugId = startPayload.startsWith('plug_') ? startPayload.replace('plug_', '') : startPayload;
        
        try {
          const { handlePlugDetails } = require('./plugsHandler');
          await handlePlugDetails(ctx, plugId, 'direct_link');
          console.log('✅ Redirection directe réussie vers boutique:', plugId);
          return;
        } catch (directError) {
          console.error('❌ Erreur redirection directe:', directError);
          // Continuer vers le message d'accueil normal si échec
        }
      }
    }

    // Enregistrer ou mettre à jour l'utilisateur
    const userId = ctx.from.id;
    const username = ctx.from.username;
    const firstName = ctx.from.first_name;
    const lastName = ctx.from.last_name;

    try {
      let user = await User.findOne({ telegramId: userId });
      if (!user) {
        user = new User({
          telegramId: userId,
          username: username,
          firstName: firstName,
          lastName: lastName
        });
        console.log('👤 Nouvel utilisateur créé:', username);
      } else {
        // Mettre à jour les infos si elles ont changé
        user.username = username;
        user.firstName = firstName;
        user.lastName = lastName;
        user.lastActivity = new Date();
      }
      await user.save();
    } catch (userError) {
      console.error('⚠️ Erreur gestion utilisateur:', userError);
      // Continuer même si la sauvegarde utilisateur échoue
    }
    
    // Récupérer la configuration avec fallback (toujours fresh)
    let config;
    try {
      config = await Config.findById('main');
      console.log('📋 Config trouvée:', !!config);
      
      // Vérifier que la config a bien les bonnes propriétés
      if (config && !config.welcome) {
        config.welcome = { text: '🌟 Bienvenue sur notre bot !' };
      }
      if (config && !config.buttons) {
        config.buttons = {};
      }
    } catch (error) {
      console.error('❌ Erreur récupération config:', error);
      config = null;
    }
    
    if (!config) {
      console.log('⚠️ Pas de config, utilisation des valeurs par défaut');
      return ctx.reply('🌟 Bienvenue sur notre bot !\n\nConfiguration en cours...\n\nVeuillez réessayer dans quelques instants.');
    }

    // Vérifications de sécurité
    const welcomeText = config.welcome?.text || '🌟 Bienvenue sur notre bot !';
    const welcomeImage = config.welcome?.image || null;
    
    console.log('📝 Message d\'accueil préparé:', welcomeText.substring(0, 50) + '...');

    // Construire le message d'accueil (les réseaux sociaux sont maintenant en boutons)
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
    
    // Confirmer immédiatement la callback pour éviter le loading
    await ctx.answerCbQuery();
    
    // Toujours récupérer la config fraîche
    const config = await Config.findById('main');
    if (!config) {
      console.log('❌ Configuration non trouvée');
      return;
    }

    console.log('📋 Configuration récupérée pour le retour');

    // Utiliser le même message d'accueil que dans handleStart (les réseaux sociaux sont en boutons)
    let welcomeMessage = config.welcome?.text || '🌟 Bienvenue sur notre bot !';
    
    const keyboard = createMainKeyboard(config);
    
    console.log('📝 Message d\'accueil préparé pour le retour');
    
    // Utiliser la fonction helper pour gérer l'image de façon cohérente
    await editMessageWithImage(ctx, welcomeMessage, keyboard, config, { parse_mode: 'HTML' });
    
    console.log('✅ Retour au menu principal terminé');
  } catch (error) {
    console.error('❌ Erreur dans handleBackMain:', error);
    // Fallback : répondre avec le message de démarrage
    try {
      await ctx.answerCbQuery('❌ Erreur lors du retour au menu').catch(() => {});
    } catch (cbError) {
      console.error('❌ Erreur lors de answerCbQuery:', cbError);
    }
  }
};

module.exports = {
  handleStart,
  handleBackMain
};