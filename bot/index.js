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

// Initialisation
const app = express();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://jhhhhhhggre.vercel.app',
    /\.vercel\.app$/,
    /\.onrender\.com$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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

// Commande /start
bot.command('start', handleStart);

// Commande /admin
bot.command('admin', async (ctx) => {
  const userId = ctx.from.id;
  const adminId = 7670522278; // Votre ID admin
  
  if (userId === adminId) {
    const adminUrl = process.env.ADMIN_URL || 'https://admin-panel-bot.vercel.app';
    await ctx.reply(
      `🔑 **Accès Admin Autorisé**\n\n` +
      `👋 Bonjour Admin !\n\n` +
      `🌐 **Panel Admin :** [Cliquer ici](${adminUrl})\n\n` +
      `🔒 **Mot de passe :** \`${process.env.ADMIN_PASSWORD || 'JuniorAdmon123'}\`\n\n` +
      `💡 *Cliquez sur le lien pour accéder au panel d'administration moderne*\n\n` +
      `✨ **Fonctionnalités :**\n` +
      `• 📊 Dashboard avec statistiques\n` +
      `• 🏪 Gestion des boutiques\n` +
      `• ⚙️ Configuration du bot\n` +
      `• 📱 Interface responsive`,
      { 
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      }
    );
  } else {
    await ctx.reply('❌ Accès refusé. Vous n\'êtes pas autorisé à accéder au panel admin.');
  }
});

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

// Pagination
bot.action(/^page_(.+)_(\d+)$/, (ctx) => {
  const context = ctx.match[1];
  const page = parseInt(ctx.match[2]);
  
  if (context === 'all') {
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

// Détails d'un plug (ancien format pour compatibilité)
bot.action(/^plug_([a-f\d]{24})$/, (ctx) => {
  const plugId = ctx.match[1];
  return handlePlugDetails(ctx, plugId, 'top_plugs');
});

// Détails d'un plug avec contexte
bot.action(/^plug_([a-f\d]{24})_from_(.+)$/, (ctx) => {
  const plugId = ctx.match[1];
  const context = ctx.match[2];
  return handlePlugDetails(ctx, plugId, context);
});

// Détails d'un service d'un plug
bot.action(/^plug_service_([a-f\d]{24})_(.+)$/, (ctx) => {
  const plugId = ctx.match[1];
  const serviceType = ctx.match[2];
  return handlePlugServiceDetails(ctx, plugId, serviceType);
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

// Middleware d'authentification
const authenticateAdmin = (req, res, next) => {
  const password = req.headers.authorization?.replace('Bearer ', '');
  
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  
  next();
};

// ===== ROUTES CONFIGURATION =====

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
    const config = await Config.findByIdAndUpdate('main', req.body, { 
      new: true, 
      upsert: true 
    });
    res.json(config);
  } catch (error) {
    console.error('Erreur mise à jour config:', error);
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
    const plug = new Plug(req.body);
    await plug.save();
    res.status(201).json(plug);
  } catch (error) {
    console.error('Erreur création plug:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour un plug
app.put('/api/plugs/:id', authenticateAdmin, async (req, res) => {
  try {
    const plug = await Plug.findByIdAndUpdate(req.params.id, req.body, { 
      new: true 
    });
    if (!plug) {
      return res.status(404).json({ error: 'Plug non trouvé' });
    }
    res.json(plug);
  } catch (error) {
    console.error('Erreur mise à jour plug:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer un plug
app.delete('/api/plugs/:id', authenticateAdmin, async (req, res) => {
  try {
    const plug = await Plug.findByIdAndDelete(req.params.id);
    if (!plug) {
      return res.status(404).json({ error: 'Plug non trouvé' });
    }
    res.json({ message: 'Plug supprimé' });
  } catch (error) {
    console.error('Erreur suppression plug:', error);
    res.status(500).json({ error: 'Erreur serveur' });
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