const { Markup } = require('telegraf');

// Gestionnaire pour le bouton Réseaux Sociaux
const handleSocialMedia = async (ctx) => {
  try {
    // Confirmer immédiatement la callback pour éviter le loading
    await ctx.answerCbQuery();

    // Message d'introduction
    const message = `📱 **Réseaux Sociaux**\n\nRejoignez notre communauté sur nos différents réseaux sociaux ! 🚀`;

    // Boutons des réseaux sociaux - SIMPLE ET DIRECT
    const socialButtons = [
      [Markup.button.url('📱 Telegram', 'https://t.me/+zcP68c4M_3NlM2Y0')],
      [Markup.button.url('📞 Contact', 'https://t.me/findyourplugsav')],
      [Markup.button.callback('🔙 Retour au menu', 'back_main')]
    ];
    
    const keyboard = Markup.inlineKeyboard(socialButtons);

    await ctx.editMessageText(message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });

  } catch (error) {
    console.error('Erreur dans handleSocialMedia:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement').catch(() => {});
  }
};

module.exports = {
  handleSocialMedia
};