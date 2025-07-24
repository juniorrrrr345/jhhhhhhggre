const PlugApplication = require('../models/PlugApplication');
const { Markup } = require('telegraf');
const { sendAdminNotification } = require('./notificationHandler');

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

// Fonction utilitaire pour éditer les messages avec gestion robuste des erreurs
const safeEditMessage = async (ctx, message, options = {}, keepWelcomeImage = false) => {
  const userId = ctx.from.id;
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
            parse_mode: options.parse_mode || 'Markdown'
          }, {
            reply_markup: options.reply_markup
          });
          return;
        } catch (mediaError) {
          console.log('⚠️ editMessageMedia échoué:', mediaError.message);
          
          // Fallback 1: Essayer d'éditer la caption seulement
          try {
            await ctx.editMessageCaption(message, {
              parse_mode: options.parse_mode || 'Markdown',
              reply_markup: options.reply_markup
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
      await ctx.editMessageText(message, options);
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
            parse_mode: options.parse_mode || 'Markdown',
            reply_markup: options.reply_markup
          });
          lastBotMessages.set(userId, sentMessage.message_id);
        } else {
          const sentMessage = await ctx.reply(message, options);
          lastBotMessages.set(userId, sentMessage.message_id);
        }
      } else {
        const sentMessage = await ctx.reply(message, options);
        lastBotMessages.set(userId, sentMessage.message_id);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur safeEditMessage:', error.message);
    // Dernier fallback: message simple sans formatage
    try {
      await ctx.reply('✅ Ta demande a été soumise avec succès ! Tu recevras une réponse prochainement.', {
        reply_markup: options.reply_markup
      });
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
    
    // Vérifier si l'utilisateur a déjà une demande en cours
    const existingApplication = await PlugApplication.findOne({ 
      userId: userId, 
      status: 'pending' 
    });
    
    if (existingApplication) {
      const message = `📝 **Demande en cours**\n\n` +
        `Tu as déjà une demande d'inscription en cours de traitement.\n` +
        `Elle a été soumise le ${existingApplication.submittedAt.toLocaleDateString('fr-FR')}\n\n` +
        `Statut: ⏳ En attente\n\n` +
        `Merci de patienter pendant que nos équipes examinent ta demande !`;
      
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Retour au menu', 'back_main')]
      ]);
      
      return await safeEditMessage(ctx, message, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown'
      });
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
    
    const message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
      `⸻\n\n` +
      `🟦 **Étape 1 : Nom de Plug**\n\n` +
      `📝 Commençons ton inscription sur SafePlugLink !\n\n` +
      `Quel est ton **nom de Plug** ?`;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('❌ Annuler', 'cancel_application')]
    ]);
    
    await safeEditMessage(ctx, message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });
    
  } catch (error) {
    console.error('Erreur dans handleStartApplication:', error);
    await ctx.answerCbQuery('❌ Erreur lors du démarrage').catch(() => {});
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
  
  try {
    switch (userForm.step) {
              case 'name':
          if (text.length < 2) {
            return await ctx.reply('❌ Le nom doit faire au moins 2 caractères. Réessaie :');
          }
          
          userForm.data.name = text;
          userForm.step = 'telegram';
          userForms.set(userId, userForm);
          
          await askTelegramReply(ctx);
          break;
        
              case 'telegram':
          if (!text.startsWith('@') && !text.includes('t.me/')) {
            return await ctx.reply('❌ Merci de fournir un username Telegram (ex: @tonusername) ou un lien Telegram. Réessaie :');
          }

          userForm.data.telegram = text;
          userForm.step = 'telegram_channel';
          userForms.set(userId, userForm);
          
          await replyWithStep(ctx, 'telegram_channel');
          break;
          
        case 'telegram_channel':
          if (!text.includes('t.me/')) {
            return await ctx.reply('❌ Merci de fournir un lien de canal Telegram valide (ex: https://t.me/username). Réessaie :');
          }

          userForm.data.telegramChannel = text;
          userForm.step = 'instagram';
          userForms.set(userId, userForm);
          
          await replyWithStep(ctx, 'instagram');
          break;
        
              case 'instagram':
          if (!text.startsWith('https://www.instagram.com/') && !text.startsWith('@')) {
            return await ctx.reply('❌ Merci de fournir un lien Instagram valide (ex: https://www.instagram.com/username ou @username). Réessaie :');
          }

          userForm.data.instagram = text;
          userForm.step = 'potato';
          userForms.set(userId, userForm);
          
          await replyWithStep(ctx, 'potato');
          break;
        
              case 'potato':
          if (!text.startsWith('https://')) {
            return await ctx.reply('❌ Merci de fournir un lien Potato valide commençant par https://. Réessaie :');
          }

          userForm.data.potato = text;
          userForm.step = 'snapchat';
          userForms.set(userId, userForm);
          
          await askSnapchat(ctx);
          break;
        
      case 'snapchat':
        if (!text.startsWith('https://')) {
          return await ctx.reply('❌ Merci de fournir un lien Snapchat valide commençant par https://. Réessaie :');
        }

        userForm.data.snapchat = text;
        userForm.step = 'whatsapp';
        
        await askWhatsApp(ctx);
        break;
        
      case 'whatsapp':
        if (!text.startsWith('https://')) {
          return await ctx.reply('❌ Merci de fournir un lien WhatsApp valide commençant par https://. Réessaie :');
        }

        userForm.data.whatsapp = text;
        userForm.step = 'signal';
        
        await askSignal(ctx);
        break;
        
      case 'signal':
        if (!text.startsWith('https://')) {
          return await ctx.reply('❌ Merci de fournir un lien Signal valide commençant par https://. Réessaie :');
        }

        userForm.data.signal = text;
        userForm.step = 'session';
        
        await askSession(ctx);
        break;
        
      case 'session':
        if (text.length < 2) {
          return await ctx.reply('❌ L\'identifiant Session doit faire au moins 2 caractères. Réessaie :');
        }

        userForm.data.session = text;
        userForm.step = 'threema';
        
        await askThreema(ctx);
        break;
        
      case 'threema':
        if (!text.startsWith('https://')) {
          return await ctx.reply('❌ Merci de fournir un lien Threema valide commençant par https://. Réessaie :');
        }

        userForm.data.threema = text;
        userForm.step = 'country';
        
        await askCountry(ctx);
        break;
        
      case 'city':
        if (text.length < 2) {
          return await ctx.reply('❌ La ville doit faire au moins 2 caractères. Réessaie :');
        }
        
        userForm.data.city = text;
        userForm.step = 'services';
        
        await askServices(ctx);
        break;
        
      case 'departments_meetup':
        if (text.length < 2) {
          return await ctx.reply('❌ Les départements doivent faire au moins 2 caractères. Réessaie :');
        }
        
        userForm.data.departmentsMeetup = text;
        
        // Si livraison est aussi sélectionné, demander les départements livraison
        if (userForm.data.services.delivery.enabled) {
          userForm.step = 'departments_delivery';
          userForms.set(userId, userForm);
          
          const message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
            `⸻\n\n` +
            `🟦 **Étape 14 : Départements pour Livraison**\n\n` +
            `🚚 Indique les départements pour la **Livraison** (ex: 75, 94...) :`;
          
          await safeEditMessage(ctx, message, { parse_mode: 'Markdown' });
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
    await ctx.reply('❌ Une erreur est survenue. Réessaie ou tape /start pour recommencer.');
  }
};

// Demander Telegram
const askTelegram = async (ctx) => {
  const message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
    `⸻\n\n` +
    `🟦 **Étape 2 : Lien Telegram**\n\n` +
    `🔗 Entrez votre lien Telegram (format : @username ou https://t.me/username)`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('❌ Annuler', 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
};

// Fonction pour générer le récapitulatif des réponses
const generateSummary = (ctx, userForm) => {
  const user = ctx.from;
  const data = userForm.data;
  
  let summary = `👤 **${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}**${user.username ? ` (@${user.username})` : ''}\n\n`;
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
};

// Fonction centralisée pour afficher les étapes avec ctx.reply (évite les conflits d'édition)
const replyWithStep = async (ctx, step) => {
  const userId = ctx.from.id;
  const userForm = userForms.get(userId);
  
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
      message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
        `${summary}` +
        `⸻\n\n` +
        `🟦 **Étape 2 : Lien Telegram**\n\n` +
        `🔗 Entrez votre lien Telegram (format : @username ou https://t.me/username)`;
      keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('❌ Annuler', 'cancel_application')]
      ]);
      break;
      
    case 'telegram_channel':
      message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
        `${summary}` +
        `⸻\n\n` +
        `🟦 **Étape 3 : Lien Canal Telegram**\n\n` +
        `🔗 Entrez le lien de votre **canal Telegram** (format : https://t.me/username)\n\n` +
        `⚠️ Tu peux aussi passer cette étape.`;
      keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('⏭️ Passer cette étape', 'skip_telegram_channel')],
        [Markup.button.callback('❌ Annuler', 'cancel_application')]
      ]);
      break;
      
    case 'instagram':
      message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
        `${summary}` +
        `⸻\n\n` +
        `🟦 **Étape 4 : Lien Instagram**\n\n` +
        `📸 Entrez votre lien Instagram (https://www.instagram.com/username)\n\n` +
        `⚠️ Tu peux aussi passer cette étape.`;
      keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('⏭️ Passer cette étape', 'skip_instagram')],
        [Markup.button.callback('❌ Annuler', 'cancel_application')]
      ]);
      break;
      
    case 'potato':
      message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
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
      message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
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
      message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
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
      message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
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
      message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
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
      message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
        `⸻\n\n` +
        `🟦 **Étapes Réseaux supplémentaires :**\n\n` +
        `Entrez votre lien **Threema** (commençant par https://)\n\n` +
        `Dernière plateforme !`;
      keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('⏭️ Passer cette étape', 'skip_threema')],
        [Markup.button.callback('❌ Annuler', 'cancel_application')]
      ]);
      break;
  }
  
  if (message) {
    const sentMessage = await ctx.reply(message, {
      reply_markup: keyboard ? keyboard.reply_markup : undefined,
      parse_mode: 'Markdown'
    });
    
    // Sauvegarder l'ID du message pour le supprimer à la prochaine étape
    lastBotMessages.set(userId, sentMessage.message_id);
  }
};

// Version reply pour éviter les conflits d'édition (supprime l'ancien message)
const askTelegramReply = async (ctx) => {
  await replyWithStep(ctx, 'telegram');
};

// Demander Canal Telegram
const askTelegramChannel = async (ctx) => {
  const message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
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
  const message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
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
  const message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
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
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('⏭️ Passer cette étape', 'skip_potato')],
    [Markup.button.callback('❌ Annuler', 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
};

// Demander Snapchat
const askSnapchat = async (ctx) => {
  const userForm = userForms.get(ctx.from.id);
  const message = `📝 **Récapitulatif de votre inscription :**\n\n` +
    `📝 Nom de Plug: ${userForm.data.name}\n` +
    `🔗 Telegram: ${userForm.data.telegram}\n\n` +
    `Entrez votre lien Snapchat (commençant par https://):`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('➡️ Passer cette étape', 'skip_snapchat')],
    [Markup.button.callback('❌ Annuler', 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
};

// Demander WhatsApp
const askWhatsApp = async (ctx) => {
  const userForm = userForms.get(ctx.from.id);
  const message = `📝 **Récapitulatif de votre inscription :**\n\n` +
    `📝 Nom de Plug: ${userForm.data.name}\n` +
    `🔗 Telegram: ${userForm.data.telegram}\n\n` +
    `Entrez votre lien WhatsApp (commençant par https://):`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('➡️ Passer cette étape', 'skip_whatsapp')],
    [Markup.button.callback('❌ Annuler', 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
};

// Demander Signal
const askSignal = async (ctx) => {
  const userForm = userForms.get(ctx.from.id);
  const message = `📝 **Récapitulatif de votre inscription :**\n\n` +
    `📝 Nom de Plug: ${userForm.data.name}\n` +
    `🔗 Telegram: ${userForm.data.telegram}\n\n` +
    `Entrez votre lien Signal (commençant par https://):`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('➡️ Passer cette étape', 'skip_signal')],
    [Markup.button.callback('❌ Annuler', 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
};

// Demander Session
const askSession = async (ctx) => {
  const userForm = userForms.get(ctx.from.id);
  const message = `📝 **Récapitulatif de votre inscription :**\n\n` +
    `📝 Nom de Plug: ${userForm.data.name}\n` +
    `🔗 Telegram: ${userForm.data.telegram}\n\n` +
    `Entrez votre identifiant Session (texte libre):`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('➡️ Passer cette étape', 'skip_session')],
    [Markup.button.callback('❌ Annuler', 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
};

// Demander Threema
const askThreema = async (ctx) => {
  const userForm = userForms.get(ctx.from.id);
  const message = `📝 **Récapitulatif de votre inscription :**\n\n` +
    `📝 Nom de Plug: ${userForm.data.name}\n` +
    `🔗 Telegram: ${userForm.data.telegram}\n\n` +
    `Entrez votre lien Threema (commençant par https://):`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('➡️ Passer cette étape', 'skip_threema')],
    [Markup.button.callback('❌ Annuler', 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
};

// Demander le pays avec boutons
const askCountry = async (ctx) => {
  const message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
    `⸻\n\n` +
    `🟦 **Étape 11 : Pays d'activité**\n\n` +
    `🌍 Dans quel pays opères-tu principalement ?`;
  
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
    Markup.button.callback('🌍 Tous les pays', 'country_all')
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
      return await ctx.answerCbQuery('❌ Pays invalide');
    }
    
    userForm.data.country = selectedCountry ? selectedCountry.name : 'Tous les pays';
    userForm.data.countryCode = countryCode;
    userForm.step = 'services';
    userForms.set(userId, userForm);
    
    await askServices(ctx);
    await ctx.answerCbQuery(`Pays sélectionné : ${userForm.data.country}`);
    
  } catch (error) {
    console.error('Erreur dans handleCountrySelection:', error);
    await ctx.answerCbQuery('❌ Erreur');
  }
};

// Demander les services
const askServices = async (ctx) => {
  const message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
    `⸻\n\n` +
    `🟦 **Étape 12 : Services proposés**\n\n` +
    `📦 Quels services proposes-tu ?\n` +
    `(Sélectionne tous ceux qui s'appliquent)\n\n` +
    `☑️ Meetup\n` +
    `☑️ Livraison\n` +
    `☑️ Envoi Postal`;
  
  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('📍 Meetup', 'service_meetup'),
      Markup.button.callback('🚚 Livraison', 'service_delivery')
    ],
    [Markup.button.callback('✈️ Envoi Postal', 'service_postal')],
    [Markup.button.callback('✅ Terminer la sélection', 'services_done')],
    [Markup.button.callback('❌ Annuler', 'cancel_application')]
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
      
      const message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
        `⸻\n\n` +
        `🟦 **Étape 13 : Départements pour Meetup**\n\n` +
        `📍 Indique les départements pour le **Meetup** (ex: 75, 92, 93) :`;
      
      await safeEditMessage(ctx, message, { parse_mode: 'Markdown' });
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
  const message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
    `⸻\n\n` +
    `🟦 **Étape 15 : Envoi du logo**\n\n` +
    `🖼️ Envoie ton **logo** (obligatoire pour finaliser ton inscription)\n\n` +
    `⚠️ Tu peux envoyer une image ici.`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('❌ Annuler', 'cancel_application')]
  ]);
  
  await safeEditMessage(ctx, message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
};

// Demander la confirmation
const askConfirmation = async (ctx) => {
  const userForm = userForms.get(ctx.from.id);
  const message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
    `⸻\n\n` +
    `🟢 **Étape 16 : Confirmation**\n\n` +
    `✅ Voici le récapitulatif final :\n\n` +
    `• Nom de Plug : ${userForm.data.name}\n` +
    `• Telegram : ${userForm.data.telegram}\n` +
    `• Pays : ${userForm.data.country}\n` +
    `• Services : ${getServicesText(userForm.data.services)}\n` +
    `${userForm.data.departmentsMeetup ? `• Meetup : ${userForm.data.departmentsMeetup}\n` : ''}` +
    `${userForm.data.departmentsDelivery ? `• Livraison : ${userForm.data.departmentsDelivery}\n` : ''}` +
    `• Logo : ✔️ Reçu\n\n` +
    `Confirmer l'inscription ?`;
  
  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Confirmer', 'confirm_application'),
      Markup.button.callback('❌ Annuler', 'cancel_application')
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
    
    // Sauvegarder les infos de la photo
    userForm.data.photo = {
      fileId: photo.file_id,
      fileSize: photo.file_size,
      width: photo.width,
      height: photo.height
    };
    
    userForm.step = 'confirmation';
    userForms.set(userId, userForm);
    
    // Confirmer réception et passer à la confirmation
    await ctx.reply('✅ Photo reçue !');
    
    // Passer à l'étape de confirmation
    await askConfirmation(ctx);
    
  } catch (error) {
    console.error('Erreur dans handlePhoto:', error);
    await ctx.reply('❌ Erreur lors du traitement de la photo. Réessaie.');
  }
};

// Gestionnaires pour passer les étapes
const handleSkipStep = async (ctx, step) => {
  try {
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm) {
      return await ctx.answerCbQuery('❌ Erreur de formulaire');
    }
    
    // Passer à l'étape suivante
    switch (step) {
      case 'telegram':
        userForm.step = 'telegram_channel';
        userForms.set(userId, userForm);
        await replyWithStep(ctx, 'telegram_channel');
        break;
      case 'telegram_channel':
        userForm.step = 'instagram';
        userForms.set(userId, userForm);
        await replyWithStep(ctx, 'instagram');
        break;
      case 'instagram':
        userForm.step = 'potato';
        userForms.set(userId, userForm);
        await replyWithStep(ctx, 'potato');
        break;
      case 'potato':
        userForm.step = 'snapchat';
        userForms.set(userId, userForm);
        await replyWithStep(ctx, 'snapchat');
        break;
      case 'snapchat':
        userForm.step = 'whatsapp';
        userForms.set(userId, userForm);
        await replyWithStep(ctx, 'whatsapp');
        break;
      case 'whatsapp':
        userForm.step = 'signal';
        userForms.set(userId, userForm);
        await replyWithStep(ctx, 'signal');
        break;
      case 'signal':
        userForm.step = 'session';
        userForms.set(userId, userForm);
        await replyWithStep(ctx, 'session');
        break;
      case 'session':
        userForm.step = 'threema';
        userForms.set(userId, userForm);
        await replyWithStep(ctx, 'threema');
        break;
      case 'threema':
        userForm.step = 'country';
        userForms.set(userId, userForm);
        await askCountry(ctx);
        break;
    }
    
    await ctx.answerCbQuery('Étape passée');
    
  } catch (error) {
    console.error('Erreur dans handleSkipStep:', error);
    await ctx.answerCbQuery('❌ Erreur');
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
        city: userForm.data.city
      },
      hasPhoto: !!userForm.data.photo
    });

    // Créer la demande en base
    const application = new PlugApplication({
      userId: userForm.data.userId,
      username: userForm.data.username,
      firstName: userForm.data.firstName,
      lastName: userForm.data.lastName,
      name: userForm.data.name,
      description: userForm.data.description,
      location: {
        country: userForm.data.country,
        city: userForm.data.city
      },
      services: servicesArray, // Format array au lieu d'object
      contact: {
        telegram: userForm.data.telegram,
        instagram: userForm.data.instagram,
        potato: userForm.data.potato,
        snapchat: userForm.data.snapchat,
        whatsapp: userForm.data.whatsapp,
        signal: userForm.data.signal,
        session: userForm.data.session,
        threema: userForm.data.threema,
        other: ''
      },
      photo: userForm.data.photo || null,
      photoUrl: userForm.data.photo ? userForm.data.photo.fileId : null
    });
    
    console.log('📋 SUBMIT DEBUG: Attempting to save application...');
    await application.save();
    console.log('✅ SUBMIT DEBUG: Application saved successfully with ID:', application._id);
    
    // Envoyer notification à l'admin
    const adminId = process.env.ADMIN_TELEGRAM_ID || '7670522278'; // ID de l'admin
    try {
      // Récupérer l'instance du bot depuis le contexte global ou les paramètres
      const bot = ctx.telegram ? { telegram: ctx.telegram } : global.bot;
      if (bot) {
        await sendAdminNotification(bot, application, adminId);
      }
    } catch (notificationError) {
      console.error('⚠️ Erreur notification admin:', notificationError.message);
      // Ne pas faire échouer la soumission pour une erreur de notification
    }
    
    // Nettoyer le formulaire
    userForms.delete(userId);
    lastBotMessages.delete(userId);
    
    const photoText = userForm.data.photo ? '✅ Photo incluse' : '⚠️ Aucune photo';
    
    const message = `🛠️ **FORMULAIRE D'INSCRIPTION – SafePlugLink**\n\n` +
      `⸻\n\n` +
      `🟩 **ÉTAPE FINALE**\n\n` +
      `🎉 Formulaire reçu !\n\n` +
      `📌 Pour valider ton inscription :\n\n` +
      `1️⃣ Poste le logo **SafePlugLink** sur un de tes réseaux renseignés avec le texte :\n` +
      `"Inscription en cours chez **@SafePlugLink**"\n` +
      `et identifie **@safepluglink**\n\n` +
      `2️⃣ Envoie une photo de ton stock avec\n` +
      `**SafePlugLink** et la **date du jour** écrits sur papier\n` +
      `à l'admin : @safepluglink_admin\n\n` +
      `⏰ Tu as **24h** pour faire ces 2 étapes.\n\n` +
      `ℹ️ La pré-approbation peut prendre 24 à 48h.\n` +
      `Tu seras notifié automatiquement de la décision.`;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Retour au menu', 'back_main')]
    ]);
    
    // Utiliser editMessageText simple sans image pour éviter les problèmes
    try {
      await ctx.editMessageText(message, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown'
      });
    } catch (editError) {
      // Fallback: nouveau message si édition impossible
      await ctx.reply(message, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown'
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
    
    const message = `❌ **Demande annulée**\n\n` +
      `Ta demande d'inscription a été annulée.\n\n` +
      `Tu peux recommencer quand tu veux !`;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Retour au menu', 'back_main')]
    ]);
    
    await safeEditMessage(ctx, message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    }, true); // Afficher avec l'image d'accueil
    
    await ctx.answerCbQuery('Demande annulée');
    
  } catch (error) {
    console.error('Erreur dans handleCancelApplication:', error);
    await ctx.answerCbQuery('❌ Erreur');
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
  userForms,
  lastBotMessages
};