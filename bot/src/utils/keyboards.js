const { Markup } = require('telegraf');

// Fonction pour valider une URL
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Nettoyer l'URL
  url = url.trim();
  if (url === '') return false;
  
  try {
    // Ajouter http:// si aucun protocole n'est spécifié
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // Valider avec l'objet URL
    new URL(url);
    return true;
  } catch (error) {
    console.warn('🚫 URL invalide détectée:', url, error.message);
    return false;
  }
};

// Fonction pour nettoyer et corriger une URL
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

// Clavier principal de la page d'accueil
const createMainKeyboard = (config) => {
  const buttons = [];
  
  // Réseaux sociaux personnalisés en haut du menu
  if (config?.socialMedia && Array.isArray(config.socialMedia) && config.socialMedia.length > 0) {
    console.log('🔄 Création des boutons réseaux sociaux personnalisés...');
    
    // Filtrer et valider les réseaux sociaux
    const validSocialMedia = config.socialMedia.filter(social => {
      if (!social || !social.name || !social.url) {
        console.warn('🚫 Réseau social incomplet détecté:', social);
        return false;
      }
      
      const cleanedUrl = cleanUrl(social.url);
      if (!cleanedUrl) {
        console.warn('🚫 URL invalide pour le réseau social:', social.name, social.url);
        return false;
      }
      
      // Mettre à jour l'URL nettoyée
      social.url = cleanedUrl;
      return true;
    });
    
    console.log(`✅ ${validSocialMedia.length}/${config.socialMedia.length} réseaux sociaux valides`);
    
    // Grouper les réseaux sociaux par lignes de 2
    for (let i = 0; i < validSocialMedia.length; i += 2) {
      const socialRow = [];
      const social1 = validSocialMedia[i];
      
      try {
        const emoji1 = social1.emoji || '🌐';
        socialRow.push(Markup.button.url(`${emoji1} ${social1.name}`, social1.url));
        console.log(`📱 Bouton créé: ${emoji1} ${social1.name} -> ${social1.url}`);
        
        if (validSocialMedia[i + 1]) {
          const social2 = validSocialMedia[i + 1];
          const emoji2 = social2.emoji || '🌐';
          socialRow.push(Markup.button.url(`${emoji2} ${social2.name}`, social2.url));
          console.log(`📱 Bouton créé: ${emoji2} ${social2.name} -> ${social2.url}`);
        }
        
        buttons.push(socialRow);
      } catch (error) {
        console.error(`❌ Erreur création bouton social:`, error);
      }
    }
  }
  
  // Bouton Top Des Plugs
  const topPlugsText = config?.buttons?.topPlugs?.text || '🔌 Top Des Plugs';
  buttons.push([Markup.button.callback(topPlugsText, 'top_plugs')]);
  
  // Bouton Boutique VIP
  const vipButtonText = config?.buttons?.vipPlugs?.text || '🛍️ Boutiques VIP';
  buttons.push([Markup.button.callback(vipButtonText, 'plugs_vip')]);
  
  // Boutons Contact et Info sur la même ligne
  const secondRow = [];
  const contactText = config?.buttons?.contact?.text || '📞 Contact';
  const infoText = config?.buttons?.info?.text || 'ℹ️ Info';
  
  secondRow.push(Markup.button.callback(contactText, 'contact'));
  secondRow.push(Markup.button.callback(infoText, 'info'));
  buttons.push(secondRow);
  
  // Réseaux sociaux personnalisés en bas du menu
  if (config?.socialMedia && Array.isArray(config.socialMedia) && config.socialMedia.length > 0) {
    console.log('🔄 Création des boutons réseaux sociaux personnalisés...');
    
    // Grouper les réseaux sociaux par rangées de 2 boutons max
    const socialButtons = [];
    const socialRows = [];
    
    config.socialMedia.forEach((social, index) => {
      if (social.name && social.url) {
        const cleanedUrl = cleanUrl(social.url);
        if (cleanedUrl) {
          const emoji = social.emoji || '🌐';
          const buttonText = `${emoji} ${social.name}`;
          
          socialButtons.push(Markup.button.url(buttonText, cleanedUrl));
          console.log(`📱 Bouton réseau social créé: ${buttonText} -> ${cleanedUrl}`);
          
          // Créer une nouvelle rangée tous les 2 boutons
          if (socialButtons.length === 2 || index === config.socialMedia.length - 1) {
            socialRows.push([...socialButtons]);
            socialButtons.length = 0; // Vider le tableau
          }
        } else {
          console.warn(`🚫 URL invalide pour ${social.name}:`, social.url);
        }
      }
    });
    
    // Ajouter toutes les rangées de réseaux sociaux en bas
    socialRows.forEach(row => {
      buttons.push(row);
    });
    

  
  return Markup.inlineKeyboard(buttons);
};

// Clavier des filtres de plugs
const createPlugsFilterKeyboard = (config) => {
  const allText = config?.filters?.all || 'Tous les plugs';
  const serviceText = config?.filters?.byService || 'Par service';
  const countryText = config?.filters?.byCountry || 'Par pays';
  const backText = config?.botTexts?.backButtonText || '🔙 Retour';
  
  return Markup.inlineKeyboard([
    [Markup.button.callback(allText, 'plugs_all')],
    [Markup.button.callback(serviceText, 'filter_service')],
    [Markup.button.callback(countryText, 'filter_country')],
    [Markup.button.callback(backText, 'back_main')]
  ]);
};

// Clavier des services
const createServicesKeyboard = (config) => {
  const deliveryText = config?.botTexts?.deliveryServiceText || '🚚 Livraison';
  const postalText = config?.botTexts?.postalServiceText || '✈️ Envoi postal';
  const meetupText = config?.botTexts?.meetupServiceText || '🏠 Meetup';
  const backText = config?.botTexts?.backButtonText || '🔙 Retour';
  
  return Markup.inlineKeyboard([
    [Markup.button.callback(deliveryText, 'service_delivery')],
    [Markup.button.callback(postalText, 'service_postal')],
    [Markup.button.callback(meetupText, 'service_meetup')],
    [Markup.button.callback(backText, 'top_plugs')]
  ]);
};

// Clavier des pays (dynamique basé sur les plugs)
const createCountriesKeyboard = (countries) => {
  const buttons = [];
  
  // Grouper les pays par lignes de 2
  for (let i = 0; i < countries.length; i += 2) {
    const row = [];
    row.push(Markup.button.callback(`🌍 ${countries[i]}`, `country_${countries[i].toLowerCase()}`));
    if (countries[i + 1]) {
      row.push(Markup.button.callback(`🌍 ${countries[i + 1]}`, `country_${countries[i + 1].toLowerCase()}`));
    }
    buttons.push(row);
  }
  
  buttons.push([Markup.button.callback('🔙 Retour', 'top_plugs')]);
  return Markup.inlineKeyboard(buttons);
};

// Clavier pour un plug individuel avec contexte de retour
const createPlugKeyboard = (plug, returnContext = 'top_plugs', userId = null) => {
  const buttons = [];
  
  // Services disponibles
  const serviceButtons = [];
  if (plug.services.delivery.enabled) {
    serviceButtons.push(Markup.button.callback('🚚 Livraison', `plug_service_${plug._id}_delivery`));
  }
  if (plug.services.postal.enabled) {
    serviceButtons.push(Markup.button.callback('✈️ Postal', `plug_service_${plug._id}_postal`));
  }
  if (plug.services.meetup.enabled) {
    serviceButtons.push(Markup.button.callback('🏠 Meetup', `plug_service_${plug._id}_meetup`));
  }
  
  // Ajouter les services par lignes de 2
  for (let i = 0; i < serviceButtons.length; i += 2) {
    const row = [];
    row.push(serviceButtons[i]);
    if (serviceButtons[i + 1]) {
      row.push(serviceButtons[i + 1]);
    }
    buttons.push(row);
  }
  
  // Lien Telegram optionnel
  if (plug.telegramLink) {
    const cleanedTelegramUrl = cleanUrl(plug.telegramLink);
    if (cleanedTelegramUrl) {
      buttons.push([Markup.button.url('📱 Telegram', cleanedTelegramUrl)]);
      console.log(`📱 Bouton Telegram du plug créé: ${cleanedTelegramUrl}`);
    } else {
      console.warn(`🚫 URL Telegram invalide pour le plug ${plug.name}:`, plug.telegramLink);
    }
  }
  
  // Réseaux sociaux personnalisés du plug - CORRECTION
  console.log(`🔧 Réseaux sociaux du plug ${plug.name}:`, plug.socialMedia);
  if (plug.socialMedia && Array.isArray(plug.socialMedia) && plug.socialMedia.length > 0) {
    // Filtrer les réseaux sociaux valides avec validation d'URL
    const validSocialMedia = plug.socialMedia.filter(social => {
      if (!social || !social.name || !social.emoji || !social.url) {
        console.warn(`🚫 Réseau social incomplet pour ${plug.name}:`, social);
        return false;
      }
      
      const cleanedUrl = cleanUrl(social.url);
      if (!cleanedUrl) {
        console.warn(`🚫 URL invalide pour le réseau social ${social.name} du plug ${plug.name}:`, social.url);
        return false;
      }
      
      // Mettre à jour l'URL nettoyée
      social.url = cleanedUrl;
      return true;
    });
    
    console.log(`✅ ${validSocialMedia.length}/${plug.socialMedia.length} réseaux sociaux valides pour ${plug.name}`);
    
    // Grouper les réseaux sociaux par lignes de 2
    for (let i = 0; i < validSocialMedia.length; i += 2) {
      const socialRow = [];
      const social1 = validSocialMedia[i];
      
      try {
        socialRow.push(Markup.button.url(`${social1.emoji} ${social1.name}`, social1.url));
        console.log(`📱 Bouton créé: ${social1.emoji} ${social1.name} -> ${social1.url}`);
        
        if (validSocialMedia[i + 1]) {
          const social2 = validSocialMedia[i + 1];
          socialRow.push(Markup.button.url(`${social2.emoji} ${social2.name}`, social2.url));
          console.log(`📱 Bouton créé: ${social2.emoji} ${social2.name} -> ${social2.url}`);
        }
        
        buttons.push(socialRow);
      } catch (error) {
        console.error(`❌ Erreur création bouton social:`, error);
      }
    }
  } else {
    console.log(`⚠️ Aucun réseau social configuré pour ${plug.name}`);
  }
  
  // Bouton like avec état permanent
  let likeButtonText;
  
  // Vérifier si l'utilisateur a déjà liké
  if (userId && plug.likedBy && plug.likedBy.includes(userId)) {
    likeButtonText = '❤️ Vous avez liké cette boutique';
  } else {
    likeButtonText = '🤍 Liker cette boutique';
  }
  
  buttons.push([Markup.button.callback(likeButtonText, `like_${plug._id}`)]);
  
  // Bouton retour intelligent selon le contexte
  const returnText = getReturnButtonText(returnContext);
  const returnAction = getReturnAction(returnContext);
  buttons.push([Markup.button.callback(returnText, returnAction)]);
  
  return Markup.inlineKeyboard(buttons);
};

// Fonction pour obtenir le texte du bouton retour selon le contexte
const getReturnButtonText = (context) => {
  switch(context) {
    case 'top_plugs':
      return '🔙 Retour aux filtres';
    case 'plugs_all':
    case 'all':
      return '🔙 Retour à la liste';
    case 'plugs_vip':
      return '🔙 Retour aux VIP';
    case 'service_delivery':
    case 'service_postal':
    case 'service_meetup':
      return '🔙 Retour aux services';
    default:
      if (context.startsWith('country_')) {
        return '🔙 Retour aux pays';
      }
      if (context.startsWith('service_')) {
        return '🔙 Retour aux services';
      }
      if (context.startsWith('plug_') && context.endsWith('_details')) {
        return '🔙 Retour aux détails';
      }
      return '🔙 Retour à la liste';
  }
};

// Fonction pour obtenir l'action de retour selon le contexte
const getReturnAction = (context) => {
  switch(context) {
    case 'top_plugs':
      return 'top_plugs';
    case 'plugs_all':
    case 'all':
      return 'plugs_all';
    case 'plugs_vip':
      return 'plugs_vip';
    case 'service_delivery':
      return 'service_delivery';
    case 'service_postal':
      return 'service_postal';
    case 'service_meetup':
      return 'service_meetup';
    default:
      if (context.startsWith('country_')) {
        return 'filter_country';
      }
      if (context.startsWith('service_')) {
        const serviceType = context.split('_')[1];
        return `service_${serviceType}`;
      }
      if (context.startsWith('plug_') && context.endsWith('_details')) {
        // Extraire l'ID du plug et retourner vers ses détails
        const plugId = context.replace('plug_', '').replace('_details', '');
        return `plug_${plugId}_from_top_plugs`;
      }
      return 'plugs_all';
  }
};

// Clavier pour la liste des plugs
const createPlugListKeyboard = (plugs, page = 0, totalPages = 1, context = 'plugs_all') => {
  const buttons = [];
  const itemsPerPage = 5;
  const startIndex = page * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, plugs.length);
  
  // Plugs de la page actuelle avec le bon contexte
  for (let i = startIndex; i < endIndex; i++) {
    const plug = plugs[i];
    const vipIcon = plug.isVip ? '⭐ ' : '';
    const likesText = plug.likes > 0 ? ` ❤️${plug.likes}` : '';
    buttons.push([Markup.button.callback(`${vipIcon}${plug.name}${likesText}`, `plug_${plug._id}_from_${context}`)]);
  }
  
  // Navigation
  if (totalPages > 1) {
    const navButtons = [];
    if (page > 0) {
      navButtons.push(Markup.button.callback('⬅️', `page_${context}_${page - 1}`));
    }
    navButtons.push(Markup.button.callback(`${page + 1}/${totalPages}`, 'current_page'));
    if (page < totalPages - 1) {
      navButtons.push(Markup.button.callback('➡️', `page_${context}_${page + 1}`));
    }
    buttons.push(navButtons);
  }
  
  // Bouton retour intelligent selon le contexte
  let returnAction = 'top_plugs';
  let returnText = '🔙 Retour';
  
  if (context === 'plugs_all') {
    returnAction = 'top_plugs'; // Retour vers le menu des filtres
    returnText = '🔙 Retour aux filtres';
  } else if (context === 'plugs_vip') {
    returnAction = 'back_main'; // Retour vers menu principal pour VIP
    returnText = '🔙 Retour au menu';
  } else if (context.startsWith('service_')) {
    returnAction = 'filter_service'; // Retour vers le menu des services
    returnText = '🔙 Retour aux services';
  } else if (context.startsWith('country_')) {
    returnAction = 'filter_country'; // Retour vers le menu des pays
    returnText = '🔙 Retour aux pays';
  }
  
  buttons.push([Markup.button.callback(returnText, returnAction)]);
  
  return Markup.inlineKeyboard(buttons);
};

// Clavier VIP pour la section VIP
const createVIPKeyboard = (vipPlugs) => {
  const buttons = [];
  
  vipPlugs.forEach(plug => {
    const likesText = plug.likes > 0 ? ` ❤️${plug.likes}` : '';
    buttons.push([Markup.button.callback(`⭐ ${plug.name}${likesText}`, `plug_${plug._id}_from_plugs_vip`)]);
  });
  
  // Bouton retour
  buttons.push([Markup.button.callback('🔙 Retour', 'back_main')]);
  
  return Markup.inlineKeyboard(buttons);
};

module.exports = {
  createMainKeyboard,
  createPlugsFilterKeyboard,
  createServicesKeyboard,
  createCountriesKeyboard,
  createPlugKeyboard,
  createPlugListKeyboard,
  createVIPKeyboard
};