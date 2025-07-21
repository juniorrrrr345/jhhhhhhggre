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
  // CORRECTION: Prioriser l'image du plug si disponible, sinon image de bienvenue
  const plugImage = options.plugImage || null;
  const welcomeImage = config?.welcome?.image || null;
  const imageToUse = plugImage || welcomeImage;
  
  console.log(`🖼️ Images disponibles: plug=${!!plugImage}, welcome=${!!welcomeImage}, using=${!!imageToUse}`);
  if (imageToUse) {
    console.log(`📸 URL image utilisée: ${imageToUse.substring(0, 50)}...`);
  }
  
  try {
    if (imageToUse && imageToUse.trim() !== '') {
      // Vérifier que l'URL est valide
      if (!imageToUse.startsWith('http')) {
        console.log('❌ URL d\'image invalide, fallback texte');
        throw new Error('URL invalide');
      }
      
      try {
        // Essayer d'éditer avec une nouvelle image
        await ctx.editMessageMedia({
          type: 'photo',
          media: imageToUse,
          caption: text,
          parse_mode: options.parse_mode || 'Markdown'
        }, {
          reply_markup: keyboard?.reply_markup || keyboard
        });
        console.log(`✅ Message édité avec image ${plugImage ? '(plug)' : '(welcome)'}`);
      } catch (editError) {
        console.log(`⚠️ Édition image échouée (${editError.message}), deletion + recreation...`);
        
        // Supprimer et recréer avec l'image
        await ctx.deleteMessage();
        await ctx.replyWithPhoto(imageToUse, {
          caption: text,
          reply_markup: keyboard?.reply_markup || keyboard,
          parse_mode: options.parse_mode || 'Markdown',
          ...options
        });
        console.log(`✅ Message recréé avec image ${plugImage ? '(plug)' : '(welcome)'}`);
      }
    } else {
      // Pas d'image, édition normale du texte
      console.log('📝 Pas d\'image, édition texte seulement');
      await ctx.editMessageText(text, {
        reply_markup: keyboard?.reply_markup || keyboard,
        parse_mode: options.parse_mode || 'Markdown',
        ...options
      });
    }
  } catch (error) {
    console.error('❌ Erreur édition message:', error.message);
    // Fallback complet vers texte simple
    try {
      await ctx.editMessageText(text, {
        reply_markup: keyboard?.reply_markup || keyboard,
        parse_mode: options.parse_mode || 'Markdown',
        ...options
      });
      console.log('✅ Fallback texte réussi');
    } catch (fallbackError) {
      console.error('❌ Fallback texte échoué:', fallbackError.message);
      // Dernier recours
      await ctx.deleteMessage().catch(() => {});
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