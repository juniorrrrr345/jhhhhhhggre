// Codes postaux complets par pays
// Ce fichier génère TOUS les codes postaux possibles pour chaque pays

// Fonction pour générer tous les codes postaux d'un département français
function generateFrenchDepartmentCodes(dept) {
  const codes = [];
  const deptStr = dept.toString().padStart(2, '0');
  
  // Pour chaque département, générer les codes de 000 à 999
  for (let i = 0; i < 1000; i++) {
    const suffix = i.toString().padStart(3, '0');
    codes.push(deptStr + suffix);
  }
  
  return codes;
}

// Fonction pour générer TOUS les codes postaux français
function generateAllFrenchPostalCodes() {
  const allCodes = [];
  
  // Départements métropolitains (01 à 95)
  for (let dept = 1; dept <= 95; dept++) {
    allCodes.push(...generateFrenchDepartmentCodes(dept));
  }
  
  // Départements d'outre-mer
  const domDepts = [971, 972, 973, 974, 976];
  domDepts.forEach(dept => {
    allCodes.push(...generateFrenchDepartmentCodes(dept));
  });
  
  return allCodes;
}

// Fonction pour générer des codes postaux pour d'autres pays
function generatePostalCodesForCountry(country) {
  switch(country) {
    case 'Belgique':
      // Belgique: codes de 1000 à 9999
      const belgiumCodes = [];
      for (let i = 1000; i <= 9999; i++) {
        belgiumCodes.push(i.toString());
      }
      return belgiumCodes;
      
    case 'Suisse':
      // Suisse: codes de 1000 à 9999
      const swissCodes = [];
      for (let i = 1000; i <= 9999; i++) {
        swissCodes.push(i.toString());
      }
      return swissCodes;
      
    case 'Luxembourg':
      // Luxembourg: codes de 1000 à 9999
      const luxCodes = [];
      for (let i = 1000; i <= 9999; i++) {
        luxCodes.push(i.toString());
      }
      return luxCodes;
      
    case 'Allemagne':
      // Allemagne: codes de 01000 à 99999
      const germanyCodes = [];
      for (let i = 1000; i <= 99999; i++) {
        germanyCodes.push(i.toString().padStart(5, '0'));
      }
      return germanyCodes;
      
    case 'Espagne':
      // Espagne: codes de 01000 à 52999
      const spainCodes = [];
      for (let i = 1000; i <= 52999; i++) {
        spainCodes.push(i.toString().padStart(5, '0'));
      }
      return spainCodes;
      
    case 'Italie':
      // Italie: codes de 00010 à 98168
      const italyCodes = [];
      for (let i = 10; i <= 98168; i++) {
        italyCodes.push(i.toString().padStart(5, '0'));
      }
      return italyCodes;
      
    case 'Portugal':
      // Portugal: format XXXX-XXX
      const portugalCodes = [];
      for (let i = 1000; i <= 9999; i++) {
        for (let j = 0; j <= 999; j++) {
          portugalCodes.push(`${i}-${j.toString().padStart(3, '0')}`);
        }
      }
      return portugalCodes.slice(0, 50000); // Limiter pour performance
      
    case 'Pays-Bas':
      // Pays-Bas: format XXXX AA
      const nlCodes = [];
      for (let i = 1000; i <= 9999; i++) {
        for (let letter1 = 65; letter1 <= 90; letter1++) {
          for (let letter2 = 65; letter2 <= 90; letter2++) {
            nlCodes.push(`${i} ${String.fromCharCode(letter1)}${String.fromCharCode(letter2)}`);
          }
        }
      }
      return nlCodes.slice(0, 50000); // Limiter pour performance
      
    case 'Royaume-Uni':
      // UK: format simplifié - principales villes
      return generateUKPostalCodes();
      
    case 'Canada':
      // Canada: format simplifié - principales villes
      return generateCanadianPostalCodes();
      
    case 'États-Unis':
      // USA: codes de 00501 à 99950
      const usaCodes = [];
      for (let i = 501; i <= 99950; i++) {
        usaCodes.push(i.toString().padStart(5, '0'));
      }
      return usaCodes;
      
    default:
      return [];
  }
}

// Fonction pour générer des codes postaux UK principaux
function generateUKPostalCodes() {
  const ukPrefixes = [
    'AB', 'AL', 'B', 'BA', 'BB', 'BD', 'BH', 'BL', 'BN', 'BR', 'BS', 'BT', 'CA', 'CB', 'CF', 'CH', 'CM', 'CO', 'CR', 'CT',
    'CV', 'CW', 'DA', 'DD', 'DE', 'DG', 'DH', 'DL', 'DN', 'DT', 'DY', 'E', 'EC', 'EH', 'EN', 'EX', 'FK', 'FY', 'G', 'GL',
    'GU', 'HA', 'HD', 'HG', 'HP', 'HR', 'HS', 'HU', 'HX', 'IG', 'IP', 'IV', 'KA', 'KT', 'KW', 'KY', 'L', 'LA', 'LD', 'LE',
    'LL', 'LN', 'LS', 'LU', 'M', 'ME', 'MK', 'ML', 'N', 'NE', 'NG', 'NN', 'NP', 'NR', 'NW', 'OL', 'OX', 'PA', 'PE', 'PH',
    'PL', 'PO', 'PR', 'RG', 'RH', 'RM', 'S', 'SA', 'SE', 'SG', 'SK', 'SL', 'SM', 'SN', 'SO', 'SP', 'SR', 'SS', 'ST', 'SW',
    'SY', 'TA', 'TD', 'TF', 'TN', 'TQ', 'TR', 'TS', 'TW', 'UB', 'W', 'WA', 'WC', 'WD', 'WF', 'WN', 'WR', 'WS', 'WV', 'YO'
  ];
  
  const codes = [];
  ukPrefixes.forEach(prefix => {
    for (let i = 1; i <= 99; i++) {
      codes.push(`${prefix}${i} 1AA`);
      codes.push(`${prefix}${i} 2BB`);
      codes.push(`${prefix}${i} 3CC`);
    }
  });
  
  return codes;
}

// Fonction pour générer des codes postaux canadiens principaux
function generateCanadianPostalCodes() {
  const provinces = {
    'A': ['Newfoundland'],
    'B': ['Nova Scotia'],
    'C': ['Prince Edward Island'],
    'E': ['New Brunswick'],
    'G': ['Quebec East'],
    'H': ['Montreal'],
    'J': ['Quebec West'],
    'K': ['Eastern Ontario'],
    'L': ['Central Ontario'],
    'M': ['Toronto'],
    'N': ['Southwestern Ontario'],
    'P': ['Northern Ontario'],
    'R': ['Manitoba'],
    'S': ['Saskatchewan'],
    'T': ['Alberta'],
    'V': ['British Columbia'],
    'X': ['Northwest Territories/Nunavut'],
    'Y': ['Yukon']
  };
  
  const codes = [];
  Object.keys(provinces).forEach(letter => {
    for (let i = 0; i <= 9; i++) {
      for (let j = 65; j <= 90; j++) {
        codes.push(`${letter}${i}${String.fromCharCode(j)} 1A1`);
        codes.push(`${letter}${i}${String.fromCharCode(j)} 2B2`);
        codes.push(`${letter}${i}${String.fromCharCode(j)} 3C3`);
      }
    }
  });
  
  return codes.slice(0, 10000); // Limiter pour performance
}

// Générer les codes postaux complets
const completePostalCodes = {
  'France': generateAllFrenchPostalCodes(),
  'Belgique': generatePostalCodesForCountry('Belgique'),
  'Suisse': generatePostalCodesForCountry('Suisse'),
  'Luxembourg': generatePostalCodesForCountry('Luxembourg'),
  'Allemagne': generatePostalCodesForCountry('Allemagne'),
  'Espagne': generatePostalCodesForCountry('Espagne'),
  'Italie': generatePostalCodesForCountry('Italie'),
  'Portugal': generatePostalCodesForCountry('Portugal'),
  'Pays-Bas': generatePostalCodesForCountry('Pays-Bas'),
  'Royaume-Uni': generatePostalCodesForCountry('Royaume-Uni'),
  'Canada': generatePostalCodesForCountry('Canada'),
  'États-Unis': generatePostalCodesForCountry('États-Unis'),
  'Maroc': [
    // Principales villes du Maroc
    '10000', '10001', '10002', '10003', '10004', '10005', '10006', '10007', '10008', '10009',
    '20000', '20001', '20002', '20003', '20004', '20005', '20006', '20007', '20008', '20009',
    '30000', '30001', '30002', '30003', '30004', '30005', '30006', '30007', '30008', '30009',
    '40000', '40001', '40002', '40003', '40004', '40005', '40006', '40007', '40008', '40009',
    '50000', '50001', '50002', '50003', '50004', '50005', '50006', '50007', '50008', '50009',
    '60000', '60001', '60002', '60003', '60004', '60005', '60006', '60007', '60008', '60009',
    '70000', '70001', '70002', '70003', '70004', '70005', '70006', '70007', '70008', '70009',
    '80000', '80001', '80002', '80003', '80004', '80005', '80006', '80007', '80008', '80009',
    '90000', '90001', '90002', '90003', '90004', '90005', '90006', '90007', '90008', '90009'
  ],
  'Tunisie': [
    // Codes postaux tunisiens (4 chiffres)
    '1000', '1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008', '1009',
    '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009',
    '3000', '3001', '3002', '3003', '3004', '3005', '3006', '3007', '3008', '3009',
    '4000', '4001', '4002', '4003', '4004', '4005', '4006', '4007', '4008', '4009',
    '5000', '5001', '5002', '5003', '5004', '5005', '5006', '5007', '5008', '5009',
    '6000', '6001', '6002', '6003', '6004', '6005', '6006', '6007', '6008', '6009',
    '7000', '7001', '7002', '7003', '7004', '7005', '7006', '7007', '7008', '7009',
    '8000', '8001', '8002', '8003', '8004', '8005', '8006', '8007', '8008', '8009',
    '9000', '9001', '9002', '9003', '9004', '9005', '9006', '9007', '9008', '9009'
  ],
  'Algérie': [
    // Codes postaux algériens (5 chiffres)
    '01000', '02000', '03000', '04000', '05000', '06000', '07000', '08000', '09000', '10000',
    '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000',
    '21000', '22000', '23000', '24000', '25000', '26000', '27000', '28000', '29000', '30000',
    '31000', '32000', '33000', '34000', '35000', '36000', '37000', '38000', '39000', '40000',
    '41000', '42000', '43000', '44000', '45000', '46000', '47000', '48000'
  ]
};

// Fonction pour obtenir les codes postaux d'un pays
export function getPostalCodesForCountry(country) {
  return completePostalCodes[country] || [];
}

// Fonction pour obtenir les codes postaux par département (France uniquement)
export function getPostalCodesByDepartment(department) {
  if (!department) return [];
  
  const deptNumber = department.replace(/\D/g, '');
  if (!deptNumber) return [];
  
  const allFrenchCodes = completePostalCodes['France'] || [];
  return allFrenchCodes.filter(code => code.startsWith(deptNumber.padStart(2, '0')));
}

// Export par défaut
export default completePostalCodes;