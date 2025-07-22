const PlugApplication = require('../models/PlugApplication');
const { Markup } = require('telegraf');

// Stockage temporaire des données du formulaire par utilisateur
const userForms = new Map();

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
      
      return await ctx.editMessageText(message, {
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
    
    await ctx.editMessageText(message, {
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
    
    await ctx.editMessageText(message, {
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
    
    await ctx.editMessageText(message, { parse_mode: 'Markdown' });
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
    `Cette étape est optionnelle.`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📸 Ajouter une photo', 'add_photo')],
    [Markup.button.callback('⏭️ Passer cette étape', 'skip_photo')],
    [Markup.button.callback('❌ Annuler', 'cancel_application')]
  ]);
  
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
    // Récupérer l'ID de la photo la plus grande
    const photos = ctx.message.photo;
    const photo = photos[photos.length - 1];
    
    userForm.data.photo = photo.file_id;
    userForms.set(userId, userForm);
    
    await submitApplication(ctx);
    
  } catch (error) {
    console.error('Erreur dans handlePhoto:', error);
    await ctx.reply('❌ Erreur lors du traitement de la photo. Réessaie.');
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
      photo: userForm.data.photo || ''
    });
    
    await application.save();
    
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
    
    await ctx.editMessageText(message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });
    
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
    
    await ctx.editMessageText(message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });
    
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