const translations = {
  // Configuration des langues
  languages: {
    fr: { name: 'Français', flag: '🇫🇷', code: 'fr' },
    en: { name: 'English', flag: '🇬🇧', code: 'en' },
    it: { name: 'Italiano', flag: '🇮🇹', code: 'it' },
    es: { name: 'Español', flag: '🇪🇸', code: 'es' },
    de: { name: 'Deutsch', flag: '🇩🇪', code: 'de' }
  },

  // Traductions par défaut
  defaultTranslations: {
    // === MENU PRINCIPAL ===
    'menu_topPlugs': {
      fr: '🔝 Top Des Plugs',
      en: '🔝 Top Plugs',
      it: '🔝 Top Negozi',
      es: '🔝 Top Tiendas',
      de: '🔝 Top Shops'
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
      it: 'ℹ️ Info',
      es: 'ℹ️ Info',
      de: 'ℹ️ Info'
    },
    'menu_becomeDealer': {
      fr: '💼 Devenir Plug',
      en: '💼 Become Dealer',
      it: '💼 Diventa Rivenditore',
      es: '💼 Ser Distribuidor',
      de: '💼 Händler werden'
    },
    'menu_language': {
      fr: '🌍 Langue',
      en: '🌍 Language',
      it: '🌍 Lingua',
      es: '🌍 Idioma',
      de: '🌍 Sprache'
    },
    'menu_translation': {
      fr: '🌍 Traduction',
      en: '🌍 Translation',
      it: '🌍 Traduzione',
      es: '🌍 Traducción',
      de: '🌍 Übersetzung'
    },
    'menu_main': {
      fr: '🏠 Menu principal',
      en: '🏠 Main menu',
      it: '🏠 Menu principale',
      es: '🏠 Menú principal',
      de: '🏠 Hauptmenü'
    },
    'menu_delivery': {
      fr: '🚚 Livraison',
      en: '🚚 Delivery',
      it: '🚚 Consegna',
      es: '🚚 Entrega',
      de: '🚚 Lieferung'
    },

    // === FILTRES TOP PLUGS ===
    'filters_delivery': {
      fr: '📦 Livraison',
      en: '📦 Delivery',
      it: '📦 Consegna',
      es: '📦 Entrega',
      de: '📦 Lieferung'
    },
    'filters_meetup': {
      fr: '🤝 Meetup',
      en: '🤝 Meetup',
      it: '🤝 Incontro',
      es: '🤝 Encuentro',
      de: '🤝 Treffen'
    },
    'filters_postal': {
      fr: '📬 Envoi Postal',
      en: '📬 Postal Shipping',
      it: '📬 Spedizione Postale',
      es: '📬 Envío Postal',
      de: '📬 Postversand'
    },
    'filters_department': {
      fr: '📍 Département 🔁',
      en: '📍 State/Region 🔁',
      it: '📍 Regione 🔁',
      es: '📍 Provincia 🔁',
      de: '📍 Bundesland 🔁'
    },
    'filters_reset': {
      fr: '🔁 Réinitialiser les filtres',
      en: '🔁 Reset Filters',
      it: '🔁 Reimposta Filtri',
      es: '🔁 Reiniciar Filtros',
      de: '🔁 Filter zurücksetzen'
    },
    'filters_back': {
      fr: '🔙 Retour',
      en: '🔙 Back',
      it: '🔙 Indietro',
      es: '🔙 Volver',
      de: '🔙 Zurück'
    },

    // === MESSAGES ===
    'messages_welcome': {
      fr: 'FINDYOURPLUG\nMINI-APP TELEGRAM\nCHILL',
      en: 'FINDYOURPLUG\nTELEGRAM MINI-APP\nCHILL',
      it: 'FINDYOURPLUG\nMINI-APP TELEGRAM\nCHILL',
      es: 'FINDYOURPLUG\nMINI-APP TELEGRAM\nCHILL',
      de: 'FINDYOURPLUG\nTELEGRAM MINI-APP\nCHILL'
    },
    'messages_contactUs': {
      fr: 'Contactez-nous pour plus d\'informations.',
      en: 'Contact us for more information.',
      it: 'Contattaci per maggiori informazioni.',
      es: 'Contáctanos para más información.',
      de: 'Kontaktieren Sie uns für weitere Informationen.'
    },
    'messages_contactSocial': {
      fr: '📱 Nous contacter :',
      en: '📱 Contact us:',
      it: '📱 Contattaci:',
      es: '📱 Contáctanos:',
      de: '📱 Kontaktiere uns:'
    },
    'messages_noPlugs': {
      fr: '❌ Aucun plug disponible pour le moment.',
      en: '❌ No plugs available at the moment.',
      it: '❌ Nessun negozio disponibile al momento.',
      es: '❌ No hay tiendas disponibles en este momento.',
      de: '❌ Keine Shops verfügbar im Moment.'
    },
    'messages_shopsAvailable': {
      fr: 'boutiques disponibles',
      en: 'shops available',
      it: 'negozi disponibili',
      es: 'tiendas disponibles',
      de: 'Shops verfügbar'
    },
    'messages_sortedByVotes': {
      fr: 'Triés par nombre de votes',
      en: 'Sorted by number of votes',
      it: 'Ordinati per numero di voti',
      es: 'Ordenados por número de votos',
      de: 'Sortiert nach Anzahl der Stimmen'
    },
    'messages_noShops': {
      fr: '❌ Aucun plug disponible pour le moment.',
      en: '❌ No plugs available at the moment.',
      it: '❌ Nessun negozio disponibile al momento.',
      es: '❌ No hay tiendas disponibles en este momento.',
      de: '❌ Momentan sind keine Shops verfügbar.'
    },

    // === INSCRIPTION ===
    'registration.title': {
      fr: '🛠️ FORMULAIRE D\'INSCRIPTION – FindYourPlug',
      en: '🛠️ REGISTRATION FORM – FindYourPlug',
      it: '🛠️ MODULO DI REGISTRAZIONE – FindYourPlug',
      es: '🛠️ FORMULARIO DE REGISTRO – FindYourPlug',
      de: '🛠️ ANMELDEFORMULAR – FindYourPlug'
    },
    'registration.step1': {
      fr: '🟦 Étape 1 : Nom de Plug',
      en: '🟦 Step 1: Plug Name',
      it: '🟦 Fase 1: Nome Negozio',
      es: '🟦 Paso 1: Nombre de Tienda',
      de: '🟦 Schritt 1: Shop-Name'
    },
    'registration.letsStart': {
      fr: '📝 Commençons ton inscription sur FindYourPlug !',
      en: '📝 Let\'s start your registration on FindYourPlug!',
      it: '📝 Iniziamo la tua registrazione su FindYourPlug!',
      es: '📝 ¡Comencemos tu registro en FindYourPlug!',
      de: '📝 Beginnen wir deine Anmeldung bei FindYourPlug!'
    },
    'registration.plugNameQuestion': {
      fr: 'Quel est ton **nom de Plug** ?',
      en: 'What is your **Plug name**?',
      it: 'Qual è il tuo **nome del negozio**?',
      es: '¿Cuál es tu **nombre de tienda**?',
      de: 'Wie lautet dein **Shop-Name**?'
    },
    'registration.pendingTitle': {
      fr: '📝 **Demande en cours**',
      en: '📝 **Application in progress**',
      it: '📝 **Richiesta in corso**',
      es: '📝 **Solicitud en curso**',
      de: '📝 **Antrag in Bearbeitung**'
    },
    'registration.pendingMessage': {
      fr: 'Tu as déjà une demande d\'inscription en cours de traitement.',
      en: 'You already have a registration request being processed.',
      it: 'Hai già una richiesta di registrazione in elaborazione.',
      es: 'Ya tienes una solicitud de registro en proceso.',
      de: 'Du hast bereits eine Registrierungsanfrage in Bearbeitung.'
    },
    'registration.pendingStatus': {
      fr: 'Statut: ⏳ En attente',
      en: 'Status: ⏳ Pending',
      it: 'Stato: ⏳ In attesa',
      es: 'Estado: ⏳ Pendiente',
      de: 'Status: ⏳ Ausstehend'
    },
    'registration.pendingWait': {
      fr: 'Merci de patienter pendant que nos équipes examinent ta demande !',
      en: 'Please wait while our teams review your request!',
      it: 'Attendi mentre i nostri team esaminano la tua richiesta!',
      es: '¡Por favor espera mientras nuestros equipos revisan tu solicitud!',
      de: 'Bitte warte, während unsere Teams deine Anfrage prüfen!'
    },
    'registration.cancel': {
      fr: '❌ Annuler',
      en: '❌ Cancel',
      it: '❌ Annulla',
      es: '❌ Cancelar',
      de: '❌ Abbrechen'
    },
    'registration.backToMenu': {
      fr: '🔙 Retour au menu',
      en: '🔙 Back to menu',
      it: '🔙 Torna al menu',
      es: '🔙 Volver al menú',
      de: '🔙 Zurück zum Menü'
    },

    // === BOUTIQUE WEB ===
    'shop.title': {
      fr: 'FINDYOURPLUG',
      en: 'FINDYOURPLUG',
      it: 'FINDYOURPLUG',
      es: 'FINDYOURPLUG',
      de: 'FINDYOURPLUG'
    },
    'shop.loading': {
      fr: 'Chargement...',
      en: 'Loading...',
      it: 'Caricamento...',
      es: 'Cargando...',
      de: 'Laden...'
    },
    'shop.search': {
      fr: 'Rechercher',
      en: 'Search',
      it: 'Cerca',
      es: 'Buscar',
      de: 'Suchen'
    },
    'shop.home': {
      fr: 'Accueil',
      en: 'Home',
      it: 'Casa',
      es: 'Inicio',
      de: 'Startseite'
    },
    'shop.vip': {
      fr: 'VIP',
      en: 'VIP',
      it: 'VIP',
      es: 'VIP',
      de: 'VIP'
    },
    'shop.likes': {
      fr: 'votes',
      en: 'votes',
      it: 'voti',
      es: 'votos',
      de: 'Stimmen'
    }
  }
};

// Fonction pour obtenir la traduction
const getTranslation = (key, language = 'fr', customTranslations = null) => {
  // Vérifier d'abord les traductions personnalisées
  if (customTranslations && customTranslations.has && customTranslations.has(key)) {
    const customTrans = customTranslations.get(key);
    if (customTrans && customTrans.get && customTrans.get(language)) {
      return customTrans.get(language);
    }
  }
  
  // Fallback vers les traductions par défaut
  const defaultTrans = translations.defaultTranslations[key];
  if (defaultTrans && defaultTrans[language]) {
    return defaultTrans[language];
  }
  
  // Fallback vers français si langue pas trouvée
  if (defaultTrans && defaultTrans.fr) {
    return defaultTrans.fr;
  }
  
  // Fallback final : retourner la clé
  return key;
};

// Fonction pour créer le clavier de sélection de langue
const createLanguageKeyboard = (currentLanguage = 'fr') => {
  try {
    const { Markup } = require('telegraf');
    const buttons = [];
    
    // Vérifier que les traductions existent
    if (!translations || !translations.languages) {
      console.error('❌ Traductions non disponibles pour le clavier de langue');
      // Retourner un clavier minimal en cas d'erreur
      return Markup.inlineKeyboard([
        [Markup.button.callback('🇫🇷 Français', 'lang_fr')],
        [Markup.button.callback('🇬🇧 English', 'lang_en')],
        [Markup.button.callback('🔙 Retour', 'back_main')]
      ]);
    }
    
    console.log(`🌍 Création clavier langue, langue actuelle: ${currentLanguage}`);
    
    // Première ligne : drapeaux des langues
    const flagRow = [];
    Object.entries(translations.languages).forEach(([code, lang]) => {
      if (lang && lang.flag && lang.name) {
        const isSelected = code === currentLanguage;
        // Format: ✅ 🇫🇷 Français ou 🇫🇷 Français
        const buttonText = isSelected ? `✅ ${lang.flag} ${lang.name}` : `${lang.flag} ${lang.name}`;
        flagRow.push(Markup.button.callback(buttonText, `lang_${code}`));
        console.log(`🔤 Langue ${code}: ${buttonText} (sélectionnée: ${isSelected})`);
      }
    });
    
    // Vérifier qu'on a au moins un bouton
    if (flagRow.length === 0) {
      console.error('❌ Aucune langue disponible pour le clavier');
      // Retourner un clavier minimal en cas d'erreur
      return Markup.inlineKeyboard([
        [Markup.button.callback('🇫🇷 Français', 'lang_fr')],
        [Markup.button.callback('🇬🇧 English', 'lang_en')],
        [Markup.button.callback('🔙 Retour', 'back_main')]
      ]);
    }
    
    // Grouper par 2 boutons par ligne pour plus de lisibilité
    for (let i = 0; i < flagRow.length; i += 2) {
      buttons.push(flagRow.slice(i, i + 2));
    }
    
    // Ligne des boutons de navigation
    const navRow = [];
    
    // Bouton retour
    const backText = getTranslation('filters_back', currentLanguage) || '🔙 Retour';
    navRow.push(Markup.button.callback(backText, 'back_main'));
    
    // Bouton "Retour au menu" pour aller directement au menu principal avec la langue choisie
    const menuText = getTranslation('menu_main', currentLanguage) || '🏠 Menu principal';
    navRow.push(Markup.button.callback(menuText, 'goto_main_menu'));
    
    buttons.push(navRow);
    
    console.log(`✅ Clavier langue créé avec ${flagRow.length} langues`);
    return Markup.inlineKeyboard(buttons);
    
  } catch (error) {
    console.error('❌ Erreur création clavier langue:', error);
    // Retourner un clavier minimal en cas d'erreur
    return Markup.inlineKeyboard([
      [Markup.button.callback('🇫🇷 Français', 'lang_fr')],
      [Markup.button.callback('🇬🇧 English', 'lang_en')],
      [Markup.button.callback('🔙 Retour', 'back_main')]
    ]);
  }
};

// Fonction pour initialiser les traductions par défaut
const initializeDefaultTranslations = async (Config) => {
  try {
    console.log('🌍 Initialisation des traductions...');
    
    const config = await Config.findById('main');
    if (!config) {
      console.log('❌ Config non trouvée pour initialiser traductions');
      return;
    }

    // Initialiser la structure languages si elle n'existe pas
    if (!config.languages) {
      config.languages = {
        enabled: true, // Activer par défaut
        currentLanguage: 'fr',
        availableLanguages: Object.entries(translations.languages).map(([code, lang]) => ({
          code,
          name: lang.name,
          flag: lang.flag,
          enabled: true
        })),
        translations: new Map()
      };
    }
    
    // Ajouter toutes les traductions par défaut - SANS POINTS DANS LES CLÉS
    Object.entries(translations.defaultTranslations).forEach(([key, langs]) => {
      // Convertir les clés avec points en clés avec underscores si nécessaire
      const cleanKey = key.replace(/\./g, '_');
      
      if (!config.languages.translations.has(cleanKey)) {
        const langMap = new Map();
        Object.entries(langs).forEach(([langCode, text]) => {
          langMap.set(langCode, text);
        });
        config.languages.translations.set(cleanKey, langMap);
      }
    });
    
    await config.save();
    console.log('✅ Traductions par défaut initialisées');
    
  } catch (error) {
    console.error('❌ Erreur initialisation traductions:', error);
    console.log('✅ Traductions initialisées'); // Continuer même en cas d'erreur
  }
};

// Export
module.exports = {
  translations,
  getTranslation,
  createLanguageKeyboard,
  initializeDefaultTranslations
};