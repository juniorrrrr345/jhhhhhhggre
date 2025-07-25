const Config = require('../models/Config');

// Variables de cache partagées
let configCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 secondes

// Fonction pour obtenir la config fraîche
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
    console.log('🔄 Config rechargée depuis la DB via configHelper');
    console.log('📝 Welcome text chargé:', configCache?.welcome?.text?.substring(0, 50) + '...');
    console.log('📞 Contact content chargé:', configCache?.buttons?.contact?.content?.substring(0, 50) + '...');
    console.log('ℹ️ Info content chargé:', configCache?.buttons?.info?.content?.substring(0, 50) + '...');
    return configCache;
  } catch (error) {
    console.error('❌ Erreur chargement config fraîche:', error);
    return configCache; // Retourner l'ancienne si erreur
  }
};

// Fonction pour invalider le cache
const invalidateConfigCache = () => {
  configCache = null;
  cacheTimestamp = 0;
  console.log('🗑️ Cache config invalidé');
};

// Fonction pour forcer un rechargement immédiat
const forceReloadConfig = async () => {
  invalidateConfigCache();
  return await getFreshConfig();
};

module.exports = {
  getFreshConfig,
  invalidateConfigCache,
  forceReloadConfig
};