const Config = require('../models/Config');

let configCache = null;

/**
 * TOUJOURS récupérer la configuration ACTUELLE fraîche de la base de données
 * Cette fonction garantit que nous utilisons toujours la dernière configuration
 * @param {boolean} forceRefresh - Force le rafraîchissement même si le cache existe
 * @returns {Promise<Object>} Configuration actuelle
 */
const getFreshConfig = async (forceRefresh = true) => {
  try {
    // TOUJOURS forcer le refresh pour garantir la configuration ACTUELLE
    if (forceRefresh || !configCache) {
      console.log('🔄 Récupération de la configuration ACTUELLE depuis la DB');
      configCache = await Config.findById('main');
      
      if (!configCache) {
        console.log('❌ Configuration principale non trouvée, création par défaut');
        configCache = new Config({
          _id: 'main',
          languages: {
            currentLanguage: 'fr',
            translations: {}
          },
          welcome: {
            text: 'Bienvenue sur FindYourPlug! Explorez nos services.'
          }
        });
        await configCache.save();
      }
      
      console.log(`✅ Configuration ACTUELLE récupérée (langue: ${configCache?.languages?.currentLanguage || 'fr'})`);
    }
    
    return configCache;
  } catch (error) {
    console.error('❌ Erreur récupération config ACTUELLE:', error);
    return configCache; // Retourner l'ancienne si erreur
  }
};

/**
 * Force la mise à jour du cache de configuration
 * À utiliser après une modification de configuration
 */
const clearConfigCache = () => {
  console.log('🗑️ Cache de configuration vidé - prochaine récupération sera fraîche');
  configCache = null;
};

/**
 * Récupère la langue ACTUELLE de la configuration
 * @returns {Promise<string>} Langue actuelle
 */
const getCurrentLanguage = async () => {
  try {
    const config = await getFreshConfig(true);
    return config?.languages?.currentLanguage || 'fr';
  } catch (error) {
    console.error('❌ Erreur récupération langue actuelle:', error);
    return 'fr';
  }
};

/**
 * Récupère les traductions ACTUELLES
 * @returns {Promise<Object>} Traductions personnalisées actuelles
 */
const getCurrentTranslations = async () => {
  try {
    const config = await getFreshConfig(true);
    return config?.languages?.translations || {};
  } catch (error) {
    console.error('❌ Erreur récupération traductions actuelles:', error);
    return {};
  }
};

module.exports = {
  getFreshConfig,
  clearConfigCache,
  getCurrentLanguage,
  getCurrentTranslations
};