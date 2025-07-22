const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Configuration CORS sécurisée
const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les domaines Vercel et localhost
    const allowedOrigins = [
      /^https:\/\/.*\.vercel\.app$/,
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3000',
      'https://localhost:3001'
    ];
    
    // Autoriser les requêtes sans origin (Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(pattern => {
      if (typeof pattern === 'string') return pattern === origin;
      return pattern.test(origin);
    });
    
    callback(null, isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 heures
};

// Rate limiting avancé
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Utiliser IP + User-Agent pour éviter le bypass
    return req.ip + ':' + (req.get('User-Agent') || 'unknown');
  }
});

// Rate limits spécifiques
const limits = {
  general: createRateLimit(15 * 60 * 1000, 100, 'Trop de requêtes générales'),
  auth: createRateLimit(15 * 60 * 1000, 10, 'Trop de tentatives d\'authentification'),
  api: createRateLimit(15 * 60 * 1000, 50, 'Trop de requêtes API'),
  upload: createRateLimit(60 * 60 * 1000, 5, 'Trop d\'uploads')
};

// Configuration Helmet sécurisée
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "cloudinary.com", "*.cloudinary.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "api.telegram.org"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Middleware de validation d'entrée
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/[<>]/g, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (let key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  
  next();
};

// Middleware de logging sécurisé
const securityLogger = (req, res, next) => {
  const start = Date.now();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: ip,
      userAgent: userAgent.substring(0, 100),
      statusCode: res.statusCode,
      duration: duration
    };
    
    // Log uniquement les erreurs et requêtes suspectes
    if (res.statusCode >= 400 || duration > 5000) {
      console.log('🚨 Requête suspecte:', JSON.stringify(logData));
    }
  });
  
  next();
};

// Middleware anti-DDoS simple
const antiDDoS = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requêtes par minute par IP
  message: { error: 'Trop de requêtes, ralentissez' },
  skip: (req) => {
    // Skip pour les adresses IP locales
    const ip = req.ip;
    return ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.');
  }
});

module.exports = {
  corsOptions,
  limits,
  helmetConfig,
  sanitizeInput,
  securityLogger,
  antiDDoS,
  compression: compression()
};