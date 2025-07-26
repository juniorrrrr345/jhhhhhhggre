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

  // 🇫🇷 FRANCE - Codes des principales villes
  generateFrenchMainCities() {
    return [
      // Paris et région parisienne
      '75001', '75002', '75003', '75004', '75005', '75006', '75007', '75008', '75009', '75010',
      '75011', '75012', '75013', '75014', '75015', '75016', '75017', '75018', '75019', '75020',
      // Banlieue parisienne
      '92100', '92200', '92300', '92400', '92500', '92600', '92700', '92800', '92900',
      '93100', '93200', '93300', '93400', '93500', '93600', '93700', '93800', '93900',
      '94100', '94200', '94300', '94400', '94500', '94600', '94700', '94800', '94900',
      '95100', '95200', '95300', '95400', '95500', '95600', '95700', '95800', '95900',
      // Grandes villes de province
      '69001', '69002', '69003', '69004', '69005', '69006', '69007', '69008', '69009', // Lyon
      '13001', '13002', '13003', '13004', '13005', '13006', '13007', '13008', '13009', // Marseille
      '59000', '59800', '59100', '59200', '59300', '59400', '59500', '59600', '59700', // Lille
      '31000', '31100', '31200', '31300', '31400', '31500', // Toulouse
      '06000', '06100', '06200', '06300', '06400', '06500', // Nice
      '44000', '44100', '44200', '44300', '44400', '44500', // Nantes
      '67000', '67100', '67200', '67300', '67400', '67500', // Strasbourg
      '34000', '34070', '34080', '34090', '34100', '34200', // Montpellier
      '33000', '33100', '33200', '33300', '33400', '33500' // Bordeaux
    ];
  }

  // 🇨🇦 CANADA - Codes des principales villes
  generateCanadianMainCities() {
    return [
      // Toronto
      'M5V', 'M5H', 'M5J', 'M5K', 'M5L', 'M5M', 'M5N', 'M5P', 'M5R', 'M5S',
      // Montréal
      'H2Y', 'H2Z', 'H3A', 'H3B', 'H3C', 'H3G', 'H3H', 'H3J', 'H3K', 'H3L',
      // Vancouver
      'V6B', 'V6C', 'V6E', 'V6G', 'V6H', 'V6J', 'V6K', 'V6L', 'V6M', 'V6N',
      // Calgary
      'T2P', 'T2R', 'T2S', 'T2T', 'T2V', 'T2W', 'T2X', 'T2Y', 'T2Z', 'T3A',
      // Ottawa
      'K1A', 'K1B', 'K1C', 'K1G', 'K1H', 'K1J', 'K1K', 'K1L', 'K1M', 'K1N'
    ];
  }

  // 🇹🇳 TUNISIE - Codes des principales villes
  generateTunisianMainCities() {
    return [
      '1000', '1001', '1002', '1003', '1004', '1005', // Tunis
      '2000', '2001', '2002', '2003', '2004', '2005', // Ariana
      '3000', '3001', '3002', '3003', '3004', '3005', // Béja
      '4000', '4001', '4002', '4003', '4004', '4005', // Ben Arous
      '5000', '5001', '5002', '5003', '5004', '5005', // Bizerte
      '6000', '6001', '6002', '6003', '6004', '6005', // Gabès
      '7000', '7001', '7002', '7003', '7004', '7005', // Gafsa
      '8000', '8001', '8002', '8003', '8004', '8005'  // Jendouba
    ];
  }

  // 🇸🇳 SÉNÉGAL - Codes des principales villes
  generateSenegaleseMainCities() {
    return [
      '10000', '10001', '10002', '10003', '10004', '10005', // Dakar
      '11000', '11001', '11002', '11003', '11004', '11005', // Dakar région
      '21000', '21001', '21002', '21003', '21004', '21005', // Diourbel
      '23000', '23001', '23002', '23003', '23004', '23005', // Fatick
      '27000', '27001', '27002', '27003', '27004', '27005', // Kaolack
      '28000', '28001', '28002', '28003', '28004', '28005', // Kolda
      '29000', '29001', '29002', '29003', '29004', '29005'  // Louga
    ];
  }

  // Méthodes pour les autres pays...
  generateBelgianMainCities() {
    return ['1000', '1020', '1030', '1040', '1050', '1060', '1070', '1080', '1090', '1120', '1130', '1140', '1150', '1160', '1170', '1180', '1190', '2000', '2020', '2030', '2040', '2050', '2060', '2070', '2100', '2140', '2150', '2170', '2180', '2200', '3000', '3010', '3012', '3018', '3020', '3030', '3040', '3050', '3060', '3070'];
  }

  generateSwissMainCities() {
    return ['1000', '1003', '1004', '1005', '1006', '1007', '1008', '1009', '1010', '1012', '8000', '8001', '8002', '8003', '8004', '8005', '8006', '8008', '8032', '8037', '3000', '3001', '3003', '3005', '3006', '3007', '3008', '3010', '3011', '3012', '4000', '4001', '4002', '4003', '4051', '4052', '4053', '4054', '4055', '4056'];
  }

  generateMoroccanMainCities() {
    return ['10000', '10001', '10002', '10003', '10004', '10005', '20000', '20001', '20002', '20003', '20004', '20005', '30000', '30001', '30002', '30003', '30004', '30005', '40000', '40001', '40002', '40003', '40004', '40005', '50000', '50001', '50002', '50003', '50004', '50005'];
  }

  generateAlgerianMainCities() {
    return ['16000', '16001', '16002', '16003', '16004', '16005', '31000', '31001', '31002', '31003', '31004', '31005', '35000', '35001', '35002', '35003', '35004', '35005', '06000', '06001', '06002', '06003', '06004', '06005', '09000', '09001', '09002', '09003', '09004', '09005'];
  }

  generateCameroonianMainCities() {
    return ['1000', '1001', '1002', '1003', '1004', '1005', '2000', '2001', '2002', '2003', '2004', '2005', '3000', '3001', '3002', '3003', '3004', '3005', '4000', '4001', '4002', '4003', '4004', '4005', '5000', '5001', '5002', '5003', '5004', '5005'];
  }

  generateIvorianMainCities() {
    return ['01 BP 01', '01 BP 02', '01 BP 03', '01 BP 04', '01 BP 05', '02 BP 01', '02 BP 02', '02 BP 03', '02 BP 04', '02 BP 05', '03 BP 01', '03 BP 02', '03 BP 03', '03 BP 04', '03 BP 05', '04 BP 01', '04 BP 02', '04 BP 03', '04 BP 04', '04 BP 05', '05 BP 01', '05 BP 02', '05 BP 03', '05 BP 04', '05 BP 05'];
  }

  generateGermanMainCities() {
    return ['10115', '10117', '10119', '10178', '10179', '10243', '10245', '10247', '10249', '10315', '80331', '80333', '80335', '80336', '80337', '80469', '80538', '80539', '80636', '80637', '60311', '60313', '60314', '60316', '60318', '60320', '60322', '60325', '60326', '60327'];
  }

  generateItalianMainCities() {
    return ['00118', '00119', '00120', '00121', '00122', '00123', '00124', '00125', '00126', '00127', '20121', '20122', '20123', '20124', '20125', '20126', '20127', '20128', '20129', '20130', '10121', '10122', '10123', '10124', '10125', '10126', '10127', '10128', '10129', '10130'];
  }

  generateMalagasyMainCities() {
    return ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '201', '202', '203', '204', '205', '206', '207', '208', '209', '210', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310'];
  }

  generateUKMainCities() {
    return ['SW1A', 'SW1', 'SW2', 'SW3', 'SW4', 'SW5', 'SW6', 'SW7', 'SW8', 'SW9', 'W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'EC1', 'EC2', 'EC3', 'EC4', 'WC1', 'WC2', 'E1', 'E2', 'E3', 'E4'];
  }

  generateUSMainCities() {
    return ['10001', '10002', '10003', '10004', '10005', '90210', '90211', '90212', '90213', '90214', '60601', '60602', '60603', '60604', '60605', '75201', '75202', '75203', '75204', '75205', '94102', '94103', '94104', '94105', '94106', '90001', '90002', '90003', '90004', '90005'];
  }

  generateSpanishMainCities() {
    return ['28001', '28002', '28003', '28004', '28005', '28006', '28007', '28008', '28009', '28010', '08001', '08002', '08003', '08004', '08005', '08006', '08007', '08008', '08009', '08010', '46001', '46002', '46003', '46004', '46005', '41001', '41002', '41003', '41004', '41005'];
  }

  generatePortugueseMainCities() {
    return ['1000-001', '1000-002', '1000-003', '1000-004', '1000-005', '4000-001', '4000-002', '4000-003', '4000-004', '4000-005', '3000-001', '3000-002', '3000-003', '3000-004', '3000-005', '2000-001', '2000-002', '2000-003', '2000-004', '2000-005', '8000-001', '8000-002', '8000-003', '8000-004', '8000-005'];
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