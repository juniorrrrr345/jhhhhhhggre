// Service pour convertir les villes en codes postaux
class CityToPostalService {
  constructor() {
    this.cityToPostalCodes = {
      // France
      'Paris': ['75001', '75002', '75003', '75004', '75005', '75006', '75007', '75008', '75009', '75010', '75011', '75012', '75013', '75014', '75015', '75016', '75017', '75018', '75019', '75020'],
      'Marseille': ['13001', '13002', '13003', '13004', '13005', '13006', '13007', '13008', '13009', '13010', '13011', '13012', '13013', '13014', '13015', '13016'],
      'Lyon': ['69001', '69002', '69003', '69004', '69005', '69006', '69007', '69008', '69009'],
      'Toulouse': ['31000', '31100', '31200', '31300', '31400', '31500'],
      'Nice': ['06000', '06100', '06200', '06300'],
      'Nantes': ['44000', '44100', '44200', '44300'],
      'Montpellier': ['34000', '34070', '34080', '34090'],
      'Strasbourg': ['67000', '67100', '67200'],
      'Bordeaux': ['33000', '33100', '33200', '33300', '33800'],
      'Lille': ['59000', '59160', '59260', '59777', '59800'],
      'Rennes': ['35000', '35200', '35700'],
      'Reims': ['51100'],
      'Saint-Étienne': ['42000', '42100'],
      'Toulon': ['83000', '83100', '83200'],
      'Le Havre': ['76600', '76610', '76620'],
      'Grenoble': ['38000', '38100'],
      'Dijon': ['21000'],
      'Angers': ['49000', '49100'],
      'Nîmes': ['30000', '30900'],
      'Villeurbanne': ['69100'],
      'Clermont-Ferrand': ['63000', '63100'],
      'Le Mans': ['72000', '72100'],
      'Aix-en-Provence': ['13090', '13100', '13290'],
      'Brest': ['29200'],
      'Tours': ['37000', '37100', '37200'],
      'Limoges': ['87000', '87100', '87280'],
      'Amiens': ['80000', '80080', '80090'],
      'Perpignan': ['66000', '66100'],
      'Metz': ['57000', '57050', '57070'],
      'Besançon': ['25000'],
      'Orléans': ['45000', '45100'],
      'Rouen': ['76000', '76100'],
      'Mulhouse': ['68100', '68200'],
      'Caen': ['14000'],
      'Nancy': ['54000', '54100'],
      'Avignon': ['84000'],
      'Poitiers': ['86000'],
      'Versailles': ['78000'],
      'Cannes': ['06400'],
      'Antibes': ['06600'],
      'La Rochelle': ['17000'],
      'Pau': ['64000'],
      'Calais': ['62100'],
      'Béziers': ['34500'],
      'Colmar': ['68000'],
      'Bourges': ['18000'],
      'Ajaccio': ['20000'],
      'Troyes': ['10000'],
      'Niort': ['79000'],
      'Lorient': ['56100'],
      'Valence': ['26000'],
      'Chambéry': ['73000'],
      'Beauvais': ['60000'],
      'Quimper': ['29000'],
      
      // Espagne (exemples)
      'Madrid': ['28001', '28002', '28003', '28004', '28005', '28006', '28007', '28008', '28009', '28010'],
      'Barcelone': ['08001', '08002', '08003', '08004', '08005', '08006', '08007', '08008', '08009', '08010'],
      'Valence': ['46001', '46002', '46003', '46004', '46005'],
      'Séville': ['41001', '41002', '41003', '41004', '41005'],
      'Saragosse': ['50001', '50002', '50003', '50004', '50005'],
      'Malaga': ['29001', '29002', '29003', '29004', '29005'],
      
      // Suisse (exemples)
      'Zurich': ['8000', '8001', '8002', '8003', '8004', '8005', '8006', '8008'],
      'Genève': ['1200', '1201', '1202', '1203', '1204', '1205', '1206', '1207'],
      'Bâle': ['4000', '4001', '4002', '4051', '4052', '4053', '4054', '4055'],
      'Lausanne': ['1000', '1003', '1004', '1005', '1006', '1007', '1010', '1011'],
      'Berne': ['3000', '3001', '3003', '3004', '3005', '3006', '3007', '3008'],
      
      // Belgique (exemples)
      'Bruxelles': ['1000', '1040', '1050', '1060', '1070', '1080', '1090', '1140', '1150', '1160', '1170', '1180', '1190'],
      'Anvers': ['2000', '2018', '2020', '2030', '2040', '2050', '2060'],
      'Gand': ['9000', '9030', '9040', '9050'],
      'Liège': ['4000', '4020', '4030', '4031', '4032'],
      'Charleroi': ['6000', '6001', '6010', '6020', '6030', '6031', '6032'],
      'Bruges': ['8000', '8200', '8310', '8380'],
      
      // Ajouter d'autres villes selon les besoins...
    };
  }

  // Obtenir les codes postaux d'une ville
  getPostalCodesForCity(city) {
    return this.cityToPostalCodes[city] || [];
  }

  // Obtenir tous les codes postaux pour une liste de villes
  getPostalCodesForCities(cities) {
    const allCodes = [];
    cities.forEach(city => {
      const codes = this.getPostalCodesForCity(city);
      allCodes.push(...codes);
    });
    return [...new Set(allCodes)]; // Enlever les doublons
  }

  // Générer une description avec les codes postaux
  generatePostalDescription(cities) {
    const codesByCity = {};
    cities.forEach(city => {
      const codes = this.getPostalCodesForCity(city);
      if (codes.length > 0) {
        codesByCity[city] = codes;
      }
    });

    const descriptions = [];
    for (const [city, codes] of Object.entries(codesByCity)) {
      if (codes.length === 1) {
        descriptions.push(`${city} (${codes[0]})`);
      } else if (codes.length > 1) {
        const first = codes[0];
        const last = codes[codes.length - 1];
        descriptions.push(`${city} (${first}-${last})`);
      }
    }

    return descriptions.join(', ');
  }

  // Vérifier si une ville a des codes postaux
  hasCityPostalCodes(city) {
    return this.cityToPostalCodes[city] && this.cityToPostalCodes[city].length > 0;
  }
}

module.exports = new CityToPostalService();