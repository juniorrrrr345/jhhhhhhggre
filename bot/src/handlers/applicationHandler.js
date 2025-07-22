const PlugApplication = require('../models/PlugApplication');
const { Markup } = require('telegraf');
const { sendAdminNotification } = require('./notificationHandler');

// Stockage temporaire des données du formulaire par utilisateur
const userForms = new Map();

// Fonction utilitaire pour éditer les messages avec gestion des images d'accueil
const safeEditMessage = async (ctx, message, options = {}, keepWelcomeImage = false) => {
  if (keepWelcomeImage) {
    // Récupérer la config pour l'image d'accueil
    const Config = require('../models/Config');
    const config = await Config.findById('main');
    const welcomeImage = config?.welcome?.image;
    
    if (welcomeImage) {
      try {
        await ctx.editMessageMedia({
          type: 'photo',
          media: welcomeImage,
          caption: message,
          parse_mode: options.parse_mode || 'Markdown'
        }, {
          reply_markup: options.reply_markup
        });
        return;
      } catch (editError) {
        // Si erreur édition image, continuer avec le texte simple
        console.log('⚠️ Édition image échouée, fallback texte');
      }
    }
  }
  
  try {
    await ctx.editMessageText(message, options);
  } catch (editError) {
    // Si erreur (message avec image), supprimer et envoyer un nouveau message
    if (editError.description && editError.description.includes('no text in the message to edit')) {
      await ctx.deleteMessage().catch(() => {});
      await ctx.reply(message, options);
    } else {
      throw editError;
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
    
    const message = `💼 **Devenir Plug**\n\n` +
      `Bienvenue ! Je vais t'accompagner pour créer ta demande d'inscription en tant que plug.\n\n` +
      `📋 **Étapes du formulaire :**\n` +
      `1️⃣ Nom du plug\n` +
      `2️⃣ Description des services\n` +
      `3️⃣ Localisation (Pays/Ville)\n` +
      `4️⃣ Services proposés\n` +
      `5️⃣ Contact Telegram\n` +
      `6️⃣ Photo (optionnelle)\n\n` +
      `**Étape 1/6 : Nom du plug**\n\n` +
      `Comment veux-tu appeler ton plug ?\n` +
      `Écris le nom de ton plug :`;
    
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
  
  try {
    switch (userForm.step) {
      case 'name':
        if (text.length < 2) {
          return await ctx.reply('❌ Le nom doit faire au moins 2 caractères. Réessaie :');
        }
        
        userForm.data.name = text;
        userForm.step = 'description';
        
        const descMessage = `✅ Nom enregistré : **${text}**\n\n` +
          `**Étape 2/6 : Description**\n\n` +
          `Décris les services que tu proposes.\n` +
          `Exemple : "Livraison rapide dans toute la ville, envoi postal sécurisé vers l'Europe"`;
        
        await ctx.reply(descMessage, { parse_mode: 'Markdown' });
        break;
        
      case 'description':
        if (text.length < 10) {
          return await ctx.reply('❌ La description doit faire au moins 10 caractères. Réessaie :');
        }
        
        userForm.data.description = text;
        userForm.step = 'country';
        
        const countryMessage = `✅ Description enregistrée\n\n` +
          `**Étape 3/6 : Localisation**\n\n` +
          `Dans quel pays te trouves-tu ?\n` +
          `Exemple : France, Belgique, Suisse...`;
        
        await ctx.reply(countryMessage, { parse_mode: 'Markdown' });
        break;
        
      case 'country':
        if (text.length < 2) {
          return await ctx.reply('❌ Le pays doit faire au moins 2 caractères. Réessaie :');
        }
        
        userForm.data.country = text;
        userForm.step = 'city';
        
        const cityMessage = `✅ Pays enregistré : **${text}**\n\n` +
          `Dans quelle ville te trouves-tu ?\n` +
          `Exemple : Paris, Bruxelles, Genève...`;
        
        await ctx.reply(cityMessage, { parse_mode: 'Markdown' });
        break;
        
      case 'city':
        if (text.length < 2) {
          return await ctx.reply('❌ La ville doit faire au moins 2 caractères. Réessaie :');
        }
        
        userForm.data.city = text;
        userForm.step = 'services';
        
        await askServices(ctx);
        break;
        
      case 'telegram':
        if (!text.startsWith('@') && !text.includes('t.me/')) {
          return await ctx.reply('❌ Merci de fournir un username Telegram (ex: @tonusername) ou un lien Telegram. Réessaie :');
        }
        
        userForm.data.telegram = text;
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

// Demander les services
const askServices = async (ctx) => {
  const message = `✅ Ville enregistrée\n\n` +
    `**Étape 4/6 : Services proposés**\n\n` +
    `Quels services proposes-tu ? (Tu peux en choisir plusieurs)`;
  
  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('🚚 Livraison', 'service_delivery'),
      Markup.button.callback('✈️ Envoi postal', 'service_postal')
    ],
    [Markup.button.callback('🏠 Meetup', 'service_meetup')],
    [Markup.button.callback('✅ Continuer', 'services_done')],
    [Markup.button.callback('❌ Annuler', 'cancel_application')]
  ]);
  
  await ctx.reply(message, {
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
    let servicesText = '**Services sélectionnés :**\n';
    
    if (services.delivery.enabled) servicesText += '✅ 🚚 Livraison\n';
    if (services.postal.enabled) servicesText += '✅ ✈️ Envoi postal\n';
    if (services.meetup.enabled) servicesText += '✅ 🏠 Meetup\n';
    
    if (!services.delivery.enabled && !services.postal.enabled && !services.meetup.enabled) {
      servicesText += '➡️ Aucun service sélectionné';
    }
    
    const message = `**Étape 4/6 : Services proposés**\n\n` +
      `Quels services proposes-tu ? (Tu peux en choisir plusieurs)\n\n` +
      servicesText;
    
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback(
          services.delivery.enabled ? '✅ Livraison' : '🚚 Livraison',
          'service_delivery'
        ),
        Markup.button.callback(
          services.postal.enabled ? '✅ Envoi postal' : '✈️ Envoi postal',
          'service_postal'
        )
      ],
      [
        Markup.button.callback(
          services.meetup.enabled ? '✅ Meetup' : '🏠 Meetup',
          'service_meetup'
        )
      ],
      [Markup.button.callback('✅ Continuer', 'services_done')],
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

// Terminer les services et passer au contact
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
    
    userForm.step = 'telegram';
    userForms.set(userId, userForm);
    
    const message = `✅ Services enregistrés\n\n` +
      `**Étape 5/6 : Contact Telegram**\n\n` +
      `Quel est ton username Telegram pour te contacter ?\n` +
      `Exemple : @tonusername ou https://t.me/tonusername`;
    
    await safeEditMessage(ctx, message, { parse_mode: 'Markdown' });
    await ctx.answerCbQuery();
    
  } catch (error) {
    console.error('Erreur dans handleServicesDone:', error);
    await ctx.answerCbQuery('❌ Erreur');
  }
};

// Demander la photo
const askPhoto = async (ctx) => {
  const message = `✅ Contact enregistré\n\n` +
    `**Étape 6/6 : Photo (optionnelle)**\n\n` +
    `Tu peux envoyer une photo de profil ou de tes services.\n` +
    `Cette étape est optionnelle.\n\n` +
    `📱 **Comment envoyer une photo :**\n` +
    `• Clique sur le trombone 📎 dans Telegram\n` +
    `• Sélectionne "Galerie" ou "Appareil photo"\n` +
    `• Choisis ta photo et envoie-la\n\n` +
    `Ou utilise les boutons ci-dessous :`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('⏭️ Passer cette étape', 'skip_photo')],
    [Markup.button.callback('❌ Annuler', 'cancel_application')]
  ]);
  
  // Supprimer le message précédent pour éviter les bugs avec images
  try {
    await ctx.deleteMessage().catch(() => {});
  } catch (e) {}
  
  // Envoyer un nouveau message texte simple
  await ctx.reply(message, {
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
};

// Gérer la photo
const handlePhoto = async (ctx) => {
  const userId = ctx.from.id;
  const userForm = userForms.get(userId);
  
  if (!userForm || userForm.step !== 'photo') {
    return;
  }
  
  try {
    // Vérifier que c'est bien une photo
    if (!ctx.message.photo || !Array.isArray(ctx.message.photo)) {
      await ctx.reply('❌ Veuillez envoyer une photo valide.');
      return;
    }
    
    // Récupérer l'ID de la photo la plus grande (meilleure qualité)
    const photos = ctx.message.photo;
    const photo = photos[photos.length - 1];
    
    if (!photo || !photo.file_id) {
      await ctx.reply('❌ Erreur lors de la récupération de la photo. Réessaie.');
      return;
    }
    
    // Sauvegarder l'ID de la photo et générer l'URL
    userForm.data.photo = photo.file_id;
    
    // Générer l'URL de la photo pour l'admin panel
    try {
      const fileLink = await ctx.telegram.getFileLink(photo.file_id);
      userForm.data.photoUrl = fileLink.href;
      console.log('📸 URL photo générée:', fileLink.href);
    } catch (urlError) {
      console.warn('⚠️ Impossible de générer l\'URL photo:', urlError.message);
      userForm.data.photoUrl = null;
    }
    
    userForms.set(userId, userForm);
    
    // Confirmer la réception
    await ctx.reply('✅ Photo reçue avec succès !');
    
    // Soumettre la demande
    await submitApplication(ctx);
    
  } catch (error) {
    console.error('Erreur dans handlePhoto:', error);
    await ctx.reply('❌ Erreur lors du traitement de la photo. Réessaie ou passe cette étape.');
  }
};

// Passer la photo
const handleSkipPhoto = async (ctx) => {
  await ctx.answerCbQuery();
  await submitApplication(ctx);
};

// Soumettre la demande
const submitApplication = async (ctx) => {
  try {
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm) {
      return;
    }
    
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
      services: userForm.data.services,
      contact: {
        telegram: userForm.data.telegram,
        other: ''
      },
      photo: userForm.data.photo || '',
      photoUrl: userForm.data.photoUrl || null
    });
    
    await application.save();
    
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
    
    const message = `🎉 **Demande soumise avec succès !**\n\n` +
      `Merci ${userForm.data.firstName} !\n\n` +
      `Ta demande d'inscription en tant que plug a été envoyée à nos équipes.\n\n` +
      `📋 **Récapitulatif :**\n` +
      `• **Nom :** ${userForm.data.name}\n` +
      `• **Localisation :** ${userForm.data.city}, ${userForm.data.country}\n` +
      `• **Services :** ${getServicesText(userForm.data.services)}\n\n` +
      `⏳ Tu recevras une réponse dans les prochains jours.\n\n` +
      `Merci pour ta patience !`;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Retour au menu', 'back_main')]
    ]);
    
    await safeEditMessage(ctx, message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    }, true); // Afficher avec l'image d'accueil
    
  } catch (error) {
    console.error('Erreur dans submitApplication:', error);
    await ctx.reply('❌ Erreur lors de la soumission. Réessaie plus tard.');
  }
};

// Annuler la demande
const handleCancelApplication = async (ctx) => {
  try {
    const userId = ctx.from.id;
    userForms.delete(userId);
    
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
  if (services.delivery.enabled) servicesList.push('Livraison');
  if (services.postal.enabled) servicesList.push('Envoi postal');
  if (services.meetup.enabled) servicesList.push('Meetup');
  return servicesList.join(', ');
};

module.exports = {
  handleStartApplication,
  handleFormMessage,
  handleServiceToggle,
  handleServicesDone,
  handlePhoto,
  handleSkipPhoto,
  handleCancelApplication,
  userForms
};