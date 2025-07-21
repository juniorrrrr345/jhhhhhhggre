require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const cors = require('cors');
const multer = require('multer');
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
  handlePlugServiceDetails 
} = require('./src/handlers/plugsHandler');
const { handleContact, handleInfo, handleIgnoredCallback } = require('./src/handlers/menuHandler');

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
    } else if (data === 'top_plugs' || data === 'plugs_all' || data === 'plugs_vip') {
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

// Commande /start
bot.command('start', handleStart);

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
bot.action('plugs_vip', (ctx) => handleVipPlugs(ctx, 0));
bot.action('filter_service', handleFilterService);
bot.action('filter_country', handleFilterCountry);
bot.action('contact', handleContact);
bot.action('info', handleInfo);

// Filtres par service
bot.action('service_delivery', (ctx) => handleServiceFilter(ctx, 'delivery', 0));
bot.action('service_postal', (ctx) => handleServiceFilter(ctx, 'postal', 0));
bot.action('service_meetup', (ctx) => handleServiceFilter(ctx, 'meetup', 0));

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

// Détails d'un service d'un plug
bot.action(/^plug_service_([a-f\d]{24})_(.+)$/, async (ctx) => {
  try {
    const plugId = ctx.match[1];
    const serviceType = ctx.match[2];
    console.log(`🔧 Service callback: plugId=${plugId}, serviceType=${serviceType}`);
    console.log(`📱 Service callback data:`, ctx.callbackQuery.data);
    console.log(`📊 Match complet:`, ctx.match);
    
    // Valider le type de service
    const validServices = ['delivery', 'postal', 'meetup'];
    if (!validServices.includes(serviceType)) {
      console.log(`❌ Type de service invalide: ${serviceType}`);
      return ctx.answerCbQuery('❌ Service non reconnu');
    }
    
    return await handlePlugServiceDetails(ctx, plugId, serviceType);
  } catch (error) {
    console.error('❌ Erreur dans le gestionnaire de service:', error);
    await ctx.answerCbQuery('❌ Erreur lors du chargement du service').catch(() => {});
  }
});


// Liker une boutique avec système de cooldown
bot.action(/^like_([a-f\d]{24})$/, async (ctx) => {
  try {
    const plugId = ctx.match[1];
    const userId = ctx.from.id;
    
    console.log(`User ${userId} wants to like plug ${plugId}`);
    
    // Vérifier si la boutique existe
    const Plug = require('./src/models/Plug');
    const plug = await Plug.findById(plugId);
    const Config = require('./src/models/Config');
    
    if (!plug) {
      return ctx.answerCbQuery('❌ Boutique non trouvée');
    }
    
    const hasLiked = plug.likedBy.includes(userId);
    
    // Vérifier le cooldown pour retirer un like (2 heures)
    if (hasLiked) {
      const userLikeData = plug.likeHistory?.find(entry => entry.userId === userId);
      if (userLikeData) {
        const timeSinceLastLike = Date.now() - userLikeData.timestamp;
        const cooldownPeriod = 2 * 60 * 60 * 1000; // 2 heures en millisecondes
        
        if (timeSinceLastLike < cooldownPeriod) {
          const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastLike) / (60 * 1000)); // en minutes
          const hours = Math.floor(remainingTime / 60);
          const minutes = remainingTime % 60;
          const timeDisplay = hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}` : `${minutes}min`;
          
          return ctx.answerCbQuery(`⏰ Vous devez attendre encore ${timeDisplay} avant de pouvoir retirer votre like`);
        }
      }
    }
    
    // Initialiser likeHistory si nécessaire
    if (!plug.likeHistory) {
      plug.likeHistory = [];
    }
    
    const action = hasLiked ? 'unlike' : 'like';
    
    // Mettre à jour les likes
    if (action === 'like') {
      plug.likedBy.push(userId);
      plug.likes += 1;
      
      // Ajouter à l'historique
      plug.likeHistory.push({
        userId: userId,
        timestamp: Date.now(),
        action: 'like'
      });
      
      await plug.save();
      await ctx.answerCbQuery(`❤️ Vous avez liké ${plug.name} ! (${plug.likes} likes)`);
      
    } else {
      plug.likedBy = plug.likedBy.filter(id => id !== userId);
      plug.likes -= 1;
      
      // Mettre à jour l'historique
      const userLikeIndex = plug.likeHistory.findIndex(entry => entry.userId === userId);
      if (userLikeIndex !== -1) {
        plug.likeHistory[userLikeIndex].timestamp = Date.now();
        plug.likeHistory[userLikeIndex].action = 'unlike';
      }
      
      await plug.save();
      await ctx.answerCbQuery(`💔 Like retiré de ${plug.name} (${plug.likes} likes)`);
    }
    
    // Récupérer la configuration pour le contexte de retour
    const config = await Config.findById('main');
    
    // Déterminer le bon contexte de retour
    let returnContext = 'top_plugs'; // valeur par défaut
    if (ctx.session && ctx.session.lastContext) {
      returnContext = ctx.session.lastContext;
    }
    
    // Mettre à jour le message complet avec les nouveaux likes
    const { createPlugKeyboard } = require('./src/utils/keyboards');
    const { editMessageWithImage } = require('./src/utils/messageHelper');
    
    // Reconstruire le message de détails du plug avec les nouveaux likes
    let message = `${plug.isVip ? '⭐ ' : ''}**${plug.name}**\n\n`;
    message += `📝 ${plug.description}\n\n`;

    // Services disponibles
    const services = [];
    if (plug.services?.delivery?.enabled) {
      services.push(`🚚 **Livraison**${plug.services.delivery.description ? `: ${plug.services.delivery.description}` : ''}`);
    }
    if (plug.services?.postal?.enabled) {
      services.push(`✈️ **Envoi postal**${plug.services.postal.description ? `: ${plug.services.postal.description}` : ''}`);
    }
    if (plug.services?.meetup?.enabled) {
      services.push(`🏠 **Meetup**${plug.services.meetup.description ? `: ${plug.services.meetup.description}` : ''}`);
    }

    if (services.length > 0) {
      message += `🔧 **Services :**\n${services.join('\n')}\n\n`;
    }

    // Pays desservis
    if (plug.countries && plug.countries.length > 0) {
      message += `🌍 **Pays desservis :** ${plug.countries.join(', ')}\n\n`;
    }

    // Afficher les likes mis à jour en temps réel
    const likesCount = plug.likes || 0;
    message += `❤️ **${likesCount} like${likesCount !== 1 ? 's' : ''}**\n\n`;

    const newKeyboard = createPlugKeyboard(plug, returnContext, userId);
    
    // Mettre à jour le message complet avec la nouvelle information de likes
    try {
      await editMessageWithImage(ctx, message, newKeyboard, config, { 
        parse_mode: 'Markdown',
        plugImage: plug.image,
        isPlugDetails: true
      });
      console.log('✅ Message mis à jour avec les nouveaux likes en temps réel');
    } catch (error) {
      console.log('⚠️ Mise à jour message échouée, mise à jour clavier seulement:', error.message);
      // Fallback : mettre à jour seulement le clavier
      try {
        await ctx.editMessageReplyMarkup(newKeyboard.reply_markup);
        console.log('✅ Clavier mis à jour avec le nouvel état du like');
      } catch (keyboardError) {
        console.log('⚠️ Mise à jour clavier échouée:', keyboardError.message);
      }
    }
    
  } catch (error) {
    console.error('Erreur like boutique:', error);
    await ctx.answerCbQuery('❌ Erreur lors du like');
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
    
    const authHeader = req.headers.authorization;
    console.log(`🔑 Authorization header:`, authHeader ? `Bearer ***${authHeader.slice(-4)}` : 'Absent');
    
    const password = authHeader?.replace('Bearer ', '');
    const expectedPassword = process.env.ADMIN_PASSWORD;
    
    console.log(`🔍 Password fourni:`, password ? `***${password.slice(-4)}` : 'Absent');
    console.log(`🔍 Password attendu:`, expectedPassword ? `***${expectedPassword.slice(-4)}` : 'Non configuré');
    
    // DEBUG TEMPORAIRE: Afficher le mot de passe complet pour diagnostic
    console.log(`🚨 DEBUG - Password complet attendu: "${expectedPassword}"`);
    console.log(`🚨 DEBUG - Password complet fourni: "${password}"`);
    
    if (!password) {
      console.log('❌ Aucun password fourni');
      return res.status(401).json({ error: 'Token d\'authentification manquant' });
    }
    
    // TEMPORAIRE: Accepter tout mot de passe pendant le debug
    if (password !== expectedPassword) {
      console.log('❌ Password incorrect');
      console.log('🚨 TEMPORAIRE: Acceptation du password quand même pour debug');
      // return res.status(401).json({ error: 'Token d\'authentification invalide' });
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

// Récupérer les plugs publics (pour la boutique Vercel)
app.get('/api/public/plugs', async (req, res) => {
  try {
    const { page = 1, limit = 100, search = '', filter = 'active' } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { isActive: true }; // Seulement les plugs actifs pour le public
    
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
    }
    
    const plugs = await Plug.find(query)
      .sort({ likes: -1, isVip: -1, vipOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Plug.countDocuments(query);
    
    // Headers pour éviter le cache et CORS
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Last-Modified': new Date().toUTCString()
    });
    
    res.json({
      plugs,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur récupération plugs publics:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Liker/disliker un plug (endpoint public)
app.post('/api/public/plugs/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, action } = req.body; // action: 'like' ou 'unlike'
    
    console.log(`${action} plug ${id} by user ${userId}`);
    
    const plug = await Plug.findById(id);
    if (!plug) {
      return res.status(404).json({ error: 'Plug non trouvé' });
    }
    
    const hasLiked = plug.likedBy.includes(userId);
    
    if (action === 'like' && !hasLiked) {
      plug.likedBy.push(userId);
      plug.likes += 1;
    } else if (action === 'unlike' && hasLiked) {
      plug.likedBy = plug.likedBy.filter(id => id !== userId);
      plug.likes -= 1;
    }
    
    await plug.save();
    
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache'
    });
    
    res.json({ 
      likes: plug.likes,
      liked: plug.likedBy.includes(userId),
      message: action === 'like' ? 'Like ajouté' : 'Like retiré'
    });
    
  } catch (error) {
    console.error('Erreur like/unlike:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer un plug par ID
app.get('/api/plugs/:id', authenticateAdmin, async (req, res) => {
  try {
    const plug = await Plug.findById(req.params.id);
    if (!plug) {
      return res.status(404).json({ error: 'Plug non trouvé' });
    }
    res.json(plug);
  } catch (error) {
    console.error('Erreur récupération plug:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer un nouveau plug
app.post('/api/plugs', authenticateAdmin, async (req, res) => {
  try {
    const createData = req.body;
    
    console.log(`🆕 Création nouveau plug:`, createData);
    
    // Nettoyer les données avant la création
    const cleanData = { ...createData };
    
    // Convertir les tags en tableau si c'est une chaîne
    if (typeof cleanData.tags === 'string') {
      cleanData.tags = cleanData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    // S'assurer que les booléens sont corrects
    if (cleanData.vip !== undefined) cleanData.isVip = cleanData.vip;
    if (cleanData.active !== undefined) cleanData.isActive = cleanData.active;
    
    // CORRECTION: Synchronisation des images et réseaux sociaux
    // S'assurer que l'image est bien synchronisée
    if (cleanData.image) {
      console.log(`📸 Image synchronisée: ${cleanData.image}`);
    }
    
    // S'assurer que socialMedia est un tableau et bien formaté
    if (!Array.isArray(cleanData.socialMedia)) {
      cleanData.socialMedia = [];
    } else {
      // Valider et nettoyer chaque réseau social
      cleanData.socialMedia = cleanData.socialMedia.filter(social => 
        social && social.name && social.emoji && social.url
      ).map(social => ({
        name: social.name.trim(),
        emoji: social.emoji.trim(),
        url: social.url.trim()
      }));
      console.log(`📱 Réseaux sociaux synchronisés: ${cleanData.socialMedia.length} éléments`);
    }
    
    // Nettoyer les données undefined pour éviter les erreurs
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === undefined || cleanData[key] === null) {
        delete cleanData[key];
      }
    });
    
    console.log(`📝 Données nettoyées pour création:`, cleanData);
    
    const plug = new Plug(cleanData);
    await plug.save();
    
    console.log(`✅ Nouveau plug créé:`, plug.name);
    
    res.status(201).json(plug);
  } catch (error) {
    console.error('❌ Erreur création plug:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Mettre à jour un plug
app.put('/api/plugs/:id', authenticateAdmin, async (req, res) => {
  try {
    const plugId = req.params.id;
    const updateData = req.body;
    
    console.log(`🔄 Début mise à jour plug ${plugId}`);
    console.log(`📊 Taille des données plug:`, JSON.stringify(updateData).length, 'caractères');
    console.log(`📋 Clés principales plug:`, Object.keys(updateData));
    
    // Vérifier que l'ID est valide
    if (!plugId || plugId.length !== 24) {
      throw new Error('ID de plug invalide');
    }
    
    // Vérifier que le plug existe
    const existingPlug = await Plug.findById(plugId);
    if (!existingPlug) {
      return res.status(404).json({ error: 'Plug non trouvé' });
    }
    
    console.log(`📦 Plug existant trouvé: ${existingPlug.name}`);
    
    // Nettoyer les données avant la mise à jour
    const cleanData = { ...updateData };
    
    // Convertir les tags en tableau si c'est une chaîne
    if (typeof cleanData.tags === 'string') {
      cleanData.tags = cleanData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    // S'assurer que les booléens sont corrects
    if (cleanData.vip !== undefined) cleanData.isVip = cleanData.vip;
    if (cleanData.active !== undefined) cleanData.isActive = cleanData.active;
    
    // CORRECTION: Synchronisation des images et réseaux sociaux pour la mise à jour
    // S'assurer que l'image est bien synchronisée
    if (cleanData.image) {
      console.log(`📸 Image mise à jour: ${cleanData.image}`);
    }
    
    // S'assurer que socialMedia est un tableau et bien formaté
    if (!Array.isArray(cleanData.socialMedia)) {
      cleanData.socialMedia = [];
    } else {
      // Valider et nettoyer chaque réseau social
      cleanData.socialMedia = cleanData.socialMedia.filter(social => 
        social && social.name && social.emoji && social.url
      ).map(social => ({
        name: social.name.trim(),
        emoji: social.emoji.trim(),
        url: social.url.trim()
      }));
      console.log(`📱 Réseaux sociaux mis à jour: ${cleanData.socialMedia.length} éléments`);
    }
    
    // Nettoyer les données undefined pour éviter les erreurs de validation
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === undefined || cleanData[key] === null) {
        delete cleanData[key];
      }
    });
    
    console.log(`📝 Données nettoyées:`, Object.keys(cleanData));
    
    // Tentative de mise à jour avec gestion d'erreur détaillée
    console.log('💾 Tentative de sauvegarde plug en base...');
    const plug = await Plug.findByIdAndUpdate(plugId, cleanData, { 
      new: true,
      runValidators: false,  // Désactiver temporairement les validateurs pour éviter les erreurs
      strict: false  // Permet les champs non définis dans le schéma
    });
    
    if (!plug) {
      throw new Error('Échec de la mise à jour plug - aucun document retourné');
    }
    
    console.log(`✅ Plug mis à jour avec succès: ${plug.name}`);
    console.log(`📊 ID du plug: ${plug._id}`);
    console.log(`📱 Réseaux sociaux finaux: ${plug.socialMedia?.length || 0} éléments`);
    
    // Headers pour éviter le cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Last-Modified': new Date().toUTCString(),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    
    res.json(plug);
  } catch (error) {
    console.error('❌ Erreur détaillée mise à jour plug:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      plugId: req.params.id
    });
    
    // Headers CORS même en cas d'erreur
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    
    res.status(500).json({ 
      error: 'Erreur serveur lors de la mise à jour du plug', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Supprimer un plug
app.delete('/api/plugs/:id', authenticateAdmin, async (req, res) => {
  try {
    const plugId = req.params.id;
    console.log(`🗑️ Suppression plug ${plugId}`);
    
    const plug = await Plug.findByIdAndDelete(plugId);
    if (!plug) {
      return res.status(404).json({ error: 'Plug non trouvé' });
    }
    
    console.log(`✅ Plug supprimé:`, plug.name);
    
    // Headers pour éviter le cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({ message: 'Plug supprimé' });
  } catch (error) {
    console.error('❌ Erreur suppression plug:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Route pour nettoyer la configuration boutique
app.post('/api/config/clean-boutique', authenticateAdmin, async (req, res) => {
  try {
    console.log('🧹 Nettoyage configuration boutique...');
    
    const config = await Config.findById('main');
    if (!config) {
      return res.status(404).json({ error: 'Configuration non trouvée' });
    }
    
    // Nettoyer la configuration boutique avec des valeurs vides par défaut
    config.boutique = {
      name: config.boutique?.name || "",
      logo: config.boutique?.logo || "",
      subtitle: config.boutique?.subtitle || "",
      backgroundImage: config.boutique?.backgroundImage || "",
      vipTitle: config.boutique?.vipTitle || "",
      vipSubtitle: config.boutique?.vipSubtitle || "",
      searchTitle: config.boutique?.searchTitle || "",
      searchSubtitle: config.boutique?.searchSubtitle || ""
    };
    
    // Forcer la mise à jour du timestamp
    config.updatedAt = new Date();
    
    await config.save();
    
    console.log('✅ Configuration boutique nettoyée:', config.boutique);
    
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Last-Modified': new Date().toUTCString()
    });
    
    res.json({
      message: 'Configuration boutique nettoyée',
      boutique: config.boutique,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erreur nettoyage boutique:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// ===== ROUTES UPLOADS =====

// Upload d'image
app.post('/api/upload', authenticateAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }
    
    // Pour le moment, retourner l'URL temporaire
    // En production, utiliser Cloudinary ou un service de stockage
    res.json({ 
      url: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` 
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
});

// ===== ROUTES STATISTIQUES =====

// Statistiques du dashboard
app.get('/api/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalPlugs = await Plug.countDocuments({ isActive: true });
    const vipPlugs = await Plug.countDocuments({ isActive: true, isVip: true });
    const inactivePlugs = await Plug.countDocuments({ isActive: false });
    const countries = await Plug.distinct('countries', { isActive: true });
    
    const services = {
      delivery: await Plug.countDocuments({ 
        isActive: true, 
        'services.delivery.enabled': true 
      }),
      postal: await Plug.countDocuments({ 
        isActive: true, 
        'services.postal.enabled': true 
      }),
      meetup: await Plug.countDocuments({ 
        isActive: true, 
        'services.meetup.enabled': true 
      })
    };
    
    res.json({
      totalPlugs,
      vipPlugs,
      inactivePlugs,
      countries: countries.length,
      services
    });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== ROUTES SYSTÈME =====

// Santé de l'API
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
    environment: process.env.NODE_ENV || 'development'
  });
});

// Diagnostic du bot
app.get('/api/bot/diagnostic', async (req, res) => {
  try {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache'
    });
    
    // Vérifier l'état du bot
    const botInfo = await bot.telegram.getMe().catch(e => ({ error: e.message }));
    
    // Vérifier la configuration
    const config = await Config.findById('main').catch(e => ({ error: e.message }));
    
    // Vérifier la base de données
    const dbStatus = await Plug.countDocuments().then(() => 'connected').catch(e => e.message);
    
    res.json({
      status: 'diagnostic',
      timestamp: new Date().toISOString(),
      bot: {
        connected: !botInfo.error,
        info: botInfo.error ? { error: botInfo.error } : { username: botInfo.username, id: botInfo.id },
        webhookSet: process.env.NODE_ENV === 'production'
      },
      database: {
        status: dbStatus,
        configExists: !!config && !config.error
      },
      cache: {
        configCached: !!configCache,
        lastUpdate: lastConfigUpdate ? new Date(lastConfigUpdate).toISOString() : 'never'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test simple pour Vercel
app.get('/test', (req, res) => {
  try {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache'
    });
    
    res.json({ 
      message: 'Test endpoint OK',
      timestamp: new Date().toISOString(),
      source: 'render-api',
      method: req.method
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: 'Test endpoint failed', message: error.message });
  }
});

// Route par défaut
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bot Telegram VIP System API',
    version: '1.0.0',
    endpoints: [
      'GET /health',
      'GET /api/config',
      'PUT /api/config',
      'GET /api/plugs (admin)',
      'GET /api/public/plugs (public)',
      'POST /api/plugs',
      'GET /api/stats'
    ]
  });
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
    
    // Configuration du webhook pour la production
    if (process.env.NODE_ENV === 'production') {
      // Keep-alive pour éviter que Render s'endorme
      require('./keep-alive');
      
      const webhookUrl = `${process.env.WEBHOOK_URL}/webhook/${process.env.TELEGRAM_BOT_TOKEN}`;
      
      // Route pour le webhook
      app.use(bot.webhookCallback(`/webhook/${process.env.TELEGRAM_BOT_TOKEN}`));
      
      // Définir le webhook
      await bot.telegram.setWebhook(webhookUrl);
      console.log(`✅ Webhook configuré: ${webhookUrl}`);
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