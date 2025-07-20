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
  } catch (error) {
    console.error('Erreur dans handleTopPlugs:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement');
  }
};

// Afficher tous les plugs
const handleAllPlugs = async (ctx, page = 0) => {
  try {
    const config = await Config.findById('main');
    const plugs = await Plug.find({ isActive: true })
      .sort({ isVip: -1, vipOrder: 1, createdAt: -1 });

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

// Afficher un plug spécifique
const handlePlugDetails = async (ctx, plugId) => {
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

    const keyboard = createPlugKeyboard(plug);

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
  handleAllPlugs,
  handleFilterService,
  handleServiceFilter,
  handleFilterCountry,
  handleCountryFilter,
  handlePlugDetails,
  handlePlugServiceDetails
};