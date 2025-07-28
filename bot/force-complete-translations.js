const mongoose = require('mongoose');

// Connexion MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://admin:lCGYmBzwZwkpTgvT@tesye.qazpla.mongodb.net/testdatabase?retryWrites=true&w=majority';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error);
    process.exit(1);
  }
};

// Schema Config
const configSchema = new mongoose.Schema({
  _id: String,
  buttons: Object,
  botTexts: Object,
  languages: Object,
  socialMediaList: Array
}, { collection: 'configs' });

const Config = mongoose.model('Config', configSchema);

// TOUTES LES TRADUCTIONS COMPLETES
const completeTranslations = {
  // Menu principal
  'menu_topPlugs': {
    fr: 'VOTER POUR VOTRE PLUG 🗳️',
    en: 'VOTE FOR YOUR PLUG 🗳️',
    it: 'VOTA PER IL TUO PLUG 🗳️',
    es: 'VOTA POR TU PLUG 🗳️',
    de: 'STIMME FÜR DEINEN PLUG 🗳️'
  },
  'menu_contact': {
    fr: '📞 Contact',
    en: '📞 Contact',
    it: '📞 Contatto',
    es: '📞 Contacto',
    de: '📞 Kontakt'
  },
  'menu_info': {
    fr: 'ℹ️ Info',
    en: 'ℹ️ Info',
    it: 'ℹ️ Informazioni',
    es: 'ℹ️ Información',
    de: 'ℹ️ Informationen'
  },
  'menu_inscription': {
    fr: '📋 Inscription',
    en: '📋 Registration',
    it: '📋 Registrazione',
    es: '📋 Inscripción',
    de: '📋 Anmeldung'
  },
  'menu_changeLanguage': {
    fr: '🗣️ Changer de langue',
    en: '🗣️ Change language',
    it: '🗣️ Cambia lingua',
    es: '🗣️ Cambiar idioma',
    de: '🗣️ Sprache ändern'
  },
  'menu_refresh': {
    fr: '🔄 Actualiser',
    en: '🔄 Refresh',
    it: '🔄 Aggiorna',
    es: '🔄 Actualizar',
    de: '🔄 Aktualisieren'
  },
  'menu_language': {
    fr: '🌍 Langue',
    en: '🌍 Language',
    it: '🌍 Lingua',
    es: '🌍 Idioma',
    de: '🌍 Sprache'
  },
  'menu_selectLanguage': {
    fr: 'Sélectionnez votre langue préférée :',
    en: 'Select your preferred language:',
    it: 'Seleziona la tua lingua preferita:',
    es: 'Selecciona tu idioma preferido:',
    de: 'Wählen Sie Ihre bevorzugte Sprache:'
  },
  
  // Messages
  'messages_welcome': {
    fr: 'Bienvenue sur FindYourPlug! Explorez nos services.',
    en: 'Welcome to FindYourPlug! Explore our services.',
    it: 'Benvenuto su FindYourPlug! Esplora i nostri servizi.',
    es: 'Bienvenido a FindYourPlug! Explora nuestros servicios.',
    de: 'Willkommen bei FindYourPlug! Entdecken Sie unsere Services.'
  },
  'messages_topPlugsHelp': {
    fr: 'Comment ça marche ?',
    en: 'How does it work?',
    it: 'Come funziona?',
    es: '¿Cómo funciona?',
    de: 'Wie funktioniert es?'
  },
  'messages_selectCountry': {
    fr: 'Choisissez un pays 🌍',
    en: 'Choose a country 🌍',
    it: 'Scegli un paese 🌍',
    es: 'Elige un país 🌍',
    de: 'Wählen Sie ein Land 🌍'
  },
  'messages_findShops': {
    fr: 'Trouvez les boutiques dans votre zone !',
    en: 'Find shops in your area!',
    it: 'Trova negozi nella tua zona!',
    es: '¡Encuentra tiendas en tu zona!',
    de: 'Finden Sie Geschäfte in Ihrer Nähe!'
  },
  'messages_sortedByVotes': {
    fr: 'Triés par nombre de votes',
    en: 'Sorted by number of votes',
    it: 'Ordinati per numero di voti',
    es: 'Ordenados por número de votos',
    de: 'Sortiert nach Anzahl der Stimmen'
  },
  'messages_shopsAvailable': {
    fr: 'boutiques disponibles',
    en: 'shops available',
    it: 'negozi disponibili',
    es: 'tiendas disponibles',
    de: 'Shops verfügbar'
  },
  'messages_noShops': {
    fr: '❌ Aucun plug disponible pour le moment.',
    en: '❌ No plugs available at the moment.',
    it: '❌ Nessun negozio disponibile al momento.',
    es: '❌ No hay tiendas disponibles en este momento.',
    de: '❌ Momentan sind keine Shops verfügbar.'
  },
  'messages_noPlugsInPostalCode': {
    fr: 'Désolé Nous Avons Pas De Plugs 😕',
    en: 'Sorry We Have No Plugs 😕',
    it: 'Spiacenti Non Abbiamo Negozi 😕',
    es: 'Lo Siento No Tenemos Tiendas 😕',
    de: 'Entschuldigung Keine Shops 😕'
  },
  
  // Services
  'service_delivery': {
    fr: 'Livraison',
    en: 'Delivery',
    it: 'Consegna',
    es: 'Entrega',
    de: 'Lieferung'
  },
  'service_meetup': {
    fr: 'Meetup',
    en: 'Meetup',
    it: 'Incontro',
    es: 'Encuentro',
    de: 'Treffen'
  },
  'service_postal': {
    fr: 'Envoi postal',
    en: 'Postal shipping',
    it: 'Spedizione postale',
    es: 'Envío postal',
    de: 'Postversand'
  },
  
  // Navigation
  'back_to_menu': {
    fr: 'Retour au menu',
    en: 'Back to menu',
    it: 'Torna al menu',
    es: 'Volver al menú',
    de: 'Zurück zum Menü'
  },
  'back_to_shops': {
    fr: 'Retour aux boutiques',
    en: 'Back to shops',
    it: 'Torna ai negozi',
    es: 'Volver a las tiendas',
    de: 'Zurück zu den Geschäften'
  },
  'back_to_filters': {
    fr: 'Retour aux boutiques',
    en: 'Back to shops',
    it: 'Torna ai negozi',
    es: 'Volver a las tiendas',
    de: 'Zurück zu den Geschäften'
  },
  
  // Erreurs
  'error_loading': {
    fr: 'Erreur lors du chargement',
    en: 'Error loading',
    it: 'Errore durante il caricamento',
    es: 'Error al cargar',
    de: 'Fehler beim Laden'
  },
  'error_filtering': {
    fr: '❌ Erreur lors du filtrage',
    en: '❌ Error filtering',
    it: '❌ Errore nel filtraggio',
    es: '❌ Error al filtrar',
    de: '❌ Fehler beim Filtern'
  },
  
  // Boutiques
  'vote_for_shop': {
    fr: 'Voter Pour ce Plug',
    en: 'Vote for this Plug',
    it: 'Vota per questo negozio',
    es: 'Votar por esta tienda',
    de: 'Für diesen Shop stimmen'
  },
  'already_voted': {
    fr: 'Déjà voté',
    en: 'Already voted',
    it: 'Già votato',
    es: 'Ya votado',
    de: 'Bereits abgestimmt'
  },
  'vote_count_singular': {
    fr: 'vote',
    en: 'vote',
    it: 'voto',
    es: 'voto',
    de: 'Stimme'
  },
  'vote_count_plural': {
    fr: 'votes',
    en: 'votes',
    it: 'voti',
    es: 'votos',
    de: 'Stimmen'
  }
};

// Fonction pour mettre à jour TOUTES les traductions
const forceCompleteTranslations = async () => {
  try {
    console.log('🔧 Mise à jour COMPLÈTE de toutes les traductions...');
    
    const config = await Config.findById('main');
    if (!config) {
      console.log('❌ Configuration non trouvée');
      return;
    }
    
    // Initialiser les langues si nécessaire
    if (!config.languages) {
      config.languages = {
        enabled: true,
        currentLanguage: 'fr',
        availableLanguages: [
          { code: 'fr', name: 'Français', flag: '🇫🇷', enabled: true },
          { code: 'en', name: 'English', flag: '🇬🇧', enabled: true },
          { code: 'it', name: 'Italiano', flag: '🇮🇹', enabled: true },
          { code: 'es', name: 'Español', flag: '🇪🇸', enabled: true },
          { code: 'de', name: 'Deutsch', flag: '🇩🇪', enabled: true }
        ],
        translations: new Map()
      };
    }
    
    if (!config.languages.translations) {
      config.languages.translations = new Map();
    }
    
    // Ajouter TOUTES les traductions
    let translationsAdded = 0;
    Object.entries(completeTranslations).forEach(([key, langs]) => {
      const langMap = new Map();
      Object.entries(langs).forEach(([langCode, text]) => {
        langMap.set(langCode, text);
      });
      config.languages.translations.set(key, langMap);
      translationsAdded++;
      console.log(`✅ ${key} ajouté avec ${Object.keys(langs).length} langues`);
    });
    
    // Mettre à jour les configurations des boutons
    if (!config.buttons) config.buttons = {};
    if (!config.buttons.topPlugs) config.buttons.topPlugs = {};
    config.buttons.topPlugs.text = 'VOTER POUR VOTRE PLUG 🗳️';
    config.buttons.topPlugs.enabled = true;
    
    if (!config.buttons.contact) config.buttons.contact = {};
    config.buttons.contact.text = '📞 Contact';
    config.buttons.contact.enabled = true;
    
    if (!config.buttons.info) config.buttons.info = {};
    config.buttons.info.text = 'ℹ️ Info';
    config.buttons.info.enabled = true;
    
    // Mettre à jour les textes du bot
    if (!config.botTexts) config.botTexts = {};
    config.botTexts.topPlugsTitle = 'VOTER POUR VOTRE PLUG 🗳️';
    config.botTexts.welcomeMessage = 'Bienvenue sur FindYourPlug! Explorez nos services.';
    
    // Sauvegarder
    await config.save();
    console.log('🚀 Configuration sauvegardée');
    
    console.log('\n📊 Résumé :');
    console.log(`- ${translationsAdded} clés de traduction ajoutées`);
    console.log(`- ${config.languages.availableLanguages.length} langues supportées`);
    console.log('- Boutons principaux configurés');
    console.log('- Textes du bot mis à jour');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Déconnexion MongoDB');
  }
};

// Exécuter la mise à jour
const main = async () => {
  await connectDB();
  await forceCompleteTranslations();
};

main();