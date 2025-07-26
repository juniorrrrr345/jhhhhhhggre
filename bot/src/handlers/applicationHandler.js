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
      
      await safeEditMessage(ctx, message, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown'
      }, true); // keepWelcomeImage = true
      
      // Sauvegarder l'ID du message actuel pour permettre l'édition ultérieure
      lastBotMessages.set(userId, ctx.callbackQuery.message.message_id);
      return;
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
    
    // Sauvegarder l'ID du message actuel pour permettre l'édition ultérieure
    lastBotMessages.set(userId, ctx.callbackQuery.message.message_id);
    
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

// Fonction utilitaire pour éditer le dernier message du formulaire
const editLastFormMessage = async (ctx, userId, message, keyboard) => {
  const lastBotMessageId = lastBotMessages.get(userId);
  if (lastBotMessageId) {
    // Toujours supprimer l'ancien message (même avec image) et créer un nouveau
    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, lastBotMessageId);
    } catch (deleteError) {
      console.log('⚠️ Erreur suppression message:', deleteError.message);
    }
    
    // Créer un nouveau message texte sans image
    const sentMessage = await ctx.reply(message, {
      reply_markup: keyboard ? keyboard.reply_markup : undefined,
      disable_web_page_preview: true
    });
    lastBotMessages.set(userId, sentMessage.message_id);
  } else {
    // Pas de message précédent, créer un nouveau
    const sentMessage = await ctx.reply(message, {
      reply_markup: keyboard ? keyboard.reply_markup : undefined,
      disable_web_page_preview: true
    });
    lastBotMessages.set(userId, sentMessage.message_id);
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
  
  // Protection contre le double traitement
  const messageId = ctx.message.message_id;
  if (userForm.lastProcessedMessageId === messageId) {
    console.log(`⚠️ MESSAGE ALREADY PROCESSED: ${messageId} for user ${userId}`);
    return;
  }
  userForm.lastProcessedMessageId = messageId;
  userForms.set(userId, userForm);
  
  // Supprimer le message de l'utilisateur pour garder le chat propre
  try {
    await ctx.deleteMessage();
  } catch (error) {
    // Ignorer l'erreur si on ne peut pas supprimer
  }
  
  // Récupérer la langue pour les erreurs (en dehors du switch)
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;

  try {
    console.log(`🔄 FORM DEBUG: User ${userId} at step '${userForm.step}' with text: '${text}'`);
    console.log(`📊 FORM STATE BEFORE: ${JSON.stringify({step: userForm.step, services: userForm.data.services, messageId: ctx.message.message_id})}`);
    
    console.log(`🎯 SWITCH: About to enter switch with step='${userForm.step}' for user ${userId}`);
    switch (userForm.step) {
              case 'name':
          
          if (text.length < 2) {
            return await ctx.reply(getTranslation('registration.error.nameLength', currentLang, customTranslations));
          }
          
          userForm.data.name = text;
          userForm.step = 'telegram';
          userForms.set(userId, userForm);
          
          // Éditer le message existant pour montrer l'étape suivante
          const telegramMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
            `⸻\n\n` +
            `${getTranslation('registration.step2', currentLang, customTranslations)}\n\n` +
            `${getTranslation('registration.telegramQuestion', currentLang, customTranslations)}`;
          
          const telegramKeyboard = Markup.inlineKeyboard([
            [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_name')],
            [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
          ]);
          
          await editLastFormMessage(ctx, userId, telegramMessage, telegramKeyboard);
          break;
        
              case 'telegram':
          if (!text.startsWith('@') && !text.includes('t.me/')) {
            return await ctx.reply(getTranslation('registration.error.telegramFormat', currentLang, customTranslations));
          }

          userForm.data.telegram = text;
          userForm.step = 'snapchat';
          userForms.set(userId, userForm);
          
          // Éditer le message existant pour montrer l'étape suivante
          const snapchatMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
            `⸻\n\n` +
            `${getTranslation('registration.step3', currentLang, customTranslations)}\n\n` +
            `${getTranslation('registration.snapchatQuestion', currentLang, customTranslations)}\n\n` +
            `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
          
          const snapchatKeyboard = Markup.inlineKeyboard([
            [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_snapchat')],
            [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_telegram')],
            [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
          ]);
          
          await editLastFormMessage(ctx, userId, snapchatMessage, snapchatKeyboard);
          break;
        
      case 'snapchat':
        if (!text.startsWith('https://www.snapchat.com/') && !text.startsWith('https://')) {
          return await ctx.reply(getTranslation('registration.error.snapchatFormat', currentLang, customTranslations));
        }

        userForm.data.snapchat = text;
        userForm.step = 'potato';
        userForms.set(userId, userForm);
        
        // Éditer le message existant pour montrer l'étape suivante
        const potatoMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
          `⸻\n\n` +
          `${getTranslation('registration.step4', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.potatoQuestion', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
        
        const potatoKeyboard = Markup.inlineKeyboard([
          [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_potato')],
          [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_snapchat')],
          [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
        ]);
        
        await editLastFormMessage(ctx, userId, potatoMessage, potatoKeyboard);
        break;
        
              case 'potato':
          if (!text.startsWith('https://potato.chat/') && !text.startsWith('https://')) {
            return await ctx.reply(getTranslation('registration.error.potatoFormat', currentLang, customTranslations));
          }

                  userForm.data.potato = text;
        userForm.step = 'signal';
        userForms.set(userId, userForm);
        
        // Éditer le message existant pour montrer l'étape suivante
        const signalMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
          `⸻\n\n` +
          `${getTranslation('registration.step5', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.signalQuestion', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
        
        const signalKeyboard = Markup.inlineKeyboard([
          [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_signal')],
          [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_potato')],
          [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
        ]);
        
        await editLastFormMessage(ctx, userId, signalMessage, signalKeyboard);
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
        
        // Éditer le message existant pour montrer l'étape suivante
        const whatsappMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
          `⸻\n\n` +
          `${getTranslation('registration.step6', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.whatsappQuestion', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
        
        const whatsappKeyboard = Markup.inlineKeyboard([
          [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_whatsapp')],
          [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_signal')],
          [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
        ]);
        
        await editLastFormMessage(ctx, userId, whatsappMessage, whatsappKeyboard);
        break;
        
      case 'whatsapp':
        if (!text.startsWith('https://wa.me/') && !text.startsWith('https://')) {
          return await ctx.reply(getTranslation('registration.error.whatsappFormat', currentLang, customTranslations));
        }

        userForm.data.whatsapp = text;
        userForm.step = 'threema';
        userForms.set(userId, userForm);
        
        // Éditer le message existant pour montrer l'étape suivante
        const threemaMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
          `⸻\n\n` +
          `${getTranslation('registration.step7', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.threemaQuestion', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
        
        const threemaKeyboard = Markup.inlineKeyboard([
          [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_threema')],
          [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_whatsapp')],
          [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
        ]);
        
        await editLastFormMessage(ctx, userId, threemaMessage, threemaKeyboard);
        break;
        
      case 'threema':
        if (!text.startsWith('https://')) {
          return await ctx.reply(getTranslation('registration.error.urlFormat', currentLang, customTranslations));
        }

        userForm.data.threema = text;
        userForm.step = 'session';
        userForms.set(userId, userForm);
        
        // Éditer le message existant pour montrer l'étape suivante
        const sessionMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
          `⸻\n\n` +
          `${getTranslation('registration.step8', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.sessionQuestion', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
        
        const sessionKeyboard = Markup.inlineKeyboard([
          [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_session')],
          [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
        ]);
        
        await editLastFormMessage(ctx, userId, sessionMessage, sessionKeyboard);
        break;
        
      case 'session':
        if (text.length < 2) {
          return await ctx.reply(getTranslation('registration.error.sessionFormat', currentLang, customTranslations));
        }

        userForm.data.session = text;
        userForm.step = 'instagram';
        userForms.set(userId, userForm);
        
        // Éditer le message existant pour montrer l'étape suivante (ÉTAPE 9 = INSTAGRAM)
        const instagramFromSessionMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
          `⸻\n\n` +
          `${getTranslation('registration.step9', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.instagramQuestion', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
        
        const instagramFromSessionKeyboard = Markup.inlineKeyboard([
          [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_instagram')],
          [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_session')],
          [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
        ]);
        
        await editLastFormMessage(ctx, userId, instagramFromSessionMessage, instagramFromSessionKeyboard);
        break;

      case 'instagram':
        if (!text.startsWith('https://www.instagram.com/') && !text.startsWith('https://instagram.com/') && !text.startsWith('@') && text.length < 2) {
          return await ctx.reply(getTranslation('registration.error.instagramFormat', currentLang, customTranslations));
        }

        userForm.data.instagram = text;
        userForm.step = 'telegram_bot';
        userForms.set(userId, userForm);
        
        // Éditer le message existant pour montrer l'étape suivante (ÉTAPE 10 = BOT TELEGRAM)
        const telegramBotFromInstagramMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
          `⸻\n\n` +
          `${getTranslation('registration.step10Bot', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.telegramBotQuestion', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.telegramBotExample', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
        
        const telegramBotFromInstagramKeyboard = Markup.inlineKeyboard([
          [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_telegram_bot')],
          [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_instagram')],
          [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
        ]);
        
        await editLastFormMessage(ctx, userId, telegramBotFromInstagramMessage, telegramBotFromInstagramKeyboard);
        break;

      case 'telegram_bot':
        if (!text.startsWith('@') && !text.includes('t.me/')) {
          return await ctx.reply(getTranslation('registration.error.telegramBotFormat', currentLang, customTranslations));
        }

        userForm.data.telegramBot = text;
        userForm.step = 'photo';
        userForms.set(userId, userForm);
        
        // Éditer le message existant pour montrer l'étape suivante
        const photoFromTelegramBotMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
          `⸻\n\n` +
          `${getTranslation('registration.step11Photo', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.shopPhotoQuestion', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.shopPhotoInstruction', currentLang, customTranslations)}`;
        
        const photoFromTelegramBotKeyboard = Markup.inlineKeyboard([
          [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_telegram_bot')],
          [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
        ]);
        
        await editLastFormMessage(ctx, userId, photoFromTelegramBotMessage, photoFromTelegramBotKeyboard);
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
        
        // Passer directement à departments_shipping (flux simplifié)
        userForm.step = 'departments_shipping';
        userForms.set(userId, userForm);
        
        console.log('✅ MEETUP CASE FINISHED: Going to departments_shipping');
        await askDepartmentsShipping(ctx);
        break;
        
        /* OLD CODE - À SUPPRIMER
        // Si livraison est aussi sélectionné, demander les départements livraison
        if (userForm.data.services && userForm.data.services.delivery && userForm.data.services.delivery.enabled) {
          userForm.step = 'departments_delivery';
          userForms.set(userId, userForm);
          
          const deliveryDeptMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
            `⸻\n\n` +
            `${getTranslation('registration.step14', currentLang, customTranslations)}\n\n` +
            `${getTranslation('registration.departmentsDeliveryQuestion', currentLang, customTranslations)}`;
          
          const deliveryDeptKeyboard = Markup.inlineKeyboard([
            [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
          ]);
          
          await editLastFormMessage(ctx, userId, deliveryDeptMessage, deliveryDeptKeyboard);
        } else {
          // Sinon passer directement à la photo
          userForm.step = 'photo';
          userForms.set(userId, userForm);
          
          const photoFromMeetupMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
            `⸻\n\n` +
            `${getTranslation('registration.step11Photo', currentLang, customTranslations)}\n\n` +
            `${getTranslation('registration.shopPhotoQuestion', currentLang, customTranslations)}\n\n` +
            `${getTranslation('registration.shopPhotoInstruction', currentLang, customTranslations)}`;
          
          const photoFromMeetupKeyboard = Markup.inlineKeyboard([
            [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
          ]);
          
          await editLastFormMessage(ctx, userId, photoFromMeetupMessage, photoFromMeetupKeyboard);
        }
        break;
        
      case 'departments_delivery':
        console.log(`🔵 ENTERING case 'departments_delivery' for user ${userId}`);
        if (text.length < 2) {
          return await ctx.reply(getTranslation('registration.error.departmentsLength', currentLang, customTranslations));
        }
        
        // Validation: vérifier que seuls des chiffres et virgules sont utilisés
        const departmentPattern = /^[\d\s,]+$/;
        if (!departmentPattern.test(text)) {
          // Envoyer message d'erreur temporaire puis redemander
          await ctx.reply(getTranslation('registration.error.departmentsNumbers', currentLang, customTranslations));
          await askDepartmentsDelivery(ctx);
          return;
        }
        
        userForm.data.departmentsDelivery = text;
        userForms.set(userId, userForm);
        
        // Toujours passer à meetup maintenant
        console.log('✅ DELIVERY DONE: Going to departments_meetup');
        userForm.step = 'departments_meetup';
        userForms.set(userId, userForm);
        await askDepartmentsMeetup(ctx);
        break;

      case 'departments_meetup':
        console.log(`🟢 ENTERING case 'departments_meetup' for user ${userId}`);
        if (text.length < 2) {
          return await ctx.reply(getTranslation('registration.error.departmentsLength', currentLang, customTranslations));
        }
        
        // Validation: vérifier que seuls des chiffres et virgules sont utilisés
        const meetupDepartmentPattern = /^[\d\s,]+$/;
        if (!meetupDepartmentPattern.test(text)) {
          // Envoyer message d'erreur temporaire puis redemander
          await ctx.reply(getTranslation('registration.error.departmentsNumbers', currentLang, customTranslations));
          await askDepartmentsMeetup(ctx);
          return;
        }
        
        userForm.data.departmentsMeetup = text;
        userForms.set(userId, userForm);
        
        // Toujours passer à shipping maintenant
        console.log('✅ MEETUP DONE: Going to departments_shipping');
        userForm.step = 'departments_shipping';
        userForms.set(userId, userForm);
        await askDepartmentsShipping(ctx);
        console.log(`✅ MEETUP CASE FINISHED for user ${userId}`);
        break;

      case 'departments_shipping':
        console.log(`🟡 ENTERING case 'departments_shipping' for user ${userId}`);
        if (text.length < 2) {
          return await ctx.reply(getTranslation('registration.error.departmentsLength', currentLang, customTranslations));
        }
        
        // Pour l'envoi, on sauvegarde les pays (pas de validation numérique nécessaire)
        userForm.data.shippingCountries = text;
        userForm.step = 'confirmation';
        userForms.set(userId, userForm);
        
        await askConfirmation(ctx);
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
        [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_name')],
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
        [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_telegram')],
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
        [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_telegram_channel')],
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
        [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_potato')],
        [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
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
        [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_snapchat')],
        [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
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
        [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_whatsapp')],
        [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
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
        [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_signal')],
        [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
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
        [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_session')],
        [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
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
        [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_threema')],
        [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
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

// Demander Telegram
const askTelegram = async (ctx) => {
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;

  const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
    `⸻\n\n` +
    `${getTranslation('registration.step2', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.telegramQuestion', currentLang, customTranslations)}`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_name')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);

  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
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
            [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_telegram_channel')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
};

// Demander Instagram
const askInstagram = async (ctx) => {
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;

  const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
    `⸻\n\n` +
    `${getTranslation('registration.step9', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.instagramQuestion', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_session')],
    [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_instagram')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    disable_web_page_preview: true
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
    [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_snapchat')],
    [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_potato')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    disable_web_page_preview: true
  });
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
    [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_telegram')],
    [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_snapchat')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    disable_web_page_preview: true
  });
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
      [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_signal')],
      [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_whatsapp')],
      [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
    ]);
    
    console.log(`⌨️ askWhatsApp: Keyboard created`);
    
    await safeEditMessage(ctx, message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });
    
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
    [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_potato')],
    [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_signal')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
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
    [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_threema')],
    [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_session')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
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
    [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_whatsapp')],
    [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_threema')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
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
    [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_instagram')],
    [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_telegram_bot')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
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
  const userId = ctx.from.id;
  const userForm = userForms.get(userId);
  
  // Initialiser les services si pas encore fait
  if (!userForm.data.services) {
    userForm.data.services = {
      delivery: { enabled: false },
      shipping: { enabled: false },
      meetup: { enabled: false }
    };
    userForms.set(userId, userForm);
  }
  
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;

  const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
    `⸻\n\n` +
    `${getTranslation('registration.step12Services', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.servicesQuestion', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.servicesInstruction', currentLang, customTranslations)}`;
  
  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback(getTranslation('registration.serviceMeetup', currentLang, customTranslations), 'service_meetup'),
      Markup.button.callback(getTranslation('registration.serviceDelivery', currentLang, customTranslations), 'service_delivery')
    ],
    [Markup.button.callback(getTranslation('registration.serviceShipping', currentLang, customTranslations), 'service_shipping')],
    [Markup.button.callback(getTranslation('registration.continueToNext', currentLang, customTranslations), 'services_done')],
    [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_photo')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
};

// Demander les départements pour la livraison
const askDepartmentsDelivery = async (ctx) => {
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;

  const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
    `⸻\n\n` +
    `${getTranslation('registration.step13Delivery', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.departmentsDeliveryQuestion', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.departmentsInstruction', currentLang, customTranslations)}`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_departments_delivery')],
    [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_photo')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  await editLastFormMessage(ctx, ctx.from.id, message, keyboard);
};

// Demander les départements pour le meetup
const askDepartmentsMeetup = async (ctx) => {
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;

  const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
    `⸻\n\n` +
    `${getTranslation('registration.step14Meetup', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.departmentsMeetupQuestion', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.departmentsInstruction', currentLang, customTranslations)}`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_departments_meetup')],
    [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_departments_delivery')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  await editLastFormMessage(ctx, ctx.from.id, message, keyboard);
};

// Demander les pays pour l'envoi
const askDepartmentsShipping = async (ctx) => {
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;

  const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
    `⸻\n\n` +
    `${getTranslation('registration.step15Shipping', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.shippingCountriesQuestion', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.shippingCountriesInstruction', currentLang, customTranslations)}`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_departments_shipping')],
    [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_departments_meetup')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  await editLastFormMessage(ctx, ctx.from.id, message, keyboard);
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
    
    // S'assurer que les services sont initialisés
    if (!userForm.data.services) {
      userForm.data.services = {
        delivery: { enabled: false },
        shipping: { enabled: false },
        meetup: { enabled: false }
      };
    }
    
    // S'assurer que le service spécifique existe
    if (!userForm.data.services[serviceType]) {
      userForm.data.services[serviceType] = { enabled: false };
    }
    
    // Toggle le service
    userForm.data.services[serviceType].enabled = !userForm.data.services[serviceType].enabled;
    
    userForms.set(userId, userForm);
    
    // Récupérer les traductions
    const Config = require('../models/Config');
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    // Construire le message avec les services sélectionnés
    const services = userForm.data.services;
    let selectedServicesText = '';
    
    if (services.delivery && services.delivery.enabled) {
      selectedServicesText += `\n✅ ${getTranslation('registration.serviceDelivery', currentLang, customTranslations)}`;
    }
    if (services.meetup && services.meetup.enabled) {
      selectedServicesText += `\n✅ ${getTranslation('registration.serviceMeetup', currentLang, customTranslations)}`;
    }
    if (services.shipping && services.shipping.enabled) {
      selectedServicesText += `\n✅ ${getTranslation('registration.serviceShipping', currentLang, customTranslations)}`;
    }
    
    const message = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
      `⸻\n\n` +
      `${getTranslation('registration.step12Services', currentLang, customTranslations)}\n\n` +
      `${getTranslation('registration.servicesQuestion', currentLang, customTranslations)}\n\n` +
      `${getTranslation('registration.servicesInstruction', currentLang, customTranslations)}` +
      (selectedServicesText ? `\n\n**Services sélectionnés :**${selectedServicesText}` : '');
    
    // Construire le clavier avec les checkmarks
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback(
          (services.meetup && services.meetup.enabled ? '✅ ' : '') + getTranslation('registration.serviceMeetup', currentLang, customTranslations),
          'service_meetup'
        ),
        Markup.button.callback(
          (services.delivery && services.delivery.enabled ? '✅ ' : '') + getTranslation('registration.serviceDelivery', currentLang, customTranslations),
          'service_delivery'
        )
      ],
      [
        Markup.button.callback(
          (services.shipping && services.shipping.enabled ? '✅ ' : '') + getTranslation('registration.serviceShipping', currentLang, customTranslations),
          'service_shipping'
        )
      ],
      [Markup.button.callback(getTranslation('registration.continueToNext', currentLang, customTranslations), 'services_done')],
      [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_photo')],
      [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
    ]);
    
    await safeEditMessage(ctx, message, {
      reply_markup: keyboard.reply_markup,
      disable_web_page_preview: true
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
    if (!services.delivery.enabled && !services.shipping.enabled && !services.meetup.enabled) {
      return await ctx.answerCbQuery('❌ Tu dois sélectionner au moins un service');
    }
    
    // Ordre : Livraison → Meetup → Envoi → Confirmation
    if (services.delivery.enabled) {
      userForm.step = 'departments_delivery';
      userForms.set(userId, userForm);
      await askDepartmentsDelivery(ctx);
    } else if (services.meetup.enabled) {
      userForm.step = 'departments_meetup';
      userForms.set(userId, userForm);
      await askDepartmentsMeetup(ctx);
    } else if (services.shipping.enabled) {
      userForm.step = 'departments_shipping';
      userForms.set(userId, userForm);
      await askDepartmentsShipping(ctx);
    } else {
      userForm.step = 'confirmation';
      userForms.set(userId, userForm);
      await askConfirmation(ctx);
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
    `${getTranslation('registration.step11Photo', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.shopPhotoQuestion', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.shopPhotoInstruction', currentLang, customTranslations)}`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_telegram_bot')],
    [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
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
    `${getTranslation('registration.step16Confirmation', currentLang, customTranslations)}\n\n` +
    `${getTranslation('registration.finalSummary', currentLang, customTranslations)}\n\n` +
    `• ${getTranslation('registration.plugName', currentLang, customTranslations)} : ${userForm.data.name}\n` +
    `• Telegram : ${userForm.data.telegram}\n` +
    `${userForm.data.snapchat ? `• Snapchat : ${userForm.data.snapchat}\n` : ''}` +
    `${userForm.data.potato ? `• Potato : ${userForm.data.potato}\n` : ''}` +
    `${userForm.data.signal ? `• Signal : ${userForm.data.signal}\n` : ''}` +
    `${userForm.data.whatsapp ? `• WhatsApp : ${userForm.data.whatsapp}\n` : ''}` +
    `${userForm.data.threema ? `• Threema : ${userForm.data.threema}\n` : ''}` +
    `${userForm.data.session ? `• Session : ${userForm.data.session}\n` : ''}` +
    `${userForm.data.instagram ? `• Instagram : ${userForm.data.instagram}\n` : ''}` +
    `${userForm.data.telegramBot ? `• Bot Telegram : ${userForm.data.telegramBot}\n` : ''}` +
    `• Photo de boutique : ✔️ Reçu\n` +
    `${userForm.data.services && userForm.data.services.delivery && userForm.data.services.delivery.enabled ? `• Livraison : ${userForm.data.departmentsDelivery || 'Non spécifiés'}\n` : ''}` +
    `${userForm.data.services && userForm.data.services.meetup && userForm.data.services.meetup.enabled ? `• Meetup : ${userForm.data.departmentsMeetup || 'Non spécifiés'}\n` : ''}` +
    `${userForm.data.services && userForm.data.services.shipping && userForm.data.services.shipping.enabled ? `• Envoi : ${userForm.data.shippingCountries || 'Non spécifiés'}\n` : ''}` +
    `\n${getTranslation('registration.confirmInscription', currentLang, customTranslations)}`;
  
  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback(getTranslation('registration.confirm', currentLang, customTranslations), 'confirm_application')
    ],
    [
      Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_confirmation'),
      Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')
    ]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup
    // Pas de parse_mode pour éviter les erreurs de parsing d'entités
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
    
    userForm.step = 'departments_delivery';
    userForms.set(userId, userForm);
    
    // Confirmer réception et passer aux départements livraison
    const Config = require('../models/Config');
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    await ctx.reply(getTranslation('registration.photoReceived', currentLang, customTranslations));
    await askDepartmentsDelivery(ctx);
    
  } catch (error) {
    console.error('Erreur dans handlePhoto:', error);
    const Config = require('../models/Config');
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    await ctx.reply(getTranslation('registration.error.photoProcessing', currentLang, customTranslations));
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
    
    // Récupérer la langue actuelle
    const Config = require('../models/Config');
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;

    // NOUVEL ORDRE : Nom → Telegram → Snapchat → Potato → Signal → WhatsApp → Threema → Session → Bot Telegram → Photo → Confirmation
    switch (step) {
      case 'telegram':
        userForm.step = 'snapchat';
        userForms.set(userId, userForm);
        console.log('➡️ Skip telegram → snapchat');
        
        const snapchatMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
          `⸻\n\n` +
          `${getTranslation('registration.step3', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.snapchatQuestion', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
        
        const snapchatKeyboard = Markup.inlineKeyboard([
          [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_snapchat')],
          [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_telegram')],
          [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
        ]);
        
        await safeEditMessage(ctx, snapchatMessage, {
          reply_markup: snapchatKeyboard.reply_markup
        });
        break;
        
      case 'snapchat':
        userForm.step = 'potato';
        userForms.set(userId, userForm);
        console.log('➡️ Skip snapchat → potato');
        
        const potatoMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
          `⸻\n\n` +
          `${getTranslation('registration.step4', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.potatoQuestion', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
        
        const potatoKeyboard = Markup.inlineKeyboard([
          [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_potato')],
          [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
        ]);
        
        await safeEditMessage(ctx, potatoMessage, {
          reply_markup: potatoKeyboard.reply_markup,
          parse_mode: 'Markdown'
        });
        break;
        
      case 'potato':
        userForm.step = 'signal';
        userForms.set(userId, userForm);
        console.log('➡️ Skip potato → signal');
        
        const signalFromPotatoMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
          `⸻\n\n` +
          `${getTranslation('registration.step5', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.signalQuestion', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
        
        const signalFromPotatoKeyboard = Markup.inlineKeyboard([
          [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_signal')],
          [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_potato')],
          [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
        ]);
        
        await safeEditMessage(ctx, signalFromPotatoMessage, {
          reply_markup: signalFromPotatoKeyboard.reply_markup
        });
        break;
        
      case 'signal':
        userForm.step = 'whatsapp';
        userForms.set(userId, userForm);
        console.log('➡️ Skip signal → whatsapp');
        
        const whatsappFromSignalMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
          `⸻\n\n` +
          `${getTranslation('registration.step6', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.whatsappQuestion', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
        
        const whatsappFromSignalKeyboard = Markup.inlineKeyboard([
          [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_whatsapp')],
          [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_signal')],
          [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
        ]);
        
        await safeEditMessage(ctx, whatsappFromSignalMessage, {
          reply_markup: whatsappFromSignalKeyboard.reply_markup
        });
        break;
        
      case 'whatsapp':
        userForm.step = 'threema';
        userForms.set(userId, userForm);
        console.log('➡️ Skip whatsapp → threema');
        
        const threemaFromWhatsappMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
          `⸻\n\n` +
          `${getTranslation('registration.step7', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.threemaQuestion', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
        
        const threemaFromWhatsappKeyboard = Markup.inlineKeyboard([
          [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_threema')],
          [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_whatsapp')],
          [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
        ]);
        
        await safeEditMessage(ctx, threemaFromWhatsappMessage, {
          reply_markup: threemaFromWhatsappKeyboard.reply_markup
        });
        break;
        
      case 'threema':
        userForm.step = 'session';
        userForms.set(userId, userForm);
        console.log('➡️ Skip threema → session');
        
        const sessionFromThreemaMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
          `⸻\n\n` +
          `${getTranslation('registration.step8', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.sessionQuestion', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
        
        const sessionFromThreemaKeyboard = Markup.inlineKeyboard([
          [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_session')],
          [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_threema')],
          [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
        ]);
        
        await safeEditMessage(ctx, sessionFromThreemaMessage, {
          reply_markup: sessionFromThreemaKeyboard.reply_markup,
          parse_mode: 'Markdown'
        });
        break;
      case 'session':
        userForm.step = 'instagram';
        userForms.set(userId, userForm);
        console.log('➡️ Skip session → instagram');
        
        const instagramMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
          `⸻\n\n` +
          `${getTranslation('registration.step4', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.instagramQuestion', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
        
        const instagramKeyboard = Markup.inlineKeyboard([
          [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_instagram')],
          [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_session')],
          [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
        ]);
        
        await safeEditMessage(ctx, instagramMessage, {
          reply_markup: instagramKeyboard.reply_markup,
          parse_mode: 'Markdown'
        });
        break;

      case 'instagram':
        userForm.step = 'telegram_bot';
        userForms.set(userId, userForm);
        console.log('➡️ Skip instagram → telegram_bot');
        
        const telegramBotMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
          `⸻\n\n` +
          `${getTranslation('registration.step10Bot', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.telegramBotQuestion', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.telegramBotExample', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
        
        const telegramBotKeyboard = Markup.inlineKeyboard([
          [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_telegram_bot')],
          [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_instagram')],
          [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
        ]);
        
        await safeEditMessage(ctx, telegramBotMessage, {
          reply_markup: telegramBotKeyboard.reply_markup,
          disable_web_page_preview: true
        });
        break;
        
      case 'telegram_bot':
        userForm.step = 'photo';
        userForms.set(userId, userForm);
        console.log('➡️ Skip telegram_bot → photo');
        
        const photoMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
          `⸻\n\n` +
          `${getTranslation('registration.step11Photo', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.shopPhotoQuestion', currentLang, customTranslations)}\n\n` +
          `${getTranslation('registration.shopPhotoInstruction', currentLang, customTranslations)}`;
        
        const photoKeyboard = Markup.inlineKeyboard([
          [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
        ]);
        
        await safeEditMessage(ctx, photoMessage, {
          reply_markup: photoKeyboard.reply_markup,
          parse_mode: 'Markdown'
        });
        break;

      case 'departments_delivery':
        userForm.step = 'departments_meetup';
        userForms.set(userId, userForm);
        console.log('➡️ Skip departments_delivery → departments_meetup');
        await askDepartmentsMeetup(ctx);
        break;

      case 'departments_meetup':
        userForm.step = 'departments_shipping';
        userForms.set(userId, userForm);
        console.log('➡️ Skip departments_meetup → departments_shipping');
        await askDepartmentsShipping(ctx);
        break;

      case 'departments_shipping':
        userForm.step = 'confirmation';
        userForms.set(userId, userForm);
        console.log('➡️ Skip departments_shipping → confirmation');
        await askConfirmation(ctx);
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
    
    // Convertir les services sélectionnés en array
    const servicesArray = [];
    if (userForm.data.services?.delivery?.enabled) servicesArray.push('delivery');
    if (userForm.data.services?.meetup?.enabled) servicesArray.push('meetup');
    if (userForm.data.services?.shipping?.enabled) servicesArray.push('shipping');
    
    console.log('📋 SUBMIT DEBUG: Creating application with data:', {
      userId: userForm.data.userId,
      name: userForm.data.name,
      services: servicesArray,
      location: {
        country: userForm.data.country || 'France', // Pays par défaut
        city: userForm.data.city || 'Non spécifiée'
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
        country: userForm.data.country || 'France', // Pays par défaut
        city: userForm.data.city || 'Non spécifiée' // City par défaut
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
      departments: {
        delivery: userForm.data.departmentsDelivery || '',
        meetup: userForm.data.departmentsMeetup || '',
        shipping: userForm.data.shippingCountries || ''
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
    // Le pays n'est plus requis car on a une valeur par défaut
    
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
    
    // Message d'erreur traduit dans la langue choisie
    const Config = require('../models/Config');
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback(getTranslation('registration.backToMenu', currentLang, customTranslations), 'back_main')]
    ]);
    
    const errorMessage = `❌ ${getTranslation('registration.error.technical', currentLang, customTranslations)}\n\n` +
      `${getTranslation('registration.error.submissionFailed', currentLang, customTranslations)}\n\n` +
      `🔄 ${getTranslation('registration.error.tryAgainLater', currentLang, customTranslations)}\n\n` +
      `💡 ${getTranslation('registration.error.contactSupport', currentLang, customTranslations)}`;
    
    try {
      await ctx.reply(errorMessage, {
        reply_markup: keyboard.reply_markup
        // Pas de parse_mode pour éviter les erreurs
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



// Fonction pour gérer les retours en arrière
const handleGoBack = async (ctx) => {
  const userId = ctx.from.id;
  const userForm = userForms.get(userId);
  
  if (!userForm) {
    await ctx.answerCbQuery('❌ Aucun formulaire en cours');
    return;
  }

  await ctx.answerCbQuery();
  
  const Config = require('../models/Config');
  const config = await Config.findById('main');
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;

  // Définir les étapes précédentes selon le VRAI ordre du formulaire
  let previousStep;
  
  switch (userForm.step) {
    case 'telegram': previousStep = 'name'; break;
    case 'snapchat': previousStep = 'telegram'; break;
    case 'potato': previousStep = 'snapchat'; break;
    case 'signal': previousStep = 'potato'; break;
    case 'whatsapp': previousStep = 'signal'; break;
    case 'threema': previousStep = 'whatsapp'; break;
    case 'session': previousStep = 'threema'; break;
    case 'instagram': previousStep = 'session'; break;
    case 'telegram_bot': previousStep = 'instagram'; break;
    case 'photo': previousStep = 'telegram_bot'; break;
    case 'services': previousStep = 'photo'; break;
    case 'departments_delivery': previousStep = 'services'; break;
    case 'departments_meetup': 
      // Si delivery est activé, revenir à delivery, sinon à services
      if (userForm.data.services && userForm.data.services.delivery && userForm.data.services.delivery.enabled) {
        previousStep = 'departments_delivery';
      } else {
        previousStep = 'services';
      }
      break;
    case 'departments_shipping':
      // Si meetup est activé, revenir à meetup, sinon à delivery ou services
      if (userForm.data.services && userForm.data.services.meetup && userForm.data.services.meetup.enabled) {
        previousStep = 'departments_meetup';
      } else if (userForm.data.services && userForm.data.services.delivery && userForm.data.services.delivery.enabled) {
        previousStep = 'departments_delivery';
      } else {
        previousStep = 'services';
      }
      break;
    case 'confirmation':
      // Déterminer la dernière étape de départements active
      if (userForm.data.services && userForm.data.services.shipping && userForm.data.services.shipping.enabled) {
        previousStep = 'departments_shipping';
      } else if (userForm.data.services && userForm.data.services.meetup && userForm.data.services.meetup.enabled) {
        previousStep = 'departments_meetup';
      } else if (userForm.data.services && userForm.data.services.delivery && userForm.data.services.delivery.enabled) {
        previousStep = 'departments_delivery';
      } else {
        previousStep = 'services';
      }
      break;
    default: previousStep = null; break;
  }
  
  if (!previousStep) {
    await ctx.answerCbQuery('❌ Impossible de revenir en arrière');
    return;
  }

  // Revenir à l'étape précédente
  userForm.step = previousStep;
  userForms.set(userId, userForm);

  // Afficher l'étape précédente avec le bon message et boutons
  switch (previousStep) {
    case 'name':
      const nameMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
        `⸻\n\n` +
        `${getTranslation('registration.step1', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.nameQuestion', currentLang, customTranslations)}`;
      
      const nameKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
      ]);

      await safeEditMessage(ctx, nameMessage, {
        reply_markup: nameKeyboard.reply_markup,
        parse_mode: 'Markdown'
      });
      break;

    case 'telegram':
      const telegramMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
        `⸻\n\n` +
        `${getTranslation('registration.step2', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.telegramQuestion', currentLang, customTranslations)}`;
      
      const telegramKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_name')],
        [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
      ]);

      await safeEditMessage(ctx, telegramMessage, {
        reply_markup: telegramKeyboard.reply_markup,
        parse_mode: 'Markdown'
      });
      break;

    case 'snapchat':
      const snapchatBackMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
        `⸻\n\n` +
        `${getTranslation('registration.step3', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.snapchatQuestion', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
      
      const snapchatBackKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_snapchat')],
        [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_telegram')],
        [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
      ]);

      await safeEditMessage(ctx, snapchatBackMessage, {
        reply_markup: snapchatBackKeyboard.reply_markup,
        parse_mode: 'Markdown'
      });
      break;

    case 'potato':
      const potatoBackMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
        `⸻\n\n` +
        `${getTranslation('registration.step4', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.potatoQuestion', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
      
      const potatoBackKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_potato')],
        [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_snapchat')],
        [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
      ]);

      await safeEditMessage(ctx, potatoBackMessage, {
        reply_markup: potatoBackKeyboard.reply_markup,
        parse_mode: 'Markdown'
      });
      break;

    case 'signal':
      const signalBackMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
        `⸻\n\n` +
        `${getTranslation('registration.step5', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.signalQuestion', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
      
      const signalBackKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_potato')],
        [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_signal')],
        [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
      ]);

      await safeEditMessage(ctx, signalBackMessage, {
        reply_markup: signalBackKeyboard.reply_markup,
        disable_web_page_preview: true
      });
      break;

    case 'whatsapp':
      const whatsappBackMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
        `⸻\n\n` +
        `${getTranslation('registration.step6', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.whatsappQuestion', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
      
      const whatsappBackKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_signal')],
        [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_whatsapp')],
        [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
      ]);

      await safeEditMessage(ctx, whatsappBackMessage, {
        reply_markup: whatsappBackKeyboard.reply_markup,
        disable_web_page_preview: true
      });
      break;

    case 'threema':
      const threemaBackMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
        `⸻\n\n` +
        `${getTranslation('registration.step7', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.threemaQuestion', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
      
      const threemaBackKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_whatsapp')],
        [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_threema')],
        [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
      ]);

      await safeEditMessage(ctx, threemaBackMessage, {
        reply_markup: threemaBackKeyboard.reply_markup,
        disable_web_page_preview: true
      });
      break;

    case 'session':
      const sessionBackMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
        `⸻\n\n` +
        `${getTranslation('registration.step8', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.sessionQuestion', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
      
      const sessionBackKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_threema')],
        [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_session')],
        [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
      ]);

      await safeEditMessage(ctx, sessionBackMessage, {
        reply_markup: sessionBackKeyboard.reply_markup,
        disable_web_page_preview: true
      });
      break;

    case 'instagram':
      const instagramBackMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
        `⸻\n\n` +
        `${getTranslation('registration.step9', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.instagramQuestion', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
      
      const instagramBackKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_session')],
        [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_instagram')],
        [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
      ]);

      await safeEditMessage(ctx, instagramBackMessage, {
        reply_markup: instagramBackKeyboard.reply_markup,
        disable_web_page_preview: true
      });
      break;

    case 'telegram_bot':
      const telegramBotBackMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
        `⸻\n\n` +
        `${getTranslation('registration.step10Bot', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.telegramBotQuestion', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.telegramBotExample', currentLang, customTranslations)}\n\n` +
        `${getTranslation('registration.canSkip', currentLang, customTranslations)}`;
      
      const telegramBotBackKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_instagram')],
        [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_telegram_bot')],
        [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
      ]);

      await safeEditMessage(ctx, telegramBotBackMessage, {
        reply_markup: telegramBotBackKeyboard.reply_markup,
        disable_web_page_preview: true
      });
      break;

    case 'photo':
      await askPhoto(ctx);
      break;

    case 'services':
      await askServices(ctx);
      break;

    case 'departments_delivery':
      await askDepartmentsDelivery(ctx);
      break;

    case 'departments_meetup':
      await askDepartmentsMeetup(ctx);
      break;

    case 'departments_shipping':
      await askDepartmentsShipping(ctx);
      break;

    default:
      // Pour les autres étapes, construire le message approprié
      await replyWithStep(ctx, previousStep);
      break;
  }
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
  askDepartmentsMeetup,
  askDepartmentsDelivery,
  handleGoBack,
  userForms,
  lastBotMessages
};