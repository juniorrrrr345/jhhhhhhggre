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
      // CORRECTION: Suppression et recréation rapide pour éviter le loading
      try {
        // Supprimer immédiatement l'ancien message
        await ctx.deleteMessage();
        
        // Recréer immédiatement avec l'image (pas de loading visible)
        await ctx.replyWithPhoto(welcomeImage, {
          caption: text,
          reply_markup: keyboard?.reply_markup || keyboard,
          parse_mode: options.parse_mode || 'Markdown',
          ...options
        });
        console.log('✅ Message remplacé avec image (optimisé)');
      } catch (deleteError) {
        console.log('⚠️ Impossible de supprimer, édition du texte');
        // Si impossible de supprimer, on édite le texte seulement
        await ctx.editMessageText(text, {
          reply_markup: keyboard?.reply_markup || keyboard,
          parse_mode: options.parse_mode || 'Markdown',
          ...options
        });
      }
    } else {
      // Pas d'image, édition normale du texte
      await ctx.editMessageText(text, {
        reply_markup: keyboard?.reply_markup || keyboard,
        parse_mode: options.parse_mode || 'Markdown',
        ...options
      });
    }
  } catch (error) {
    console.error('❌ Erreur édition message:', error);
    // Fallback amélioré
    try {
      await ctx.deleteMessage().catch(() => {}); // Supprimer si possible
      await sendMessageWithImage(ctx, text, keyboard, config, options);
    } catch (fallbackError) {
      console.error('❌ Erreur fallback édition:', fallbackError);
      // Dernier recours : message texte simple
      await ctx.reply(text, {
        reply_markup: keyboard?.reply_markup || keyboard,
        parse_mode: options.parse_mode || 'Markdown',
        ...options
      }).catch(() => {});
    }
  }
};

// Fonction pour envoyer un message avec l'image du plug
const sendPlugWithImage = async (ctx, text, keyboard, plug, options = {}) => {
  const plugImage = plug?.image || null;
  
  try {
    if (plugImage) {
      console.log('📸 Envoi détails plug avec image:', plugImage);
      await ctx.replyWithPhoto(plugImage, {
        caption: text,
        reply_markup: keyboard?.reply_markup || keyboard,
        parse_mode: options.parse_mode || 'Markdown',
        ...options
      });
      console.log('✅ Détails plug avec image envoyés');
    } else {
      console.log('📝 Envoi détails plug sans image');
      await ctx.reply(text, {
        reply_markup: keyboard?.reply_markup || keyboard,
        parse_mode: options.parse_mode || 'Markdown',
        ...options
      });
    }
  } catch (error) {
    console.error('❌ Erreur envoi plug avec image:', error);
    // Fallback vers texte simple
    try {
      await ctx.reply(text, {
        reply_markup: keyboard?.reply_markup || keyboard,
        parse_mode: options.parse_mode || 'Markdown',
        ...options
      });
    } catch (fallbackError) {
      console.error('❌ Erreur fallback plug:', fallbackError);
    }
  }
};

module.exports = {
  sendMessageWithImage,
  editMessageWithImage,
  sendPlugWithImage
};