const PlugApplication = require('../models/PlugApplication');
const { Markup } = require('telegraf');
const { sendAdminNotification } = require('./notificationHandler');
const { getTranslation } = require('../utils/translations');

// Stockage temporaire des données du formulaire par utilisateur
const userForms = new Map();

// Stockage des derniers messages du bot (pour les supprimer avant nouvelle question)
const lastBotMessages = new Map();

// Liste des pays disponibles avec emojis
const COUNTRIES = [
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
  { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱' },
  { code: 'MA', name: 'Maroc', flag: '🇲🇦' },
  { code: 'OTHER', name: 'Autre', flag: '🌍' }
];

// Fonction utilitaire pour éditer les messages avec gestion robuste des erreurs et désactivation des aperçus de liens
const safeEditMessage = async (ctx, message, options = {}, keepWelcomeImage = false) => {
  const userId = ctx.from.id;
  
  // Ajouter disable_web_page_preview par défaut pour éviter les aperçus de liens
  const enhancedOptions = {
    ...options,
    disable_web_page_preview: true
  };
  
  try {
    // Si on veut garder l'image d'accueil, on essaie plusieurs méthodes
    if (keepWelcomeImage) {
      const Config = require('../models/Config');
      const config = await Config.findById('main');
      const welcomeImage = config?.welcome?.image;
      
      if (welcomeImage) {
        try {
          // Essayer d'éditer le media avec caption
          await ctx.editMessageMedia({
            type: 'photo',
            media: welcomeImage,
            caption: message,
            parse_mode: enhancedOptions.parse_mode || 'Markdown'
          }, {
            reply_markup: enhancedOptions.reply_markup
          });
          return;
        } catch (mediaError) {
          console.log('⚠️ editMessageMedia échoué:', mediaError.message);
          
          // Fallback 1: Essayer d'éditer la caption seulement
          try {
            await ctx.editMessageCaption(message, {
              parse_mode: enhancedOptions.parse_mode || 'Markdown',
              reply_markup: enhancedOptions.reply_markup
            });
            return;
          } catch (captionError) {
            console.log('⚠️ editMessageCaption échoué:', captionError.message);
          }
        }
      }
    }
    
    // Essayer l'édition de texte normale
    try {
      await ctx.editMessageText(message, enhancedOptions);
    } catch (textError) {
      console.log('⚠️ editMessageText échoué:', textError.message);
      
      // Fallback final: Supprimer et envoyer nouveau message
      try {
        await ctx.deleteMessage();
      } catch (deleteError) {
        console.log('⚠️ Impossible de supprimer le message:', deleteError.message);
      }
      
      // Envoyer un nouveau message
      if (keepWelcomeImage) {
        const Config = require('../models/Config');
        const config = await Config.findById('main');
        const welcomeImage = config?.welcome?.image;
        
        if (welcomeImage) {
          const sentMessage = await ctx.replyWithPhoto(welcomeImage, {
            caption: message,
            parse_mode: enhancedOptions.parse_mode || 'Markdown',
            reply_markup: enhancedOptions.reply_markup
          });
          lastBotMessages.set(userId, sentMessage.message_id);
        } else {
          const sentMessage = await ctx.reply(message, enhancedOptions);
          lastBotMessages.set(userId, sentMessage.message_id);
        }
      } else {
        const sentMessage = await ctx.reply(message, enhancedOptions);
        lastBotMessages.set(userId, sentMessage.message_id);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur safeEditMessage:', error.message);
    // Dernier fallback: envoyer le message original sans formatage
    try {
      const sentMessage = await ctx.reply(message, {
        reply_markup: enhancedOptions.reply_markup,
        disable_web_page_preview: true
      });
      lastBotMessages.set(userId, sentMessage.message_id);
    } catch (finalError) {
      console.error('❌ Même le fallback final a échoué:', finalError.message);
    }
  }
};

// Gestionnaire pour démarrer le formulaire d'inscription
const handleStartApplication = async (ctx) => {
  try {
    await ctx.answerCbQuery();
    
    const userId = ctx.from.id;
    
    // Récupérer la langue actuelle de l'utilisateur
    const Config = require('../models/Config');
    const { getTranslation } = require('../utils/translations');
    
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    console.log(`🌍 Formulaire d'inscription en langue: ${currentLang}`);
    
    // Vérifier si l'utilisateur a déjà une demande en cours
    const existingApplication = await PlugApplication.findOne({ 
      userId: userId, 
      status: 'pending' 
    });
    
    if (existingApplication) {
      const submittedDate = existingApplication.submittedAt.toLocaleDateString(
        currentLang === 'en' ? 'en-US' : 'fr-FR'
      );
      
      const message = `${getTranslation('registration.pendingTitle', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.pendingMessage', currentLang, customTranslations)}\n` +
        `${currentLang === 'fr' ? 'Elle a été soumise le' : 'It was submitted on'} ${submittedDate}\n\n` +
        `${getTranslation('registration.pendingStatus', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.pendingWait', currentLang, customTranslations)}`;
      
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback(getTranslation('registration.backToMenu', currentLang, customTranslations), 'back_main')]
      ]);
      
      return await safeEditMessage(ctx, message, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown'
      }, true); // keepWelcomeImage = true
    }
    
    // Initialiser le formulaire
    userForms.set(userId, {
      step: 'name',
      data: {
        userId: userId,
        username: ctx.from.username || '',
        firstName: ctx.from.first_name || '',
        lastName: ctx.from.last_name || ''
      }
    });
    
    const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
      `⸻\n\n` +
      `${getTranslation('registration.step1', currentLang, customTranslations)}\n\n` +
      `${getTranslation('registration.letsStart', currentLang, customTranslations)}\n\n` +
      `${getTranslation('registration.plugNameQuestion', currentLang, customTranslations)}`;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
    ]);
    
    await safeEditMessage(ctx, message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    }, true); // keepWelcomeImage = true
    
  } catch (error) {
    console.error('Erreur dans handleStartApplication:', error);
    await ctx.answerCbQuery('❌ Erreur lors du démarrage').catch(() => {});
  }
};

// Fonction utilitaire pour supprimer l'ancien message du bot
const deleteLastBotMessage = async (ctx, userId) => {
  const lastBotMessageId = lastBotMessages.get(userId);
  if (lastBotMessageId) {
    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, lastBotMessageId);
      lastBotMessages.delete(userId); // Nettoyer la référence
    } catch (error) {
      // Ignorer l'erreur si le message ne peut pas être supprimé
      console.log('⚠️ Impossible de supprimer l\'ancien message bot:', error.message);
    }
  }
};

// Gestionnaire pour les messages texte du formulaire
const handleFormMessage = async (ctx) => {
  const userId = ctx.from.id;
  const userForm = userForms.get(userId);
  
  if (!userForm) {
    return; // Pas de formulaire en cours
  }
  
  const text = ctx.message.text.trim();
  
  // Supprimer le message de l'utilisateur pour garder le chat propre
  try {
    await ctx.deleteMessage();
  } catch (error) {
    // Ignorer l'erreur si on ne peut pas supprimer
  }
  
  // Supprimer l'ancien message du bot avant d'afficher la prochaine question
  await deleteLastBotMessage(ctx, userId);
  
  // Récupérer la langue pour les erreurs (en dehors du switch)
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;

  try {
    console.log(`🔄 FORM DEBUG: User ${userId} at step '${userForm.step}' with text: '${text}'`);
    
    switch (userForm.step) {
              case 'name':
          
          if (text.length < 2) {
            return await ctx.reply(getTranslation('registration.error.nameLength', currentLang, customTranslations));
          }
          
          userForm.data.name = text;
          userForm.step = 'telegram';
          userForms.set(userId, userForm);
          
          await askTelegramReply(ctx);
          break;
        
              case 'telegram':
          if (!text.startsWith('@') && !text.includes('t.me/')) {
            return await ctx.reply(getTranslation('registration.error.telegramFormat', currentLang, customTranslations));
          }

          userForm.data.telegram = text;
          userForm.step = 'snapchat';
          userForms.set(userId, userForm);
          
          await askSnapchat(ctx);
          break;
        
      case 'snapchat':
        if (!text.startsWith('https://www.snapchat.com/') && !text.startsWith('https://')) {
          return await ctx.reply(getTranslation('registration.error.snapchatFormat', currentLang, customTranslations));
        }

        userForm.data.snapchat = text;
        userForm.step = 'potato';
        userForms.set(userId, userForm);
        
        await askPotato(ctx);
        break;
        
              case 'potato':
          if (!text.startsWith('https://potato.chat/') && !text.startsWith('https://')) {
            return await ctx.reply(getTranslation('registration.error.potatoFormat', currentLang, customTranslations));
          }

          userForm.data.potato = text;
          userForm.step = 'signal';
          userForms.set(userId, userForm);
          
          await askSignal(ctx);
          break;

      case 'signal':
        console.log(`🔍 SIGNAL DEBUG: Input '${text}', validation: https check=${text.startsWith('https://')}, length=${text.length}`);
        
        // Validation plus souple : accepter tout ce qui fait au moins 2 caractères
        if (text.length < 2) {
          console.log(`❌ SIGNAL VALIDATION FAILED: too short`);
          return await ctx.reply(getTranslation('registration.error.signalFormat', currentLang, customTranslations));
        }

        console.log(`✅ SIGNAL OK, saving and moving to WhatsApp`);
        userForm.data.signal = text;
        userForm.step = 'whatsapp';
        userForms.set(userId, userForm);
        
        console.log(`🔄 CALLING askWhatsApp...`);
        await askWhatsApp(ctx);
        console.log(`✅ askWhatsApp completed`);
        break;
        
      case 'whatsapp':
        if (!text.startsWith('https://wa.me/') && !text.startsWith('https://')) {
          return await ctx.reply(getTranslation('registration.error.whatsappFormat', currentLang, customTranslations));
        }

        userForm.data.whatsapp = text;
        userForm.step = 'threema';
        userForms.set(userId, userForm);
        
        await askThreema(ctx);
        break;
        
      case 'threema':
        if (!text.startsWith('https://')) {
          return await ctx.reply(getTranslation('registration.error.urlFormat', currentLang, customTranslations));
        }

        userForm.data.threema = text;
        userForm.step = 'session';
        userForms.set(userId, userForm);
        
        await askSession(ctx);
        break;
        
      case 'session':
        if (text.length < 2) {
          return await ctx.reply(getTranslation('registration.error.sessionFormat', currentLang, customTranslations));
        }

        userForm.data.session = text;
        userForm.step = 'telegram_bot';
        userForms.set(userId, userForm);
        
        await askTelegramBot(ctx);
        break;

      case 'telegram_bot':
        if (!text.startsWith('@') && !text.includes('t.me/')) {
          return await ctx.reply(getTranslation('registration.error.telegramBotFormat', currentLang, customTranslations));
        }

        userForm.data.telegramBot = text;
        userForm.step = 'photo';
        userForms.set(userId, userForm);
        
        await askPhoto(ctx);
        break;
        
      case 'city':
        if (text.length < 2) {
          return await ctx.reply(getTranslation('registration.error.cityLength', currentLang, customTranslations));
        }
        
        userForm.data.city = text;
        userForm.step = 'services';
        
        await askServices(ctx);
        break;
        
      case 'departments_meetup':
        if (text.length < 2) {
          return await ctx.reply(getTranslation('registration.error.departmentsLength', currentLang, customTranslations));
        }
        
        userForm.data.departmentsMeetup = text;
        
        // Si livraison est aussi sélectionné, demander les départements livraison
        if (userForm.data.services.delivery.enabled) {
          userForm.step = 'departments_delivery';
          userForms.set(userId, userForm);
          
          await replyWithStep(ctx, 'departments_delivery');
        } else {
          // Sinon passer directement à la photo
          userForm.step = 'photo';
          userForms.set(userId, userForm);
          await askPhoto(ctx);
        }
        break;
        
      case 'departments_delivery':
        if (text.length < 2) {
          return await ctx.reply('❌ Les départements doivent faire au moins 2 caractères. Réessaie :');
        }
        
        userForm.data.departmentsDelivery = text;
        userForm.step = 'photo';
        
        await askPhoto(ctx);
        break;
    }
    
    userForms.set(userId, userForm);
    
  } catch (error) {
    console.error('Erreur dans handleFormMessage:', error);
    // Récupérer la langue pour les erreurs
    try {
      const Config = require('../models/Config');
      const config = await Config.findById('main');
      const currentLang = config?.languages?.currentLanguage || 'fr';
      const customTranslations = config?.languages?.translations;
      await ctx.reply(getTranslation('registration.error.general', currentLang, customTranslations));
    } catch (langError) {
      // Fallback en français si erreur de récupération de langue
      await ctx.reply('❌ Une erreur est survenue. Réessaie ou tape /start pour recommencer.');
    }
  }
};

// Demander Telegram
const askTelegram = async (ctx) => {
  const userId = ctx.from.id;
  
  const message = `🛠️ **FORMULAIRE D'INSCRIPTION – FindYourPlug**\n\n` +
    `⸻\n\n` +
    `🟦 **Étape 2 : Lien Telegram**\n\n` +
    `🔗 Entrez votre lien Telegram (format : @username ou https://t.me/username)`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('❌ Annuler', 'cancel_application')]
  ]);
  
  const sentMessage = await ctx.reply(message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });
  
  // Sauvegarder l'ID du message pour suppression ultérieure
  lastBotMessages.set(userId, sentMessage.message_id);
};

// Fonction pour générer le récapitulatif des réponses
const generateSummary = (ctx, userForm) => {
  try {
    const user = ctx.from;
    const data = userForm?.data || {};
    
    let summary = `👤 **${user.first_name || 'Utilisateur'}${user.last_name ? ` ${user.last_name}` : ''}**${user.username ? ` (@${user.username})` : ''}\n\n`;
    summary += `📋 **Progression :**\n`;
  
  if (data.name) summary += `✅ Nom de Plug : ${data.name}\n`;
  if (data.telegram) summary += `✅ Telegram : ${data.telegram}\n`;
  if (data.telegramChannel) summary += `✅ Canal Telegram : ${data.telegramChannel}\n`;
  if (data.instagram) summary += `✅ Instagram : ${data.instagram}\n`;
  if (data.potato) summary += `✅ Potato : ${data.potato}\n`;
  if (data.snapchat) summary += `✅ Snapchat : ${data.snapchat}\n`;
  if (data.whatsapp) summary += `✅ WhatsApp : ${data.whatsapp}\n`;
  if (data.signal) summary += `✅ Signal : ${data.signal}\n`;
  if (data.session) summary += `✅ Session : ${data.session}\n`;
  if (data.threema) summary += `✅ Threema : ${data.threema}\n`;
    if (data.country) summary += `✅ Pays : ${data.country}\n`;
    
    return summary;
  } catch (error) {
    console.error('Erreur dans generateSummary:', error);
    return `👤 **Utilisateur**\n\n📋 **Progression :**\n`;
  }
};

// Fonction centralisée pour afficher les étapes avec ctx.reply (évite les conflits d'édition)
const replyWithStep = async (ctx, step) => {
  const userId = ctx.from.id;
  const userForm = userForms.get(userId);
  
  // Récupérer la langue actuelle
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;
  
  // Supprimer l'ancien message du bot s'il existe
  const lastBotMessageId = lastBotMessages.get(userId);
  if (lastBotMessageId) {
    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, lastBotMessageId);
    } catch (error) {
      // Ignorer l'erreur si le message ne peut pas être supprimé
    }
  }
  
  // Générer le récapitulatif
  const summary = generateSummary(ctx, userForm);
  
  let message = '';
  let keyboard = null;
  
  switch (step) {
    case 'telegram':
      message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
        `${summary}` +
        `⸻\n\n` +
        `${getTranslation('registration.step2', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.telegramQuestion', currentLang, customTranslations)}`;
      keyboard = Markup.inlineKeyboard([
        [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
      ]);
      break;
      
    case 'telegram_channel':
      message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
        `${summary}` +
        `⸻\n\n` +
        `${getTranslation('registration.step3', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.telegramChannelQuestion', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
      keyboard = Markup.inlineKeyboard([
        [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_telegram_channel')],
        [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
      ]);
      break;
      
    case 'instagram':
      message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
        `${summary}` +
        `⸻\n\n` +
        `${getTranslation('registration.step4', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.instagramQuestion', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
      keyboard = Markup.inlineKeyboard([
        [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_instagram')],
        [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
      ]);
      break;
      
    case 'potato':
      message = `🛠️ **FORMULAIRE D'INSCRIPTION – FindYourPlug**\n\n` +
        `${summary}` +
        `⸻\n\n` +
        `🟦 **Étapes Réseaux supplémentaires :**\n\n` +
        `Entrez votre lien **Potato** (commençant par https://)\n\n` +
        `Plateformes :\n` +
        `\t•\tPotato\n` +
        `\t•\tSnapchat\n` +
        `\t•\tWhatsApp\n` +
        `\t•\tSignal\n` +
        `\t•\tSession (identifiant libre)\n` +
        `\t•\tThreema`;
      keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('⏭️ Passer cette étape', 'skip_potato')],
        [Markup.button.callback('❌ Annuler', 'cancel_application')]
      ]);
      break;
      
    case 'snapchat':
      message = `🛠️ **FORMULAIRE D'INSCRIPTION – FindYourPlug**\n\n` +
        `${summary}` +
        `⸻\n\n` +
        `🟦 **Étapes Réseaux supplémentaires :**\n\n` +
        `Entrez votre lien **Snapchat** (commençant par https://)\n\n` +
        `Plateformes restantes : Snapchat, WhatsApp, Signal, Session, Threema`;
      keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('⏭️ Passer cette étape', 'skip_snapchat')],
        [Markup.button.callback('❌ Annuler', 'cancel_application')]
      ]);
      break;
      
    case 'whatsapp':
      message = `🛠️ **FORMULAIRE D'INSCRIPTION – FindYourPlug**\n\n` +
        `${summary}` +
        `⸻\n\n` +
        `🟦 **Étapes Réseaux supplémentaires :**\n\n` +
        `Entrez votre lien **WhatsApp** (commençant par https://)\n\n` +
        `Plateformes restantes : WhatsApp, Signal, Session, Threema`;
      keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('⏭️ Passer cette étape', 'skip_whatsapp')],
        [Markup.button.callback('❌ Annuler', 'cancel_application')]
      ]);
      break;
      
    case 'signal':
      message = `🛠️ **FORMULAIRE D'INSCRIPTION – FindYourPlug**\n\n` +
        `${summary}` +
        `⸻\n\n` +
        `🟦 **Étapes Réseaux supplémentaires :**\n\n` +
        `Entrez votre lien **Signal** (commençant par https://)\n\n` +
        `Plateformes restantes : Signal, Session, Threema`;
      keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('⏭️ Passer cette étape', 'skip_signal')],
        [Markup.button.callback('❌ Annuler', 'cancel_application')]
      ]);
      break;
      
    case 'session':
      message = `🛠️ **FORMULAIRE D'INSCRIPTION – FindYourPlug**\n\n` +
        `${summary}` +
        `⸻\n\n` +
        `🟦 **Étapes Réseaux supplémentaires :**\n\n` +
        `Entrez votre **Session** (identifiant libre)\n\n` +
        `Plateformes restantes : Session, Threema`;
      keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('⏭️ Passer cette étape', 'skip_session')],
        [Markup.button.callback('❌ Annuler', 'cancel_application')]
      ]);
      break;
      
    case 'threema':
      message = `🛠️ **FORMULAIRE D'INSCRIPTION – FindYourPlug**\n\n` +
        `${summary}` +
        `⸻\n\n` +
        `🟦 **Étapes Réseaux supplémentaires :**\n\n` +
        `Entrez votre lien **Threema** (commençant par https://)\n\n` +
        `Dernière plateforme !`;
      keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('⏭️ Passer cette étape', 'skip_threema')],
        [Markup.button.callback('❌ Annuler', 'cancel_application')]
      ]);
      break;
      
    case 'departments_meetup':
      message = `🛠️ **FORMULAIRE D'INSCRIPTION – FindYourPlug**\n\n` +
        `${summary}` +
        `⸻\n\n` +
        `🟦 **Étape 13 : Départements pour Meetup**\n\n` +
        `📍 Indique les départements pour le **Meetup** (ex: 75, 92, 93) :`;
      keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('❌ Annuler', 'cancel_application')]
      ]);
      break;
      
    case 'departments_delivery':
      message = `🛠️ **FORMULAIRE D'INSCRIPTION – FindYourPlug**\n\n` +
        `${summary}` +
        `⸻\n\n` +
        `🟦 **Étape 14 : Départements pour Livraison**\n\n` +
        `🚚 Indique les départements pour la **Livraison** (ex: 75, 94...) :`;
      keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('❌ Annuler', 'cancel_application')]
      ]);
      break;
  }
  
  if (message) {
    const sentMessage = await ctx.reply(message, {
      reply_markup: keyboard ? keyboard.reply_markup : undefined,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
    
    // Sauvegarder l'ID du message pour le supprimer à la prochaine étape
    lastBotMessages.set(userId, sentMessage.message_id);
  } else {
    console.error('Aucun message généré pour l\'étape:', step);
    throw new Error(`Étape non supportée: ${step}`);
  }
};

// Version reply pour éviter les conflits d'édition (supprime l'ancien message)
const askTelegramReply = async (ctx) => {
  await replyWithStep(ctx, 'telegram');
};

// Demander Canal Telegram
const askTelegramChannel = async (ctx) => {
  const message = `🛠️ **FORMULAIRE D'INSCRIPTION – FindYourPlug**\n\n` +
    `⸻\n\n` +
    `🟦 **Étape 3 : Lien Canal Telegram**\n\n` +
    `🔗 Entrez le lien de votre **canal Telegram** (format : https://t.me/username)\n\n` +
    `⚠️ Tu peux aussi passer cette étape.`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('⏭️ Passer cette étape', 'skip_telegram_channel')],
    [Markup.button.callback('❌ Annuler', 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
};

// Demander Instagram
const askInstagram = async (ctx) => {
  const message = `🛠️ **FORMULAIRE D'INSCRIPTION – FindYourPlug**\n\n` +
    `⸻\n\n` +
    `🟦 **Étape 4 : Lien Instagram**\n\n` +
    `📸 Entrez votre lien Instagram (https://www.instagram.com/username)\n\n` +
    `⚠️ Tu peux aussi passer cette étape.`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('⏭️ Passer cette étape', 'skip_instagram')],
    [Markup.button.callback('❌ Annuler', 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
};

// Demander Potato
const askPotato = async (ctx) => {
  const userId = ctx.from.id;
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;

  const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
    `⸻\n\n` +
    `${getTranslation('registration.step4', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.potatoQuestion', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_potato')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  const sentMessage = await ctx.reply(message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });
  
  lastBotMessages.set(userId, sentMessage.message_id);
};

// Demander Snapchat
const askSnapchat = async (ctx) => {
  const userId = ctx.from.id;
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;

  const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
    `⸻\n\n` +
    `${getTranslation('registration.step3', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.snapchatQuestion', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_snapchat')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  const sentMessage = await ctx.reply(message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });
  
  lastBotMessages.set(userId, sentMessage.message_id);
};

// Demander WhatsApp
const askWhatsApp = async (ctx) => {
  try {
    const userId = ctx.from.id;
    console.log(`🔄 askWhatsApp: STARTING for user ${userId}`);
    
    const Config = require('../models/Config');
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;

    const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
      `⸻\n\n` +
      `${getTranslation('registration.step6', currentLang, customTranslations)}\n\n` +
      `${getTranslation('registration.whatsappQuestion', currentLang, customTranslations)}\n\n` +
      `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
    
    console.log(`📝 askWhatsApp: Message prepared, length=${message.length}`);
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_whatsapp')],
      [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
    ]);
    
    console.log(`⌨️ askWhatsApp: Keyboard created`);
    
    const sentMessage = await ctx.reply(message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
    
    lastBotMessages.set(userId, sentMessage.message_id);
    console.log(`✅ askWhatsApp: Message sent successfully`);
  } catch (error) {
    console.error(`❌ askWhatsApp ERROR:`, error);
    throw error;
  }
};

// Demander Signal
const askSignal = async (ctx) => {
  const userId = ctx.from.id;
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;

  const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
    `⸻\n\n` +
    `${getTranslation('registration.step5', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.signalQuestion', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_signal')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  const sentMessage = await ctx.reply(message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });
  
  lastBotMessages.set(userId, sentMessage.message_id);
};

// Demander Session
const askSession = async (ctx) => {
  const userId = ctx.from.id;
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;

  const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
    `⸻\n\n` +
    `${getTranslation('registration.step8', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.sessionQuestion', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_session')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  const sentMessage = await ctx.reply(message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });
  
  lastBotMessages.set(userId, sentMessage.message_id);
};

// Demander Threema
const askThreema = async (ctx) => {
  const userId = ctx.from.id;
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;

  const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
    `⸻\n\n` +
    `${getTranslation('registration.step7', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.threemaQuestion', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_threema')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  const sentMessage = await ctx.reply(message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });
  
  lastBotMessages.set(userId, sentMessage.message_id);
};

// Demander Bot Telegram
const askTelegramBot = async (ctx) => {
  const userId = ctx.from.id;
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;

  const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
    `⸻\n\n` +
    `${getTranslation('registration.step9', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.telegramBotQuestion', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.telegramBotExample', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_telegram_bot')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  const sentMessage = await ctx.reply(message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });
  
  lastBotMessages.set(userId, sentMessage.message_id);
};

// Demander le pays avec boutons
const askCountry = async (ctx) => {
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;

  const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
    `⸻\n\n` +
    `${getTranslation('registration.step12', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.countryQuestion', currentLang, customTranslations)}`;
  
  // Créer les boutons de pays (3 par ligne)
  const countryButtons = [];
  for (let i = 0; i < COUNTRIES.length; i += 3) {
    const row = COUNTRIES.slice(i, i + 3).map(country => 
      Markup.button.callback(`${country.flag} ${country.name}`, `country_${country.code}`)
    );
    countryButtons.push(row);
  }
  
  // Ajouter boutons d'action
  countryButtons.push([
    Markup.button.callback(`🌍 ${getTranslation('registration.allCountries', currentLang, customTranslations)}`, 'country_all')
  ]);
  
  const keyboard = Markup.inlineKeyboard(countryButtons);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
};

// Gestionnaire pour la sélection de pays
const handleCountrySelection = async (ctx) => {
  try {
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm || userForm.step !== 'country') {
      return await ctx.answerCbQuery('❌ Erreur de formulaire');
    }
    
    const countryCode = ctx.callbackQuery.data.replace('country_', '');
    const selectedCountry = COUNTRIES.find(c => c.code === countryCode);
    
    if (!selectedCountry && countryCode !== 'all') {
      const Config = require('../models/Config');
      const config = await Config.findById('main');
      const currentLang = config?.languages?.currentLanguage || 'fr';
      const customTranslations = config?.languages?.translations;
      return await ctx.answerCbQuery(getTranslation('registration.invalidCountry', currentLang, customTranslations));
    }
    
    userForm.data.country = selectedCountry ? selectedCountry.name : getTranslation('registration.allCountries', currentLang, customTranslations);
    userForm.data.countryCode = countryCode;
    userForm.step = 'services';
    userForms.set(userId, userForm);
    
    await askServices(ctx);
    const Config = require('../models/Config');
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    await ctx.answerCbQuery(`${getTranslation('registration.countrySelected', currentLang, customTranslations)} ${userForm.data.country}`);
    
  } catch (error) {
    console.error('Erreur dans handleCountrySelection:', error);
    await ctx.answerCbQuery('❌ Erreur');
  }
};

// Demander les services
const askServices = async (ctx) => {
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;

  const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
    `⸻\n\n` +
    `${getTranslation('registration.step13', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.servicesQuestion', currentLang, customTranslations)}\n` +
    `${getTranslation('registration.selectServices', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.servicesAvailable', currentLang, customTranslations)}`;
  
  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback(`📍 ${getTranslation('service_meetup', currentLang, customTranslations)}`, 'service_meetup'),
      Markup.button.callback(`🚚 ${getTranslation('service_delivery', currentLang, customTranslations)}`, 'service_delivery')
    ],
    [Markup.button.callback(`✈️ ${getTranslation('service_postal', currentLang, customTranslations)}`, 'service_postal')],
    [Markup.button.callback(`✅ ${getTranslation('registration.finishSelection', currentLang, customTranslations)}`, 'services_done')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
};

// Gestionnaires pour les services
const handleServiceToggle = async (ctx) => {
  try {
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm || userForm.step !== 'services') {
      return await ctx.answerCbQuery('❌ Erreur de formulaire');
    }
    
    const serviceType = ctx.callbackQuery.data.replace('service_', '');
    
    if (!userForm.data.services) {
      userForm.data.services = {
        delivery: { enabled: false },
        postal: { enabled: false },
        meetup: { enabled: false }
      };
    }
    
    // Toggle le service
    userForm.data.services[serviceType].enabled = !userForm.data.services[serviceType].enabled;
    
    userForms.set(userId, userForm);
    
    // Mettre à jour l'affichage
    const services = userForm.data.services;
    let servicesText = '';
    
    if (services.meetup.enabled) servicesText += '📍 Meetup ✅\n';
    if (services.delivery.enabled) servicesText += '🚚 Livraison ✅\n';
    if (services.postal.enabled) servicesText += '✈️ Envoi Postal ✅\n';
    
    const message = `📝 **Récapitulatif de votre inscription :**\n\n` +
      `📝 Nom de Plug: ${userForm.data.name}\n` +
      `🔗 Telegram: ${userForm.data.telegram}\n` +
      `🌍 Pays: ${userForm.data.country}\n` +
      `🛠️ Services: ${servicesText}\n\n` +
      `Quels services proposez-vous? (Sélectionnez tous ceux qui s'appliquent)`;
    
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback(
          services.meetup.enabled ? '📍 Meetup ✅' : '📍 Meetup',
          'service_meetup'
        ),
        Markup.button.callback(
          services.delivery.enabled ? '🚚 Livraison ✅' : '🚚 Livraison',
          'service_delivery'
        )
      ],
      [
        Markup.button.callback(
          services.postal.enabled ? '✈️ Envoi Postal ✅' : '✈️ Envoi Postal',
          'service_postal'
        )
      ],
      [Markup.button.callback('✅ Terminer la sélection', 'services_done')],
      [Markup.button.callback('❌ Annuler', 'cancel_application')]
    ]);
    
    await safeEditMessage(ctx, message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });
    
    await ctx.answerCbQuery();
    
  } catch (error) {
    console.error('Erreur dans handleServiceToggle:', error);
    await ctx.answerCbQuery('❌ Erreur');
  }
};

// Terminer les services et passer aux départements
const handleServicesDone = async (ctx) => {
  try {
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm) {
      return await ctx.answerCbQuery('❌ Erreur de formulaire');
    }
    
    const services = userForm.data.services;
    if (!services.delivery.enabled && !services.postal.enabled && !services.meetup.enabled) {
      return await ctx.answerCbQuery('❌ Tu dois sélectionner au moins un service');
    }
    
    // Si meetup est sélectionné, demander les départements meetup
    if (services.meetup.enabled) {
      userForm.step = 'departments_meetup';
      userForms.set(userId, userForm);
      
      await replyWithStep(ctx, 'departments_meetup');
    } else {
      // Sinon passer directement à la photo
      userForm.step = 'photo';
      userForms.set(userId, userForm);
      await askPhoto(ctx);
    }
    
    await ctx.answerCbQuery();
    
  } catch (error) {
    console.error('Erreur dans handleServicesDone:', error);
    await ctx.answerCbQuery('❌ Erreur');
  }
};

// Demander la photo
const askPhoto = async (ctx) => {
  const userId = ctx.from.id;
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;

  const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
    `⸻\n\n` +
    `${getTranslation('registration.step10', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.shopPhotoQuestion', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.shopPhotoInstruction', currentLang, customTranslations)}`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  const sentMessage = await ctx.reply(message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });
  
  lastBotMessages.set(userId, sentMessage.message_id);
};


// Demander la confirmation
const askConfirmation = async (ctx) => {
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;
  
  const userForm = userForms.get(ctx.from.id);
  const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
    `⸻\n\n` +
    `${getTranslation('registration.step11', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.finalSummary', currentLang, customTranslations)}\n\n` +
    `• **${getTranslation('registration.plugName', currentLang, customTranslations)}** : ${userForm.data.name}\n` +
    `• **Telegram** : ${userForm.data.telegram}\n` +
    `${userForm.data.snapchat ? `• **Snapchat** : ${userForm.data.snapchat}\n` : ''}` +
    `${userForm.data.potato ? `• **Potato** : ${userForm.data.potato}\n` : ''}` +
    `${userForm.data.signal ? `• **Signal** : ${userForm.data.signal}\n` : ''}` +
    `${userForm.data.whatsapp ? `• **WhatsApp** : ${userForm.data.whatsapp}\n` : ''}` +
    `${userForm.data.threema ? `• **Threema** : ${userForm.data.threema}\n` : ''}` +
    `${userForm.data.session ? `• **Session** : ${userForm.data.session}\n` : ''}` +
    `${userForm.data.telegramBot ? `• **Bot Telegram** : ${userForm.data.telegramBot}\n` : ''}` +
    `• ${getTranslation('registration.photoReceived', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.confirmInscription', currentLang, customTranslations)}`;
  
  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback(getTranslation('registration.confirm', currentLang, customTranslations), 'confirm_application'),
      Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')
    ]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
};

// Gestionnaire pour les photos
const handlePhoto = async (ctx) => {
  try {
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm || userForm.step !== 'photo') {
      return;
    }
    
    // Vérifier que c'est bien une photo
    if (!ctx.message.photo || ctx.message.photo.length === 0) {
      return await ctx.reply('❌ Merci d\'envoyer une photo valide.');
    }
    
    // Récupérer la photo de meilleure qualité
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    
    // Photo de boutique du CLIENT
    userForm.data.photo = {
      fileId: photo.file_id,
      fileSize: photo.file_size,
      width: photo.width,
      height: photo.height
    };
    
    userForm.step = 'confirmation';
    userForms.set(userId, userForm);
    
    // Confirmer réception et passer à la confirmation
    await ctx.reply('✅ Photo de boutique reçue !');
    await askConfirmation(ctx);
    
  } catch (error) {
    console.error('Erreur dans handlePhoto:', error);
    await ctx.reply('❌ Erreur lors du traitement de la photo. Réessaie.');
  }
};

// Gestionnaires pour passer les étapes
const handleSkipStep = async (ctx, step) => {
  try {
    console.log('🔄 handleSkipStep appelé avec step:', step);
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    console.log('👤 UserId:', userId);
    console.log('📝 UserForm exists:', !!userForm);
    
    if (!userForm) {
      console.log('❌ Pas de formulaire trouvé pour userId:', userId);
      return await ctx.answerCbQuery('❌ Erreur de formulaire');
    }
    
    console.log('📋 Current step avant skip:', userForm.step);
    
    // NOUVEL ORDRE : Nom → Telegram → Snapchat → Potato → Signal → WhatsApp → Threema → Session → Bot Telegram → Photo → Confirmation
    switch (step) {
      case 'telegram':
        userForm.step = 'snapchat';
        userForms.set(userId, userForm);
        console.log('➡️ Skip telegram → snapchat');
        await askSnapchat(ctx);
        break;
      case 'snapchat':
        userForm.step = 'potato';
        userForms.set(userId, userForm);
        console.log('➡️ Skip snapchat → potato');
        await askPotato(ctx);
        break;
      case 'potato':
        userForm.step = 'signal';
        userForms.set(userId, userForm);
        console.log('➡️ Skip potato → signal');
        await askSignal(ctx);
        break;
      case 'signal':
        userForm.step = 'whatsapp';
        userForms.set(userId, userForm);
        console.log('➡️ Skip signal → whatsapp');
        await askWhatsApp(ctx);
        break;
      case 'whatsapp':
        userForm.step = 'threema';
        userForms.set(userId, userForm);
        console.log('➡️ Skip whatsapp → threema');
        await askThreema(ctx);
        break;
      case 'threema':
        userForm.step = 'session';
        userForms.set(userId, userForm);
        console.log('➡️ Skip threema → session');
        await askSession(ctx);
        break;
      case 'session':
        userForm.step = 'telegram_bot';
        userForms.set(userId, userForm);
        console.log('➡️ Skip session → telegram_bot');
        await askTelegramBot(ctx);
        break;
      case 'telegram_bot':
        userForm.step = 'photo';
        userForms.set(userId, userForm);
        console.log('➡️ Skip telegram_bot → photo');
        await askPhoto(ctx);
        break;
      default:
        console.log('❌ Step non reconnu:', step);
        throw new Error(`Step non supporté: ${step}`);
    }
    
    console.log('✅ Skip step terminé avec succès');
    await ctx.answerCbQuery('Étape passée');
    
  } catch (error) {
    console.error('❌ ERREUR DANS handleSkipStep:');
    console.error('Step:', step);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    await ctx.answerCbQuery('❌ Erreur: ' + error.message).catch(e => console.error('Erreur answerCbQuery:', e));
  }
};

// Soumettre la demande
const submitApplication = async (ctx) => {
  try {
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm) {
      return;
    }
    
    // Convertir les services au nouveau format (array)
    const servicesArray = [];
    if (userForm.data.services.delivery?.enabled) servicesArray.push('delivery');
    if (userForm.data.services.postal?.enabled) servicesArray.push('postal');
    if (userForm.data.services.meetup?.enabled) servicesArray.push('meetup');
    
    console.log('📋 SUBMIT DEBUG: Creating application with data:', {
      userId: userForm.data.userId,
      name: userForm.data.name,
      services: servicesArray,
      location: {
        country: userForm.data.country,
        city: userForm.data.country || 'Non spécifiée'
      },
      contact: {
        telegram: userForm.data.telegram
      },
      hasPhoto: !!userForm.data.photo,
      photoFileId: userForm.data.photo ? userForm.data.photo.fileId : null
    });

    // Créer la demande en base
    const application = new PlugApplication({
      userId: userForm.data.userId,
      username: userForm.data.username,
      firstName: userForm.data.firstName,
      lastName: userForm.data.lastName,
      name: userForm.data.name,
      description: userForm.data.name + ' - Inscription FindYourPlug', // Description par défaut
      location: {
        country: userForm.data.country,
        city: userForm.data.country || 'Non spécifiée' // City par défaut
      },
      services: servicesArray, // Format array au lieu d'object
      contact: {
        telegram: userForm.data.telegram,
        telegramChannel: userForm.data.telegramChannel || '',
        telegramBot: userForm.data.telegramBot || '',
        instagram: userForm.data.instagram || '',
        potato: userForm.data.potato || '',
        snapchat: userForm.data.snapchat || '',
        whatsapp: userForm.data.whatsapp || '',
        signal: userForm.data.signal || '',
        session: userForm.data.session || '',
        threema: userForm.data.threema || '',
        other: ''
      },
      photo: userForm.data.photo ? userForm.data.photo.fileId : null, // Juste le fileId
      photoUrl: userForm.data.photo ? userForm.data.photo.fileId : null
    });
    
    console.log('📋 SUBMIT DEBUG: Attempting to save application...');
    
    // Vérifications avant sauvegarde
    if (!userForm.data.telegram) {
      throw new Error('Telegram manquant - requis pour contact.telegram');
    }
    if (!userForm.data.name) {
      throw new Error('Nom du plug manquant - requis');
    }
    if (!userForm.data.country) {
      throw new Error('Pays manquant - requis');
    }
    
    console.log('✅ SUBMIT DEBUG: Tous les champs requis sont présents');
    await application.save();
    console.log('✅ SUBMIT DEBUG: Application saved successfully with ID:', application._id);
    
    // Envoyer notification à l'admin (privé)
    const adminIds = [
      process.env.ADMIN_TELEGRAM_ID || '7670522278', // Admin principal
      // Ajoutez d'autres IDs ici si besoin :
      // '1234567890', // Autre admin
    ];
    
    try {
      // Récupérer l'instance du bot depuis le contexte global ou les paramètres
      const bot = ctx.telegram ? { telegram: ctx.telegram } : global.bot;
      if (bot) {
        // Envoyer à tous les admins en privé
        for (const adminId of adminIds) {
          await sendAdminNotification(bot, application, adminId);
        }
      }
    } catch (notificationError) {
      console.error('⚠️ Erreur notification admin:', notificationError.message);
      // Ne pas faire échouer la soumission pour une erreur de notification
    }
    
    // Nettoyer le formulaire
    userForms.delete(userId);
    lastBotMessages.delete(userId);
    
    // Récupérer la langue pour les traductions
    const Config = require('../models/Config');
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
      `⸻\n\n` +
      `${getTranslation('registration.finalStep', currentLang, customTranslations)}\n\n` +
      `${getTranslation('registration.formReceived', currentLang, customTranslations)}\n\n` +
      `${getTranslation('registration.validationInstructions', currentLang, customTranslations)}\n\n` +
      `${getTranslation('registration.step1Validation', currentLang, customTranslations)}\n\n` +
      `${getTranslation('registration.step2Validation', currentLang, customTranslations)}\n\n` +
      `${getTranslation('registration.timeLimit', currentLang, customTranslations)}\n\n` +
      `${getTranslation('registration.approvalTime', currentLang, customTranslations)}`;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback(getTranslation('registration.backToMenu', currentLang, customTranslations), 'back_main')]
    ]);
    
    // Utiliser editMessageText simple sans formatage pour éviter les problèmes
    try {
      await ctx.editMessageText(message, {
        reply_markup: keyboard.reply_markup
        // Pas de parse_mode pour éviter les erreurs de formatage
      });
    } catch (editError) {
      // Fallback: nouveau message si édition impossible
      await ctx.reply(message, {
        reply_markup: keyboard.reply_markup
        // Pas de parse_mode pour éviter les erreurs de formatage
      });
    }
    
  } catch (error) {
    console.error('❌ SUBMIT ERROR: Detailed error in submitApplication:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Nettoyer le formulaire même en cas d'erreur
    const userId = ctx.from.id;
    userForms.delete(userId);
    lastBotMessages.delete(userId);
    
    // Message d'erreur plus user-friendly
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Retour au menu', 'back_main')]
    ]);
    
    try {
      await ctx.reply(
        '❌ **Erreur technique**\n\n' +
        'Une erreur s\'est produite lors de l\'envoi de ta demande.\n\n' +
        '🔄 Tu peux réessayer dans quelques minutes.\n\n' +
        '💡 Si le problème persiste, contacte le support.',
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard.reply_markup
        }
      );
    } catch (replyError) {
      // Fallback ultime sans formatage
      await ctx.reply('❌ Erreur technique. Réessaie plus tard.').catch(() => {});
    }
  }
};

// Annuler la demande
const handleCancelApplication = async (ctx) => {
  try {
      const userId = ctx.from.id;
  userForms.delete(userId);
  lastBotMessages.delete(userId);
  
  // Récupérer la langue actuelle pour les traductions
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;
  
  const message = `${getTranslation('registration.cancelTitle', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.cancelMessage', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.canRestart', currentLang, customTranslations)}`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(getTranslation('registration.backToMenu', currentLang, customTranslations), 'back_main')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  }, true); // Afficher avec l'image d'accueil
  
  await ctx.answerCbQuery(getTranslation('registration.cancelledShort', currentLang, customTranslations));
    
  } catch (error) {
    console.error('Erreur dans handleCancelApplication:', error);
    try {
      const Config = require('../models/Config');
      const config = await Config.findById('main');
      const currentLang = config?.languages?.currentLanguage || 'fr';
      const customTranslations = config?.languages?.translations;
      await ctx.answerCbQuery(getTranslation('registration.error.general', currentLang, customTranslations));
    } catch (langError) {
      await ctx.answerCbQuery('❌ Erreur');
    }
  }
};

// Fonction utilitaire pour formater les services
const getServicesText = (services) => {
  const servicesList = [];
  if (services.meetup.enabled) servicesList.push('📍 Meetup');
  if (services.delivery.enabled) servicesList.push('🚚 Livraison');
  if (services.postal.enabled) servicesList.push('✈️ Envoi Postal');
  return servicesList.join(', ');
};

module.exports = {
  handleStartApplication,
  handleFormMessage,
  handleCountrySelection,
  handleServiceToggle,
  handleServicesDone,
  handlePhoto,
  handleSkipStep,
  handleCancelApplication,
  submitApplication,
  askTelegramBot,
  userForms,
  lastBotMessages
};