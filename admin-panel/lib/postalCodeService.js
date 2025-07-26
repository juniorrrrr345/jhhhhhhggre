// Service pour gérer les codes postaux par pays (version admin panel)
class PostalCodeService {
  constructor() {
    // Base de données des codes postaux par pays
    this.postalCodes = {
      // 🇫🇷 FRANCE (01-99 départements + DOM-TOM)
      France: this.generateFrenchPostalCodes(),
      
      // 🇪🇸 ESPAGNE (01-52 provinces)
      Espagne: this.generateSpanishPostalCodes(),
      
      // 🇨🇭 SUISSE (1000-9999)
      Suisse: this.generateSwissPostalCodes(),
      
      // 🇮🇹 ITALIE (00010-99999)
      Italie: this.generateItalianPostalCodes(),
      
      // 🇩🇪 ALLEMAGNE (01067-99998)
      Allemagne: this.generateGermanPostalCodes(),
      
      // 🇧🇪 BELGIQUE (1000-9999)
      Belgique: this.generateBelgianPostalCodes(),
      
      // 🇳🇱 PAYS-BAS (1000-9999)
      'Pays-Bas': this.generateDutchPostalCodes(),
      
      // 🇬🇧 ROYAUME-UNI (Zones alphabétiques)
      'Royaume-Uni': this.generateUKPostalCodes(),
      
      // 🇺🇸 USA (États + ZIP codes principaux)
      'États-Unis': this.generateUSPostalCodes(),
      
      // 🇨🇦 CANADA (Provinces + codes principaux)
      Canada: this.generateCanadianPostalCodes(),
      
      // 🇹🇭 THAÏLANDE (10000-99999)
      Thaïlande: this.generateThaiPostalCodes(),
      
      // 🇲🇦 MAROC (10000-99999)
      Maroc: this.generateMoroccanPostalCodes()
    };
  }

  // 🇫🇷 FRANCE - Tous les départements
  generateFrenchPostalCodes() {
    const codes = [];
    // Métropole: 01-95 (sauf 20)
    for (let dept = 1; dept <= 95; dept++) {
      if (dept === 20) continue; // Corse = 2A/2B
      const deptStr = dept.toString().padStart(2, '0');
      // Seulement les codes départementaux pour l'admin panel
      codes.push(deptStr);
    }
    // Corse 2A et 2B
    codes.push('2A', '2B');
    // DOM-TOM: 971-976, 984, 986-988
    const domTom = ['971', '972', '973', '974', '976', '984', '986', '987', '988'];
    domTom.forEach(dept => codes.push(dept));
    return codes.sort();
  }

  // 🇪🇸 ESPAGNE - Toutes les provinces
  generateSpanishPostalCodes() {
    const codes = [];
    // Provinces 01-52
    for (let prov = 1; prov <= 52; prov++) {
      const provStr = prov.toString().padStart(2, '0');
      codes.push(provStr);
    }
    return codes.sort();
  }

  // 🇨🇭 SUISSE - Codes postaux principaux par canton
  generateSwissPostalCodes() {
    const codes = [];
    // Codes postaux suisses réels par zones principales
    for (let i = 1000; i <= 9999; i += 100) {
      codes.push(i.toString());
    }
    // Ajouter quelques codes intermédiaires importants
    const importantCodes = ['1200', '1290', '1400', '1700', '2500', '2600', '3900', '4600', '5200', '6200', '6300', '6400', '6500', '6600', '6700', '6800'];
    importantCodes.forEach(code => {
      if (!codes.includes(code)) codes.push(code);
    });
    return codes.sort();
  }

  // 🇮🇹 ITALIE - Codes postaux par régions principales
  generateItalianPostalCodes() {
    const codes = [
      // Codes par régions principales
      '00100', // Rome (Latium)
      '10100', // Turin (Piémont)
      '16100', // Gênes (Ligurie)
      '20100', // Milan (Lombardie)
      '25100', // Brescia (Lombardie)
      '30100', // Venise (Vénétie)
      '33100', // Udine (Frioul-Vénétie julienne)
      '34100', // Trieste (Frioul-Vénétie julienne)
      '35100', // Padoue (Vénétie)
      '37100', // Vérone (Vénétie)
      '38100', // Trente (Trentin-Haut-Adige)
      '39100', // Bolzano (Trentin-Haut-Adige)
      '40100', // Bologne (Émilie-Romagne)
      '50100', // Florence (Toscane)
      '60100', // Ancône (Marches)
      '70100', // Bari (Pouilles)
      '80100', // Naples (Campanie)
      '90100', // Palerme (Sicile)
      '95100', // Catane (Sicile)
      '09100', // Cagliari (Sardaigne)
      '07100'  // Sassari (Sardaigne)
    ];
    return codes.sort();
  }

  // 🇩🇪 ALLEMAGNE - Codes postaux par régions
  generateGermanPostalCodes() {
    const codes = [];
    // Codes postaux allemands par zones principales
    for (let i = 10000; i <= 99000; i += 10000) {
      codes.push(i.toString());
    }
    // Ajouter quelques codes importants
    const importantCodes = ['01067', '20095', '30159', '40213', '50667', '60313', '70173', '80331', '90402'];
    importantCodes.forEach(code => {
      if (!codes.includes(code)) codes.push(code);
    });
    return codes.sort();
  }

  // 🇧🇪 BELGIQUE
  generateBelgianPostalCodes() {
    const codes = [];
    for (let i = 1000; i <= 9000; i += 500) {
      codes.push(i.toString());
    }
    return codes.sort();
  }

  // 🇳🇱 PAYS-BAS
  generateDutchPostalCodes() {
    const codes = [];
    for (let i = 1000; i <= 9000; i += 500) {
      codes.push(i.toString());
    }
    return codes.sort();
  }

  // 🇬🇧 ROYAUME-UNI - Zones principales
  generateUKPostalCodes() {
    const areas = [
      // Londres
      'SW1', 'W1', 'EC1', 'WC1', 'E1', 'N1', 'SE1', 'NW1',
      // Autres villes principales
      'M1', 'M2', 'M3', 'M4', 'M5', // Manchester
      'B1', 'B2', 'B3', 'B4', 'B5', // Birmingham
      'L1', 'L2', 'L3', 'L4', 'L5', // Liverpool
      'LS1', 'LS2', 'LS3', 'LS4', 'LS5' // Leeds
    ];
    return areas.sort();
  }

  // 🇺🇸 USA - États + ZIP principaux
  generateUSPostalCodes() {
    const codes = [
      '10001', // New York
      '90210', // Los Angeles
      '60601', // Chicago
      '77001', // Houston
      '85001', // Phoenix
      '19101', // Philadelphia
      '78701', // Austin
      '32801', // Orlando
      '33101', // Miami
      '98101'  // Seattle
    ];
    return codes.sort();
  }

  // 🇨🇦 CANADA - Provinces + codes principaux
  generateCanadianPostalCodes() {
    const codes = [
      'H1A', 'H2A', 'H3A', // Québec
      'M1A', 'M2A', 'M3A', // Ontario
      'V1A', 'V2A', 'V3A', // Colombie-Britannique
      'T1A', 'T2A', 'T3A', // Alberta
      'S1A', 'S2A', 'S3A', // Saskatchewan
      'R1A', 'R2A', 'R3A'  // Manitoba
    ];
    return codes.sort();
  }

  // 🇹🇭 THAÏLANDE
  generateThaiPostalCodes() {
    const codes = [];
    for (let i = 10000; i <= 90000; i += 10000) {
      codes.push(i.toString());
    }
    return codes.sort();
  }

  // 🇲🇦 MAROC
  generateMoroccanPostalCodes() {
    const codes = [
      '10000', // Rabat
      '20000', // Casablanca
      '30000', // Fès
      '40000', // Marrakech
      '50000', // Meknès
      '60000', // Oujda
      '70000', // Agadir
      '80000', // Kenitra
      '90000'  // Tétouan
    ];
    return codes.sort();
  }

  // Méthode pour obtenir les codes postaux d'un pays
  getPostalCodes(country) {
    return this.postalCodes[country] || [];
  }

  // Méthode pour obtenir tous les pays disponibles
  getAvailableCountries() {
    return Object.keys(this.postalCodes);
  }
}

export default new PostalCodeService();