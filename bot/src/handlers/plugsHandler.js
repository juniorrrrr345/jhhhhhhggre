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
const { sendMessageWithImage, editMessageWithImage } = require('../utils/messageHelper');

// Afficher le menu des plugs
const handleTopPlugs = async (ctx) => {
  try {
    // Toujours récupérer la config fraîche
    const config = await Config.findById('main');
    const keyboard = createPlugsFilterKeyboard(config);
    
    const messageText = `${config?.botTexts?.topPlugsTitle || '🔌 Top Des Plugs'}\n\n${config?.botTexts?.topPlugsDescription || 'Choisissez une option pour découvrir nos plugs :'}`;
    
    // Utiliser la fonction helper pour afficher avec image
    await editMessageWithImage(ctx, messageText, keyboard, config, { parse_mode: 'Markdown' });
    
    // Confirmer la callback pour éviter le loading
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Erreur dans handleTopPlugs:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement');
  }
};

// Afficher les boutiques VIP
const handleVipPlugs = async (ctx, page = 0) => {
  try {
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
      await ctx.answerCbQuery();
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
      const likesText = plug.likes > 0 ? ` ❤️${plug.likes}` : '';
      // Utiliser le contexte 'plugs_vip' pour que le retour fonctionne correctement
      buttons.push([Markup.button.callback(`👑 ${plug.name}${likesText}`, `plug_${plug._id}_from_plugs_vip`)]);
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

    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Erreur dans handleVipPlugs:', error);
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
      const messageText = config?.messages?.noPlugsFound || '❌ Aucun plug trouvé';
      const keyboard = createPlugsFilterKeyboard(config);
      
      await editMessageWithImage(ctx, messageText, keyboard, config, { parse_mode: 'Markdown' });
      await ctx.answerCbQuery();
      return;
    }

    const itemsPerPage = 5;
    const totalPages = Math.ceil(plugs.length / itemsPerPage);
    
    // Utiliser le contexte 'plugs_all' pour que le retour fonctionne correctement
    const keyboard = createPlugListKeyboard(plugs, page, totalPages, 'plugs_all');

    let message = `${config.botTexts?.allPlugsTitle || 'Tous Nos Plugs Certifié 🔌'}\n`;
    
    // Format du compteur total configurable
    const totalCountFormat = config.botTexts?.totalCountFormat || '( Trier par le nombres de Likes 🖤 )';
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
    
    // Utiliser la fonction helper pour afficher avec image
    await editMessageWithImage(ctx, messageText, keyboard, config, { parse_mode: 'Markdown' });
    
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
      
      const messageText = `😅 Aucun plug trouvé pour ce service.\n\n🔧 Vérifiez que les boutiques ont ce service activé dans le panel admin.`;
      const keyboard = createServicesKeyboard(config);
      
      await editMessageWithImage(ctx, messageText, keyboard, config, { parse_mode: 'Markdown' });
      await ctx.answerCbQuery();
      return;
    }

    const itemsPerPage = 5;
    const totalPages = Math.ceil(plugs.length / itemsPerPage);
    
    // Utiliser le contexte 'service_TYPE' pour que le retour fonctionne correctement
    const keyboard = createPlugListKeyboard(plugs, page, totalPages, `service_${serviceType}`);

    const serviceNames = {
      delivery: '🚚 Livraison',
      postal: '✈️ Envoi postal',
      meetup: '🏠 Meetup'
    };

    let message = `🔍 **Plugs avec ${serviceNames[serviceType]} :**\n\n`;
    message += `📊 Total : ${plugs.length} plugs\n`;
    message += `📄 Page ${page + 1}/${totalPages}`;

    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
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
    
    // Utiliser la fonction helper pour afficher avec image
    await editMessageWithImage(ctx, messageText, keyboard, config, { parse_mode: 'Markdown' });
    
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
      return ctx.answerCbQuery('❌ Plug non trouvé ou inactif');
    }

    // Récupérer la config pour les textes personnalisés
    const config = await Config.findById('main');

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

    // Afficher les likes si disponibles
    if (plug.likes > 0) {
      message += `❤️ **${plug.likes} like${plug.likes > 1 ? 's' : ''}**\n\n`;
    }

    const keyboard = createPlugKeyboard(plug, returnContext);

    // Utiliser la fonction helper pour afficher avec image
    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
    // Confirmer la callback pour éviter le loading
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Erreur dans handlePlugDetails:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement');
  }
};

// Afficher les détails d'un service d'un plug
const handlePlugServiceDetails = async (ctx, plugId, serviceType) => {
  try {
    console.log(`🔧 handlePlugServiceDetails: plugId=${plugId}, serviceType=${serviceType}`);
    const plug = await Plug.findById(plugId);
    console.log(`📦 Plug found for service:`, plug ? `${plug.name} (active: ${plug.isActive})` : 'null');
    
    if (!plug || !plug.isActive) {
      console.log('❌ Plug non trouvé pour service');
      return ctx.answerCbQuery('❌ Plug non trouvé');
    }

    const service = plug.services[serviceType];
    if (!service || !service.enabled) {
      return ctx.answerCbQuery('❌ Service non disponible');
    }

    // Récupérer la config pour les textes et images
    const config = await Config.findById('main');

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

    // Créer un clavier spécifique pour les services avec retour intelligent
    const buttons = [];
    
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
    
    // Bouton retour vers les détails du plug
    buttons.push([Markup.button.callback('🔙 Retour aux détails', `plug_${plug._id}_from_top_plugs`)]);
    
    const keyboard = Markup.inlineKeyboard(buttons);

    await editMessageWithImage(ctx, message, keyboard, config, { parse_mode: 'Markdown' });
    
    // Confirmer la callback pour éviter le loading
    await ctx.answerCbQuery();

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