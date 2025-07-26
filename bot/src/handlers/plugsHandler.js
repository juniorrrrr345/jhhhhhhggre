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
const { sendMessageWithImage, editMessageWithImage, sendPlugWithImage, safeEditMessage } = require('../utils/messageHelper');
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
    
    // Récupérer les boutiques selon la langue actuelle
    const allPlugs = await getPlugsByLanguage({}, currentLang);

    // Récupérer les pays disponibles traduits selon la langue
    const availableCountries = await getAvailableCountries(currentLang);
    
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

    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    const availableCountries = await getAvailableCountries(currentLang);
    
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
    
    // Pour Livraison et Meetup : rediriger IMMÉDIATEMENT vers les départements (COMME VOULU)
    if (serviceType === 'delivery' || serviceType === 'meetup') {
      console.log(`🎯 handleTopServiceFilter: Redirection immédiate vers handleDepartmentsList pour ${serviceType}, pays=${selectedCountry}`);
      return await handleDepartmentsList(ctx, serviceType, selectedCountry);
    }
    
    // 🚫 Prévention spam (seulement pour postal)
    if (isSpamClick(userId, 'service', `${serviceType}_${selectedCountry || 'none'}`)) {
      await ctx.answerCbQuery('🔄');
      return;
    }
    
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    const availableCountries = await getAvailableCountries(currentLang);
    
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
    await safeEditMessage(ctx, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard.reply_markup || keyboard
    });
    
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
    await safeEditMessage(ctx, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
    
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
    
    // Récupérer la langue actuelle
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    // Construire la requête
    let query = { isActive: true };
    
    console.log(`🔍 handleSpecificDepartment: département recherché = "${department}", service = "${serviceType}", pays = "${selectedCountry}"`);
    
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
    
    console.log(`🔍 Query MongoDB:`, JSON.stringify(query, null, 2));
    
    const deptPlugs = await Plug.find(query).sort({ likes: -1, createdAt: -1 });
    
    console.log(`🔍 Boutiques trouvées: ${deptPlugs.length}`);
    if (deptPlugs.length > 0) {
      console.log(`🔍 Première boutique:`, {
        name: deptPlugs[0].name,
        delivery_depts: deptPlugs[0].services?.delivery?.departments,
        meetup_depts: deptPlugs[0].services?.meetup?.departments
      });
    }
    
    const availableCountries = await getAvailableCountries(currentLang);
    
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
        text: `🔙 ${getTranslation('back_to_departments', currentLang, customTranslations)}`,
        callback_data: `service_${serviceType}`
      }]);
      
      // Bouton retour au menu principal
      plugButtons.push([{
        text: `🏠 ${getTranslation('main_menu', currentLang, customTranslations)}`,
        callback_data: 'top_plugs'
      }]);
      
      keyboard = Markup.inlineKeyboard(plugButtons);
    } else {
      message += `❌ **Aucune boutique trouvée**\n\n`;
      message += `💡 *Aucune boutique ne propose ce service dans le département ${department}*`;
      
      keyboard = Markup.inlineKeyboard([
        [{
          text: `🔙 ${getTranslation('back_to_departments', currentLang, customTranslations)}`,
          callback_data: `top_departments_${serviceType}${selectedCountry ? `_${selectedCountry}` : ''}`
        }],
        [{
          text: `🏠 ${getTranslation('main_menu', currentLang, customTranslations)}`,
          callback_data: 'top_plugs'
        }]
      ]);
    }
    
    // Éditer le message existant AVEC image pour éviter le spam
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
    const availableCountries = await getAvailableCountries(currentLang);
    
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

// 🌍 MAPPING DES PAYS PAR LANGUE
const getCountryNameByLanguage = (countryKey, lang) => {
  const countryMapping = {
    'france': {
      fr: 'France', en: 'France', it: 'Francia', es: 'Francia', de: 'Frankreich'
    },
    'belgique': {
      fr: 'Belgique', en: 'Belgium', it: 'Belgio', es: 'Bélgica', de: 'Belgien'
    },
    'suisse': {
      fr: 'Suisse', en: 'Switzerland', it: 'Svizzera', es: 'Suiza', de: 'Schweiz'
    },
    'allemagne': {
      fr: 'Allemagne', en: 'Germany', it: 'Germania', es: 'Alemania', de: 'Deutschland'
    },
    'italie': {
      fr: 'Italie', en: 'Italy', it: 'Italia', es: 'Italia', de: 'Italien'
    },
    'espagne': {
      fr: 'Espagne', en: 'Spain', it: 'Spagna', es: 'España', de: 'Spanien'
    },
    'pays-bas': {
      fr: 'Pays-Bas', en: 'Netherlands', it: 'Paesi Bassi', es: 'Países Bajos', de: 'Niederlande'
    },
    'luxembourg': {
      fr: 'Luxembourg', en: 'Luxembourg', it: 'Lussemburgo', es: 'Luxemburgo', de: 'Luxemburg'
    },
    'portugal': {
      fr: 'Portugal', en: 'Portugal', it: 'Portogallo', es: 'Portugal', de: 'Portugal'
    },
    'royaume-uni': {
      fr: 'Royaume-Uni', en: 'United Kingdom', it: 'Regno Unito', es: 'Reino Unido', de: 'Vereinigtes Königreich'
    },
    'canada': {
      fr: 'Canada', en: 'Canada', it: 'Canada', es: 'Canadá', de: 'Kanada'
    },
    'maroc': {
      fr: 'Maroc', en: 'Morocco', it: 'Marocco', es: 'Marruecos', de: 'Marokko'
    }
  };

  const key = countryKey.toLowerCase().trim();
  return countryMapping[key]?.[lang] || countryKey;
};

// 🔍 RÉCUPÉRER TOUTES LES BOUTIQUES (INTERFACE TRADUITE SEULEMENT)
const getPlugsByLanguage = async (filters = {}, lang = 'fr') => {
  try {
    // TOUTES les boutiques doivent s'afficher dans TOUTES les langues
    // Seule l'interface est traduite, pas le contenu filtré
    const baseQuery = { isActive: true, ...filters };
    const plugs = await Plug.find(baseQuery).sort({ likes: -1, createdAt: -1 });
    
    console.log(`🌍 ${plugs.length} boutiques trouvées (TOUTES affichées en ${lang})`);
    return plugs;
    
  } catch (error) {
    console.error('Erreur récupération plugs:', error);
    return [];
  }
};

// Fonction pour récupérer les pays disponibles dynamiquement selon la langue
const getAvailableCountries = async (lang = 'fr') => {
  try {
    const countries = await Plug.distinct('countries', { isActive: true });
    const filteredCountries = countries.filter(country => 
      country && 
      country.trim() !== '' && 
      country.toLowerCase() !== 'autre' &&
      country.toLowerCase() !== 'other'
    );
    
    // Traduire les noms de pays selon la langue
    return filteredCountries.map(country => ({
      original: country,
      translated: getCountryNameByLanguage(country, lang),
      flag: getCountryFlag(country)
    }));
    
  } catch (error) {
    console.error('Erreur récupération pays:', error);
    return [
      { original: 'France', translated: getCountryNameByLanguage('france', lang), flag: '🇫🇷' },
      { original: 'Belgique', translated: getCountryNameByLanguage('belgique', lang), flag: '🇧🇪' },
      { original: 'Suisse', translated: getCountryNameByLanguage('suisse', lang), flag: '🇨🇭' },
      { original: 'Italie', translated: getCountryNameByLanguage('italie', lang), flag: '🇮🇹' }
    ];
  }
};

// Fonction pour obtenir le drapeau d'un pays (TOUS LES PAYS EUROPÉENS + EXTRA)
const getCountryFlag = (country) => {
  const countryFlags = {
    // Europe Occidentale
    'france': '🇫🇷',
    'allemagne': '🇩🇪', 'germany': '🇩🇪',
    'espagne': '🇪🇸', 'spain': '🇪🇸',
    'italie': '🇮🇹', 'italy': '🇮🇹',
    'royaume-uni': '🇬🇧', 'uk': '🇬🇧', 'great britain': '🇬🇧',
    'pays-bas': '🇳🇱', 'netherlands': '🇳🇱', 'holland': '🇳🇱',
    'belgique': '🇧🇪', 'belgium': '🇧🇪',
    'suisse': '🇨🇭', 'switzerland': '🇨🇭',
    'autriche': '🇦🇹', 'austria': '🇦🇹',
    'portugal': '🇵🇹',
    'luxembourg': '🇱🇺',
    'irlande': '🇮🇪', 'ireland': '🇮🇪',
    'islande': '🇮🇸', 'iceland': '🇮🇸',

    // Europe du Nord
    'suède': '🇸🇪', 'sweden': '🇸🇪',
    'norvège': '🇳🇴', 'norway': '🇳🇴',
    'danemark': '🇩🇰', 'denmark': '🇩🇰',
    'finlande': '🇫🇮', 'finland': '🇫🇮',

    // Europe de l'Est
    'pologne': '🇵🇱', 'poland': '🇵🇱',
    'république tchèque': '🇨🇿', 'czech republic': '🇨🇿', 'czechia': '🇨🇿',
    'hongrie': '🇭🇺', 'hungary': '🇭🇺',
    'slovaquie': '🇸🇰', 'slovakia': '🇸🇰',
    'roumanie': '🇷🇴', 'romania': '🇷🇴',
    'bulgarie': '🇧🇬', 'bulgaria': '🇧🇬',
    'estonie': '🇪🇪', 'estonia': '🇪🇪',
    'lettonie': '🇱🇻', 'latvia': '🇱🇻',
    'lituanie': '🇱🇹', 'lithuania': '🇱🇹',

    // Europe du Sud  
    'grèce': '🇬🇷', 'greece': '🇬🇷',
    'croatie': '🇭🇷', 'croatia': '🇭🇷',
    'slovénie': '🇸🇮', 'slovenia': '🇸🇮',
    'serbie': '🇷🇸', 'serbia': '🇷🇸',
    'bosnie-herzégovine': '🇧🇦', 'bosnia': '🇧🇦',
    'monténégro': '🇲🇪', 'montenegro': '🇲🇪',
    'macédoine du nord': '🇲🇰', 'north macedonia': '🇲🇰', 'macedonia': '🇲🇰',
    'albanie': '🇦🇱', 'albania': '🇦🇱',
    'malte': '🇲🇹', 'malta': '🇲🇹',
    'chypre': '🇨🇾', 'cyprus': '🇨🇾',

    // Autres pays européens
    'moldavie': '🇲🇩', 'moldova': '🇲🇩',
    'ukraine': '🇺🇦',
    'biélorussie': '🇧🇾', 'belarus': '🇧🇾',

    // Hors Europe
    'maroc': '🇲🇦', 'morocco': '🇲🇦',
    'canada': '🇨🇦',
    'usa': '🇺🇸', 'états-unis': '🇺🇸', 'united states': '🇺🇸',
    'thailand': '🇹🇭', 'thaïlande': '🇹🇭'
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
  
  // Première ligne : Pays (affichage intelligent avec traduction)
  if (countries.length > 0) {
    const countryButtons = [];
    
    // Support des deux formats : tableau d'objets (nouveau) ou tableau de strings (ancien)
    const countryList = countries[0]?.original ? countries : countries.map(c => ({ original: c, translated: c, flag: getCountryFlag(c) }));
    
    // Prioriser certains pays importants et limiter l'affichage
    const priorityCountries = ['France', 'Espagne', 'Suisse', 'Italie', 'Maroc', 'Belgique'];
    const displayCountries = [];
    
    // Ajouter les pays prioritaires s'ils existent
    priorityCountries.forEach(priority => {
      const found = countryList.find(c => c.original === priority);
      if (found) {
        displayCountries.push(found);
      }
    });
    
    // Ajouter les autres pays jusqu'à maximum 8 pays
    countryList.forEach(countryObj => {
      if (!displayCountries.find(c => c.original === countryObj.original) && displayCountries.length < 8) {
        displayCountries.push(countryObj);
      }
    });
    
    // Créer les boutons avec noms traduits
    displayCountries.forEach(countryObj => {
      const flag = countryObj.flag || getCountryFlag(countryObj.original);
      const isSelected = selectedCountry === countryObj.original;
      const buttonText = isSelected ? `✅ ${flag}` : flag;
      countryButtons.push(Markup.button.callback(buttonText, `top_country_${countryObj.original}`));
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
  
  // Troisième ligne : Département (si service delivery ou meetup sélectionné)
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
    const currentLang = config?.languages?.currentLanguage || 'fr';
    
    console.log(`👑 VIP Plugs affiché en langue: ${currentLang}`);
    
    // Récupérer les boutiques VIP selon la langue actuelle
    const vipPlugs = await getPlugsByLanguage({ isVip: true }, currentLang);

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
    
    // Récupérer la langue actuelle
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    const filterTitle = config?.botTexts?.filterServiceTitle || getTranslation('messages_selectService', currentLang, customTranslations) || '🔍 Filtrer par service';
    const filterDescription = config?.botTexts?.filterServiceDescription || getTranslation('service_choose_type', currentLang, customTranslations) || 'Choisissez le type de service :';
    const availabilityText = getTranslation('services_available', currentLang, customTranslations) || 'Disponibilité';
    const shopsText = getTranslation('shops_count', currentLang, customTranslations) || 'boutiques';
    
    const deliveryName = getTranslation('service_delivery', currentLang, customTranslations);
    const postalName = getTranslation('service_postal', currentLang, customTranslations);
    const meetupName = getTranslation('service_meetup', currentLang, customTranslations);
    
    const messageText = `${filterTitle}\n\n${filterDescription}\n\n📊 **${availabilityText} :**\n🚚 ${deliveryName}: ${deliveryCount} ${shopsText}\n✈️ ${postalName}: ${postalCount} ${shopsText}\n🏠 ${meetupName}: ${meetupCount} ${shopsText}`;
    
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

    // Récupérer la langue actuelle
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    const serviceNames = {
      delivery: `🚚 ${getTranslation('service_delivery', currentLang, customTranslations)}`,
      postal: `✈️ ${getTranslation('service_postal', currentLang, customTranslations)}`,
      meetup: `🏠 ${getTranslation('service_meetup', currentLang, customTranslations)}`
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
    console.log('🔍 handleAllDepartments appelé');
    const userId = ctx.from.id;
    
    // 🚫 Prévention spam
    if (isSpamClick(userId, 'all_departments', 'main')) {
      console.log('🔄 Spam détecté dans handleAllDepartments');
      await ctx.answerCbQuery('🔄');
      return;
    }
    
    console.log('✅ handleAllDepartments: Pas de spam, continue...');
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
      'Italie': [
        // Italie du Nord
        '00100', // Rome (Latium)
        '10100', // Turin (Piémont)
        '16100', // Gênes (Ligurie)
        '20100', // Milan (Lombardie)
        '25100', // Brescia (Lombardie)
        '30100', // Venise (Vénétie)
        '33100', // Udine (Frioul-Vénétie julienne)
        '34100', // Trieste (Frioul-Vénétie julienne)
        '35100', // Padoue (Vénétie)
        '37100', // Vérone (Vénétie)
        '38100', // Trente (Trentin-Haut-Adige)
        '39100', // Bolzano (Trentin-Haut-Adige)
        '40100', // Bologne (Émilie-Romagne)
        '41100', // Modène (Émilie-Romagne)
        '43100', // Parme (Émilie-Romagne)
        '44100', // Ferrare (Émilie-Romagne)
        '47100', // Forlì (Émilie-Romagne)
        '48100', // Ravenne (Émilie-Romagne)
        // Italie centrale
        '50100', // Florence (Toscane)
        '51100', // Pistoia (Toscane)
        '52100', // Arezzo (Toscane)
        '53100', // Sienne (Toscane)
        '55100', // Lucques (Toscane)
        '56100', // Pise (Toscane)
        '57100', // Livourne (Toscane)
        '58100', // Grosseto (Toscane)
        '59100', // Prato (Toscane)
        '60100', // Ancône (Marches)
        '61100', // Pesaro (Marches)
        '62100', // Macerata (Marches)
        '63100', // Ascoli Piceno (Marches)
        '06100', // Pérouse (Ombrie)
        '05100', // Terni (Ombrie)
        // Italie du Sud et îles
        '65100', // Pescara (Abruzzes)
        '66100', // Chieti (Abruzzes)
        '67100', // L'Aquila (Abruzzes)
        '64100', // Teramo (Abruzzes)
        '70100', // Bari (Pouilles)
        '71100', // Foggia (Pouilles)
        '72100', // Brindisi (Pouilles)
        '73100', // Lecce (Pouilles)
        '74100', // Tarente (Pouilles)
        '75100', // Matera (Basilicate)
        '85100', // Potenza (Basilicate)
        '80100', // Naples (Campanie)
        '81100', // Caserte (Campanie)
        '82100', // Bénévent (Campanie)
        '83100', // Avellino (Campanie)
        '84100', // Salerne (Campanie)
        '86100', // Campobasso (Molise)
        '88100', // Catanzaro (Calabre)
        '87100', // Cosenza (Calabre)
        '89100', // Reggio de Calabre (Calabre)
        '90100', // Palerme (Sicile)
        '91100', // Trapani (Sicile)
        '92100', // Agrigente (Sicile)
        '93100', // Caltanissetta (Sicile)
        '94100', // Enna (Sicile)
        '95100', // Catane (Sicile)
        '96100', // Syracuse (Sicile)
        '97100', // Raguse (Sicile)
        '98100', // Messine (Sicile)
        // Sardaigne
        '07100', // Sassari (Sardaigne)
        '08100', // Nuoro (Sardaigne)
        '09100', // Cagliari (Sardaigne)
        '09123', // Cagliari centre (Sardaigne)
        '09124', // Cagliari quartiers (Sardaigne)
        '09125', // Cagliari périphérie (Sardaigne)
        '07026'  // Olbia (Sardaigne)
      ],
      'Espagne': [
        // Espagne péninsulaire (par provinces selon ordre alphabétique)
        '01', // Álava
        '02', // Albacete
        '03', // Alicante
        '04', // Almería
        '05', // Ávila
        '06', // Badajoz
        '07', // Illes Balears (Mallorca, Ibiza, Formentera, Menorca)
        '08', // Barcelona
        '09', // Burgos
        '10', // Cáceres
        '11', // Cádiz
        '12', // Castellón
        '13', // Ciudad Real
        '14', // Córdoba
        '15', // A Coruña
        '16', // Cuenca
        '17', // Girona
        '18', // Granada
        '19', // Guadalajara
        '20', // Gipuzkoa
        '21', // Huelva
        '22', // Huesca
        '23', // Jaén
        '24', // León
        '25', // Lleida
        '26', // La Rioja
        '27', // Lugo
        '28', // Madrid
        '29', // Málaga
        '30', // Murcia
        '31', // Navarra
        '32', // Ourense
        '33', // Asturias
        '34', // Palencia
        '35', // Las Palmas (Gran Canaria, Lanzarote, Fuerteventura)
        '36', // Pontevedra
        '37', // Salamanca
        '38', // Santa Cruz de Tenerife (Tenerife, La Gomera, El Hierro, La Palma)
        '39', // Cantabria
        '40', // Segovia
        '41', // Sevilla
        '42', // Soria
        '43', // Tarragona
        '44', // Teruel
        '45', // Toledo
        '46', // Valencia
        '47', // Valladolid
        '48', // Bizkaia
        '49', // Zamora
        '50', // Zaragoza
        '51', // Ceuta
        '52'  // Melilla
      ],
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
    
    console.log('📤 handleAllDepartments: Envoi du message avec', countryButtons.length, 'lignes de boutons');
    
    // Éditer le message avec image
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
    console.log('✅ handleAllDepartments: Message envoyé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur dans handleAllDepartments:', error);
    await ctx.answerCbQuery('❌ Erreur').catch(() => {});
  }
};

// Gestionnaire pour afficher les départements d'un pays spécifique (depuis le menu départements)
const handleCountryDepartments = async (ctx, country) => {
  try {
    console.log(`🔍 handleCountryDepartments appelé pour ${country}`);
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
      'Italie': [
        // Italie du Nord
        '00100', // Rome (Latium)
        '10100', // Turin (Piémont)
        '16100', // Gênes (Ligurie)
        '20100', // Milan (Lombardie)
        '25100', // Brescia (Lombardie)
        '30100', // Venise (Vénétie)
        '33100', // Udine (Frioul-Vénétie julienne)
        '34100', // Trieste (Frioul-Vénétie julienne)
        '35100', // Padoue (Vénétie)
        '37100', // Vérone (Vénétie)
        '38100', // Trente (Trentin-Haut-Adige)
        '39100', // Bolzano (Trentin-Haut-Adige)
        '40100', // Bologne (Émilie-Romagne)
        '41100', // Modène (Émilie-Romagne)
        '43100', // Parme (Émilie-Romagne)
        '44100', // Ferrare (Émilie-Romagne)
        '47100', // Forlì (Émilie-Romagne)
        '48100', // Ravenne (Émilie-Romagne)
        // Italie centrale
        '50100', // Florence (Toscane)
        '51100', // Pistoia (Toscane)
        '52100', // Arezzo (Toscane)
        '53100', // Sienne (Toscane)
        '55100', // Lucques (Toscane)
        '56100', // Pise (Toscane)
        '57100', // Livourne (Toscane)
        '58100', // Grosseto (Toscane)
        '59100', // Prato (Toscane)
        '60100', // Ancône (Marches)
        '61100', // Pesaro (Marches)
        '62100', // Macerata (Marches)
        '63100', // Ascoli Piceno (Marches)
        '06100', // Pérouse (Ombrie)
        '05100', // Terni (Ombrie)
        // Italie du Sud et îles
        '65100', // Pescara (Abruzzes)
        '66100', // Chieti (Abruzzes)
        '67100', // L'Aquila (Abruzzes)
        '64100', // Teramo (Abruzzes)
        '70100', // Bari (Pouilles)
        '71100', // Foggia (Pouilles)
        '72100', // Brindisi (Pouilles)
        '73100', // Lecce (Pouilles)
        '74100', // Tarente (Pouilles)
        '75100', // Matera (Basilicate)
        '85100', // Potenza (Basilicate)
        '80100', // Naples (Campanie)
        '81100', // Caserte (Campanie)
        '82100', // Bénévent (Campanie)
        '83100', // Avellino (Campanie)
        '84100', // Salerne (Campanie)
        '86100', // Campobasso (Molise)
        '88100', // Catanzaro (Calabre)
        '87100', // Cosenza (Calabre)
        '89100', // Reggio de Calabre (Calabre)
        '90100', // Palerme (Sicile)
        '91100', // Trapani (Sicile)
        '92100', // Agrigente (Sicile)
        '93100', // Caltanissetta (Sicile)
        '94100', // Enna (Sicile)
        '95100', // Catane (Sicile)
        '96100', // Syracuse (Sicile)
        '97100', // Raguse (Sicile)
        '98100', // Messine (Sicile)
        // Sardaigne
        '07100', // Sassari (Sardaigne)
        '08100', // Nuoro (Sardaigne)
        '09100', // Cagliari (Sardaigne)
        '09123', // Cagliari centre (Sardaigne)
        '09124', // Cagliari quartiers (Sardaigne)
        '09125', // Cagliari périphérie (Sardaigne)
        '07026'  // Olbia (Sardaigne)
      ],
      'Espagne': [
        // Espagne péninsulaire (par provinces selon ordre alphabétique)
        '01', // Álava
        '02', // Albacete
        '03', // Alicante
        '04', // Almería
        '05', // Ávila
        '06', // Badajoz
        '07', // Illes Balears (Mallorca, Ibiza, Formentera, Menorca)
        '08', // Barcelona
        '09', // Burgos
        '10', // Cáceres
        '11', // Cádiz
        '12', // Castellón
        '13', // Ciudad Real
        '14', // Córdoba
        '15', // A Coruña
        '16', // Cuenca
        '17', // Girona
        '18', // Granada
        '19', // Guadalajara
        '20', // Gipuzkoa
        '21', // Huelva
        '22', // Huesca
        '23', // Jaén
        '24', // León
        '25', // Lleida
        '26', // La Rioja
        '27', // Lugo
        '28', // Madrid
        '29', // Málaga
        '30', // Murcia
        '31', // Navarra
        '32', // Ourense
        '33', // Asturias
        '34', // Palencia
        '35', // Las Palmas (Gran Canaria, Lanzarote, Fuerteventura)
        '36', // Pontevedra
        '37', // Salamanca
        '38', // Santa Cruz de Tenerife (Tenerife, La Gomera, El Hierro, La Palma)
        '39', // Cantabria
        '40', // Segovia
        '41', // Sevilla
        '42', // Soria
        '43', // Tarragona
        '44', // Teruel
        '45', // Toledo
        '46', // Valencia
        '47', // Valladolid
        '48', // Bizkaia
        '49', // Zamora
        '50', // Zaragoza
        '51', // Ceuta
        '52'  // Melilla
      ],
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

// Gestionnaire pour afficher la liste des départements disponibles (VERSION SIMPLIFIÉE)
const handleDepartmentsList = async (ctx, serviceType, selectedCountry = null) => {
  console.log(`🚨 DÉMARRAGE handleDepartmentsList - serviceType: ${serviceType}, selectedCountry: ${selectedCountry}`);
  
  try {
    await ctx.answerCbQuery();
    
    // VÉRIFICATION PAYS OBLIGATOIRE
    if (!selectedCountry || selectedCountry.trim() === '') {
      console.log(`⚠️ Aucun pays sélectionné pour ${serviceType}, affichage du message d'erreur`);
      
      const config = await Config.findById('main');
      const currentLang = config?.languages?.currentLanguage || 'fr';
      const customTranslations = config?.languages?.translations;
      
      const serviceName = getTranslation('service_delivery_name', currentLang, customTranslations);
      const meetupName = getTranslation('service_meetup_name', currentLang, customTranslations);
      const currentServiceName = serviceType === 'delivery' ? serviceName : meetupName;
      
      let message = `${getTranslation('country_required_title', currentLang, customTranslations)}\n\n`;
      message += `📦 **Service:** ${currentServiceName}\n\n`;
      message += `❌ **${getTranslation('country_required_message', currentLang, customTranslations)}**\n\n`;
      message += `💡 *${getTranslation('country_required_instruction', currentLang, customTranslations)} ${currentServiceName}*`;
      
      const backText = getTranslation('back_to_menu', currentLang, customTranslations);
      const keyboard = Markup.inlineKeyboard([
        [{
          text: backText,
          callback_data: 'top_plugs'
        }]
      ]);
      
      await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
      return;
    }
    
    // MESSAGE AVEC PAYS SÉLECTIONNÉ (TRADUIT)
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    const serviceName = getTranslation('service_delivery_name', currentLang, customTranslations);
    const meetupName = getTranslation('service_meetup_name', currentLang, customTranslations);
    const currentServiceName = serviceType === 'delivery' ? serviceName : meetupName;
    
    let message = `${getTranslation('departments_available_title', currentLang, customTranslations)}\n\n`;
    message += `📦 Service: ${currentServiceName}\n`;
    message += `🌍 Pays: ${getCountryFlag(selectedCountry)} ${selectedCountry}\n`;
    message += `\n💡 ${getTranslation('departments_click_instruction', currentLang, customTranslations)}\n\n`;
    
    // BOUTONS DÉPARTEMENTS PAR PAYS
    const buttons = [];
    
    // Départements par pays (TOUS LES PAYS EUROPÉENS + MAROC, CANADA, USA, THAILAND)
    const departmentsByCountry = {
      // Europe Occidentale
      'France': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '2A', '2B', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95'],
      'Allemagne': ['01000', '10000', '20000', '30000', '40000', '50000', '60000', '70000', '80000', '90000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '21000', '22000', '23000', '24000', '25000', '26000', '27000', '28000', '29000', '31000', '32000', '33000'],
      'Espagne': [
        // Espagne péninsulaire (par provinces selon ordre alphabétique)
        '01', // Álava
        '02', // Albacete
        '03', // Alicante
        '04', // Almería
        '05', // Ávila
        '06', // Badajoz
        '07', // Illes Balears (Mallorca, Ibiza, Formentera, Menorca)
        '08', // Barcelona
        '09', // Burgos
        '10', // Cáceres
        '11', // Cádiz
        '12', // Castellón
        '13', // Ciudad Real
        '14', // Córdoba
        '15', // A Coruña
        '16', // Cuenca
        '17', // Girona
        '18', // Granada
        '19', // Guadalajara
        '20', // Gipuzkoa
        '21', // Huelva
        '22', // Huesca
        '23', // Jaén
        '24', // León
        '25', // Lleida
        '26', // La Rioja
        '27', // Lugo
        '28', // Madrid
        '29', // Málaga
        '30', // Murcia
        '31', // Navarra
        '32', // Ourense
        '33', // Asturias
        '34', // Palencia
        '35', // Las Palmas (Gran Canaria, Lanzarote, Fuerteventura)
        '36', // Pontevedra
        '37', // Salamanca
        '38', // Santa Cruz de Tenerife (Tenerife, La Gomera, El Hierro, La Palma)
        '39', // Cantabria
        '40', // Segovia
        '41', // Sevilla
        '42', // Soria
        '43', // Tarragona
        '44', // Teruel
        '45', // Toledo
        '46', // Valencia
        '47', // Valladolid
        '48', // Bizkaia
        '49', // Zamora
        '50', // Zaragoza
        '51', // Ceuta
        '52'  // Melilla
      ],
      'Italie': [
        // Italie du Nord
        '00100', // Rome (Latium)
        '10100', // Turin (Piémont)
        '16100', // Gênes (Ligurie)
        '20100', // Milan (Lombardie)
        '25100', // Brescia (Lombardie)
        '30100', // Venise (Vénétie)
        '33100', // Udine (Frioul-Vénétie julienne)
        '34100', // Trieste (Frioul-Vénétie julienne)
        '35100', // Padoue (Vénétie)
        '37100', // Vérone (Vénétie)
        '38100', // Trente (Trentin-Haut-Adige)
        '39100', // Bolzano (Trentin-Haut-Adige)
        '40100', // Bologne (Émilie-Romagne)
        '41100', // Modène (Émilie-Romagne)
        '43100', // Parme (Émilie-Romagne)
        '44100', // Ferrare (Émilie-Romagne)
        '47100', // Forlì (Émilie-Romagne)
        '48100', // Ravenne (Émilie-Romagne)
        // Italie centrale
        '50100', // Florence (Toscane)
        '51100', // Pistoia (Toscane)
        '52100', // Arezzo (Toscane)
        '53100', // Sienne (Toscane)
        '55100', // Lucques (Toscane)
        '56100', // Pise (Toscane)
        '57100', // Livourne (Toscane)
        '58100', // Grosseto (Toscane)
        '59100', // Prato (Toscane)
        '60100', // Ancône (Marches)
        '61100', // Pesaro (Marches)
        '62100', // Macerata (Marches)
        '63100', // Ascoli Piceno (Marches)
        '06100', // Pérouse (Ombrie)
        '05100', // Terni (Ombrie)
        // Italie du Sud et îles
        '65100', // Pescara (Abruzzes)
        '66100', // Chieti (Abruzzes)
        '67100', // L'Aquila (Abruzzes)
        '64100', // Teramo (Abruzzes)
        '70100', // Bari (Pouilles)
        '71100', // Foggia (Pouilles)
        '72100', // Brindisi (Pouilles)
        '73100', // Lecce (Pouilles)
        '74100', // Tarente (Pouilles)
        '75100', // Matera (Basilicate)
        '85100', // Potenza (Basilicate)
        '80100', // Naples (Campanie)
        '81100', // Caserte (Campanie)
        '82100', // Bénévent (Campanie)
        '83100', // Avellino (Campanie)
        '84100', // Salerne (Campanie)
        '86100', // Campobasso (Molise)
        '88100', // Catanzaro (Calabre)
        '87100', // Cosenza (Calabre)
        '89100', // Reggio de Calabre (Calabre)
        '90100', // Palerme (Sicile)
        '91100', // Trapani (Sicile)
        '92100', // Agrigente (Sicile)
        '93100', // Caltanissetta (Sicile)
        '94100', // Enna (Sicile)
        '95100', // Catane (Sicile)
        '96100', // Syracuse (Sicile)
        '97100', // Raguse (Sicile)
        '98100', // Messine (Sicile)
        // Sardaigne
        '07100', // Sassari (Sardaigne)
        '08100', // Nuoro (Sardaigne)
        '09100', // Cagliari (Sardaigne)
        '09123', // Cagliari centre (Sardaigne)
        '09124', // Cagliari quartiers (Sardaigne)
        '09125', // Cagliari périphérie (Sardaigne)
        '07026'  // Olbia (Sardaigne)
      ],
      'Royaume-Uni': ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12', 'B13', 'B14', 'B15', 'B16', 'B17', 'B18', 'B19', 'B20', 'B21', 'B22', 'B23', 'B24', 'B25', 'B26', 'B27', 'B28', 'B29', 'B30'],
      'Pays-Bas': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1100', '1200', '1300', '1400', '1500', '2100', '2200', '2300', '2400', '2500', '3100', '3200', '3300', '3400', '3500', '4100', '4200', '4300', '4400', '4500'],
      'Belgique': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1500', '1200', '1400', '1300', '1600', '1800', '2500', '3500', '4500', '5500', '6500', '7500', '8500', '9500'],
      'Suisse': ['1000', '1200', '1300', '2000', '2500', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1400', '1700', '2600', '3200', '3900', '4600', '5200', '6200', '6300', '6400', '6500', '6600', '6700', '6800'],
      'Autriche': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2100', '2200', '2300', '2400', '2500', '3100', '3200'],
      'Portugal': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1100', '1200', '1300', '1400', '1500', '2100', '2200', '2300', '2400', '2500', '3100', '3200', '4100', '4200', '4300', '4400'],

      // Europe du Nord
      'Suède': ['10000', '20000', '30000', '40000', '50000', '60000', '70000', '80000', '90000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '21000', '22000'],
      'Norvège': ['0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000'],
      'Danemark': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2100', '2200'],
      'Finlande': ['00100', '00200', '00300', '00400', '00500', '00600', '00700', '00800', '00900', '01000', '01100', '01200', '01300', '01400', '01500', '01600', '01700', '01800', '01900', '02000'],

      // Europe de l'Est
      'Pologne': ['00100', '10000', '20000', '30000', '40000', '50000', '60000', '70000', '80000', '90000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '21000'],
      'République Tchèque': ['10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '21000', '22000', '23000', '24000', '25000', '26000', '27000', '28000', '29000'],
      'Hongrie': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2100', '2200'],
      'Slovaquie': ['80000', '81000', '82000', '83000', '84000', '85000', '86000', '87000', '88000', '89000', '90000', '91000', '92000', '93000', '94000', '95000', '96000', '97000', '98000', '99000'],
      'Roumanie': ['010000', '020000', '030000', '040000', '050000', '060000', '070000', '080000', '090000', '100000', '110000', '120000', '130000', '140000', '150000', '160000', '170000', '180000', '190000', '200000'],
      'Bulgarie': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2100', '2200'],

      // Europe du Sud
      'Grèce': ['10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '21000', '22000', '23000', '24000', '25000', '26000', '27000', '28000', '29000'],
      'Croatie': ['10000', '20000', '21000', '22000', '23000', '31000', '32000', '33000', '34000', '35000', '40000', '42000', '43000', '44000', '47000', '48000', '49000', '51000', '52000', '53000'],
      'Slovénie': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2100', '2200'],
      'Serbie': ['10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '21000', '22000', '23000', '24000', '25000', '26000', '27000', '28000', '29000'],

      // Autres pays européens
      'Irlande': ['D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15', 'D16', 'D17', 'D18', 'D19', 'D20'],
      'Luxembourg': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2100', '2200'],
      'Islande': ['100', '200', '300', '400', '500', '600', '700', '800', '900', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111'],

      // Hors Europe
      'Maroc': ['10000', '20000', '30000', '40000', '50000', '60000', '70000', '80000', '90000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '21000', '22000'],
      'Canada': ['A0A', 'A1A', 'B0A', 'B1A', 'C0A', 'C1A', 'E0A', 'E1A', 'G0A', 'G1A', 'H0A', 'H1A', 'J0A', 'J1A', 'K0A', 'K1A', 'L0A', 'L1A', 'M0A', 'M1A', 'N0A', 'N1A', 'P0A', 'P1A', 'R0A', 'R1A', 'S0A', 'S1A', 'T0A', 'T1A', 'V0A', 'V1A', 'X0A', 'X1A', 'Y0A', 'Y1A'],
      'USA': ['10001', '20001', '30001', '40001', '50001', '60001', '70001', '80001', '90001', '11001', '12001', '13001', '14001', '15001', '16001', '17001', '18001', '19001', '21001', '22001', '30301', '33101', '34101', '35101', '36101', '37101', '38101', '39101', '44101', '45101'],
      'Thailand': ['10100', '10200', '10300', '10400', '10500', '20100', '20200', '30100', '30200', '40100', '40200', '50100', '50200', '60100', '60200', '70100', '70200', '80100', '80200', '90100']
    };
    
    // Récupérer TOUS les départements du pays sélectionné
    const depts = departmentsByCountry[selectedCountry] || departmentsByCountry['France'];
    
    // Récupérer toutes les boutiques pour ce service et pays pour compter correctement
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
    console.log(`🔍 Trouvé ${shopsWithService.length} boutiques pour ${serviceType} dans ${selectedCountry || 'tous pays'}`);
    
    // 4 boutons par ligne avec VRAI comptage de boutiques
    for (let i = 0; i < depts.length; i += 4) {
      const row = [];
      for (let j = 0; j < 4 && (i + j) < depts.length; j++) {
        const dept = depts[i + j];
        
        // Compter les VRAIES boutiques pour ce département
        const shopsInDept = shopsWithService.filter(shop => {
          if (serviceType === 'delivery') {
            return shop.services?.delivery?.departments?.includes(dept);
          } else if (serviceType === 'meetup') {
            return shop.services?.meetup?.departments?.includes(dept);
          }
          return false;
        }).length;
        
        console.log(`📍 Département ${dept}: ${shopsInDept} boutiques`);
        
        row.push({
          text: `${dept} (${shopsInDept})`,
          callback_data: `top_dept_${serviceType}_${dept}${selectedCountry ? `_${selectedCountry}` : ''}`
        });
      }
      buttons.push(row);
    }
    
    // Bouton retour (traduit)
    const backText = getTranslation('back_to_menu', currentLang, customTranslations);
    buttons.push([{
      text: backText,
      callback_data: 'top_plugs'
    }]);
    
    console.log(`🚨 MESSAGE CRÉÉ, ${buttons.length} lignes de boutons`);
    console.log(`🚨 Première ligne:`, buttons[0]);
    
    // EDITION AVEC IMAGE (compatible avec messages image + texte)
    const keyboard = Markup.inlineKeyboard(buttons);
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
    console.log(`🚨 MESSAGE ENVOYÉ AVEC SUCCÈS`);
    
  } catch (error) {
    console.error('❌ Erreur dans handleDepartmentsList:', error);
    await ctx.answerCbQuery('❌ Erreur').catch(() => {});
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
      await safeEditMessage(ctx, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
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
    await safeEditMessage(ctx, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
    
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
  handleDepartmentsList,
  getAvailableCountries,
  getAvailableDepartments,
  getCountryFlag,
  getCountryNameByLanguage,
  getPlugsByLanguage
};