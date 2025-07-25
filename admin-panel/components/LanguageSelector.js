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
    shops: 'boutiques'
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
    shops: 'shops'
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
    shops: 'tiendas'
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
    shops: 'negozi'
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
    shops: 'Shops'
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