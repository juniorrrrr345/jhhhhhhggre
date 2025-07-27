import { useState, useEffect, useCallback } from 'react'

const languages = {
  fr: { name: 'Français', flag: '🇫🇷' },
  en: { name: 'English', flag: '🇬🇧' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  es: { name: 'Español', flag: '🇪🇸' },
  de: { name: 'Deutsch', flag: '🇩🇪' }
}

const translations = {
  fr: {
    title: 'Langue',
    home: 'Accueil',
    search: 'Recherche...',
    vip: 'VIP',
    findyourplug: 'FINDYOURPLUG',
    votes: 'votes',
    delivery: 'Livraison',
    postal: 'Postal',
    meetup: 'Meetup',
    loading: 'Chargement',
    loading_shop: 'Chargement de la boutique',
    loading_vip: 'Chargement des boutiques VIP',
    shop_not_found: 'Boutique non trouvée',
    shop_not_found_desc: 'Cette boutique n\'existe pas ou a été supprimée.',
    back_to_shops: 'Retour aux boutiques',
    back: 'Retour',
    countries: 'Pays',
    type: 'Type',
    location: 'Localisation',
    available_services: 'Services disponibles',
    available: 'Disponible',
    not_available: 'Non disponible',
    social_media: 'Réseaux sociaux',
    additional_info: 'Informations complémentaires',
    vip_desc: 'Boutiques VIP exclusives',
    no_vip_shops: 'Aucune boutique VIP',
    no_vip_shops_desc: 'Aucune boutique VIP n\'est disponible pour le moment.',
    vip_shops_available: 'Boutiques VIP disponibles',
    vote_added: 'Vote ajouté',
    has_now: 'a maintenant',
    likes: 'likes',
    error_voting: 'Erreur lors du vote',
    error_connection: 'Erreur de connexion',
    no_shops_found: 'Aucune boutique trouvée',
    all_countries: 'Tous les pays',
    all_services: 'Tous les services',
    all_types: 'Tous les types',
    standard: 'Standard',
    found: 'trouvée(s)',
    shops: 'boutiques',
    search_desc: 'Recherchez vos boutiques préférées par nom, pays ou service',
    search_placeholder: 'Rechercher une boutique',
    only: 'uniquement',
    reset: 'Réinitialiser',
    searching: 'Recherche en cours',
    try_different_criteria: 'Essayez de modifier vos critères de recherche',
    // Nouvelles traductions pour les pages inscription et services
    inscription_title: 'INSCRIPTION',
    inscription_join_title: 'Rejoignez FindYourPlug',
    inscription_description: 'Inscrivez-vous directement via notre bot Telegram pour accéder à toutes les boutiques',
    inscription_button: 'S\'inscrire maintenant',
    services_title: 'SERVICES',
    services_frustrated_title: 'T\'en as marre que ton canal saute ?',
    services_solution_text: 'On a LA solution !',
    services_discover_text: 'Découvre notre offre exclusive',
    services_order_button: 'Commander maintenant',
    telegram_links_title: 'Gestion des Liens Telegram',
    telegram_links_description: 'Configurez les liens Telegram utilisés sur les pages d\'inscription et de services.',
    telegram_links_inscription_label: 'Lien Telegram - Page d\'inscription',
    telegram_links_services_label: 'Lien Telegram - Page de services',
    telegram_links_inscription_desc: 'Ce lien sera utilisé sur la page d\'inscription pour rediriger vers le bot Telegram.',
    telegram_links_services_desc: 'Ce lien sera utilisé sur la page de services pour rediriger vers le bot Telegram.',
    telegram_links_test: 'Tester',
    telegram_links_save: 'Sauvegarder',
    telegram_links_saving: 'Sauvegarde...',
    telegram_links_refresh: 'Actualiser',
    telegram_links_info_title: 'Informations',
    telegram_links_info_1: 'Les liens doivent être des URLs Telegram valides (format: https://t.me/username)',
    telegram_links_info_2: 'Les modifications sont appliquées immédiatement sur les pages publiques',
    telegram_links_info_3: 'Utilisez le bouton "Tester" pour vérifier que les liens fonctionnent',
    telegram_links_info_4: 'Les liens par défaut pointent vers @FindYourPlugBot'
  },
  en: {
    title: 'Language',
    home: 'Home',
    search: 'Search...',
    vip: 'VIP',
    findyourplug: 'FINDYOURPLUG',
    votes: 'votes',
    delivery: 'Delivery',
    postal: 'Postal',
    meetup: 'Meetup',
    loading: 'Loading',
    loading_shop: 'Loading shop',
    loading_vip: 'Loading VIP shops',
    shop_not_found: 'Shop not found',
    shop_not_found_desc: 'This shop does not exist or has been deleted.',
    back_to_shops: 'Back to shops',
    back: 'Back',
    countries: 'Countries',
    type: 'Type',
    location: 'Location',
    available_services: 'Available services',
    available: 'Available',
    not_available: 'Not available',
    social_media: 'Social media',
    additional_info: 'Additional information',
    vip_desc: 'Exclusive VIP shops',
    no_vip_shops: 'No VIP shops',
    no_vip_shops_desc: 'No VIP shops are available at the moment.',
    vip_shops_available: 'VIP shops available',
    vote_added: 'Vote added',
    has_now: 'now has',
    likes: 'likes',
    error_voting: 'Error voting',
    error_connection: 'Connection error',
    no_shops_found: 'No shops found',
    all_countries: 'All countries',
    all_services: 'All services',
    all_types: 'All types',
    standard: 'Standard',
    found: 'found',
    shops: 'shops',
    search_desc: 'Search your favorite shops by name, country or service',
    search_placeholder: 'Search for a shop',
    only: 'only',
    reset: 'Reset',
    searching: 'Searching',
    try_different_criteria: 'Try modifying your search criteria',
    // Nouvelles traductions pour les pages inscription et services
    inscription_title: 'REGISTRATION',
    inscription_join_title: 'Join FindYourPlug',
    inscription_description: 'Register directly via our Telegram bot to access all shops',
    inscription_button: 'Register now',
    services_title: 'SERVICES',
    services_frustrated_title: 'Tired of your channel getting banned?',
    services_solution_text: 'We have THE solution!',
    services_discover_text: 'Discover our exclusive offer',
    services_order_button: 'Order now',
    telegram_links_title: 'Telegram Links Management',
    telegram_links_description: 'Configure Telegram links used on registration and services pages.',
    telegram_links_inscription_label: 'Telegram Link - Registration Page',
    telegram_links_services_label: 'Telegram Link - Services Page',
    telegram_links_inscription_desc: 'This link will be used on the registration page to redirect to the Telegram bot.',
    telegram_links_services_desc: 'This link will be used on the services page to redirect to the Telegram bot.',
    telegram_links_test: 'Test',
    telegram_links_save: 'Save',
    telegram_links_saving: 'Saving...',
    telegram_links_refresh: 'Refresh',
    telegram_links_info_title: 'Information',
    telegram_links_info_1: 'Links must be valid Telegram URLs (format: https://t.me/username)',
    telegram_links_info_2: 'Changes are applied immediately on public pages',
    telegram_links_info_3: 'Use the "Test" button to verify that links work',
    telegram_links_info_4: 'Default links point to @FindYourPlugBot'
  },
  es: {
    title: 'Idioma',
    home: 'Inicio',
    search: 'Buscar...',
    vip: 'VIP',
    findyourplug: 'FINDYOURPLUG',
    votes: 'votos',
    delivery: 'Entrega',
    postal: 'Postal',
    meetup: 'Encuentro',
    loading: 'Cargando',
    loading_shop: 'Cargando tienda',
    loading_vip: 'Cargando tiendas VIP',
    shop_not_found: 'Tienda no encontrada',
    shop_not_found_desc: 'Esta tienda no existe o ha sido eliminada.',
    back_to_shops: 'Volver a las tiendas',
    back: 'Volver',
    countries: 'Países',
    type: 'Tipo',
    location: 'Ubicación',
    available_services: 'Servicios disponibles',
    available: 'Disponible',
    not_available: 'No disponible',
    social_media: 'Redes sociales',
    additional_info: 'Información adicional',
    vip_desc: 'Tiendas VIP exclusivas',
    no_vip_shops: 'Sin tiendas VIP',
    no_vip_shops_desc: 'No hay tiendas VIP disponibles en este momento.',
    vip_shops_available: 'Tiendas VIP disponibles',
    vote_added: 'Voto añadido',
    has_now: 'ahora tiene',
    likes: 'likes',
    error_voting: 'Error al votar',
    error_connection: 'Error de conexión',
    no_shops_found: 'No se encontraron tiendas',
    all_countries: 'Todos los países',
    all_services: 'Todos los servicios',
    all_types: 'Todos los tipos',
    standard: 'Estándar',
    found: 'encontrada(s)',
    shops: 'tiendas',
    search_desc: 'Busca tus tiendas favoritas por nombre, país o servicio',
    search_placeholder: 'Buscar una tienda',
    only: 'solo',
    reset: 'Restablecer',
    searching: 'Buscando',
    try_different_criteria: 'Intenta modificar tus criterios de búsqueda',
    // Nouvelles traductions pour les pages inscription et services
    inscription_title: 'REGISTRO',
    inscription_join_title: 'Únete a FindYourPlug',
    inscription_description: 'Regístrate directamente a través de nuestro bot de Telegram para acceder a todas las tiendas',
    inscription_button: 'Registrarse ahora',
    services_title: 'SERVICIOS',
    services_frustrated_title: '¿Cansado de que tu canal sea baneado?',
    services_solution_text: '¡Tenemos LA solución!',
    services_discover_text: 'Descubre nuestra oferta exclusiva',
    services_order_button: 'Pedir ahora',
    telegram_links_title: 'Gestión de Enlaces de Telegram',
    telegram_links_description: 'Configura los enlaces de Telegram utilizados en las páginas de registro y servicios.',
    telegram_links_inscription_label: 'Enlace de Telegram - Página de registro',
    telegram_links_services_label: 'Enlace de Telegram - Página de servicios',
    telegram_links_inscription_desc: 'Este enlace se utilizará en la página de registro para redirigir al bot de Telegram.',
    telegram_links_services_desc: 'Este enlace se utilizará en la página de servicios para redirigir al bot de Telegram.',
    telegram_links_test: 'Probar',
    telegram_links_save: 'Guardar',
    telegram_links_saving: 'Guardando...',
    telegram_links_refresh: 'Actualizar',
    telegram_links_info_title: 'Información',
    telegram_links_info_1: 'Los enlaces deben ser URLs de Telegram válidas (formato: https://t.me/username)',
    telegram_links_info_2: 'Los cambios se aplican inmediatamente en las páginas públicas',
    telegram_links_info_3: 'Usa el botón "Probar" para verificar que los enlaces funcionan',
    telegram_links_info_4: 'Los enlaces por defecto apuntan a @FindYourPlugBot'
  },
  it: {
    title: 'Lingua',
    home: 'Home',
    search: 'Cerca...',
    vip: 'VIP',
    findyourplug: 'FINDYOURPLUG',
    votes: 'voti',
    delivery: 'Consegna',
    postal: 'Postale',
    meetup: 'Incontro',
    loading: 'Caricamento',
    loading_shop: 'Caricamento negozio',
    loading_vip: 'Caricamento negozi VIP',
    shop_not_found: 'Negozio non trovato',
    shop_not_found_desc: 'Questo negozio non esiste o è stato eliminato.',
    back_to_shops: 'Torna ai negozi',
    back: 'Indietro',
    countries: 'Paesi',
    type: 'Tipo',
    location: 'Posizione',
    available_services: 'Servizi disponibili',
    available: 'Disponibile',
    not_available: 'Non disponibile',
    social_media: 'Social media',
    additional_info: 'Informazioni aggiuntive',
    vip_desc: 'Negozi VIP esclusivi',
    no_vip_shops: 'Nessun negozio VIP',
    no_vip_shops_desc: 'Nessun negozio VIP è disponibile al momento.',
    vip_shops_available: 'Negozi VIP disponibili',
    vote_added: 'Voto aggiunto',
    has_now: 'ora ha',
    likes: 'likes',
    error_voting: 'Errore nel voto',
    error_connection: 'Errore di connessione',
    no_shops_found: 'Nessun negozio trovato',
    all_countries: 'Tutti i paesi',
    all_services: 'Tutti i servizi',
    all_types: 'Tutti i tipi',
    standard: 'Standard',
    found: 'trovato/i',
    shops: 'negozi',
    search_desc: 'Cerca i tuoi negozi preferiti per nome, paese o servizio',
    search_placeholder: 'Cerca un negozio',
    only: 'solo',
    reset: 'Ripristina',
    searching: 'Ricerca in corso',
    try_different_criteria: 'Prova a modificare i tuoi criteri di ricerca',
    // Nouvelles traductions pour les pages inscription et services
    inscription_title: 'REGISTRAZIONE',
    inscription_join_title: 'Unisciti a FindYourPlug',
    inscription_description: 'Registrati direttamente tramite il nostro bot Telegram per accedere a tutti i negozi',
    inscription_button: 'Registrati ora',
    services_title: 'SERVIZI',
    services_frustrated_title: 'Sei stanco che il tuo canale venga bannato?',
    services_solution_text: 'Abbiamo LA soluzione!',
    services_discover_text: 'Scopri la nostra offerta esclusiva',
    services_order_button: 'Ordina ora',
    telegram_links_title: 'Gestione Link Telegram',
    telegram_links_description: 'Configura i link Telegram utilizzati nelle pagine di registrazione e servizi.',
    telegram_links_inscription_label: 'Link Telegram - Pagina di registrazione',
    telegram_links_services_label: 'Link Telegram - Pagina servizi',
    telegram_links_inscription_desc: 'Questo link sarà utilizzato nella pagina di registrazione per reindirizzare al bot Telegram.',
    telegram_links_services_desc: 'Questo link sarà utilizzato nella pagina servizi per reindirizzare al bot Telegram.',
    telegram_links_test: 'Testa',
    telegram_links_save: 'Salva',
    telegram_links_saving: 'Salvando...',
    telegram_links_refresh: 'Aggiorna',
    telegram_links_info_title: 'Informazioni',
    telegram_links_info_1: 'I link devono essere URL Telegram validi (formato: https://t.me/username)',
    telegram_links_info_2: 'Le modifiche vengono applicate immediatamente sulle pagine pubbliche',
    telegram_links_info_3: 'Usa il pulsante "Testa" per verificare che i link funzionino',
    telegram_links_info_4: 'I link predefiniti puntano a @FindYourPlugBot'
  },
  de: {
    title: 'Sprache',
    home: 'Startseite',
    search: 'Suchen...',
    vip: 'VIP',
    findyourplug: 'FINDYOURPLUG',
    votes: 'Stimmen',
    delivery: 'Lieferung',
    postal: 'Postal',
    meetup: 'Treffen',
    loading: 'Laden',
    loading_shop: 'Shop wird geladen',
    loading_vip: 'VIP-Shops werden geladen',
    shop_not_found: 'Shop nicht gefunden',
    shop_not_found_desc: 'Dieser Shop existiert nicht oder wurde gelöscht.',
    back_to_shops: 'Zurück zu den Shops',
    back: 'Zurück',
    countries: 'Länder',
    type: 'Typ',
    location: 'Standort',
    available_services: 'Verfügbare Services',
    available: 'Verfügbar',
    not_available: 'Nicht verfügbar',
    social_media: 'Soziale Medien',
    additional_info: 'Zusätzliche Informationen',
    vip_desc: 'Exklusive VIP-Shops',
    no_vip_shops: 'Keine VIP-Shops',
    no_vip_shops_desc: 'Momentan sind keine VIP-Shops verfügbar.',
    vip_shops_available: 'VIP-Shops verfügbar',
    vote_added: 'Stimme hinzugefügt',
    has_now: 'hat jetzt',
    likes: 'Likes',
    error_voting: 'Fehler beim Abstimmen',
    error_connection: 'Verbindungsfehler',
    no_shops_found: 'Keine Shops gefunden',
    all_countries: 'Alle Länder',
    all_services: 'Alle Services',
    all_types: 'Alle Typen',
    standard: 'Standard',
    found: 'gefunden',
    shops: 'Shops',
    search_desc: 'Suchen Sie Ihre Lieblingsshops nach Name, Land oder Service',
    search_placeholder: 'Nach einem Shop suchen',
    only: 'nur',
    reset: 'Zurücksetzen',
    searching: 'Suche läuft',
    try_different_criteria: 'Versuchen Sie, Ihre Suchkriterien zu ändern',
    // Nouvelles traductions pour les pages inscription et services
    inscription_title: 'REGISTRIERUNG',
    inscription_join_title: 'Tritt FindYourPlug bei',
    inscription_description: 'Registriere dich direkt über unseren Telegram-Bot, um Zugang zu allen Shops zu erhalten',
    inscription_button: 'Jetzt registrieren',
    services_title: 'DIENSTE',
    services_frustrated_title: 'Hast du es satt, dass dein Kanal gesperrt wird?',
    services_solution_text: 'Wir haben DIE Lösung!',
    services_discover_text: 'Entdecke unser exklusives Angebot',
    services_order_button: 'Jetzt bestellen',
    telegram_links_title: 'Telegram-Links Verwaltung',
    telegram_links_description: 'Konfiguriere Telegram-Links, die auf Registrierungs- und Diensteseiten verwendet werden.',
    telegram_links_inscription_label: 'Telegram-Link - Registrierungsseite',
    telegram_links_services_label: 'Telegram-Link - Diensteseite',
    telegram_links_inscription_desc: 'Dieser Link wird auf der Registrierungsseite verwendet, um zum Telegram-Bot weiterzuleiten.',
    telegram_links_services_desc: 'Dieser Link wird auf der Diensteseite verwendet, um zum Telegram-Bot weiterzuleiten.',
    telegram_links_test: 'Testen',
    telegram_links_save: 'Speichern',
    telegram_links_saving: 'Speichern...',
    telegram_links_refresh: 'Aktualisieren',
    telegram_links_info_title: 'Informationen',
    telegram_links_info_1: 'Links müssen gültige Telegram-URLs sein (Format: https://t.me/username)',
    telegram_links_info_2: 'Änderungen werden sofort auf öffentlichen Seiten angewendet',
    telegram_links_info_3: 'Verwende den "Testen"-Button, um zu überprüfen, ob Links funktionieren',
    telegram_links_info_4: 'Standard-Links zeigen auf @FindYourPlugBot'
  }
}

export default function LanguageSelector({ onLanguageChange, currentLanguage = 'fr', compact = false }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageSelect = (langCode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('shop_language', langCode)
    }
    setIsOpen(false)
    if (onLanguageChange) {
      onLanguageChange(langCode)
    }
  }

  if (compact) {
    // Version compacte pour le shop
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 px-2 py-1 bg-black/20 border border-white/20 rounded-md text-white/80 hover:bg-black/30 hover:text-white transition-all duration-200 text-xs"
        >
          <span className="text-sm">{languages[currentLanguage]?.flag}</span>
          <svg 
            className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-1 w-28 bg-black/90 border border-white/20 rounded-md shadow-lg z-50 backdrop-blur-sm">
            {Object.entries(languages).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => handleLanguageSelect(code)}
                className={`w-full flex items-center space-x-2 px-2 py-1.5 text-xs hover:bg-white/10 transition-colors first:rounded-t-md last:rounded-b-md ${
                  code === currentLanguage ? 'bg-white/20 text-white' : 'text-white/80'
                }`}
              >
                <span className="text-sm">{lang.flag}</span>
                <span className="text-xs">{lang.name}</span>
                {code === currentLanguage && (
                  <span className="ml-auto text-white text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg">{languages[currentLanguage]?.flag}</span>
        <span className="text-sm font-medium text-gray-700">
          {languages[currentLanguage]?.name}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          {Object.entries(languages).map(([code, lang]) => (
            <button
              key={code}
              onClick={() => handleLanguageSelect(code)}
              className={`w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                code === currentLanguage ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
              {code === currentLanguage && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Hook pour utiliser les traductions
export function useTranslation(currentLanguage = 'fr') {
  const t = useCallback((key) => {
    return translations[currentLanguage]?.[key] || translations['fr'][key] || key
  }, [currentLanguage])

  return { t }
}

// Fonction pour obtenir la langue depuis localStorage
export function getCurrentLanguage() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('shop_language') || 'fr'
  }
  return 'fr'
}