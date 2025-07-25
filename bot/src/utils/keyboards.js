const { Markup } = require('telegraf');
const { getTranslation } = require('./translations');

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
  
  // Récupérer la langue actuelle
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;
  
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
  
  // Bouton Top Des Plugs avec traduction
  const topPlugsText = config?.buttons?.topPlugs?.text || getTranslation('menu.topPlugs', currentLang, customTranslations);
  buttons.push([Markup.button.callback(topPlugsText, 'top_plugs')]);
  
  // Boutons Contact et Info sur la même ligne avec traductions
  const secondRow = [];
  const contactText = config?.buttons?.contact?.text || getTranslation('menu.contact', currentLang, customTranslations);
  const infoText = config?.buttons?.info?.text || getTranslation('menu.info', currentLang, customTranslations);
  
  secondRow.push(Markup.button.callback(contactText, 'contact'));
  secondRow.push(Markup.button.callback(infoText, 'info'));
  buttons.push(secondRow);

  // Troisième ligne : Devenir Plug + Langue
  const thirdRow = [];
  const becomeDealerText = getTranslation('menu.becomeDealer', currentLang, customTranslations);
  thirdRow.push(Markup.button.callback(becomeDealerText, 'start_application'));
  
  // Bouton langue si activé
  if (config?.languages?.enabled) {
    const languageText = getTranslation('menu.language', currentLang, customTranslations);
    thirdRow.push(Markup.button.callback(languageText, 'select_language'));
  }
  
  buttons.push(thirdRow);
  
  // Réseaux sociaux personnalisés en bas du menu - PRIORITÉ socialMediaList
  const socialMediaData = config?.socialMediaList || config?.socialMedia || [];
  
  // Debug réseaux sociaux (activé uniquement si nécessaire)
  if (process.env.DEBUG_SOCIAL_MEDIA === 'true') {
    console.log('🔍 DEBUG RÉSEAUX SOCIAUX:');
    console.log('- config existe?', !!config);
    console.log('- socialMediaList?', !!config?.socialMediaList, 'longueur:', config?.socialMediaList?.length);
    console.log('- socialMedia?', !!config?.socialMedia, 'longueur:', config?.socialMedia?.length);
    console.log('- socialMediaData final:', Array.isArray(socialMediaData), 'longueur:', socialMediaData.length);
  }
  
  if (Array.isArray(socialMediaData) && socialMediaData.length > 0) {
    if (process.env.DEBUG_SOCIAL_MEDIA === 'true') {
      console.log('🔄 Création des boutons réseaux sociaux personnalisés...');
    }
    
    // Grouper les réseaux sociaux par rangées de 2 boutons max
    const socialButtons = [];
    const socialRows = [];
    
    // Filtrer uniquement les réseaux activés
    const activeSocials = socialMediaData.filter(social => social.enabled !== false);
    if (process.env.DEBUG_SOCIAL_MEDIA === 'true') {
      console.log(`📱 ${activeSocials.length} réseaux sociaux activés trouvés`);
      // Debug détaillé de chaque réseau social
      socialMediaData.forEach((social, i) => {
        console.log(`  [${i}] ${social?.name}: url=${!!social?.url}, enabled=${social?.enabled}`);
      });
    }
    
    activeSocials.forEach((social, index) => {
      if (social.name && social.url) {
        const cleanedUrl = cleanUrl(social.url);
        if (cleanedUrl) {
          const emoji = social.emoji || '🌐';
          const buttonText = `${emoji} ${social.name}`;
          
          socialButtons.push(Markup.button.url(buttonText, cleanedUrl));
          if (process.env.DEBUG_SOCIAL_MEDIA === 'true') {
            console.log(`📱 Bouton réseau social créé: ${buttonText} -> ${cleanedUrl}`);
          }
          
          // Créer une nouvelle rangée tous les 2 boutons
          if (socialButtons.length === 2 || index === activeSocials.length - 1) {
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
  
  // Services disponibles - SUPPRIMÉS (postal, meetup, livraison)
  // Les boutons de services ont été retirés selon la demande
  
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
  
  // Bouton vote interactif avec nombre de likes en temps réel
  let voteButtonText;
  
  // Vérification robuste qui gère les types number et string
  const hasVoted = userId && plug.likedBy && plug.likedBy.some(id => 
    id == userId || id === userId || String(id) === String(userId)
  );
  
  // Afficher le nombre de votes actuel
  const votesCount = plug.likes || 0;
  
  if (hasVoted) {
    // Trouver l'historique de vote de cet utilisateur
    const userVoteHistory = plug.likeHistory?.find(h => 
      h.userId == userId || h.userId === userId || String(h.userId) === String(userId)
    );
    
    if (userVoteHistory) {
      const lastVoteTime = new Date(userVoteHistory.timestamp);
      const now = new Date();
      const timeDiff = now - lastVoteTime;
      const cooldownTime = 2 * 60 * 60 * 1000; // 2 heures
      
      if (timeDiff < cooldownTime) {
        const remainingTime = cooldownTime - timeDiff;
        const hours = Math.floor(remainingTime / (60 * 60 * 1000));
        const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
        
        voteButtonText = `👍 Déjà voté (${votesCount}) - ${hours}h${minutes}m`;
      } else {
        voteButtonText = `👍 Voter Pour ce Plug (${votesCount})`;
      }
    } else {
      voteButtonText = `👍 Voter Pour ce Plug (${votesCount})`;
    }
  } else {
    voteButtonText = `👍 Voter Pour ce Plug (${votesCount})`;
  }
  
  buttons.push([Markup.button.callback(voteButtonText, `like_${plug._id}`)]);
  
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
    // Services supprimés - plus de retour vers les services
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
    // Services supprimés - plus d'actions de retour vers les services
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
    
    // Format optimisé : Pays + Nom + 👍 + Votes (sans troncature)
    // 🇫🇷 NOM BOUTIQUE 👍12
    // 📦 📍 🛵 ⭐
    
    // Format inspiré d'autres bots : 🇫🇷[NOM COMPLET]👍[VOTES] (+ ⭐ pour VIP)
    const votesCount = plug.likes || 0;
    // Pas de limite de caractères - noms complets comme "LA FLECHE COFFEE 33"
    const cardText = plug.isVip ? 
      `🇫🇷${plug.name.toUpperCase()}👍${votesCount}⭐` :
      `🇫🇷${plug.name.toUpperCase()}👍${votesCount}`;
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
    // Format VIP spécial : Pays + Nom + ⭐ + 👍 + Votes
    // 🇫🇷 NOM BOUTIQUE ⭐ 👍12
    // 📦 📍 🛵
    
    // Format VIP complet : 🇫🇷[NOM COMPLET]👍[VOTES]⭐
    const votesCount = plug.likes || 0;
    // Noms complets pour VIP aussi
    const cardText = `🇫🇷${plug.name.toUpperCase()}👍${votesCount}⭐`;
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