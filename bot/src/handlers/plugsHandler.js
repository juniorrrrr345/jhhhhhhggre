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
    
    // Pour Livraison et Meetup : rediriger IMMÉDIATEMENT vers le système de départements (ANTI-SPAM)
    if (serviceType === 'delivery' || serviceType === 'meetup') {
      console.log(`🎯 handleTopServiceFilter: Redirection immédiate vers handleDepartmentFilter pour ${serviceType}, pays=${selectedCountry}`);
      console.log(`🔍 Utilisateur: ${ctx.from.id}, Chat: ${ctx.chat.id}`);
      return await handleDepartmentFilter(ctx, serviceType, selectedCountry);
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
    }
    
    // Éditer le message existant pour éviter le spam
    try {
      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup || keyboard
      });
    } catch (editError) {
      console.log('Erreur édition message, tentative avec reply:', editError.message);
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup || keyboard
      });
    }
    
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
    
    // Éditer le message directement sans image pour les codes postaux
    try {
      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (editError) {
      console.log('Erreur édition message, tentative avec reply:', editError.message);
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    }
    
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
    
    // Rechercher les boutiques qui desservent ce code postal (avec diminutif)
    let query = { 
      isActive: true,
      countries: { $in: [country] }
    };
    
    // Créer regex pour rechercher les codes qui commencent par le diminutif
    const postalCodeRegex = new RegExp(`^${postalCode}`);
    
    // Filtrer par service si spécifié
    if (serviceType === 'delivery') {
      query['services.delivery.enabled'] = true;
      query['services.delivery.departments'] = { $regex: postalCodeRegex };
    } else if (serviceType === 'meetup') {
      query['services.meetup.enabled'] = true;
      query['services.meetup.departments'] = { $regex: postalCodeRegex };
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

// Gestionnaire pour les services (delivery et meetup) - Afficher les départements directement
const handleDepartmentFilter = async (ctx, serviceType, selectedCountry = null) => {
  try {
    console.log(`🔍 handleDepartmentFilter appelé: serviceType=${serviceType}, selectedCountry=${selectedCountry}`);
    const userId = ctx.from.id;
    
    // 🚫 Prévention spam - DÉSACTIVÉ temporairement pour debug
    // if (isSpamClick(userId, 'service', `${serviceType}_${selectedCountry || 'none'}`)) {
    //   console.log(`🔄 Spam détecté pour ${serviceType}_${selectedCountry || 'none'}`);
    //   await ctx.answerCbQuery('🔄');
    //   return;
    // }
    
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    // Récupérer tous les départements disponibles pour ce service
    let query = { isActive: true };
    
    if (serviceType === 'delivery') {
      query['services.delivery.enabled'] = true;
    } else if (serviceType === 'meetup') {
      query['services.meetup.enabled'] = true;
    }
    
    if (selectedCountry) {
      query.countries = { $in: [selectedCountry] };
    }
    
    const shopsWithService = await Plug.find(query);
    
    // Extraire tous les départements avec comptage
    let departmentCounts = {};
    
    if (serviceType === 'delivery') {
      shopsWithService.forEach(shop => {
        const departments = shop.services?.delivery?.departments || [];
        departments.forEach(dept => {
          departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
        });
      });
    } else if (serviceType === 'meetup') {
      shopsWithService.forEach(shop => {
        const departments = shop.services?.meetup?.departments || [];
        departments.forEach(dept => {
          departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
        });
      });
    }
    
    // Trier les départements par numéro
    const sortedDepartments = Object.keys(departmentCounts).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA - numB;
    });
    
    if (sortedDepartments.length === 0) {
      let message = `❌ **Aucun département disponible**\n\n`;
      
      if (serviceType === 'delivery') {
        const serviceName = getTranslation('service_delivery', currentLang, customTranslations);
        message += `📦 **Service:** ${serviceName}\n`;
      } else if (serviceType === 'meetup') {
        const serviceName = getTranslation('service_meetup', currentLang, customTranslations);
        message += `🤝 **Service:** ${serviceName}\n`;
      }
      
      if (selectedCountry) {
        message += `🌍 **Pays:** ${getCountryFlag(selectedCountry)} ${selectedCountry}\n`;
      }
      
      message += `\n💡 *Aucun département disponible pour ce service*`;
      
      const keyboard = {
        inline_keyboard: [
          [{
            text: '🔙 Retour au menu',
            callback_data: 'top_plugs'
          }]
        ]
      };
      
      await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
      return;
    }
    
    // Construire le message
    let message = `📍 **Départements disponibles**\n\n`;
    
    if (serviceType === 'delivery') {
      const serviceName = getTranslation('service_delivery', currentLang, customTranslations);
      message += `📦 **Service:** ${serviceName}\n\n`;
    } else if (serviceType === 'meetup') {
      const serviceName = getTranslation('service_meetup', currentLang, customTranslations);
      message += `🤝 **Service:** ${serviceName}\n\n`;
    }
    
    if (selectedCountry) {
      message += `🌍 **Pays:** ${getCountryFlag(selectedCountry)} ${selectedCountry}\n\n`;
    }
    
    message += `💡 *Sélectionnez un département :*\n\n`;
    
    // Créer les boutons de départements (4 par ligne)
    const departmentButtons = [];
    let currentRow = [];
    
    sortedDepartments.forEach(dept => {
      const count = departmentCounts[dept];
      currentRow.push({
        text: `${dept} (${count})`,
        callback_data: `top_dept_${serviceType}_${dept}_${selectedCountry || ''}`
      });
      
      if (currentRow.length === 4) {
        departmentButtons.push(currentRow);
        currentRow = [];
      }
    });
    
    // Ajouter la dernière ligne si elle n'est pas vide
    if (currentRow.length > 0) {
      departmentButtons.push(currentRow);
    }
    
    // Bouton retour
    departmentButtons.push([{
      text: '🔙 Retour au menu',
      callback_data: 'top_plugs'
    }]);
    
    const keyboard = { inline_keyboard: departmentButtons };
    
    // Éditer le message avec image (compatible avec les messages image + texte)
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('❌ Erreur dans handleDepartmentFilter:', error);
    await ctx.answerCbQuery('❌ Erreur').catch(() => {});
    
    try {
      const errorKeyboard = {
        inline_keyboard: [[{
          text: '🔙 Retour au menu',
          callback_data: 'top_plugs'
        }]]
      };
      await editMessageWithImage(ctx, '❌ Erreur technique. Veuillez réessayer.', errorKeyboard, config, { parse_mode: 'Markdown' });
    } catch (editError) {
      console.error('❌ Erreur édition message erreur:', editError);
    }
  }
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
      message += `🏪 **${deptPlugs.length} boutique${deptPlugs.length > 1 ? 's' : ''} trouvée${deptPlugs.length > 1 ? 's' : ''} :**\n\n`;
      
      // Ajouter les boutiques au clavier
      const plugButtons = [];
      deptPlugs.slice(0, 10).forEach((plug, index) => {
        const country = getCountryFlag(plug.countries[0]);
        const location = plug.location ? ` ${plug.location}` : '';
        const vipIcon = plug.isVip ? '⭐️ ' : '';
        const buttonText = `${country}${location} ${vipIcon}${plug.name} 👍 ${plug.likes}`;
        plugButtons.push([{
          text: buttonText,
          callback_data: `plug_${plug._id}_from_top_dept`
        }]);
      });
      
      // Ajouter bouton retour aux départements
      plugButtons.push([{
        text: '🔙 Retour aux départements',
        callback_data: `service_${serviceType}`
      }]);
      
      // Bouton retour au menu principal
      plugButtons.push([{
        text: '🏠 Menu principal',
        callback_data: 'top_plugs'
      }]);
      
      keyboard = { inline_keyboard: plugButtons };
    } else {
      message += `❌ **Aucune boutique trouvée**\n\n`;
      message += `💡 *Aucune boutique ne propose ce service dans le département ${department}*`;
      
      keyboard = {
        inline_keyboard: [
          [{
            text: '🔙 Retour aux départements',
            callback_data: `service_${serviceType}`
          }],
          [{
            text: '🏠 Menu principal',
            callback_data: 'top_plugs'
          }]
        ]
      };
    }
    
    // Éditer le message existant sans image pour éviter le spam
    try {
      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (editError) {
      console.log('Erreur édition message, tentative avec reply:', editError.message);
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    }
    
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
  
  // Troisième ligne : Bouton Départements (nouveau)
  const departmentText = getTranslation('filters_all_departments', currentLang, customTranslations) || '📍 Départements';
  const departmentButton = Markup.button.callback(departmentText, 'all_departments');
  buttons.push([departmentButton]);
  
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

    // Afficher le nom avec le drapeau du premier pays desservi
    const countryFlag = plug.countries && plug.countries.length > 0 ? getCountryFlag(plug.countries[0]) : '';
    let message = `${countryFlag} ${plug.isVip ? '⭐ ' : ''}**${plug.name}**\n\n`;
    const translatedDescription = translateDescription(plug.description, currentLang);
    message += `${getTranslation('shop_description_label', currentLang, customTranslations)} ${translatedDescription}\n\n`;

    // Services disponibles avec départements pour livraison/meetup et descriptions pour postal
    const services = [];
    if (plug.services?.delivery?.enabled) {
      const serviceName = getTranslation('service_delivery', currentLang, customTranslations);
      const departments = plug.services.delivery.departments || [];
      if (departments.length > 0) {
        const departmentsText = departments.sort((a, b) => parseInt(a) - parseInt(b)).join(', ');
        services.push(`📦 **${serviceName}** : ${departmentsText}`);
      } else {
        services.push(`📦 **${serviceName}** : Tous départements`);
      }
    }
    if (plug.services?.meetup?.enabled) {
      const serviceName = getTranslation('service_meetup', currentLang, customTranslations);
      const departments = plug.services.meetup.departments || [];
      if (departments.length > 0) {
        const departmentsText = departments.sort((a, b) => parseInt(a) - parseInt(b)).join(', ');
        services.push(`🤝 **${serviceName}** : ${departmentsText}`);
      } else {
        services.push(`🤝 **${serviceName}** : Tous départements`);
      }
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

// Gestionnaire pour afficher TOUS les départements de TOUS les pays (bouton Département principal)
const handleAllDepartments = async (ctx) => {
  try {
    const userId = ctx.from.id;
    
    // 🚫 Prévention spam
    if (isSpamClick(userId, 'all_departments', 'main')) {
      await ctx.answerCbQuery('🔄');
      return;
    }
    
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    // Départements complets par pays - SYSTÈME EXTENSIBLE
    const departmentsByCountry = {
      'France': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '2A', '2B', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95'],
      'Belgique': ['1000', '1020', '1030', '1040', '1050', '1060', '1070', '1080', '1090', '1120', '1130', '1140', '1150', '1160', '1170', '1180', '1190', '1200', '1210', '1300', '1310', '1320', '1330', '1340', '1350', '1360', '1370', '1380', '1390', '1400', '1410', '1420', '1430', '1440', '1450', '1460', '1470', '1480', '1490', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300', '2400', '2500', '2600', '2700', '2800', '2900', '3000', '3100', '3200', '3300', '3400', '3500', '3600', '3700', '3800', '3900', '4000', '4100', '4200', '4300', '4400', '4500', '4600', '4700', '4800', '4900', '5000', '6000', '6200', '6400', '6600', '6700', '6800', '6900', '7000', '7100', '7200', '7300', '7400', '7500', '7600', '7700', '7800', '7900', '8000', '8200', '8300', '8400', '8500', '8600', '8700', '8800', '8900', '9000', '9100', '9200', '9300', '9400', '9500', '9600', '9700', '9800', '9900'],
      'Suisse': ['1000', '1200', '1290', '1300', '2000', '2500', '3000', '4000', '5000', '6000', '7000', '8000', '9000'],
      'Pays-Bas': ['1011', '1012', '1013', '1015', '1016', '1017', '1018', '1019', '2000', '2500', '3000', '4000', '5000', '6000', '7000', '8000', '9000'], 
      'Italie': ['00100', '10100', '20100', '30100', '40100', '50100', '60100', '70100', '80100', '90100'],
      'Espagne': ['01000', '02000', '03000', '04000', '05000', '06000', '07000', '08000', '09000', '10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '21000', '22000', '23000', '24000', '25000', '26000', '27000', '28000', '29000', '30000', '31000', '32000', '33000', '34000', '35000', '36000', '37000', '38000', '39000', '40000', '41000', '42000', '43000', '44000', '45000', '46000', '47000', '48000', '49000', '50000'],
      'Maroc': ['10000', '20000', '30000', '40000', '50000', '60000', '70000', '80000', '90000'],
      'Portugal': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000'],
      'Luxembourg': ['1009', '1010', '1011', '1012', '1013', '1014', '1015', '1016', '1017', '1018', '1019', '1020', '1021', '1022', '1023', '1024', '1025', '1026', '1027', '1028', '1029', '1030'],
      'Allemagne': ['10115', '20095', '30159', '40213', '50667', '60313', '70173', '80331', '90402'],
      'Canada': ['H1A', 'H1B', 'H1C', 'H2A', 'H2B', 'H2C', 'H3A', 'H3B', 'H3C', 'H4A', 'H4B', 'H4C'],
      'Autre': ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010']
    };
    
    // Construire le message avec tous les départements organisés par pays
    let message = `📍 **Tous les départements disponibles**\n\n`;
    message += `💡 *Cliquez sur un pays pour voir tous ses départements*\n\n`;
    
    // Afficher un résumé des pays et nombre de départements
    Object.keys(departmentsByCountry).forEach(country => {
      const departmentCount = departmentsByCountry[country].length;
      message += `${getCountryFlag(country)} **${country}** : ${departmentCount} départements\n`;
    });
    
    // Créer les boutons par pays (2 par ligne)
    const countryButtons = [];
    let currentRow = [];
    
    Object.keys(departmentsByCountry).forEach(country => {
      const departmentCount = departmentsByCountry[country].length;
      currentRow.push({
        text: `${getCountryFlag(country)} ${country} (${departmentCount})`,
        callback_data: `all_dept_country_${country}`
      });
      
      if (currentRow.length === 2) {
        countryButtons.push(currentRow);
        currentRow = [];
      }
    });
    
    // Ajouter la dernière ligne si nécessaire
    if (currentRow.length > 0) {
      countryButtons.push(currentRow);
    }
    
    // Bouton retour
    countryButtons.push([{
      text: '🔙 Retour au menu',
      callback_data: 'top_plugs'
    }]);
    
    const keyboard = { inline_keyboard: countryButtons };
    
    // Éditer le message avec image
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('❌ Erreur dans handleAllDepartments:', error);
    await ctx.answerCbQuery('❌ Erreur').catch(() => {});
  }
};

// Gestionnaire pour afficher les départements d'un pays spécifique (depuis le menu départements)
const handleCountryDepartments = async (ctx, country) => {
  try {
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    // Départements par pays
    const departmentsByCountry = {
      'France': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '2A', '2B', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95'],
      'Belgique': ['1000', '1020', '1030', '1040', '1050', '1060', '1070', '1080', '1090', '1120', '1130', '1140', '1150', '1160', '1170', '1180', '1190', '1200', '1210', '1300', '1310', '1320', '1330', '1340', '1350', '1360', '1370', '1380', '1390', '1400', '1410', '1420', '1430', '1440', '1450', '1460', '1470', '1480', '1490', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300', '2400', '2500', '2600', '2700', '2800', '2900', '3000', '3100', '3200', '3300', '3400', '3500', '3600', '3700', '3800', '3900', '4000', '4100', '4200', '4300', '4400', '4500', '4600', '4700', '4800', '4900', '5000', '6000', '6200', '6400', '6600', '6700', '6800', '6900', '7000', '7100', '7200', '7300', '7400', '7500', '7600', '7700', '7800', '7900', '8000', '8200', '8300', '8400', '8500', '8600', '8700', '8800', '8900', '9000', '9100', '9200', '9300', '9400', '9500', '9600', '9700', '9800', '9900'],
      'Suisse': ['1000', '1200', '1290', '1300', '2000', '2500', '3000', '4000', '5000', '6000', '7000', '8000', '9000'],
      'Pays-Bas': ['1011', '1012', '1013', '1015', '1016', '1017', '1018', '1019', '2000', '2500', '3000', '4000', '5000', '6000', '7000', '8000', '9000'], 
      'Italie': ['00100', '10100', '20100', '30100', '40100', '50100', '60100', '70100', '80100', '90100'],
      'Espagne': ['01000', '02000', '03000', '04000', '05000', '06000', '07000', '08000', '09000', '10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '21000', '22000', '23000', '24000', '25000', '26000', '27000', '28000', '29000', '30000', '31000', '32000', '33000', '34000', '35000', '36000', '37000', '38000', '39000', '40000', '41000', '42000', '43000', '44000', '45000', '46000', '47000', '48000', '49000', '50000'],
      'Maroc': ['10000', '20000', '30000', '40000', '50000', '60000', '70000', '80000', '90000'],
      'Portugal': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000'],
      'Luxembourg': ['1009', '1010', '1011', '1012', '1013', '1014', '1015', '1016', '1017', '1018', '1019', '1020', '1021', '1022', '1023', '1024', '1025', '1026', '1027', '1028', '1029', '1030'],
      'Allemagne': ['10115', '20095', '30159', '40213', '50667', '60313', '70173', '80331', '90402'],
      'Canada': ['H1A', 'H1B', 'H1C', 'H2A', 'H2B', 'H2C', 'H3A', 'H3B', 'H3C', 'H4A', 'H4B', 'H4C'],
      'Autre': ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010']
    };
    
    const departments = departmentsByCountry[country] || [];
    
    if (departments.length === 0) {
      const message = `❌ **Aucun département trouvé pour ${getCountryFlag(country)} ${country}**`;
      const keyboard = {
        inline_keyboard: [
          [{
            text: '🔙 Retour aux pays',
            callback_data: 'all_departments'
          }]
        ]
      };
      
      await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
      return;
    }
    
    // Construire le message avec tous les départements
    let message = `📍 **Départements de ${getCountryFlag(country)} ${country}**\n\n`;
    message += `**${departments.length} départements disponibles :**\n\n`;
    
    // Afficher les départements par groupes de 10 pour une meilleure lisibilité
    for (let i = 0; i < departments.length; i += 10) {
      const chunk = departments.slice(i, i + 10);
      message += `${chunk.join(' • ')}\n`;
    }
    
    message += `\n💡 *Vous pouvez utiliser ces numéros pour filtrer les boutiques*`;
    
    // Créer les boutons de départements (5 par ligne)
    const departmentButtons = [];
    let currentRow = [];
    
    departments.forEach(dept => {
      currentRow.push({
        text: dept,
        callback_data: `search_dept_${dept}_${country}`
      });
      
      if (currentRow.length === 5) {
        departmentButtons.push(currentRow);
        currentRow = [];
      }
    });
    
    // Ajouter la dernière ligne si nécessaire
    if (currentRow.length > 0) {
      departmentButtons.push(currentRow);
    }
    
    // Boutons de navigation
    departmentButtons.push([
      {
        text: '🔙 Retour aux pays',
        callback_data: 'all_departments'
      },
      {
        text: '🏠 Menu principal',
        callback_data: 'top_plugs'
      }
    ]);
    
    const keyboard = { inline_keyboard: departmentButtons };
    
    // Éditer le message avec image
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('❌ Erreur dans handleCountryDepartments:', error);
    await ctx.answerCbQuery('❌ Erreur').catch(() => {});
  }
};

// Gestionnaire pour afficher la liste des départements disponibles (ancien système pour le bouton département)
const handleDepartmentsList = async (ctx, serviceType, selectedCountry = null) => {
  try {
    const userId = ctx.from.id;
    
    // 🚫 Prévention spam
    if (isSpamClick(userId, 'dept_list', `${serviceType}_${selectedCountry || 'none'}`)) {
      await ctx.answerCbQuery('🔄');
      return;
    }
    
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    // Récupérer tous les départements disponibles pour ce service
    let query = { isActive: true };
    
    if (serviceType === 'delivery') {
      query['services.delivery.enabled'] = true;
    } else if (serviceType === 'meetup') {
      query['services.meetup.enabled'] = true;
    }
    
    if (selectedCountry) {
      query.countries = { $in: [selectedCountry] };
    }
    
    const shopsWithService = await Plug.find(query);
    
    // Si un pays est sélectionné, afficher TOUS les départements de ce pays
    let allDepartments = [];
    if (selectedCountry) {
      // Départements complets par pays - SYSTÈME EXTENSIBLE
      const departmentsByCountry = {
        'France': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '2A', '2B', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95'],
        'Belgique': ['1000', '1020', '1030', '1040', '1050', '1060', '1070', '1080', '1090', '1120', '1130', '1140', '1150', '1160', '1170', '1180', '1190', '1200', '1210', '1300', '1310', '1320', '1330', '1340', '1350', '1360', '1370', '1380', '1390', '1400', '1410', '1420', '1430', '1440', '1450', '1460', '1470', '1480', '1490', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300', '2400', '2500', '2600', '2700', '2800', '2900', '3000', '3100', '3200', '3300', '3400', '3500', '3600', '3700', '3800', '3900', '4000', '4100', '4200', '4300', '4400', '4500', '4600', '4700', '4800', '4900', '5000', '6000', '6200', '6400', '6600', '6700', '6800', '6900', '7000', '7100', '7200', '7300', '7400', '7500', '7600', '7700', '7800', '7900', '8000', '8200', '8300', '8400', '8500', '8600', '8700', '8800', '8900', '9000', '9100', '9200', '9300', '9400', '9500', '9600', '9700', '9800', '9900'],
        'Suisse': ['1000', '1200', '1290', '1300', '2000', '2500', '3000', '4000', '5000', '6000', '7000', '8000', '9000'],
        'Pays-Bas': ['1011', '1012', '1013', '1015', '1016', '1017', '1018', '1019', '2000', '2500', '3000', '4000', '5000', '6000', '7000', '8000', '9000'], 
        'Italie': ['00100', '10100', '20100', '30100', '40100', '50100', '60100', '70100', '80100', '90100'],
        'Espagne': ['01000', '02000', '03000', '04000', '05000', '06000', '07000', '08000', '09000', '10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '21000', '22000', '23000', '24000', '25000', '26000', '27000', '28000', '29000', '30000', '31000', '32000', '33000', '34000', '35000', '36000', '37000', '38000', '39000', '40000', '41000', '42000', '43000', '44000', '45000', '46000', '47000', '48000', '49000', '50000'],
        'Maroc': ['10000', '20000', '30000', '40000', '50000', '60000', '70000', '80000', '90000'],
        'Portugal': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000'],
        'Luxembourg': ['1009', '1010', '1011', '1012', '1013', '1014', '1015', '1016', '1017', '1018', '1019', '1020', '1021', '1022', '1023', '1024', '1025', '1026', '1027', '1028', '1029', '1030'],
        'Allemagne': ['10115', '20095', '30159', '40213', '50667', '60313', '70173', '80331', '90402'],
        'Canada': ['H1A', 'H1B', 'H1C', 'H2A', 'H2B', 'H2C', 'H3A', 'H3B', 'H3C', 'H4A', 'H4B', 'H4C'],
        // Pays générique pour nouveaux pays
        'Autre': ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010']
      };
      
      allDepartments = departmentsByCountry[selectedCountry];
      
      // Si le pays n'est pas dans la liste, générer des départements automatiquement
      if (!allDepartments) {
        console.log(`⚠️ Pays "${selectedCountry}" non défini, génération automatique de départements`);
        // Générer 20 départements génériques pour les nouveaux pays
        allDepartments = [];
        for (let i = 1; i <= 20; i++) {
          const dept = i.toString().padStart(3, '0'); // 001, 002, ... 020
          allDepartments.push(dept);
        }
      }
      
      console.log(`📍 Tous les départements de ${selectedCountry}: ${allDepartments.length} départements`);
    } else {
      // Sinon, extraire seulement les départements avec des boutiques
      if (serviceType === 'delivery') {
        allDepartments = [...new Set(shopsWithService.flatMap(shop => 
          shop.services?.delivery?.departments || []
        ))];
      } else if (serviceType === 'meetup') {
        allDepartments = [...new Set(shopsWithService.flatMap(shop => 
          shop.services?.meetup?.departments || []
        ))];
      }
      
      // Trier les départements par numéro
      allDepartments.sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        return numA - numB;
      });
    }
    
    if (allDepartments.length === 0) {
      let message = `❌ **Aucun département disponible**\n\n`;
      
      if (serviceType === 'delivery') {
        const serviceName = getTranslation('service_delivery', currentLang, customTranslations);
        message += `📦 **Service:** ${serviceName}\n`;
      } else if (serviceType === 'meetup') {
        const serviceName = getTranslation('service_meetup', currentLang, customTranslations);
        message += `🤝 **Service:** ${serviceName}\n`;
      }
      
      if (selectedCountry) {
        message += `🌍 **Pays:** ${getCountryFlag(selectedCountry)} ${selectedCountry}\n`;
      }
      
      message += `\n💡 *Aucune boutique ne propose ce service actuellement*`;
      
      const keyboard = {
        inline_keyboard: [
          [{
            text: '🔙 Retour au menu',
            callback_data: 'top_plugs'
          }]
        ]
      };
      
      // Éditer le message existant
      try {
        await ctx.editMessageText(message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
      } catch (editError) {
        console.log('Erreur édition message, tentative avec reply:', editError.message);
        await ctx.reply(message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
      }
      return;
    }
    
    // Construire le message
    let message = `📍 **Départements disponibles**\n\n`;
    
    if (serviceType === 'delivery') {
      const serviceName = getTranslation('service_delivery', currentLang, customTranslations);
      message += `📦 **Service:** ${serviceName}\n`;
    } else if (serviceType === 'meetup') {
      const serviceName = getTranslation('service_meetup', currentLang, customTranslations);
      message += `🤝 **Service:** ${serviceName}\n`;
    }
    
    if (selectedCountry) {
      message += `🌍 **Pays:** ${getCountryFlag(selectedCountry)} ${selectedCountry}\n`;
    }
    
    message += `\n🏪 **${allDepartments.length} département${allDepartments.length > 1 ? 's' : ''} avec boutiques:**\n\n`;
    message += `💡 *Cliquez sur un département pour voir les boutiques*`;
    
    // Créer le clavier avec les départements (2 par ligne)
    const deptButtons = [];
    for (let i = 0; i < allDepartments.length; i += 2) {
      const row = [];
      const dept1 = allDepartments[i];
      const dept2 = allDepartments[i + 1];
      
      // Compter les boutiques pour chaque département (peut être 0)
      const shopsInDept1 = shopsWithService.filter(shop => {
        if (serviceType === 'delivery') {
          return shop.services?.delivery?.departments?.includes(dept1);
        } else if (serviceType === 'meetup') {
          return shop.services?.meetup?.departments?.includes(dept1);
        }
        return false;
      }).length;
      
      // Afficher même si 0 boutiques
      row.push({
        text: `${dept1} (${shopsInDept1})`,
        callback_data: `top_dept_${serviceType}_${dept1}${selectedCountry ? `_${selectedCountry}` : ''}`
      });
      
      if (dept2) {
        const shopsInDept2 = shopsWithService.filter(shop => {
          if (serviceType === 'delivery') {
            return shop.services?.delivery?.departments?.includes(dept2);
          } else if (serviceType === 'meetup') {
            return shop.services?.meetup?.departments?.includes(dept2);
          }
          return false;
        }).length;
        
        // Afficher même si 0 boutiques
        row.push({
          text: `${dept2} (${shopsInDept2})`,
          callback_data: `top_dept_${serviceType}_${dept2}${selectedCountry ? `_${selectedCountry}` : ''}`
        });
      }
      
      deptButtons.push(row);
    }
    
    // Bouton retour
    deptButtons.push([{
      text: '🔙 Retour au menu',
      callback_data: 'top_plugs'
    }]);
    
    const keyboard = { inline_keyboard: deptButtons };
    
    // Éditer le message existant
    try {
      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (editError) {
      console.log('Erreur édition message, tentative avec reply:', editError.message);
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    }
    
  } catch (error) {
    console.error('Erreur dans handleDepartmentsList:', error);
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    await ctx.answerCbQuery(getTranslation('error_filtering', currentLang, customTranslations)).catch(() => {});
  }
};

// Gestionnaire pour afficher toutes les boutiques d'un pays pour un service spécifique
const handleCountryServiceShops = async (ctx, serviceType, country) => {
  try {
    const userId = ctx.from.id;
    
    // 🚫 Prévention spam
    if (isSpamClick(userId, 'country_service', `${serviceType}_${country}`)) {
      await ctx.answerCbQuery('🔄');
      return;
    }
    
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    // Récupérer toutes les boutiques du pays pour ce service
    let query = { 
      isActive: true,
      countries: { $in: [country] }
    };
    
    if (serviceType === 'delivery') {
      query['services.delivery.enabled'] = true;
    } else if (serviceType === 'meetup') {
      query['services.meetup.enabled'] = true;
    }
    
    const shops = await Plug.find(query).sort({ likes: -1, isVip: -1 });
    
    // Construire le message
    let message = `${getCountryFlag(country)} **${country}**\n\n`;
    
    if (serviceType === 'delivery') {
      const serviceName = getTranslation('service_delivery', currentLang, customTranslations);
      message += `📦 **Service:** ${serviceName}\n\n`;
    } else if (serviceType === 'meetup') {
      const serviceName = getTranslation('service_meetup', currentLang, customTranslations);
      message += `🤝 **Service:** ${serviceName}\n\n`;
    }
    
    if (shops.length === 0) {
      message += `❌ **Aucune boutique trouvée**\n\n`;
      message += `💡 *Aucune boutique ne propose ce service dans ce pays*`;
      
      const keyboard = {
        inline_keyboard: [
          [{
            text: '🔙 Retour aux pays',
            callback_data: `service_${serviceType}`
          }],
          [{
            text: '🏠 Menu principal',
            callback_data: 'top_plugs'
          }]
        ]
      };
      
      // Éditer le message existant
      try {
        await ctx.editMessageText(message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
      } catch (editError) {
        console.log('Erreur édition message, tentative avec reply:', editError.message);
        await ctx.reply(message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
      }
      return;
    }
    
    message += `🏪 **${shops.length} boutique${shops.length > 1 ? 's' : ''} trouvée${shops.length > 1 ? 's' : ''} :**\n\n`;
    
    // Créer les boutons pour chaque boutique
    const shopButtons = [];
    shops.forEach(shop => {
      const vipIcon = shop.isVip ? '⭐' : '';
      const location = shop.location ? ` ${shop.location}` : '';
      const buttonText = `${vipIcon}${shop.name}${location} 👍 ${shop.likes}`;
      shopButtons.push([{
        text: buttonText,
        callback_data: `plug_${shop._id}_from_country_service`
      }]);
    });
    
    // Boutons de navigation
    shopButtons.push([{
      text: '🔙 Retour aux pays',
      callback_data: `service_${serviceType}`
    }]);
    
    shopButtons.push([{
      text: '🏠 Menu principal',
      callback_data: 'top_plugs'
    }]);
    
    const keyboard = { inline_keyboard: shopButtons };
    
    // Éditer le message existant
    try {
      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (editError) {
      console.log('Erreur édition message, tentative avec reply:', editError.message);
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    }
    
  } catch (error) {
    console.error('Erreur dans handleCountryServiceShops:', error);
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    await ctx.answerCbQuery(getTranslation('error_filtering', currentLang, customTranslations)).catch(() => {});
  }
};

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
  handleAllDepartments,
  handleCountryDepartments,
  getAvailableCountries,
  getAvailableDepartments,
  getCountryFlag
};