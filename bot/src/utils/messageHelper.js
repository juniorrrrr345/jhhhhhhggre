const sendMessageWithImage = async (ctx, text, keyboard, config, options = {}) => {
  const welcomeImage = config?.welcome?.image || null;
  
  try {
    if (welcomeImage) {
      console.log('📸 Envoi message avec image:', welcomeImage);
      await ctx.replyWithPhoto(welcomeImage, {
        caption: text,
        reply_markup: keyboard?.reply_markup || keyboard,
        parse_mode: options.parse_mode || 'Markdown',
        ...options
      });
      console.log('✅ Message avec image envoyé');
    } else {
      console.log('📝 Envoi message texte simple');
      await ctx.reply(text, {
        reply_markup: keyboard?.reply_markup || keyboard,
        parse_mode: options.parse_mode || 'Markdown',
        ...options
      });
    }
  } catch (error) {
    console.error('❌ Erreur envoi message avec image:', error);
    // Fallback vers texte simple
    try {
      await ctx.reply(text, {
        reply_markup: keyboard?.reply_markup || keyboard,
        parse_mode: options.parse_mode || 'Markdown',
        ...options
      });
    } catch (fallbackError) {
      console.error('❌ Erreur fallback:', fallbackError);
    }
  }
};

const editMessageWithImage = async (ctx, text, keyboard, config, options = {}) => {
  const welcomeImage = config?.welcome?.image || null;
  
  try {
    if (welcomeImage) {
      // Si le message actuel n'a pas d'image, on supprime et renvoie avec image
      try {
        await ctx.deleteMessage();
        await ctx.replyWithPhoto(welcomeImage, {
          caption: text,
          reply_markup: keyboard?.reply_markup || keyboard,
          parse_mode: options.parse_mode || 'Markdown',
          ...options
        });
        console.log('✅ Message remplacé avec image');
      } catch (deleteError) {
        // Si impossible de supprimer, on édite le texte
        await ctx.editMessageText(text, {
          reply_markup: keyboard?.reply_markup || keyboard,
          parse_mode: options.parse_mode || 'Markdown',
          ...options
        });
      }
    } else {
      // Pas d'image, édition normale
      await ctx.editMessageText(text, {
        reply_markup: keyboard?.reply_markup || keyboard,
        parse_mode: options.parse_mode || 'Markdown',
        ...options
      });
    }
  } catch (error) {
    console.error('❌ Erreur édition message:', error);
    // Fallback : supprimer et renvoyer nouveau message
    try {
      await ctx.deleteMessage();
      await sendMessageWithImage(ctx, text, keyboard, config, options);
    } catch (fallbackError) {
      console.error('❌ Erreur fallback édition:', fallbackError);
    }
  }
};

module.exports = {
  sendMessageWithImage,
  editMessageWithImage
};