// Configuration centralisée des APIs
export const API_CONFIG = {
  // URL principale du bot
  PRIMARY_URL: 'https://safepluglink-6hzr.onrender.com',
  
  // URLs de fallback
  FALLBACK_URLS: [
    'https://findyourplug-main.onrender.com',
    'https://findyourplug-bot.onrender.com',
    'https://bot-telegram-render.onrender.com'
  ],
  
  // Timeouts
  TIMEOUTS: {
    DEFAULT: 5000,
    LONG: 10000,
    IMAGE: 15000
  },
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
    BACKOFF_MULTIPLIER: 2
  },
  
  // Cache configuration
  CACHE: {
    DEFAULT_TTL: 60000, // 1 minute
    CONFIG_TTL: 300000, // 5 minutes
    PLUGS_TTL: 30000, // 30 secondes
    IMAGE_TTL: 3600000 // 1 heure
  }
};

// Obtenir la meilleure URL disponible
export const getBestApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 
         process.env.API_BASE_URL || 
         API_CONFIG.PRIMARY_URL;
};

// Vérifier si une URL est accessible
export const checkUrlHealth = async (url) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Obtenir une URL fonctionnelle
export const getWorkingUrl = async () => {
  const primaryUrl = getBestApiUrl();
  
  // Essayer d'abord l'URL principale
  if (await checkUrlHealth(primaryUrl)) {
    return primaryUrl;
  }
  
  // Essayer les URLs de fallback
  for (const url of API_CONFIG.FALLBACK_URLS) {
    if (await checkUrlHealth(url)) {
      console.log(`🔄 Basculement sur URL de fallback: ${url}`);
      return url;
    }
  }
  
  // Si aucune URL ne fonctionne, retourner la principale
  console.warn('⚠️ Aucune URL API accessible, utilisation de l\'URL par défaut');
  return primaryUrl;
};