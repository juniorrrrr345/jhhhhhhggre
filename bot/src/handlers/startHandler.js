const Config = require('../models/Config');
const Plug = require('../models/Plug');
const User = require('../models/User');
const { createMainKeyboard, createVIPKeyboard, createPlugsFilterKeyboard } = require('../utils/keyboards');
const { sendMessageWithImage, editMessageWithImage } = require('../utils/messageHelper');
const { ensureConnection } = require('../utils/database');
const { handleReferral } = require('./referralHandler');
const { getTranslation } = require('../utils/translations');
const locationService = require('../services/locationService');

// Note: getFreshConfig sera passé comme paramètre ou accessible globalement
let getFreshConfig = null;

// Fonction pour définir la référence à getFreshConfig
const setGetFreshConfig = (fn) => {
  getFreshConfig = fn;
};

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

    // Enregistrer ou mettre à jour l'utilisateur avec géolocalisation
    const userId = ctx.from.id;
    const username = ctx.from.username || 'Utilisateur sans nom';
    const firstName = ctx.from.first_name || '';
    const lastName = ctx.from.last_name || '';

    try {
      const user = await User.findOneAndUpdate(
        { telegramId: userId },
        {
          telegramId: userId,
          username: username,
          firstName: firstName,
          lastName: lastName,
          lastActivity: new Date(),
          isActive: true
        },
        { upsert: true, new: true }
      );
      
      console.log('✅ Utilisateur enregistré/mis à jour:', userId, username);
      
      // Détecter la géolocalisation en arrière-plan (non bloquant)
      locationService.detectAndSaveUserLocation(user).catch(error => {
        console.error('⚠️ Erreur géolocalisation non-critique:', error.message);
      });
      
    } catch (userError) {
      console.error('❌ Erreur lors de l\'enregistrement utilisateur:', userError);
      // Continuer même si l'enregistrement utilisateur échoue
    }

    // Obtenir la config
    const config = getFreshConfig ? await getFreshConfig() : await Config.findById('main');
    
    // NOUVEAU : Proposer directement les langues au /start
    await showLanguageSelection(ctx, config);
    
  } catch (error) {
    console.error('❌ Erreur dans handleStart:', error);
    await ctx.reply('❌ Erreur lors du chargement du menu').catch(() => {});
  }
};

// Nouvelle fonction pour afficher directement la sélection de langue
const showLanguageSelection = async (ctx, config) => {
  try {
    const { createLanguageKeyboard } = require('../utils/translations');
    
    // Message de bienvenue en multilingue
    const welcomeText = `🌍 *Welcome! Bienvenue! Bienvenido! Benvenuto! Willkommen!*\n\n` +
                       `Please select your language / Sélectionnez votre langue / Elige tu idioma / Seleziona la tua lingua / Wählen Sie Ihre Sprache:`;
    
    // Créer le clavier de sélection de langue
    const languageKeyboard = createLanguageKeyboard('fr', null); // Pas de langue sélectionnée au départ
    
    // Envoyer avec l'image d'accueil
    try {
      if (ctx.callbackQuery) {
        await editMessageWithImage(ctx, welcomeText, languageKeyboard, config, { 
          parse_mode: 'Markdown' 
        });
      } else {
        await sendMessageWithImage(ctx, welcomeText, languageKeyboard, config, { 
          parse_mode: 'Markdown' 
        });
      }
    } catch (error) {
      console.error('❌ Erreur affichage sélection langue:', error);
      // Fallback sans image
      await ctx.reply(welcomeText, {
        reply_markup: languageKeyboard.reply_markup,
        parse_mode: 'Markdown'
      });
    }
    
    console.log('🌍 Sélection de langue affichée au /start');
  } catch (error) {
    console.error('❌ Erreur dans showLanguageSelection:', error);
    // Fallback vers l'ancien comportement
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    // Utiliser le texte d'accueil personnalisé du panel admin ou traduction par défaut
    const welcomeMessage = config?.welcome?.text || getTranslation('messages_welcome', currentLang, customTranslations);
    const keyboard = await createMainKeyboard(config);
    
    await sendMessageWithImage(ctx, welcomeMessage, keyboard, config, { 
      parse_mode: 'Markdown' 
    });
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

    // Récupérer la langue actuelle et les traductions
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    console.log(`🌍 Langue actuelle pour le retour: ${currentLang}`);

    // Utiliser le texte d'accueil personnalisé du panel admin ou traduction par défaut
    const welcomeMessage = config?.welcome?.text || getTranslation('messages_welcome', currentLang, customTranslations);
    
    const keyboard = createMainKeyboard(config);
    
    console.log('📝 Message d\'accueil préparé pour le retour avec traduction');
    
    // Utiliser la fonction helper pour gérer l'image de façon cohérente
    await editMessageWithImage(ctx, welcomeMessage, keyboard, config, { parse_mode: 'Markdown' });
    
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
  handleBackMain,
  setGetFreshConfig
};