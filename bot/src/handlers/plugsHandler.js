const { Markup } = require('telegraf');
const Plug = require('../models/Plug');
const Config = require('../models/Config');
const { 
  createPlugsFilterKeyboard, 
  createServicesKeyboard, 
  createCountriesKeyboard,
  createPlugsKeyboard,
  createPlugKeyboard
} = require('../utils/keyboards');
const { sendMessageWithImage, editMessageWithImage, sendPlugWithImage } = require('../utils/messageHelper');
const { getTranslation, translateDescription } = require('../utils/translations');
const postalCodeService = require('../services/postalCodeService');

// 🚫 PRÉVENTION SPAM - Stockage des derniers états
const lastUserState = new Map();

// Fonction pour vérifier si c'est un spam (même action répétée)
const isSpamClick = (userId, action, params = '') => {
  const currentState = `${action}:${params}`;
  const lastState = lastUserState.get(userId);
  
  if (lastState === currentState) {
    return true; // C'est un spam
  }
  
  lastUserState.set(userId, currentState);
  return false; // Pas un spam
};

// 🔘 SYSTÈME TOP PLUGS - Bouton principal avec pays, filtres et liste
const handleTopPlugs = async (ctx) => {
  try {
    await ctx.answerCbQuery();
    
    // Récupérer la config pour les traductions
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    console.log(`🔝 Top Plugs affiché en langue: ${currentLang}`);
    
    // Récupérer tous les plugs actifs triés par votes
    const allPlugs = await Plug.find({ isActive: true })
      .sort({ likes: -1, createdAt: -1 });

    // Récupérer les pays disponibles dynamiquement
    const availableCountries = await getAvailableCountries();
    
    // Message d'affichage initial avec traduction
    const topPlugsTitle = getTranslation('menu_topPlugs', currentLang, customTranslations);
    let message = `${topPlugsTitle}\n`;
    message += `*(${getTranslation('messages_sortedByVotes', currentLang, customTranslations)})*\n\n`;
    
    // Message explicatif pour les utilisateurs
    const helpMessage = getTranslation('messages_topPlugsHelp', currentLang, customTranslations);
    message += `💡 **${helpMessage}**\n`;
    message += `• ${getTranslation('messages_selectCountry', currentLang, customTranslations)}\n`;
    message += `• ${getTranslation('messages_selectService', currentLang, customTranslations)}\n`;
    message += `• ${getTranslation('messages_selectPostalCode', currentLang, customTranslations)}\n`;
    message += `• ${getTranslation('messages_findShops', currentLang, customTranslations)}\n\n`;
    
    // Afficher les premiers plugs (top 10 par défaut)
    const topPlugs = allPlugs.slice(0, 10);
    let keyboard;
    
    if (topPlugs.length > 0) {
      const shopsAvailableText = getTranslation('messages_shopsAvailable', currentLang, customTranslations);
      message += `**${topPlugs.length} ${shopsAvailableText} :**\n\n`;
      
      // Ajouter les boutiques au clavier
      const plugButtons = [];
      topPlugs.forEach((plug, index) => {
        const country = getCountryFlag(plug.countries[0]);
        const location = plug.location ? ` ${plug.location}` : '';
        const vipIcon = plug.isVip ? '⭐️ ' : '';
        const buttonText = `${country}${location} ${vipIcon}${plug.name} 👍 ${plug.likes}`;
        plugButtons.push([Markup.button.callback(buttonText, `plug_${plug._id}_from_top_plugs`)]);
      });
      
      keyboard = createTopPlugsKeyboard(config, availableCountries, [], null, plugButtons);
      // Les filtres sont maintenant en haut, les boutiques en bas via la fonction createTopPlugsKeyboard
    } else {
      const noShopsText = getTranslation('messages_noShops', currentLang, customTranslations);
      message += noShopsText;
      keyboard = createTopPlugsKeyboard(config, availableCountries, [], null, null);
    }
    
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Erreur dans handleTopPlugs:', error);
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    await ctx.answerCbQuery(getTranslation('error_loading', currentLang, customTranslations)).catch(() => {});
  }
};

// Gestionnaire pour les filtres de pays - NOUVEAU SYSTÈME
const handleTopCountryFilter = async (ctx, country) => {
  try {
    const userId = ctx.from.id;
    
    // 🚫 Prévention spam
    if (isSpamClick(userId, 'country', country)) {
      await ctx.answerCbQuery('🔄');
      return;
    }
    
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    
    // Filtrer les plugs par pays
    const countryPlugs = await Plug.find({ 
      isActive: true,
      countries: { $in: [country] }
    }).sort({ likes: -1, createdAt: -1 });

    const availableCountries = await getAvailableCountries();
    
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    let message = `${getTranslation('list_plugs_title', currentLang, customTranslations)}\n`;
    message += `*${getTranslation('sorted_by_votes_subtitle', currentLang, customTranslations)}*\n\n`;
    
    const filterLabel = getTranslation('filter_country_selected', currentLang, customTranslations);
    message += `🌍 **${filterLabel}:** ${getCountryFlag(country)} ${country}\n\n`;
    
    let keyboard;
    
    if (countryPlugs.length > 0) {
      const shopsFoundLabel = getTranslation('shops_found_country', currentLang, customTranslations);
      message += `**${countryPlugs.length} ${shopsFoundLabel} :**\n\n`;
      
      // Ajouter les boutiques au clavier
      const plugButtons = [];
      countryPlugs.slice(0, 10).forEach((plug, index) => {
        const countryFlag = getCountryFlag(plug.countries[0]);
        const location = plug.location ? ` ${plug.location}` : '';
        const vipIcon = plug.isVip ? '⭐️ ' : '';
        const buttonText = `${countryFlag}${location} ${vipIcon}${plug.name} 👍 ${plug.likes}`;
        plugButtons.push([Markup.button.callback(buttonText, `plug_${plug._id}_from_top_country`)]);
      });
      
      keyboard = createTopPlugsKeyboard(config, availableCountries, country, null, plugButtons);
    } else {
      const noShopsLabel = getTranslation('no_shops_country', currentLang, customTranslations);
      message += `❌ ${noShopsLabel} ${country}.`;
      keyboard = createTopPlugsKeyboard(config, availableCountries, country, null, []);
    }
    
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Erreur dans handleTopCountryFilter:', error);
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    await ctx.answerCbQuery(getTranslation('error_filtering', currentLang, customTranslations)).catch(() => {});
  }
};

// Gestionnaire pour les filtres de services (Livraison, Meetup, Postal) - SYSTÈME TRADUIT
const handleTopServiceFilter = async (ctx, serviceType, selectedCountry = null) => {
  try {
    const userId = ctx.from.id;
    
    // 🚫 Prévention spam
    if (isSpamClick(userId, 'service', `${serviceType}_${selectedCountry || 'none'}`)) {
      await ctx.answerCbQuery('🔄');
      return;
    }
    
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    const availableCountries = await getAvailableCountries();
    
    let message = `${getTranslation('list_plugs_title', currentLang, customTranslations)}\n`;
    message += `*${getTranslation('sorted_by_votes_subtitle', currentLang, customTranslations)}*\n\n`;
    
    // Message spécifique selon le service avec traductions complètes
    const serviceMessages = {
      delivery: getTranslation('filter_delivery_message', currentLang, customTranslations),
      meetup: getTranslation('filter_meetup_message', currentLang, customTranslations),
      postal: getTranslation('filter_postal_message', currentLang, customTranslations)
    };
    
    message += `${serviceMessages[serviceType]}\n\n`;
    
    if (selectedCountry) {
      const filterLabel = getTranslation('filter_country_selected', currentLang, customTranslations);
      message += `🌍 **${filterLabel}:** ${getCountryFlag(selectedCountry)} ${selectedCountry}\n\n`;
    }
    
    let keyboard;
    
    // Pour Envoi Postal : afficher directement les boutiques
    if (serviceType === 'postal') {
      const query = { 
        isActive: true,
        'services.postal.enabled': true
      };
      
      if (selectedCountry) {
        query.countries = { $in: [selectedCountry] };
      }
      
      const postalPlugs = await Plug.find(query).sort({ likes: -1, createdAt: -1 });
      
      if (postalPlugs.length > 0) {
        const shopsFoundLabel = getTranslation('shops_found_postal', currentLang, customTranslations);
        message += `**${postalPlugs.length} ${shopsFoundLabel} :**\n\n`;
        
        const plugButtons = [];
        postalPlugs.slice(0, 10).forEach((plug) => {
          const country = getCountryFlag(plug.countries[0]);
          const location = plug.location ? ` ${plug.location}` : '';
          const vipIcon = plug.isVip ? '⭐️ ' : '';
          const buttonText = `${country}${location} ${vipIcon}${plug.name} 👍 ${plug.likes}`;
          plugButtons.push([Markup.button.callback(buttonText, `plug_${plug._id}_from_top_service`)]);
        });
        
        keyboard = createTopPlugsKeyboard(config, availableCountries, selectedCountry, serviceType, plugButtons);
      } else {
        const noShopsLabel = getTranslation('no_shops_postal', currentLang, customTranslations);
        message += `❌ ${noShopsLabel}`;
        keyboard = createTopPlugsKeyboard(config, availableCountries, selectedCountry, serviceType, []);
      }
    } else {
      // Pour Livraison et Meetup : afficher directement toutes les boutiques de ce service
      const query = { 
        isActive: true,
        [`services.${serviceType}.enabled`]: true
      };
      
      if (selectedCountry) {
        query.countries = { $in: [selectedCountry] };
      }
      
      const servicePlugs = await Plug.find(query).sort({ likes: -1, createdAt: -1 });
      
      if (servicePlugs.length > 0) {
        const shopsFoundLabel = serviceType === 'delivery' 
          ? getTranslation('shops_found_delivery', currentLang, customTranslations)
          : getTranslation('shops_found_meetup', currentLang, customTranslations);
        message += `**${servicePlugs.length} ${shopsFoundLabel} :**\n\n`;
        
        // Ajouter instruction pour filtre département en bas
        const instructionLabel = getTranslation('click_department_instruction', currentLang, customTranslations);
        message += `ℹ️ ${instructionLabel}\n\n`;
        
        const plugButtons = [];
        servicePlugs.slice(0, 10).forEach((plug) => {
          const country = getCountryFlag(plug.countries[0]);
          const location = plug.location ? ` ${plug.location}` : '';
          const vipIcon = plug.isVip ? '⭐️ ' : '';
          const buttonText = `${country}${location} ${vipIcon}${plug.name} 👍 ${plug.likes}`;
          plugButtons.push([Markup.button.callback(buttonText, `plug_${plug._id}_from_top_service`)]);
        });
        
        keyboard = createTopPlugsKeyboard(config, availableCountries, selectedCountry, serviceType, plugButtons);
      } else {
        const noShopsLabel = serviceType === 'delivery' 
          ? getTranslation('no_shops_delivery', currentLang, customTranslations)
          : getTranslation('no_shops_meetup', currentLang, customTranslations);
        message += `❌ ${noShopsLabel}`;
        keyboard = createTopPlugsKeyboard(config, availableCountries, selectedCountry, serviceType, []);
      }
    }
    
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Erreur dans handleTopServiceFilter:', error);
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    await ctx.answerCbQuery(getTranslation('error_filtering', currentLang, customTranslations)).catch(() => {});
  }
};

// 🗺️ NOUVEAU: Gestionnaire pour les codes postaux (remplace départements)
const handlePostalCodeFilter = async (ctx, serviceType, selectedCountry = null, page = 0) => {
  try {
    const userId = ctx.from.id;
    
    // 🚫 Prévention spam
    if (isSpamClick(userId, 'postal', `${serviceType}_${selectedCountry || 'none'}_${page}`)) {
      await ctx.answerCbQuery('🔄');
      return;
    }
    
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    // Si pas de pays sélectionné, afficher seulement les pays avec des boutiques pour ce service
    if (!selectedCountry) {
      // Récupérer seulement les pays avec des boutiques actives pour ce service
      let query = { isActive: true };
      
      if (serviceType === 'delivery') {
        query['services.delivery.enabled'] = true;
      } else if (serviceType === 'meetup') {
        query['services.meetup.enabled'] = true;
      }
      
      const shopsWithService = await Plug.find(query);
      const countriesWithShops = [...new Set(shopsWithService.flatMap(shop => shop.countries))];
      
      if (countriesWithShops.length === 0) {
        message += `❌ ${getTranslation('messages_noPlugsInPostalCode', currentLang, customTranslations)}`;
        
        const keyboard = {
          inline_keyboard: [
            [{
              text: '🔙 Retour',
              callback_data: 'top_plugs'
            }]
          ]
        };
        
        await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
        return;
      }
      
      let message = `📍 **${getTranslation('filter_department_available', currentLang, customTranslations)}**\n\n`;
      
      if (serviceType === 'delivery') {
        const serviceName = getTranslation('service_delivery', currentLang, customTranslations);
        const serviceLabel = getTranslation('service_label', currentLang, customTranslations);
        message += `📦 **${serviceLabel}:** ${serviceName}\n`;
      } else if (serviceType === 'meetup') {
        const serviceName = getTranslation('service_meetup', currentLang, customTranslations);
        const serviceLabel = getTranslation('service_label', currentLang, customTranslations);
        message += `🤝 **${serviceLabel}:** ${serviceName}\n`;
      }
      
      message += `\n${getTranslation('messages_selectCountry', currentLang, customTranslations)}\n`;
      message += `🏪 **Pays avec boutiques disponibles:**\n`;
      
      // Afficher seulement les pays avec des boutiques
      countriesWithShops.forEach(country => {
        const shopsInCountry = shopsWithService.filter(shop => shop.countries.includes(country));
        message += `${getCountryFlag(country)} ${country}: ${shopsInCountry.length} boutique${shopsInCountry.length > 1 ? 's' : ''}\n`;
      });
      
      // Créer clavier avec seulement les pays ayant des boutiques
      const countryButtons = [];
      for (let i = 0; i < countriesWithShops.length; i += 2) {
        const row = [];
        const country1 = countriesWithShops[i];
        const country2 = countriesWithShops[i + 1];
        
        row.push({
          text: `${getCountryFlag(country1)} ${country1}`,
          callback_data: `postal_country_${serviceType}_${country1}`
        });
        
        if (country2) {
          row.push({
            text: `${getCountryFlag(country2)} ${country2}`,
            callback_data: `postal_country_${serviceType}_${country2}`
          });
        }
        
        countryButtons.push(row);
      }
      
      // Bouton retour
      countryButtons.push([{
        text: '🔙 Retour',
        callback_data: 'top_plugs'
      }]);
      
      const keyboard = { inline_keyboard: countryButtons };
      
      await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
      return;
    }
    
    // Créer le clavier avec les codes postaux du pays
    const keyboard = postalCodeService.createPostalCodeKeyboard(selectedCountry, page);
    
    let message = `📍 **${getTranslation('filter_department_available', currentLang, customTranslations)}**\n\n`;
    
    if (serviceType === 'delivery') {
      const serviceName = getTranslation('service_delivery', currentLang, customTranslations);
      const serviceLabel = getTranslation('service_label', currentLang, customTranslations);
      message += `📦 **${serviceLabel}:** ${serviceName}\n`;
    } else if (serviceType === 'meetup') {
      const serviceName = getTranslation('service_meetup', currentLang, customTranslations);
      const serviceLabel = getTranslation('service_label', currentLang, customTranslations);
      message += `🤝 **${serviceLabel}:** ${serviceName}\n`;
    }
    
    const countryLabel = getTranslation('country_label', currentLang, customTranslations);
    message += `🌍 **${countryLabel}:** ${getCountryFlag(selectedCountry)} ${selectedCountry}\n`;
    
    const postalCodes = postalCodeService.getPostalCodes(selectedCountry);
    message += `\n📮 **Codes postaux disponibles:** ${postalCodes.length.toLocaleString()}\n`;
    message += `📄 **Page:** ${page + 1}\n\n`;
    message += `💡 *Cliquez sur un code postal pour voir les boutiques disponibles*`;
    
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Erreur dans handlePostalCodeFilter:', error);
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    await ctx.answerCbQuery(getTranslation('error_filtering', currentLang, customTranslations)).catch(() => {});
  }
};

// 🏪 NOUVEAU: Gestionnaire pour afficher les boutiques par code postal
const handleShopsByPostalCode = async (ctx, country, postalCode, serviceType = null) => {
  try {
    const userId = ctx.from.id;
    
    // 🚫 Prévention spam
    if (isSpamClick(userId, 'shops_postal', `${country}_${postalCode}_${serviceType || 'all'}`)) {
      await ctx.answerCbQuery('🔄');
      return;
    }
    
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    // Rechercher les boutiques qui desservent ce code postal
    let query = { 
      isActive: true,
      countries: { $in: [country] }
    };
    
    // Filtrer par service si spécifié
    if (serviceType === 'delivery') {
      query['services.delivery.enabled'] = true;
      query['services.delivery.departments'] = { $in: [postalCode] };
    } else if (serviceType === 'meetup') {
      query['services.meetup.enabled'] = true;
      query['services.meetup.departments'] = { $in: [postalCode] };
    } else if (serviceType === 'postal') {
      query['services.postal.enabled'] = true;
    }
    
    const shops = await Plug.find(query).sort({ likes: -1, createdAt: -1 });
    
    let message = `📍 **${getCountryFlag(country)} ${country} - ${postalCode}**\n\n`;
    
    if (serviceType) {
      const serviceName = getTranslation(`service_${serviceType}`, currentLang, customTranslations);
      const serviceLabel = getTranslation('service_label', currentLang, customTranslations);
      message += `🎯 **${serviceLabel}:** ${serviceName}\n\n`;
    }
    
    if (shops.length === 0) {
      // Message "Désolé Nous Avons Pas De Plugs 😕"
      message += `${getTranslation('messages_noPlugsInPostalCode', currentLang, customTranslations)}`;
      
      const keyboard = {
        inline_keyboard: [
          [{
            text: '🔙 Retour aux codes postaux',
            callback_data: `postal_nav_${country}_0`
          }],
          [{
            text: '🔄 Réinitialiser les filtres',
            callback_data: 'top_reset_filters'
          }]
        ]
      };
      
      await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
      return;
    }
    
    // Afficher les boutiques trouvées
    const shopsAvailableText = getTranslation('messages_shopsAvailable', currentLang, customTranslations);
    message += `🏪 **${shops.length} ${shopsAvailableText} :**\n\n`;
    
    const keyboard = { inline_keyboard: [] };
    
    shops.forEach((shop, index) => {
      const vipIcon = shop.isVip ? '⭐️ ' : '';
      const buttonText = `${vipIcon}${shop.name} 👍 ${shop.likes}`;
      keyboard.inline_keyboard.push([{
        text: buttonText,
        callback_data: `plug_${shop._id}_from_postal`
      }]);
    });
    
    // Boutons de navigation
    keyboard.inline_keyboard.push([
      {
        text: '🔙 Retour aux codes postaux',
        callback_data: `postal_nav_${country}_0`
      }
    ]);
    
    keyboard.inline_keyboard.push([
      {
        text: '🔄 Réinitialiser les filtres',
        callback_data: 'top_reset_filters'
      }
    ]);
    
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Erreur dans handleShopsByPostalCode:', error);
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    await ctx.answerCbQuery(getTranslation('error_filtering', currentLang, customTranslations)).catch(() => {});
  }
};

// Gestionnaire pour les départements (delivery et meetup) - DEPRECATED, remplacé par codes postaux
const handleDepartmentFilter = async (ctx, serviceType, selectedCountry = null) => {
  // Rediriger vers le nouveau système de codes postaux
  return await handlePostalCodeFilter(ctx, serviceType, selectedCountry, 0);
};

// Gestionnaire pour un département spécifique
const handleSpecificDepartment = async (ctx, serviceType, department, selectedCountry = null) => {
  try {
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    
    // Construire la requête
    let query = { isActive: true };
    
    if (serviceType === 'delivery') {
      query['services.delivery.enabled'] = true;
      query['services.delivery.departments'] = { $in: [department] };
    } else if (serviceType === 'meetup') {
      query['services.meetup.enabled'] = true;
      query['services.meetup.departments'] = { $in: [department] };
    }
    
    if (selectedCountry) {
      query.countries = { $in: [selectedCountry] };
    }
    
    const deptPlugs = await Plug.find(query).sort({ likes: -1, createdAt: -1 });
    
    const availableCountries = await getAvailableCountries();
    
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    let message = `${getTranslation('list_plugs_title', currentLang, customTranslations)}\n`;
    message += `*${getTranslation('sorted_by_votes_subtitle', currentLang, customTranslations)}*\n\n`;
    
    if (serviceType === 'delivery') {
      const serviceName = getTranslation('service_delivery', currentLang, customTranslations);
      const serviceLabel = getTranslation('service_label', currentLang, customTranslations);
      message += `📦 **${serviceLabel}:** ${serviceName}\n`;
    } else if (serviceType === 'meetup') {
      const serviceName = getTranslation('service_meetup', currentLang, customTranslations);
      const serviceLabel = getTranslation('service_label', currentLang, customTranslations);
      message += `🤝 **${serviceLabel}:** ${serviceName}\n`;
    }
    
    const departmentLabel = getTranslation('department_label', currentLang, customTranslations);
    message += `📍 **${departmentLabel}:** ${department}\n`;
    
    if (selectedCountry) {
      const countryLabel = getTranslation('country_label', currentLang, customTranslations);
      message += `🌍 **${countryLabel}:** ${getCountryFlag(selectedCountry)} ${selectedCountry}\n`;
    }
    
    message += `\n`;
    
    let keyboard;
    
    if (deptPlugs.length > 0) {
      message += `**${deptPlugs.length} boutiques trouvées :**\n\n`;
      
      // Ajouter les boutiques au clavier
      const plugButtons = [];
      deptPlugs.slice(0, 10).forEach((plug, index) => {
        const country = getCountryFlag(plug.countries[0]);
        const location = plug.location ? ` ${plug.location}` : '';
        const vipIcon = plug.isVip ? '⭐️ ' : '';
        const buttonText = `${country}${location} ${vipIcon}${plug.name} 👍 ${plug.likes}`;
        plugButtons.push([Markup.button.callback(buttonText, `plug_${plug._id}_from_top_dept`)]);
      });
      
      keyboard = createTopPlugsKeyboard(config, availableCountries, selectedCountry, serviceType, plugButtons);
    } else {
      message += `❌ Aucun plug disponible dans le département ${department}.`;
      keyboard = createTopPlugsKeyboard(config, availableCountries, selectedCountry, serviceType, []);
    }
    
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Erreur dans handleSpecificDepartment:', error);
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    await ctx.answerCbQuery(getTranslation('error_filtering', currentLang, customTranslations)).catch(() => {});
  }
};

// Gestionnaire pour réinitialiser tous les filtres
const handleResetFilters = async (ctx) => {
  try {
    const userId = ctx.from.id;
    
    // 🚫 Prévention spam pour réinitialisation
    if (isSpamClick(userId, 'reset', 'filters')) {
      await ctx.answerCbQuery('🔄');
      return;
    }
    
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    await ctx.answerCbQuery(getTranslation('filters_reset', currentLang, customTranslations));
    
    // Effacer l'état utilisateur pour permettre une nouvelle sélection
    lastUserState.delete(userId);
    
    // REMPLACER le message existant au lieu de créer un nouveau
    // Récupérer tous les plugs actifs triés par votes
    const allPlugs = await Plug.find({ isActive: true })
      .sort({ likes: -1, createdAt: -1 });

    // Récupérer les pays disponibles dynamiquement
    const availableCountries = await getAvailableCountries();
    
    // Message d'affichage initial avec traduction
    const topPlugsTitle = getTranslation('menu_topPlugs', currentLang, customTranslations);
    let message = `${topPlugsTitle}\n`;
    message += `*(${getTranslation('messages_sortedByVotes', currentLang, customTranslations)})*\n\n`;
    
    // Afficher les premiers plugs (top 10 par défaut)
    const topPlugs = allPlugs.slice(0, 10);
    let keyboard;
    
    if (topPlugs.length > 0) {
      const shopsAvailableText = getTranslation('messages_shopsAvailable', currentLang, customTranslations);
      message += `**${topPlugs.length} ${shopsAvailableText} :**\n\n`;
      
      // Ajouter les boutiques au clavier
      const plugButtons = [];
      topPlugs.forEach((plug, index) => {
        const country = getCountryFlag(plug.countries[0]);
        const location = plug.location ? ` ${plug.location}` : '';
        const vipIcon = plug.isVip ? '⭐️ ' : '';
        const buttonText = `${country}${location} ${vipIcon}${plug.name} 👍 ${plug.likes}`;
        plugButtons.push([Markup.button.callback(buttonText, `plug_${plug._id}_from_top_plugs`)]);
      });
      
      keyboard = createTopPlugsKeyboard(config, availableCountries, [], null, plugButtons);
    } else {
      const noShopsText = getTranslation('messages_noShops', currentLang, customTranslations);
      message += noShopsText;
      keyboard = createTopPlugsKeyboard(config, availableCountries, [], null, null);
    }
    
    // ÉDITER le message existant au lieu d'en créer un nouveau - FORCER l'édition
    try {
      // Essayer d'abord d'éditer avec image
      if (config?.welcome?.image) {
        await ctx.editMessageMedia({
          type: 'photo',
          media: config.welcome.image || 'https://i.imgur.com/DD5OU6o.jpeg',
          caption: message,
          parse_mode: 'Markdown'
        }, {
          reply_markup: keyboard.reply_markup
        });
      } else {
        // Éditer seulement le texte si pas d'image
        await ctx.editMessageText(message, {
          reply_markup: keyboard.reply_markup,
          parse_mode: 'Markdown'
        });
      }
    } catch (editError) {
      console.log('⚠️ Erreur édition directe, tentative édition caption:', editError.message);
      try {
        // Fallback : éditer seulement le caption
        await ctx.editMessageCaption(message, {
          reply_markup: keyboard.reply_markup,
          parse_mode: 'Markdown'
        });
      } catch (captionError) {
        console.log('⚠️ Erreur édition caption, tentative édition texte:', captionError.message);
        // Dernier fallback : éditer seulement le texte
        await ctx.editMessageText(message, {
          reply_markup: keyboard.reply_markup,
          parse_mode: 'Markdown'
        });
      }
    }
    
  } catch (error) {
    console.error('Erreur dans handleResetFilters:', error);
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    await ctx.answerCbQuery(getTranslation('error_reset', currentLang, customTranslations)).catch(() => {});
  }
};

// === FONCTIONS UTILITAIRES ===

// Fonction pour récupérer les pays disponibles dynamiquement
const getAvailableCountries = async () => {
  try {
    const countries = await Plug.distinct('countries', { isActive: true });
    return countries.filter(country => country && country.trim() !== '');
  } catch (error) {
    console.error('Erreur récupération pays:', error);
    return ['France', 'Belgique', 'Suisse', 'Italie']; // Fallback
  }
};

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

// Récupérer les départements disponibles
const getAvailableDepartments = async (serviceType, selectedCountry = null) => {
  try {
    let query = { isActive: true };
    
    if (selectedCountry) {
      query.countries = { $in: [selectedCountry] };
    }
    
    if (serviceType === 'delivery') {
      query['services.delivery.enabled'] = true;
    } else if (serviceType === 'meetup') {
      query['services.meetup.enabled'] = true;
    }
    
    const plugs = await Plug.find(query);
    
    const departments = new Set();
    plugs.forEach(plug => {
      if (serviceType === 'delivery' && plug.services.delivery.departments) {
        plug.services.delivery.departments.forEach(dept => {
          if (dept && dept.trim() !== '') departments.add(dept.trim());
        });
      } else if (serviceType === 'meetup' && plug.services.meetup.departments) {
        plug.services.meetup.departments.forEach(dept => {
          if (dept && dept.trim() !== '') departments.add(dept.trim());
        });
      }
    });
    
    return Array.from(departments).sort();
  } catch (error) {
    console.error('Erreur récupération départements:', error);
    return [];
  }
};

// Créer le clavier principal Top des Plugs
const createTopPlugsKeyboard = (config, countries, selectedCountry, selectedService, plugButtons = [], departments = []) => {
  const buttons = [];
  
  // Récupérer les traductions
  const currentLang = config?.languages?.currentLanguage || 'fr';
  const customTranslations = config?.languages?.translations;
  
  // Première ligne : Pays (affichage intelligent)
  if (countries.length > 0) {
    const countryButtons = [];
    
    // Prioriser certains pays importants et limiter l'affichage
    const priorityCountries = ['France', 'Espagne', 'Suisse', 'Italie', 'Maroc', 'Belgique'];
    const displayCountries = [];
    
    // Ajouter les pays prioritaires s'ils existent
    priorityCountries.forEach(priority => {
      if (countries.includes(priority)) {
        displayCountries.push(priority);
      }
    });
    
    // Ajouter les autres pays jusqu'à maximum 8 pays
    countries.forEach(country => {
      if (!displayCountries.includes(country) && displayCountries.length < 8) {
        displayCountries.push(country);
      }
    });
    
    // Créer les boutons
    displayCountries.forEach(country => {
      const flag = getCountryFlag(country);
      const isSelected = selectedCountry === country;
      const buttonText = isSelected ? `✅ ${flag}` : flag;
      countryButtons.push(Markup.button.callback(buttonText, `top_country_${country}`));
    });
    
    // Grouper par 4 boutons par ligne
    for (let i = 0; i < countryButtons.length; i += 4) {
      buttons.push(countryButtons.slice(i, i + 4));
    }
  }
  
  // Deuxième ligne : Filtres de services avec traductions
  const serviceRow = [];
  
  const deliveryName = getTranslation('filters_delivery', currentLang, customTranslations);
  const meetupName = getTranslation('filters_meetup', currentLang, customTranslations);
  const postalName = getTranslation('filters_postal', currentLang, customTranslations);
  
  const deliveryText = selectedService === 'delivery' ? `✅ ${deliveryName}` : deliveryName;
  const meetupText = selectedService === 'meetup' ? `✅ ${meetupName}` : meetupName;
  const postalText = selectedService === 'postal' ? `✅ ${postalName}` : postalName;
  
  serviceRow.push(Markup.button.callback(deliveryText, `top_service_delivery${selectedCountry ? `_${selectedCountry}` : ''}`));
  serviceRow.push(Markup.button.callback(meetupText, `top_service_meetup${selectedCountry ? `_${selectedCountry}` : ''}`));
  serviceRow.push(Markup.button.callback(postalText, `top_service_postal${selectedCountry ? `_${selectedCountry}` : ''}`));
  
  buttons.push(serviceRow);
  
  // Quatrième ligne : Département (si service delivery ou meetup sélectionné)
  if (selectedService === 'delivery' || selectedService === 'meetup') {
    const deptText = getTranslation('filters_department', currentLang, customTranslations);
    const deptButton = Markup.button.callback(deptText, `top_departments_${selectedService}${selectedCountry ? `_${selectedCountry}` : ''}`);
    buttons.push([deptButton]);
  }
  
  // Ajouter les boutons de boutiques s'il y en a
  if (plugButtons && plugButtons.length > 0) {
    plugButtons.forEach(plugButtonRow => {
      buttons.push(plugButtonRow);
    });
  }

  // Ajouter les boutons de départements s'il y en a
  if (departments && departments.length > 0) {
    departments.forEach(dept => {
      const deptButton = Markup.button.callback(`📍 ${dept}`, `top_dept_${selectedService}${selectedCountry ? `_${selectedCountry}` : ''}_${dept}`);
      buttons.push([deptButton]);
    });
  }
  
  // Dernière ligne : Réinitialiser + Retour avec traductions
  const actionRow = [];
  const resetText = getTranslation('filters_reset_button', currentLang, customTranslations);
  const backText = getTranslation('back_to_menu', currentLang, customTranslations);
  actionRow.push(Markup.button.callback(resetText, 'top_reset_filters'));
  actionRow.push(Markup.button.callback(backText, 'back_main'));
  buttons.push(actionRow);
  
  return Markup.inlineKeyboard(buttons);
};

// Créer le clavier des départements
const createDepartmentsKeyboard = (departments, serviceType, selectedCountry) => {
  const buttons = [];
  
  // Départements (2 par ligne)
  for (let i = 0; i < departments.length; i += 2) {
    const row = [];
    
    // Premier département de la ligne
    const dept1 = departments[i];
    const callback1 = selectedCountry ? 
      `top_dept_${serviceType}_${dept1}_${selectedCountry}` : 
      `top_dept_${serviceType}_${dept1}`;
    row.push(Markup.button.callback(`📍 ${dept1}`, callback1));
    
    // Deuxième département de la ligne s'il existe
    if (departments[i + 1]) {
      const dept2 = departments[i + 1];
      const callback2 = selectedCountry ? 
        `top_dept_${serviceType}_${dept2}_${selectedCountry}` : 
        `top_dept_${serviceType}_${dept2}`;
      row.push(Markup.button.callback(`📍 ${dept2}`, callback2));
    }
    
    buttons.push(row);
  }
  
  // Bouton retour intelligent selon le contexte
  let returnCallback;
  if (selectedCountry) {
    // Si un pays est sélectionné, retourner au service avec ce pays
    returnCallback = `top_service_${serviceType}_${selectedCountry}`;
  } else {
    // Sinon, retourner au service sans pays
    returnCallback = `top_service_${serviceType}`;
  }
  
  buttons.push([Markup.button.callback('🔙 Retour', returnCallback)]);
  
  return Markup.inlineKeyboard(buttons);
};

// Afficher les boutiques VIP
const handleVipPlugs = async (ctx, page = 0) => {
  try {
    // CORRECTION: Confirmer immédiatement la callback pour éviter le loading
    await ctx.answerCbQuery();
    
    // Toujours récupérer la config fraîche
    const config = await Config.findById('main');
    const vipPlugs = await Plug.find({ isActive: true, isVip: true })
      .sort({ likes: -1, vipOrder: 1, createdAt: -1 });

    if (vipPlugs.length === 0) {
      const backButtonText = config?.botTexts?.backButtonText || '🔙 Retour';
      const backKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback(backButtonText, 'back_main')]
      ]);
      
      await ctx.editMessageText(
        '👑 **Boutiques VIP**\n\n❌ Aucune boutique VIP disponible pour le moment.',
        {
          reply_markup: backKeyboard.reply_markup,
          parse_mode: 'Markdown'
        }
      );
      return;
    }

    const plugsPerPage = 5;
    const totalPages = Math.ceil(vipPlugs.length / plugsPerPage);
    const startIndex = page * plugsPerPage;
    const endIndex = startIndex + plugsPerPage;
    const currentPagePlugs = vipPlugs.slice(startIndex, endIndex);

    // Créer les boutons pour chaque plug VIP avec le bon contexte
    const buttons = [];
    
    for (const plug of currentPagePlugs) {
      // Utiliser le contexte 'plugs_vip' pour que le retour fonctionne correctement
      buttons.push([Markup.button.callback(`👑 ⭐️ ${plug.name}`, `plug_${plug._id}_from_plugs_vip`)]);
    }

    // Boutons de navigation
    if (totalPages > 1) {
      const navButtons = [];
      if (page > 0) {
        navButtons.push(Markup.button.callback('⬅️ Précédent', `page_plugs_vip_${page - 1}`));
      }
      navButtons.push(Markup.button.callback(`${page + 1}/${totalPages}`, 'current_page'));
      if (page < totalPages - 1) {
        navButtons.push(Markup.button.callback('➡️ Suivant', `page_plugs_vip_${page + 1}`));
      }
      buttons.push(navButtons);
    }

    // Bouton retour vers le menu principal
    const backButtonText = config?.botTexts?.backButtonText || '🔙 Retour';
    buttons.push([Markup.button.callback(backButtonText, 'back_main')]);

    const keyboard = Markup.inlineKeyboard(buttons);
    
    const paginationFormat = config?.botTexts?.paginationFormat || '📄 Page {page}/{total}';
    const paginationText = paginationFormat
      .replace('{page}', page + 1)
      .replace('{total}', totalPages);
    
    const messageText = `${config?.botTexts?.vipTitle || '👑 Boutiques VIP Premium'}\n\n${config?.botTexts?.vipDescription || '✨ Découvrez nos boutiques sélectionnées'}\n\n${paginationText} • ${vipPlugs.length} boutique${vipPlugs.length > 1 ? 's' : ''}`;

    // Utiliser la fonction helper pour afficher avec image
    await editMessageWithImage(ctx, messageText, keyboard, config, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Erreur dans handleVipPlugs:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement des boutiques VIP').catch(() => {});
  }
};

// Afficher tous les plugs
const handleAllPlugs = async (ctx, page = 0) => {
  try {
    // CORRECTION: Confirmer immédiatement la callback pour éviter le loading
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    const plugs = await Plug.find({ isActive: true })
      .sort({ likes: -1, isVip: -1, vipOrder: 1, createdAt: -1 });

    if (plugs.length === 0) {
      const messageText = config?.messages?.noPlugsFound || '❌ Aucun plug trouvé';
      const keyboard = createPlugsFilterKeyboard(config);
      
      await editMessageWithImage(ctx, messageText, keyboard, config, { parse_mode: 'Markdown' });
      return;
    }

    const itemsPerPage = 5;
    const totalPages = Math.ceil(plugs.length / itemsPerPage);
    const keyboard = createPlugsKeyboard(plugs, page, totalPages, 'all');

    let message = `${config.botTexts?.allPlugsTitle || 'Tous Nos Plugs Certifié 🔌'}\n`;
    
    // Format du compteur total configurable
    const totalCountFormat = config.botTexts?.totalCountFormat || '( Tous nos plugs certifiés )';
    const totalCountText = totalCountFormat.replace('{count}', plugs.length);
    message += `${totalCountText}\n\n`;
    
    // Format de pagination configurable (vide par défaut)
    const paginationFormat = config.botTexts?.paginationFormat || '';
    if (paginationFormat) {
      const paginationText = paginationFormat
        .replace('{page}', page + 1)
        .replace('{total}', totalPages);
      message += `${paginationText}\n\n`;
    }

    // Utiliser la fonction helper pour afficher avec image
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Erreur dans handleAllPlugs:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement').catch(() => {});
  }
};

// Afficher le menu des services
const handleFilterService = async (ctx) => {
  try {
    // CORRECTION: Confirmer immédiatement la callback pour éviter le loading
    await ctx.answerCbQuery();
    
    console.log('🔍 Affichage du menu des services');
    
    const config = await Config.findById('main');
    const keyboard = createServicesKeyboard(config);
    
    // Statistiques des services disponibles
    const deliveryCount = await Plug.countDocuments({ 
      isActive: true, 
      'services.delivery.enabled': true 
    });
    const postalCount = await Plug.countDocuments({ 
      isActive: true, 
      'services.postal.enabled': true 
    });
    const meetupCount = await Plug.countDocuments({ 
      isActive: true, 
      'services.meetup.enabled': true 
    });
    
    console.log(`📊 Services disponibles: Livraison(${deliveryCount}), Postal(${postalCount}), Meetup(${meetupCount})`);
    
    const messageText = `${config?.botTexts?.filterServiceTitle || '🔍 Filtrer par service'}\n\n${config?.botTexts?.filterServiceDescription || 'Choisissez le type de service :'}\n\n📊 **Disponibilité :**\n🚚 Livraison: ${deliveryCount} boutiques\n✈️ Postal: ${postalCount} boutiques\n🏠 Meetup: ${meetupCount} boutiques`;
    
    // Utiliser la fonction helper pour afficher avec image
    await editMessageWithImage(ctx, messageText, keyboard, config, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('❌ Erreur dans handleFilterService:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement').catch(() => {});
  }
};

// Filtrer par service spécifique
const handleServiceFilter = async (ctx, serviceType, page = 0) => {
  try {
    console.log(`🔍 Recherche de plugs avec service: ${serviceType}`);
    
    // Confirmer immédiatement la callback pour éviter le loading
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    const serviceField = `services.${serviceType}.enabled`;
    
    console.log(`📋 Requête MongoDB: { isActive: true, "${serviceField}": true }`);
    
    // Recherche avec requête corrigée
    const plugs = await Plug.find({ 
      isActive: true,
      [serviceField]: true
    }).sort({ isVip: -1, vipOrder: 1, createdAt: -1 });

    console.log(`✅ Plugs trouvés pour ${serviceType}:`, plugs.length);
    
    if (plugs.length === 0) {
      // Vérification debug : combien de plugs actifs au total ?
      const totalPlugs = await Plug.countDocuments({ isActive: true });
      console.log(`📊 Total plugs actifs: ${totalPlugs}`);
      
      // Vérification debug : quels services sont disponibles ?
      const allPlugs = await Plug.find({ isActive: true }, 'name services').limit(5);
      console.log('🔧 Services des premiers plugs:');
      allPlugs.forEach(plug => {
        console.log(`- ${plug.name}:`, plug.services);
      });
      
      const messageText = `😅 Aucun plug trouvé pour ce service.\n\n🔧 Vérifiez que les boutiques ont ce service activé dans le panel admin.`;
      const keyboard = createServicesKeyboard(config);
      
      await editMessageWithImage(ctx, messageText, keyboard, config, { parse_mode: 'Markdown' });
      return;
    }

    const itemsPerPage = 5;
    const totalPages = Math.ceil(plugs.length / itemsPerPage);
    
    // Utiliser le contexte 'service_TYPE' pour que le retour fonctionne correctement
    const keyboard = createPlugsKeyboard(plugs, page, totalPages, `service_${serviceType}`);

    const serviceNames = {
      delivery: '🚚 Livraison',
      postal: '✈️ Envoi postal',
      meetup: '🏠 Meetup'
    };

    let message = `🔍 **Plugs avec ${serviceNames[serviceType]} :**\n\n`;
    message += `📊 Total : ${plugs.length} plugs\n`;
    message += `📄 Page ${page + 1}/${totalPages}`;

    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('❌ Erreur dans handleServiceFilter:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement').catch(() => {});
  }
};

// Afficher le menu des pays
const handleFilterCountry = async (ctx) => {
  try {
    // Confirmer immédiatement la callback pour éviter le loading
    await ctx.answerCbQuery();
    
    // Récupérer tous les pays uniques
    const countries = await Plug.distinct('countries', { isActive: true });
    
    if (countries.length === 0) {
      return ctx.editMessageText(
        '😅 Aucun pays trouvé.',
        { reply_markup: createPlugsFilterKeyboard(await Config.findById('main')).reply_markup }
      );
    }

    const keyboard = createCountriesKeyboard(countries.sort());
    const config = await Config.findById('main');
    const messageText = `${config.botTexts?.filterCountryTitle || '🌍 Filtrer par pays'}\n\n${config.botTexts?.filterCountryDescription || 'Choisissez un pays :'}`;
    
    // Utiliser la fonction helper pour afficher avec image
    await editMessageWithImage(ctx, messageText, keyboard, config, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Erreur dans handleFilterCountry:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement').catch(() => {});
  }
};

// Filtrer par pays spécifique
const handleCountryFilter = async (ctx, country, page = 0) => {
  try {
    const plugs = await Plug.find({ 
      isActive: true,
      countries: { $regex: new RegExp(country, 'i') }
    }).sort({ isVip: -1, vipOrder: 1, createdAt: -1 });

    if (plugs.length === 0) {
      return ctx.editMessageText(
        `😅 Aucun plug trouvé pour ${country}.`,
        { reply_markup: createCountriesKeyboard(await Plug.distinct('countries', { isActive: true })).reply_markup }
      );
    }

    const itemsPerPage = 5;
    const totalPages = Math.ceil(plugs.length / itemsPerPage);
    const keyboard = createPlugsKeyboard(plugs, page, totalPages, `country_${country.toLowerCase()}`);

    let message = `🌍 **Plugs en ${country.charAt(0).toUpperCase() + country.slice(1)} :**\n\n`;
    message += `📊 Total : ${plugs.length} plugs\n`;
    message += `📄 Page ${page + 1}/${totalPages}`;

    const config = await Config.findById('main');
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Erreur dans handleCountryFilter:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement');
  }
};

// Afficher un plug spécifique avec contexte de retour
const handlePlugDetails = async (ctx, plugId, returnContext = 'top_plugs') => {
  try {
    console.log(`🔍 handlePlugDetails: plugId=${plugId}, returnContext=${returnContext}`);
    const plug = await Plug.findById(plugId);
    console.log(`📦 Plug found:`, plug ? `${plug.name} (active: ${plug.isActive})` : 'null');
    
    if (!plug || !plug.isActive) {
      console.log('❌ Plug non trouvé ou inactif');
      return ctx.answerCbQuery(getTranslation('shop_not_found', 'fr')); // Fallback en français si pas de config
    }

    // Récupérer la config pour les textes personnalisés et la langue
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;

    let message = `${plug.isVip ? '⭐ ' : ''}**${plug.name}**\n\n`;
    const translatedDescription = translateDescription(plug.description, currentLang);
    message += `${getTranslation('shop_description_label', currentLang, customTranslations)} ${translatedDescription}\n\n`;

    // Services disponibles avec traductions
    const services = [];
    if (plug.services?.delivery?.enabled) {
      const serviceName = getTranslation('service_delivery', currentLang, customTranslations);
      const serviceDesc = plug.services.delivery.description ? 
        `: ${translateDescription(plug.services.delivery.description, currentLang)}` : '';
      services.push(`📦 **${serviceName}**${serviceDesc}`);
    }
    if (plug.services?.meetup?.enabled) {
      const serviceName = getTranslation('service_meetup', currentLang, customTranslations);
      const serviceDesc = plug.services.meetup.description ? 
        `: ${translateDescription(plug.services.meetup.description, currentLang)}` : '';
      services.push(`🤝 **${serviceName}**${serviceDesc}`);
    }
    if (plug.services?.postal?.enabled) {
      const serviceName = getTranslation('service_postal', currentLang, customTranslations);
      const serviceDesc = plug.services.postal.description ? 
        `: ${translateDescription(plug.services.postal.description, currentLang)}` : '';
      services.push(`📬 **${serviceName}**${serviceDesc}`);
    }

    if (services.length > 0) {
      const servicesTitle = getTranslation('services_available', currentLang, customTranslations);
      message += `**🔧 ${servicesTitle} :**\n${services.join('\n')}\n\n`;
    }

    // Pays desservis avec traduction
    if (plug.countries && plug.countries.length > 0) {
      const countriesTitle = getTranslation('countries_served', currentLang, customTranslations);
      message += `🌍 **${countriesTitle} :** ${plug.countries.join(', ')}\n\n`;
    }

    // Utiliser la fonction createPlugKeyboard qui gère déjà tout (avec userId pour l'état du bouton like)
    const keyboard = createPlugKeyboard(plug, returnContext, ctx.from?.id, currentLang, customTranslations);

    // Utiliser la fonction helper pour afficher avec image du plug
    await editMessageWithImage(ctx, message, keyboard, config, { 
      parse_mode: 'Markdown',
      plugImage: plug.image,  // Passer l'image du plug
      isPlugDetails: true     // Indiquer que c'est les détails d'un plug (pas d'image d'accueil en fallback)
    });
    
    // Confirmer la callback pour éviter le loading
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Erreur dans handlePlugDetails:', error);
    await ctx.answerCbQuery(getTranslation('error_loading', 'fr')).catch(() => {}); // Fallback en français
  }
};

// Fonction handlePlugServiceDetails supprimée - les services ont été retirés du menu

module.exports = {
  handleTopPlugs,
  handleVipPlugs,
  handleAllPlugs,
  handleFilterService,
  handleServiceFilter,
  handleFilterCountry,
  handleCountryFilter,
  handlePlugDetails,
  handleDepartmentFilter,
  handleSpecificDepartment,
  handleResetFilters,
  handleTopServiceFilter,
  handleTopCountryFilter,
  handlePostalCodeFilter,
  handleShopsByPostalCode,
  getAvailableCountries,
  getAvailableDepartments,
  getCountryFlag
};