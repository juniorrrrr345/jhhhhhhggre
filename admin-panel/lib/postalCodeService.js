// Service pour gérer les codes postaux par pays
class PostalCodeService {
  constructor() {
    this.lastReload = new Date();
    // Base de données des codes postaux par pays - TOUS LES PAYS D'EUROPE + PAYS SUPPLÉMENTAIRES
    this.postalCodes = {
      // PAYS EUROPÉENS
      'France': this.generateFrenchPostalCodes(),
      'Allemagne': this.generateGermanPostalCodes(),
      'Italie': this.generateItalianPostalCodes(),
      'Espagne': this.generateSpanishPostalCodes(),
      'Portugal': this.generatePortuguesePostalCodes(),
      'Royaume-Uni': this.generateUKPostalCodes(),
      'Belgique': this.generateBelgianPostalCodes(),
      'Pays-Bas': this.generateDutchPostalCodes(),
      'Suisse': this.generateSwissPostalCodes(),
      'Autriche': this.generateAustrianPostalCodes(),
      'Luxembourg': this.generateLuxembourgPostalCodes(),
      'Irlande': this.generateIrishPostalCodes(),
      'Danemark': this.generateDanishPostalCodes(),
      'Suède': this.generateSwedishPostalCodes(),
      'Norvège': this.generateNorwegianPostalCodes(),
      'Finlande': this.generateFinnishPostalCodes(),
      'Islande': this.generateIcelandicPostalCodes(),
      'Pologne': this.generatePolishPostalCodes(),
      'République Tchèque': this.generateCzechPostalCodes(),
      'Slovaquie': this.generateSlovakPostalCodes(),
      'Hongrie': this.generateHungarianPostalCodes(),
      'Slovénie': this.generateSlovenianPostalCodes(),
      'Croatie': this.generateCroatianPostalCodes(),
      'Roumanie': this.generateRomanianPostalCodes(),
      'Bulgarie': this.generateBulgarianPostalCodes(),
      'Grèce': this.generateGreekPostalCodes(),
      'Chypre': this.generateCypriotPostalCodes(),
      'Malte': this.generateMaltesePostalCodes(),
      'Estonie': this.generateEstonianPostalCodes(),
      'Lettonie': this.generateLatvianPostalCodes(),
      'Lituanie': this.generateLithuanianPostalCodes(),
      'Monaco': this.generateMonacoPostalCodes(),
      'Andorre': this.generateAndorranPostalCodes(),
      'Saint-Marin': this.generateSanMarinoPostalCodes(),
      'Vatican': this.generateVaticanPostalCodes(),
      'Liechtenstein': this.generateLiechtensteinPostalCodes(),
      
      // PAYS SUPPLÉMENTAIRES DEMANDÉS
      'Maroc': this.generateMoroccanPostalCodes(),
      'Canada': this.generateCanadianPostalCodes(),
      'USA': this.generateUSPostalCodes(),
      'Thaïlande': this.generateThaiPostalCodes(),
      
      // PAYS EXISTANTS
      'Tunisie': this.generateGenericPostalCodes(),
      'Algérie': this.generateGenericPostalCodes(),
      'Autre': this.generateGenericPostalCodes()
    };
  }

  // 🇫🇷 FRANCE - Départements principaux seulement (OPTIMISÉ)
  generateFrenchPostalCodes() {
    const codes = [];
    // Seulement les départements principaux (pas tous les codes postaux)
    for (let dept = 1; dept <= 95; dept++) {
      if (dept === 20) continue; // Corse = 2A/2B
      const deptStr = dept.toString().padStart(2, '0');
      codes.push(deptStr); // Juste le numéro de département, pas tous les codes
    }
    // Corse
    codes.push('2A', '2B');
    // DOM-TOM principaux
    codes.push('971', '972', '973', '974', '976');
    return codes.sort();
  }

  // 🇪🇸 ESPAGNE - Toutes les provinces
  generateSpanishPostalCodes() {
    const codes = [];
    // Provinces 01-52
    for (let prov = 1; prov <= 52; prov++) {
      const provStr = prov.toString().padStart(2, '0');
      for (let city = 0; city <= 999; city++) {
        codes.push(`${provStr}${city.toString().padStart(3, '0')}`);
      }
    }
    return codes.sort();
  }

  // 🇨🇭 SUISSE - Zones principales (OPTIMISÉ)
  generateSwissPostalCodes() {
    const codes = [];
    // Principales zones seulement
    for (let i = 10; i <= 99; i++) {
      codes.push(i.toString());
    }
    return codes;
  }

  // 🇮🇹 ITALIE
  generateItalianPostalCodes() {
    const codes = [];
    for (let i = 10; i <= 99999; i++) {
      codes.push(i.toString().padStart(5, '0'));
    }
    return codes;
  }

  // 🇩🇪 ALLEMAGNE
  generateGermanPostalCodes() {
    const codes = [];
    for (let i = 1067; i <= 99998; i++) {
      codes.push(i.toString().padStart(5, '0'));
    }
    return codes;
  }

  // 🇧🇪 BELGIQUE - Zones principales (OPTIMISÉ)
  generateBelgianPostalCodes() {
    const codes = [];
    // Principales zones seulement
    for (let i = 10; i <= 99; i++) {
      codes.push(i.toString());
    }
    return codes;
  }

  // 🇳🇱 PAYS-BAS - Zones principales (OPTIMISÉ)
  generateDutchPostalCodes() {
    const codes = [];
    // Principales zones seulement
    for (let i = 10; i <= 99; i++) {
      codes.push(i.toString());
    }
    return codes;
  }

  // 🇬🇧 ROYAUME-UNI - Zones principales
  generateUKPostalCodes() {
    const areas = [
      // Londres
      'SW1A', 'SW1', 'SW2', 'SW3', 'SW4', 'SW5', 'SW6', 'SW7', 'SW8', 'SW9',
      'W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'W14',
      'EC1', 'EC2', 'EC3', 'EC4', 'WC1', 'WC2',
      'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11', 'E12', 'E13', 'E14', 'E15', 'E16', 'E17', 'E18', 'E20',
      'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N9', 'N10', 'N11', 'N12', 'N13', 'N14', 'N15', 'N16', 'N17', 'N18', 'N19', 'N20', 'N21', 'N22',
      'SE1', 'SE2', 'SE3', 'SE4', 'SE5', 'SE6', 'SE7', 'SE8', 'SE9', 'SE10', 'SE11', 'SE12', 'SE13', 'SE14', 'SE15', 'SE16', 'SE17', 'SE18', 'SE19', 'SE20', 'SE21', 'SE22', 'SE23', 'SE24', 'SE25', 'SE26', 'SE27', 'SE28',
      'NW1', 'NW2', 'NW3', 'NW4', 'NW5', 'NW6', 'NW7', 'NW8', 'NW9', 'NW10', 'NW11',
      // Autres villes principales
      'M1', 'M2', 'M3', 'M4', 'M5', 'M8', 'M9', 'M11', 'M12', 'M13', 'M14', 'M15', 'M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24', 'M25', 'M26', 'M27', 'M28', 'M29', 'M30', 'M31', 'M32', 'M33', 'M34', 'M35', 'M38', 'M40', 'M41', 'M43', 'M44', 'M45', 'M46', 'M50', 'M60', 'M90',
      'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12', 'B13', 'B14', 'B15', 'B16', 'B17', 'B18', 'B19', 'B20', 'B21', 'B23', 'B24', 'B25', 'B26', 'B27', 'B28', 'B29', 'B30', 'B31', 'B32', 'B33', 'B34', 'B35', 'B36', 'B37', 'B38', 'B42', 'B43', 'B44', 'B45', 'B46', 'B47', 'B48', 'B49', 'B50', 'B60', 'B61', 'B62', 'B63', 'B64', 'B65', 'B66', 'B67', 'B68', 'B69', 'B70', 'B71', 'B72', 'B73', 'B74', 'B75', 'B76', 'B77', 'B78', 'B79', 'B80', 'B90', 'B91', 'B92', 'B93', 'B94', 'B95', 'B96', 'B97', 'B98',
      'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11', 'L12', 'L13', 'L14', 'L15', 'L16', 'L17', 'L18', 'L19', 'L20', 'L21', 'L22', 'L23', 'L24', 'L25', 'L26', 'L27', 'L28', 'L29', 'L30', 'L31', 'L32', 'L33', 'L34', 'L35', 'L36', 'L37', 'L38', 'L39', 'L40', 'L67', 'L68', 'L69', 'L70', 'L71', 'L72', 'L73', 'L74', 'L75',
      // Et d'autres grandes villes...
      'LS1', 'LS2', 'LS3', 'LS4', 'LS5', 'LS6', 'LS7', 'LS8', 'LS9', 'LS10', 'LS11', 'LS12', 'LS13', 'LS14', 'LS15', 'LS16', 'LS17', 'LS18', 'LS19', 'LS20', 'LS21', 'LS22', 'LS23', 'LS24', 'LS25', 'LS26', 'LS27', 'LS28', 'LS29'
    ];
    return areas.sort();
  }

  // 🇺🇸 USA - États + ZIP principaux
  generateUSPostalCodes() {
    const codes = [];
    // ZIP codes principaux par état (sample des plus grandes villes)
    const stateZips = {
      'AL': ['35004', '35005', '35006', '35007', '35010'],
      'AK': ['99501', '99502', '99503', '99504', '99505'],
      'AZ': ['85001', '85002', '85003', '85004', '85005'],
      'AR': ['71601', '71602', '71603', '71630', '71631'],
      'CA': ['90001', '90002', '90003', '90004', '90005', '90006', '90007', '90008', '90009', '90010'],
      'CO': ['80001', '80002', '80003', '80004', '80005'],
      'CT': ['06001', '06002', '06006', '06010', '06011'],
      'DE': ['19701', '19702', '19703', '19706', '19707'],
      'FL': ['32003', '32004', '32006', '32007', '32008'],
      'GA': ['30001', '30002', '30004', '30005', '30006'],
      'HI': ['96701', '96703', '96704', '96705', '96706'],
      'ID': ['83001', '83002', '83003', '83004', '83005'],
      'IL': ['60001', '60002', '60004', '60005', '60006'],
      'IN': ['46001', '46002', '46003', '46011', '46012'],
      'IA': ['50001', '50002', '50003', '50006', '50007'],
      'KS': ['66002', '66006', '66007', '66008', '66010'],
      'KY': ['40003', '40004', '40006', '40007', '40008'],
      'LA': ['70001', '70002', '70003', '70004', '70005'],
      'ME': ['04001', '04002', '04003', '04004', '04005'],
      'MD': ['20601', '20602', '20603', '20604', '20606'],
      'MA': ['01001', '01002', '01003', '01004', '01005'],
      'MI': ['48001', '48002', '48003', '48004', '48005'],
      'MN': ['55001', '55002', '55003', '55004', '55005'],
      'MS': ['38601', '38602', '38603', '38606', '38609'],
      'MO': ['63001', '63002', '63003', '63005', '63006'],
      'MT': ['59001', '59002', '59003', '59004', '59005'],
      'NE': ['68001', '68002', '68003', '68004', '68005'],
      'NV': ['89001', '89002', '89003', '89004', '89005'],
      'NH': ['03031', '03032', '03033', '03034', '03036'],
      'NJ': ['07001', '07002', '07003', '07004', '07005'],
      'NM': ['87001', '87002', '87004', '87005', '87006'],
      'NY': ['10001', '10002', '10003', '10004', '10005', '10006', '10007', '10008', '10009', '10010'],
      'NC': ['27006', '27007', '27009', '27010', '27011'],
      'ND': ['58001', '58002', '58004', '58005', '58006'],
      'OH': ['43001', '43002', '43003', '43004', '43005'],
      'OK': ['73001', '73002', '73003', '73004', '73005'],
      'OR': ['97001', '97002', '97003', '97004', '97005'],
      'PA': ['15001', '15002', '15003', '15004', '15005'],
      'RI': ['02801', '02802', '02804', '02806', '02807'],
      'SC': ['29001', '29002', '29003', '29006', '29009'],
      'SD': ['57001', '57002', '57003', '57004', '57005'],
      'TN': ['37010', '37011', '37012', '37013', '37014'],
      'TX': ['75001', '75002', '75003', '75004', '75005', '75006', '75007', '75008', '75009', '75010'],
      'UT': ['84001', '84002', '84003', '84004', '84005'],
      'VT': ['05001', '05003', '05004', '05005', '05009'],
      'VA': ['20101', '20102', '20103', '20104', '20105'],
      'WA': ['98001', '98002', '98003', '98004', '98005'],
      'WV': ['24701', '24712', '24714', '24715', '24716'],
      'WI': ['53001', '53002', '53003', '53004', '53005'],
      'WY': ['82001', '82002', '82003', '82005', '82006']
    };
    
    Object.values(stateZips).forEach(zips => {
      codes.push(...zips);
    });
    return codes.sort();
  }

  // 🇨🇦 CANADA
  generateCanadianPostalCodes() {
    const codes = [];
    const provinces = ['A', 'B', 'C', 'E', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'X', 'Y'];
    
    provinces.forEach(prov => {
      for (let i = 0; i <= 9; i++) {
        for (let j = 0; j <= 9; j++) {
          for (let k = 0; k <= 9; k++) {
            codes.push(`${prov}${i}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${j}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${k}`);
          }
        }
      }
    });
    return codes.slice(0, 2000).sort(); // Limiter pour performance
  }

  // 🇹🇭 THAÏLANDE
  generateThaiPostalCodes() {
    const codes = [];
    for (let i = 10000; i <= 99999; i++) {
      codes.push(i.toString());
    }
    return codes;
  }

  // 🇲🇦 MAROC
  generateMoroccanPostalCodes() {
    const codes = [];
    for (let i = 10000; i <= 99999; i++) {
      codes.push(i.toString());
    }
    return codes;
  }

  // 🇹🇳 TUNISIE
  generateTunisianPostalCodes() {
    const codes = [];
    // Tunisie utilise un système à 4 chiffres (1000-9999)
    for (let i = 1000; i <= 9999; i++) {
      codes.push(i.toString());
    }
    return codes;
  }

  // 🇸🇳 SÉNÉGAL
  generateSenegalesePostalCodes() {
    const codes = [];
    // Sénégal utilise un système à 5 chiffres (10000-99999)
    for (let i = 10000; i <= 99999; i++) {
      codes.push(i.toString());
    }
    return codes;
  }

  // 🇩🇿 ALGÉRIE
  generateAlgerianPostalCodes() {
    const codes = [];
    // Algérie utilise un système à 5 chiffres (01000-99999)
    for (let i = 1000; i <= 99999; i++) {
      codes.push(i.toString().padStart(5, '0'));
    }
    return codes;
  }

  // 🇨🇲 CAMEROUN
  generateCameroonianPostalCodes() {
    const codes = [];
    // Cameroun utilise principalement des P.O. Box mais aussi des codes modernes
    // Codes principaux des grandes villes
    const mainCities = [
      // Yaoundé
      '999', '1000', '1001', '1002', '1003', '1004', '1005',
      // Douala
      '2000', '2001', '2002', '2003', '2004', '2005', '2006',
      // Bamenda
      '3000', '3001', '3002', '3003',
      // Bafoussam
      '4000', '4001', '4002',
      // Garoua
      '5000', '5001', '5002',
      // Maroua
      '6000', '6001', '6002',
      // Ngaoundéré
      '7000', '7001', '7002',
      // Bertoua
      '8000', '8001',
      // Ebolowa
      '9000', '9001'
    ];
    
    codes.push(...mainCities);
    
    // Ajouter des codes génériques pour les autres zones
    for (let i = 100; i <= 999; i++) {
      codes.push(i.toString());
    }
    
    return codes.sort();
  }

  // 🇨🇮 CÔTE D'IVOIRE
  generateIvorianPostalCodes() {
    const codes = [];
    // Côte d'Ivoire utilise des codes postaux modernes
    // Abidjan et districts
    const abidjanCodes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
    
    abidjanCodes.forEach(code => {
      codes.push(`01 BP ${code}`);
      codes.push(`02 BP ${code}`);
      codes.push(`03 BP ${code}`);
      codes.push(`04 BP ${code}`);
      codes.push(`05 BP ${code}`);
    });
    
    // Autres grandes villes avec codes simplifiés
    for (let i = 100; i <= 999; i++) {
      codes.push(i.toString());
    }
    
    return codes.sort();
  }

  // 🇲🇬 MADAGASCAR
  generateMalagasyPostalCodes() {
    const codes = [];
    // Madagascar utilise un système à 3 chiffres (101-999)
    for (let i = 101; i <= 999; i++) {
      codes.push(i.toString());
    }
    return codes;
  }

  // 🇵🇹 PORTUGAL
  generatePortuguesePostalCodes() {
    const codes = [];
    // Portugal utilise un système à 4 chiffres (1000-9999) + 3 chiffres extension
    for (let i = 1000; i <= 9999; i++) {
      for (let j = 0; j <= 999; j += 100) { // Sample avec pas de 100 pour performance
        codes.push(`${i}-${j.toString().padStart(3, '0')}`);
      }
    }
    return codes;
  }

  // 🇦🇺 AUSTRALIE
  generateAustralianPostalCodes() {
    const codes = [];
    // Australie utilise un système à 4 chiffres (0000-9999)
    for (let i = 1000; i <= 9999; i++) {
      codes.push(i.toString());
    }
    return codes;
  }

  // 🇧🇷 BRÉSIL
  generateBrazilianPostalCodes() {
    const codes = [];
    // Brésil utilise CEP: 01000-000 to 99999-999
    for (let i = 1000; i <= 99999; i += 10) { // Sample avec pas de 10 pour performance
      codes.push(`${i.toString().padStart(5, '0')}-000`);
    }
    return codes;
  }

  // 🇯🇵 JAPON
  generateJapanesePostalCodes() {
    const codes = [];
    // Japon utilise le format: 100-0000 to 999-9999
    for (let i = 100; i <= 999; i++) {
      for (let j = 0; j <= 9999; j += 100) { // Sample avec pas de 100 pour performance
        codes.push(`${i}-${j.toString().padStart(4, '0')}`);
      }
    }
    return codes;
  }

  // Générer des codes génériques pour "Autre" (OPTIMISÉ)
  generateGenericPostalCodes() {
    const codes = [];
    // Codes génériques très simples
    for (let i = 1; i <= 50; i++) {
      codes.push(i.toString().padStart(2, '0'));
    }
    return codes;
  }

  // Récupérer les codes postaux d'un pays
  getPostalCodes(country) {
    // Si le pays n'existe pas dans notre service, générer des codes génériques
    if (!this.postalCodes[country] && country === 'Autre') {
      return this.generateGenericPostalCodes();
    }
    return this.postalCodes[country] || [];
  }

  // Récupérer les pays disponibles (seulement ceux définis)
  getAvailableCountries() {
    return Object.keys(this.postalCodes);
  }

  // Créer un clavier avec les codes postaux (paginé pour Telegram)
  createPostalCodeKeyboard(country, page = 0, itemsPerPage = 16) {
    const codes = this.getPostalCodes(country);
    
    // Créer des diminutifs par pays
    let diminutifs = [];
    
    if (country === 'France') {
      // France: 01, 02, 03... 95 (départements)
      for (let i = 1; i <= 95; i++) {
        if (i === 20) continue; // Corse = 2A/2B
        diminutifs.push(i.toString().padStart(2, '0'));
      }
      diminutifs.push('2A', '2B'); // Corse
      diminutifs.push('971', '972', '973', '974', '976'); // DOM-TOM
    } else if (country === 'Espagne') {
      // Espagne: 01, 02, 03... 52 (provinces)
      for (let i = 1; i <= 52; i++) {
        diminutifs.push(i.toString().padStart(2, '0'));
      }
    } else if (country === 'Allemagne') {
      // Allemagne: 01, 02, 03... 99 (zones principales)
      for (let i = 1; i <= 99; i++) {
        diminutifs.push(i.toString().padStart(2, '0'));
      }
    } else if (country === 'Pays-Bas') {
      // Pays-Bas: 10, 11, 12... 99 (zones)
      for (let i = 10; i <= 99; i++) {
        diminutifs.push(i.toString());
      }
    } else if (country === 'Belgique') {
      // Belgique: 10, 11, 12... 99
      for (let i = 10; i <= 99; i++) {
        diminutifs.push(i.toString());
      }
    } else if (country === 'Suisse') {
      // Suisse: 10, 11, 12... 99
      for (let i = 10; i <= 99; i++) {
        diminutifs.push(i.toString());
      }
    } else if (country === 'Italie') {
      // Italie: 00, 01, 02... 99 (zones)
      for (let i = 0; i <= 99; i++) {
        diminutifs.push(i.toString().padStart(2, '0'));
      }
    } else if (country === 'Royaume-Uni') {
      // UK: Zones alphabétiques simplifiées
      diminutifs = ['SW', 'W', 'EC', 'WC', 'E', 'N', 'SE', 'NW', 'M', 'B', 'L', 'LS', 'S', 'G', 'CF', 'EH'];
    } else if (country === 'États-Unis') {
      // USA: États (codes à 2 lettres)
      diminutifs = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
    } else if (country === 'Canada') {
      // Canada: Provinces
      diminutifs = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
    } else if (country === 'Thaïlande') {
      // Thaïlande: 10, 11, 12... 99
      for (let i = 10; i <= 99; i++) {
        diminutifs.push(i.toString());
      }
    } else if (country === 'Maroc') {
      // Maroc: 10, 11, 12... 99
      for (let i = 10; i <= 99; i++) {
        diminutifs.push(i.toString());
      }
    } else if (country === 'Tunisie') {
      // Tunisie: 10, 11, 12... 99 (zones principales)
      for (let i = 10; i <= 99; i++) {
        diminutifs.push(i.toString());
      }
    } else if (country === 'Sénégal') {
      // Sénégal: 10, 11, 12... 99
      for (let i = 10; i <= 99; i++) {
        diminutifs.push(i.toString());
      }
    } else if (country === 'Algérie') {
      // Algérie: 01, 02, 03... 99
      for (let i = 1; i <= 99; i++) {
        diminutifs.push(i.toString().padStart(2, '0'));
      }
    } else if (country === 'Cameroun') {
      // Cameroun: Zones principales + codes villes
      diminutifs = ['10', '20', '30', '40', '50', '60', '70', '80', '90', '99', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    } else if (country === 'Côte d\'Ivoire') {
      // Côte d'Ivoire: BP districts + zones
      diminutifs = ['01', '02', '03', '04', '05', '10', '11', '12', '13', '14', '15', '20', '21', '22', '23', '24', '25'];
    } else if (country === 'Madagascar') {
      // Madagascar: 10, 11, 12... 99
      for (let i = 10; i <= 99; i++) {
        diminutifs.push(i.toString());
      }
    } else if (country === 'Portugal') {
      // Portugal: 10, 11, 12... 99 (zones principales)
      for (let i = 10; i <= 99; i++) {
        diminutifs.push(i.toString());
      }
    } else if (country === 'Australie') {
      // Australie: États/Territoires
      diminutifs = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT', '10', '20', '30', '40', '50', '60', '70', '80', '90'];
    } else if (country === 'Brésil') {
      // Brésil: États principaux
      diminutifs = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'ES', 'PE', 'CE', 'PA', 'DF', 'MT', 'MS', 'PB', 'RN', 'AL', 'PI', 'SE'];
    } else if (country === 'Japon') {
      // Japon: Préfectures principales
      diminutifs = ['100', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114', '115', '150', '160', '170', '180'];
    } else {
      // Fallback: utiliser les premiers caractères des codes
      const uniquePrefixes = [...new Set(codes.map(code => code.substring(0, 2)))];
      diminutifs = uniquePrefixes.slice(0, 50); // Limiter à 50 pour la performance
    }
    
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageCodes = diminutifs.slice(startIndex, endIndex);
    
    const keyboard = [];
    
    // Organiser en lignes de 2 codes postaux (style menu Telegram)
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
    
    // Boutons de navigation (basés sur les diminutifs, pas les codes complets)
    const navButtons = [];
    if (page > 0) {
      navButtons.push({
        text: '⬅️ Précédent',
        callback_data: `postal_nav_${country}_${page - 1}`
      });
    }
    if (endIndex < diminutifs.length) {
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

  // Fonctions pour générer les codes postaux des nouveaux pays européens
  
  generateGermanPostalCodes() {
    const codes = [];
    // Allemagne: 01000-99999
    for (let i = 1000; i <= 99999; i += 1000) {
      codes.push(i.toString().padStart(5, '0'));
    }
    return codes.slice(0, 50); // Limiter pour performance
  }

  generateItalianPostalCodes() {
    const codes = [];
    // Italie: 00100-98168
    for (let i = 100; i <= 98000; i += 1000) {
      codes.push(i.toString().padStart(5, '0'));
    }
    return codes.slice(0, 50);
  }

  generatePortuguesePostalCodes() {
    const codes = [];
    // Portugal: 1000-9999
    for (let i = 1000; i <= 9999; i += 100) {
      codes.push(i.toString() + '-001');
    }
    return codes.slice(0, 50);
  }

  generateUKPostalCodes() {
    const codes = [];
    // Royaume-Uni: codes alphanumériques
    const areas = ['B', 'E', 'EC', 'M', 'N', 'NW', 'S', 'SE', 'SW', 'W', 'WC'];
    areas.forEach(area => {
      for (let i = 1; i <= 20; i++) {
        codes.push(`${area}${i} 1AA`);
      }
    });
    return codes.slice(0, 50);
  }

  generateAustrianPostalCodes() {
    const codes = [];
    // Autriche: 1000-9999
    for (let i = 1000; i <= 9999; i += 100) {
      codes.push(i.toString());
    }
    return codes.slice(0, 50);
  }

  generateLuxembourgPostalCodes() {
    const codes = [];
    // Luxembourg: 1000-9999
    for (let i = 1000; i <= 9999; i += 100) {
      codes.push(i.toString());
    }
    return codes.slice(0, 30);
  }

  generateIrishPostalCodes() {
    const codes = [];
    // Irlande: système Eircode
    const areas = ['D01', 'D02', 'D03', 'D04', 'D06', 'D07', 'D08', 'D09', 'D10', 'D11'];
    areas.forEach(area => {
      codes.push(`${area} A1B2`);
    });
    return codes;
  }

  generateDanishPostalCodes() {
    const codes = [];
    // Danemark: 1000-9999
    for (let i = 1000; i <= 9999; i += 100) {
      codes.push(i.toString());
    }
    return codes.slice(0, 50);
  }

  generateSwedishPostalCodes() {
    const codes = [];
    // Suède: 10000-99999
    for (let i = 10000; i <= 99999; i += 1000) {
      codes.push(i.toString().substring(0, 3) + ' ' + i.toString().substring(3));
    }
    return codes.slice(0, 50);
  }

  generateNorwegianPostalCodes() {
    const codes = [];
    // Norvège: 0001-9999
    for (let i = 1; i <= 9999; i += 100) {
      codes.push(i.toString().padStart(4, '0'));
    }
    return codes.slice(0, 50);
  }

  generateFinnishPostalCodes() {
    const codes = [];
    // Finlande: 00100-99999
    for (let i = 100; i <= 99999; i += 1000) {
      codes.push(i.toString().padStart(5, '0'));
    }
    return codes.slice(0, 50);
  }

  generateIcelandicPostalCodes() {
    const codes = [];
    // Islande: 101-999
    for (let i = 101; i <= 999; i += 10) {
      codes.push(i.toString());
    }
    return codes;
  }

  generatePolishPostalCodes() {
    const codes = [];
    // Pologne: 00-001 à 99-999
    for (let i = 0; i <= 99; i++) {
      codes.push(i.toString().padStart(2, '0') + '-001');
    }
    return codes.slice(0, 50);
  }

  generateCzechPostalCodes() {
    const codes = [];
    // République Tchèque: 100 00 à 999 99
    for (let i = 100; i <= 999; i += 10) {
      codes.push(i.toString() + ' 00');
    }
    return codes.slice(0, 50);
  }

  generateSlovakPostalCodes() {
    const codes = [];
    // Slovaquie: 010 01 à 999 99
    for (let i = 10; i <= 999; i += 10) {
      codes.push(i.toString().padStart(3, '0') + ' 01');
    }
    return codes.slice(0, 50);
  }

  generateHungarianPostalCodes() {
    const codes = [];
    // Hongrie: 1000-9999
    for (let i = 1000; i <= 9999; i += 100) {
      codes.push(i.toString());
    }
    return codes.slice(0, 50);
  }

  generateSlovenianPostalCodes() {
    const codes = [];
    // Slovénie: 1000-9999
    for (let i = 1000; i <= 9999; i += 100) {
      codes.push(i.toString());
    }
    return codes.slice(0, 30);
  }

  generateCroatianPostalCodes() {
    const codes = [];
    // Croatie: 10000-99999
    for (let i = 10000; i <= 99999; i += 1000) {
      codes.push(i.toString());
    }
    return codes.slice(0, 50);
  }

  generateRomanianPostalCodes() {
    const codes = [];
    // Roumanie: 010001-900001
    for (let i = 10001; i <= 900001; i += 10000) {
      codes.push(i.toString());
    }
    return codes.slice(0, 50);
  }

  generateBulgarianPostalCodes() {
    const codes = [];
    // Bulgarie: 1000-9999
    for (let i = 1000; i <= 9999; i += 100) {
      codes.push(i.toString());
    }
    return codes.slice(0, 50);
  }

  generateGreekPostalCodes() {
    const codes = [];
    // Grèce: 10001-99999
    for (let i = 10001; i <= 99999; i += 1000) {
      codes.push(i.toString());
    }
    return codes.slice(0, 50);
  }

  generateCypriotPostalCodes() {
    const codes = [];
    // Chypre: 1000-9999
    for (let i = 1000; i <= 9999; i += 100) {
      codes.push(i.toString());
    }
    return codes.slice(0, 30);
  }

  generateMaltesePostalCodes() {
    const codes = [];
    // Malte: codes alphanumériques
    const areas = ['BZN', 'FGR', 'GZR', 'HMR', 'MDN', 'MST', 'QRM', 'SPB', 'VLT', 'ZBR'];
    areas.forEach(area => {
      codes.push(`${area} 1000`);
    });
    return codes;
  }

  generateEstonianPostalCodes() {
    const codes = [];
    // Estonie: 10001-99999
    for (let i = 10001; i <= 99999; i += 1000) {
      codes.push(i.toString());
    }
    return codes.slice(0, 30);
  }

  generateLatvianPostalCodes() {
    const codes = [];
    // Lettonie: LV-1000 à LV-9999
    for (let i = 1000; i <= 9999; i += 100) {
      codes.push(`LV-${i}`);
    }
    return codes.slice(0, 30);
  }

  generateLithuanianPostalCodes() {
    const codes = [];
    // Lituanie: LT-01000 à LT-99999
    for (let i = 1000; i <= 99999; i += 1000) {
      codes.push(`LT-${i.toString().padStart(5, '0')}`);
    }
    return codes.slice(0, 30);
  }

  generateMonacoPostalCodes() {
    const codes = [];
    // Monaco: 98000
    codes.push('98000');
    return codes;
  }

  generateAndorranPostalCodes() {
    const codes = [];
    // Andorre: AD100-AD999
    for (let i = 100; i <= 999; i += 100) {
      codes.push(`AD${i}`);
    }
    return codes;
  }

  generateSanMarinoPostalCodes() {
    const codes = [];
    // Saint-Marin: 47890-47899
    for (let i = 47890; i <= 47899; i++) {
      codes.push(i.toString());
    }
    return codes;
  }

  generateVaticanPostalCodes() {
    const codes = [];
    // Vatican: 00120
    codes.push('00120');
    return codes;
  }

  generateLiechtensteinPostalCodes() {
    const codes = [];
    // Liechtenstein: 9485-9498
    for (let i = 9485; i <= 9498; i++) {
      codes.push(i.toString());
    }
    return codes;
  }

  // Pays supplémentaires demandés

  generateMoroccanPostalCodes() {
    const codes = [];
    // Maroc: 10000-99999
    for (let i = 10000; i <= 99999; i += 1000) {
      codes.push(i.toString());
    }
    return codes.slice(0, 50);
  }

  generateCanadianPostalCodes() {
    const codes = [];
    // Canada: format A1A 1A1
    const letters = ['A', 'B', 'C', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'X', 'Y'];
    letters.forEach(l1 => {
      for (let i = 1; i <= 9; i++) {
        codes.push(`${l1}${i}A 1A1`);
      }
    });
    return codes.slice(0, 50);
  }

  generateUSPostalCodes() {
    const codes = [];
    // USA: ZIP codes 10001-99999
    for (let i = 10001; i <= 99999; i += 1000) {
      codes.push(i.toString());
    }
    return codes.slice(0, 50);
  }

  generateThaiPostalCodes() {
    const codes = [];
    // Thaïlande: 10000-99999
    for (let i = 10000; i <= 99999; i += 1000) {
      codes.push(i.toString());
    }
    return codes.slice(0, 50);
  }
}

module.exports = new PostalCodeService();