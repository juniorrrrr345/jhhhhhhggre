// Service pour gérer les codes postaux par pays (version admin panel)
class PostalCodeService {
  constructor() {
    // Base de données des codes postaux par pays
    this.postalCodes = {
      // 🇫🇷 FRANCE (01-99 départements + DOM-TOM)
      France: this.generateFrenchPostalCodes(),
      
      // 🇪🇸 ESPAGNE - Vrais codes postaux par villes principales
      Espagne: this.generateSpanishPostalCodes(),
      
      // 🇨🇭 SUISSE (1000-9999)
      Suisse: this.generateSwissPostalCodes(),
      
      // 🇮🇹 ITALIE - Vrais codes postaux par villes principales
      Italie: this.generateItalianPostalCodes(),
      
      // 🇩🇪 ALLEMAGNE - Vrais codes postaux par villes principales
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
      Maroc: this.generateMoroccanPostalCodes(),
      
      // 🇦🇹 AUTRICHE - Vrais codes postaux par régions
      Autriche: this.generateAustrianPostalCodes(),
      
      // 🇵🇹 PORTUGAL - Vrais codes postaux par villes principales  
      Portugal: this.generatePortuguesePostalCodes(),
      
      // 🇧🇬 BULGARIE
      Bulgarie: this.generateBulgarianPostalCodes(),
      
      // 🇭🇷 CROATIE
      Croatie: this.generateCroatianPostalCodes(),
      
      // 🇩🇰 DANEMARK
      Danemark: this.generateDanishPostalCodes(),
      
      // 🇫🇮 FINLANDE
      Finlande: this.generateFinnishPostalCodes(),
      
      // 🇬🇷 GRÈCE
      Grèce: this.generateGreekPostalCodes(),
      
      // 🇭🇺 HONGRIE
      Hongrie: this.generateHungarianPostalCodes(),
      
      // 🇮🇪 IRLANDE
      Irlande: this.generateIrishPostalCodes(),
      
      // 🇮🇸 ISLANDE
      Islande: this.generateIcelandicPostalCodes(),
      
      // 🇱🇺 LUXEMBOURG
      Luxembourg: this.generateLuxembourgPostalCodes(),
      
      // 🇳🇴 NORVÈGE
      Norvège: this.generateNorwegianPostalCodes(),
      
      // 🇵🇱 POLOGNE
      Pologne: this.generatePolishPostalCodes(),
      
      // 🇷🇴 ROUMANIE
      Roumanie: this.generateRomanianPostalCodes(),
      
      // 🇷🇸 SERBIE
      Serbie: this.generateSerbianPostalCodes(),
      
      // 🇸🇰 SLOVAQUIE
      Slovaquie: this.generateSlovakPostalCodes(),
      
      // 🇸🇮 SLOVÉNIE
      Slovénie: this.generateSlovenianPostalCodes(),
      
      // 🇸🇪 SUÈDE
      Suède: this.generateSwedishPostalCodes(),
      
      // 🇨🇿 'République Tchèque'
      'République Tchèque': this.generateCzechPostalCodes()
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

  // 🇪🇸 ESPAGNE - Vrais codes postaux par villes principales
  generateSpanishPostalCodes() {
    const codes = [];
    
    // Madrid (28001-28080)
    for (let i = 28001; i <= 28080; i++) {
      codes.push(i.toString());
    }
    
    // Barcelone (08001-08080)
    for (let i = 8001; i <= 8080; i++) {
      codes.push(i.toString().padStart(5, '0'));
    }
    
    // Valence (46001-46080)
    for (let i = 46001; i <= 46080; i++) {
      codes.push(i.toString());
    }
    
    // Séville (41001-41020)
    for (let i = 41001; i <= 41020; i++) {
      codes.push(i.toString());
    }
    
    // Bilbao (48001-48015)
    for (let i = 48001; i <= 48015; i++) {
      codes.push(i.toString());
    }
    
    // Saragosse (50001-50020)
    for (let i = 50001; i <= 50020; i++) {
      codes.push(i.toString());
    }
    
    // Malaga (29001-29018)
    for (let i = 29001; i <= 29018; i++) {
      codes.push(i.toString());
    }
    
    // Palma de Majorque (07001-07015)
    for (let i = 7001; i <= 7015; i++) {
      codes.push(i.toString().padStart(5, '0'));
    }
    
    // Las Palmas Canaries (35001-35020)
    for (let i = 35001; i <= 35020; i++) {
      codes.push(i.toString());
    }
    
    // Santa Cruz de Tenerife (38001-38111)
    for (let i = 38001; i <= 38111; i++) {
      codes.push(i.toString());
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

  // 🇮🇹 ITALIE - Vrais codes postaux par villes principales
  generateItalianPostalCodes() {
    const codes = [];
    
    // Rome: 00118-00199
    for (let i = 118; i <= 199; i++) {
      codes.push(i.toString().padStart(5, '0'));
    }
    
    // Milan: 20121-20162
    for (let i = 20121; i <= 20162; i++) {
      codes.push(i.toString());
    }
    
    // Naples: 80121-80147
    for (let i = 80121; i <= 80147; i++) {
      codes.push(i.toString());
    }
    
    // Turin: 10121-10156
    for (let i = 10121; i <= 10156; i++) {
      codes.push(i.toString());
    }
    
    // Florence: 50121-50145
    for (let i = 50121; i <= 50145; i++) {
      codes.push(i.toString());
    }
    
    // Bologne: 40121-40141
    for (let i = 40121; i <= 40141; i++) {
      codes.push(i.toString());
    }
    
    // Bari: 70121-70131
    for (let i = 70121; i <= 70131; i++) {
      codes.push(i.toString());
    }
    
    // Palerme: 90121-90151
    for (let i = 90121; i <= 90151; i++) {
      codes.push(i.toString());
    }
    
    // Catane: 95121-95131
    for (let i = 95121; i <= 95131; i++) {
      codes.push(i.toString());
    }
    
    // Venise: 30121-30176
    for (let i = 30121; i <= 30176; i++) {
      codes.push(i.toString());
    }
    
    // Gênes: 16121-16167
    for (let i = 16121; i <= 16167; i++) {
      codes.push(i.toString());
    }
    
    return codes.sort();
  }

  // 🇩🇪 ALLEMAGNE - Vrais codes postaux par villes principales
  generateGermanPostalCodes() {
    const codes = [];
    
    // Berlin: 10115-14199
    for (let i = 10115; i <= 10179; i++) {
      codes.push(i.toString());
    }
    for (let i = 10243; i <= 10249; i++) {
      codes.push(i.toString());
    }
    for (let i = 12043; i <= 12689; i += 2) {
      codes.push(i.toString());
    }
    for (let i = 13051; i <= 13629; i += 2) {
      codes.push(i.toString());
    }
    for (let i = 14050; i <= 14199; i += 2) {
      codes.push(i.toString());
    }
    
    // Munich: 80331-81929
    for (let i = 80331; i <= 80999; i += 10) {
      codes.push(i.toString());
    }
    for (let i = 81000; i <= 81929; i += 20) {
      codes.push(i.toString());
    }
    
    // Hamburg: 20095-22769
    for (let i = 20095; i <= 20999; i += 20) {
      codes.push(i.toString());
    }
    for (let i = 21000; i <= 22769; i += 30) {
      codes.push(i.toString());
    }
    
    // Cologne: 50667-51149
    for (let i = 50667; i <= 51149; i += 15) {
      codes.push(i.toString());
    }
    
    // Frankfurt: 60313-65936
    for (let i = 60313; i <= 60599; i += 10) {
      codes.push(i.toString());
    }
    for (let i = 65000; i <= 65936; i += 30) {
      codes.push(i.toString());
    }
    
    // Stuttgart: 70173-70629
    for (let i = 70173; i <= 70629; i += 15) {
      codes.push(i.toString());
    }
    
    // Düsseldorf: 40213-40629
    for (let i = 40213; i <= 40629; i += 15) {
      codes.push(i.toString());
    }
    
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

  // 🇦🇹 AUTRICHE - Vrais codes postaux par régions
  generateAustrianPostalCodes() {
    const codes = [];
    
    // Vienne: 1010-1230
    for (let i = 1010; i <= 1230; i += 10) {
      codes.push(i.toString());
    }
    
    // Graz: 8010-8042
    for (let i = 8010; i <= 8042; i += 10) {
      codes.push(i.toString());
    }
    
    // Linz: 4020-4040
    for (let i = 4020; i <= 4040; i += 10) {
      codes.push(i.toString());
    }
    
    // Salzburg: 5020-5026
    for (let i = 5020; i <= 5026; i++) {
      codes.push(i.toString());
    }
    
    // Innsbruck: 6020-6080
    for (let i = 6020; i <= 6080; i += 20) {
      codes.push(i.toString());
    }
    
    // Codes régionaux par état
    for (let i = 2000; i <= 2999; i += 100) { // Basse-Autriche est
      codes.push(i.toString());
    }
    for (let i = 3000; i <= 3999; i += 100) { // Basse-Autriche ouest  
      codes.push(i.toString());
    }
    for (let i = 7000; i <= 7999; i += 100) { // Burgenland
      codes.push(i.toString());
    }
    for (let i = 9000; i <= 9999; i += 100) { // Carinthie et Tyrol oriental
      codes.push(i.toString());
    }
    
    return codes.sort();
  }

  // 🇵🇹 PORTUGAL - Vrais codes postaux par villes principales
  generatePortuguesePostalCodes() {
    const codes = [];
    
    // Lisbonne: 1000-1990
    for (let i = 1000; i <= 1990; i += 10) {
      codes.push(i.toString());
    }
    
    // Porto: 4000-4999
    for (let i = 4000; i <= 4999; i += 50) {
      codes.push(i.toString());
    }
    
    // Coimbra: 3000-3999
    for (let i = 3000; i <= 3999; i += 50) {
      codes.push(i.toString());
    }
    
    // Faro: 8000-8999
    for (let i = 8000; i <= 8999; i += 100) {
      codes.push(i.toString());
    }
    
    // Braga: 4700-4799
    for (let i = 4700; i <= 4799; i += 10) {
      codes.push(i.toString());
    }
    
    return codes.sort();
  }

  // 🇧🇬 BULGARIE
  generateBulgarianPostalCodes() {
    const codes = [];
    for (let i = 1000; i <= 9999; i += 100) {
      codes.push(i.toString());
    }
    return codes.sort();
  }

  // 🇭🇷 CROATIE  
  generateCroatianPostalCodes() {
    const codes = [];
    for (let i = 10000; i <= 53999; i += 1000) {
      codes.push(i.toString());
    }
    return codes.sort();
  }

  // 🇩🇰 DANEMARK
  generateDanishPostalCodes() {
    const codes = [];
    for (let i = 1000; i <= 9999; i += 100) {
      codes.push(i.toString());
    }
    return codes.sort();
  }

  // 🇫🇮 FINLANDE
  generateFinnishPostalCodes() {
    const codes = [];
    for (let i = 100; i <= 99999; i += 1000) {
      codes.push(i.toString().padStart(5, '0'));
    }
    return codes.sort();
  }

  // 🇬🇷 GRÈCE
  generateGreekPostalCodes() {
    const codes = [];
    for (let i = 10000; i <= 99999; i += 1000) {
      codes.push(i.toString());
    }
    return codes.sort();
  }

  // 🇭🇺 HONGRIE
  generateHungarianPostalCodes() {
    const codes = [];
    for (let i = 1000; i <= 9999; i += 100) {
      codes.push(i.toString());
    }
    return codes.sort();
  }

  // 🇮🇪 IRLANDE
  generateIrishPostalCodes() {
    const codes = [
      'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', // Dublin
      'C01', 'C02', 'C03', // Cork
      'G01', 'G02', 'G03', // Galway
      'L01', 'L02', 'L03', // Limerick
      'W01', 'W02', 'W03'  // Waterford
    ];
    return codes.sort();
  }

  // 🇮🇸 ISLANDE
  generateIcelandicPostalCodes() {
    const codes = [];
    for (let i = 100; i <= 999; i += 10) {
      codes.push(i.toString());
    }
    return codes.sort();
  }

  // 🇱🇺 LUXEMBOURG
  generateLuxembourgPostalCodes() {
    const codes = [];
    for (let i = 1000; i <= 9999; i += 100) {
      codes.push(i.toString());
    }
    return codes.sort();
  }

  // 🇳🇴 NORVÈGE
  generateNorwegianPostalCodes() {
    const codes = [];
    for (let i = 100; i <= 9999; i += 100) {
      codes.push(i.toString());
    }
    return codes.sort();
  }

  // 🇵🇱 POLOGNE
  generatePolishPostalCodes() {
    const codes = [];
    for (let i = 100; i <= 99999; i += 1000) {
      codes.push(i.toString().padStart(5, '0'));
    }
    return codes.sort();
  }

  // 🇷🇴 ROUMANIE
  generateRomanianPostalCodes() {
    const codes = [];
    for (let i = 10000; i <= 99999; i += 1000) {
      codes.push(i.toString());
    }
    return codes.sort();
  }

  // 🇷🇸 SERBIE
  generateSerbianPostalCodes() {
    const codes = [];
    for (let i = 10000; i <= 38999; i += 1000) {
      codes.push(i.toString());
    }
    return codes.sort();
  }

  // 🇸🇰 SLOVAQUIE
  generateSlovakPostalCodes() {
    const codes = [];
    for (let i = 10000; i <= 99999; i += 1000) {
      codes.push(i.toString());
    }
    return codes.sort();
  }

  // 🇸🇮 SLOVÉNIE
  generateSlovenianPostalCodes() {
    const codes = [];
    for (let i = 1000; i <= 9999; i += 100) {
      codes.push(i.toString());
    }
    return codes.sort();
  }

  // 🇸🇪 SUÈDE
  generateSwedishPostalCodes() {
    const codes = [];
    for (let i = 100; i <= 99999; i += 1000) {
      codes.push(i.toString().padStart(5, '0'));
    }
    return codes.sort();
  }

  // 🇨🇿 RÉPUBLIQUE TCHÈQUE
  generateCzechPostalCodes() {
    const codes = [];
    for (let i = 10000; i <= 79999; i += 1000) {
      codes.push(i.toString());
    }
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