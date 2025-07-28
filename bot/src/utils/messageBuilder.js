const { getTranslation } = require('./translations');

/**
 * Construit le message d'accueil complet avec statistiques dans la langue spécifiée
 * @param {Object} config - Configuration du bot
 * @param {string} currentLang - Langue actuelle
 * @param {Object} customTranslations - Traductions personnalisées
 * @param {boolean} includeTimestamp - Inclure l'horodatage (pour refresh)
 * @returns {Promise<string>} Message d'accueil formaté
 */
const buildWelcomeMessage = async (config, currentLang = 'fr', customTranslations = null, includeTimestamp = false) => {
  try {
    // Récupérer les statistiques
    let userCount = 0;
    let shopCount = 0;
    
    try {
      const User = require('../models/User');
      const Plug = require('../models/Plug');
      userCount = await User.countDocuments({ isActive: true });
      shopCount = await Plug.countDocuments({ isActive: true });
      console.log(`📊 Statistiques message d'accueil: ${userCount} utilisateurs, ${shopCount} boutiques`);
    } catch (statsError) {
      console.log('⚠️ Erreur récupération statistiques:', statsError.message);
    }

    // TOUJOURS utiliser les traductions selon la langue choisie
    const baseMessage = getTranslation('messages_welcome', currentLang, customTranslations);
    const activeUsersText = getTranslation('messages_activeUsers', currentLang, customTranslations);
    const availableShopsText = getTranslation('messages_availableShops', currentLang, customTranslations);
    
    let welcomeMessage = `${baseMessage}\n\n📊 **${userCount}** ${activeUsersText}\n🏪 **${shopCount}** ${availableShopsText}`;
    
    console.log(`📝 Message d'accueil ACTUEL construit en ${currentLang}:`, welcomeMessage.substring(0, 100) + '...');
    
    // Ajouter l'horodatage si demandé (pour refresh)
    if (includeTimestamp) {
      const refreshedAtText = getTranslation('messages_refreshedAt', currentLang, customTranslations);
      
      // Formatter l'heure selon la langue choisie
      const localeMap = {
        'fr': 'fr-FR',
        'en': 'en-US', 
        'it': 'it-IT',
        'es': 'es-ES',
        'de': 'de-DE'
      };
      
      const locale = localeMap[currentLang] || 'fr-FR';
      const timestamp = new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
      welcomeMessage += `\n\n🔄 *${refreshedAtText} ${timestamp}*`;
    }
    
    return welcomeMessage;
  } catch (error) {
    console.error('❌ Erreur construction message d\'accueil:', error);
    // Fallback simple
    return getTranslation('messages_welcome', currentLang, customTranslations) || 'Bienvenue sur FindYourPlug!';
  }
};

module.exports = {
  buildWelcomeMessage
};