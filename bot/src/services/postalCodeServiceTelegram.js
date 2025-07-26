// Service pour gérer les codes postaux par pays - VERSION TELEGRAM (codes boutiques uniquement)
class PostalCodeServiceTelegram {
  constructor() {
    this.lastReload = new Date();
    // Codes postaux basés sur les boutiques réellement disponibles
    this.postalCodes = {
      // 🇫🇷 FRANCE - Seulement les départements avec boutiques
      France: ['33', '59', '69', '75', '77', '78', '91', '92', '93', '95'],
      
      // 🇨🇦 CANADA - Codes utilisés par les boutiques
      Canada: ['33', '59', '69', '75', '77', '78', '91', '92', '93', '95'],
      
      // 🇹🇳 TUNISIE - Codes des boutiques
      Tunisie: ['33', '69', '75', '78', '91', '92', '93', '95'],
      
      // 🇧🇪 BELGIQUE - Codes des boutiques
      Belgique: ['33', '59', '69', '77', '78', '91', '92', '93', '95'],
      
      // 🇨🇭 SUISSE - Codes des boutiques
      Suisse: ['33', '78', '91', '93', '95'],
      
      // 🇲🇦 MAROC - Codes des boutiques
      Maroc: ['33', '78', '91', '93', '95'],
      
      // 🇸🇳 SÉNÉGAL - Codes des boutiques
      Sénégal: ['33', '78', '91', '93', '95'],
      
      // 🇩🇿 ALGÉRIE - Codes des boutiques
      Algérie: ['33', '78', '91', '93', '95'],
      
      // 🇨🇲 CAMEROUN - Codes des boutiques
      Cameroun: ['33', '78', '91', '93', '95'],
      
      // 🇨🇮 CÔTE D'IVOIRE - Codes des boutiques
      "Côte d'Ivoire": ['33', '78', '91', '93', '95'],
      
      // 🇩🇪 ALLEMAGNE - Codes des boutiques
      Allemagne: ['33', '78', '91', '93', '95'],
      
      // 🇮🇹 ITALIE - Codes des boutiques
      Italie: ['33', '78', '91', '93', '95'],
      
      // 🇲🇬 MADAGASCAR - Codes des boutiques
      Madagascar: ['33', '78', '91', '93', '95'],
      
      // 🇬🇧 ROYAUME-UNI - Codes des boutiques
      'Royaume-Uni': ['33', '78', '91', '93', '95'],
      
      // 🇺🇸 ÉTATS-UNIS - Codes des boutiques
      'États-Unis': ['33', '78', '91', '93', '95'],
      
      // 🇪🇸 ESPAGNE - Codes des boutiques
      Espagne: ['33', '78', '91', '93', '95'],
      
      // 🇵🇹 PORTUGAL - Codes des boutiques
      Portugal: ['33', '78', '91', '93', '95']
    };
  }

  // Récupérer les codes postaux d'un pays
  getPostalCodes(country) {
    return this.postalCodes[country] || [];
  }

  // Récupérer les pays disponibles
  getAvailableCountries() {
    return Object.keys(this.postalCodes);
  }

  // Créer un clavier avec les codes postaux (simple, codes boutiques uniquement)
  createPostalCodeKeyboard(country, page = 0, itemsPerPage = 16) {
    const codes = this.getPostalCodes(country);
    
    if (!codes || codes.length === 0) {
      return {
        inline_keyboard: [
          [{
            text: '❌ Aucun code disponible',
            callback_data: 'no_postal_codes'
          }],
          [{
            text: '🔙 Retour',
            callback_data: 'top_plugs'
          }]
        ]
      };
    }
    
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageCodes = codes.slice(startIndex, endIndex);
    
    const keyboard = [];
    
    // Organiser en lignes de 2 codes postaux
    for (let i = 0; i < currentPageCodes.length; i += 2) {
      const row = [];
      const code1 = currentPageCodes[i];
      const code2 = currentPageCodes[i + 1];
      
      row.push({
        text: code1,
        callback_data: `postal_${country}_${code1}`
      });
      
      if (code2) {
        row.push({
          text: code2,
          callback_data: `postal_${country}_${code2}`
        });
      }
      
      keyboard.push(row);
    }
    
    // Boutons de navigation
    const navButtons = [];
    if (page > 0) {
      navButtons.push({
        text: '⬅️ Précédent',
        callback_data: `postal_nav_${country}_${page - 1}`
      });
    }
    if (endIndex < codes.length) {
      navButtons.push({
        text: 'Suivant ➡️',
        callback_data: `postal_nav_${country}_${page + 1}`
      });
    }
    
    if (navButtons.length > 0) {
      keyboard.push(navButtons);
    }
    
    // Bouton retour
    keyboard.push([{
      text: '🔙 Retour',
      callback_data: 'top_plugs'
    }]);
    
    return {
      inline_keyboard: keyboard
    };
  }
}

module.exports = new PostalCodeServiceTelegram();