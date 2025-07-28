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

    // Utiliser le message du panel admin et le traduire automatiquement selon la langue
    let baseMessage = config?.welcome?.text || getTranslation('messages_welcome', currentLang, customTranslations);
    
    // Si on a un message personnalisé du panel admin, le traduire selon la langue choisie
    if (config?.welcome?.text && currentLang !== 'fr') {
      const translations = {
        'en': {
          'Bienvenue sur FindYourPlug! Explorez nos services.': 'Welcome to FindYourPlug! Explore our services.',
          'Cliquer sur notre MINI-APP 🔌 pour trouver un plug près de chez vous': 'Click on our MINI-APP 🔌 to find a plug near you'
        },
        'it': {
          'Bienvenue sur FindYourPlug! Explorez nos services.': 'Benvenuto su FindYourPlug! Esplora i nostri servizi.',
          'Cliquer sur notre MINI-APP 🔌 pour trouver un plug près de chez vous': 'Clicca sulla nostra MINI-APP 🔌 per trovare un plug vicino a te'
        },
        'es': {
          'Bienvenue sur FindYourPlug! Explorez nos services.': 'Bienvenido a FindYourPlug! Explora nuestros servicios.',
          'Cliquer sur notre MINI-APP 🔌 pour trouver un plug près de chez vous': 'Haz clic en nuestra MINI-APP 🔌 para encontrar un plug cerca de ti'
        },
        'de': {
          'Bienvenue sur FindYourPlug! Explorez nos services.': 'Willkommen bei FindYourPlug! Entdecken Sie unsere Services.',
          'Cliquer sur notre MINI-APP 🔌 pour trouver un plug près de chez vous': 'Klicken Sie auf unsere MINI-APP 🔌, um einen Plug in Ihrer Nähe zu finden'
        }
      };
      
      // Traduire le message si une traduction existe
      if (translations[currentLang]) {
        for (const [french, translated] of Object.entries(translations[currentLang])) {
          baseMessage = baseMessage.replace(french, translated);
        }
      }
    }
    const activeUsersText = getTranslation('messages_activeUsers', currentLang, customTranslations);
    const availableShopsText = getTranslation('messages_availableShops', currentLang, customTranslations);
    
    let welcomeMessage = `${baseMessage}\n\n📊 **${userCount}** ${activeUsersText}\n🏪 **${shopCount}** ${availableShopsText}`;
    
    console.log(`📝 Message d'accueil ACTUEL construit:`, welcomeMessage.substring(0, 100) + '...');
    
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