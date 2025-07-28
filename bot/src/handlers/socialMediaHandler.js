const Config = require('../models/Config');
const { createMainKeyboard } = require('../utils/keyboards');
const { Markup } = require('telegraf');

// Gestionnaire pour le bouton Réseaux Sociaux
const handleSocialMedia = async (ctx) => {
  try {
    // Confirmer immédiatement la callback pour éviter le loading
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    
    if (!config) {
      return;
    }

    // Message d'introduction
    let message = `📱 **Réseaux Sociaux**\n\n${config?.buttons?.socialMedia?.content || 'Suivez-nous sur nos réseaux sociaux !'}`;

    // Créer les boutons des réseaux sociaux
    const socialButtons = [];
    
    // Utiliser socialMediaList (depuis l'admin) en priorité, puis socialMedia (ancien format)
    let socialMediaData = config?.socialMediaList || [];
    
    // Si socialMediaList est vide, essayer l'ancien format socialMedia
    if (socialMediaData.length === 0 && config?.socialMedia) {
      if (Array.isArray(config.socialMedia)) {
        socialMediaData = config.socialMedia;
      } else if (typeof config.socialMedia === 'object') {
        // Convertir l'ancien format objet en array
        socialMediaData = Object.entries(config.socialMedia).map(([key, url]) => ({
          id: key,
          name: key.charAt(0).toUpperCase() + key.slice(1),
          emoji: key === 'telegram' ? '📱' : key === 'whatsapp' ? '💬' : '🌐',
          url: url,
          enabled: true
        })).filter(social => social.url && social.url.trim() !== '');
      }
    }
    
    if (Array.isArray(socialMediaData) && socialMediaData.length > 0) {
      // Grouper les réseaux sociaux par lignes de 2
      const socialRows = [];
      let currentRow = [];
      
      socialMediaData.filter(social => social.enabled !== false).forEach((social, index) => {
        if (social.name && social.url) {
          const cleanedUrl = cleanUrl(social.url);
          if (cleanedUrl) {
            const emoji = social.emoji || '🌐';
            const buttonText = `${emoji} ${social.name}`;
            currentRow.push(Markup.button.url(buttonText, cleanedUrl));
            
            // Créer une nouvelle ligne tous les 2 boutons ou au dernier élément
            if (currentRow.length === 2 || index === socialMediaData.filter(s => s.enabled !== false).length - 1) {
              socialRows.push([...currentRow]);
              currentRow = [];
            }
          }
        }
      });
      
      socialButtons.push(...socialRows);
    } else {
      // Aucun réseau social configuré
      message += '\n\n_Aucun réseau social configuré pour le moment._';
    }
    
    // Bouton retour au menu principal
    socialButtons.push([Markup.button.callback('🔙 Retour au menu', 'back_main')]);
    
    const keyboard = Markup.inlineKeyboard(socialButtons);

    if (config?.welcome?.image) {
      try {
        await ctx.editMessageMedia({
          type: 'photo',
          media: config.welcome.image,
          caption: message,
          parse_mode: 'Markdown'
        }, {
          reply_markup: keyboard.reply_markup
        });
      } catch (error) {
        await ctx.editMessageText(message, {
          reply_markup: keyboard.reply_markup,
          parse_mode: 'Markdown'
        });
      }
    } else {
      await ctx.editMessageText(message, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown'
      });
    }

  } catch (error) {
    console.error('Erreur dans handleSocialMedia:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement').catch(() => {});
  }
};

// Fonction pour nettoyer les URLs (copiée de keyboards.js)
const cleanUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  url = url.trim();
  if (url === '') return null;
  
  // Ajouter https:// si aucun protocole n'est spécifié
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  try {
    new URL(url);
    return url;
  } catch (error) {
    console.warn('🚫 Impossible de corriger l\'URL:', url);
    return null;
  }
};

module.exports = {
  handleSocialMedia
};