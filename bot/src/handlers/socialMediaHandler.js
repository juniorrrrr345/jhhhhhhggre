const Config = require('../models/Config');
const { createMainKeyboard } = require('../utils/keyboards');
const { Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');

// Configuration par défaut des réseaux sociaux
const DEFAULT_SOCIAL_MEDIA = [
  {
    name: 'Telegram',
    emoji: '📱',
    url: 'https://t.me/+zcP68c4M_3NlM2Y0'
  },
  {
    name: 'Contact',
    emoji: '📞',
    url: 'https://t.me/findyourplugsav'
  }
];

const DEFAULT_CONFIG = {
  buttons: {
    socialMedia: {
      content: 'Rejoignez notre communauté sur nos différents réseaux sociaux ! 🚀'
    }
  },
  socialMedia: DEFAULT_SOCIAL_MEDIA,
  welcome: {
    image: ''
  }
};

// Fonction pour charger la configuration de secours
const loadBackupConfig = () => {
  try {
    const configPath = path.join(__dirname, '../../config-backup.json');
    if (fs.existsSync(configPath)) {
      console.log('📁 Chargement de la configuration de secours...');
      const backupConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return backupConfig;
    }
  } catch (error) {
    console.warn('⚠️ Impossible de charger la configuration de secours:', error.message);
  }
  return null;
};

// Gestionnaire pour le bouton Réseaux Sociaux
const handleSocialMedia = async (ctx) => {
  try {
    // Confirmer immédiatement la callback pour éviter le loading
    await ctx.answerCbQuery();
    
    let config = null;
    
    try {
      // Essayer de charger depuis la base de données
      config = await Config.findById('main');
    } catch (dbError) {
      console.warn('⚠️ Erreur base de données, utilisation de la configuration de secours:', dbError.message);
    }
    
    // Si pas de config depuis la DB, essayer le fichier de secours
    if (!config) {
      config = loadBackupConfig();
    }
    
    // Si toujours pas de config, utiliser la config par défaut
    if (!config) {
      console.log('📋 Utilisation de la configuration par défaut');
      config = DEFAULT_CONFIG;
    }

    // Message d'introduction
    let message = `📱 **Réseaux Sociaux**\n\n${config?.buttons?.socialMedia?.content || 'Suivez-nous sur nos réseaux sociaux !'}`;

    // Créer les boutons des réseaux sociaux
    const socialButtons = [];
    
    // Priorité : socialMedia > socialMediaList > DEFAULT_SOCIAL_MEDIA
    let socialMediaData = config?.socialMedia;
    
    if (!socialMediaData || !Array.isArray(socialMediaData) || socialMediaData.length === 0) {
      socialMediaData = config?.socialMediaList;
    }
    
    if (!socialMediaData || !Array.isArray(socialMediaData) || socialMediaData.length === 0) {
      console.log('📋 Utilisation des réseaux sociaux par défaut');
      socialMediaData = DEFAULT_SOCIAL_MEDIA;
    }
    
    if (socialMediaData && Array.isArray(socialMediaData) && socialMediaData.length > 0) {
      // Grouper les réseaux sociaux par lignes de 2
      const socialRows = [];
      let currentRow = [];
      
      // Filtrer les réseaux sociaux activés (si le champ enabled existe)
      const activeSocialMedia = socialMediaData.filter(social => {
        // Si enabled n'existe pas, considérer comme activé
        return social.enabled !== false && social.name && social.url;
      });
      
      activeSocialMedia.forEach((social, index) => {
        const cleanedUrl = cleanUrl(social.url);
        if (cleanedUrl) {
          const emoji = social.emoji || '🌐';
          const buttonText = `${emoji} ${social.name}`;
          currentRow.push(Markup.button.url(buttonText, cleanedUrl));
          
          // Créer une nouvelle ligne tous les 2 boutons ou au dernier élément
          if (currentRow.length === 2 || index === activeSocialMedia.length - 1) {
            socialRows.push([...currentRow]);
            currentRow = [];
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
    
    // En cas d'erreur, afficher au moins les réseaux sociaux par défaut
    try {
      const message = `📱 **Réseaux Sociaux**\n\nRejoignez notre communauté sur nos différents réseaux sociaux ! 🚀`;
      
      const socialButtons = [];
      DEFAULT_SOCIAL_MEDIA.forEach((social, index) => {
        const cleanedUrl = cleanUrl(social.url);
        if (cleanedUrl) {
          const buttonText = `${social.emoji} ${social.name}`;
          socialButtons.push([Markup.button.url(buttonText, cleanedUrl)]);
        }
      });
      
      socialButtons.push([Markup.button.callback('🔙 Retour au menu', 'back_main')]);
      
      const keyboard = Markup.inlineKeyboard(socialButtons);
      
      await ctx.editMessageText(message, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown'
      });
    } catch (fallbackError) {
      console.error('Erreur de secours:', fallbackError);
      await ctx.answerCbQuery('❌ Erreur lors du chargement').catch(() => {});
    }
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