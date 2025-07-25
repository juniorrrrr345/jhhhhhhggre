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

const editMessageWithImage = async (ctx, message, keyboard, config, options = {}) => {
  try {
    const { plugImage, isPlugDetails = false } = options;
    const welcomeImage = config?.welcome?.image || 'https://i.imgur.com/DD5OU6o.jpeg'; // Image FindYourPlug par défaut
    
    // Priorité: 1. Image du plug 2. Image d'accueil (sauf pour les détails de plug)
    const imageToUse = plugImage || (!isPlugDetails ? welcomeImage : null);
    
    console.log(`🖼️ Images: plug=${!!plugImage}, welcome=${!!welcomeImage}, isPlugDetails=${isPlugDetails}, using=${!!imageToUse}`);
    
    if (imageToUse) {
      console.log('🖼️ Modification avec image:', imageToUse);
      
      try {
        await ctx.editMessageMedia({
          type: 'photo',
          media: imageToUse,
          caption: message,
          parse_mode: options.parse_mode || 'Markdown'
        }, {
          reply_markup: keyboard.reply_markup
        });
      } catch (editError) {
        console.log('⚠️ Impossible de modifier l\'image, fallback vers édition caption');
        await ctx.editMessageCaption(message, {
          reply_markup: keyboard.reply_markup,
          parse_mode: options.parse_mode || 'Markdown'
        });
      }
    } else {
      console.log('📝 Modification texte simple (sans image)');
      await ctx.editMessageText(message, {
        reply_markup: keyboard.reply_markup,
        parse_mode: options.parse_mode || 'Markdown'
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur modification message avec image:', error);
    
    // Fallback : envoyer un nouveau message
    try {
      if (config?.welcome?.image || 'https://i.imgur.com/DD5OU6o.jpeg') {
        await ctx.replyWithPhoto(config?.welcome?.image || 'https://i.imgur.com/DD5OU6o.jpeg', {
          caption: message,
          reply_markup: keyboard.reply_markup,
          parse_mode: options.parse_mode || 'Markdown'
        });
      } else {
        await ctx.reply(message, {
          reply_markup: keyboard.reply_markup,
          parse_mode: options.parse_mode || 'Markdown'
        });
      }
    } catch (fallbackError) {
      console.error('❌ Erreur fallback:', fallbackError);
    }
  }
};

// Fonction pour envoyer un message avec l'image du plug (pour les détails uniquement)
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
      console.log('📝 Envoi détails plug sans image (PAS d\'image d\'accueil en fallback)');
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

const sendWelcomeMessage = async (ctx, config) => {
  const welcomeImage = config?.welcome?.image || 'https://i.imgur.com/DD5OU6o.jpeg'; // Image FindYourPlug par défaut
  
  if (welcomeImage) {
    console.log('📸 Envoi message avec image:', welcomeImage);
    await ctx.replyWithPhoto(welcomeImage, {
      caption: config?.welcome?.text || '🌟 Bienvenue sur notre bot !',
      parse_mode: 'HTML'
    });
  } else {
    console.log('📝 Envoi message texte simple');
    await ctx.reply(config?.welcome?.text || '🌟 Bienvenue sur notre bot !', {
      parse_mode: 'HTML'
    });
  }
};

module.exports = {
  sendMessageWithImage,
  editMessageWithImage,
  sendPlugWithImage,
  sendWelcomeMessage
};