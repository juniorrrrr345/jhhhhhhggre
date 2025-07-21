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
  // MAIS seulement utiliser l'image d'accueil si on n'est PAS dans les détails d'un plug
  const plugImage = options.plugImage || null;
  const welcomeImage = config?.welcome?.image || null;
  const isPlugDetails = options.isPlugDetails || false;
  
  // Si c'est les détails d'un plug, utiliser SEULEMENT l'image du plug
  // Pour tous les autres menus/sous-menus, utiliser l'image d'accueil en fallback
  const imageToUse = plugImage || (!isPlugDetails ? welcomeImage : null);
  
  console.log(`🖼️ Images: plug=${!!plugImage}, welcome=${!!welcomeImage}, isPlugDetails=${isPlugDetails}, using=${!!imageToUse}`);
  if (imageToUse) {
    console.log(`📸 URL image utilisée: ${imageToUse.substring(0, 50)}...`);
  }
  
  try {
    // Vérifier si le message actuel a déjà une photo
    const currentMessage = ctx.callbackQuery?.message;
    const hasCurrentPhoto = currentMessage?.photo && currentMessage.photo.length > 0;
    
    if (imageToUse && imageToUse.trim() !== '') {
      // Vérifier que l'URL est valide avec validation renforcée
      if (!isValidImageUrl(imageToUse)) {
        console.log('❌ URL d\'image invalide, fallback texte');
        throw new Error('URL invalide');
      }
      
      try {
        if (hasCurrentPhoto) {
          // Si le message actuel a déjà une photo, on peut essayer editMessageMedia
          await ctx.editMessageMedia({
            type: 'photo',
            media: imageToUse,
            caption: text,
            parse_mode: options.parse_mode || 'Markdown'
          }, {
            reply_markup: keyboard?.reply_markup || keyboard
          });
          console.log(`✅ Message avec photo édité ${plugImage ? '(plug)' : '(welcome)'}`);
                 } else {
           // Si le message actuel n'a pas de photo, supprimer et recréer avec photo
           console.log('📝 Message sans photo -> recréation avec photo');
           await ctx.deleteMessage();
           // Petit délai pour éviter les conflits
           await new Promise(resolve => setTimeout(resolve, 100));
           await ctx.replyWithPhoto(imageToUse, {
             caption: text,
             reply_markup: keyboard?.reply_markup || keyboard,
             parse_mode: options.parse_mode || 'Markdown',
             ...options
           });
           console.log(`✅ Message recréé avec photo ${plugImage ? '(plug)' : '(welcome)'}`);
         }
      } catch (editError) {
        console.log(`⚠️ Édition/création photo échouée (${editError.message}), fallback texte...`);
        
        // En cas d'erreur, fallback vers texte simple SANS supprimer/recréer
        try {
          await ctx.editMessageText(text, {
            reply_markup: keyboard?.reply_markup || keyboard,
            parse_mode: options.parse_mode || 'Markdown',
          });
          console.log('✅ Fallback vers texte réussi');
                 } catch (textError) {
           console.log(`⚠️ Fallback texte échoué, suppression et recréation...`);
           await ctx.deleteMessage();
           // Petit délai pour éviter les conflits
           await new Promise(resolve => setTimeout(resolve, 100));
           await ctx.reply(text, {
             reply_markup: keyboard?.reply_markup || keyboard,
             parse_mode: options.parse_mode || 'Markdown',
             ...options
           });
         }
      }
    } else {
      // Pas d'image, édition normale du texte
      console.log('📝 Pas d\'image, édition texte seulement');
             if (hasCurrentPhoto) {
         // Si le message actuel a une photo mais on veut juste du texte, on doit supprimer et recréer
         console.log('📝 Suppression photo existante pour texte seul');
         await ctx.deleteMessage();
         // Petit délai pour éviter les conflits
         await new Promise(resolve => setTimeout(resolve, 100));
         await ctx.reply(text, {
           reply_markup: keyboard?.reply_markup || keyboard,
           parse_mode: options.parse_mode || 'Markdown',
           ...options
         });
      } else {
        // Message texte vers message texte
        await ctx.editMessageText(text, {
          reply_markup: keyboard?.reply_markup || keyboard,
          parse_mode: options.parse_mode || 'Markdown',
        });
      }
    }
  } catch (error) {
    console.error('❌ Erreur édition message:', error.message);
    // Fallback complet vers texte simple
    try {
      await ctx.editMessageText(text, {
        reply_markup: keyboard?.reply_markup || keyboard,
        parse_mode: options.parse_mode || 'Markdown',
      });
      console.log('✅ Fallback texte réussi');
    } catch (fallbackError) {
      console.error('❌ Fallback texte échoué:', fallbackError.message);
             // Dernier recours: supprimer et recréer
       try {
         await ctx.deleteMessage();
         // Petit délai pour éviter les conflits
         await new Promise(resolve => setTimeout(resolve, 100));
         await ctx.reply(text, {
           reply_markup: keyboard?.reply_markup || keyboard,
           parse_mode: options.parse_mode || 'Markdown',
           ...options
         });
         console.log('✅ Dernier recours: message recréé');
       } catch (lastResortError) {
         console.error('❌ Dernier recours échoué:', lastResortError.message);
       }
    }
  }
};

// Fonction pour envoyer un message avec l'image du plug (pour les détails uniquement)
const sendPlugWithImage = async (ctx, text, keyboard, plug, options = {}) => {
  const plugImage = plug?.image || null;
  
  try {
    if (plugImage && isValidImageUrl(plugImage)) {
      console.log('📸 Envoi détails plug avec image:', plugImage);
      await ctx.replyWithPhoto(plugImage, {
        caption: text,
        reply_markup: keyboard?.reply_markup || keyboard,
        parse_mode: options.parse_mode || 'Markdown',
        ...options
      });
      console.log('✅ Détails plug avec image envoyés');
    } else {
      if (plugImage && !isValidImageUrl(plugImage)) {
        console.log('⚠️ Image plug invalide, envoi en texte seul');
      }
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

// Fonction pour valider une URL d'image
const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false;
  }
  
  // Vérifier que c'est une URL HTTP/HTTPS
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false;
  }
  
  // Vérifier la longueur (Telegram a des limites)
  if (url.length > 2048) {
    return false;
  }
  
  // Optionnel: vérifier les extensions d'image communes
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const hasImageExtension = imageExtensions.some(ext => 
    url.toLowerCase().includes(ext.toLowerCase())
  );
  
  // Si pas d'extension d'image visible, on accepte quand même (peut être dynamique)
  // mais on log un warning
  if (!hasImageExtension) {
    console.log(`⚠️ URL sans extension d'image détectable: ${url.substring(0, 50)}...`);
  }
  
  return true;
};

module.exports = {
  sendMessageWithImage,
  editMessageWithImage,
  sendPlugWithImage
};