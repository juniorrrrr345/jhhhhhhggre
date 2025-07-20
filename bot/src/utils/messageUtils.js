// Utilitaires pour la gestion des messages Telegram

/**
 * Édite un message de manière robuste en gérant les différents types (texte, image, caption)
 * @param {Object} ctx - Contexte Telegram
 * @param {string} text - Texte du message
 * @param {Object} options - Options du message (keyboard, parse_mode, etc.)
 * @param {string} image - URL de l'image (optionnel)
 */
const editMessageRobust = async (ctx, text, options = {}, image = null) => {
  const { reply_markup, parse_mode = 'Markdown' } = options;
  
  try {
    console.log('🔄 Tentative d\'édition de message robuste');
    
    // Si on a une image, essayer editMessageMedia
    if (image) {
      console.log('🖼️ Édition avec image:', image.substring(0, 50) + '...');
      await ctx.editMessageMedia({
        type: 'photo',
        media: image,
        caption: text,
        parse_mode
      }, reply_markup ? { reply_markup } : {});
      console.log('✅ EditMessageMedia réussi');
      return true;
    }
    
    // Sinon, essayer editMessageText
    console.log('📝 Édition texte simple');
    await ctx.editMessageText(text, {
      reply_markup,
      parse_mode
    });
    console.log('✅ EditMessageText réussi');
    return true;
    
  } catch (error) {
    console.log('⚠️ Première tentative échouée:', error.message);
    
    // Fallback 1: Essayer editMessageCaption
    try {
      console.log('🔄 Tentative editMessageCaption');
      await ctx.editMessageCaption(text, {
        reply_markup,
        parse_mode
      });
      console.log('✅ EditMessageCaption réussi');
      return true;
    } catch (captionError) {
      console.log('⚠️ EditMessageCaption échoué:', captionError.message);
      
      // Fallback 2: Envoyer un nouveau message
      try {
        console.log('🔄 Envoi nouveau message');
        if (image) {
          await ctx.replyWithPhoto(image, {
            caption: text,
            reply_markup,
            parse_mode
          });
        } else {
          await ctx.reply(text, reply_markup ? { reply_markup, parse_mode } : { parse_mode });
        }
        console.log('✅ Nouveau message envoyé');
        return true;
      } catch (replyError) {
        console.error('❌ Toutes les méthodes ont échoué:', replyError.message);
        return false;
      }
    }
  }
};

/**
 * Confirme une callback avec gestion d'erreur
 * @param {Object} ctx - Contexte Telegram
 * @param {string} message - Message de confirmation (optionnel)
 */
const answerCallbackSafe = async (ctx, message = null) => {
  try {
    await ctx.answerCbQuery(message);
  } catch (error) {
    console.log('⚠️ Erreur answerCbQuery (ignorée):', error.message);
  }
};

/**
 * Log standardisé pour les gestionnaires
 * @param {string} handler - Nom du gestionnaire
 * @param {string} action - Action en cours
 * @param {Object} data - Données additionnelles
 */
const logHandler = (handler, action, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${handler} - ${action}`, data);
};

module.exports = {
  editMessageRobust,
  answerCallbackSafe,
  logHandler
};