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
  
  // Migration automatique si socialMedia est un objet (ancienne structure)
  if (config?.socialMedia && typeof config.socialMedia === 'object' && !Array.isArray(config.socialMedia)) {
    console.log('🔄 MIGRATION: Conversion objet vers array...');
    
    // Si c'est un objet vide, le remplacer par un array vide
    if (Object.keys(config.socialMedia).length === 0) {
      config.socialMedia = [];
      console.log('✅ MIGRATION: Objet vide converti en array vide');
    } else {
      // Convertir les propriétés de l'objet en array
      const socialMediaArray = [];
      for (const [key, value] of Object.entries(config.socialMedia)) {
        if (value && typeof value === 'string' && value.trim()) {
          const mapping = {
            telegram: { name: 'Telegram', emoji: '📱' },
            instagram: { name: 'Instagram', emoji: '📷' },
            whatsapp: { name: 'WhatsApp', emoji: '💬' },
            website: { name: 'Site Web', emoji: '🌐' }
          };
          
          const info = mapping[key] || { name: key, emoji: '🌐' };
          socialMediaArray.push({
            name: info.name,
            emoji: info.emoji,
            url: value.trim()
          });
          console.log(`✅ MIGRATION: ${key} -> ${info.name}`);
        }
      }
      config.socialMedia = socialMediaArray;
      console.log(`✅ MIGRATION: ${socialMediaArray.length} réseaux convertis`);
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

  // Troisième ligne : Devenir Plug (seul)
  buttons.push([Markup.button.callback('💼 Devenir Plug', 'start_application')]);
  
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
  }
  
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
  
  // Bouton like avec état permanent et cooldown
  let likeButtonText;
  
  // Debug pour comprendre le problème
  console.log(`🔍 BUTTON DEBUG: userId=${userId} (type: ${typeof userId})`);
  console.log(`🔍 BUTTON DEBUG: plug.likedBy=`, plug.likedBy);
  console.log(`🔍 BUTTON DEBUG: plug.likedBy types=`, plug.likedBy?.map(id => `${id}(${typeof id})`));
  
  // Vérification robuste qui gère les types number et string
  const hasLiked = userId && plug.likedBy && plug.likedBy.some(id => 
    id == userId || // Comparaison loose
    id === userId || // Comparaison stricte  
    String(id) === String(userId) // Comparaison string
  );
  
  console.log(`🔍 BUTTON DEBUG: hasLiked result: ${hasLiked}`);
  
  // Vérifier si l'utilisateur a déjà liké et calculer le cooldown
  if (hasLiked) {
    // Trouver l'historique de like de cet utilisateur
    const userLikeHistory = plug.likeHistory?.find(h => 
      h.userId == userId || h.userId === userId || String(h.userId) === String(userId)
    );
    
    if (userLikeHistory) {
      const lastLikeTime = new Date(userLikeHistory.timestamp);
      const now = new Date();
      const timeDiff = now - lastLikeTime;
             const cooldownTime = 2 * 60 * 60 * 1000; // 2 heures
      
      if (timeDiff < cooldownTime) {
        const remainingTime = cooldownTime - timeDiff;
        const hours = Math.floor(remainingTime / (60 * 60 * 1000));
        const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
        
        console.log(`🔍 BUTTON DEBUG: User ${userId} in cooldown, ${hours}h ${minutes}m remaining`);
        likeButtonText = `⏰ Dans ${hours}h ${minutes}m`;
      } else {
        console.log(`🔍 BUTTON DEBUG: User ${userId} cooldown expired, can like again`);
        likeButtonText = '🤍 Liker cette boutique';
      }
    } else {
      // Pas d'historique trouvé, considérer comme pouvant liker
      console.log(`🔍 BUTTON DEBUG: User ${userId} has liked but no history found, allowing like`);
      likeButtonText = '🤍 Liker cette boutique';
    }
  } else {
    console.log(`🔍 BUTTON DEBUG: User ${userId} hasn't liked, showing like button`);
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
  
  // Plugs de la page actuelle avec format uniforme comme le screenshot
  for (let i = startIndex; i < endIndex; i++) {
    const plug = plugs[i];
    
    // Format optimisé pour TOUJOURS voir les likes :
    // 🇫🇷 NOM BOUTIQUE | 👍 12
    // 📦 📍 🛵 ⭐
    
    // Ligne 1: Drapeau + nom + LIKES (sans points de suspension)
    const likesCount = plug.likes || 0;
    const vipIndicator = plug.isVip ? ' ⭐' : '';
    const line1 = `🇫🇷 ${plug.name.toUpperCase()}${vipIndicator} | 👍${likesCount}`;
    
    // Ligne 2: Services uniquement (plus simple et claire)  
    const services = [];
    if (plug.services?.postal?.enabled) services.push('📦');
    if (plug.services?.meetup?.enabled) services.push('📍'); 
    if (plug.services?.delivery?.enabled) services.push('🛵');
    const line2 = services.length > 0 ? services.join(' ') : '📦';
    
    const cardText = `${line1}\n${line2}`;
    buttons.push([Markup.button.callback(cardText, `plug_${plug._id}_from_${context}`)]);
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
  
  // Retour vers le menu des filtres (Tous les plugs, Par service, Par pays)
  buttons.push([Markup.button.callback('🔙 Retour aux filtres', 'top_plugs')]);
  
  return Markup.inlineKeyboard(buttons);
};

// Clavier VIP pour la section VIP
const createVIPKeyboard = (vipPlugs) => {
  const buttons = [];
  
  vipPlugs.forEach(plug => {
    // Format optimisé VIP pour TOUJOURS voir les likes :
    // 🇫🇷 NOM BOUTIQUE ⭐ | 👍 12
    // 📦 📍 🛵
    
    // Ligne 1: Drapeau + nom + VIP + LIKES (sans points de suspension)
    const likesCount = plug.likes || 0;
    const line1 = `🇫🇷 ${plug.name.toUpperCase()} ⭐ | 👍${likesCount}`;
    
    // Ligne 2: Services uniquement (plus simple)
    const services = [];
    if (plug.services?.postal?.enabled) services.push('📦');
    if (plug.services?.meetup?.enabled) services.push('📍'); 
    if (plug.services?.delivery?.enabled) services.push('🛵');
    const line2 = services.length > 0 ? services.join(' ') : '📦';
    
    const cardText = `${line1}\n${line2}`;
    buttons.push([Markup.button.callback(cardText, `plug_${plug._id}_from_plugs_vip`)]);
  });
  
  // Retour vers le menu principal pour VIP
  buttons.push([Markup.button.callback('🔙 Retour au menu', 'back_main')]);
  
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