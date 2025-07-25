require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
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
  handleTopCountryFilter
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
  userForms
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
    'https://safeplugslink.vercel.app',
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
bot.action('top_plugs', handleTopPlugs);
bot.action('plugs_all', (ctx) => handleAllPlugs(ctx, 0));
// bot.action('plugs_vip', (ctx) => handleVipPlugs(ctx, 0)); // SUPPRIMÉ - Boutique VIP retirée
bot.action('filter_service', handleFilterService);
bot.action('filter_country', handleFilterCountry);
bot.action('contact', handleContact);
bot.action('info', handleInfo);
bot.action('social_media', handleSocialMedia);
bot.action('start_application', handleStartApplication);
bot.action('cancel_application', handleCancelApplication);
bot.action('services_done', handleServicesDone);
bot.action(/^country_(.+)$/, handleCountrySelection);

// === NOUVEAUX HANDLERS TOP DES PLUGS ===
bot.action(/^top_country_(.+)$/, (ctx) => {
  const country = ctx.match[1];
  return handleTopCountryFilter(ctx, country);
});

bot.action(/^top_service_(.+)$/, (ctx) => {
  const fullMatch = ctx.match[1];
  const parts = fullMatch.split('_');
  const serviceType = parts[0]; // delivery, meetup, postal
  const selectedCountry = parts.length > 1 ? parts[1] : null;
  return handleTopServiceFilter(ctx, serviceType, selectedCountry);
});

bot.action(/^top_departments_(.+)$/, (ctx) => {
  const fullMatch = ctx.match[1];
  const parts = fullMatch.split('_');
  const serviceType = parts[0]; // delivery ou meetup
  const selectedCountry = parts.length > 1 ? parts[1] : null;
  return handleDepartmentFilter(ctx, serviceType, selectedCountry);
});

bot.action(/^top_dept_(.+)_(.+)_?(.*)$/, (ctx) => {
  const serviceType = ctx.match[1]; // delivery ou meetup
  const department = ctx.match[2];
  const selectedCountry = ctx.match[3] || null;
  return handleSpecificDepartment(ctx, serviceType, department, selectedCountry);
});

bot.action('top_reset_filters', handleResetFilters);

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
bot.action('skip_telegram', (ctx) => handleSkipStep(ctx, 'telegram'));
bot.action('skip_telegram_channel', (ctx) => handleSkipStep(ctx, 'telegram_channel'));
bot.action('skip_instagram', (ctx) => handleSkipStep(ctx, 'instagram'));
bot.action('skip_potato', (ctx) => handleSkipStep(ctx, 'potato'));
bot.action('skip_snapchat', (ctx) => handleSkipStep(ctx, 'snapchat'));
bot.action('skip_whatsapp', (ctx) => handleSkipStep(ctx, 'whatsapp'));
bot.action('skip_signal', (ctx) => handleSkipStep(ctx, 'signal'));
bot.action('skip_session', (ctx) => handleSkipStep(ctx, 'session'));
bot.action('skip_threema', (ctx) => handleSkipStep(ctx, 'threema'));
bot.action('confirm_application', submitApplication);

bot.action('check_application_status', handleCheckApplicationStatus);
bot.action(/^cancel_my_application_(.+)$/, handleCancelMyApplication);
bot.action(/^confirm_cancel_(.+)$/, handleConfirmCancel);

// Gestionnaire des services (distinguer formulaire vs filtres)
bot.action(/^service_(delivery|postal|meetup)$/, async (ctx) => {
  const userId = ctx.from.id;
  const userForm = userForms.get(userId);
  
  if (userForm && userForm.step === 'services') {
    // C'est pour le formulaire d'inscription
    await handleServiceToggle(ctx);
  } else {
    // C'est pour les filtres de plugs
    const serviceType = ctx.callbackQuery.data.replace('service_', '');
    await handleServiceFilter(ctx, serviceType, 0);
  }
});

// Pagination améliorée
bot.action(/^page_(.+)_(\d+)$/, (ctx) => {
  const context = ctx.match[1];
  const page = parseInt(ctx.match[2]);
  
  console.log(`🔄 Pagination: context=${context}, page=${page}`);
  
  if (context === 'all' || context === 'plugs_all') {
    return handleAllPlugs(ctx, page);
  } else if (context === 'vip') {
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
    const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3000'}/api/likes/${plugId}`, {
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
      await fetch(`${process.env.API_BASE_URL || 'http://localhost:3000'}/api/cache/refresh`, {
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
                    text: `👍 Déjà voté (2h)`
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

// Cache de configuration
let configCache = null;
let lastConfigUpdate = 0;

// Fonction pour recharger la configuration
const reloadBotConfig = async () => {
  try {
    console.log('🔄 Rechargement de la configuration du bot...');
    configCache = await Config.findById('main');
    lastConfigUpdate = Date.now();
    console.log('✅ Configuration rechargée avec succès');
    return configCache;
  } catch (error) {
    console.error('❌ Erreur lors du rechargement de la config:', error);
    throw error;
  }
};

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
      messages: config?.messages || {},
      buttons: config?.buttons || {}
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
    
    // Invalider le cache
    configCache = null;
    lastConfigUpdate = 0;
    
    // Recharger la configuration
    await reloadBotConfig();
    
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
            topPlugs: { text: '🔌 Top Des Plugs', enabled: true },
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
    configCache = null;
    lastConfigUpdate = Date.now();
    
    // CORRECTION: Forcer le rechargement de la configuration du bot
    try {
      await reloadBotConfig();
      console.log('✅ Configuration du bot rechargée automatiquement');
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
    configCache = null;
    lastConfigUpdate = 0;
    
    // Forcer le rechargement de la configuration
    await reloadBotConfig();
    
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
      
      // 1. Forcer le nom FINDYOURPLUG
      if (!config.boutique) config.boutique = {};
      if (config.boutique.name !== 'FINDYOURPLUG') {
        config.boutique.name = 'FINDYOURPLUG';
        needsUpdate = true;
        console.log('🔧 Nom boutique corrigé: FINDYOURPLUG');
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
    
    // Créer le nouveau plug
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
    
    const savedPlug = await newPlug.save();
    
    // Générer automatiquement le lien de parrainage
    try {
      const botInfo = await bot.telegram.getMe();
      savedPlug.referralCode = savedPlug.generateReferralCode();
      savedPlug.referralLink = savedPlug.generateReferralLink(botInfo.username);
      await savedPlug.save();
      console.log('🔗 Lien de parrainage généré:', savedPlug.referralLink);
    } catch (linkError) {
      console.error('⚠️ Erreur génération lien de parrainage:', linkError);
    }
    
    console.log('✅ Plug créé:', savedPlug.name);
    
    // Invalider le cache
    invalidateCache();
    
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
    console.log('✅ Plug modifié:', updatedPlug.name);
    
    // Invalider le cache
    invalidateCache();
    
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
    
    // Invalider le cache
    invalidateCache();
    
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

// Charger les utilisateurs existants depuis la base (applications plugs)
const loadExistingUsers = async () => {
  try {
    const PlugApplication = require('./src/models/PlugApplication');
    const applications = await PlugApplication.find({}, 'userId').lean();
    
    applications.forEach(app => {
      if (app.userId) {
        userStorage.add(app.userId);
      }
    });
    
    console.log(`📊 Loaded ${userStorage.size} existing users from database`);
  } catch (error) {
    console.error('⚠️ Error loading existing users:', error.message);
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

    // Envoyer notification si le statut a changé
    if (oldApplication.status !== status) {
      try {
        if (status === 'approved') {
          await sendApprovalNotification(bot, application);
          console.log(`✅ Notification d'approbation envoyée pour ${application.name}`);
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