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

// Afficher le menu des plugs
const handleTopPlugs = async (ctx) => {
  try {
    const config = await Config.findById('main');
    const keyboard = createPlugsFilterKeyboard(config);
    
    await ctx.editMessageText(
      '🔌 **Top Des Plugs**\n\nChoisissez une option pour découvrir nos plugs :',
      {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown'
      }
    );
    
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
    const config = await Config.findById('main');
    const vipPlugs = await Plug.find({ isActive: true, isVip: true })
      .sort({ likes: -1, vipOrder: 1, createdAt: -1 });

    if (vipPlugs.length === 0) {
      const backKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Retour', 'back_main')]
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

    // Créer les boutons pour chaque plug VIP
    const buttons = [];
    
    for (const plug of currentPagePlugs) {
      const likesText = plug.likes > 0 ? ` ❤️${plug.likes}` : '';
      buttons.push([Markup.button.callback(`👑 ${plug.name}${likesText}`, `plug_${plug._id}_plugs_vip`)]);
    }

    // Boutons de navigation
    const navButtons = [];
    if (page > 0) {
      navButtons.push(Markup.button.callback('⬅️ Précédent', `page_vip_${page - 1}`));
    }
    if (page < totalPages - 1) {
      navButtons.push(Markup.button.callback('➡️ Suivant', `page_vip_${page + 1}`));
    }
    if (navButtons.length > 0) {
      buttons.push(navButtons);
    }

    // Bouton retour
    buttons.push([Markup.button.callback('🔙 Retour', 'back_main')]);

    const keyboard = Markup.inlineKeyboard(buttons);
    
    const messageText = `👑 **Boutiques VIP Premium**\n\n✨ Découvrez nos boutiques sélectionnées\n\n📄 Page ${page + 1}/${totalPages} • ${vipPlugs.length} boutique${vipPlugs.length > 1 ? 's' : ''}`;

    await ctx.editMessageText(messageText, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });

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
      return ctx.editMessageText(
        config.messages.noPlugsFound,
        { reply_markup: createPlugsFilterKeyboard(config).reply_markup }
      );
    }

    const itemsPerPage = 5;
    const totalPages = Math.ceil(plugs.length / itemsPerPage);
    const keyboard = createPlugListKeyboard(plugs, page, totalPages, 'all');

    let message = '📋 **Tous nos plugs :**\n\n';
    message += `📊 Total : ${plugs.length} plugs\n`;
    message += `📄 Page ${page + 1}/${totalPages}`;

    await ctx.editMessageText(message, {
      reply_markup: keyboard.reply_markup,
      parse_mode: 'Markdown'
    });
    
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
    const keyboard = createServicesKeyboard();
    
    await ctx.editMessageText(
      '🔍 **Filtrer par service**\n\nChoisissez le type de service :',
      {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown'
      }
    );
    
    // Confirmer la callback pour éviter le loading
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Erreur dans handleFilterService:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement');
  }
};

// Filtrer par service spécifique
const handleServiceFilter = async (ctx, serviceType, page = 0) => {
  try {
    const config = await Config.findById('main');
    const serviceField = `services.${serviceType}.enabled`;
    
    const plugs = await Plug.find({ 
      isActive: true,
      [serviceField]: true
    }).sort({ isVip: -1, vipOrder: 1, createdAt: -1 });

    if (plugs.length === 0) {
      return ctx.editMessageText(
        `😅 Aucun plug trouvé pour ce service.`,
        { reply_markup: createServicesKeyboard().reply_markup }
      );
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
  } catch (error) {
    console.error('Erreur dans handleServiceFilter:', error);
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
    
    await ctx.editMessageText(
      '🌍 **Filtrer par pays**\n\nChoisissez un pays :',
      {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown'
      }
    );
    
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