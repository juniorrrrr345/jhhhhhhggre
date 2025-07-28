require('dotenv').config();
const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const cors = require('cors');
const multer = require('multer');

// Import du middleware de sécurité avancé
const { 
  corsOptions, 
  limits, 
  helmetConfig, 
  sanitizeInput, 
  securityLogger, 
  antiDDoS,
  compression
} = require('./security-middleware');

// Garde l'ancien rate limiter pour compatibilité
const rateLimit = require('express-rate-limit');
const adminLimiter = limits.auth; // Utilise le rate limiter d'auth plus strict
const { connectDB } = require('./src/utils/database');

// Gestionnaires
const { handleStart, handleBackMain } = require('./src/handlers/startHandler');
const { getTranslation, createLanguageKeyboard, initializeDefaultTranslations } = require('./src/utils/translations');
const translationService = require('./src/services/translationService');

// Import de la liste des pays pour l'inscription
const { COUNTRIES } = require('./src/handlers/applicationHandler');

const { 
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
  // Services postaux supprimés
  handleAllDepartments,
  handleCountryDepartments,
  handleDepartmentsList
} = require('./src/handlers/plugsHandler');
const { handleContact, handleInfo, handleIgnoredCallback } = require('./src/handlers/menuHandler');
const { handleSocialMedia } = require('./src/handlers/socialMediaHandler');
const { 
  handleStartApplication,
  handleFormMessage,
  handleCountrySelection,
  handleServiceToggle,
  handleServicesDone,
  handlePhoto,
  handleSkipPhoto,
  handleCancelApplication,
  handleSkipStep,
  submitApplication,
  handleGoBack,
  userForms,
  askWorkingCountries,
  handleWorkingCountrySelection,
  handleConfirmWorkingCountries,
  handleNewServiceMeetup,
  handleNewServiceDelivery,
  handleNewServiceShipping,
  handleValidateMeetupPostal,
  handleValidateDeliveryPostal,
  askMeetupPostalForCountry,
  askDeliveryPostalForCountry,
  askServices,
  handleFinishServicesSelection
} = require('./src/handlers/applicationHandler');
const {
  handleCheckApplicationStatus,
  handleCancelMyApplication,
  handleConfirmCancel
} = require('./src/handlers/plugManagementHandler');
const { handleParrainageCommand } = require('./src/handlers/referralHandler');

// Modèles
const Plug = require('./src/models/Plug');
const Config = require('./src/models/Config');
const User = require('./src/models/User');

// Migration automatique
const migrateSocialMedia = require('./scripts/migrate-social-media');

// Initialisation
const app = express();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://sfeplugslink.vercel.app',
    /\.vercel\.app$/,
    /\.onrender\.com$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Appliquer le rate limiting aux routes admin pour sécurité
app.use('/api', adminLimiter);

// Middleware supplémentaire pour gérer les requêtes OPTIONS
app.options('*', (req, res) => {
  console.log(`🔧 OPTIONS request: ${req.path}`);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Middleware de logging pour toutes les requêtes
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - IP: ${req.ip} - UserAgent: ${req.get('User-Agent')}`);
  console.log(`📋 Headers:`, Object.keys(req.headers));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 Body size:`, JSON.stringify(req.body).length, 'chars');
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configuration multer pour upload
const upload = multer({ 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté'));
    }
  }
});

// ============================================
// GESTIONNAIRES DU BOT TELEGRAM
// ============================================

// Session simple pour tracking du contexte
const userSessions = new Map();

// Middleware pour gérer les sessions utilisateur
bot.use((ctx, next) => {
  const userId = ctx.from?.id;
  if (userId) {
    if (!userSessions.has(userId)) {
      userSessions.set(userId, { lastContext: 'top_plugs' });
    }
    ctx.session = userSessions.get(userId);
  }
  return next();
});

// Handler générique pour debug des callbacks
bot.on('callback_query', (ctx, next) => {
  console.log(`🔄 Callback reçu: ${ctx.callbackQuery.data}`);
  console.log(`👤 User ID: ${ctx.from.id}, Chat ID: ${ctx.chat.id}`);
  console.log(`📝 Message ID: ${ctx.callbackQuery.message?.message_id}`);
  
  // Mettre à jour le contexte selon le callback
  if (ctx.session && ctx.callbackQuery.data) {
    const data = ctx.callbackQuery.data;
    if (data.startsWith('plug_') && data.includes('_from_')) {
      const contextMatch = data.match(/_from_(.+)$/);
      if (contextMatch) {
        ctx.session.lastContext = contextMatch[1];
        console.log(`📍 Context updated to: ${ctx.session.lastContext}`);
      }
    } else if (data === 'top_plugs' || data === 'plugs_all') {
      ctx.session.lastContext = data;
      console.log(`📍 Context updated to: ${ctx.session.lastContext}`);
    }
  }
  
  // S'assurer que le callback est traité même en cas d'erreur
  ctx.answerCbQuery().catch((error) => {
    console.error('Erreur answerCbQuery:', error.message);
  });
  
  return next();
});

// Commandes
bot.command('start', handleStart);
bot.command('parrainage', handleParrainageCommand);

// Gestionnaire des messages texte (pour le formulaire)
bot.on('text', async (ctx) => {
  // Vérifier si l'utilisateur est en train de remplir un formulaire
  const userId = ctx.from.id;
  const userForm = userForms.get(userId);
  
  if (userForm) {
    await handleFormMessage(ctx);
  }
});

// Gestionnaire des photos pour le formulaire d'inscription
bot.on('photo', async (ctx) => {
  const userId = ctx.from.id;
  const userForm = userForms.get(userId);
  
  if (userForm && userForm.step === 'photo') {
    await handlePhoto(ctx);
  }
});

// Commande /admin - DÉSACTIVÉE pour sécurité
// bot.command('admin', async (ctx) => {
//   const userId = ctx.from.id;
//   const adminId = 7670522278; // Votre ID admin
//   
//   if (userId === adminId) {
//     const adminUrl = process.env.ADMIN_URL || 'https://safeplugslink.vercel.app';
//     await ctx.reply(
//       `🔑 **Accès Admin Autorisé**\n\n` +
//       `👋 Bonjour Admin !\n\n` +
//       `🌐 **Panel Admin :** [Cliquer ici](${adminUrl})\n\n` +
//       `🔒 **Mot de passe :** \`${process.env.ADMIN_PASSWORD || 'JuniorAdmon123'}\`\n\n` +
//       `💡 *Cliquez sur le lien pour accéder au panel d'administration moderne*\n\n` +
//       `✨ **Fonctionnalités :**\n` +
//       `• 📊 Dashboard avec statistiques\n` +
//       `• 🏪 Gestion des boutiques\n` +
//       `• ⚙️ Configuration du bot\n` +
//       `• 📱 Interface responsive`,
//       { 
//         parse_mode: 'Markdown',
//         disable_web_page_preview: false
//       }
//     );
//   } else {
//     await ctx.reply('❌ Accès refusé. Vous n\'êtes pas autorisé à accéder au panel admin.');
//   }
// });

// Gestionnaires des callbacks
bot.action('back_main', handleBackMain);

// Handler goto_main_menu supprimé - plus de bouton dans sélecteur langue

// === GESTION DES LANGUES ===
// Afficher le sélecteur de langue
bot.action('select_language', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const customTranslations = config?.languages?.translations;
    
    console.log(`🌍 Affichage sélecteur langue, langue actuelle: ${currentLang}`);
    
    const message = `🌍 ${getTranslation('menu_language', currentLang, customTranslations)}\n\n${getTranslation('menu_selectLanguage', currentLang, customTranslations)}`;
    const keyboard = createLanguageKeyboard(currentLang);
    
    // Vérifier que le clavier est valide avant de l'utiliser
    if (!keyboard || !keyboard.reply_markup) {
      console.error('❌ Clavier de langue invalide');
      await ctx.answerCbQuery('❌ Erreur temporaire, réessayez').catch(() => {});
      return;
    }
    
    // Essayer d'éditer le caption d'abord (pour les messages avec image)
    try {
      await ctx.editMessageCaption(message, {
        reply_markup: keyboard.reply_markup,
        parse_mode: 'Markdown'
      });
      console.log('✅ Message avec image modifié pour sélection langue');
    } catch (editError) {
      // Si ça échoue, essayer d'éditer le texte (pour les messages sans image)
      try {
        await ctx.editMessageText(message, {
          reply_markup: keyboard.reply_markup,
          parse_mode: 'Markdown'
        });
        console.log('✅ Message texte modifié pour sélection langue');
      } catch (secondError) {
        console.error('❌ Impossible d\'éditer le message de langue:', secondError);
        // Fallback : envoyer un nouveau message
        try {
          await ctx.reply(message, {
            reply_markup: keyboard.reply_markup,
            parse_mode: 'Markdown'
          });
          console.log('✅ Nouveau message envoyé pour sélection langue');
        } catch (replyError) {
          console.error('❌ Impossible d\'envoyer le message de langue:', replyError);
          await ctx.answerCbQuery('❌ Erreur lors du chargement des langues').catch(() => {});
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur sélecteur langue:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement des langues').catch(() => {});
  }
});

// Fonction pour afficher le menu principal dans la langue sélectionnée
const showMainMenuInLanguage = async (ctx, config, language) => {
  try {
    // TOUJOURS récupérer la config fraîche et actuelle (pas celle passée en paramètre)
    const freshConfig = await Config.findById('main');
    const currentLang = freshConfig?.languages?.currentLanguage || language;
    const customTranslations = freshConfig?.languages?.translations;
    
    console.log(`🌍 Affichage menu principal en langue ACTUELLE: ${currentLang}`);
    
    // Utiliser la fonction centralisée pour construire le message avec la config ACTUELLE
    const { buildWelcomeMessage } = require('./src/utils/messageBuilder');
    const welcomeMessage = await buildWelcomeMessage(freshConfig, currentLang, customTranslations, false);
    
    console.log('📝 Message d\'accueil ACTUEL construit:', welcomeMessage.substring(0, 100) + '...');
    
    // Créer le clavier principal avec la configuration ACTUELLE
    const { createMainKeyboard } = require('./src/utils/keyboards');
    const keyboard = await createMainKeyboard(freshConfig);
    
    // Modifier le message existant avec la nouvelle langue
    const { editMessageWithImage } = require('./src/utils/messageHelper');
    await editMessageWithImage(ctx, welcomeMessage, keyboard, freshConfig, { 
      parse_mode: 'Markdown' 
    });
    
    console.log('✅ Menu principal affiché dans la langue ACTUELLE avec configuration ACTUELLE');
  } catch (error) {
    console.error('❌ Erreur affichage menu principal dans langue:', error);
    // Fallback simple
    try {
      await ctx.answerCbQuery('❌ Erreur lors du changement de langue').catch(() => {});
    } catch (cbError) {
      console.error('❌ Erreur fallback showMainMenuInLanguage:', cbError);
    }
  }
};

// Changer de langue
bot.action(/^lang_(.+)$/, async (ctx) => {
  try {
    const newLanguage = ctx.match[1];
    
    if (!['fr', 'en', 'it', 'es', 'de'].includes(newLanguage)) {
      await ctx.answerCbQuery('❌ Langue non supportée');
      return;
    }
    
    console.log(`🌍 Changement de langue vers: ${newLanguage}`);
    
    // Mettre à jour la langue dans la config
    const config = await Config.findById('main');
    if (config) {
      if (!config.languages) {
        config.languages = {
          enabled: true,
          currentLanguage: newLanguage,
          availableLanguages: [],
          translations: new Map()
        };
      } else {
        config.languages.currentLanguage = newLanguage;
        config.languages.enabled = true;
      }
      
      await config.save();
      console.log(`✅ Langue sauvegardée: ${newLanguage}`);
      
      // INVALIDER TOUS LES CACHES pour mise à jour instantanée
      configCache = null;
      plugsCache = null;
      if (typeof clearAllCaches === 'function') {
        clearAllCaches();
      }
    }

    // Confirmation et aller directement au menu principal avec la nouvelle langue
    const translations = require('./src/utils/translations');
    const languageName = translations.translations.languages[newLanguage]?.name || newLanguage;
    await ctx.answerCbQuery(`✅ ${languageName} sélectionnée !`);
    
    // Aller directement au menu principal dans la nouvelle langue
    await showMainMenuInLanguage(ctx, config, newLanguage);
    
  } catch (error) {
    console.error('❌ Erreur changement langue:', error);
    await ctx.answerCbQuery('❌ Erreur lors du changement de langue').catch(() => {});
  }
});

// Gestionnaire pour le bouton "Actualiser" 
bot.action('refresh_and_main', async (ctx) => {
  try {
    await ctx.answerCbQuery('🔄 Actualisation en cours...');
    
    // Invalider les caches pour forcer le rechargement
    configCache = null;
    plugsCache = null;
    if (typeof clearAllCaches === 'function') {
      clearAllCaches();
    }
    
    console.log('🔄 Actualisation effectuée, affichage du menu principal');
    
    // TOUJOURS récupérer la config fraîche et actuelle
    const freshConfig = await Config.findById('main');
    const currentLang = freshConfig?.languages?.currentLanguage || 'fr';
    const customTranslations = freshConfig?.languages?.translations;
    
    console.log(`🌍 Affichage menu principal en langue ACTUELLE: ${currentLang}`);
    
    // Utiliser la fonction centralisée avec timestamp pour l'actualisation
    const { buildWelcomeMessage } = require('./src/utils/messageBuilder');
    const welcomeMessage = await buildWelcomeMessage(freshConfig, currentLang, customTranslations, true);
    
    console.log('📝 Message d\'accueil ACTUEL avec timestamp construit');
    
    // Créer le clavier principal avec la configuration ACTUELLE
    const { createMainKeyboard } = require('./src/utils/keyboards');
    const keyboard = await createMainKeyboard(freshConfig);
    
    // Modifier le message existant avec la configuration ACTUELLE
    const { editMessageWithImage } = require('./src/utils/messageHelper');
    await editMessageWithImage(ctx, welcomeMessage, keyboard, freshConfig, { 
      parse_mode: 'Markdown' 
    });
    
    console.log('✅ Menu principal actualisé avec configuration ACTUELLE');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'actualisation:', error);
    await ctx.answerCbQuery('❌ Erreur lors de l\'actualisation').catch(() => {});
  }
});

bot.action('top_plugs', handleTopPlugs);
bot.action('plugs_all', (ctx) => handleAllPlugs(ctx, 0));
bot.action('plugs_vip', (ctx) => handleVipPlugs(ctx, 0)); // Réactivé car encore utilisé dans le code
bot.action('filter_service', handleFilterService);
bot.action('filter_country', handleFilterCountry);
bot.action('contact', handleContact);
bot.action('info', handleInfo);
bot.action('social_media', handleSocialMedia);
bot.action('start_application', handleStartApplication);
bot.action('cancel_application', handleCancelApplication);
bot.action('services_done', handleServicesDone);
bot.action(/^country_(.+)$/, handleCountrySelection);

// === NOUVEAUX HANDLERS POUR LE NOUVEAU FLUX DE SERVICES ===
bot.action(/^working_country_(.+)$/, async (ctx) => {
  const countryCode = ctx.match[1];
  const { handleWorkingCountrySelection } = require('./src/handlers/applicationHandler');
  return await handleWorkingCountrySelection(ctx, countryCode);
});

bot.action('confirm_working_countries', async (ctx) => {
  const { handleConfirmWorkingCountries } = require('./src/handlers/applicationHandler');
  return await handleConfirmWorkingCountries(ctx);
});

bot.action('new_service_meetup', async (ctx) => {
  const { handleNewServiceMeetup } = require('./src/handlers/applicationHandler');
  return await handleNewServiceMeetup(ctx);
});

bot.action('new_service_delivery', async (ctx) => {
  const { handleNewServiceDelivery } = require('./src/handlers/applicationHandler');
  return await handleNewServiceDelivery(ctx);
});

bot.action('new_service_shipping', async (ctx) => {
  const { handleNewServiceShipping } = require('./src/handlers/applicationHandler');
  return await handleNewServiceShipping(ctx);
});

// Gestion des codes postaux pour Meet Up par pays
bot.action(/^meetup_postal_(.+)$/, async (ctx) => {
  const countryCode = ctx.match[1];
  const { handleMeetupPostalCode } = require('./src/handlers/applicationHandler');
  return await handleMeetupPostalCode(ctx, countryCode);
});

// Gestion des codes postaux pour Livraison par pays
bot.action(/^delivery_postal_(.+)$/, async (ctx) => {
  const countryCode = ctx.match[1];
  const { handleDeliveryPostalCode } = require('./src/handlers/applicationHandler');
  return await handleDeliveryPostalCode(ctx, countryCode);
});

// Boutons retour pour le nouveau flux
bot.action('go_back_working_countries', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const { askWorkingCountries } = require('./src/handlers/applicationHandler');
    const userId = ctx.from.id;
    const { userForms } = require('./src/handlers/applicationHandler');
    const userForm = userForms.get(userId);
    if (userForm) {
      userForm.step = 'working_countries';
      userForms.set(userId, userForm);
    }
    return await askWorkingCountries(ctx);
  } catch (error) {
    console.error('Erreur go_back_working_countries:', error);
    await ctx.answerCbQuery('❌ Erreur de retour').catch(() => {});
  }
});

bot.action('go_back_service_selection', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const { askServices } = require('./src/handlers/applicationHandler');
    const userId = ctx.from.id;
    const { userForms } = require('./src/handlers/applicationHandler');
    const userForm = userForms.get(userId);
    if (userForm) {
      userForm.step = 'service_selection';
      userForms.set(userId, userForm);
    }
    return await askServices(ctx);
  } catch (error) {
    console.error('Erreur go_back_service_selection:', error);
    await ctx.answerCbQuery('❌ Erreur de retour').catch(() => {});
  }
});

bot.action('submit_final_application', async (ctx) => {
  const { handleFinalSubmission } = require('./src/handlers/applicationHandler');
  return await handleFinalSubmission(ctx);
});

bot.action('finish_services_selection', async (ctx) => {
  const { handleFinishServicesSelection } = require('./src/handlers/applicationHandler');
  return await handleFinishServicesSelection(ctx);
});

// Validation des codes postaux via boutons
bot.action(/^validate_meetup_postal_(\d+)$/, async (ctx) => {
  const countryIndex = parseInt(ctx.match[1]);
  const { handleValidateMeetupPostal } = require('./src/handlers/applicationHandler');
  return await handleValidateMeetupPostal(ctx, countryIndex);
});

bot.action(/^validate_delivery_postal_(\d+)$/, async (ctx) => {
  const countryIndex = parseInt(ctx.match[1]);
  const { handleValidateDeliveryPostal } = require('./src/handlers/applicationHandler');
  return await handleValidateDeliveryPostal(ctx, countryIndex);
});

// Gestionnaires pour retour au pays précédent
bot.action(/^go_back_meetup_postal_(\d+)$/, async (ctx) => {
  const countryIndex = parseInt(ctx.match[1]);
  const { askMeetupPostalForCountry } = require('./src/handlers/applicationHandler');
  return await askMeetupPostalForCountry(ctx, countryIndex);
});

bot.action(/^go_back_delivery_postal_(\d+)$/, async (ctx) => {
  const countryIndex = parseInt(ctx.match[1]);
  const { askDeliveryPostalForCountry } = require('./src/handlers/applicationHandler');
  return await askDeliveryPostalForCountry(ctx, countryIndex);
});

// === NOUVEAUX HANDLERS TOP DES PLUGS ===
bot.action(/^top_country_(.+)$/, (ctx) => {
  const country = ctx.match[1];
  return handleTopCountryFilter(ctx, country);
});

// Services supprimés - navigation directe par pays

bot.action(/^top_dept_([^_]+)_([^_]+)(?:_(.+))?$/, (ctx) => {
  console.log(`🔥 CALLBACK COMPLET: "${ctx.match[0]}"`);
  console.log(`🔥 CALLBACK top_dept parse: match[1]="${ctx.match[1]}", match[2]="${ctx.match[2]}", match[3]="${ctx.match[3] || 'undefined'}"`);
  const serviceType = ctx.match[1]; // delivery ou meetup
  const department = ctx.match[2]; // 92, 75, etc.
  const selectedCountry = ctx.match[3] || null; // France, Belgique, etc.
  console.log(`🔥 Parameters FINAL: serviceType="${serviceType}", department="${department}", selectedCountry="${selectedCountry}"`);
  return handleSpecificDepartment(ctx, serviceType, department, selectedCountry);
});

bot.action('top_reset_filters', handleResetFilters);

// 🗺️ NOUVEAU: Actions pour les codes postaux
// ORDRE IMPORTANT: Plus spécifique en premier !
bot.action(/^postal_nav_(.+)_(\d+)$/, (ctx) => {
  const country = ctx.match[1];
  const page = parseInt(ctx.match[2]);
  return handlePostalCodeFilter(ctx, null, country, page);
});

bot.action(/^postal_country_(.+)_(.+)$/, (ctx) => {
  const serviceType = ctx.match[1];
  const country = ctx.match[2];
  return handlePostalCodeFilter(ctx, serviceType, country, 0);
});

bot.action(/^postal_(.+)_(.+)$/, (ctx) => {
  const country = ctx.match[1];
  const postalCode = ctx.match[2];
  return handleShopsByPostalCode(ctx, country, postalCode);
});

// Gestionnaire pour service_country_ (boutiques par pays pour un service) - DÉSACTIVÉ
// bot.action(/^service_country_(.+)_(.+)$/, (ctx) => {
//   const serviceType = ctx.match[1];
//   const country = ctx.match[2];
//   return handleCountryServiceShops(ctx, serviceType, country);
// });

// Handlers pour les boutons de boutiques depuis Top des Plugs
bot.action(/^plug_(.+)_from_top_plugs$/, (ctx) => {
  const plugId = ctx.match[1];
  return handlePlugDetails(ctx, plugId, 'top_plugs');
});

bot.action(/^plug_(.+)_from_top_country$/, (ctx) => {
  const plugId = ctx.match[1];
  return handlePlugDetails(ctx, plugId, 'top_plugs');
});

bot.action(/^plug_(.+)_from_top_service$/, (ctx) => {
  const plugId = ctx.match[1];
  return handlePlugDetails(ctx, plugId, 'top_plugs');
});

bot.action(/^plug_(.+)_from_top_dept$/, (ctx) => {
  const plugId = ctx.match[1];
  return handlePlugDetails(ctx, plugId, 'top_plugs');
});

bot.action(/^plug_(.+)_from_postal$/, (ctx) => {
  const plugId = ctx.match[1];
  return handlePlugDetails(ctx, plugId, 'top_plugs');
});
bot.action('skip_telegram', (ctx) => handleSkipStep(ctx, 'telegram'));
bot.action('skip_telegram_channel', (ctx) => handleSkipStep(ctx, 'telegram_channel'));
bot.action('skip_instagram', (ctx) => handleSkipStep(ctx, 'instagram'));
bot.action('skip_potato', (ctx) => handleSkipStep(ctx, 'potato'));
bot.action('skip_snapchat', (ctx) => handleSkipStep(ctx, 'snapchat'));
bot.action('skip_whatsapp', (ctx) => handleSkipStep(ctx, 'whatsapp'));
bot.action('skip_signal', (ctx) => handleSkipStep(ctx, 'signal'));
bot.action('skip_session', (ctx) => handleSkipStep(ctx, 'session'));
bot.action('skip_threema', (ctx) => handleSkipStep(ctx, 'threema'));
bot.action('skip_telegram_bot', (ctx) => handleSkipStep(ctx, 'telegram_bot'));
bot.action('skip_photo', (ctx) => handleSkipStep(ctx, 'photo'));
bot.action('skip_departments_delivery', (ctx) => handleSkipStep(ctx, 'departments_delivery'));
bot.action('skip_departments_meetup', (ctx) => handleSkipStep(ctx, 'departments_meetup'));
bot.action('skip_departments_shipping', (ctx) => handleSkipStep(ctx, 'departments_shipping'));

// Handlers pour la sélection des pays d'envoi
bot.action(/^shipping_country_(.+)$/, async (ctx) => {
  try {
    const countryCode = ctx.match[1];
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm || userForm.step !== 'departments_shipping') {
      return await ctx.answerCbQuery('❌ Session expirée');
    }

    // Trouver le pays dans la liste
    const country = COUNTRIES.find(c => c.code === countryCode);
    if (!country) {
      return await ctx.answerCbQuery('❌ Pays non trouvé');
    }

    // Initialiser la liste des pays sélectionnés si elle n'existe pas
    if (!userForm.selectedShippingCountries) {
      userForm.selectedShippingCountries = [];
    }

    // Toggle du pays (ajouter/supprimer)
    const index = userForm.selectedShippingCountries.indexOf(country.name);
    if (index > -1) {
      // Supprimer le pays
      userForm.selectedShippingCountries.splice(index, 1);
      await ctx.answerCbQuery(`❌ ${country.name} supprimé`);
    } else {
      // Ajouter le pays
      userForm.selectedShippingCountries.push(country.name);
      await ctx.answerCbQuery(`✅ ${country.name} ajouté`);
    }

    userForms.set(userId, userForm);
    
    // Mettre à jour l'affichage
    const { askDepartmentsShipping } = require('./src/handlers/applicationHandler');
    await askDepartmentsShipping(ctx);
    
  } catch (error) {
    console.error('Erreur sélection pays d\'envoi:', error);
    await ctx.answerCbQuery('❌ Erreur lors de la sélection');
  }
});

bot.action('confirm_shipping_countries', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm || userForm.step !== 'departments_shipping') {
      return await ctx.answerCbQuery('❌ Session expirée');
    }

    if (!userForm.selectedShippingCountries || userForm.selectedShippingCountries.length === 0) {
      return await ctx.answerCbQuery('❌ Veuillez sélectionner au moins un pays');
    }

    // Sauvegarder les pays sélectionnés
    userForm.data.shippingCountries = userForm.selectedShippingCountries.join(', ');
    userForm.step = 'confirmation';
    userForms.set(userId, userForm);

    await ctx.answerCbQuery('✅ Pays d\'envoi confirmés');
    
    // Passer à l'étape de confirmation
    const { askConfirmation } = require('./src/handlers/applicationHandler');
    await askConfirmation(ctx);
    
  } catch (error) {
    console.error('Erreur confirmation pays d\'envoi:', error);
    await ctx.answerCbQuery('❌ Erreur lors de la confirmation');
  }
});

// Handlers pour la sélection des pays de livraison
bot.action(/^delivery_country_(.+)$/, async (ctx) => {
  try {
    const country = ctx.match[1];
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm || userForm.step !== 'countries_delivery') {
      return await ctx.answerCbQuery('❌ Session expirée');
    }

    // Initialiser la liste des pays sélectionnés si elle n'existe pas
    if (!userForm.selectedDeliveryCountries) {
      userForm.selectedDeliveryCountries = [];
    }

    // Toggle du pays (ajouter/supprimer)
    const index = userForm.selectedDeliveryCountries.indexOf(country);
    if (index > -1) {
      // Supprimer le pays
      userForm.selectedDeliveryCountries.splice(index, 1);
      await ctx.answerCbQuery(`❌ ${country} supprimé`);
    } else {
      // Ajouter le pays
      userForm.selectedDeliveryCountries.push(country);
      await ctx.answerCbQuery(`✅ ${country} ajouté`);
    }

    userForms.set(userId, userForm);
    
    // Mettre à jour l'affichage
    const { askCountriesDelivery } = require('./src/handlers/applicationHandler');
    const departments = userForm.data.departmentsDelivery.split(', ');
    await askCountriesDelivery(ctx, departments);
    
  } catch (error) {
    console.error('Erreur sélection pays de livraison:', error);
    await ctx.answerCbQuery('❌ Erreur lors de la sélection');
  }
});

bot.action('confirm_delivery_countries', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm || userForm.step !== 'countries_delivery') {
      return await ctx.answerCbQuery('❌ Session expirée');
    }

    if (!userForm.selectedDeliveryCountries || userForm.selectedDeliveryCountries.length === 0) {
      return await ctx.answerCbQuery('❌ Veuillez sélectionner au moins un pays');
    }

    // Sauvegarder les pays sélectionnés dans countries
    userForm.data.countries = userForm.selectedDeliveryCountries;
    userForm.step = 'departments_meetup';
    userForms.set(userId, userForm);

    await ctx.answerCbQuery('✅ Pays de livraison confirmés');
    
    // Passer à l'étape meetup
    const { askDepartmentsMeetup } = require('./src/handlers/applicationHandler');
    await askDepartmentsMeetup(ctx);
    
  } catch (error) {
    console.error('Erreur confirmation pays de livraison:', error);
    await ctx.answerCbQuery('❌ Erreur lors de la confirmation');
  }
});

bot.action('retry_departments_delivery', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm) {
      return await ctx.answerCbQuery('❌ Session expirée');
    }

    // Retourner à la saisie des départements
    userForm.step = 'departments_delivery';
    userForm.selectedDeliveryCountries = [];
    userForms.set(userId, userForm);

    await ctx.answerCbQuery('🔄 Retour à la saisie');
    
    const { askDepartmentsDelivery } = require('./src/handlers/applicationHandler');
    await askDepartmentsDelivery(ctx);
    
  } catch (error) {
    console.error('Erreur retour départements livraison:', error);
    await ctx.answerCbQuery('❌ Erreur lors du retour');
  }
});

// Handlers pour la sélection des pays de meetup
bot.action(/^meetup_country_(.+)$/, async (ctx) => {
  try {
    const country = ctx.match[1];
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm || userForm.step !== 'countries_meetup') {
      return await ctx.answerCbQuery('❌ Session expirée');
    }

    // Initialiser la liste des pays sélectionnés si elle n'existe pas
    if (!userForm.selectedMeetupCountries) {
      userForm.selectedMeetupCountries = [];
    }

    // Toggle du pays (ajouter/supprimer)
    const index = userForm.selectedMeetupCountries.indexOf(country);
    if (index > -1) {
      // Supprimer le pays
      userForm.selectedMeetupCountries.splice(index, 1);
      await ctx.answerCbQuery(`❌ ${country} supprimé`);
    } else {
      // Ajouter le pays
      userForm.selectedMeetupCountries.push(country);
      await ctx.answerCbQuery(`✅ ${country} ajouté`);
    }

    userForms.set(userId, userForm);
    
    // Mettre à jour l'affichage
    const { askCountriesMeetup } = require('./src/handlers/applicationHandler');
    const departments = userForm.data.departmentsMeetup.split(', ');
    await askCountriesMeetup(ctx, departments);
    
  } catch (error) {
    console.error('Erreur sélection pays de meetup:', error);
    await ctx.answerCbQuery('❌ Erreur lors de la sélection');
  }
});

bot.action('confirm_meetup_countries', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm || userForm.step !== 'countries_meetup') {
      return await ctx.answerCbQuery('❌ Session expirée');
    }

    if (!userForm.selectedMeetupCountries || userForm.selectedMeetupCountries.length === 0) {
      return await ctx.answerCbQuery('❌ Veuillez sélectionner au moins un pays');
    }

    // Fusionner les pays de livraison et meetup
    const allCountries = [...(userForm.data.countries || []), ...userForm.selectedMeetupCountries];
    userForm.data.countries = [...new Set(allCountries)]; // Supprimer les doublons
    userForm.step = 'shipping_service';
    userForms.set(userId, userForm);

    await ctx.answerCbQuery('✅ Pays de meetup confirmés');
    
    // Passer à l'étape envoi postal
    const { askShippingService } = require('./src/handlers/applicationHandler');
    await askShippingService(ctx);
    
  } catch (error) {
    console.error('Erreur confirmation pays de meetup:', error);
    await ctx.answerCbQuery('❌ Erreur lors de la confirmation');
  }
});

bot.action('retry_departments_meetup', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm) {
      return await ctx.answerCbQuery('❌ Session expirée');
    }

    // Retourner à la saisie des départements
    userForm.step = 'departments_meetup';
    userForm.selectedMeetupCountries = [];
    userForms.set(userId, userForm);

    await ctx.answerCbQuery('🔄 Retour à la saisie');
    
    const { askDepartmentsMeetup } = require('./src/handlers/applicationHandler');
    await askDepartmentsMeetup(ctx);
    
  } catch (error) {
    console.error('Erreur retour départements meetup:', error);
    await ctx.answerCbQuery('❌ Erreur lors du retour');
  }
});

// Handlers pour l'envoi postal (Oui/Non)
bot.action('shipping_yes', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm || userForm.step !== 'shipping_service') {
      return await ctx.answerCbQuery('❌ Session expirée');
    }

    // Sauvegarder que l'utilisateur fait de l'envoi postal
    userForm.data.hasShipping = true;
    userForm.step = 'confirmation';
    userForms.set(userId, userForm);

    await ctx.answerCbQuery('✅ Envoi postal activé');
    
    // Passer à la confirmation finale
    const { askConfirmation } = require('./src/handlers/applicationHandler');
    await askConfirmation(ctx);
    
  } catch (error) {
    console.error('Erreur confirmation envoi postal oui:', error);
    await ctx.answerCbQuery('❌ Erreur lors de la confirmation');
  }
});

bot.action('shipping_no', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm || userForm.step !== 'shipping_service') {
      return await ctx.answerCbQuery('❌ Session expirée');
    }

    // Sauvegarder que l'utilisateur ne fait pas d'envoi postal
    userForm.data.hasShipping = false;
    userForm.step = 'confirmation';
    userForms.set(userId, userForm);

    await ctx.answerCbQuery('❌ Envoi postal désactivé');
    
    // Passer à la confirmation finale
    const { askConfirmation } = require('./src/handlers/applicationHandler');
    await askConfirmation(ctx);
    
  } catch (error) {
    console.error('Erreur confirmation envoi postal non:', error);
    await ctx.answerCbQuery('❌ Erreur lors de la confirmation');
  }
});

// Handlers pour les boutons "Retour"
bot.action('go_back_name', handleGoBack);
bot.action('go_back_telegram', handleGoBack);
bot.action('go_back_telegram_channel', handleGoBack);
bot.action('go_back_snapchat', handleGoBack);
bot.action('go_back_potato', handleGoBack);
bot.action('go_back_whatsapp', handleGoBack);
bot.action('go_back_signal', handleGoBack);
bot.action('go_back_threema', handleGoBack);
bot.action('go_back_session', handleGoBack);
bot.action('go_back_instagram', handleGoBack);
bot.action('go_back_telegram_bot', handleGoBack);
bot.action('go_back_services', handleGoBack);
bot.action('go_back_departments_delivery', handleGoBack);
bot.action('go_back_departments_meetup', handleGoBack);
bot.action('go_back_confirmation', handleGoBack);
bot.action('confirm_application', submitApplication);

bot.action('check_application_status', handleCheckApplicationStatus);
bot.action(/^cancel_my_application_(.+)$/, handleCancelMyApplication);
bot.action(/^confirm_cancel_(.+)$/, handleConfirmCancel);

// Handlers pour le menu départements
bot.action('all_departments', (ctx) => {
  return handleAllDepartments(ctx);
});

bot.action(/^all_dept_country_(.+)$/, (ctx) => {
  const country = ctx.match[1];
  return handleCountryDepartments(ctx, country);
});

bot.action(/^search_dept_(.+)_(.+)$/, (ctx) => {
  const department = ctx.match[1];
  const country = ctx.match[2];
  // TODO: Implémenter la recherche par département
  ctx.answerCbQuery(`Recherche dans ${department} (${country}) - À implémenter`);
});

// Gestionnaire des services (distinguer formulaire vs filtres)
bot.action(/^service_(delivery|postal|meetup|shipping)$/, async (ctx) => {
  const userId = ctx.from.id;
  const userForm = userForms.get(userId);
  
  if (userForm && userForm.step === 'services') {
    // C'est pour le formulaire d'inscription
    await handleServiceToggle(ctx);
  } else {
    // C'est pour les filtres de plugs - rediriger vers départements
    const serviceType = ctx.callbackQuery.data.replace('service_', '');
    if (serviceType === 'delivery' || serviceType === 'meetup') {
      // Rediriger vers le système de départements
      await handleDepartmentFilter(ctx, serviceType, null);
    } else {
      await handleServiceFilter(ctx, serviceType, 0);
    }
  }
});

// Pagination améliorée
bot.action(/^page_(.+)_(\d+)$/, (ctx) => {
  const context = ctx.match[1];
  const page = parseInt(ctx.match[2]);
  
  console.log(`🔄 Pagination: context=${context}, page=${page}`);
  
  if (context === 'all' || context === 'plugs_all') {
    return handleAllPlugs(ctx, page);
  } else if (context === 'vip' || context === 'plugs_vip') {
    return handleVipPlugs(ctx, page);
  } else if (context.startsWith('service_')) {
    const serviceType = context.split('_')[1];
    return handleServiceFilter(ctx, serviceType, page);
  } else if (context.startsWith('country_')) {
    const country = context.split('_')[1];
    return handleCountryFilter(ctx, country, page);
  }
});

// Filtres par pays
bot.action(/^country_(.+)$/, (ctx) => {
  const country = ctx.match[1];
  return handleCountryFilter(ctx, country, 0);
});

// Détails d'un plug avec contexte (format unifié)
bot.action(/^plug_([a-f\d]{24})_from_(.+)$/, (ctx) => {
  const plugId = ctx.match[1];
  const context = ctx.match[2];
  console.log(`🔍 Plug details callback: plugId=${plugId}, context=${context}`);
  console.log(`📱 Callback data received:`, ctx.callbackQuery.data);
  return handlePlugDetails(ctx, plugId, context);
});

// Détails d'un plug (format legacy pour compatibilité)
bot.action(/^plug_([a-f\d]{24})$/, (ctx) => {
  const plugId = ctx.match[1];
  console.log(`🔍 Plug details (legacy): plugId=${plugId}`);
  return handlePlugDetails(ctx, plugId, 'top_plugs');
});

// Détails d'un service d'un plug - SUPPRIMÉ
// Les services (postal, meetup, livraison) ont été retirés du menu


// Liker une boutique (système synchronisé temps réel)
bot.action(/^like_([a-f\d]{24})$/, async (ctx) => {
  try {
    const plugId = ctx.match[1];
    const userId = ctx.from.id;
    
    console.log(`🔍 LIKE DEBUG: User ${userId} veut liker plug ${plugId}`);
    
    // Utiliser l'API interne pour la synchronisation
    const apiUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3022}`;
    const response = await fetch(`${apiUrl}/api/likes/${plugId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        action: 'like'
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      if (response.status === 429) {
        // Cooldown actif
        return ctx.answerCbQuery(
          `⏰ Vous avez déjà liké cette boutique ! Vous pourrez liker à nouveau dans ${result.remainingTime}.`,
          { show_alert: true }
        );
      }
      return ctx.answerCbQuery('❌ Erreur lors du like');
    }
    
    console.log(`✅ LIKE réussi: ${result.plugName} - ${result.likes} likes`);
    
    // IMPORTANT: Forcer rafraîchissement cache pour synchronisation web
    try {
      await fetch(`${apiUrl}/api/cache/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('🔄 Cache rafraîchi après vote pour sync web');
    } catch (refreshError) {
      console.log('⚠️ Erreur rafraîchissement cache:', refreshError.message);
    }
    
    // Notification du vote ajouté
    await ctx.answerCbQuery(`👍 Vous avez voté pour ${result.plugName} ! (${result.likes} votes)`);
    
    // Mise à jour du bouton like en temps réel
    try {
      const currentKeyboard = ctx.callbackQuery.message.reply_markup;
      
      if (currentKeyboard && currentKeyboard.inline_keyboard) {
        const updatedKeyboard = {
          inline_keyboard: currentKeyboard.inline_keyboard.map(row => 
            row.map(button => {
              if (button.callback_data && button.callback_data.startsWith(`like_${plugId}`)) {
                return {
                  ...button,
                  text: `👍 Déjà voté - 2h restant`
                };
              }
              return button;
            })
          )
        };
        
        await ctx.editMessageReplyMarkup(updatedKeyboard);
        
        // Mise à jour du texte du message avec le nouveau nombre de likes
        const currentText = ctx.callbackQuery.message.text || ctx.callbackQuery.message.caption;
        if (currentText) {
          const voteRegex = /(👍) \d+/g;
          const newVoteText = `👍 ${result.likes}`;
          const updatedText = currentText.replace(voteRegex, newVoteText);
          
          if (updatedText !== currentText) {
            await ctx.editMessageText(updatedText, {
              reply_markup: updatedKeyboard,
              parse_mode: 'Markdown'
            });
          }
        }
      }
    } catch (updateError) {
      console.log('⚠️ Erreur mise à jour interface:', updateError.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur dans le gestionnaire de like:', error);
    await ctx.answerCbQuery('❌ Erreur lors du like').catch(() => {});
  }
});

// Callback ignoré (page actuelle)
bot.action('current_page', handleIgnoredCallback);

// Actions de parrainage
bot.action(/^refresh_referral_([a-f\d]{24})$/, async (ctx) => {
  try {
    await ctx.answerCbQuery('🔄 Actualisation...');
    // Re-exécuter la commande parrainage
    await handleParrainageCommand(ctx);
  } catch (error) {
    console.error('❌ Erreur refresh referral:', error);
    await ctx.answerCbQuery('❌ Erreur lors de l\'actualisation');
  }
});

bot.action(/^referral_stats_([a-f\d]{24})$/, async (ctx) => {
  try {
    const plugId = ctx.match[1];
    const userId = ctx.from.id;
    
    await ensureConnection();
    const userShop = await Plug.findOne({ _id: plugId, ownerId: userId });
    
    if (!userShop) {
      return ctx.answerCbQuery('❌ Boutique non trouvée');
    }
    
    const referredUsers = userShop.referredUsers || [];
    let statsMessage = `📊 **Statistiques détaillées - ${userShop.name}**\n\n`;
    
    if (referredUsers.length === 0) {
      statsMessage += '🤷‍♂️ Aucune personne invitée pour le moment.\n\n💡 Partagez votre lien de parrainage pour commencer !';
    } else {
      statsMessage += `👥 **Total: ${referredUsers.length} personne${referredUsers.length > 1 ? 's' : ''} invitée${referredUsers.length > 1 ? 's' : ''}**\n\n`;
      
      referredUsers.slice().reverse().forEach((user, index) => {
        const date = new Date(user.invitedAt).toLocaleDateString('fr-FR');
        const time = new Date(user.invitedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const username = user.username ? `@${user.username}` : `Utilisateur ${user.telegramId}`;
        statsMessage += `${index + 1}. ${username}\n   📅 ${date} à ${time}\n\n`;
      });
    }
    
    await ctx.editMessageText(statsMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{
            text: '🔙 Retour',
            callback_data: `refresh_referral_${plugId}`
          }]
        ]
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur stats referral:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement des statistiques');
  }
});

// Gestion des erreurs du bot
bot.catch(async (err, ctx) => {
  console.error('❌ Erreur bot détaillée:', {
    error: err.message,
    stack: err.stack,
    userId: ctx?.from?.id,
    chatId: ctx?.chat?.id,
    updateType: ctx?.updateType,
    data: ctx?.callbackQuery?.data || ctx?.message?.text
  });
  
  try {
    // Répondre à la callback query si c'est le cas
    if (ctx?.callbackQuery) {
      await ctx.answerCbQuery('❌ Erreur temporaire, réessayez');
    }
    
    // Envoyer un message d'erreur
    await ctx.reply('❌ Une erreur temporaire est survenue. Veuillez réessayer dans quelques instants.');
  } catch (replyError) {
    console.error('❌ Impossible de répondre à l\'erreur:', replyError.message);
  }
});

// ============================================
// NOUVEAUX HANDLERS POUR FORMULAIRE D'INSCRIPTION MULTI-ÉTAPES
// ============================================

// Handlers pour les pays de travail
bot.action(/^working_country_(.+)$/, handleWorkingCountrySelection);
bot.action('confirm_working_countries', handleConfirmWorkingCountries);
bot.action('go_back_working_countries', askWorkingCountries);

// Handlers pour les services
bot.action('new_service_meetup', handleNewServiceMeetup);
bot.action('new_service_delivery', handleNewServiceDelivery);
bot.action('new_service_shipping', handleNewServiceShipping);
bot.action('go_back_service_selection', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    if (userForm) {
      userForm.step = 'services';
      userForms.set(userId, userForm);
    }
    await askServices(ctx);
  } catch (error) {
    console.error('Erreur go_back_service_selection:', error);
    await ctx.answerCbQuery('❌ Une erreur temporaire est survenue.');
  }
});

// Handlers pour les codes postaux Meet Up
bot.action(/^validate_meetup_postal_(\d+)$/, handleValidateMeetupPostal);
bot.action(/^go_back_meetup_postal_(\d+)$/, async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const countryIndex = parseInt(ctx.match[1]);
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm) {
      return await ctx.answerCbQuery('❌ Session expirée');
    }
    
    if (countryIndex === 0) {
      // Premier pays - retour aux services ou décocher le service
      userForm.data.selectedServices = userForm.data.selectedServices.filter(s => s !== 'meetup');
      userForm.step = 'services';
      userForms.set(userId, userForm);
      await askServices(ctx);
    } else {
      // Pays suivant - retour au pays précédent
      await askMeetupPostalForCountry(ctx, countryIndex - 1);
    }
  } catch (error) {
    console.error('Erreur go_back_meetup_postal:', error);
    await ctx.answerCbQuery('❌ Une erreur temporaire est survenue.');
  }
});

// Handlers pour les codes postaux Livraison
bot.action(/^validate_delivery_postal_(\d+)$/, handleValidateDeliveryPostal);
bot.action(/^go_back_delivery_postal_(\d+)$/, async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const countryIndex = parseInt(ctx.match[1]);
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm) {
      return await ctx.answerCbQuery('❌ Session expirée');
    }
    
    if (countryIndex === 0) {
      // Premier pays - retour aux services ou décocher le service
      userForm.data.selectedServices = userForm.data.selectedServices.filter(s => s !== 'delivery');
      userForm.step = 'services';
      userForms.set(userId, userForm);
      await askServices(ctx);
    } else {
      // Pays suivant - retour au pays précédent
      await askDeliveryPostalForCountry(ctx, countryIndex - 1);
    }
  } catch (error) {
    console.error('Erreur go_back_delivery_postal:', error);
    await ctx.answerCbQuery('❌ Une erreur temporaire est survenue.');
  }
});

// Handler pour terminer la sélection des services
bot.action('finish_services_selection', handleFinishServicesSelection);

// Handler pour le début de l'application
bot.action('start_application', handleStartApplication);

// Handlers pour modifier/retirer les services
bot.action('modify_service_meetup', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm || userForm.step !== 'service_selection') {
      return await ctx.answerCbQuery('❌ Erreur de formulaire');
    }
    
    // Modifier - relancer la saisie des codes postaux
    userForm.step = 'meetup_postal_codes';
    userForm.data.meetupPostalCodes = {};
    userForm.data.currentCountryIndex = 0;
    userForm.data.currentService = 'meetup';
    userForms.set(userId, userForm);
    await ctx.answerCbQuery('🔄 Modification Meet Up');
    
    await askMeetupPostalForCountry(ctx, 0);
    
  } catch (error) {
    console.error('Erreur modify_service_meetup:', error);
    await ctx.answerCbQuery('❌ Erreur');
  }
});

bot.action('modify_service_delivery', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm || userForm.step !== 'service_selection') {
      return await ctx.answerCbQuery('❌ Erreur de formulaire');
    }
    
    // Modifier - relancer la saisie des codes postaux
    userForm.step = 'delivery_postal_codes';
    userForm.data.deliveryPostalCodes = {};
    userForm.data.currentCountryIndex = 0;
    userForm.data.currentService = 'delivery';
    userForms.set(userId, userForm);
    await ctx.answerCbQuery('🔄 Modification Livraison');
    
    await askDeliveryPostalForCountry(ctx, 0);
    
  } catch (error) {
    console.error('Erreur modify_service_delivery:', error);
    await ctx.answerCbQuery('❌ Erreur');
  }
});

bot.action('remove_service_shipping', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm || userForm.step !== 'service_selection') {
      return await ctx.answerCbQuery('❌ Erreur de formulaire');
    }
    
    // Retirer le service
    userForm.data.selectedServices = userForm.data.selectedServices.filter(s => s !== 'shipping');
    userForms.set(userId, userForm);
    await ctx.answerCbQuery('❌ Envoi postal retiré');
    
    await askServices(ctx);
    
  } catch (error) {
    console.error('Erreur remove_service_shipping:', error);
    await ctx.answerCbQuery('❌ Erreur');
  }
});

// Handlers pour toggle des services (cocher/décocher)
bot.action('toggle_service_meetup', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm || userForm.step !== 'service_selection') {
      return await ctx.answerCbQuery('❌ Erreur de formulaire');
    }
    
    if (!userForm.data.selectedServices) {
      userForm.data.selectedServices = [];
    }
    
    // Toggle du service
    const index = userForm.data.selectedServices.indexOf('meetup');
    if (index > -1) {
      // Décocher - supprimer le service et ses codes postaux
      userForm.data.selectedServices.splice(index, 1);
      delete userForm.data.meetupPostalCodes;
      userForms.set(userId, userForm);
      await ctx.answerCbQuery('❌ Meet Up désélectionné');
      await askServices(ctx);
    } else {
      // Cocher - ajouter le service et demander les codes postaux
      userForm.data.selectedServices.push('meetup');
      userForm.step = 'meetup_postal_codes';
      userForm.data.meetupPostalCodes = {};
      userForm.data.currentCountryIndex = 0;
      userForm.data.currentService = 'meetup';
      userForms.set(userId, userForm);
      await ctx.answerCbQuery('✅ Meet Up sélectionné');
      
      // Commencer directement par le premier pays
      await askMeetupPostalForCountry(ctx, 0);
    }
    
  } catch (error) {
    console.error('Erreur toggle_service_meetup:', error);
    await ctx.answerCbQuery('❌ Erreur');
  }
});

bot.action('toggle_service_delivery', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm || userForm.step !== 'service_selection') {
      return await ctx.answerCbQuery('❌ Erreur de formulaire');
    }
    
    if (!userForm.data.selectedServices) {
      userForm.data.selectedServices = [];
    }
    
    // Toggle du service
    const index = userForm.data.selectedServices.indexOf('delivery');
    if (index > -1) {
      // Décocher - supprimer le service et ses codes postaux
      userForm.data.selectedServices.splice(index, 1);
      delete userForm.data.deliveryPostalCodes;
      userForms.set(userId, userForm);
      await ctx.answerCbQuery('❌ Livraison désélectionnée');
      await askServices(ctx);
    } else {
      // Cocher - ajouter le service et demander les codes postaux
      userForm.data.selectedServices.push('delivery');
      userForm.step = 'delivery_postal_codes';
      userForm.data.deliveryPostalCodes = {};
      userForm.data.currentCountryIndex = 0;
      userForm.data.currentService = 'delivery';
      userForms.set(userId, userForm);
      await ctx.answerCbQuery('✅ Livraison sélectionnée');
      
      // Commencer directement par le premier pays
      await askDeliveryPostalForCountry(ctx, 0);
    }
    
  } catch (error) {
    console.error('Erreur toggle_service_delivery:', error);
    await ctx.answerCbQuery('❌ Erreur');
  }
});

bot.action('toggle_service_shipping', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm || userForm.step !== 'service_selection') {
      return await ctx.answerCbQuery('❌ Erreur de formulaire');
    }
    
    if (!userForm.data.selectedServices) {
      userForm.data.selectedServices = [];
    }
    
    // Toggle du service
    const index = userForm.data.selectedServices.indexOf('shipping');
    if (index > -1) {
      userForm.data.selectedServices.splice(index, 1);
      await ctx.answerCbQuery('❌ Envoi postal désélectionné');
    } else {
      userForm.data.selectedServices.push('shipping');
      await ctx.answerCbQuery('✅ Envoi postal sélectionné');
    }
    
    userForms.set(userId, userForm);
    await askServices(ctx);
    
  } catch (error) {
    console.error('Erreur toggle_service_shipping:', error);
    await ctx.answerCbQuery('❌ Erreur');
  }
});

// Handler pour revenir à l'étape telegram bot
bot.action('go_back_telegram_bot', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm) {
      return await ctx.answerCbQuery('❌ Session expirée');
    }
    
    const Config = require('./src/models/Config');
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const { getTranslation } = require('./src/utils/translations');
    const customTranslations = config?.languages?.translations;
    
    // Retourner à l'étape telegram_bot
    userForm.step = 'telegram_bot';
    userForms.set(userId, userForm);
    
    // Afficher l'étape 10 : Bot Telegram
    const telegramBotMessage = `🛠️ FORMULAIRE D'INSCRIPTION – FindYourPlug\n\n` +
      `⸻\n\n` +
      `🟦 Étape 10 : Bot Telegram\n\n` +
      `🤖 Entrez votre identifiant Bot Telegram\n\n` +
      `Exemple : @votre_bot ou https://t.me/votre_bot\n\n` +
      `⚠️ Tu peux aussi passer cette étape.`;
    
    const telegramBotKeyboard = Markup.inlineKeyboard([
      [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_telegram_bot')],
      [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_instagram')],
      [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
    ]);
    
    const { editLastFormMessage } = require('./src/handlers/applicationHandler');
    await editLastFormMessage(ctx, userId, telegramBotMessage, telegramBotKeyboard);
    
  } catch (error) {
    console.error('Erreur go_back_telegram_bot:', error);
    await ctx.answerCbQuery('❌ Une erreur temporaire est survenue.');
  }
});

// Handler pour revenir à l'étape photo (logo)
bot.action('go_back_photo', async (ctx) => {
  try {
    console.log('🔙 go_back_photo handler appelé');
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const userForm = userForms.get(userId);
    
    if (!userForm) {
      console.log('❌ Pas de userForm trouvé pour userId:', userId);
      return await ctx.answerCbQuery('❌ Session expirée');
    }
    
    console.log('📝 UserForm actuel step:', userForm.step);
    
    const Config = require('./src/models/Config');
    const config = await Config.findById('main');
    const currentLang = config?.languages?.currentLanguage || 'fr';
    const { getTranslation } = require('./src/utils/translations');
    const customTranslations = config?.languages?.translations;
    
    // Retourner à l'étape photo
    userForm.step = 'photo';
    userForms.set(userId, userForm);
    console.log('✅ Step changé vers: photo');
    
    // Utiliser les traductions pour le message
    const photoMessage = `${getTranslation('registration.title', currentLang, customTranslations)}\n\n` +
      `⸻\n\n` +
      `${getTranslation('registration.step11Photo', currentLang, customTranslations)}\n\n` +
      `${getTranslation('registration.shopPhotoQuestion', currentLang, customTranslations)}\n\n` +
      `${getTranslation('registration.shopPhotoInstruction', currentLang, customTranslations)}`;
    
    const photoKeyboard = Markup.inlineKeyboard([
      [Markup.button.callback(getTranslation('registration.skipStep', currentLang, customTranslations), 'skip_photo')],
      [Markup.button.callback(getTranslation('registration.goBack', currentLang, customTranslations), 'go_back_telegram_bot')],
      [Markup.button.callback(getTranslation('registration.cancel', currentLang, customTranslations), 'cancel_application')]
    ]);
    
    console.log('📝 Message préparé, longueur:', photoMessage.length);
    
    // Supprimer l'ancien message (sélection des pays)
    try {
      await ctx.deleteMessage();
      console.log('✅ Ancien message supprimé');
    } catch (error) {
      console.log('⚠️ Erreur suppression ancien message:', error.message);
    }
    
    // Créer le nouveau message (question photo)
    await ctx.reply(photoMessage, {
      reply_markup: photoKeyboard.reply_markup,
      parse_mode: 'Markdown'
    });
    console.log('✅ Nouveau message photo créé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur go_back_photo:', error);
    await ctx.answerCbQuery('❌ Une erreur temporaire est survenue.');
  }
});

// ============================================
// API REST POUR LE PANEL ADMIN
// ============================================

// Middleware d'authentification avec logs détaillés
const authenticateAdmin = (req, res, next) => {
  try {
    console.log(`🔐 Tentative d'authentification: ${req.method} ${req.path}`);
    console.log(`📋 Headers reçus:`, Object.keys(req.headers));
    
    // Log de l'IP pour surveillance sécuritaire
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
    console.log(`🌐 IP source:`, clientIP);
    
    const authHeader = req.headers.authorization;
    console.log(`🔑 Authorization header:`, authHeader ? `Bearer ***${authHeader.slice(-4)}` : 'Absent');
    
    const password = authHeader?.replace('Bearer ', '');
    const expectedPassword = process.env.ADMIN_PASSWORD || 'JuniorAdmon123';
    const newSecureToken = process.env.ADMIN_SECURE_TOKEN || 'ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1';
    
    // Logs sécurisés - ne jamais afficher les tokens complets
    console.log(`🔍 Token fourni:`, password ? `***${password.slice(-8)}` : 'Absent');
    console.log(`🔍 Token sécurisé configuré:`, newSecureToken ? 'Oui' : 'Non');
    
    if (!password) {
      console.log('❌ Aucun password fourni');
      return res.status(401).json({ error: 'Token d\'authentification manquant' });
    }
    
    // Accepter l'ancien ET le nouveau token pour transition douce
    if (password !== expectedPassword && password !== newSecureToken) {
      console.log('❌ Password incorrect');
      return res.status(401).json({ error: 'Token d\'authentification invalide' });
    }
    
    console.log('✅ Authentification réussie');
    next();
  } catch (error) {
    console.error('❌ Erreur dans l\'authentification:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de l\'authentification' });
  }
};

// ===== ROUTES CONFIGURATION =====

// Cache global pour les configurations
let configCache = null;
let plugsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 secondes

// Fonction pour vider tous les caches
const clearAllCaches = () => {
  configCache = null;
  plugsCache = null;
  cacheTimestamp = 0;
  console.log('🧹 Tous les caches vidés');
};

// Fonction pour obtenir la config fraîche avec gestion du cache
const getFreshConfig = async () => {
  const now = Date.now();
  
  // Si on a une config en cache et qu'elle n'est pas expirée
  if (configCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return configCache;
  }
  
  // Recharger depuis la base de données
  try {
    configCache = await Config.findById('main');
    cacheTimestamp = now;
    console.log('🔄 Config rechargée depuis la DB');
    return configCache;
  } catch (error) {
    console.error('❌ Erreur chargement config fraîche:', error);
    return configCache; // Retourner l'ancienne si erreur
  }
};

// Configuration helper centralisé initialisé automatiquement

// Endpoint PUBLIC pour la configuration de la boutique (sans auth)
app.get('/api/public/config', async (req, res) => {
  try {
    console.log('🔍 Récupération config publique pour la boutique');
    const config = await Config.findById('main');
    
    console.log('📊 Config récupérée pour boutique:', {
      boutique: config?.boutique?.name || 'Non défini',
      logo: config?.boutique?.logo ? 'Défini' : 'Non défini',
      background: config?.boutique?.backgroundImage ? 'Défini' : 'Non défini'
    });
    
    // Ne retourner que les données publiques nécessaires pour la boutique
    const publicConfig = {
      boutique: config?.boutique || {},
      interface: config?.interface || {},
      welcome: config?.welcome || {},
      socialMedia: config?.socialMedia || {},
      shopSocialMediaList: config?.shopSocialMediaList || [],
      messages: config?.messages || {},
      buttons: config?.buttons || {},
      // AJOUT : Liens Telegram pour les boutons Mini App
      telegramLinks: {
        inscriptionTelegramLink: config?.boutique?.inscriptionTelegramLink || 'https://t.me/findyourplugsav',
        servicesTelegramLink: config?.boutique?.servicesTelegramLink || 'https://t.me/findyourplugsav'
      }
    };
    
    // Headers pour CORS et cache forcé
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Last-Modified': new Date().toUTCString(),
      'ETag': `"public-config-${Date.now()}"`,
      'Access-Control-Expose-Headers': 'Last-Modified, ETag',
      'X-Public-Config-Updated': new Date().toISOString()
    });
    
    // Ajouter un timestamp pour forcer la synchronisation
    const responseData = {
      ...publicConfig,
      _syncTimestamp: Date.now(),
      _lastUpdate: new Date().toISOString()
    };
    
    res.json(responseData);
  } catch (error) {
    console.error('❌ Erreur récupération config publique:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour recharger la configuration du bot
app.post('/api/bot/reload', authenticateAdmin, async (req, res) => {
  try {
    console.log('🔄 Demande de rechargement de la configuration du bot...');
    
    // Invalider le cache principal ET configHelper
    const { invalidateConfigCache } = require('./src/utils/configHelper');
    invalidateConfigCache();
    configCache = null;
    lastConfigUpdate = 0;
    
    // Recharger la configuration
    const reloadedConfig = await Config.findById('main');
    console.log('📝 Config rechargée:', reloadedConfig ? 'OK' : 'ERREUR');
    
    console.log('✅ Configuration du bot rechargée avec succès');
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Bot-Reloaded': new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      message: 'Configuration du bot rechargée avec succès',
      timestamp: new Date().toISOString(),
      cacheCleared: true,
      configLoaded: !!configCache
    });
  } catch (error) {
    console.error('❌ Erreur reload config:', error);
    res.status(500).json({ 
      error: 'Erreur lors du rechargement de la configuration',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// NOUVEL ENDPOINT: Test de synchronisation
app.get('/api/sync/test', authenticateAdmin, async (req, res) => {
  try {
    console.log('🧪 Test de synchronisation demandé');
    
    const currentConfig = await Config.findById('main');
    const timestamp = Date.now();
    
    // Test de lecture
    const testData = {
      success: true,
      message: 'Test de synchronisation réussi',
      timestamp: new Date().toISOString(),
      config: {
        exists: !!currentConfig,
        lastUpdate: currentConfig?.updatedAt || 'Non défini',
        boutiqueName: currentConfig?.boutique?.name || 'Non configuré'
      },
      cache: {
        cached: !!configCache,
        lastCacheUpdate: lastConfigUpdate ? new Date(lastConfigUpdate).toISOString() : 'Jamais',
        cacheAge: lastConfigUpdate ? timestamp - lastConfigUpdate : 'N/A'
      }
    };
    
    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Sync-Test': timestamp.toString()
    });
    
    res.json(testData);
  } catch (error) {
    console.error('❌ Erreur test sync:', error);
    res.status(500).json({ 
      error: 'Erreur test synchronisation',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// NOUVEL ENDPOINT: Diagnostic de synchronisation
app.get('/api/diagnostic/sync', async (req, res) => {
  try {
    console.log('🔍 Diagnostic de synchronisation demandé');
    
    // Vérifier la connexion à la DB
    const dbStatus = await Plug.db.readyState;
    
    // Compter les plugs directement en DB
    const totalPlugsInDb = await Plug.countDocuments();
    const activePlugsInDb = await Plug.countDocuments({ isActive: true });
    const vipPlugsInDb = await Plug.countDocuments({ isVip: true, isActive: true });
    
    // Vérifier la config
    const configInDb = await Config.findById('main');
    
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache'
    });
    
    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus === 1 ? 'connected' : 'disconnected',
        totalPlugs: totalPlugsInDb,
        activePlugs: activePlugsInDb,
        vipPlugs: vipPlugsInDb,
        configExists: !!configInDb
      },
      cache: {
        plugsCount: cache.plugs?.length || 0,
        configExists: !!cache.config,
        lastUpdate: cache.lastUpdate,
        updateInterval: cache.updateInterval,
        isStale: cache.lastUpdate && (new Date() - cache.lastUpdate) > cache.updateInterval
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        port: PORT,
        webhookUrl: process.env.WEBHOOK_URL || process.env.RENDER_URL || 'non configuré',
        botToken: process.env.TELEGRAM_BOT_TOKEN ? 'configuré' : 'manquant'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur diagnostic synchronisation:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Erreur diagnostic synchronisation',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint pour les statistiques
app.get('/api/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalPlugs = await Plug.countDocuments();
    const activePlugs = await Plug.countDocuments({ isActive: true });
    const vipPlugs = await Plug.countDocuments({ isVip: true });
    
    // Calculer le total des likes
    const plugsWithLikes = await Plug.find({}, 'likes');
    const totalLikes = plugsWithLikes.reduce((sum, plug) => sum + (plug.likes || 0), 0);
    
    res.json({
      totalPlugs,
      activePlugs,
      vipPlugs,
      totalLikes
    });
  } catch (error) {
    console.error('Erreur lors du chargement des stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer la configuration
app.get('/api/config', authenticateAdmin, async (req, res) => {
  try {
    let config = await Config.findById('main');
    
    // Si la configuration n'existe pas, essayer de la créer
    if (!config) {
      console.log('⚠️ Configuration manquante, création automatique...');
      try {
                 config = await Config.create({
           _id: 'main',
           welcome: {
             text: '🌟 Bienvenue sur notre bot !\n\nDécouvrez nos meilleurs plugs sélectionnés avec soin.',
             image: '', // Image d'accueil pour les menus
             socialMedia: []
           },
          boutique: {
            name: '',
            logo: '',
            subtitle: '',
            backgroundImage: '',
            vipTitle: '',
            vipSubtitle: '',
            searchTitle: '',
            searchSubtitle: ''
          },
          socialMedia: {
            telegram: '',
            instagram: '',
            whatsapp: '',
            website: ''
          },
          messages: {
            welcome: '',
            noPlugsFound: 'Aucun plug trouvé pour ces critères.',
            errorOccurred: 'Une erreur est survenue, veuillez réessayer.'
          },
          buttons: {
            topPlugs: { text: 'VOTER POUR VOTRE PLUG 🗳️', enabled: true },
            contact: { text: '📞 Contact', content: 'Contactez-nous pour plus d\'informations.', enabled: true },
            info: { text: 'ℹ️ Info', content: 'Informations sur notre plateforme.', enabled: true }
          }
        });
        console.log('✅ Configuration automatiquement créée');
      } catch (createError) {
        console.error('❌ Impossible de créer la configuration:', createError);
        return res.status(500).json({ 
          error: 'Configuration manquante et impossible à créer automatiquement',
          details: createError.message
        });
      }
    }
    
    res.json(config || {});
  } catch (error) {
    console.error('Erreur récupération config:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour la configuration
app.put('/api/config', authenticateAdmin, async (req, res) => {
  try {
    console.log('🔧 Début mise à jour configuration...');
    console.log('📊 Taille des données reçues:', JSON.stringify(req.body).length, 'caractères');
    console.log('📋 Clés principales:', Object.keys(req.body));
    
    // Vérifier la connexion à la base de données
    if (!Config) {
      throw new Error('Modèle Config non disponible');
    }
    
    // Nettoyer les données avant la mise à jour
    const cleanConfigData = { ...req.body };
    
    // Retirer les champs système pour éviter les conflits
    delete cleanConfigData._id;
    delete cleanConfigData.__v;
    delete cleanConfigData.createdAt;
    
    // Nettoyer les données undefined/null de manière récursive
    const cleanRecursive = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(cleanRecursive).filter(item => item !== null && item !== undefined);
      } else if (obj !== null && typeof obj === 'object') {
        // Gérer les dates spécialement
        if (obj instanceof Date) {
          return obj;
        }
        const cleanedObj = {};
        Object.keys(obj).forEach(key => {
          const value = cleanRecursive(obj[key]);
          if (value !== undefined && value !== null) {
            cleanedObj[key] = value;
          }
        });
        return cleanedObj;
      }
      return obj;
    };
    
    const finalData = cleanRecursive(cleanConfigData);
    
    // Validation spécifique pour socialMedia - retirer les entrées vides
    if (finalData.socialMedia && Array.isArray(finalData.socialMedia)) {
      finalData.socialMedia = finalData.socialMedia.filter(social => 
        social && 
        social.url && 
        social.emoji && 
        social.name && 
        social.url.trim() !== '' && 
        social.name.trim() !== ''
      );
      console.log('✅ socialMedia filtré:', finalData.socialMedia.length, 'entrées valides');
    } else if (finalData.socialMedia && typeof finalData.socialMedia === 'object') {
      // Si socialMedia est un objet (ancien format), le convertir en array vide ou le supprimer
      console.log('🔄 socialMedia est un objet, nettoyage...');
      const cleanedSocialMedia = {};
      let hasValidEntries = false;
      
      for (const [key, value] of Object.entries(finalData.socialMedia)) {
        if (value && typeof value === 'string' && value.trim() !== '') {
          cleanedSocialMedia[key] = value.trim();
          hasValidEntries = true;
        }
      }
      
      if (hasValidEntries) {
        finalData.socialMedia = cleanedSocialMedia;
        console.log('✅ socialMedia objet nettoyé:', Object.keys(cleanedSocialMedia));
      } else {
        // Supprimer complètement socialMedia s'il n'y a pas d'entrées valides
        delete finalData.socialMedia;
        console.log('✅ socialMedia objet supprimé (aucune entrée valide)');
      }
    }
    
    // Validation spécifique pour socialMediaList - retirer les entrées vides
    if (finalData.socialMediaList && Array.isArray(finalData.socialMediaList)) {
      finalData.socialMediaList = finalData.socialMediaList.filter(social => 
        social && 
        social.url && 
        social.emoji && 
        social.name && 
        social.url.trim() !== '' && 
        social.name.trim() !== ''
      );
      console.log('✅ socialMediaList filtré:', finalData.socialMediaList.length, 'entrées valides');
    }
    
    // Forcer une nouvelle date de mise à jour APRÈS le nettoyage
    finalData.updatedAt = new Date();
    
    console.log('📝 Données après nettoyage:', Object.keys(finalData));
    
    // CORRECTION: Meilleure gestion de la création/mise à jour
    let config;
    
    try {
      // Essayer de trouver la configuration existante
      config = await Config.findById('main');
      
      if (config) {
        // Mise à jour existante avec validation
        console.log('💾 Mise à jour configuration existante...');
        
        // Fusionner les données de manière sécurisée
        const updatedData = { ...config.toObject(), ...finalData };
        delete updatedData._id; // Retirer l'_id pour éviter les conflits
        delete updatedData.__v; // Retirer la version
        
        // Utiliser findByIdAndUpdate pour une mise à jour atomique
        config = await Config.findByIdAndUpdate(
          'main', 
          updatedData, 
          { 
            new: true, 
            runValidators: true,
            upsert: false
          }
        );
        
      } else {
        // Création nouvelle avec gestion des erreurs
        console.log('💾 Création nouvelle configuration...');
        
        config = await Config.create({
          _id: 'main',
          ...finalData
        });
      }
      
      if (!config) {
        throw new Error('Échec de la sauvegarde - aucune configuration retournée');
      }
      
      // Vérification que la sauvegarde a bien eu lieu
      const verifyConfig = await Config.findById('main');
      if (!verifyConfig) {
        throw new Error('Échec de la vérification - configuration non trouvée après sauvegarde');
      }
      
    } catch (dbError) {
      console.error('❌ Erreur base de données:', dbError);
      throw new Error(`Erreur de base de données: ${dbError.message}`);
    }
    
    console.log('✅ Configuration mise à jour avec succès');
    console.log('📊 ID du document:', config._id);
    
    // Invalider le cache et forcer un rechargement
    const { invalidateConfigCache } = require('./src/utils/configHelper');
    invalidateConfigCache();
    configCache = null;
    cacheTimestamp = 0;
    lastConfigUpdate = Date.now();
    
    // CORRECTION: Forcer le rechargement de la configuration du bot
    try {
      // Invalider tous les caches
      configCache = null;
      lastConfigUpdate = Date.now();
      
      // Forcer un nouveau chargement immédiat
      const reloadedConfig = await Config.findById('main');
      console.log('✅ Configuration du bot rechargée automatiquement');
      console.log('📝 Welcome text rechargé:', reloadedConfig?.welcome?.text || 'N/A');
      console.log('📞 Contact content rechargé:', reloadedConfig?.buttons?.contact?.content || 'N/A');
      console.log('ℹ️ Info content rechargé:', reloadedConfig?.buttons?.info?.content || 'N/A');
    } catch (reloadError) {
      console.error('⚠️ Erreur rechargement automatique:', reloadError.message);
    }
    
    // Headers anti-cache pour forcer la synchronisation
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Last-Modified': new Date().toUTCString(),
      'ETag': `"config-${Date.now()}"`,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Expose-Headers': 'Last-Modified, ETag',
      'X-Config-Updated': new Date().toISOString()
    });
    
    // Ajouter un timestamp pour forcer la synchronisation
    const responseData = {
      ...config.toObject(),
      _syncTimestamp: Date.now(),
      _lastUpdate: new Date().toISOString()
    };
    
    res.json(responseData);
  } catch (error) {
    console.error('❌ Erreur détaillée mise à jour config:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Headers CORS même en cas d'erreur
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    
    res.status(500).json({ 
      error: 'Erreur serveur lors de la mise à jour', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 🔄 Endpoint pour forcer le refresh du cache boutique
app.post('/api/refresh-shop-cache', async (req, res) => {
  try {
    console.log('🔄 Demande de refresh cache boutique reçue');
    
    // Invalider tous les caches
    const { invalidateConfigCache: invalidateHelper } = require('./src/utils/configHelper');
    invalidateHelper();
    configCache = null;
    lastConfigUpdate = 0;
    
    // Forcer le rechargement de la configuration
    const reloadedConfig = await Config.findById('main');
    console.log('📝 Config refresh cache:', reloadedConfig ? 'OK' : 'ERREUR');
    
    // Répondre avec un timestamp de mise à jour
    res.json({
      success: true,
      timestamp: Date.now(),
      message: 'Cache boutique rafraîchi avec succès'
    });
    
    console.log('✅ Cache boutique rafraîchi');
  } catch (error) {
    console.error('❌ Erreur refresh cache:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🔄 Endpoint public pour vérifier la configuration avec timestamp
app.get('/api/public/config/fresh', async (req, res) => {
  try {
    // Forcer rechargement sans cache
    configCache = null;
    
    let config = await Config.findById('main');
    
    if (!config) {
      config = await Config.create({
        _id: 'main',
        boutique: { name: 'FINDYOURPLUG' },
        interface: {
          title: 'PLUGS FINDER',
          tagline1: 'JUSTE UNE',
          taglineHighlight: 'MINI-APP TELEGRAM',
          tagline2: 'CHILL',
          backgroundImage: ''
        }
      });
    } else {
      // CORRECTION AUTOMATIQUE: Forcer le nom correct et nettoyer les réseaux sociaux
      let needsUpdate = false;
      
      // 1. Initialiser boutique si nécessaire
      if (!config.boutique) {
        config.boutique = { name: 'FINDYOURPLUG' };
        needsUpdate = true;
        console.log('🔧 Boutique initialisée');
      }
      
      // 2. Nettoyer socialMedia vide
      if (config.socialMedia && Array.isArray(config.socialMedia)) {
        const validSocialMedia = config.socialMedia.filter(social => 
          social && social.url && social.name && 
          social.url.trim() !== '' && social.name.trim() !== ''
        );
        if (validSocialMedia.length !== config.socialMedia.length) {
          config.socialMedia = validSocialMedia;
          needsUpdate = true;
          console.log('🔧 socialMedia nettoyé:', validSocialMedia.length, 'entrées valides');
        }
      }
      
      // 3. Nettoyer socialMediaList vide
      if (config.socialMediaList && Array.isArray(config.socialMediaList)) {
        const validSocialMediaList = config.socialMediaList.filter(social => 
          social && social.url && social.name && 
          social.url.trim() !== '' && social.name.trim() !== ''
        );
        if (validSocialMediaList.length !== config.socialMediaList.length) {
          config.socialMediaList = validSocialMediaList;
          needsUpdate = true;
          console.log('🔧 socialMediaList nettoyé:', validSocialMediaList.length, 'entrées valides');
        }
      }
      
      // Sauvegarder si nécessaire
      if (needsUpdate) {
        config.updatedAt = new Date();
        await config.save();
        console.log('✅ Configuration automatiquement corrigée');
      }
    }

    const publicConfig = {
      boutique: config?.boutique || {},
      interface: config?.interface || {},
      welcome: config?.welcome || {},
      socialMedia: config?.socialMedia || {},
      messages: config?.messages || {},
      buttons: config?.buttons || {},
      _timestamp: Date.now(),
      _fresh: true
    };

    // Headers anti-cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Fresh-Config': 'true',
      'X-Timestamp': Date.now().toString()
    });

    res.json(publicConfig);
  } catch (error) {
    console.error('❌ Erreur config fresh:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== ROUTES RÉSEAUX SOCIAUX DU MESSAGE D'ACCUEIL =====

// Récupérer les réseaux sociaux du message d'accueil
app.get('/api/config/welcome/social-media', authenticateAdmin, async (req, res) => {
  try {
    const config = await Config.findById('main');
    const socialMedia = config?.welcome?.socialMedia || [];
    res.json(socialMedia.sort((a, b) => a.order - b.order));
  } catch (error) {
    console.error('Erreur récupération réseaux sociaux accueil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Ajouter un réseau social au message d'accueil
app.post('/api/config/welcome/social-media', authenticateAdmin, async (req, res) => {
  try {
    const { name, emoji, url, order = 0 } = req.body;
    
    // Validation
    if (!name || !emoji || !url) {
      return res.status(400).json({ error: 'Nom, emoji et URL sont requis' });
    }
    
    // Valider l'URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'URL invalide' });
    }
    
    const config = await Config.findById('main');
    if (!config) {
      return res.status(404).json({ error: 'Configuration non trouvée' });
    }
    
    // Initialiser le tableau si nécessaire
    if (!config.welcome) config.welcome = {};
    if (!config.welcome.socialMedia) config.welcome.socialMedia = [];
    
    // Créer le nouveau réseau social
    const newSocialMedia = {
      _id: new require('mongoose').Types.ObjectId(),
      name: name.trim(),
      emoji: emoji.trim(),
      url: url.trim(),
      order: parseInt(order) || 0
    };
    
    config.welcome.socialMedia.push(newSocialMedia);
    await config.save();
    
    res.status(201).json(newSocialMedia);
  } catch (error) {
    console.error('Erreur ajout réseau social accueil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Modifier un réseau social du message d'accueil
app.put('/api/config/welcome/social-media/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, emoji, url, order } = req.body;
    
    // Validation
    if (!name || !emoji || !url) {
      return res.status(400).json({ error: 'Nom, emoji et URL sont requis' });
    }
    
    // Valider l'URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'URL invalide' });
    }
    
    const config = await Config.findById('main');
    if (!config || !config.welcome?.socialMedia) {
      return res.status(404).json({ error: 'Configuration ou réseaux sociaux non trouvés' });
    }
    
    // Trouver et modifier le réseau social
    const socialMediaIndex = config.welcome.socialMedia.findIndex(sm => sm._id.toString() === id);
    if (socialMediaIndex === -1) {
      return res.status(404).json({ error: 'Réseau social non trouvé' });
    }
    
    config.welcome.socialMedia[socialMediaIndex] = {
      ...config.welcome.socialMedia[socialMediaIndex],
      name: name.trim(),
      emoji: emoji.trim(),
      url: url.trim(),
      order: parseInt(order) || 0
    };
    
    await config.save();
    
    res.json(config.welcome.socialMedia[socialMediaIndex]);
  } catch (error) {
    console.error('Erreur modification réseau social accueil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer un réseau social du message d'accueil
app.delete('/api/config/welcome/social-media/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const config = await Config.findById('main');
    if (!config || !config.welcome?.socialMedia) {
      return res.status(404).json({ error: 'Configuration ou réseaux sociaux non trouvés' });
    }
    
    // Supprimer le réseau social
    const initialLength = config.welcome.socialMedia.length;
    config.welcome.socialMedia = config.welcome.socialMedia.filter(sm => sm._id.toString() !== id);
    
    if (config.welcome.socialMedia.length === initialLength) {
      return res.status(404).json({ error: 'Réseau social non trouvé' });
    }
    
    await config.save();
    
    res.json({ message: 'Réseau social supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression réseau social accueil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== ROUTES PLUGS =====

// Récupérer un plug par ID (Admin seulement)
app.get('/api/plugs/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Recherche du plug avec ID: ${id}`);
    
    const plug = await Plug.findById(id);
    
    if (!plug) {
      console.log(`❌ Plug non trouvé: ${id}`);
      return res.status(404).json({ error: 'Plug non trouvé' });
    }
    
    console.log(`✅ Plug trouvé: ${plug.name}`);
    
    // Headers pour éviter le cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json(plug);
  } catch (error) {
    console.error('Erreur récupération plug par ID:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer un nouveau plug (Admin seulement)
app.post('/api/plugs', limits.admin, authenticateAdmin, async (req, res) => {
  try {
    console.log('🆕 Création d\'un nouveau plug');
    // Log sécurisé - masquer les données sensibles
    const safeBody = { ...req.body };
    if (safeBody.password) safeBody.password = '***MASQUÉ***';
    if (safeBody.token) safeBody.token = '***MASQUÉ***';
    console.log('📝 Données reçues (sécurisé):', safeBody);
    
    const plugData = req.body;
    
    // Validation renforcée des champs requis
    if (!plugData.name || !plugData.description) {
      return res.status(400).json({ 
        error: 'Le nom et la description sont requis' 
      });
    }

    // Validation de sécurité pour empêcher les injections
    if (typeof plugData.name !== 'string' || typeof plugData.description !== 'string') {
      return res.status(400).json({ 
        error: 'Format de données invalide' 
      });
    }

    // Validation de longueur pour éviter les abus
    if (plugData.name.length > 100 || plugData.description.length > 1000) {
      return res.status(400).json({ 
        error: 'Données trop volumineuses' 
      });
    }
    
    // Créer le nouveau plug avec logging détaillé
    console.log('🔨 Création objet Plug...');
    
    const newPlug = new Plug({
      name: plugData.name,
      description: plugData.description,
      image: plugData.image || '',
      telegramLink: plugData.telegramLink || '',
      isVip: plugData.isVip || false,
      isActive: plugData.isActive !== undefined ? plugData.isActive : true,
      countries: plugData.countries || [],
      services: {
        delivery: {
          enabled: plugData.services?.delivery?.enabled || false,
          description: plugData.services?.delivery?.description || ''
        },
        postal: {
          enabled: plugData.services?.postal?.enabled || false,
          description: plugData.services?.postal?.description || ''
        },
        meetup: {
          enabled: plugData.services?.meetup?.enabled || false,
          description: plugData.services?.meetup?.description || ''
        }
      },
      socialMedia: plugData.socialMedia || [],
      likes: 0,
      likedBy: []
    });
    
    console.log('💾 Sauvegarde en base de données...');
    const savedPlug = await newPlug.save();
    console.log('✅ Plug sauvegardé avec succès:', savedPlug._id);
    
    // TRADUCTION AUTOMATIQUE de la boutique (DÉSACTIVÉE temporairement pour debug)
    try {
      console.log('🌍 Traduction automatique temporairement désactivée pour éviter erreur 500');
      // const translatedShop = await translationService.translateShop(savedPlug.toObject());
      // savedPlug.translations = translatedShop.translations;
      // await savedPlug.save();
      console.log('⏭️ Traduction automatique skippée pour:', savedPlug.name);
    } catch (translationError) {
      console.error('⚠️ Erreur traduction automatique:', translationError);
    }
    
    // Générer automatiquement le lien de parrainage (DÉSACTIVÉ temporairement pour debug)
    try {
      console.log('🔗 Génération lien parrainage temporairement désactivée pour éviter erreur 500');
      // const botInfo = await bot.telegram.getMe();
      // savedPlug.referralCode = savedPlug.generateReferralCode();
      // savedPlug.referralLink = savedPlug.generateReferralLink(botInfo.username);
      // await savedPlug.save();
      console.log('⏭️ Lien de parrainage skippé pour:', savedPlug.name);
    } catch (linkError) {
      console.error('⚠️ Erreur génération lien de parrainage:', linkError);
    }
    
    console.log('✅ Plug créé:', savedPlug.name);
    
    // INVALIDATION CACHE AGRESSIVE pour mise à jour instantanée mini app
    invalidateCache();
    configCache = null;
    plugsCache = null;
    
    // Forcer le vidage de TOUS les caches
    if (typeof clearAllCaches === 'function') {
      clearAllCaches();
    }
    
    console.log('🔄 CACHE TOTALEMENT VIDÉ pour affichage instantané mini app');
    
    res.status(201).json(savedPlug);
  } catch (error) {
    console.error('Erreur création plug:', error);
    res.status(500).json({ error: 'Erreur lors de la création du plug' });
  }
});

// Obtenir ou générer le lien de parrainage d'une boutique
app.get('/api/plugs/:id/referral', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔗 Demande de lien de parrainage pour ID:', id);
    
    const plug = await Plug.findById(id);
    if (!plug) {
      console.log('❌ Boutique non trouvée:', id);
      return res.status(404).json({ error: 'Boutique non trouvée' });
    }

    console.log('✅ Boutique trouvée:', plug.name);
    console.log('🔍 État actuel - Code:', plug.referralCode, 'Lien:', plug.referralLink);

    // Générer le lien si pas encore fait
    if (!plug.referralCode || !plug.referralLink) {
      try {
        console.log('🔄 Génération du lien de parrainage...');
        const botInfo = await bot.telegram.getMe();
        console.log('📱 Bot info récupéré:', botInfo.username);
        
        // Générer le code manuellement si la méthode n'existe pas
        if (typeof plug.generateReferralCode === 'function') {
          plug.referralCode = plug.generateReferralCode();
        } else {
          plug.referralCode = `ref_${plug._id}_${Date.now().toString(36)}`;
          console.log('⚠️ Méthode generateReferralCode non disponible, code généré manuellement');
        }
        
        // Générer le lien manuellement si la méthode n'existe pas
        if (typeof plug.generateReferralLink === 'function') {
          plug.referralLink = plug.generateReferralLink(botInfo.username);
        } else {
          plug.referralLink = `https://t.me/${botInfo.username}?start=${plug.referralCode}`;
          console.log('⚠️ Méthode generateReferralLink non disponible, lien généré manuellement');
        }
        
        console.log('🔗 Code généré:', plug.referralCode);
        console.log('🔗 Lien généré:', plug.referralLink);
        
        await plug.save();
        console.log('✅ Lien de parrainage sauvegardé pour:', plug.name);
      } catch (linkError) {
        console.error('❌ Erreur génération lien:', linkError);
        return res.status(500).json({ 
          error: 'Erreur lors de la génération du lien',
          details: linkError.message 
        });
      }
    } else {
      console.log('✅ Lien existant trouvé pour:', plug.name);
    }

    // Générer aussi un lien direct simple (comme dans l'exemple)
    let directLink = '';
    try {
      const botInfo = await bot.telegram.getMe();
      directLink = `https://t.me/${botInfo.username}?start=plug_${plug._id}`;
    } catch (directLinkError) {
      console.warn('⚠️ Erreur génération lien direct:', directLinkError);
    }

    const response = {
      boutique: plug.name,
      referralLink: plug.referralLink,
      directLink: directLink, // Nouveau lien direct simple
      referralCode: plug.referralCode,
      totalReferred: plug.totalReferred || 0,
      referredUsers: plug.referredUsers || []
    };
    
    console.log('📤 Réponse envoyée:', response);
    res.json(response);

  } catch (error) {
    console.error('❌ Erreur récupération lien de parrainage:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message 
    });
  }
});

// Générer les liens de parrainage pour toutes les boutiques
app.post('/api/plugs/generate-all-referrals', limits.admin, authenticateAdmin, async (req, res) => {
  try {
    console.log('🔗 Génération des liens de parrainage pour toutes les boutiques...');
    
    const botInfo = await bot.telegram.getMe();
    const plugs = await Plug.find({});
    let generated = 0;
    let updated = 0;

    for (const plug of plugs) {
      if (!plug.referralCode || !plug.referralLink) {
        // Générer le code et le lien manuellement si les méthodes n'existent pas
        if (typeof plug.generateReferralCode === 'function') {
          plug.referralCode = plug.generateReferralCode();
        } else {
          plug.referralCode = `ref_${plug._id}_${Date.now().toString(36)}`;
        }
        
        if (typeof plug.generateReferralLink === 'function') {
          plug.referralLink = plug.generateReferralLink(botInfo.username);
        } else {
          plug.referralLink = `https://t.me/${botInfo.username}?start=${plug.referralCode}`;
        }
        
        await plug.save();
        generated++;
        console.log(`✅ Lien généré pour: ${plug.name}`);
      } else {
        updated++;
      }
    }

    console.log(`🎉 Génération terminée: ${generated} nouveaux, ${updated} existants`);
    
    res.json({
      success: true,
      total: plugs.length,
      generated: generated,
      existing: updated,
      botUsername: botInfo.username
    });

  } catch (error) {
    console.error('❌ Erreur génération massive:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération massive',
      details: error.message 
    });
  }
});

// Modifier un plug (Admin seulement)
app.put('/api/plugs/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log(`📝 Modification du plug ${id}`);
    console.log('📝 Données de mise à jour:', updateData);
    
    // Validation de l'ID
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: 'ID de plug invalide' });
    }
    
    // Validation des champs requis
    if (!updateData.name || !updateData.description) {
      return res.status(400).json({ 
        error: 'Le nom et la description sont requis' 
      });
    }
    
    // Chercher et mettre à jour le plug
    const plug = await Plug.findById(id);
    if (!plug) {
      console.log(`❌ Plug non trouvé: ${id}`);
      return res.status(404).json({ error: 'Plug non trouvé' });
    }
    
    // Mettre à jour les champs
    plug.name = updateData.name;
    plug.description = updateData.description;
    plug.image = updateData.image || '';
    plug.telegramLink = updateData.telegramLink || '';
    plug.isVip = updateData.isVip || false;
    plug.isActive = updateData.isActive !== undefined ? updateData.isActive : plug.isActive;
    plug.countries = updateData.countries || [];
    
    // Mettre à jour les services
    if (updateData.services) {
      plug.services = {
        delivery: {
          enabled: updateData.services.delivery?.enabled || false,
          description: updateData.services.delivery?.description || ''
        },
        postal: {
          enabled: updateData.services.postal?.enabled || false,
          description: updateData.services.postal?.description || ''
        },
        meetup: {
          enabled: updateData.services.meetup?.enabled || false,
          description: updateData.services.meetup?.description || ''
        }
      };
    }
    
    // Mettre à jour les réseaux sociaux
    if (updateData.socialMedia) {
      plug.socialMedia = updateData.socialMedia;
    }
    
    // Sauvegarder
    const updatedPlug = await plug.save();
    
    // TRADUCTION AUTOMATIQUE de la boutique mise à jour
    try {
      console.log('🌍 Démarrage re-traduction automatique...');
      const translatedShop = await translationService.translateShop(updatedPlug.toObject());
      
      // Sauvegarder les nouvelles traductions
      updatedPlug.translations = translatedShop.translations;
      await updatedPlug.save();
      
      console.log('✅ Re-traduction automatique terminée pour:', updatedPlug.name);
    } catch (translationError) {
      console.error('⚠️ Erreur re-traduction automatique:', translationError);
      // Continuer même si la traduction échoue
    }
    
    console.log('✅ Plug modifié:', updatedPlug.name);
    
    // INVALIDATION CACHE AGRESSIVE pour mise à jour instantanée mini app
    invalidateCache();
    configCache = null;
    plugsCache = null;
    
    // Forcer le vidage de TOUS les caches
    if (typeof clearAllCaches === 'function') {
      clearAllCaches();
    }
    
    console.log('🔄 CACHE TOTALEMENT VIDÉ pour mise à jour instantanée mini app');
    
    res.json(updatedPlug);
  } catch (error) {
    console.error('Erreur modification plug:', error);
    res.status(500).json({ error: 'Erreur lors de la modification du plug' });
  }
});

// Supprimer un plug (Admin seulement)
app.delete('/api/plugs/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Suppression du plug ${id}`);
    
    const plug = await Plug.findById(id);
    if (!plug) {
      return res.status(404).json({ error: 'Plug non trouvé' });
    }
    
    await Plug.findByIdAndDelete(id);
    console.log('✅ Plug supprimé:', plug.name);
    
    // INVALIDATION CACHE AGRESSIVE pour mise à jour instantanée mini app
    invalidateCache();
    configCache = null;
    plugsCache = null;
    
    // Forcer le vidage de TOUS les caches
    if (typeof clearAllCaches === 'function') {
      clearAllCaches();
    }
    
    console.log('🔄 CACHE TOTALEMENT VIDÉ pour suppression instantanée mini app');
    
    res.json({ message: 'Plug supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression plug:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du plug' });
  }
});

// Récupérer tous les plugs (Admin seulement)
app.get('/api/plugs', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', filter = 'all' } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Filtre de recherche
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtre par type
    if (filter === 'vip') {
      query.isVip = true;
    } else if (filter === 'active') {
      query.isActive = true;
    } else if (filter === 'inactive') {
      query.isActive = false;
    }
    
    const plugs = await Plug.find(query)
      .sort({ isVip: -1, vipOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Plug.countDocuments(query);
    
    // Headers pour éviter le cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({
      plugs,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erreur récupération plugs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// SYSTÈME DE CACHE ET SYNCHRONISATION
// ============================================

// Cache pour les données fréquemment utilisées
const cache = {
  plugs: null,
  config: null,
  lastUpdate: null,
  updateInterval: 30000 // 30 secondes
};

// Fonction pour rafraîchir le cache
const refreshCache = async () => {
  try {
    console.log('🔄 Rafraîchissement du cache...');
    
    // Récupérer les plugs actifs
    const plugs = await Plug.find({ isActive: true })
      .sort({ likes: -1, isVip: -1, vipOrder: 1, createdAt: -1 });
    
    // Récupérer la config
    const config = await Config.findById('main');
    
    // Mettre à jour le cache
    cache.plugs = plugs;
    cache.config = config;
    cache.lastUpdate = new Date();
    
    console.log(`✅ Cache mis à jour - ${plugs.length} plugs, config: ${config ? 'OK' : 'KO'}`);
    
    return { plugs, config };
  } catch (error) {
    console.error('❌ Erreur refresh cache:', error);
    return null;
  }
};

// Obtenir les données depuis le cache ou la DB
const getCachedData = async (forceRefresh = false) => {
  const now = new Date();
  const shouldRefresh = forceRefresh || 
    !cache.lastUpdate || 
    (now - cache.lastUpdate) > cache.updateInterval;
  
  if (shouldRefresh) {
    const data = await refreshCache();
    return data || { plugs: cache.plugs || [], config: cache.config };
  }
  
  return { plugs: cache.plugs || [], config: cache.config };
};

// Forcer le rafraîchissement du cache
const invalidateCache = () => {
  console.log('🗑️ Invalidation du cache...');
  cache.lastUpdate = null;
  cache.plugs = [];
  cache.config = null;
  console.log('✅ Cache invalidé - sera rafraîchi au prochain accès');
};

// ============================================
// ROUTES API AMÉLIORÉES AVEC CACHE
// ============================================

// Récupérer les plugs publics (pour la boutique Vercel) - VERSION OPTIMISÉE
app.get('/api/public/plugs', async (req, res) => {
  try {
    const { page = 1, limit = 100, search = '', filter = 'active' } = req.query;
    const skip = (page - 1) * limit;
    
    // Utiliser le cache pour de meilleures performances
    const { plugs: cachedPlugs } = await getCachedData();
    
    let filteredPlugs = cachedPlugs.filter(plug => plug.isActive);
    
    // Filtre de recherche
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPlugs = filteredPlugs.filter(plug => 
        plug.name.toLowerCase().includes(searchLower) ||
        plug.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtre par type
    if (filter === 'vip') {
      filteredPlugs = filteredPlugs.filter(plug => plug.isVip);
    }
    
    // Pagination
    const total = filteredPlugs.length;
    const paginatedPlugs = filteredPlugs.slice(skip, skip + parseInt(limit));
    
    // Headers pour éviter le cache et CORS + sync temps réel
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'ETag': `"${Date.now()}"`, // ETag unique pour forcer le refresh
      'Last-Modified': new Date().toUTCString(),
      'X-Cache-Updated': cache.lastUpdate?.toISOString() || 'never'
    });
    
    res.json({
      plugs: paginatedPlugs,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      },
      timestamp: new Date().toISOString(),
      cacheInfo: {
        lastUpdate: cache.lastUpdate,
        totalCached: cachedPlugs.length
      }
    });
  } catch (error) {
    console.error('Erreur récupération plugs publics:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour forcer le rafraîchissement du cache
app.post('/api/cache/refresh', async (req, res) => {
  try {
    console.log('🔄 Demande de rafraîchissement manuel du cache');
    const data = await refreshCache();
    
    if (data) {
      res.json({
        success: true,
        message: 'Cache rafraîchi avec succès',
        data: {
          plugsCount: data.plugs.length,
          configAvailable: !!data.config,
          lastUpdate: cache.lastUpdate
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erreur lors du rafraîchissement du cache'
      });
    }
  } catch (error) {
    console.error('❌ Erreur refresh manuel:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route pour obtenir les statistiques du cache
app.get('/api/cache/stats', (req, res) => {
  res.json({
    cache: {
      plugsCount: cache.plugs?.length || 0,
      configAvailable: !!cache.config,
      lastUpdate: cache.lastUpdate,
      updateInterval: cache.updateInterval,
      nextUpdate: cache.lastUpdate ? 
        new Date(cache.lastUpdate.getTime() + cache.updateInterval) : null
    },
    timestamp: new Date().toISOString()
  });
});

// Liker un plug (endpoint public - likes permanents)
app.post('/api/public/plugs/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, action } = req.body; // action: 'like' seulement
    
    console.log(`${action} plug ${id} by user ${userId}`);
    
    const plug = await Plug.findById(id);
    if (!plug) {
      return res.status(404).json({ error: 'Plug non trouvé' });
    }
    
    const hasLiked = plug.likedBy.includes(userId);
    
    if (action === 'like' && !hasLiked) {
      // Ajouter le like
      plug.likedBy.push(userId);
      plug.likes += 1;
      
      // Ajouter à l'historique
      if (!plug.likeHistory) {
        plug.likeHistory = [];
      }
      plug.likeHistory.push({
        userId: userId,
        timestamp: Date.now(),
        action: 'like'
      });
      
      await plug.save();
      await refreshCache();
      
      res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache'
      });
      
      res.json({ 
        likes: plug.likes,
        liked: true,
        message: 'Like ajouté'
      });
      
    } else if (action === 'unlike') {
      // Unlike non autorisé
      return res.status(400).json({ 
        error: 'Impossible de retirer un like',
        message: 'Les likes sont permanents'
      });
      
    } else {
      // Déjà liké ou aucune action
      res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache'
      });
      
      res.json({ 
        likes: plug.likes,
        liked: hasLiked,
        message: hasLiked ? 'Déjà liké' : 'Pas encore liké'
      });
    }
    
  } catch (error) {
    console.error('Erreur like:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// ROUTES POUR LA DIFFUSION ET STATISTIQUES
// ============================================

// Modèle simple pour stocker les utilisateurs avec persistance améliorée
const userStorage = new Set();

// Charger les utilisateurs existants depuis la base (modèle User + applications)
const loadExistingUsers = async () => {
  try {
    console.log('📊 Chargement des utilisateurs existants...');
    
    // Charger depuis le modèle User (tous les utilisateurs qui ont démarré le bot)
    const users = await User.find({ isActive: true }, 'telegramId').lean();
    console.log(`👥 Trouvé ${users.length} utilisateurs actifs dans User`);
    
    users.forEach(user => {
      if (user.telegramId) {
        userStorage.add(user.telegramId);
      }
    });
    
    // Charger aussi depuis PlugApplication pour compatibilité
    const PlugApplication = require('./src/models/PlugApplication');
    const applications = await PlugApplication.find({}, 'userId').lean();
    console.log(`📝 Trouvé ${applications.length} demandes dans PlugApplication`);
    
    applications.forEach(app => {
      if (app.userId) {
        userStorage.add(app.userId);
      }
    });
    
    console.log(`✅ Chargé ${userStorage.size} utilisateurs uniques pour broadcast`);
    console.log(`📋 Premiers utilisateurs:`, Array.from(userStorage).slice(0, 5));
  } catch (error) {
    console.error('❌ Erreur chargement utilisateurs:', error.message);
  }
};

// Charger les utilisateurs au démarrage
loadExistingUsers();

// Middleware pour enregistrer les utilisateurs
bot.use((ctx, next) => {
  const userId = ctx.from?.id;
  if (userId) {
    const wasNew = !userStorage.has(userId);
    userStorage.add(userId);
    if (wasNew) {
      console.log(`👤 New user registered: ${userId}`);
    }
  }
  return next();
});

// Route pour les statistiques utilisateurs
app.get('/api/users/stats', authenticateAdmin, async (req, res) => {
  try {
    res.json({
      totalUsers: userStorage.size,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erreur stats utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour la diffusion de messages
app.post('/api/broadcast', limits.admin, authenticateAdmin, async (req, res) => {
  try {
    const { message, image } = req.body.data || req.body;
    
    console.log('📢 BROADCAST DEBUG: Received data:', req.body);
    console.log('📢 BROADCAST DEBUG: Message:', message);
    console.log('📢 BROADCAST DEBUG: Image:', image ? 'Present' : 'None');
    console.log('📢 BROADCAST DEBUG: userStorage size:', userStorage.size);
    
    if (!message || !message.trim()) {
      return res.status(400).json({ 
        success: false,
        error: 'Message requis' 
      });
    }

    if (userStorage.size === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Aucun utilisateur enregistré pour recevoir les messages' 
      });
    }

    let sent = 0;
    let failed = 0;
    
    console.log(`📢 Début diffusion à ${userStorage.size} utilisateur(s)`);
    console.log(`📢 Liste utilisateurs:`, Array.from(userStorage));
    
    // Parcourir tous les utilisateurs enregistrés
    for (const userId of userStorage) {
      try {
        if (image) {
          // Envoyer avec image
          let imageSource = image;
          
          // Si c'est une URL d'image (Imgur, etc.), l'utiliser directement
          if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
            imageSource = image;
            console.log(`📸 Image URL utilisée: ${image}`);
          }
          // Si c'est une image base64, la convertir en Buffer avec validation
          else if (typeof image === 'string' && image.startsWith('data:')) {
            try {
              // Extraire le type MIME et les données base64
              const [header, base64Data] = image.split(',');
              const mimeType = header.match(/data:([^;]+)/)?.[1];
              
              // Vérifier que c'est un type d'image supporté
              if (!mimeType || !mimeType.startsWith('image/')) {
                throw new Error(`Type MIME non supporté: ${mimeType}`);
              }
              
              // Valider le base64
              if (!base64Data || base64Data.length === 0) {
                throw new Error('Données base64 vides');
              }
              
              // Convertir en buffer avec validation
              const buffer = Buffer.from(base64Data, 'base64');
              if (buffer.length === 0) {
                throw new Error('Buffer vide après conversion base64');
              }
              
              // Vérifier la taille (max 10MB pour Telegram)
              if (buffer.length > 10 * 1024 * 1024) {
                throw new Error('Image trop volumineuse (>10MB)');
              }
              
              imageSource = { source: buffer };
              console.log(`📸 Image convertie: ${mimeType}, ${buffer.length} bytes`);
            } catch (imageError) {
              console.error(`❌ Erreur conversion image pour user ${userId}:`, imageError.message);
              // Envoyer le message sans image si la conversion échoue
              await bot.telegram.sendMessage(userId, `${message.trim()}\n\n⚠️ Image non disponible`, {
                parse_mode: 'HTML'
              });
              sent++;
              continue;
            }
          }
          
          try {
            await bot.telegram.sendPhoto(userId, imageSource, {
              caption: message.trim(),
              parse_mode: 'HTML'
            });
          } catch (photoError) {
            console.error(`❌ Erreur sendPhoto pour user ${userId}:`, photoError.message);
            // Fallback: envoyer le message sans image
            await bot.telegram.sendMessage(userId, `${message.trim()}\n\n⚠️ Image non disponible`, {
              parse_mode: 'HTML'
            });
          }
        } else {
          // Envoyer message simple
          await bot.telegram.sendMessage(userId, message.trim(), {
            parse_mode: 'HTML'
          });
        }
        sent++;
        
        // Petite pause pour éviter de surcharger l'API Telegram
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Erreur envoi à ${userId}:`, error.message);
        failed++;
        
        // Supprimer l'utilisateur s'il a bloqué le bot
        if (error.code === 403) {
          userStorage.delete(userId);
        }
      }
    }
    
    console.log(`✅ Diffusion terminée: ${sent} envoyés, ${failed} échecs`);
    
    res.json({
      success: true,
      sentCount: sent,
      sent,
      failed,
      totalUsers: userStorage.size,
      message: `Message diffusé à ${sent} utilisateur(s)`
    });
    
  } catch (error) {
    console.error('❌ Erreur diffusion:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la diffusion: ' + error.message 
    });
  }
});

// Route pour l'upload d'images (pour la diffusion)
app.post('/api/upload-image', authenticateAdmin, async (req, res) => {
  try {
    // Support des deux méthodes : upload direct ou base64 via proxy
    let imageBase64;
    
    if (req.file) {
      // Upload direct avec multer
      imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else if (req.body.data?.imageBase64) {
      // Via CORS proxy avec base64 (format: data.imageBase64)
      imageBase64 = req.body.data.imageBase64;
      console.log('📤 Image reçue via proxy (data):', req.body.data.filename);
    } else if (req.body.imageBase64) {
      // Direct dans body (format: imageBase64)
      imageBase64 = req.body.imageBase64;
      console.log('📤 Image reçue directement:', req.body.filename);
    } else {
      console.log('❌ Aucune image trouvée dans:', {
        hasFile: !!req.file,
        hasDataImageBase64: !!req.body.data?.imageBase64,
        hasBodyImageBase64: !!req.body.imageBase64,
        bodyKeys: Object.keys(req.body || {}),
        dataKeys: Object.keys(req.body?.data || {})
      });
      return res.status(400).json({ 
        success: false,
        error: 'Aucune image fournie' 
      });
    }
    
    // Validation de l'image base64
    try {
      if (!imageBase64 || !imageBase64.startsWith('data:')) {
        throw new Error('Format base64 invalide');
      }
      
      const [header, base64Data] = imageBase64.split(',');
      const mimeType = header.match(/data:([^;]+)/)?.[1];
      
      if (!mimeType || !mimeType.startsWith('image/')) {
        throw new Error(`Type MIME non supporté: ${mimeType}`);
      }
      
      if (!base64Data || base64Data.length === 0) {
        throw new Error('Données base64 vides');
      }
      
      // Test de conversion pour vérifier la validité
      const buffer = Buffer.from(base64Data, 'base64');
      if (buffer.length === 0) {
        throw new Error('Buffer vide après conversion');
      }
      
      console.log(`✅ Image validée: ${mimeType}, ${buffer.length} bytes`);
      
    } catch (validationError) {
      console.error('❌ Validation image échouée:', validationError.message);
      return res.status(400).json({ 
        success: false,
        error: 'Image invalide: ' + validationError.message 
      });
    }
    
    res.json({
      success: true,
      imageUrl: imageBase64,
      message: 'Image uploadée avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur upload image:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de l\'upload: ' + error.message 
    });
  }
});

// Route pour servir les photos des applications (URL persistante)
app.get('/api/photo/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Vérifier si le fileId est valide
    if (!fileId || fileId.length < 10) {
      return res.status(400).json({ error: 'ID de fichier invalide' });
    }
    
    console.log(`📸 Demande photo pour fileId: ${fileId}`);
    
    // Obtenir l'URL de la photo depuis Telegram
    const fileLink = await bot.telegram.getFileLink(fileId);
    
    // Rediriger vers l'URL Telegram
    console.log(`📸 Redirection vers: ${fileLink.href}`);
    res.redirect(fileLink.href);
    
  } catch (error) {
    console.error('❌ Erreur récupération photo:', error);
    
    // Retourner une image par défaut ou une erreur 404
    res.status(404).json({ 
      error: 'Photo non trouvée',
      details: error.message
    });
  }
});

// ============================================
// ROUTES DE SANTÉ ET INFORMATIONS
// ============================================

app.get('/health', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache'
  });
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    cache: {
      plugsCount: cache.plugs?.length || 0,
      lastUpdate: cache.lastUpdate
    }
  });
});

// Route par défaut avec informations sur le cache
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bot Telegram VIP System API - Version Optimisée',
    version: '2.0.0',
    cache: {
      enabled: true,
      plugsCount: cache.plugs?.length || 0,
      lastUpdate: cache.lastUpdate,
      updateInterval: `${cache.updateInterval/1000}s`
    },
    endpoints: [
      'GET /health (santé API)',
      'GET /api/cache/stats (statistiques cache)',
      'POST /api/cache/refresh (forcer rafraîchissement)',
      'GET /api/public/config (config publique)',
      'GET /api/public/plugs (plugs publics)',
      'POST /api/public/plugs/:id/like (liker un plug)',
      'GET /api/config (admin)',
      'PUT /api/config (admin)',
      'GET /api/plugs (admin)',
      'GET /api/plugs/:id (admin)',
      'POST /api/plugs (admin)',
      'PUT /api/plugs/:id (admin)',
      'DELETE /api/plugs/:id (admin)',
      'GET /api/applications (admin)',
      'PATCH /api/applications/:id (admin)'
    ]
  });
});

// ============================================
// ROUTES APPLICATIONS
// ============================================

// Route pour récupérer toutes les demandes d'inscription
app.get('/api/applications', authenticateAdmin, async (req, res) => {
  try {
    const PlugApplication = require('./src/models/PlugApplication');
    
    const applications = await PlugApplication.find()
      .sort({ createdAt: -1 })
      .lean();

    // Mapper les champs pour l'admin panel
    const mappedApplications = applications.map(app => ({
      ...app,
      // Mappage pour compatibilité admin panel
      telegramContact: app.contact?.telegram || app.telegramContact,
      userFirstName: app.firstName,
      userLastName: app.lastName,
      userUsername: app.username,
      plugName: app.name
    }));

    res.json({
      success: true,
      applications: mappedApplications
    });
  } catch (error) {
    console.error('Erreur récupération applications:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des demandes'
    });
  }
});

// Route pour mettre à jour le statut d'une demande
app.patch('/api/applications/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    
    const PlugApplication = require('./src/models/PlugApplication');
    const { sendApprovalNotification, sendRejectionNotification } = require('./src/handlers/notificationHandler');
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Statut invalide'
      });
    }

    // Récupérer l'application avant mise à jour pour comparer les statuts
    const oldApplication = await PlugApplication.findById(id);
    if (!oldApplication) {
      return res.status(404).json({
        success: false,
        error: 'Demande non trouvée'
      });
    }

    const application = await PlugApplication.findByIdAndUpdate(
      id,
      { 
        status,
        adminNotes: adminNotes || '',
        updatedAt: new Date()
      },
      { new: true }
    );

    // Actions spéciales lors du changement de statut
    if (oldApplication.status !== status) {
      try {
        if (status === 'approved') {
          // 1. Envoyer notification d'approbation
          await sendApprovalNotification(bot, application);
          console.log(`✅ Notification d'approbation envoyée pour ${application.name}`);
          
          // 2. Créer automatiquement l'association parrainage
          try {
            const Plug = require('./src/models/Plug');
            
            // Chercher une boutique avec le même nom que l'application
            const matchingShop = await Plug.findOne({ 
              name: { $regex: new RegExp(`^${application.name}$`, 'i') } // Recherche insensible à la casse
            });
            
            if (matchingShop && !matchingShop.ownerId) {
              // Associer la boutique à l'utilisateur approuvé
              matchingShop.ownerId = application.userId;
              
              // Générer le code et lien de parrainage si pas déjà fait
              if (!matchingShop.referralCode) {
                matchingShop.referralCode = matchingShop.generateReferralCode();
              }
              if (!matchingShop.referralLink) {
                const botInfo = await bot.telegram.getMe();
                matchingShop.referralLink = matchingShop.generateReferralLink(botInfo.username);
              }
              
              await matchingShop.save();
              console.log(`🔗 Association parrainage créée automatiquement: ${application.name} → User ${application.userId}`);
              console.log(`📎 Lien de parrainage: ${matchingShop.referralLink}`);
            } else if (matchingShop && matchingShop.ownerId) {
              console.log(`⚠️ Boutique ${application.name} déjà associée à un autre utilisateur (${matchingShop.ownerId})`);
            } else {
              console.log(`ℹ️ Aucune boutique trouvée pour ${application.name} - créez-la manuellement puis elle sera automatiquement associée`);
            }
          } catch (referralError) {
            console.error('⚠️ Erreur création association parrainage:', referralError.message);
            // Ne pas faire échouer l'approbation pour une erreur de parrainage
          }
        } else if (status === 'rejected') {
          await sendRejectionNotification(bot, application, adminNotes);
          console.log(`✅ Notification de rejet envoyée pour ${application.name}`);
        }
      } catch (notificationError) {
        console.error('⚠️ Erreur notification utilisateur:', notificationError.message);
        // Ne pas faire échouer la mise à jour pour une erreur de notification
      }
    }

    res.json({
      success: true,
      application: application
    });
  } catch (error) {
    console.error('Erreur mise à jour application:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour'
    });
  }
});

// ============================================
// ENDPOINTS DE SANTÉ POUR KEEP-ALIVE
// ============================================

// Endpoint de santé pour keep-alive
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    botConnected: bot ? true : false,
    message: 'Bot Telegram actif'
  });
});

// Endpoint de ping simple
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const start = async () => {
  try {
    // Connexion à la base de données
    await connectDB();
    
    // Initialiser les traductions
    console.log('🌍 Initialisation des traductions...');
    try {
      await initializeDefaultTranslations(Config);
      console.log('✅ Traductions initialisées');
    } catch (translationError) {
      console.error('⚠️ Erreur initialisation traductions:', translationError.message);
    }
    
    // Migration automatique des réseaux sociaux
    console.log('🔄 Migration automatique des réseaux sociaux...');
    try {
      await migrateSocialMedia();
      console.log('✅ Migration terminée avec succès');
    } catch (migrationError) {
      console.error('⚠️ Erreur migration (continuons quand même):', migrationError.message);
    }
    
    // Initialiser le cache au démarrage
    console.log('🔄 Initialisation du cache...');
    await refreshCache();
    
    // Programmer le rafraîchissement automatique du cache
    setInterval(async () => {
      try {
        await refreshCache();
      } catch (error) {
        console.error('❌ Erreur rafraîchissement automatique cache:', error);
      }
    }, cache.updateInterval);
    
    console.log(`✅ Cache initialisé et programmé pour se rafraîchir toutes les ${cache.updateInterval/1000}s`);
    
    // Configuration du webhook pour la production
    if (process.env.NODE_ENV === 'production') {
      // Keep-alive pour éviter que Render s'endorme
      require('./keep-alive');
      
      // Construire l'URL de webhook avec fallback
      const baseUrl = process.env.WEBHOOK_URL || process.env.RENDER_URL || 'https://jhhhhhhggre.onrender.com';
      const webhookUrl = `${baseUrl}/webhook/${process.env.TELEGRAM_BOT_TOKEN}`;
      
      // Route pour le webhook
      app.use(bot.webhookCallback(`/webhook/${process.env.TELEGRAM_BOT_TOKEN}`));
      
      // Définir le webhook avec retry et gestion d'erreur
      try {
        await bot.telegram.setWebhook(webhookUrl, {
          allowed_updates: ['message', 'callback_query']
        });
        console.log(`✅ Webhook configuré: ${webhookUrl}`);
      } catch (webhookError) {
        console.error('❌ Erreur configuration webhook:', webhookError.message);
        console.log('🔄 Tentative de fallback en mode polling...');
        
        // Fallback en mode polling si le webhook échoue
        try {
          await bot.telegram.deleteWebhook();
          bot.launch();
          console.log('✅ Bot basculé en mode polling (fallback)');
        } catch (pollingError) {
          console.error('❌ Erreur fallback polling:', pollingError.message);
          throw new Error('Impossible de démarrer le bot (webhook et polling échoués)');
        }
      }
    } else {
      // Mode polling pour le développement
      bot.launch();
      console.log('✅ Bot en mode polling (développement)');
    }
    
    // Démarrer le serveur Express
    app.listen(PORT, () => {
      console.log(`✅ Serveur démarré sur le port ${PORT}`);
      console.log(`📱 Bot Telegram connecté`);
      console.log(`🌐 API disponible sur http://localhost:${PORT}`);
      console.log(`📊 Cache: ${cache.plugs?.length || 0} plugs, config: ${cache.config ? 'OK' : 'KO'}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
    process.exit(1);
  }
};

// Gestion des signaux d'arrêt
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Démarrage
start();

// Route pour forcer le rechargement des utilisateurs
app.post('/api/reload-users', authenticateAdmin, async (req, res) => {
  try {
    console.log('🔄 Force reload users requested');
    
    // Vider le storage actuel
    userStorage.clear();
    
    // Recharger depuis la base
    await loadExistingUsers();
    
    // Ajouter quelques utilisateurs connus si vide
    if (userStorage.size === 0) {
      const knownUsers = [7670522278, 7548021607, 111222333, 987654321, 123456789];
      knownUsers.forEach(userId => userStorage.add(userId));
      console.log(`📊 Added ${knownUsers.length} known users to storage`);
    }
    
    res.json({
      success: true,
      totalUsers: userStorage.size,
      users: Array.from(userStorage),
      message: `${userStorage.size} utilisateurs chargés`
    });
  } catch (error) {
    console.error('❌ Error reloading users:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors du rechargement: ' + error.message 
    });
  }
});

// ENDPOINT DEBUG: Force reload config et réseaux sociaux
app.get('/api/debug/config', async (req, res) => {
  try {
    console.log('🔧 DEBUG: Force reload configuration...');
    
    // Invalider tous les caches
    configCache = null;
    plugsCache = null;
    lastConfigUpdate = 0;
    lastPlugsUpdate = 0;
    
    // Recharger la configuration
    const config = await Config.findById('main');
    
    if (!config) {
      return res.json({
        error: 'Aucune configuration trouvée',
        mongodb_connected: mongoose.connection.readyState === 1,
        cache_invalidated: true
      });
    }
    
    // Test création clavier avec debug
    const { createMainKeyboard } = require('./src/utils/keyboards');
    process.env.DEBUG_SOCIAL_MEDIA = 'true'; // Activer debug temporaire
    const keyboard = createMainKeyboard(config);
    process.env.DEBUG_SOCIAL_MEDIA = 'false'; // Désactiver
    
    const urlButtons = keyboard?.reply_markup?.inline_keyboard?.flat()?.filter(btn => btn.url) || [];
    
    res.json({
      success: true,
      config: {
        boutique: config.boutique?.name,
        socialMedia: config.socialMedia?.length || 0,
        socialMediaList: config.socialMediaList?.length || 0
      },
      cache_invalidated: true,
      mongodb_connected: mongoose.connection.readyState === 1,
      social_buttons_created: urlButtons.length,
      social_buttons: urlButtons.map(btn => ({
        text: btn.text,
        url: btn.url
      })),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erreur debug config:', error);
    res.status(500).json({
      error: error.message,
      mongodb_connected: mongoose.connection.readyState === 1
    });
  }
});

// API pour les likes - synchronisation temps réel
app.post('/api/likes/:plugId', async (req, res) => {
  try {
    const { plugId } = req.params;
    const { userId, action } = req.body; // action: 'like' ou 'unlike'
    
    console.log(`🔄 API LIKE: ${action} pour plug ${plugId} par user ${userId}`);
    
    if (!plugId || !userId || !action) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }
    
    const plug = await Plug.findById(plugId);
    if (!plug) {
      return res.status(404).json({ error: 'Plug non trouvé' });
    }
    
    // Vérification robuste qui gère les types number et string
    const hasLiked = plug.likedBy.some(id => 
      id == userId || id === userId || String(id) === String(userId)
    );
    
    if (action === 'like') {
      if (hasLiked) {
        // Vérifier le cooldown
        const userLikeHistory = plug.likeHistory?.find(h => 
          h.userId == userId || h.userId === userId || String(h.userId) === String(userId)
        );
        
        if (userLikeHistory) {
          const lastLikeTime = new Date(userLikeHistory.timestamp);
          const now = new Date();
          const timeDiff = now - lastLikeTime;
          const cooldownTime = 2 * 60 * 60 * 1000; // 2 heures
          
          if (timeDiff < cooldownTime) {
            const remainingTime = cooldownTime - timeDiff;
            const hours = Math.floor(remainingTime / (60 * 60 * 1000));
            const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
            
            return res.status(429).json({ 
              error: 'Cooldown actif',
              remainingTime: `${hours}h ${minutes}m`
            });
          }
        }
      }
      
      // Ajouter le like
      if (!hasLiked) {
        plug.likedBy.push(userId);
        plug.likes += 1;
      }
      
      // Mettre à jour l'historique
      if (!plug.likeHistory) plug.likeHistory = [];
      plug.likeHistory.push({
        userId: userId,
        timestamp: Date.now(),
        action: 'like'
      });
      
    } else if (action === 'unlike') {
      if (hasLiked) {
        // Retirer le like
        plug.likedBy = plug.likedBy.filter(id => 
          id != userId && id !== userId && String(id) !== String(userId)
        );
        plug.likes = Math.max(0, plug.likes - 1);
        
        // Retirer de l'historique
        plug.likeHistory = plug.likeHistory?.filter(h => 
          h.userId != userId && h.userId !== userId && String(h.userId) !== String(userId)
        ) || [];
      }
    }
    
    await plug.save();
    
    // Mettre à jour le cache
    await refreshCache();
    
    console.log(`✅ API LIKE: ${action} réussi pour ${plug.name}. Nouveaux likes: ${plug.likes}`);
    
    res.json({
      success: true,
      likes: plug.likes,
      hasLiked: action === 'like' ? true : false,
      plugName: plug.name
    });
    
  } catch (error) {
    console.error('❌ Erreur API LIKE:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API pour récupérer l'état des likes d'un plug
app.get('/api/likes/:plugId/:userId', async (req, res) => {
  try {
    const { plugId, userId } = req.params;
    
    const plug = await Plug.findById(plugId);
    if (!plug) {
      return res.status(404).json({ error: 'Plug non trouvé' });
    }
    
    // Vérifier si l'utilisateur a liké
    const hasLiked = plug.likedBy.some(id => 
      id == userId || id === userId || String(id) === String(userId)
    );
    
    // Calculer le temps restant si liké
    let remainingTime = null;
    if (hasLiked) {
      const userLikeHistory = plug.likeHistory?.find(h => 
        h.userId == userId || h.userId === userId || String(h.userId) === String(userId)
      );
      
      if (userLikeHistory) {
        const lastLikeTime = new Date(userLikeHistory.timestamp);
        const now = new Date();
        const timeDiff = now - lastLikeTime;
        const cooldownTime = 2 * 60 * 60 * 1000; // 2 heures
        
        if (timeDiff < cooldownTime) {
          const remaining = cooldownTime - timeDiff;
          const hours = Math.floor(remaining / (60 * 60 * 1000));
          const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
          remainingTime = `${hours}h ${minutes}m`;
        }
      }
    }
    
    res.json({
      likes: plug.likes,
      hasLiked,
      remainingTime,
      plugName: plug.name
    });
    
  } catch (error) {
    console.error('❌ Erreur API GET LIKES:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API pour forcer la géolocalisation de tous les utilisateurs
app.post('/api/force-geolocate-all', async (req, res) => {
  try {
    console.log('🌍 Force géolocalisation de tous les utilisateurs...');
    
    const users = await User.find({});
    console.log(`👥 ${users.length} utilisateurs trouvés`);
    
    const locationService = require('./src/services/locationService');
    let geolocatedCount = 0;
    
    for (const user of users) {
      try {
        // Forcer la géolocalisation même si elle existe déjà
        user.location = null;
        await locationService.detectAndSaveUserLocation(user);
        geolocatedCount++;
        console.log(`✅ Géolocalisé: ${user.telegramId}`);
      } catch (error) {
        console.error(`❌ Erreur géolocalisation user ${user.telegramId}:`, error.message);
      }
    }
    
    res.json({
      success: true,
      totalUsers: users.length,
      geolocatedUsers: geolocatedCount,
      message: `${geolocatedCount}/${users.length} utilisateurs géolocalisés`
    });
    
  } catch (error) {
    console.error('❌ Erreur force géolocalisation:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la géolocalisation forcée',
      details: error.message 
    });
  }
});

// API pour les statistiques de géolocalisation des utilisateurs (GET et POST)
const handleUserAnalytics = async (req, res) => {
  try {
    // Support des paramètres depuis query (GET) ou body (POST)
    const timeRange = req.query.timeRange || req.body?.timeRange || 'all';
    const dateFilter = req.body?.dateFilter || {};
    
    console.log(`📊 Génération stats utilisateurs - période: ${timeRange}`);
    
    // Calcul des filtres de date selon la période
    let calculatedDateFilter = { ...dateFilter };
    
    if (timeRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case '1d':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        calculatedDateFilter.createdAt = { $gte: startDate };
        console.log(`📅 Filtre de date appliqué: depuis ${startDate.toISOString()}`);
      }
    }
    
    // Filtres de base
    const userFilter = { ...calculatedDateFilter };
    
    // Statistiques générales
    const totalUsers = await User.countDocuments(userFilter);
    const usersWithLocation = await User.countDocuments({
      ...userFilter,
      'location.country': { $exists: true, $ne: null, $ne: 'Unknown' }
    });
    
    console.log(`🔍 DEBUG Analytics: totalUsers = ${totalUsers}, usersWithLocation = ${usersWithLocation}`);
    console.log(`🔍 DEBUG userFilter:`, JSON.stringify(userFilter));
    
    // Utiliser le service de géolocalisation pour les statistiques par pays
    const locationService = require('./src/services/locationService');
    const countryStats = await locationService.getCountryStats(User);
    
    // Filtrer les stats par période si nécessaire
    let filteredCountryStats = countryStats;
    if (timeRange !== 'all' && calculatedDateFilter.createdAt) {
      // Re-calculer les stats avec le filtre de date
      filteredCountryStats = await User.aggregate([
        {
          $match: {
            ...userFilter,
            'location.country': { $exists: true, $ne: null, $ne: 'Unknown' }
          }
        },
        {
          $group: {
            _id: {
              country: '$location.country',
              countryCode: '$location.countryCode'
            },
            count: { $sum: 1 },
            latestUser: { $max: '$createdAt' }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $project: {
            country: '$_id.country',
            countryCode: '$_id.countryCode',
            count: 1,
            latestUser: 1,
            _id: 0
          }
        }
      ]);
    }
    
    const response = {
      totalUsers,
      usersWithLocation,
      countryStats: filteredCountryStats,
      timeRange,
      generatedAt: new Date().toISOString()
    };
    
    console.log(`✅ Stats générées: ${totalUsers} users, ${usersWithLocation} localisés, ${filteredCountryStats.length} pays`);
    console.log(`🔍 DEBUG Réponse finale:`, JSON.stringify(response));
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erreur API user-analytics:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération des statistiques',
      details: error.message 
    });
  }
};

// Routes pour user analytics (GET et POST) - sans auth pour debug
app.get('/api/admin/user-analytics', handleUserAnalytics);
app.post('/api/admin/user-analytics', handleUserAnalytics);

// Test endpoint pour vérifier le proxy
app.get('/api/test-proxy', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Proxy fonctionne!', 
    timestamp: new Date().toISOString() 
  });
});

// DEBUG: Endpoint pour vérifier les utilisateurs dans la DB
app.get('/api/debug/users-check', async (req, res) => {
  try {
    console.log('🔍 DEBUG: Vérification utilisateurs dans la base de données');
    
    // Compter les utilisateurs total
    const totalUsers = await User.countDocuments({});
    console.log(`📊 Total utilisateurs trouvés: ${totalUsers}`);
    
    // Utilisateurs récents (24h)
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    console.log(`📅 Utilisateurs dernières 24h: ${recentUsers}`);
    
    // Échantillon d'utilisateurs
    const sampleUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('telegramId username firstName lastName location createdAt');
    console.log(`👥 Échantillon utilisateurs:`, sampleUsers);
    
    // Utilisateurs avec géolocalisation
    const usersWithLocation = await User.countDocuments({
      'location.country': { $exists: true, $ne: null, $ne: 'Unknown' }
    });
    console.log(`📍 Utilisateurs avec localisation: ${usersWithLocation}`);
    
    // Stats par pays
    const countryStats = await User.aggregate([
      {
        $match: {
          'location.country': { $exists: true, $ne: null, $ne: 'Unknown' }
        }
      },
      {
        $group: {
          _id: '$location.country',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    console.log(`🌍 Top pays:`, countryStats);
    
    res.json({
      success: true,
      debug: {
        totalUsers,
        recentUsers,
        usersWithLocation,
        sampleUsers,
        countryStats,
        dbConnected: true,
        userModelExists: !!User
      }
    });
  } catch (error) {
    console.error('❌ DEBUG ERROR:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
});

// DEBUG: Endpoint pour forcer reload config et afficher debug
app.get('/api/debug/config-reload', async (req, res) => {
  try {
    console.log('🔧 DEBUG: Force reload config demandé');
    
    // Invalider tous les caches
    const { invalidateConfigCache } = require('./src/utils/configHelper');
    invalidateConfigCache();
    configCache = null;
    cacheTimestamp = 0;
    
    // Recharger immédiatement
    const freshConfig = await Config.findById('main');
    console.log('📝 DEBUG Welcome text:', freshConfig?.welcome?.text || 'NON DÉFINI');
    console.log('📞 DEBUG Contact content:', freshConfig?.buttons?.contact?.content || 'NON DÉFINI');
    console.log('ℹ️ DEBUG Info content:', freshConfig?.buttons?.info?.content || 'NON DÉFINI');
    
    res.json({
      success: true,
      debug: {
        welcomeText: freshConfig?.welcome?.text || 'NON DÉFINI',
        contactContent: freshConfig?.buttons?.contact?.content || 'NON DÉFINI',
        infoContent: freshConfig?.buttons?.info?.content || 'NON DÉFINI'
      }
    });
  } catch (error) {
    console.error('❌ DEBUG ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actions pour les contextes de retour spécifiques (boutons "Retour")
bot.action(/^return_service_(.+)$/, (ctx) => {
  const serviceType = ctx.match[1];
  console.log(`🔄 Retour vers service: ${serviceType}`);
  return handleServiceFilter(ctx, serviceType, 0);
});

bot.action(/^return_country_(.+)$/, (ctx) => {
  const country = ctx.match[1];
  console.log(`🔄 Retour vers pays: ${country}`);
  return handleCountryFilter(ctx, country, 0);
});

// Endpoint pour forcer la mise à jour du texte du bouton principal
app.post('/api/force-update-button-text', async (req, res) => {
  try {
    console.log('🔧 Forçage mise à jour texte bouton principal vers VOTER POUR VOTRE PLUG 🗳️');
    
    const config = await Config.findById('main');
    if (!config) {
      return res.status(404).json({ error: 'Configuration non trouvée' });
    }
    
    // Initialiser les langues si nécessaire
    if (!config.languages) {
      config.languages = {
        enabled: true,
        currentLanguage: 'fr',
        availableLanguages: [
          { code: 'fr', name: 'Français', flag: '🇫🇷', enabled: true },
          { code: 'en', name: 'English', flag: '🇬🇧', enabled: true },
          { code: 'it', name: 'Italiano', flag: '🇮🇹', enabled: true },
          { code: 'es', name: 'Español', flag: '🇪🇸', enabled: true },
          { code: 'de', name: 'Deutsch', flag: '🇩🇪', enabled: true }
        ],
        translations: new Map()
      };
    }
    
    // Forcer les traductions du bouton dans TOUTES les langues
    if (!config.languages.translations) {
      config.languages.translations = new Map();
    }
    
    const topPlugsTranslations = new Map();
    topPlugsTranslations.set('fr', 'VOTER POUR VOTRE PLUG 🗳️');
    topPlugsTranslations.set('en', 'VOTE FOR YOUR PLUG 🗳️');
    topPlugsTranslations.set('it', 'VOTA PER IL TUO PLUG 🗳️');
    topPlugsTranslations.set('es', 'VOTA POR TU PLUG 🗳️');
    topPlugsTranslations.set('de', 'STIMME FÜR DEINEN PLUG 🗳️');
    
    config.languages.translations.set('menu_topPlugs', topPlugsTranslations);
    
    // Mettre à jour aussi le texte par défaut
    if (!config.buttons) config.buttons = {};
    if (!config.buttons.topPlugs) config.buttons.topPlugs = {};
    config.buttons.topPlugs.text = 'VOTER POUR VOTRE PLUG 🗳️';
    config.buttons.topPlugs.enabled = true;
    
    if (!config.botTexts) config.botTexts = {};
    config.botTexts.topPlugsTitle = 'VOTER POUR VOTRE PLUG 🗳️';
    
    await config.save();
    
    // Invalider les caches
    configCache = null;
    plugsCache = null;
    clearAllCaches();
    
    console.log('🚀 Texte du bouton mis à jour dans toutes les langues');
    
    res.json({ 
      success: true, 
      message: 'Texte du bouton mis à jour dans toutes les langues',
      translations: {
        fr: 'VOTER POUR VOTRE PLUG 🗳️',
        en: 'VOTE FOR YOUR PLUG 🗳️',
        it: 'VOTA PER IL TUO PLUG 🗳️',
        es: 'VOTA POR TU PLUG 🗳️',
        de: 'STIMME FÜR DEINEN PLUG 🗳️'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour texte bouton:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API pour mettre à jour l'emoji Potato vers 🥔 DÉFINITIVEMENT
app.post('/api/force-update-potato-emoji', async (req, res) => {
  try {
    console.log('🥔 CORRECTION DÉFINITIVE emoji Potato : 🏴‍☠️ → 🥔');
    
    const config = await Config.findById('main');
    if (!config) {
      return res.status(404).json({ error: 'Configuration non trouvée' });
    }
    
    // Mettre à jour dans socialMediaList si il existe
    if (config.socialMediaList && Array.isArray(config.socialMediaList)) {
      const potatoIndex = config.socialMediaList.findIndex(item => 
        item.name && item.name.toLowerCase().includes('potato')
      );
      
      if (potatoIndex !== -1) {
        console.log('🔧 Potato trouvé dans socialMediaList, mise à jour...');
        config.socialMediaList[potatoIndex].emoji = '🥔';
        console.log('✅ Emoji Potato mis à jour dans socialMediaList');
      } else {
        console.log('➕ Potato pas trouvé, ajout...');
        config.socialMediaList.push({
          id: 'potato',
          name: 'Potato',
          emoji: '🥔',
          url: 'https://dym168.org/findyourplug',
          enabled: true
        });
        console.log('✅ Potato ajouté à socialMediaList avec 🥔');
      }
    } else {
      console.log('📝 Création socialMediaList avec Potato...');
      config.socialMediaList = [{
        id: 'potato',
        name: 'Potato',
        emoji: '🥔',
        url: 'https://dym168.org/findyourplug',
        enabled: true
      }];
    }
    
    await config.save();
    
    // Invalider les caches
    configCache = null;
    plugsCache = null;
    if (typeof clearAllCaches === 'function') {
      clearAllCaches();
    }
    
    console.log('🚀 Emoji Potato mis à jour : 🏴‍☠️ → 🥔');
    
    res.json({ 
      success: true, 
      message: 'Emoji Potato mis à jour avec succès',
      oldEmoji: '🏴‍☠️',
      newEmoji: '🥔',
      socialMediaUpdated: true
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour emoji Potato:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API pour forcer la mise à jour des traductions Contact et Info
app.post('/api/force-update-contact-info-translations', async (req, res) => {
  try {
    console.log('📝 MISE À JOUR FORCÉE des traductions Contact et Info');
    
    const config = await Config.findById('main');
    if (!config) {
      return res.status(404).json({ error: 'Configuration non trouvée' });
    }
    
    // Mettre à jour les textes Contact et Info avec les traductions
    if (!config.buttons) {
      config.buttons = {};
    }
    
    // Contact - Texte français mis à jour
    if (!config.buttons.contact) {
      config.buttons.contact = {};
    }
    config.buttons.contact.text = '📞 Contact';
    config.buttons.contact.content = 'Contactez-nous pour plus d\'informations.\n\n@findyourplugsav';
    config.buttons.contact.enabled = true;
    
    // Info - Texte français mis à jour  
    if (!config.buttons.info) {
      config.buttons.info = {};
    }
    config.buttons.info.text = 'ℹ️ Info';
    config.buttons.info.content = 'Nous listons les plugs du monde entier par Pays / Ville découvrez notre mini-app 🌍🔌\n\nPour toute demande spécifique contacter nous @findyourplugsav 📲';
    config.buttons.info.enabled = true;
    
    await config.save();
    
    // Invalider tous les caches
    configCache = null;
    plugsCache = null;
    if (typeof clearAllCaches === 'function') {
      clearAllCaches();
    }
    
    console.log('✅ Traductions Contact et Info mises à jour');
    
    res.json({ 
      success: true, 
      message: 'Traductions Contact et Info mises à jour avec succès',
      contact: {
        text: config.buttons.contact.text,
        content: config.buttons.contact.content
      },
      info: {
        text: config.buttons.info.text,
        content: config.buttons.info.content
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour traductions Contact/Info:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API pour traduire automatiquement toutes les boutiques existantes
app.post('/api/translate-all-shops', async (req, res) => {
  try {
    console.log('🌍 TRADUCTION DE TOUTES LES BOUTIQUES EXISTANTES');
    
    // Récupérer toutes les boutiques actives
    const shops = await Plug.find({ isActive: true });
    console.log(`📊 ${shops.length} boutiques à traduire`);
    
    let translated = 0;
    let errors = 0;
    
    for (let i = 0; i < shops.length; i++) {
      const shop = shops[i];
      
      try {
        console.log(`🔄 Traduction ${i + 1}/${shops.length}: ${shop.name}`);
        
        // Traduire la boutique
        const translatedShop = await translationService.translateShop(shop.toObject());
        
        // Sauvegarder les traductions
        shop.translations = translatedShop.translations;
        await shop.save();
        
        translated++;
        console.log(`✅ ${shop.name} traduit avec succès`);
        
        // Pause entre les boutiques pour éviter le rate limiting
        if (i < shops.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`❌ Erreur traduction ${shop.name}:`, error.message);
        errors++;
      }
    }
    
    // Invalider les caches
    configCache = null;
    plugsCache = null;
    if (typeof clearAllCaches === 'function') {
      clearAllCaches();
    }
    
    console.log(`🎉 Traduction terminée: ${translated} réussies, ${errors} erreurs`);
    
    res.json({ 
      success: true, 
      message: 'Traduction automatique de toutes les boutiques terminée',
      stats: {
        total: shops.length,
        translated,
        errors
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur traduction massive:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API pour mettre à jour les liens Telegram depuis le panel admin
app.post('/api/update-telegram-links', authenticateAdmin, async (req, res) => {
  try {
    console.log('🔗 Mise à jour des liens Telegram depuis le panel admin');
    
    const { inscriptionTelegramLink, servicesTelegramLink } = req.body;
    
    if (!inscriptionTelegramLink || !servicesTelegramLink) {
      return res.status(400).json({ error: 'Liens Telegram manquants' });
    }
    
    const config = await Config.findById('main');
    if (!config) {
      return res.status(404).json({ error: 'Configuration non trouvée' });
    }
    
    // Initialiser boutique si nécessaire
    if (!config.boutique) {
      config.boutique = {};
    }
    
    // Mettre à jour les liens
    config.boutique.inscriptionTelegramLink = inscriptionTelegramLink;
    config.boutique.servicesTelegramLink = servicesTelegramLink;
    
    await config.save();
    
    // Invalider les caches
    configCache = null;
    plugsCache = null;
    if (typeof clearAllCaches === 'function') {
      clearAllCaches();
    }
    
    console.log('✅ Liens Telegram mis à jour:', {
      inscription: inscriptionTelegramLink,
      services: servicesTelegramLink
    });
    
    res.json({ 
      success: true, 
      message: 'Liens Telegram mis à jour avec succès',
      links: {
        inscriptionTelegramLink,
        servicesTelegramLink
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour liens Telegram:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour forcer la mise à jour COMPLÈTE de toutes les traductions
app.post('/api/force-update-all-translations', async (req, res) => {
  try {
    console.log('🔧 Mise à jour COMPLÈTE de toutes les traductions du bot...');
    
    const config = await Config.findById('main');
    if (!config) {
      return res.status(404).json({ error: 'Configuration non trouvée' });
    }
    
    // TOUTES LES TRADUCTIONS COMPLETES
    const completeTranslations = {
      // Menu principal
      'menu_topPlugs': {
        fr: 'VOTER POUR VOTRE PLUG 🗳️',
        en: 'VOTE FOR YOUR PLUG 🗳️',
        it: 'VOTA PER IL TUO PLUG 🗳️',
        es: 'VOTA POR TU PLUG 🗳️',
        de: 'STIMME FÜR DEINEN PLUG 🗳️'
      },
      'menu_contact': {
        fr: '📞 Contact',
        en: '📞 Contact',
        it: '📞 Contatto',
        es: '📞 Contacto',
        de: '📞 Kontakt'
      },
      'menu_info': {
        fr: 'ℹ️ Info',
        en: 'ℹ️ Info',
        it: 'ℹ️ Informazioni',
        es: 'ℹ️ Información',
        de: 'ℹ️ Informationen'
      },
      'menu_inscription': {
        fr: '📋 Inscription',
        en: '📋 Registration',
        it: '📋 Registrazione',
        es: '📋 Inscripción',
        de: '📋 Anmeldung'
      },
      'menu_changeLanguage': {
        fr: '🗣️ Changer de langue',
        en: '🗣️ Change language',
        it: '🗣️ Cambia lingua',
        es: '🗣️ Cambiar idioma',
        de: '🗣️ Sprache ändern'
      },
      'menu_refresh': {
        fr: '🔄 Actualiser',
        en: '🔄 Refresh',
        it: '🔄 Aggiorna',
        es: '🔄 Actualizar',
        de: '🔄 Aktualisieren'
      },
      'menu_language': {
        fr: '🌍 Langue',
        en: '🌍 Language',
        it: '🌍 Lingua',
        es: '🌍 Idioma',
        de: '🌍 Sprache'
      },
      'menu_selectLanguage': {
        fr: 'Sélectionnez votre langue préférée :',
        en: 'Select your preferred language:',
        it: 'Seleziona la tua lingua preferita:',
        es: 'Selecciona tu idioma preferido:',
        de: 'Wählen Sie Ihre bevorzugte Sprache:'
      },
      // Messages
      'messages_welcome': {
        fr: 'Bienvenue sur FindYourPlug! Explorez nos services.',
        en: 'Welcome to FindYourPlug! Explore our services.',
        it: 'Benvenuto su FindYourPlug! Esplora i nostri servizi.',
        es: 'Bienvenido a FindYourPlug! Explora nuestros servicios.',
        de: 'Willkommen bei FindYourPlug! Entdecken Sie unsere Services.'
      },
      'messages_sortedByVotes': {
        fr: 'Triés par nombre de votes',
        en: 'Sorted by number of votes',
        it: 'Ordinati per numero di voti',
        es: 'Ordenados por número de votos',
        de: 'Sortiert nach Anzahl der Stimmen'
      },
      'messages_shopsAvailable': {
        fr: 'boutiques disponibles',
        en: 'shops available',
        it: 'negozi disponibili',
        es: 'tiendas disponibles',
        de: 'Shops verfügbar'
      },
      'messages_noShops': {
        fr: '❌ Aucun plug disponible pour le moment.',
        en: '❌ No plugs available at the moment.',
        it: '❌ Nessun negozio disponibile al momento.',
        es: '❌ No hay tiendas disponibles en este momento.',
        de: '❌ Momentan sind keine Shops verfügbar.'
      },
      // Services
      'service_delivery': {
        fr: 'Livraison',
        en: 'Delivery',
        it: 'Consegna',
        es: 'Entrega',
        de: 'Lieferung'
      },
      'service_meetup': {
        fr: 'Meetup',
        en: 'Meetup',
        it: 'Incontro',
        es: 'Encuentro',
        de: 'Treffen'
      },
      'service_postal': {
        fr: 'Envoi postal',
        en: 'Postal shipping',
        it: 'Spedizione postale',
        es: 'Envío postal',
        de: 'Postversand'
      },
      // Navigation
      'back_to_menu': {
        fr: 'Retour au menu',
        en: 'Back to menu',
        it: 'Torna al menu',
        es: 'Volver al menú',
        de: 'Zurück zum Menü'
      },
      'back_to_shops': {
        fr: 'Retour aux boutiques',
        en: 'Back to shops',
        it: 'Torna ai negozi',
        es: 'Volver a las tiendas',
        de: 'Zurück zu den Geschäften'
      },
      // Erreurs
      'error_loading': {
        fr: 'Erreur lors du chargement',
        en: 'Error loading',
        it: 'Errore durante il caricamento',
        es: 'Error al cargar',
        de: 'Fehler beim Laden'
      },
      // Boutiques
      'vote_for_shop': {
        fr: 'Voter Pour ce Plug',
        en: 'Vote for this Plug',
        it: 'Vota per questo negozio',
        es: 'Votar por esta tienda',
        de: 'Für diesen Shop stimmen'
      },
      'vote_count_singular': {
        fr: 'vote',
        en: 'vote',
        it: 'voto',
        es: 'voto',
        de: 'Stimme'
      },
      'vote_count_plural': {
        fr: 'votes',
        en: 'votes',
        it: 'voti',
        es: 'votos',
        de: 'Stimmen'
      }
    };
    
    // Initialiser les langues si nécessaire
    if (!config.languages) {
      config.languages = {
        enabled: true,
        currentLanguage: 'fr',
        availableLanguages: [
          { code: 'fr', name: 'Français', flag: '🇫🇷', enabled: true },
          { code: 'en', name: 'English', flag: '🇬🇧', enabled: true },
          { code: 'it', name: 'Italiano', flag: '🇮🇹', enabled: true },
          { code: 'es', name: 'Español', flag: '🇪🇸', enabled: true },
          { code: 'de', name: 'Deutsch', flag: '🇩🇪', enabled: true }
        ],
        translations: new Map()
      };
    }
    
    if (!config.languages.translations) {
      config.languages.translations = new Map();
    }
    
    // Ajouter TOUTES les traductions
    let translationsAdded = 0;
    Object.entries(completeTranslations).forEach(([key, langs]) => {
      const langMap = new Map();
      Object.entries(langs).forEach(([langCode, text]) => {
        langMap.set(langCode, text);
      });
      config.languages.translations.set(key, langMap);
      translationsAdded++;
    });
    
    // Mettre à jour tous les boutons
    if (!config.buttons) config.buttons = {};
    
    config.buttons.topPlugs = {
      text: 'VOTER POUR VOTRE PLUG 🗳️',
      enabled: true
    };
    config.buttons.contact = {
      text: '📞 Contact',
      enabled: true
    };
    config.buttons.info = {
      text: 'ℹ️ Info',
      enabled: true
    };
    
    // Mettre à jour tous les textes
    if (!config.botTexts) config.botTexts = {};
    config.botTexts.topPlugsTitle = 'VOTER POUR VOTRE PLUG 🗳️';
    config.botTexts.welcomeMessage = 'Bienvenue sur FindYourPlug! Explorez nos services.';
    
    // Sauvegarder
    await config.save();
    
    // Invalider tous les caches
    configCache = null;
    plugsCache = null;
    clearAllCaches();
    
    console.log('🚀 TOUTES les traductions mises à jour');
    
    res.json({ 
      success: true, 
      message: 'TOUTES les traductions ont été mises à jour',
      translationsAdded: translationsAdded,
      languages: ['fr', 'en', 'it', 'es', 'de'],
      buttonsUpdated: ['topPlugs', 'contact', 'info'],
      sample: {
        fr: completeTranslations.menu_topPlugs.fr,
        en: completeTranslations.menu_topPlugs.en,
        it: completeTranslations.menu_topPlugs.it,
        es: completeTranslations.menu_topPlugs.es,
        de: completeTranslations.menu_topPlugs.de
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour complète traductions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API pour l'analyse géographique des utilisateurs
app.get('/api/admin/user-analytics', async (req, res) => {
  try {
    console.log('📊 Récupération analytics utilisateurs...');
    
    const { timeRange } = req.query;
    
    // Construire le filtre de date selon la période
    let dateFilter = {};
    const now = new Date();
    
    switch (timeRange) {
      case '1d':
        dateFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
        break;
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        dateFilter = {}; // Tous les utilisateurs
    }
    
    // Récupérer tous les utilisateurs avec filtre temporel
    const User = require('./src/models/User');
    const users = await User.find(dateFilter);
    
    console.log(`📊 ${users.length} utilisateurs trouvés pour période ${timeRange}`);
    
    // Analyser les données géographiques
    const countryStats = {};
    let usersWithLocation = 0;
    
    users.forEach(user => {
      if (user.location && user.location.country) {
        usersWithLocation++;
        const country = user.location.country;
        
        if (!countryStats[country]) {
          countryStats[country] = {
            count: 0,
            users: [],
            cities: new Set()
          };
        }
        
        countryStats[country].count++;
        countryStats[country].users.push({
          userId: user.userId,
          username: user.username,
          city: user.location.city || 'Ville inconnue',
          joinDate: user.createdAt
        });
        
        if (user.location.city) {
          countryStats[country].cities.add(user.location.city);
        }
      }
    });
    
    // Convertir en tableau et trier par nombre d'utilisateurs
    const countryStatsArray = Object.entries(countryStats).map(([country, data]) => ({
      country,
      count: data.count,
      percentage: Math.round((data.count / usersWithLocation) * 100),
      cities: Array.from(data.cities),
      cityCount: data.cities.size,
      users: data.users.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
    })).sort((a, b) => b.count - a.count);
    
    console.log('🌍 Stats pays générées:', countryStatsArray.length, 'pays');
    
    res.json({
      success: true,
      totalUsers: users.length,
      usersWithLocation,
      locationCoverage: users.length > 0 ? Math.round((usersWithLocation / users.length) * 100) : 0,
      countryStats: countryStatsArray,
      timeRange,
      lastUpdate: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erreur analytics utilisateurs:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des analytics',
      details: error.message 
    });
  }
});

// API pour forcer la mise à jour des liens Telegram vers findyourplugsav
app.post('/api/force-update-telegram-links', async (req, res) => {
  try {
    console.log('🔗 MISE À JOUR FORCÉE des liens Telegram vers findyourplugsav');
    
    const config = await Config.findById('main');
    if (!config) {
      return res.status(404).json({ error: 'Configuration non trouvée' });
    }
    
    // Forcer la mise à jour des liens
    if (!config.boutique) {
      config.boutique = {};
    }
    
    config.boutique.inscriptionTelegramLink = 'https://t.me/findyourplugsav';
    config.boutique.servicesTelegramLink = 'https://t.me/findyourplugsav';
    
    await config.save();
    
    // Invalider tous les caches
    configCache = null;
    plugsCache = null;
    if (typeof clearAllCaches === 'function') {
      clearAllCaches();
    }
    
    console.log('✅ Liens Telegram forcés vers: https://t.me/findyourplugsav');
    
    res.json({ 
      success: true, 
      message: 'Liens Telegram mis à jour vers findyourplugsav',
      links: {
        inscriptionTelegramLink: 'https://t.me/findyourplugsav',
        servicesTelegramLink: 'https://t.me/findyourplugsav'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour liens Telegram:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API pour mettre à jour l'emoji Potato en base de données
app.post('/api/force-update-potato-emoji', async (req, res) => {
  try {
    console.log('🥔 Correction emoji Potato : 🏴‍☠️ → 🥔');
    
    const config = await Config.findById('main');
    if (!config) {
      return res.status(404).json({ error: 'Configuration non trouvée' });
    }
    
    // Mettre à jour l'emoji Potato dans socialMediaList
    if (config.socialMediaList && Array.isArray(config.socialMediaList)) {
      const potatoIndex = config.socialMediaList.findIndex(sm => 
        sm.name && sm.name.toLowerCase().includes('potato')
      );
      
      if (potatoIndex !== -1) {
        console.log('🔧 Potato trouvé dans socialMediaList, mise à jour...');
        config.socialMediaList[potatoIndex].emoji = '🥔';
        console.log('✅ Emoji Potato mis à jour dans socialMediaList');
      } else {
        console.log('⚠️ Potato non trouvé dans socialMediaList, ajout...');
        config.socialMediaList.push({
          id: 'potato',
          name: 'Potato',
          emoji: '🥔',
          url: 'https://potato.com',
          enabled: true
        });
        console.log('✅ Potato ajouté à socialMediaList avec 🥔');
      }
    } else {
      console.log('🔧 Initialisation socialMediaList avec Potato...');
      config.socialMediaList = [{
        id: 'potato',
        name: 'Potato',
        emoji: '🥔',
        url: 'https://potato.com',
        enabled: true
      }];
    }
    
    // Sauvegarder
    await config.save();
    
    // Invalider les caches
    configCache = null;
    plugsCache = null;
    clearAllCaches();
    
    console.log('🚀 Emoji Potato mis à jour : 🏴‍☠️ → 🥔');
    
    res.json({ 
      success: true, 
      message: 'Emoji Potato mis à jour avec succès',
      oldEmoji: '🏴‍☠️',
      newEmoji: '🥔',
      socialMediaUpdated: true
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour emoji Potato:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API pour vider TOUS les caches - SOLUTION AU PROBLÈME MINI APP !
app.post('/api/clear-all-caches', async (req, res) => {
  try {
    console.log('🧹 VIDAGE DE TOUS LES CACHES...');
    
    // Vider tous les caches possibles
    configCache = null;
    plugsCache = null;
    
    // Fonction pour vider tous les caches (si elle existe)
    if (typeof clearAllCaches === 'function') {
      clearAllCaches();
    }
    
    console.log('✅ TOUS LES CACHES VIDÉS !');
    
    res.json({ 
      success: true, 
      message: 'Tous les caches ont été vidés avec succès',
      timestamp: new Date().toISOString(),
      clearedCaches: ['configCache', 'plugsCache']
    });
    
  } catch (error) {
    console.error('❌ Erreur vidage caches:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API pour forcer l'utilisation des traductions par défaut pour Contact et Info
app.post('/api/reset-contact-info-to-defaults', async (req, res) => {
  try {
    console.log('🔄 RESET des textes Contact et Info vers les traductions par défaut...');
    
    const config = await Config.findById('main');
    if (!config) {
      return res.status(404).json({ error: 'Configuration non trouvée' });
    }
    
    // Vider les textes du panel admin pour forcer l'utilisation des traductions
    if (!config.buttons) config.buttons = {};
    if (!config.buttons.contact) config.buttons.contact = {};
    if (!config.buttons.info) config.buttons.info = {};
    
    // Réinitialiser à vide pour utiliser les traductions par défaut
    config.buttons.contact.content = '';
    config.buttons.info.content = '';
    
    await config.save();
    
    // Vider tous les caches
    configCache = null;
    plugsCache = null;
    if (typeof clearAllCaches === 'function') {
      clearAllCaches();
    }
    
    console.log('✅ Textes Contact/Info réinitialisés vers traductions par défaut');
    
    res.json({ 
      success: true, 
      message: 'Textes Contact et Info réinitialisés vers les traductions par défaut',
      result: 'Le bot utilisera maintenant les traductions automatiques en français, anglais, italien, espagnol et allemand'
    });
    
  } catch (error) {
    console.error('❌ Erreur reset Contact/Info:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API pour synchroniser les textes Contact et Info du panel admin avec le bot
app.post('/api/sync-contact-info-texts', async (req, res) => {
  try {
    console.log('📝 SYNCHRONISATION des textes Contact et Info...');
    
    const { contactText, infoText } = req.body;
    
    if (!contactText && !infoText) {
      return res.status(400).json({ error: 'Aucun texte fourni' });
    }
    
    const config = await Config.findById('main');
    if (!config) {
      return res.status(404).json({ error: 'Configuration non trouvée' });
    }
    
    let updated = false;
    
    // Synchroniser le texte Contact
    if (contactText) {
      if (!config.buttons) config.buttons = {};
      if (!config.buttons.contact) config.buttons.contact = {};
      
      config.buttons.contact.content = contactText;
      console.log('📞 Texte Contact synchronisé:', contactText);
      updated = true;
    }
    
    // Synchroniser le texte Info  
    if (infoText) {
      if (!config.buttons) config.buttons = {};
      if (!config.buttons.info) config.buttons.info = {};
      
      config.buttons.info.content = infoText;
      console.log('ℹ️ Texte Info synchronisé:', infoText);
      updated = true;
    }
    
    if (updated) {
      await config.save();
      
      // Vider tous les caches
      configCache = null;
      plugsCache = null;
      if (typeof clearAllCaches === 'function') {
        clearAllCaches();
      }
      
      console.log('✅ Textes Contact/Info synchronisés avec succès');
    }
    
    res.json({ 
      success: true, 
      message: 'Textes Contact et Info synchronisés',
      updated: { contactText: !!contactText, infoText: !!infoText }
    });
    
  } catch (error) {
    console.error('❌ Erreur synchronisation Contact/Info:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// SYSTÈME DE VIDAGE AUTOMATIQUE DES CACHES
setInterval(() => {
  console.log('🔄 Vidage automatique des caches...');
  configCache = null;
  plugsCache = null;
  if (typeof clearAllCaches === 'function') {
    clearAllCaches();
  }
}, 5 * 60 * 1000); // Toutes les 5 minutes

// Hook pour vider le cache après chaque modification
const originalSave = require('mongoose').Model.prototype.save;
require('mongoose').Model.prototype.save = function(options, fn) {
  const result = originalSave.call(this, options, fn);
  
  // Vider les caches après chaque sauvegarde
  if (this.constructor.modelName === 'Config' || this.constructor.modelName === 'Plug') {
    console.log('🧹 Cache vidé après modification de', this.constructor.modelName);
    configCache = null;
    plugsCache = null;
    if (typeof clearAllCaches === 'function') {
      clearAllCaches();
    }
  }
  
  return result;
};