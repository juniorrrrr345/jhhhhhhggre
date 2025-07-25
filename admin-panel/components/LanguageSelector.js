import { useState, useEffect } from 'react'

const languages = {
  fr: { name: 'Français', flag: '🇫🇷' },
  en: { name: 'English', flag: '🇬🇧' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  es: { name: 'Español', flag: '🇪🇸' },
  de: { name: 'Deutsch', flag: '🇩🇪' }
}

const translations = {
  title: {
    fr: 'Langue',
    en: 'Language',
    it: 'Lingua',
    es: 'Idioma',
    de: 'Sprache'
  },
  findyourplug: {
    fr: 'FINDYOURPLUG',
    en: 'FINDYOURPLUG',
    it: 'FINDYOURPLUG',
    es: 'FINDYOURPLUG',
    de: 'FINDYOURPLUG'
  },
  search: {
    fr: 'Rechercher...',
    en: 'Search...',
    it: 'Cerca...',
    es: 'Buscar...',
    de: 'Suchen...'
  },
  home: {
    fr: 'Accueil',
    en: 'Home',
    it: 'Home',
    es: 'Inicio',
    de: 'Startseite'
  },
  vip: {
    fr: 'VIP',
    en: 'VIP',
    it: 'VIP',
    es: 'VIP',
    de: 'VIP'
  },
  loading: {
    fr: 'Chargement...',
    en: 'Loading...',
    it: 'Caricamento...',
    es: 'Cargando...',
    de: 'Laden...'
  },
  noShops: {
    fr: 'Aucune boutique disponible',
    en: 'No shops available',
    it: 'Nessun negozio disponibile',
    es: 'No hay tiendas disponibles',
    de: 'Keine Shops verfügbar'
  },
  shops: {
    fr: 'boutiques',
    en: 'shops',
    it: 'negozi',
    es: 'tiendas',
    de: 'shops'
  },
  available: {
    fr: 'disponibles',
    en: 'available',
    it: 'disponibili',
    es: 'disponibles',
    de: 'verfügbar'
  },
  delivery: {
    fr: 'Livraison',
    en: 'Delivery',
    it: 'Consegna',
    es: 'Entrega',
    de: 'Lieferung'
  },
  meetup: {
    fr: 'Meetup',
    en: 'Meetup',
    it: 'Incontro',
    es: 'Encuentro',
    de: 'Treffen'
  },
  postal: {
    fr: 'Envoi postal',
    en: 'Postal shipping',
    it: 'Spedizione postale',
    es: 'Envío postal',
    de: 'Postversand'
  },
  likes: {
    fr: 'votes',
    en: 'votes',
    it: 'voti',
    es: 'votos',
    de: 'Stimmen'
  },
  viewShop: {
    fr: 'Voir la boutique',
    en: 'View shop',
    it: 'Vedi negozio',
    es: 'Ver tienda',
    de: 'Shop ansehen'
  },
  contact: {
    fr: 'Contacter',
    en: 'Contact',
    it: 'Contatta',
    es: 'Contactar',
    de: 'Kontakt'
  },
  description: {
    fr: 'Description',
    en: 'Description',
    it: 'Descrizione',
    es: 'Descripción',
    de: 'Beschreibung'
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
  const t = (key) => {
    return translations[key]?.[currentLanguage] || translations[key]?.fr || key
  }

  return { t }
}

// Fonction pour obtenir la langue depuis localStorage
export function getCurrentLanguage() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('shop_language') || 'fr'
  }
  return 'fr'
}