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
    // Construction du message détaillé
    let message = `🔔 **NOUVELLE DEMANDE D'INSCRIPTION**\n\n`;
    message += `⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻\n\n`;
    
    // Informations utilisateur
    message += `👤 **INFORMATIONS UTILISATEUR**\n`;
    message += `├ Nom : ${application.firstName} ${application.lastName}\n`;
    message += `├ Username : @${application.username || 'Non spécifié'}\n`;
    message += `└ ID : ${application.userId}\n\n`;
    
    // Informations du plug
    message += `🏪 **INFORMATIONS DU PLUG**\n`;
    message += `├ Nom : ${application.name}\n`;
    message += `├ Description : ${application.description}\n`;
    message += `├ Ville : ${application.location.city}\n`;
    message += `└ Pays : ${application.countries && application.countries.length > 0 ? application.countries.join(', ') : application.location.country}\n\n`;
    
    // Services proposés avec détails
    message += `🛠️ **SERVICES PROPOSÉS**\n`;
    const services = application.services || [];
    
    if (services.includes('meetup')) {
      message += `\n🤝 **Meet Up :**\n`;
      if (application.departments?.meetup) {
        message += `${application.departments.meetup}\n`;
      } else {
        message += `Aucun département spécifié\n`;
      }
    }
    
    if (services.includes('shipping')) {
      message += `\n📮 **Envoi postal :**\n`;
      if (application.departments?.shipping) {
        message += `${application.departments.shipping}\n`;
      } else {
        message += `✅ Validation automatique\n`;
      }
    }
    
    if (services.includes('delivery')) {
      message += `\n🚚 **Livraison :**\n`;
      if (application.departments?.delivery) {
        message += `${application.departments.delivery}\n`;
      } else {
        message += `Aucun département spécifié\n`;
      }
    }
    
    // Contacts et réseaux sociaux
    message += `\n📱 **CONTACTS ET RÉSEAUX SOCIAUX**\n`;
    message += `├ Telegram : ${application.contact.telegram}\n`;
    if (application.contact.telegramChannel) message += `├ Canal Telegram : ${application.contact.telegramChannel}\n`;
    if (application.contact.telegramBot) message += `├ Bot Telegram : ${application.contact.telegramBot}\n`;
    if (application.contact.instagram) message += `├ Instagram : ${application.contact.instagram}\n`;
    if (application.contact.snapchat) message += `├ Snapchat : ${application.contact.snapchat}\n`;
    if (application.contact.potato) message += `├ Potato : ${application.contact.potato}\n`;
    if (application.contact.whatsapp) message += `├ WhatsApp : ${application.contact.whatsapp}\n`;
    if (application.contact.signal) message += `├ Signal : ${application.contact.signal}\n`;
    if (application.contact.session) message += `├ Session : ${application.contact.session}\n`;
    if (application.contact.threema) message += `└ Threema : ${application.contact.threema}\n`;
    
    // Photo
    message += `\n📸 **PHOTO DU PLUG**\n`;
    message += application.photo ? `✅ Photo fournie (ID: ${application.photo})\n` : `❌ Aucune photo fournie\n`;
    
    // Date et statut
    message += `\n📅 **INFORMATIONS SUPPLÉMENTAIRES**\n`;
    message += `├ Date de soumission : ${new Date(application.submittedAt).toLocaleString('fr-FR')}\n`;
    message += `└ Statut : ${application.status === 'pending' ? '⏳ En attente' : application.status}\n`;
    
    message += `\n⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻\n`;
    message += `\n💡 **Rendez-vous sur le panel admin pour traiter cette demande.**`;

    // Envoyer le message avec la photo si disponible
    if (application.photo) {
      try {
        await bot.telegram.sendPhoto(adminId, application.photo, {
          caption: message,
          parse_mode: 'Markdown'
        });
      } catch (photoError) {
        // Si l'envoi avec photo échoue, envoyer sans photo
        await bot.telegram.sendMessage(adminId, message, {
          parse_mode: 'Markdown'
        });
      }
    } else {
      await bot.telegram.sendMessage(adminId, message, {
        parse_mode: 'Markdown'
      });
    }

    console.log(`✅ Notification admin détaillée envoyée pour demande ${application._id} à l'admin ${adminId}`);
  } catch (error) {
    console.error(`❌ Erreur notification admin pour ${adminId}:`, error.message);
    console.error('Détails de l\'erreur:', {
      code: error.code,
      description: error.description,
      adminId: adminId,
      applicationId: application._id
    });
    throw error; // Re-lancer l'erreur pour qu'elle soit capturée dans applicationHandler
  }
};

module.exports = {
  sendApprovalNotification,
  sendRejectionNotification,
  sendAdminNotification,
  getServicesText
};