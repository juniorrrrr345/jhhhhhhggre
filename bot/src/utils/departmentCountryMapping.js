// Mapping départements → pays pour proposer automatiquement les pays correspondants
const departmentCountryMapping = {
  // 🇫🇷 FRANCE - Départements français
  '01': ['France'], '02': ['France'], '03': ['France'], '04': ['France'], '05': ['France'],
  '06': ['France'], '07': ['France'], '08': ['France'], '09': ['France'], '10': ['France'],
  '11': ['France'], '12': ['France'], '13': ['France'], '14': ['France'], '15': ['France'],
  '16': ['France'], '17': ['France'], '18': ['France'], '19': ['France'], '21': ['France'],
  '22': ['France'], '23': ['France'], '24': ['France'], '25': ['France'], '26': ['France'],
  '27': ['France'], '28': ['France'], '29': ['France'], '30': ['France'], '31': ['France'],
  '32': ['France'], '33': ['France'], '34': ['France'], '35': ['France'], '36': ['France'],
  '37': ['France'], '38': ['France'], '39': ['France'], '40': ['France'], '41': ['France'],
  '42': ['France'], '43': ['France'], '44': ['France'], '45': ['France'], '46': ['France'],
  '47': ['France'], '48': ['France'], '49': ['France'], '50': ['France'], '51': ['France'],
  '52': ['France'], '53': ['France'], '54': ['France'], '55': ['France'], '56': ['France'],
  '57': ['France'], '58': ['France'], '59': ['France'], '60': ['France'], '61': ['France'],
  '62': ['France'], '63': ['France'], '64': ['France'], '65': ['France'], '66': ['France'],
  '67': ['France'], '68': ['France'], '69': ['France'], '70': ['France'], '71': ['France'],
  '72': ['France'], '73': ['France'], '74': ['France'], '75': ['France'], '76': ['France'],
  '77': ['France'], '78': ['France'], '79': ['France'], '80': ['France'], '81': ['France'],
  '82': ['France'], '83': ['France'], '84': ['France'], '85': ['France'], '86': ['France'],
  '87': ['France'], '88': ['France'], '89': ['France'], '90': ['France'], '91': ['France'],
  '92': ['France'], '93': ['France'], '94': ['France'], '95': ['France'],
  '2A': ['France'], '2B': ['France'], // Corse
  '971': ['France'], '972': ['France'], '973': ['France'], '974': ['France'], '976': ['France'], // DOM-TOM

  // 🇧🇪 BELGIQUE - Codes postaux belges
  '10': ['Belgique'], '11': ['Belgique'], '12': ['Belgique'], '13': ['Belgique'], '14': ['Belgique'],
  '15': ['Belgique'], '16': ['Belgique'], '17': ['Belgique'], '18': ['Belgique'], '19': ['Belgique'],
  '20': ['Belgique'], '21': ['Belgique'], '22': ['Belgique'], '23': ['Belgique'], '24': ['Belgique'],
  '25': ['Belgique'], '26': ['Belgique'], '27': ['Belgique'], '28': ['Belgique'], '29': ['Belgique'],
  '30': ['Belgique'], '31': ['Belgique'], '32': ['Belgique'], '33': ['Belgique'], '34': ['Belgique'],
  '35': ['Belgique'], '36': ['Belgique'], '37': ['Belgique'], '38': ['Belgique'], '39': ['Belgique'],
  '40': ['Belgique'], '41': ['Belgique'], '42': ['Belgique'], '43': ['Belgique'], '44': ['Belgique'],
  '45': ['Belgique'], '46': ['Belgique'], '47': ['Belgique'], '48': ['Belgique'], '49': ['Belgique'],
  '50': ['Belgique'], '51': ['Belgique'], '52': ['Belgique'], '53': ['Belgique'], '54': ['Belgique'],
  '55': ['Belgique'], '56': ['Belgique'], '57': ['Belgique'], '58': ['Belgique'], '59': ['Belgique'],
  '60': ['Belgique'], '61': ['Belgique'], '62': ['Belgique'], '63': ['Belgique'], '64': ['Belgique'],
  '65': ['Belgique'], '66': ['Belgique'], '67': ['Belgique'], '68': ['Belgique'], '69': ['Belgique'],
  '70': ['Belgique'], '71': ['Belgique'], '72': ['Belgique'], '73': ['Belgique'], '74': ['Belgique'],
  '75': ['Belgique'], '76': ['Belgique'], '77': ['Belgique'], '78': ['Belgique'], '79': ['Belgique'],
  '80': ['Belgique'], '81': ['Belgique'], '82': ['Belgique'], '83': ['Belgique'], '84': ['Belgique'],
  '85': ['Belgique'], '86': ['Belgique'], '87': ['Belgique'], '88': ['Belgique'], '89': ['Belgique'],
  '90': ['Belgique'], '91': ['Belgique'], '92': ['Belgique'], '93': ['Belgique'], '94': ['Belgique'],
  '95': ['Belgique'], '96': ['Belgique'], '97': ['Belgique'], '98': ['Belgique'], '99': ['Belgique'],

  // 🇨🇭 SUISSE - Codes postaux suisses
  // Les codes suisses 10-99 correspondent aux zones principales
  
  // 🇳🇱 PAYS-BAS - Codes postaux néerlandais
  // Les codes néerlandais suivent un pattern similaire

  // 🌍 AUTRES PAYS - Pour les codes génériques
  // Quand l'utilisateur tape des codes non reconnus, on propose "Autre"
};

// Fonction pour obtenir les pays suggérés basés sur les départements saisis
function getSuggestedCountries(departments) {
  const suggestedCountries = new Set();
  
  departments.forEach(dept => {
    const cleanDept = dept.toString().trim().toUpperCase();
    
    // Vérifier si le département correspond à un pays spécifique
    if (departmentCountryMapping[cleanDept]) {
      departmentCountryMapping[cleanDept].forEach(country => {
        suggestedCountries.add(country);
      });
    } else {
      // Si département non reconnu, suggérer "Autre"
      suggestedCountries.add('Autre');
    }
  });

  // Toujours proposer quelques pays européens populaires en plus
  ['France', 'Belgique', 'Suisse', 'Allemagne', 'Espagne', 'Italie'].forEach(country => {
    suggestedCountries.add(country);
  });

  return Array.from(suggestedCountries).sort();
}

module.exports = {
  departmentCountryMapping,
  getSuggestedCountries
};