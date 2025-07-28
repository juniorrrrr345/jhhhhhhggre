const { Markup } = require('telegraf');
const { getTranslation } = require('./translations');
const Config = require('../models/Config');

// Fonction pour obtenir le drapeau d'un pays
const getCountryFlag = (country) => {
  const countryFlags = {
    'france': '🇫🇷',
    'belgique': '🇧🇪',
    'belgium': '🇧🇪',
    'suisse': '🇨🇭',
    'switzerland': '🇨🇭',
    'luxembourg': '🇱🇺',
    'allemagne': '🇩🇪',
    'germany': '🇩🇪',
    'italie': '🇮🇹',
    'italy': '🇮🇹',
    'espagne': '🇪🇸',
    'spain': '🇪🇸',
    'pays-bas': '🇳🇱',
    'netherlands': '🇳🇱',
    'portugal': '🇵🇹',
    'royaume-uni': '🇬🇧',
    'uk': '🇬🇧',
    'canada': '🇨🇦',
    'maroc': '🇲🇦',
    'morocco': '🇲🇦'
  };
  
  if (!country) return '🌍';
  
  const normalizedCountry = country.toLowerCase().trim();
  return countryFlags[normalizedCountry] || '🌍';
};

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
  
  // Première ligne : MiniApp FindYourPlugs
  buttons.push([Markup.button.webApp('MINI-APP 🔌', 'https://sfeplugslink.vercel.app/shop')]);
  
  // Deuxième ligne : Bouton Voter pour votre plug avec traduction
  const topPlugsText = config?.buttons?.topPlugs?.text || getTranslation('menu_topPlugs', currentLang, customTranslations);
  buttons.push([Markup.button.callback('VOTER POUR VOTRE PLUG 🗳️', 'top_plugs')]);
  
  // Troisième ligne : Boutons Contact et Info sur la même ligne avec traductions
  const secondRow = [];
  // Utiliser les traductions en priorité, puis fallback sur config panel admin
  const contactText = getTranslation('menu_contact', currentLang, customTranslations) || config?.buttons?.contact?.text;
  const infoText = getTranslation('menu_info', currentLang, customTranslations) || config?.buttons?.info?.text;
  
  secondRow.push(Markup.button.callback(contactText, 'contact'));
  secondRow.push(Markup.button.callback(infoText, 'info'));
  buttons.push(secondRow);

      // Quatrième ligne : Inscription seul
  const becomeDealerText = getTranslation('menu_inscription', currentLang, customTranslations) || '📋 Inscription';
  buttons.push([Markup.button.callback(becomeDealerText, 'start_application')]);
  
  // Cinquième ligne : Bouton Traduction seul en bas
  const translationText = getTranslation('menu_changeLanguage', currentLang, customTranslations) || '🗣️ Change language';
  buttons.push([Markup.button.callback(translationText, 'select_language')]);
  
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
  
  // Bouton "Actualiser" tout en bas du menu
  const refreshText = getTranslation('menu_refresh', currentLang, customTranslations) || '🔄 Actualiser';
  buttons.push([Markup.button.callback(refreshText, 'refresh_and_main')]);
  
  return Markup.inlineKeyboard(buttons);
};



// Fonction supprimée - remplacée par la version avec traductions plus bas

// Clavier des services
const createServicesKeyboard = (config) => {
  // Récupérer la langue actuelle
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;
  
  const deliveryText = config?.botTexts?.deliveryServiceText || `🚚 ${getTranslation('service_delivery', currentLang, customTranslations)}`;
  const postalText = config?.botTexts?.postalServiceText || `✈️ ${getTranslation('service_postal', currentLang, customTranslations)}`;
  const meetupText = config?.botTexts?.meetupServiceText || `🏠 ${getTranslation('service_meetup', currentLang, customTranslations)}`;
  const backText = config?.botTexts?.backButtonText || `🔙 ${getTranslation('back_to_menu', currentLang, customTranslations)}`;
  
  return Markup.inlineKeyboard([
    [Markup.button.callback(deliveryText, 'service_delivery')],
    [Markup.button.callback(meetupText, 'service_meetup')],
    [Markup.button.callback(postalText, 'service_postal')],
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
  
  // Récupérer la langue depuis une config globale (à améliorer)
  const backText = `🔙 ${getTranslation('back_to_menu', 'fr', null)}`;
  buttons.push([Markup.button.callback(backText, 'top_plugs')]);
  return Markup.inlineKeyboard(buttons);
};

// Clavier pour un plug spécifique
const createPlugKeyboard = (plug, returnContext = 'top_plugs', userId = null, currentLang = 'fr', customTranslations = null) => {
  const buttons = [];
  
  // Import de getTranslation si pas déjà disponible
  const { getTranslation } = require('./translations');
  
  // Vérifier l'état du vote pour ce user et ce plug
  const votesCount = plug.likes || 0;
  let voteButtonText;
  
  if (userId && plug.likedBy && plug.likedBy.includes(userId)) {
    // L'utilisateur a déjà voté, vérifier le cooldown
    const userLikeHistory = plug.likeHistory?.find(h => h.userId == userId);
    
    if (userLikeHistory) {
      const lastLikeTime = new Date(userLikeHistory.timestamp);
      const now = new Date();
      const timeDiff = now - lastLikeTime;
      const cooldownTime = 2 * 60 * 60 * 1000; // 2 heures
      
      if (timeDiff < cooldownTime) {
        // Encore en cooldown
        const remainingTime = cooldownTime - timeDiff;
        const hours = Math.floor(remainingTime / (60 * 60 * 1000));
        const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
        
        voteButtonText = `👍 Déjà voté (${votesCount}) - ${hours}h${minutes}m`;
      } else {
        // Cooldown terminé, peut voter à nouveau
        const voteForShopText = getTranslation('vote_for_shop', currentLang, customTranslations);
        voteButtonText = `👍 ${voteForShopText} (${votesCount})`;
      }
    } else {
      // A voté mais pas d'historique (ancien système), assumer cooldown actif
      voteButtonText = `👍 Déjà voté (${votesCount}) - 2h`;
    }
  } else {
    // N'a pas encore voté
    const voteForShopText = getTranslation('vote_for_shop', currentLang, customTranslations);
    voteButtonText = `👍 ${voteForShopText} (${votesCount})`;
  }
  
  buttons.push([Markup.button.callback(voteButtonText, `like_${plug._id}`)]);
  
  // Deuxième ligne : Bouton de retour avec traduction
  let backButtonText;
  let backAction;
  
  if (returnContext === 'top_plugs') {
    backButtonText = getTranslation('back_to_filters', currentLang, customTranslations);
    backAction = 'top_plugs';
  } else if (returnContext === 'referral') {
    backButtonText = getTranslation('back_to_menu', currentLang, customTranslations);
    backAction = 'back_main';
  } else {
    backButtonText = getTranslation('back_to_filters', currentLang, customTranslations);
    backAction = 'top_plugs';
  }
  
  buttons.push([Markup.button.callback(`🔙 ${backButtonText}`, backAction)]);
  
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

// Clavier avec pagination pour les plugs
const createPlugsKeyboard = async (plugs, page = 0, context = 'plugs', itemsPerPage = 8) => {
  // Récupérer la langue actuelle depuis la base de données
  let currentLang = 'fr';
  let customTranslations = null;
  
  try {
    const Config = require('../models/Config');
    const config = await Config.findById('main');
    currentLang = config?.languages?.currentLanguage || 'fr';
    customTranslations = config?.languages?.translations;
  } catch (error) {
    console.log('⚠️ Impossible de récupérer la config pour les traductions, utilisation du français par défaut');
  }
  
  const { getTranslation } = require('./translations');
  
  const buttons = [];
  
  const totalPages = Math.ceil(plugs.length / itemsPerPage);
  const startIndex = page * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, plugs.length);
  
  // Plugs de la page actuelle avec format uniforme et bien aligné
  for (let i = startIndex; i < endIndex; i++) {
    const plug = plugs[i];
    
    // Format amélioré pour meilleure lisibilité avec traductions :
    // 🇧🇪 NOM BOUTIQUE
    // 📦 🏠 ✈️
    // 👍 12 votes
    
    const votesCount = plug.likes || 0;
    const voteText = votesCount === 1 ? 
      getTranslation('vote_count_singular', currentLang, customTranslations) : 
      getTranslation('vote_count_plural', currentLang, customTranslations);
    
    // Première ligne : Pays + Nom (+ VIP si applicable)
    let cardTitle = `${getCountryFlag(plug.country)} ${plug.name.toUpperCase()}`;
    if (plug.isVip) {
      cardTitle += ' ⭐';
    }
    
    // Deuxième ligne : Services disponibles
    const serviceIcons = [];
    if (plug.services?.delivery?.enabled) serviceIcons.push('📦');
    if (plug.services?.meetup?.enabled) serviceIcons.push('🏠'); 
    if (plug.services?.postal?.enabled) serviceIcons.push('✈️');
    
    const servicesLine = serviceIcons.length > 0 ? `\n${serviceIcons.join(' ')}` : '';
    
    // Troisième ligne : Votes avec traduction
    const votesLine = `\n👍 ${votesCount} ${voteText}`;
    
    const cardText = cardTitle + servicesLine + votesLine;
    
    buttons.push([Markup.button.callback(cardText, `plug_${plug._id}_from_${context}`)]);
  }
  
  // Navigation avec traductions
  if (totalPages > 1) {
    const navButtons = [];
    if (page > 0) {
      navButtons.push(Markup.button.callback('⬅️', `page_${context}_${page - 1}`));
    }
    const pageText = getTranslation('page_info', currentLang, customTranslations);
    navButtons.push(Markup.button.callback(`${pageText} ${page + 1}/${totalPages}`, 'current_page'));
    if (page < totalPages - 1) {
      navButtons.push(Markup.button.callback('➡️', `page_${context}_${page + 1}`));
    }
    buttons.push(navButtons);
  }
  
  // Retour vers le menu des filtres avec traduction
  const backText = getTranslation('back_to_filters', currentLang, customTranslations);
  buttons.push([Markup.button.callback(`🔙 ${backText}`, 'top_plugs')]);
  
  return Markup.inlineKeyboard(buttons);
};

// Clavier VIP pour la section VIP
const createVIPKeyboard = (vipPlugs) => {
  // Récupérer la langue actuelle  
  const { getTranslation } = require('./translations');
  let currentLang = 'fr';
  let customTranslations = null;
  
  const buttons = [];
  
  vipPlugs.forEach(plug => {
    // Format VIP uniforme avec celui des autres cartes et traductions
    const votesCount = plug.likes || 0;
    const voteText = votesCount === 1 ? 
      getTranslation('vote_count_singular', currentLang, customTranslations) : 
      getTranslation('vote_count_plural', currentLang, customTranslations);
    
    // Première ligne : Pays + Nom + VIP
    let cardTitle = `${getCountryFlag(plug.country)} ${plug.name.toUpperCase()} ⭐`;
    
    // Deuxième ligne : Services disponibles
    const serviceIcons = [];
    if (plug.services?.delivery?.enabled) serviceIcons.push('📦');
    if (plug.services?.meetup?.enabled) serviceIcons.push('🏠'); 
    if (plug.services?.postal?.enabled) serviceIcons.push('✈️');
    
    const servicesLine = serviceIcons.length > 0 ? `\n${serviceIcons.join(' ')}` : '';
    
    // Troisième ligne : Votes avec traduction
    const votesLine = `\n👍 ${votesCount} ${voteText}`;
    
    const cardText = cardTitle + servicesLine + votesLine;
    
    buttons.push([Markup.button.callback(cardText, `plug_${plug._id}_from_plugs_vip`)]);
  });
  
  // Retour vers le menu principal pour VIP avec traduction
  const backText = getTranslation('back_to_menu', currentLang, customTranslations);
  buttons.push([Markup.button.callback(`🔙 ${backText}`, 'back_main')]);
  
  return Markup.inlineKeyboard(buttons);
};

// Clavier principal des filtres pour les plugs avec traductions
const createPlugsFilterKeyboard = (currentLang = 'fr', customTranslations = null) => {
  const { getTranslation } = require('./translations');
  
  const allShopsText = getTranslation('all_shops', currentLang, customTranslations);
  const filterServiceText = getTranslation('filter_by_service', currentLang, customTranslations);
  const filterCountryText = getTranslation('filter_by_country', currentLang, customTranslations);
  const backText = getTranslation('back_to_menu', currentLang, customTranslations);
  
  return Markup.inlineKeyboard([
    [Markup.button.callback(`📋 ${allShopsText}`, 'all_plugs')],
    [Markup.button.callback(`🔧 ${filterServiceText}`, 'filter_service')],
    [Markup.button.callback(`🌍 ${filterCountryText}`, 'filter_country')],
    [Markup.button.callback(`🔙 ${backText}`, 'back_main')]
  ]);
};


module.exports = {
  createMainKeyboard,
  createPlugsFilterKeyboard,
  createServicesKeyboard,
  createCountriesKeyboard,
  createPlugKeyboard,
  createPlugsKeyboard,
  createVIPKeyboard
};