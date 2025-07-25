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

    // === SERVICES ===
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
    'services_available': {
      fr: 'Services disponibles',
      en: 'Available services',
      it: 'Servizi disponibili',
      es: 'Servicios disponibles',
      de: 'Verfügbare Services'
    },
    'countries_served': {
      fr: 'Pays desservis',
      en: 'Countries served',
      it: 'Paesi serviti',
      es: 'Países servidos',
      de: 'Bediente Länder'
    },

    // === BOUTIQUES ===
    'shop_details': {
      fr: 'Détails de la boutique',
      en: 'Shop details',
      it: 'Dettagli del negozio',
      es: 'Detalles de la tienda',
      de: 'Shop-Details'
    },
    'shop_description_label': {
      fr: '📝',
      en: '📝',
      it: '📝',
      es: '📝',
      de: '📝'
    },
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
    },

    // === NAVIGATION ===
    'back_to_filters': {
      fr: 'Retour aux filtres',
      en: 'Back to filters',
      it: 'Torna ai filtri',
      es: 'Volver a filtros',
      de: 'Zurück zu Filtern'
    },
    'back_to_menu': {
      fr: 'Retour au menu',
      en: 'Back to menu',
      it: 'Torna al menu',
      es: 'Volver al menú',
      de: 'Zurück zum Menü'
    },
    'page_info': {
      fr: 'Page',
      en: 'Page',
      it: 'Pagina',
      es: 'Página',
      de: 'Seite'
    },

    // === MESSAGES D'ÉTAT ===
    'loading': {
      fr: 'Chargement...',
      en: 'Loading...',
      it: 'Caricamento...',
      es: 'Cargando...',
      de: 'Laden...'
    },
    'error_loading': {
      fr: 'Erreur lors du chargement',
      en: 'Error loading',
      it: 'Errore durante il caricamento',
      es: 'Error al cargar',
      de: 'Fehler beim Laden'
    },
    'shop_not_found': {
      fr: 'Boutique non trouvée ou inactive',
      en: 'Shop not found or inactive',
      it: 'Negozio non trovato o inattivo',
      es: 'Tienda no encontrada o inactiva',
      de: 'Shop nicht gefunden oder inaktiv'
    },

    // === FILTRES ===
    'filter_by_service': {
      fr: 'Filtrer par service',
      en: 'Filter by service',
      it: 'Filtra per servizio',
      es: 'Filtrar por servicio',
      de: 'Nach Service filtern'
    },
    'filter_by_country': {
      fr: 'Filtrer par pays',
      en: 'Filter by country',
      it: 'Filtra per paese',
      es: 'Filtrar por país',
      de: 'Nach Land filtern'
    },
    'all_shops': {
      fr: 'Toutes les boutiques',
      en: 'All shops',
      it: 'Tutti i negozi',
      es: 'Todas las tiendas',
      de: 'Alle Shops'
    },
    'messages_shopsAvailable': {
      fr: 'boutiques disponibles',
      en: 'shops available',
      it: 'negozi disponibili',
      es: 'tiendas disponibles',
      de: 'Shops verfügbar'
    },
    'total_shops': {
      fr: 'Total',
      en: 'Total',
      it: 'Totale',
      es: 'Total',
      de: 'Gesamt'
    },
    'shops_word': {
      fr: 'boutiques',
      en: 'shops',
      it: 'negozi',
      es: 'tiendas',
      de: 'Shops'
    },

    // === MESSAGES TOP PLUGS ===
    'messages_sortedByVotes': {
      fr: 'Triés par nombre de votes',
      en: 'Sorted by number of votes',
      it: 'Ordinati per numero di voti',
      es: 'Ordenados por número de votos',
      de: 'Sortiert nach Anzahl der Stimmen'
    },
    'messages_welcome': {
      fr: '👋 Bienvenue sur FindYourPlug !',
      en: '👋 Welcome to FindYourPlug!',
      it: '👋 Benvenuto su FindYourPlug!',
      es: '👋 ¡Bienvenido a FindYourPlug!',
      de: '👋 Willkommen bei FindYourPlug!'
    },
    'messages_noShops': {
      fr: '❌ Aucune boutique disponible pour le moment.',
      en: '❌ No shops available at the moment.',
      it: '❌ Nessun negozio disponibile al momento.',
      es: '❌ No hay tiendas disponibles en este momento.',
      de: '❌ Momentan sind keine Shops verfügbar.'
    },
    
    // === FILTRES AVANCÉS ===
    'filter_delivery_message': {
      fr: '📦 Afficher les boutiques disponibles pour livraison',
      en: '📦 Show shops available for delivery',
      it: '📦 Mostra negozi disponibili per consegna',
      es: '📦 Mostrar tiendas disponibles para entrega',
      de: '📦 Shops für Lieferung anzeigen'
    },
    'filter_meetup_message': {
      fr: '🤝 Afficher les boutiques disponibles pour meetup',
      en: '🤝 Show shops available for meetup',
      it: '🤝 Mostra negozi disponibili per incontro',
      es: '🤝 Mostrar tiendas disponibles para encuentro',
      de: '🤝 Shops für Treffen anzeigen'
    },
    'filter_postal_message': {
      fr: '📬 Boutiques qui font des envois postaux',
      en: '📬 Shops that do postal shipping',
      it: '📬 Negozi che fanno spedizioni postali',
      es: '📬 Tiendas que hacen envíos postales',
      de: '📬 Shops mit Postversand'
    },
    'filter_department_available': {
      fr: 'Départements disponibles pour',
      en: 'Available departments for',
      it: 'Dipartimenti disponibili per',
      es: 'Departamentos disponibles para',
      de: 'Verfügbare Bundesländer für'
    },
    'filter_shops_in_department': {
      fr: 'Boutiques en',
      en: 'Shops in',
      it: 'Negozi in',
      es: 'Tiendas en',
      de: 'Shops in'
    },

    // === ERREURS ET STATUTS ===
    'error_filtering': {
      fr: '❌ Erreur lors du filtrage',
      en: '❌ Error filtering',
      it: '❌ Errore nel filtraggio',
      es: '❌ Error al filtrar',
      de: '❌ Fehler beim Filtern'
    },
    'error_departments': {
      fr: '❌ Erreur lors du chargement des départements',
      en: '❌ Error loading departments',
      it: '❌ Errore nel caricamento dei dipartimenti',
      es: '❌ Error al cargar departamentos',
      de: '❌ Fehler beim Laden der Bundesländer'
    },
    'error_reset': {
      fr: '❌ Erreur lors de la réinitialisation',
      en: '❌ Error resetting',
      it: '❌ Errore nel reset',
      es: '❌ Error al reiniciar',
      de: '❌ Fehler beim Zurücksetzen'
    },
    'no_departments': {
      fr: '❌ Aucun département disponible',
      en: '❌ No departments available',
      it: '❌ Nessun dipartimento disponibile',
      es: '❌ No hay departamentos disponibles',
      de: '❌ Keine Bundesländer verfügbar'
    },
    'filters_reset': {
      fr: '🔄 Filtres réinitialisés',
      en: '🔄 Filters reset',
      it: '🔄 Filtri ripristinati',
      es: '🔄 Filtros reiniciados',
      de: '🔄 Filter zurückgesetzt'
    },
    'filters_reset_button': {
      fr: '🔁 Réinitialiser les filtres',
      en: '🔁 Reset filters',
      it: '🔁 Ripristina filtri',
      es: '🔁 Reiniciar filtros',
      de: '🔁 Filter zurücksetzen'
    },

    // === TITRES SYSTÈME ===
    'list_plugs_title': {
      fr: '🔌 Liste des Plugs',
      en: '🔌 Plugs List',
      it: '🔌 Lista Negozi',
      es: '🔌 Lista de Tiendas',
      de: '🔌 Shop-Liste'
    },
    'sorted_by_votes_subtitle': {
      fr: '(Triés par nombre de votes)',
      en: '(Sorted by number of votes)',
      it: '(Ordinati per numero di voti)',
      es: '(Ordenados por número de votos)',
      de: '(Sortiert nach Anzahl der Stimmen)'
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

// Fonction pour traduire automatiquement les descriptions
const translateDescription = (description, language = 'fr') => {
  if (!description || language === 'fr') {
    return description; // Retourner tel quel si français ou vide
  }

  // Dictionnaire de traductions pour mots/phrases communes
  const translations = {
    en: {
      'livraison': 'delivery',
      'meetup': 'meetup', 
      'envoi postal': 'postal shipping',
      'rapide': 'fast',
      'qualité': 'quality',
      'service': 'service',
      'disponible': 'available',
      'partout': 'everywhere',
      'partout en': 'everywhere in',
      'en france': 'in france',
      'et belgique': 'and belgium',
      'vers la': 'to',
      'france': 'france',
      'belgique': 'belgium',
      'suisse': 'switzerland',
      'luxembourg': 'luxembourg',
      'boutique': 'shop',
      'produits': 'products',
      'commande': 'order',
      'professionnel': 'professional'
    },
    it: {
      'livraison': 'consegna',
      'meetup': 'incontro',
      'envoi postal': 'spedizione postale',
      'rapide': 'veloce',
      'qualité': 'qualità',
      'service': 'servizio',
      'disponible': 'disponibile',
      'partout': 'ovunque',
      'partout en': 'ovunque in',
      'en france': 'in francia',
      'et belgique': 'e belgio',
      'vers la': 'verso la',
      'france': 'francia',
      'belgique': 'belgio',
      'suisse': 'svizzera',
      'luxembourg': 'lussemburgo',
      'boutique': 'negozio',
      'prodotti': 'prodotti',
      'commande': 'ordine',
      'professionnel': 'professionale'
    },
    es: {
      'livraison': 'entrega',
      'meetup': 'encuentro',
      'envoi postal': 'envío postal',
      'rapide': 'rápido',
      'qualité': 'calidad',
      'service': 'servicio',
      'disponible': 'disponible',
      'partout': 'en todas partes',
      'partout en': 'en todas partes de',
      'en france': 'en francia',
      'et belgique': 'y bélgica',
      'vers la': 'hacia',
      'france': 'francia',
      'belgique': 'bélgica',
      'suisse': 'suiza',
      'luxembourg': 'luxemburgo',
      'boutique': 'tienda',
      'produits': 'productos',
      'commande': 'pedido',
      'professionnel': 'profesional'
    },
    de: {
      'livraison': 'lieferung',
      'meetup': 'treffen',
      'envoi postal': 'postversand',
      'rapide': 'schnell',
      'qualité': 'qualität',
      'service': 'service',
      'disponible': 'verfügbar',
      'partout': 'überall',
      'partout en': 'überall in',
      'en france': 'in frankreich',
      'et belgique': 'und belgien',
      'vers la': 'nach',
      'france': 'frankreich',
      'belgique': 'belgien',
      'suisse': 'schweiz',
      'luxembourg': 'luxemburg',
      'boutique': 'shop',
      'produits': 'produkte',
      'commande': 'bestellung',
      'professionnel': 'professionell'
    }
  };

  if (!translations[language]) {
    return description; // Langue non supportée
  }

  let translatedText = description.toLowerCase();
  const langDict = translations[language];

  // Remplacer chaque mot/phrase
  Object.entries(langDict).forEach(([french, translated]) => {
    const regex = new RegExp(`\\b${french}\\b`, 'gi');
    translatedText = translatedText.replace(regex, translated);
  });

  // Capitaliser la première lettre
  return translatedText.charAt(0).toUpperCase() + translatedText.slice(1);
};

// Export
module.exports = {
  translations,
  getTranslation,
  createLanguageKeyboard,
  initializeDefaultTranslations,
  translateDescription
};