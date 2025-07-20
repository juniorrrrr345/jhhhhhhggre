const { Markup } = require('telegraf');
const Plug = require('../models/Plug');
const Config = require('../models/Config');
const { 
  createPlugsFilterKeyboard, 
  createServicesKeyboard, 
  createCountriesKeyboard,
  createPlugListKeyboard,
  createPlugKeyboard 
} = require('../utils/keyboards');
const { editMessageRobust, answerCallbackSafe, logHandler } = require('../utils/messageUtils');

// Afficher le menu des plugs
const handleTopPlugs = async (ctx) => {
  try {
    logHandler('TopPlugs', 'Début');
    
    // Toujours récupérer la config fraîche
    const config = await Config.findById('main');
    if (!config) {
      logHandler('TopPlugs', 'Configuration non trouvée');
      return await answerCallbackSafe(ctx, '❌ Configuration non trouvée');
    }
    
    const keyboard = createPlugsFilterKeyboard(config);
    const messageText = `${config.botTexts?.topPlugsTitle || '🔌 Top Des Plugs'}\n\n${config.botTexts?.topPlugsDescription || 'Choisissez une option pour découvrir nos plugs :'}`;
    
    logHandler('TopPlugs', 'Message préparé', { textLength: messageText.length });
    
    // Utiliser l'utilitaire robuste pour éditer le message
    const success = await editMessageRobust(ctx, messageText, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });
    
    if (success) {
      logHandler('TopPlugs', 'Succès');
    } else {
      logHandler('TopPlugs', 'Échec édition message');
    }
    
    // Confirmer la callback pour éviter le loading
    await answerCallbackSafe(ctx);
    
  } catch (error) {
    logHandler('TopPlugs', 'Erreur', { error: error.message });
    await answerCallbackSafe(ctx, '❌ Erreur lors du chargement');
  }
};

// Afficher les boutiques VIP
const handleVipPlugs = async (ctx, page = 0) => {
  try {
    console.log('👑 Gestion Boutiques VIP, page:', page);
    
    // Toujours récupérer la config fraîche
    const config = await Config.findById('main');
    if (!config) {
      console.log('❌ Configuration non trouvée pour VIP');
      return ctx.answerCbQuery('❌ Configuration non trouvée');
    }
    
    const vipPlugs = await Plug.find({ isActive: true, isVip: true })
      .sort({ likes: -1, vipOrder: 1, createdAt: -1 });

    console.log(`📊 ${vipPlugs.length} boutiques VIP trouvées`);

    if (vipPlugs.length === 0) {
      const backButtonText = config.botTexts?.backButtonText || '🔙 Retour';
      const backKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback(backButtonText, 'back_main')]
      ]);
      
      const noVipMessage = '👑 **Boutiques VIP**\n\n❌ Aucune boutique VIP disponible pour le moment.';
      
      // Essayer editMessageText puis editMessageCaption
      try {
        await ctx.editMessageText(noVipMessage, {
          reply_markup: backKeyboard.reply_markup,
          parse_mode: 'Markdown'
        });
      } catch (error) {
        try {
          await ctx.editMessageCaption(noVipMessage, {
            reply_markup: backKeyboard.reply_markup,
            parse_mode: 'Markdown'
          });
        } catch (captionError) {
          await ctx.reply(noVipMessage, {
            reply_markup: backKeyboard.reply_markup,
            parse_mode: 'Markdown'
          });
        }
      }
      
      await ctx.answerCbQuery();
      return;
    }

    const plugsPerPage = 5;
    const totalPages = Math.ceil(vipPlugs.length / plugsPerPage);
    const startIndex = page * plugsPerPage;
    const endIndex = startIndex + plugsPerPage;
    const currentPagePlugs = vipPlugs.slice(startIndex, endIndex);

    // Créer les boutons pour chaque plug VIP
    const buttons = [];
    
    for (const plug of currentPagePlugs) {
      const likesText = plug.likes > 0 ? ` ❤️${plug.likes}` : '';
      buttons.push([Markup.button.callback(`👑 ${plug.name}${likesText}`, `plug_${plug._id}_from_plugs_vip`)]);
    }

    // Boutons de navigation
    if (totalPages > 1) {
      const navButtons = [];
      if (page > 0) {
        navButtons.push(Markup.button.callback('⬅️ Précédent', `page_vip_${page - 1}`));
      }
      navButtons.push(Markup.button.callback(`${page + 1}/${totalPages}`, 'current_page'));
      if (page < totalPages - 1) {
        navButtons.push(Markup.button.callback('➡️ Suivant', `page_vip_${page + 1}`));
      }
      buttons.push(navButtons);
    }

    // Bouton retour
    const backButtonText = config?.botTexts?.backButtonText || '🔙 Retour';
    buttons.push([Markup.button.callback(backButtonText, 'back_main')]);

    const keyboard = Markup.inlineKeyboard(buttons);
    
    const paginationFormat = config.botTexts?.paginationFormat || '📄 Page {page}/{total}';
    const paginationText = paginationFormat
      .replace('{page}', page + 1)
      .replace('{total}', totalPages);
    
    const messageText = `${config.botTexts?.vipTitle || '👑 Boutiques VIP Premium'}\n\n${config.botTexts?.vipDescription || '✨ Découvrez nos boutiques sélectionnées'}\n\n${paginationText} • ${vipPlugs.length} boutique${vipPlugs.length > 1 ? 's' : ''}`;

    console.log('📝 Message VIP préparé');

    // Essayer différentes méthodes d'édition selon le contexte
    const welcomeImage = config.welcome?.image;
    
    try {
      if (welcomeImage) {
        console.log('🖼️ VIP avec image');
        await ctx.editMessageMedia({
          type: 'photo',
          media: welcomeImage,
          caption: messageText,
          parse_mode: 'Markdown'
        }, {
          reply_markup: keyboard.reply_markup
        });
        console.log('✅ EditMessageMedia réussi pour VIP');
      } else {
        await ctx.editMessageText(messageText, {
          reply_markup: keyboard.reply_markup,
          parse_mode: 'Markdown'
        });
        console.log('✅ EditMessageText réussi pour VIP');
      }
    } catch (error) {
      console.log('⚠️ Première méthode échouée, tentative fallback');
      try {
        if (welcomeImage) {
          await ctx.editMessageCaption(messageText, {
            reply_markup: keyboard.reply_markup,
            parse_mode: 'Markdown'
          });
        } else {
          await ctx.editMessageCaption(messageText, {
            reply_markup: keyboard.reply_markup,
            parse_mode: 'Markdown'
          });
        }
        console.log('✅ EditMessageCaption réussi pour VIP');
      } catch (captionError) {
        console.log('⚠️ Toutes les méthodes d\'édition ont échoué, envoi nouveau message');
        if (welcomeImage) {
          await ctx.replyWithPhoto(welcomeImage, {
            caption: messageText,
            reply_markup: keyboard.reply_markup,
            parse_mode: 'Markdown'
          });
        } else {
          await ctx.reply(messageText, {
            reply_markup: keyboard.reply_markup,
            parse_mode: 'Markdown'
          });
        }
        console.log('✅ Nouveau message envoyé pour VIP');
      }
    }

    await ctx.answerCbQuery();
    console.log('✅ VIP terminé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur dans handleVipPlugs:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement des boutiques VIP');
  }
};

// Afficher tous les plugs
const handleAllPlugs = async (ctx, page = 0) => {
  try {
    const config = await Config.findById('main');
    const plugs = await Plug.find({ isActive: true })
      .sort({ likes: -1, isVip: -1, vipOrder: 1, createdAt: -1 });

    if (plugs.length === 0) {
      return ctx.editMessageText(
        config.messages.noPlugsFound,
        { reply_markup: createPlugsFilterKeyboard(config).reply_markup }
      );
    }

    const itemsPerPage = 5;
    const totalPages = Math.ceil(plugs.length / itemsPerPage);
    const keyboard = createPlugListKeyboard(plugs, page, totalPages, 'all');

    let message = `${config.botTexts?.allPlugsText || '📋 Tous nos plugs :'}\n\n`;
    
    // Format du compteur total configurable
    const totalCountFormat = config.botTexts?.totalCountFormat || '📊 Total : {count} plugs';
    const totalCountText = totalCountFormat.replace('{count}', plugs.length);
    message += `${totalCountText}\n`;
    
    // Format de pagination configurable
    const paginationFormat = config.botTexts?.paginationFormat || '📄 Page {page}/{total}';
    const paginationText = paginationFormat
      .replace('{page}', page + 1)
      .replace('{total}', totalPages);
    message += paginationText;

    if (config.welcome?.image) {
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
    
    // Confirmer la callback pour éviter le loading
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Erreur dans handleAllPlugs:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement');
  }
};

// Afficher le menu des services
const handleFilterService = async (ctx) => {
  try {
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
    
    if (config?.welcome?.image) {
      try {
        await ctx.editMessageMedia({
          type: 'photo',
          media: config.welcome.image,
          caption: messageText,
          parse_mode: 'Markdown'
        }, {
          reply_markup: keyboard.reply_markup
        });
      } catch (error) {
        await ctx.editMessageText(messageText, {
          reply_markup: keyboard.reply_markup,
          parse_mode: 'Markdown'
        });
      }
    } else {
      await ctx.editMessageText(messageText, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown'
      });
    }
    
    // Confirmer la callback pour éviter le loading
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('❌ Erreur dans handleFilterService:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement');
  }
};

// Filtrer par service spécifique
const handleServiceFilter = async (ctx, serviceType, page = 0) => {
  try {
    console.log(`🔍 Recherche de plugs avec service: ${serviceType}`);
    
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
      
      await ctx.editMessageText(
        `😅 Aucun plug trouvé pour ce service.\n\n🔧 Vérifiez que les boutiques ont ce service activé dans le panel admin.`,
        { reply_markup: createServicesKeyboard().reply_markup }
      );
      
      // Confirmer la callback
      await ctx.answerCbQuery();
      return;
    }

    const itemsPerPage = 5;
    const totalPages = Math.ceil(plugs.length / itemsPerPage);
    const keyboard = createPlugListKeyboard(plugs, page, totalPages, `service_${serviceType}`);

    const serviceNames = {
      delivery: '🚚 Livraison',
      postal: '✈️ Envoi postal',
      meetup: '🏠 Meetup'
    };

    let message = `🔍 **Plugs avec ${serviceNames[serviceType]} :**\n\n`;
    message += `📊 Total : ${plugs.length} plugs\n`;
    message += `📄 Page ${page + 1}/${totalPages}`;

    await ctx.editMessageText(message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });
    
    // Confirmer la callback
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('❌ Erreur dans handleServiceFilter:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement');
  }
};

// Afficher le menu des pays
const handleFilterCountry = async (ctx) => {
  try {
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
    
    if (config.welcome?.image) {
      try {
        await ctx.editMessageMedia({
          type: 'photo',
          media: config.welcome.image,
          caption: messageText,
          parse_mode: 'Markdown'
        }, {
          reply_markup: keyboard.reply_markup
        });
      } catch (error) {
        await ctx.editMessageText(messageText, {
          reply_markup: keyboard.reply_markup,
          parse_mode: 'Markdown'
        });
      }
    } else {
      await ctx.editMessageText(messageText, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown'
      });
    }
    
    // Confirmer la callback pour éviter le loading
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Erreur dans handleFilterCountry:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement');
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
    const keyboard = createPlugListKeyboard(plugs, page, totalPages, `country_${country.toLowerCase()}`);

    let message = `🌍 **Plugs en ${country.charAt(0).toUpperCase() + country.slice(1)} :**\n\n`;
    message += `📊 Total : ${plugs.length} plugs\n`;
    message += `📄 Page ${page + 1}/${totalPages}`;

    await ctx.editMessageText(message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('Erreur dans handleCountryFilter:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement');
  }
};

// Afficher un plug spécifique avec contexte de retour
const handlePlugDetails = async (ctx, plugId, returnContext = 'top_plugs') => {
  try {
    const plug = await Plug.findById(plugId);
    
    if (!plug || !plug.isActive) {
      return ctx.answerCbQuery('❌ Plug non trouvé ou inactif');
    }

    let message = `${plug.isVip ? '⭐ ' : ''}**${plug.name}**\n\n`;
    message += `📝 ${plug.description}\n\n`;

    // Services disponibles
    const services = [];
    if (plug.services.delivery.enabled) {
      services.push(`🚚 **Livraison**${plug.services.delivery.description ? `: ${plug.services.delivery.description}` : ''}`);
    }
    if (plug.services.postal.enabled) {
      services.push(`✈️ **Envoi postal**${plug.services.postal.description ? `: ${plug.services.postal.description}` : ''}`);
    }
    if (plug.services.meetup.enabled) {
      services.push(`🏠 **Meetup**${plug.services.meetup.description ? `: ${plug.services.meetup.description}` : ''}`);
    }

    if (services.length > 0) {
      message += `🔧 **Services :**\n${services.join('\n')}\n\n`;
    }

    // Pays desservis
    if (plug.countries.length > 0) {
      message += `🌍 **Pays desservis :** ${plug.countries.join(', ')}\n\n`;
    }

    const keyboard = createPlugKeyboard(plug, returnContext);

    if (plug.image) {
      try {
        await ctx.editMessageMedia({
          type: 'photo',
          media: plug.image,
          caption: message,
          parse_mode: 'Markdown'
        }, {
          reply_markup: keyboard.reply_markup
        });
      } catch (error) {
        console.error('Erreur envoi image plug:', error);
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
    console.error('Erreur dans handlePlugDetails:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement');
  }
};

// Afficher les détails d'un service d'un plug
const handlePlugServiceDetails = async (ctx, plugId, serviceType) => {
  try {
    const plug = await Plug.findById(plugId);
    
    if (!plug || !plug.isActive) {
      return ctx.answerCbQuery('❌ Plug non trouvé');
    }

    const service = plug.services[serviceType];
    if (!service || !service.enabled) {
      return ctx.answerCbQuery('❌ Service non disponible');
    }

    const serviceNames = {
      delivery: '🚚 Livraison',
      postal: '✈️ Envoi postal',
      meetup: '🏠 Meetup'
    };

    let message = `${plug.isVip ? '⭐ ' : ''}**${plug.name}**\n\n`;
    message += `${serviceNames[serviceType]}\n\n`;
    
    if (service.description) {
      message += `📝 ${service.description}\n\n`;
    }

    if (plug.countries.length > 0) {
      message += `🌍 **Disponible en :** ${plug.countries.join(', ')}\n\n`;
    }

    message += '📱 **Contactez directement :**';

    const keyboard = createPlugKeyboard(plug);

    await ctx.editMessageText(message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });

  } catch (error) {
    console.error('Erreur dans handlePlugServiceDetails:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement');
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
  handlePlugServiceDetails
};