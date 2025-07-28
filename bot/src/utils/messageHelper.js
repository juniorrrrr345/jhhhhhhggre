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
    
    // Si c'est pour les détails d'un plug (isPlugDetails), modifier avec l'image appropriée
    if (options.isPlugDetails) {
      try {
        console.log('🔄 Fallback pour détails plug: modification avec image appropriée');
        
        // Utiliser l'image du plug ou l'image d'accueil par défaut
        let imageToUse = options.plugImage;
        if (!imageToUse && config?.welcome?.image) {
          imageToUse = config.welcome.image;
          console.log('📸 Utilisation image d\'accueil pour détails plug sans image');
        }
        
        if (imageToUse) {
          // Modifier avec l'image appropriée
          await ctx.editMessageMedia({
            type: 'photo',
            media: imageToUse,
            caption: message,
            parse_mode: options.parse_mode || 'Markdown'
          }, {
            reply_markup: keyboard.reply_markup
          });
          console.log('✅ Détails plug affichés avec image');
        } else {
          // Pas d'image disponible, éditer seulement le caption
          await ctx.editMessageCaption(message, {
            reply_markup: keyboard.reply_markup,
            parse_mode: options.parse_mode || 'Markdown'
          });
          console.log('✅ Détails plug affichés sans image');
        }
        return;
      } catch (newMessageError) {
        console.error('❌ Erreur modification détails plug:', newMessageError);
        // Continuer vers le fallback standard
      }
    }
    
    // Fallback standard : essayer d'éditer le texte seulement
    try {
      console.log('🔄 Fallback: tentative édition texte seulement');
      await ctx.editMessageText(message, {
        reply_markup: keyboard.reply_markup,
        parse_mode: options.parse_mode || 'Markdown',
        disable_web_page_preview: true
      });
    } catch (fallbackError) {
      console.error('❌ Fallback échoué aussi:', fallbackError.message);
      console.log('⚠️ Impossible de modifier le message, aucune action prise pour éviter le spam');
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

// Fonction utilitaire pour éditer un message sans jamais créer de nouveau message
const safeEditMessage = async (ctx, message, options = {}) => {
  try {
    await ctx.editMessageText(message, {
      parse_mode: options.parse_mode || 'Markdown',
      reply_markup: options.reply_markup,
      disable_web_page_preview: true
    });
  } catch (error) {
    console.log('⚠️ Impossible d\'éditer le message:', error.message);
    // Ne jamais créer de nouveau message pour éviter le spam
    console.log('🔇 Aucun nouveau message créé pour éviter le spam');
  }
};

module.exports = {
  sendMessageWithImage,
  editMessageWithImage,
  safeEditMessage,
  sendPlugWithImage,
  sendWelcomeMessage
};