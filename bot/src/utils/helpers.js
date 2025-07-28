// Utilitaires helpers pour le bot Telegram

// Fonction pour obtenir le drapeau d'un pays (TOUS LES PAYS EUROPÉENS + SUPPLÉMENTAIRES)
const getCountryFlag = (country) => {
  const countryFlags = {
    // Pays européens principaux
    'france': '🇫🇷',
    'allemagne': '🇩🇪', 'germany': '🇩🇪',
    'italie': '🇮🇹', 'italy': '🇮🇹',
    'espagne': '🇪🇸', 'spain': '🇪🇸',
    'portugal': '🇵🇹',
    'royaume-uni': '🇬🇧', 'uk': '🇬🇧',
    'belgique': '🇧🇪', 'belgium': '🇧🇪',
    'pays-bas': '🇳🇱', 'netherlands': '🇳🇱',
    'suisse': '🇨🇭', 'switzerland': '🇨🇭',
    'autriche': '🇦🇹', 'austria': '🇦🇹',
    'luxembourg': '🇱🇺',
    'irlande': '🇮🇪', 'ireland': '🇮🇪',
    'danemark': '🇩🇰', 'denmark': '🇩🇰',
    'suède': '🇸🇪', 'sweden': '🇸🇪',
    'norvège': '🇳🇴', 'norway': '🇳🇴',
    'finlande': '🇫🇮', 'finland': '🇫🇮',
    'islande': '🇮🇸', 'iceland': '🇮🇸',
    'pologne': '🇵🇱', 'poland': '🇵🇱',
    'république tchèque': '🇨🇿', 'czech republic': '🇨🇿',
    'slovaquie': '🇸🇰', 'slovakia': '🇸🇰',
    'hongrie': '🇭🇺', 'hungary': '🇭🇺',
    'slovénie': '🇸🇮', 'slovenia': '🇸🇮',
    'croatie': '🇭🇷', 'croatia': '🇭🇷',
    'roumanie': '🇷🇴', 'romania': '🇷🇴',
    'bulgarie': '🇧🇬', 'bulgaria': '🇧🇬',
    'grèce': '🇬🇷', 'greece': '🇬🇷',
    'chypre': '🇨🇾', 'cyprus': '🇨🇾',
    'malte': '🇲🇹', 'malta': '🇲🇹',
    'estonie': '🇪🇪', 'estonia': '🇪🇪',
    'lettonie': '🇱🇻', 'latvia': '🇱🇻',
    'lituanie': '🇱🇹', 'lithuania': '🇱🇹',
    'monaco': '🇲🇨',
    'andorre': '🇦🇩', 'andorra': '🇦🇩',
    'saint-marin': '🇸🇲', 'san marino': '🇸🇲',
    'vatican': '🇻🇦',
    'liechtenstein': '🇱🇮',
    // Pays supplémentaires demandés
    'maroc': '🇲🇦', 'morocco': '🇲🇦',
    'canada': '🇨🇦',
    'usa': '🇺🇸', 'états-unis': '🇺🇸', 'united states': '🇺🇸',
    'thaïlande': '🇹🇭', 'thailand': '🇹🇭',
    // Pays existants
    'tunisie': '🇹🇳', 'tunisia': '🇹🇳',
    'algérie': '🇩🇿', 'algeria': '🇩🇿',
    'autre': '🌍'
  };
  
  if (!country) return '🌍';
  
  const normalizedCountry = country.toLowerCase().trim();
  return countryFlags[normalizedCountry] || '🌍';
};

module.exports = {
  getCountryFlag
};