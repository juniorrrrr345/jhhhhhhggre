const PlugApplication = require('../models/PlugApplication');
const { Markup } = require('telegraf');

// Gestionnaire pour vérifier le statut d'une demande
const handleCheckApplicationStatus = async (ctx) => {
  try {
    await ctx.answerCbQuery();
    
    const userId = ctx.from.id;
    
    // Chercher une demande pour cet utilisateur
    const application = await PlugApplication.findOne({ 
      userId: userId 
    }).sort({ createdAt: -1 }); // La plus récente
    
    if (!application) {
      const message = `📋 **Aucune demande trouvée**\n\n` +
        `Tu n'as actuellement aucune demande d'inscription en cours.\n\n` +
        `💼 Veux-tu devenir plug ? Clique sur le bouton ci-dessous !`;
      
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('💼 Devenir Plug', 'start_application')],
        [Markup.button.callback('🔙 Retour au menu', 'back_main')]
      ]);
      
      await ctx.editMessageText(message, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown'
      });
      return;
    }
    
    // Afficher le statut de la demande
    let statusText = '';
    let statusEmoji = '';
    let actions = [];
    
    switch (application.status) {
      case 'pending':
        statusEmoji = '⏳';
        statusText = 'En cours d\'examen';
        actions = [
          [Markup.button.callback('❌ Annuler ma demande', `cancel_my_application_${application._id}`)],
          [Markup.button.callback('🔄 Actualiser', 'check_application_status')],
          [Markup.button.callback('🔙 Retour au menu', 'back_main')]
        ];
        break;
      case 'approved':
        statusEmoji = '✅';
        statusText = 'Approuvée - Tu es maintenant un plug !';
        actions = [
          [Markup.button.callback('🔌 Voir tous les plugs', 'top_plugs')],
          [Markup.button.callback('🔙 Retour au menu', 'back_main')]
        ];
        break;
      case 'rejected':
        statusEmoji = '❌';
        statusText = 'Non approuvée';
        actions = [
          [Markup.button.callback('💼 Nouvelle demande', 'start_application')],
          [Markup.button.callback('📞 Contact', 'contact')],
          [Markup.button.callback('🔙 Retour au menu', 'back_main')]
        ];
        break;
    }
    
    const message = `📋 **Statut de ta demande**\n\n` +
      `${statusEmoji} **Statut :** ${statusText}\n\n` +
      `📋 **Détails de ta demande :**\n` +
      `• **Nom :** ${application.name}\n` +
      `• **Localisation :** ${application.location.city}, ${application.location.country}\n` +
      `• **Services :** ${getServicesText(application.services)}\n` +
      `• **Date de soumission :** ${application.createdAt.toLocaleDateString('fr-FR')}\n\n` +
      (application.adminNotes ? `📝 **Notes admin :** ${application.adminNotes}\n\n` : '') +
      (application.status === 'pending' ? 
        `⏳ **En attente de validation par nos équipes.**\n` +
        `Tu recevras une notification dès que ta demande sera traitée.` : '');
    
    const keyboard = Markup.inlineKeyboard(actions);
    
    await ctx.editMessageText(message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });
    
  } catch (error) {
    console.error('Erreur dans handleCheckApplicationStatus:', error);
    await ctx.answerCbQuery('❌ Erreur lors de la vérification').catch(() => {});
  }
};

// Gestionnaire pour annuler une demande
const handleCancelMyApplication = async (ctx) => {
  try {
    const callbackData = ctx.callbackQuery.data;
    const applicationId = callbackData.replace('cancel_my_application_', '');
    
    await ctx.answerCbQuery();
    
    const userId = ctx.from.id;
    
    // Vérifier que l'application appartient bien à cet utilisateur
    const application = await PlugApplication.findOne({
      _id: applicationId,
      userId: userId,
      status: 'pending' // On ne peut annuler que les demandes en attente
    });
    
    if (!application) {
      await ctx.editMessageText(
        `❌ **Erreur**\n\nCette demande n'existe pas ou ne peut plus être annulée.`,
        {
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback('🔄 Vérifier le statut', 'check_application_status')],
            [Markup.button.callback('🔙 Retour au menu', 'back_main')]
          ]).reply_markup,
          parse_mode: 'Markdown'
        }
      );
      return;
    }
    
    // Afficher confirmation d'annulation
    const message = `⚠️ **Confirmer l'annulation**\n\n` +
      `Es-tu sûr de vouloir annuler ta demande d'inscription ?\n\n` +
      `📋 **Demande à annuler :**\n` +
      `• **Nom :** ${application.name}\n` +
      `• **Localisation :** ${application.location.city}, ${application.location.country}\n` +
      `• **Date :** ${application.createdAt.toLocaleDateString('fr-FR')}\n\n` +
      `⚠️ **Cette action est irréversible !**\n` +
      `Tu devras refaire une nouvelle demande si tu changes d'avis.`;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('✅ Oui, annuler', `confirm_cancel_${applicationId}`)],
      [Markup.button.callback('❌ Non, garder ma demande', 'check_application_status')],
      [Markup.button.callback('🔙 Retour au menu', 'back_main')]
    ]);
    
    await ctx.editMessageText(message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });
    
  } catch (error) {
    console.error('Erreur dans handleCancelMyApplication:', error);
    await ctx.answerCbQuery('❌ Erreur lors de l\'annulation').catch(() => {});
  }
};

// Gestionnaire pour confirmer l'annulation
const handleConfirmCancel = async (ctx) => {
  try {
    const callbackData = ctx.callbackQuery.data;
    const applicationId = callbackData.replace('confirm_cancel_', '');
    
    await ctx.answerCbQuery();
    
    const userId = ctx.from.id;
    
    // Supprimer la demande
    const result = await PlugApplication.findOneAndDelete({
      _id: applicationId,
      userId: userId,
      status: 'pending'
    });
    
    if (!result) {
      await ctx.editMessageText(
        `❌ **Erreur**\n\nCette demande n'existe plus ou ne peut pas être annulée.`,
        {
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback('🔙 Retour au menu', 'back_main')]
          ]).reply_markup,
          parse_mode: 'Markdown'
        }
      );
      return;
    }
    
    // Confirmer l'annulation
    const message = `✅ **Demande annulée**\n\n` +
      `Ta demande d'inscription pour **"${result.name}"** a été annulée avec succès.\n\n` +
      `💼 Tu peux soumettre une nouvelle demande à tout moment !`;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('💼 Nouvelle demande', 'start_application')],
      [Markup.button.callback('🔙 Retour au menu', 'back_main')]
    ]);
    
    await ctx.editMessageText(message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });
    
    console.log(`✅ Demande ${applicationId} annulée par l'utilisateur ${userId}`);
    
  } catch (error) {
    console.error('Erreur dans handleConfirmCancel:', error);
    await ctx.answerCbQuery('❌ Erreur lors de l\'annulation').catch(() => {});
  }
};

// Fonction utilitaire pour formater les services
const getServicesText = (services) => {
  const servicesList = [];
  
  // Gérer les deux formats possibles : array et object
  if (Array.isArray(services)) {
    // Format array (nouvelles applications)
    if (services.includes('delivery')) servicesList.push('Livraison');
    if (services.includes('postal')) servicesList.push('Envoi postal');
    if (services.includes('meetup')) servicesList.push('Meetup');
  } else if (services && typeof services === 'object') {
    // Format object (anciennes applications)
    if (services.delivery?.enabled) servicesList.push('Livraison');
    if (services.postal?.enabled) servicesList.push('Envoi postal');
    if (services.meetup?.enabled) servicesList.push('Meetup');
  }
  
  return servicesList.length > 0 ? servicesList.join(', ') : 'Aucun service spécifié';
};

module.exports = {
  handleCheckApplicationStatus,
  handleCancelMyApplication,
  handleConfirmCancel,
  getServicesText
};