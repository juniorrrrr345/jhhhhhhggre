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
      // Compter TOUS les utilisateurs qui ont utilisé le bot (pas seulement les actifs)
      userCount = await User.countDocuments({});
      shopCount = await Plug.countDocuments({ isActive: true });
      console.log(`📊 Statistiques message d'accueil: ${userCount} utilisateurs au total, ${shopCount} boutiques`);
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
    
    // Gérer le singulier/pluriel pour les utilisateurs
    let activeUsersText = getTranslation('messages_activeUsers', currentLang, customTranslations);
    if (userCount === 1) {
      // Adapter au singulier selon la langue
      const singularUsers = {
        'fr': 'utilisateur',
        'en': 'user',
        'it': 'utente',
        'es': 'usuario',
        'de': 'Benutzer'
      };
      activeUsersText = singularUsers[currentLang] || activeUsersText;
    } else {
      // Pluriel sans le mot "actifs"
      const pluralUsers = {
        'fr': 'utilisateurs',
        'en': 'users',
        'it': 'utenti',
        'es': 'usuarios',
        'de': 'Benutzer'
      };
      activeUsersText = pluralUsers[currentLang] || activeUsersText;
    }
    
    // Gérer le singulier/pluriel pour les boutiques
    let availableShopsText = getTranslation('messages_availableShops', currentLang, customTranslations);
    if (shopCount === 1) {
      // Adapter au singulier selon la langue
      const singularShops = {
        'fr': 'boutique disponible',
        'en': 'available shop',
        'it': 'negozio disponibile',
        'es': 'tienda disponible',
        'de': 'Shop verfügbar'
      };
      availableShopsText = singularShops[currentLang] || availableShopsText;
    }
    
    let welcomeMessage = `${baseMessage}\n\n📊 **${userCount}** ${activeUsersText}\n🏪 **${shopCount}** 🔌`;
    
    console.log(`📝 Message d'accueil ACTUEL construit:`, welcomeMessage.substring(0, 100) + '...');
    
    // Ajouter l'horodatage si demandé (pour refresh)
    if (includeTimestamp) {
      const refreshedAtText = getTranslation('messages_refreshedAt', currentLang, customTranslations);
      
      // Formatter l'heure selon la langue et le fuseau horaire du pays
      const localeTimezoneMap = {
        'fr': { locale: 'fr-FR', timezone: 'Europe/Paris' },
        'en': { locale: 'en-GB', timezone: 'Europe/London' }, // UK time pour l'anglais
        'it': { locale: 'it-IT', timezone: 'Europe/Rome' },
        'es': { locale: 'es-ES', timezone: 'Europe/Madrid' },
        'de': { locale: 'de-DE', timezone: 'Europe/Berlin' }
      };
      
      const config = localeTimezoneMap[currentLang] || localeTimezoneMap['fr'];
      const timestamp = new Date().toLocaleTimeString(config.locale, { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: config.timezone
      });
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