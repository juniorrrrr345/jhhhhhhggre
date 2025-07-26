// Service pour gérer les codes postaux par pays - VERSION VERCEL (grandes villes)
class PostalCodeServiceVercel {
  constructor() {
    // Base de données des codes postaux par pays - GRANDES VILLES
    this.postalCodes = {
      // 🇫🇷 FRANCE - Principales villes
      France: this.generateFrenchMainCities(),
      
      // 🇨🇦 CANADA - Principales villes
      Canada: this.generateCanadianMainCities(),
      
      // 🇹🇳 TUNISIE - Principales villes
      Tunisie: this.generateTunisianMainCities(),
      
      // 🇧🇪 BELGIQUE - Principales villes
      Belgique: this.generateBelgianMainCities(),
      
      // 🇨🇭 SUISSE - Principales villes
      Suisse: this.generateSwissMainCities(),
      
      // 🇲🇦 MAROC - Principales villes
      Maroc: this.generateMoroccanMainCities(),
      
      // 🇸🇳 SÉNÉGAL - Principales villes
      Sénégal: this.generateSenegaleseMainCities(),
      
      // 🇩🇿 ALGÉRIE - Principales villes
      Algérie: this.generateAlgerianMainCities(),
      
      // 🇨🇲 CAMEROUN - Principales villes
      Cameroun: this.generateCameroonianMainCities(),
      
      // 🇨🇮 CÔTE D'IVOIRE - Principales villes
      "Côte d'Ivoire": this.generateIvorianMainCities(),
      
      // 🇩🇪 ALLEMAGNE - Principales villes
      Allemagne: this.generateGermanMainCities(),
      
      // 🇮🇹 ITALIE - Principales villes
      Italie: this.generateItalianMainCities(),
      
      // 🇲🇬 MADAGASCAR - Principales villes
      Madagascar: this.generateMalagasyMainCities(),
      
      // 🇬🇧 ROYAUME-UNI - Principales villes
      'Royaume-Uni': this.generateUKMainCities(),
      
      // 🇺🇸 ÉTATS-UNIS - Principales villes
      'États-Unis': this.generateUSMainCities(),
      
      // 🇪🇸 ESPAGNE - Principales villes
      Espagne: this.generateSpanishMainCities(),
      
      // 🇵🇹 PORTUGAL - Principales villes
      Portugal: this.generatePortugueseMainCities()
    };
  }

  // 🇫🇷 FRANCE - Codes principaux des grandes villes (optimisé)
  generateFrenchMainCities() {
    return [
      // Paris centre (seulement les arrondissements principaux)
      '75001', '75008', '75016', '75017', // Paris centre et ouest
      // Grandes métropoles (1 code principal par ville)
      '69001', // Lyon
      '13001', // Marseille
      '59000', // Lille
      '31000', // Toulouse
      '06000', // Nice
      '44000', // Nantes
      '67000', // Strasbourg
      '34000', // Montpellier
      '33000', // Bordeaux
      '35000', // Rennes
      '21000', // Dijon
      '76000', // Rouen
      '51100', // Reims
      '54000', // Nancy
      '25000', // Besançon
      '87000', // Limoges
      '86000', // Poitiers
      '49000', // Angers
      '72000'  // Le Mans
    ];
  }

  // 🇨🇦 CANADA - Codes principaux (optimisé)
  generateCanadianMainCities() {
    return [
      // Principales villes (1-2 codes par ville)
      'M5V', 'M5H', // Toronto centre
      'H3A', 'H3G', // Montréal centre
      'V6B', 'V6C', // Vancouver centre
      'T2P', 'T2R', // Calgary centre
      'K1A', 'K1G', // Ottawa centre
      'J4W', 'J4X', // Laval
      'G1A', 'G1C', // Québec
      'R3C', 'R3G', // Winnipeg
      'S7K', 'S7L', // Saskatoon
      'T5J', 'T5K'  // Edmonton
    ];
  }

  // 🇹🇳 TUNISIE - Codes principaux (optimisé)
  generateTunisianMainCities() {
    return [
      '1000', // Tunis
      '2000', // Ariana
      '3000', // Béja
      '4000', // Ben Arous
      '5000', // Bizerte
      '6000', // Gabès
      '7000', // Gafsa
      '8000', // Jendouba
      '9000', // Kasserine
      '1100', // Manouba
      '1200', // Nabeul
      '1300'  // Sfax
    ];
  }

  // 🇸🇳 SÉNÉGAL - Codes principaux (optimisé)
  generateSenegaleseMainCities() {
    return [
      '10000', // Dakar
      '11000', // Dakar région
      '21000', // Diourbel
      '23000', // Fatick
      '27000', // Kaolack
      '28000', // Kolda
      '29000', // Louga
      '30000', // Matam
      '32000', // Saint-Louis
      '33000', // Sédhiou
      '34000', // Tambacounda
      '35000'  // Thiès
    ];
  }

  // Méthodes pour les autres pays (optimisées)
  generateBelgianMainCities() {
    return ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000']; // Principales villes
  }

  generateSwissMainCities() {
    return ['1000', '8000', '3000', '4000', '1200', '1700', '2000', '6000', '7000']; // Lausanne, Zurich, Berne, Basel, etc.
  }

  generateMoroccanMainCities() {
    return ['10000', '20000', '30000', '40000', '50000', '60000', '70000', '80000']; // Casablanca, Rabat, Fès, etc.
  }

  generateAlgerianMainCities() {
    return ['16000', '31000', '35000', '06000', '09000', '25000', '13000', '23000']; // Alger, Oran, Boumerdes, etc.
  }

  generateCameroonianMainCities() {
    return ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000']; // Yaoundé, Douala, etc.
  }

  generateIvorianMainCities() {
    return ['01 BP 01', '02 BP 01', '03 BP 01', '04 BP 01', '05 BP 01']; // Abidjan districts
  }

  generateGermanMainCities() {
    return ['10115', '80331', '60311', '20095', '70173', '30159', '50667', '01067']; // Berlin, Munich, Frankfurt, Hamburg, etc.
  }

  generateItalianMainCities() {
    return ['00118', '20121', '10121', '80121', '50121', '40121', '16121', '70121']; // Rome, Milan, Turin, Naples, etc.
  }

  generateMalagasyMainCities() {
    return ['101', '201', '301', '401', '501', '601']; // Antananarivo, etc.
  }

  generateUKMainCities() {
    return ['SW1A', 'W1', 'EC1', 'E1', 'M1', 'B1', 'L1', 'G1', 'CF1', 'EH1']; // Londres, Manchester, Birmingham, etc.
  }

  generateUSMainCities() {
    return ['10001', '90210', '60601', '75201', '94102', '30301', '33101', '02101']; // NYC, LA, Chicago, Dallas, SF, etc.
  }

  generateSpanishMainCities() {
    return ['28001', '08001', '46001', '41001', '15001', '50001', '47001', '36001']; // Madrid, Barcelona, Valencia, etc.
  }

  generatePortugueseMainCities() {
    return ['1000-001', '4000-001', '3000-001', '2000-001', '8000-001']; // Lisbonne, Porto, Coimbra, etc.
  }

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