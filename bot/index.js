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
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
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

// Handler générique pour debug des callbacks
bot.on('callback_query', (ctx, next) => {
  console.log(`🔄 Callback reçu: ${ctx.callbackQuery.data}`);
  console.log(`👤 User ID: ${ctx.from.id}, Chat ID: ${ctx.chat.id}`);
  console.log(`📝 Message ID: ${ctx.callbackQuery.message?.message_id}`);
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

// Liker une boutique
bot.action(/^like_([a-f\d]{24})$/, async (ctx) => {
  try {
    const plugId = ctx.match[1];
    const userId = ctx.from.id;
    
    console.log(`User ${userId} wants to like plug ${plugId}`);
    
    // Vérifier si la boutique existe
    const Plug = require('./src/models/Plug');
    const plug = await Plug.findById(plugId);
    
    if (!plug) {
      return ctx.answerCbQuery('❌ Boutique non trouvée');
    }
    
    const hasLiked = plug.likedBy.includes(userId);
    const action = hasLiked ? 'unlike' : 'like';
    
    // Mettre à jour les likes
    if (action === 'like') {
      plug.likedBy.push(userId);
      plug.likes += 1;
      await plug.save();
      await ctx.answerCbQuery(`❤️ Vous avez liké ${plug.name} ! (${plug.likes} likes)`);
    } else {
      plug.likedBy = plug.likedBy.filter(id => id !== userId);
      plug.likes -= 1;
      await plug.save();
      await ctx.answerCbQuery(`💔 Like retiré de ${plug.name} (${plug.likes} likes)`);
    }
    
    // Mettre à jour le clavier avec le nouveau statut
    const { createPlugKeyboard } = require('./src/utils/keyboards');
    const newKeyboard = createPlugKeyboard(plug, 'top_plugs');
    
    try {
      await ctx.editMessageReplyMarkup(newKeyboard.reply_markup);
    } catch (error) {
      // Ignore si le message n'a pas changé
      console.log('Keyboard update skipped');
    }
    
  } catch (error) {
    console.error('Erreur like boutique:', error);
    await ctx.answerCbQuery('❌ Erreur lors du like');
  }
});

// Callback ignoré (page actuelle)
bot.action('current_page', handleIgnoredCallback);

// Gestion des erreurs du bot
bot.catch((err, ctx) => {
  console.error('Erreur bot:', err);
  ctx.reply('❌ Une erreur est survenue, veuillez réessayer.').catch(() => {});
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
    
    if (!password) {
      console.log('❌ Aucun password fourni');
      return res.status(401).json({ error: 'Token d\'authentification manquant' });
    }
    
    if (password !== expectedPassword) {
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
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Last-Modified': new Date().toUTCString()
    });
    
    res.json(publicConfig);
  } catch (error) {
    console.error('❌ Erreur récupération config publique:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour recharger la configuration du bot
app.post('/api/bot/reload', authenticateAdmin, async (req, res) => {
  try {
    await reloadBotConfig();
    res.json({ 
      success: true, 
      message: 'Configuration du bot rechargée avec succès',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur reload config:', error);
    res.status(500).json({ error: 'Erreur lors du rechargement de la configuration' });
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
    const config = await Config.findById('main');
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
    
    // Nettoyer les données undefined/null de manière récursive
    const cleanRecursive = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(cleanRecursive).filter(item => item !== null && item !== undefined);
      } else if (obj !== null && typeof obj === 'object') {
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
    console.log('📝 Données après nettoyage:', Object.keys(finalData));
    
    // Tentative de mise à jour avec gestion d'erreur détaillée
    console.log('💾 Tentative de sauvegarde en base...');
    const config = await Config.findByIdAndUpdate('main', finalData, { 
      new: true, 
      upsert: true,
      runValidators: false,
      strict: false  // Permet les champs non définis dans le schéma
    });
    
    if (!config) {
      throw new Error('Échec de la mise à jour - aucun document retourné');
    }
    
    console.log('✅ Configuration mise à jour avec succès');
    console.log('📊 ID du document:', config._id);
    
    // Recharger la configuration en cache
    try {
      await reloadBotConfig();
      console.log('🔄 Cache de configuration rechargé');
    } catch (cacheError) {
      console.error('⚠️ Erreur rechargement cache (non critique):', cacheError.message);
    }
    
    // Headers anti-cache pour forcer la synchronisation
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Last-Modified': new Date().toUTCString(),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    
    res.json(config);
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