// Service pour gérer les codes postaux par pays - VERSION VERCEL (codes réels des boutiques)
class PostalCodeServiceVercel {
  constructor() {
    // Base de données des codes postaux RÉELS des boutiques existantes
    this.postalCodes = {
      // Codes postaux extraits des boutiques réelles
      'France': ['33', '59', '69', '75', '77', '78', '91', '92', '93', '95'],
      'Canada': ['33', '59', '69', '75', '77', '78', '91', '92', '93', '95'],
      'Tunisie': ['33', '69', '75', '78', '91', '92', '93', '95'],
      'Belgique': ['33', '59', '69', '77', '78', '91', '92', '93', '95'],
      'Suisse': ['33', '78', '91', '93', '95'],
      'Maroc': ['33', '78', '91', '93', '95'],
      'Sénégal': ['33', '78', '91', '93', '95'],
      'Algérie': ['33', '78', '91', '93', '95'],
      'Cameroun': ['33', '78', '91', '93', '95'],
      "Côte d'Ivoire": ['33', '78', '91', '93', '95'],
      'Allemagne': ['33', '78', '91', '93', '95'],
      'Italie': ['33', '78', '91', '93', '95'],
      'Madagascar': ['33', '78', '91', '93', '95'],
      'Royaume-Uni': ['33', '78', '91', '93', '95'],
      'États-Unis': ['33', '78', '91', '93', '95'],
      'Espagne': ['33', '78', '91', '93', '95'],
      'Portugal': ['33', '78', '91', '93', '95']
    };
  }

  // Toutes les méthodes de génération supprimées - utilise les codes réels des boutiques

  // Récupérer les codes postaux d'un pays
  getPostalCodes(country) {
    return this.postalCodes[country] || [];
  }

  // Récupérer les pays disponibles
  getAvailableCountries() {
    return Object.keys(this.postalCodes);
  }
}

module.exports = new PostalCodeServiceVercel();