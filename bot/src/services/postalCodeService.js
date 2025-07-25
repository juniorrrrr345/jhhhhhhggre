// Service pour gérer les codes postaux par pays
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
      // Générer codes postaux par département (000-999)
      for (let city = 0; city <= 999; city++) {
        const cityStr = city.toString().padStart(3, '0');
        codes.push(`${deptStr}${cityStr}`);
      }
    }
    // Corse 2A (20100-20299) et 2B (20600-20999)
    for (let i = 100; i <= 299; i++) codes.push(`20${i}`);
    for (let i = 600; i <= 999; i++) codes.push(`20${i}`);
    // DOM-TOM: 971-976, 984, 986-988
    const domTom = ['971', '972', '973', '974', '976', '984', '986', '987', '988'];
    domTom.forEach(dept => {
      for (let city = 0; city <= 99; city++) {
        codes.push(`${dept}${city.toString().padStart(2, '0')}`);
      }
    });
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

  // 🇨🇭 SUISSE
  generateSwissPostalCodes() {
    const codes = [];
    for (let i = 1000; i <= 9999; i++) {
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

  // 🇧🇪 BELGIQUE
  generateBelgianPostalCodes() {
    const codes = [];
    for (let i = 1000; i <= 9999; i++) {
      codes.push(i.toString());
    }
    return codes;
  }

  // 🇳🇱 PAYS-BAS
  generateDutchPostalCodes() {
    const codes = [];
    for (let i = 1000; i <= 9999; i++) {
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

  // Récupérer les codes postaux d'un pays
  getPostalCodes(country) {
    return this.postalCodes[country] || [];
  }

  // Récupérer les pays disponibles
  getAvailableCountries() {
    return Object.keys(this.postalCodes);
  }

  // Créer un clavier avec les codes postaux (paginé pour Telegram)
  createPostalCodeKeyboard(country, page = 0, itemsPerPage = 16) {
    const codes = this.getPostalCodes(country);
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageCodes = codes.slice(startIndex, endIndex);
    
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

module.exports = new PostalCodeService();