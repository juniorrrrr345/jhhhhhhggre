const { Markup } = require('telegraf');

// Envoyer une notification d'approbation
const sendApprovalNotification = async (bot, application) => {
  try {
    const message = `🎉 **Félicitations !**\n\n` +
      `Ta demande d'inscription en tant que plug **"${application.name}"** a été approuvée !\n\n` +
      `✅ **Tu es maintenant un plug officiel !**\n\n` +
      `📋 **Détails :**\n` +
      `• **Nom :** ${application.name}\n` +
      `• **Localisation :** ${application.location.city}, ${application.location.country}\n` +
      `• **Services :** ${getServicesText(application.services)}\n\n` +
      `🚀 **Prochaines étapes :**\n` +
      `• Tu apparaîtras bientôt dans la liste des plugs\n` +
      `• Les utilisateurs pourront te contacter via ${application.contact.telegram}\n` +
      `• Assure-toi d'être disponible pour répondre aux demandes\n\n` +
      `Merci de rejoindre notre communauté ! 💪`;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🔌 Voir tous les plugs', 'top_plugs')],
      [Markup.button.callback('🔙 Menu principal', 'back_main')]
    ]);

    await bot.telegram.sendMessage(application.userId, message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });

    console.log(`✅ Notification d'approbation envoyée à ${application.userId}`);
  } catch (error) {
    console.error('❌ Erreur notification approbation:', error);
  }
};

// Envoyer une notification de rejet
const sendRejectionNotification = async (bot, application, reason = '') => {
  try {
    const message = `❌ **Demande non approuvée**\n\n` +
      `Nous regrettons de t'informer que ta demande d'inscription en tant que plug **"${application.name}"** n'a pas été approuvée.\n\n` +
      `📋 **Détails de la demande :**\n` +
      `• **Nom :** ${application.name}\n` +
      `• **Localisation :** ${application.location.city}, ${application.location.country}\n` +
      `• **Services :** ${getServicesText(application.services)}\n\n` +
      (reason ? `📝 **Raison :** ${reason}\n\n` : '') +
      `🔄 **Tu peux :**\n` +
      `• Modifier ton approche et soumettre une nouvelle demande\n` +
      `• Nous contacter pour plus d'informations\n\n` +
      `Merci pour ton intérêt ! 🙏`;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('💼 Nouvelle demande', 'start_application')],
      [Markup.button.callback('📞 Contact', 'contact')],
      [Markup.button.callback('🔙 Menu principal', 'back_main')]
    ]);

    await bot.telegram.sendMessage(application.userId, message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });

    console.log(`✅ Notification de rejet envoyée à ${application.userId}`);
  } catch (error) {
    console.error('❌ Erreur notification rejet:', error);
  }
};

// Fonction utilitaire pour formater les services
const getServicesText = (services) => {
  const servicesList = [];
  if (services.includes('delivery')) servicesList.push('Livraison');
  if (services.includes('meetup')) servicesList.push('Meetup');
  if (services.includes('postal')) servicesList.push('Envoi postal');
  return servicesList.length > 0 ? servicesList.join(', ') : 'Aucun service spécifié';
};

// Envoyer notification à l'admin d'une nouvelle demande
const sendAdminNotification = async (bot, application, adminId) => {
  try {
    const message = `🔔 **Nouvelle demande d'inscription !**\n\n` +
      `👤 **Utilisateur :** ${application.firstName} ${application.lastName}\n` +
      `📱 **Username :** @${application.username || 'Non spécifié'}\n` +
      `🏪 **Nom du plug :** ${application.name}\n` +
      `📍 **Localisation :** ${application.location.city}, ${application.location.country}\n` +
      `🛠️ **Services :** ${getServicesText(application.services)}\n` +
      `📞 **Contact :** ${application.contact.telegram}\n\n` +
      `💡 Rendez-vous sur le panel admin pour traiter cette demande.`;

    // Pas de bouton panel admin - juste le message texte
    await bot.telegram.sendMessage(adminId, message, {
      parse_mode: 'Markdown'
    });

    console.log(`✅ Notification admin envoyée pour demande ${application._id}`);
  } catch (error) {
    console.error('❌ Erreur notification admin:', error);
  }
};

module.exports = {
  sendApprovalNotification,
  sendRejectionNotification,
  sendAdminNotification,
  getServicesText
};