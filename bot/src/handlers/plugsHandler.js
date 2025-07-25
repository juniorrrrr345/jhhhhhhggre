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
const { getTranslation } = require('../utils/translations');

// 🔘 NOUVEAU SYSTÈME - Top des Plugs avec filtres avancés
const handleTopPlugs = async (ctx) => {
  try {
    await ctx.answerCbQuery();
    
    // Récupérer la langue actuelle
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    // Récupérer tous les plugs actifs triés par votes
    const plugs = await Plug.find({ 
      isActive: true 
    }).sort({ 
      isVip: -1,
      likes: -1,
      createdAt: -1 
    });
    
    console.log(`🔝 Top Plugs: ${plugs.length} plugs trouvés`);
    
    let message = `🔝 **${getTranslation('menu_topPlugs', currentLang, customTranslations)}**\n\n`;
    
    if (plugs.length === 0) {
      message += getTranslation('messages_noShops', currentLang, customTranslations);
    } else {
      message += `*(${getTranslation('messages_sortedByVotes', currentLang, customTranslations)})*\n\n`;
      
      // Statistiques des services avec traductions
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
      
      console.log(`📊 Services disponibles: ${getTranslation('service_delivery', currentLang, customTranslations)}(${deliveryCount}), ${getTranslation('service_postal', currentLang, customTranslations)}(${postalCount}), ${getTranslation('service_meetup', currentLang, customTranslations)}(${meetupCount})`);
      
      message += `📊 **${getTranslation('services_available', currentLang, customTranslations)} :**\n` +
        `📦 ${getTranslation('service_delivery', currentLang, customTranslations)}: ${deliveryCount} ${getTranslation('shops_word', currentLang, customTranslations)}\n` +
        `✈️ ${getTranslation('service_postal', currentLang, customTranslations)}: ${postalCount} ${getTranslation('shops_word', currentLang, customTranslations)}\n` +
        `🏠 ${getTranslation('service_meetup', currentLang, customTranslations)}: ${meetupCount} ${getTranslation('shops_word', currentLang, customTranslations)}`;
    }
    
    const keyboard = createPlugsFilterKeyboard(currentLang, customTranslations);
    
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Erreur dans handleTopPlugs:', error);
    await ctx.answerCbQuery(getTranslation('error_loading', 'fr')).catch(() => {});
  }
};

// Gestionnaire pour les filtres de pays - NOUVEAU SYSTÈME
const handleTopCountryFilter = async (ctx, country) => {
  try {
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    
    // Filtrer les plugs par pays
    const countryPlugs = await Plug.find({ 
      isActive: true,
      countries: { $in: [country] }
    }).sort({ likes: -1, createdAt: -1 });

    const availableCountries = await getAvailableCountries();
    
    let message = `🔌 **Liste des Plugs**\n`;
    message += `*(Triés par nombre de votes)*\n\n`;
    message += `🌍 **Filtre:** ${getCountryFlag(country)} ${country}\n\n`;
    
    let keyboard;
    
    if (countryPlugs.length > 0) {
      message += `**${countryPlugs.length} boutiques trouvées :**\n\n`;
      
      // Ajouter les boutiques au clavier
      const plugButtons = [];
      countryPlugs.slice(0, 10).forEach((plug, index) => {
        const countryFlag = getCountryFlag(plug.countries[0]);
        const location = plug.location ? ` ${plug.location}` : '';
        const vipIcon = plug.isVip ? '⭐️ ' : '';
        const buttonText = `${countryFlag}${location} ${vipIcon}${plug.name} 👍 ${plug.likes}`;
        plugButtons.push([Markup.button.callback(buttonText, `plug_${plug._id}_from_top_country`)]);
      });
      
      keyboard = createTopPlugsKeyboard(availableCountries, country, null, plugButtons);
    } else {
      message += `❌ Aucun plug disponible pour ${country}.`;
      keyboard = createTopPlugsKeyboard(availableCountries, country, null);
    }
    
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Erreur dans handleTopCountryFilter:', error);
    await ctx.answerCbQuery('❌ Erreur lors du filtrage').catch(() => {});
  }
};

// Gestionnaire pour les filtres de services (Livraison, Meetup, Postal) - NOUVEAU SYSTÈME
const handleTopServiceFilter = async (ctx, serviceType, selectedCountry = null) => {
  try {
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    
    // Construire la requête selon le service
    let query = { isActive: true };
    
    switch (serviceType) {
      case 'delivery':
        query['services.delivery.enabled'] = true;
        break;
      case 'meetup':
        query['services.meetup.enabled'] = true;
        break;
      case 'postal':
        query['services.postal.enabled'] = true;
        break;
    }
    
    // Ajouter le filtre pays si sélectionné
    if (selectedCountry) {
      query.countries = { $in: [selectedCountry] };
    }
    
    const servicePlugs = await Plug.find(query).sort({ likes: -1, createdAt: -1 });
    
    const availableCountries = await getAvailableCountries();
    
    let message = `🔌 **Liste des Plugs**\n`;
    message += `*(Triés par nombre de votes)*\n\n`;
    
    // Titre selon le service
    const serviceNames = {
      delivery: '📦 Afficher les boutiques disponibles pour livraison',
      meetup: '🤝 Afficher les boutiques disponibles pour meetup',
      postal: '📬 Boutiques qui font des envois postaux'
    };
    
    message += `${serviceNames[serviceType]}\n\n`;
    
    if (selectedCountry) {
      message += `🌍 **Filtre:** ${getCountryFlag(selectedCountry)} ${selectedCountry}\n\n`;
    }
    
    let keyboard;
    
    if (servicePlugs.length > 0) {
      message += `**${servicePlugs.length} boutiques trouvées :**\n\n`;
      
      // Ajouter les boutiques au clavier
      const plugButtons = [];
      servicePlugs.slice(0, 10).forEach((plug, index) => {
        const country = getCountryFlag(plug.countries[0]);
        const location = plug.location ? ` ${plug.location}` : '';
        const vipIcon = plug.isVip ? '⭐️ ' : '';
        const buttonText = `${country}${location} ${vipIcon}${plug.name} 👍 ${plug.likes}`;
        plugButtons.push([Markup.button.callback(buttonText, `plug_${plug._id}_from_top_service`)]);
      });
      
      keyboard = createTopPlugsKeyboard(availableCountries, selectedCountry, serviceType, plugButtons);
    } else {
      const serviceName = serviceNames[serviceType].toLowerCase();
      message += `❌ Aucun plug disponible pour ${serviceName}.`;
      keyboard = createTopPlugsKeyboard(availableCountries, selectedCountry, serviceType);
    }
    
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Erreur dans handleTopServiceFilter:', error);
    await ctx.answerCbQuery('❌ Erreur lors du filtrage').catch(() => {});
  }
};

// Gestionnaire pour les départements (delivery et meetup)
const handleDepartmentFilter = async (ctx, serviceType, selectedCountry = null) => {
  try {
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    
    // Récupérer les départements disponibles selon le service
    const departments = await getAvailableDepartments(serviceType, selectedCountry);
    
    if (departments.length === 0) {
      await ctx.answerCbQuery('❌ Aucun département disponible');
      return;
    }
    
    const keyboard = createDepartmentsKeyboard(departments, serviceType, selectedCountry);
    
    let message = `📍 **Départements disponibles**\n\n`;
    
    if (serviceType === 'delivery') {
      message += `📦 **Service:** Livraison\n`;
    } else if (serviceType === 'meetup') {
      message += `🤝 **Service:** Meetup\n`;
    }
    
    if (selectedCountry) {
      message += `🌍 **Pays:** ${getCountryFlag(selectedCountry)} ${selectedCountry}\n`;
    }
    
    message += `\nSélectionnez un département :`;
    
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Erreur dans handleDepartmentFilter:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement des départements').catch(() => {});
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
    
    let message = `🔌 **Liste des Plugs**\n`;
    message += `*(Triés par nombre de votes)*\n\n`;
    
    if (serviceType === 'delivery') {
      message += `📦 **Service:** Livraison\n`;
    } else if (serviceType === 'meetup') {
      message += `🤝 **Service:** Meetup\n`;
    }
    
    message += `📍 **Département:** ${department}\n`;
    
    if (selectedCountry) {
      message += `🌍 **Pays:** ${getCountryFlag(selectedCountry)} ${selectedCountry}\n`;
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
      
      keyboard = createTopPlugsKeyboard(availableCountries, selectedCountry, serviceType, plugButtons);
    } else {
      message += `❌ Aucun plug disponible dans le département ${department}.`;
      keyboard = createTopPlugsKeyboard(availableCountries, selectedCountry, serviceType);
    }
    
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Erreur dans handleSpecificDepartment:', error);
    await ctx.answerCbQuery('❌ Erreur lors du filtrage').catch(() => {});
  }
};

// Gestionnaire pour réinitialiser tous les filtres
const handleResetFilters = async (ctx) => {
  try {
    await ctx.answerCbQuery('🔄 Filtres réinitialisés');
    // Retourner à l'affichage initial
    await handleTopPlugs(ctx);
  } catch (error) {
    console.error('Erreur dans handleResetFilters:', error);
    await ctx.answerCbQuery('❌ Erreur lors de la réinitialisation').catch(() => {});
  }
};

// === FONCTIONS UTILITAIRES ===

// Récupérer les pays disponibles
const getAvailableCountries = async () => {
  try {
    const countries = await Plug.distinct('countries', { isActive: true });
    return countries.filter(country => country && country.trim() !== '');
  } catch (error) {
    console.error('Erreur récupération pays:', error);
    return ['France', 'Spain', 'Switzerland', 'Italy']; // Fallback
  }
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

// Obtenir le drapeau du pays
const getCountryFlag = (country) => {
  const flags = {
    'France': '🇫🇷',
    'Espagne': '🇪🇸',
    'Spain': '🇪🇸', 
    'Suisse': '🇨🇭',
    'Switzerland': '🇨🇭',
    'Italie': '🇮🇹',
    'Italy': '🇮🇹',
    'Belgique': '🇧🇪',
    'Belgium': '🇧🇪',
    'Allemagne': '🇩🇪',
    'Germany': '🇩🇪',
    'Pays-Bas': '🇳🇱',
    'Netherlands': '🇳🇱',
    'Portugal': '🇵🇹',
    'Maroc': '🇲🇦',
    'Morocco': '🇲🇦',
    'Tunisie': '🇹🇳',
    'Tunisia': '🇹🇳',
    'Algérie': '🇩🇿',
    'Algeria': '🇩🇿',
    'Canada': '🇨🇦',
    'États-Unis': '🇺🇸',
    'USA': '🇺🇸',
    'United States': '🇺🇸',
    'Royaume-Uni': '🇬🇧',
    'UK': '🇬🇧',
    'United Kingdom': '🇬🇧',
    'Cameroun': '🇨🇲',
    'Cameroon': '🇨🇲',
    'Sénégal': '🇸🇳',
    'Senegal': '🇸🇳',
    'Madagascar': '🇲🇬',
    "Côte d'Ivoire": '🇨🇮',
    'Ivory Coast': '🇨🇮'
  };
  return flags[country] || '🌍';
};

// Créer le clavier principal Top des Plugs
const createTopPlugsKeyboard = (config, countries, selectedCountry, selectedService, plugButtons = [], departments = []) => {
  const buttons = [];
  
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
  
  // Deuxième ligne : Filtres de services
  const serviceRow = [];
  
  const deliveryText = selectedService === 'delivery' ? '✅ 📦 Livraison' : '📦 Livraison';
  const meetupText = selectedService === 'meetup' ? '✅ 🤝 Meetup' : '🤝 Meetup';
  const postalText = selectedService === 'postal' ? '✅ 📬 Envoi Postal' : '📬 Envoi Postal';
  
  serviceRow.push(Markup.button.callback(deliveryText, `top_service_delivery${selectedCountry ? `_${selectedCountry}` : ''}`));
  serviceRow.push(Markup.button.callback(meetupText, `top_service_meetup${selectedCountry ? `_${selectedCountry}` : ''}`));
  serviceRow.push(Markup.button.callback(postalText, `top_service_postal${selectedCountry ? `_${selectedCountry}` : ''}`));
  
  buttons.push(serviceRow);
  
  // Quatrième ligne : Département (si service delivery ou meetup sélectionné)
  if (selectedService === 'delivery' || selectedService === 'meetup') {
    const deptButton = Markup.button.callback('📍 Département 🔁', `top_departments_${selectedService}${selectedCountry ? `_${selectedCountry}` : ''}`);
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
  
  // Dernière ligne : Réinitialiser + Retour
  const actionRow = [];
  actionRow.push(Markup.button.callback('🔁 Réinitialiser les filtres', 'top_reset_filters'));
  actionRow.push(Markup.button.callback('🔙 Retour au menu', 'back_main'));
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
    message += `📝 ${plug.description}\n\n`;

    // Services disponibles avec traductions
    const services = [];
    if (plug.services?.delivery?.enabled) {
      const serviceName = getTranslation('service_delivery', currentLang, customTranslations);
      services.push(`📦 **${serviceName}**${plug.services.delivery.description ? `: ${plug.services.delivery.description}` : ''}`);
    }
    if (plug.services?.meetup?.enabled) {
      const serviceName = getTranslation('service_meetup', currentLang, customTranslations);
      services.push(`🏠 **${serviceName}**${plug.services.meetup.description ? `: ${plug.services.meetup.description}` : ''}`);
    }
    if (plug.services?.postal?.enabled) {
      const serviceName = getTranslation('service_postal', currentLang, customTranslations);
      services.push(`✈️ **${serviceName}**${plug.services.postal.description ? `: ${plug.services.postal.description}` : ''}`);
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
  getAvailableCountries,
  getAvailableDepartments,
  getCountryFlag
};