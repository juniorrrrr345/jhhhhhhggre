const { Markup } = require('telegraf');

// Clavier principal de la page d'accueil
const createMainKeyboard = (config) => {
  const buttons = [];
  
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
  
  // Réseaux sociaux
  const socialRow = [];
  if (config.socialMedia.telegram) {
    socialRow.push(Markup.button.url('📱 Telegram', config.socialMedia.telegram));
  }
  if (config.socialMedia.instagram) {
    socialRow.push(Markup.button.url('📸 Instagram', config.socialMedia.instagram));
  }
  if (socialRow.length > 0) {
    buttons.push(socialRow);
  }
  
  const socialRow2 = [];
  if (config.socialMedia.whatsapp) {
    socialRow2.push(Markup.button.url('💬 WhatsApp', config.socialMedia.whatsapp));
  }
  if (config.socialMedia.website) {
    socialRow2.push(Markup.button.url('🌐 Site Web', config.socialMedia.website));
  }
  if (socialRow2.length > 0) {
    buttons.push(socialRow2);
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
const createPlugKeyboard = (plug, returnContext = 'top_plugs') => {
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
  
  // Réseaux sociaux du plug
  const socialButtons = [];
  if (plug.socialMedia.telegram) {
    socialButtons.push(Markup.button.url('📱 Telegram', plug.socialMedia.telegram));
  }
  if (plug.socialMedia.instagram) {
    socialButtons.push(Markup.button.url('📸 Instagram', plug.socialMedia.instagram));
  }
  if (socialButtons.length > 0) {
    buttons.push(socialButtons);
  }
  
  const socialButtons2 = [];
  if (plug.socialMedia.whatsapp) {
    socialButtons2.push(Markup.button.url('💬 WhatsApp', plug.socialMedia.whatsapp));
  }
  if (plug.socialMedia.website) {
    socialButtons2.push(Markup.button.url('🌐 Site', plug.socialMedia.website));
  }
  if (socialButtons2.length > 0) {
    buttons.push(socialButtons2);
  }
  
  // Bouton like
  buttons.push([Markup.button.callback('👤 Liker cette boutique', `like_${plug._id}`)]);
  
  // Bouton retour intelligent selon le contexte
  const returnText = getReturnButtonText(returnContext);
  buttons.push([Markup.button.callback(returnText, returnContext)]);
  
  return Markup.inlineKeyboard(buttons);
};

// Fonction pour obtenir le texte du bouton retour selon le contexte
const getReturnButtonText = (context) => {
  switch(context) {
    case 'top_plugs':
      return '🔙 Retour aux filtres';
    case 'all':
      return '🔙 Retour à la liste';
    case 'plugs_all':
      return '🔙 Retour à la liste';
    case 'plugs_vip':
      return '🔙 Retour aux VIP';
    case 'service_delivery':
    case 'service_postal':
    case 'service_meetup':
      return '🔙 Retour aux services';
    default:
      return '🔙 Retour';
  }
};

// Clavier pour la liste des plugs
const createPlugListKeyboard = (plugs, page = 0, totalPages = 1, context = 'all') => {
  const buttons = [];
  const itemsPerPage = 5;
  const startIndex = page * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, plugs.length);
  
  // Plugs de la page actuelle
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
  if (context === 'all') {
    returnAction = 'top_plugs'; // Retour vers le menu des filtres
  } else if (context === 'plugs_vip') {
    returnAction = 'back_main'; // Retour vers menu principal pour VIP
  }
  buttons.push([Markup.button.callback('🔙 Retour', returnAction)]);
  
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