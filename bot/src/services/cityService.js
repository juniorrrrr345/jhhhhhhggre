// Service pour gérer les villes par pays
class CityService {
  constructor() {
    this.cities = {
      // 🇫🇷 FRANCE
      France: [
        'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Strasbourg',
        'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Saint-Étienne', 'Toulon', 'Le Havre', 'Grenoble',
        'Dijon', 'Angers', 'Nîmes', 'Villeurbanne', 'Clermont-Ferrand', 'Le Mans', 'Aix-en-Provence',
        'Brest', 'Tours', 'Limoges', 'Amiens', 'Perpignan', 'Metz', 'Besançon', 'Orléans',
        'Rouen', 'Mulhouse', 'Caen', 'Nancy', 'Argenteuil', 'Montreuil', 'Roubaix', 'Dunkerque',
        'Tourcoing', 'Nanterre', 'Créteil', 'Vitry-sur-Seine', 'Avignon', 'Poitiers', 'Aubervilliers',
        'Versailles', 'Asnières-sur-Seine', 'Colombes', 'Aulnay-sous-Bois', 'Courbevoie', 'Rueil-Malmaison',
        'Antibes', 'Cannes', 'Béziers', 'Colmar', 'Bourges', 'La Rochelle', 'Pau', 'Calais',
        'Champigny-sur-Marne', 'Saint-Maur-des-Fossés', 'Drancy', 'Mérignac', 'Ajaccio', 'Issy-les-Moulineaux',
        'Levallois-Perret', 'Noisy-le-Grand', 'Quimper', 'Valence', 'Cergy', 'Antony', 'Troyes',
        'Neuilly-sur-Seine', 'Clichy', 'Ivry-sur-Seine', 'Chambéry', 'Niort', 'Sarcelles', 'Lorient',
        'Beauvais', 'Pessac', 'Vénissieux', 'Cagnes-sur-Mer', 'Saint-Quentin', 'La Seyne-sur-Mer',
        'Épinay-sur-Seine', 'Meaux', 'Blois', 'Brive-la-Gaillarde', 'Aubagne', 'Belfort', 'Évreux',
        'Chalon-sur-Saône', 'Sevran', 'Bondy', 'Arles', 'Clamart', 'Évry', 'Fontenay-sous-Bois',
        'Fréjus', 'Vannes', 'Sartrouville', 'Maisons-Alfort', 'Pantin', 'Saint-Brieuc', 'Laval',
        'Hyères', 'Épinal', 'Villejuif', 'Cholet', 'Saint-Germain-en-Laye', 'Gennevilliers',
        'Rosny-sous-Bois', 'Saint-Herblain', 'Bastia', 'Salon-de-Provence', 'Massy', 'Vaulx-en-Velin',
        'Nevers', 'Albi', 'Bourg-en-Bresse', 'Bron', 'Montauban', 'Saint-Ouen', 'Sète', 'Agen'
      ].sort(),
      
      // 🇪🇸 ESPAGNE
      Espagne: [
        'Madrid', 'Barcelone', 'Valence', 'Séville', 'Saragosse', 'Malaga', 'Murcie', 'Palma',
        'Las Palmas', 'Bilbao', 'Alicante', 'Cordoue', 'Valladolid', 'Vigo', 'Gijón', 'Hospitalet',
        'La Corogne', 'Vitoria', 'Grenade', 'Elche', 'Oviedo', 'Badalona', 'Terrassa', 'Cartagena',
        'Jerez', 'Sabadell', 'Móstoles', 'Santa Cruz', 'Alcalá', 'Pampelune', 'Fuenlabrada', 'Almería',
        'Leganés', 'Saint-Sébastien', 'Getafe', 'Burgos', 'Albacete', 'Santander', 'Castellón',
        'Alcorcón', 'San Cristóbal', 'Logroño', 'Badajoz', 'Salamanque', 'Huelva', 'Marbella',
        'Lérida', 'Tarragone', 'León', 'Cadix', 'Jaén', 'Ourense', 'Mataró', 'Algésiras',
        'Torrejón', 'Reus', 'Parla', 'Alcobendas', 'Torrent', 'Chiclana', 'Las Rozas', 'Orihuela',
        'Guadalajara', 'Roquetas', 'Palencia', 'Pozuelo', 'Toledo', 'Pontevedra', 'Sant Cugat',
        'Ceuta', 'Arona', 'Coslada', 'Talavera', 'El Puerto', 'Melilla', 'Vélez-Málaga', 'Cuenca',
        'Gijón', 'Rivas', 'Fuengirola', 'Majadahonda', 'Molina', 'Paterna', 'Ponferrada', 'Maracena',
        'Benidorm', 'Sagunto', 'Mérida', 'Siero', 'Vila-real', 'Arganda', 'Benalmádena', 'Lugo',
        'Huesca', 'Torrevieja', 'Estepona', 'Alcalá', 'Motril', 'Ávila', 'Valdemoro', 'Girona',
        'Segovia', 'Telde', 'Calvià', 'Ibiza', 'Gandia', 'Elda', 'Alcoy', 'Aranjuez', 'Zamora'
      ].sort(),
      
      // 🇨🇭 SUISSE
      Suisse: [
        'Zurich', 'Genève', 'Bâle', 'Lausanne', 'Berne', 'Winterthour', 'Lucerne', 'Saint-Gall',
        'Lugano', 'Biel/Bienne', 'Thoune', 'Köniz', 'La Chaux-de-Fonds', 'Fribourg', 'Schaffhouse',
        'Coire', 'Neuchâtel', 'Vernier', 'Uster', 'Sion', 'Lancy', 'Emmen', 'Rapperswil-Jona',
        'Kriens', 'Yverdon-les-Bains', 'Zoug', 'Montreux', 'Dübendorf', 'Dietikon', 'Frauenfeld',
        'Wil', 'Bulle', 'Baar', 'Riehen', 'Wädenswil', 'Aarau', 'Allschwil', 'Renens', 'Horgen',
        'Nyon', 'Reinach', 'Vevey', 'Baden', 'Wettingen', 'Kloten', 'Gossau', 'Muttenz', 'Bülach',
        'Kreuzlingen', 'Oberwil', 'Monthey', 'Soleure', 'Martigny', 'Spiez', 'Locarno', 'Burgdorf',
        'Steffisburg', 'Pratteln', 'Herisau', 'Langenthal', 'Binningen', 'Morges', 'Wohlen',
        'Schwyz', 'Einsiedeln', 'Stäfa', 'Wallisellen', 'Arbon', 'Liestal', 'Thônex', 'Küsnacht',
        'Horw', 'Versoix', 'Uzwil', 'Muri', 'Schlieren', 'Ebikon', 'Sierre', 'Ostermundigen',
        'Richterswil', 'Oftringen', 'Opfikon', 'Naters', 'Ittigen', 'Belp', 'Pully', 'Worb',
        'Davos', 'Mendrisio', 'Rheinfelden', 'Arth', 'Olten', 'Rüti', 'Landquart', 'Brig-Glis'
      ].sort(),
      
      // 🇮🇹 ITALIE
      Italie: [
        'Rome', 'Milan', 'Naples', 'Turin', 'Palerme', 'Gênes', 'Bologne', 'Florence', 'Bari',
        'Catane', 'Venise', 'Vérone', 'Messine', 'Padoue', 'Trieste', 'Tarente', 'Brescia',
        'Parme', 'Prato', 'Modène', 'Reggio de Calabre', 'Reggio d\'Émilie', 'Pérouse', 'Livourne',
        'Ravenne', 'Cagliari', 'Foggia', 'Rimini', 'Salerne', 'Ferrare', 'Sassari', 'Latina',
        'Giugliano', 'Monza', 'Syracuse', 'Pescara', 'Bergame', 'Forlì', 'Trente', 'Vicence',
        'Terni', 'Bolzano', 'Novare', 'Plaisance', 'Ancône', 'Andria', 'Arezzo', 'Udine',
        'Cesena', 'Lecce', 'Pesaro', 'Barletta', 'Alessandria', 'La Spezia', 'Pise', 'Catanzaro',
        'Pistoia', 'Guidonia', 'Lucques', 'Brindisi', 'Torre del Greco', 'Trévise', 'Busto Arsizio',
        'Côme', 'Marsala', 'Grosseto', 'Sesto San Giovanni', 'Pozzuoli', 'Varèse', 'Fiumicino',
        'Casoria', 'Asti', 'Caserte', 'Cinisello Balsamo', 'Gela', 'Aprilia', 'Raguse', 'Pavie',
        'Crémone', 'Carpi', 'Quartu Sant\'Elena', 'Lamezia Terme', 'Altamura', 'Imola', 'L\'Aquila',
        'Massa', 'Trapani', 'Viterbe', 'Cosenza', 'Potenza', 'Castellammare', 'Afragola', 'Vittoria',
        'Crotone', 'Matera', 'Agrigente', 'Avellino', 'Caltanissetta', 'Cuneo', 'Savone', 'Bénévent',
        'Mantoue', 'Bitonto', 'Bagheria', 'Sienne', 'Faenza', 'Portici', 'Acerra', 'Marano'
      ].sort(),
      
      // 🇩🇪 ALLEMAGNE
      Allemagne: [
        'Berlin', 'Hambourg', 'Munich', 'Cologne', 'Francfort', 'Stuttgart', 'Düsseldorf', 'Leipzig',
        'Dortmund', 'Essen', 'Brême', 'Dresde', 'Hanovre', 'Nuremberg', 'Duisbourg', 'Bochum',
        'Wuppertal', 'Bielefeld', 'Bonn', 'Münster', 'Karlsruhe', 'Mannheim', 'Augsbourg', 'Wiesbaden',
        'Mönchengladbach', 'Gelsenkirchen', 'Brunswick', 'Aix-la-Chapelle', 'Kiel', 'Chemnitz',
        'Krefeld', 'Halle', 'Magdebourg', 'Fribourg', 'Oberhausen', 'Lübeck', 'Erfurt', 'Rostock',
        'Mayence', 'Cassel', 'Hagen', 'Hamm', 'Sarrebruck', 'Mülheim', 'Potsdam', 'Ludwigshafen',
        'Oldenburg', 'Leverkusen', 'Osnabrück', 'Solingen', 'Heidelberg', 'Herne', 'Neuss',
        'Darmstadt', 'Regensburg', 'Ingolstadt', 'Würzburg', 'Fürth', 'Wolfsburg', 'Offenbach',
        'Ulm', 'Heilbronn', 'Pforzheim', 'Göttingen', 'Bottrop', 'Recklinghausen', 'Reutlingen',
        'Coblence', 'Bergisch Gladbach', 'Remscheid', 'Iéna', 'Bremerhaven', 'Erlangen', 'Moers',
        'Trèves', 'Siegen', 'Hildesheim', 'Cottbus', 'Salzgitter', 'Gütersloh', 'Ratisbonne',
        'Witten', 'Gera', 'Iserlohn', 'Zwickau', 'Schwerin', 'Esslingen', 'Düren', 'Tübingen',
        'Flensbourg', 'Constance', 'Ludwigsbourg', 'Dessau-Roßlau', 'Villingen-Schwenningen',
        'Worms', 'Marbourg', 'Minden', 'Neumünster', 'Norderstedt', 'Delmenhorst', 'Bamberg',
        'Bayreuth', 'Wolfenbüttel', 'Lüneburg', 'Celle', 'Kempten', 'Aschaffenburg', 'Fulda'
      ].sort(),
      
      // 🇧🇪 BELGIQUE
      Belgique: [
        'Bruxelles', 'Anvers', 'Gand', 'Charleroi', 'Liège', 'Bruges', 'Namur', 'Louvain',
        'Mons', 'Malines', 'Alost', 'La Louvière', 'Courtrai', 'Hasselt', 'Ostende', 'Tournai',
        'Genk', 'Seraing', 'Roulers', 'Mouscron', 'Verviers', 'Ixelles', 'Schaerbeek', 'Anderlecht',
        'Saint-Gilles', 'Forest', 'Uccle', 'Jette', 'Etterbeek', 'Woluwe-Saint-Lambert', 'Evere',
        'Auderghem', 'Watermael-Boitsfort', 'Molenbeek-Saint-Jean', 'Koekelberg', 'Berchem-Sainte-Agathe',
        'Ganshoren', 'Woluwe-Saint-Pierre', 'Saint-Josse-ten-Noode', 'Beveren', 'Beringen', 'Deinze',
        'Termonde', 'Saint-Nicolas', 'Turnhout', 'Lokeren', 'Braine-l\'Alleud', 'Herstal', 'Geel',
        'Sint-Truiden', 'Brasschaat', 'Waregem', 'Châtelet', 'Ninove', 'Grimbergen', 'Ieper',
        'Lier', 'Knokke-Heist', 'Schoten', 'Maasmechelen', 'Wavre', 'Lommel', 'Binche', 'Heusden-Zolder'
      ].sort(),
      
      // 🇳🇱 PAYS-BAS
      'Pays-Bas': [
        'Amsterdam', 'Rotterdam', 'La Haye', 'Utrecht', 'Eindhoven', 'Groningue', 'Tilburg',
        'Almere', 'Breda', 'Nimègue', 'Apeldoorn', 'Haarlem', 'Arnhem', 'Enschede', 'Amersfoort',
        'Zaanstad', 'Bois-le-Duc', 'Haarlemmermeer', 'Zwolle', 'Zoetermeer', 'Leeuwarden', 'Leyde',
        'Maastricht', 'Dordrecht', 'Ede', 'Alphen-sur-le-Rhin', 'Alkmaar', 'Emmen', 'Westland',
        'Delft', 'Venlo', 'Deventer', 'Sittard-Geleen', 'Helmond', 'Oss', 'Amstelveen', 'Hilversum',
        'Heerlen', 'Nissewaard', 'Hengelo', 'Purmerend', 'Roosendaal', 'Schiedam', 'Lelystad',
        'Hoorn', 'Gouda', 'Almelo', 'Spijkenisse', 'Vlaardingen', 'Assen', 'Bergen op Zoom',
        'Capelle aan den IJssel', 'Veenendaal', 'Katwijk', 'Zeist', 'Nieuwegein', 'Roermond',
        'Doetinchem', 'Hoogeveen', 'Terneuzen', 'Kampen', 'Woerden', 'Waalwijk', 'Rijswijk',
        'Middelburg', 'Zutphen', 'Hardenberg', 'Heerhugowaard', 'Oosterhout', 'Doorn', 'Bussum',
        'Elburg', 'Barneveld', 'Noordwijk', 'Tiel', 'Harderwijk', 'Baarn', 'Uden', 'IJsselstein',
        'Cuijk', 'Winterswijk', 'Valkenswaard', 'Geldrop', 'Brunssum', 'Hellevoetsluis', 'Meppel',
        'Voorburg', 'Wageningen', 'Vlissingen', 'Kerkrade', 'Medemblik', 'Sneek', 'Veldhoven'
      ].sort(),
      
      // 🇬🇧 ROYAUME-UNI
      'Royaume-Uni': [
        'Londres', 'Birmingham', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Édimbourg',
        'Bristol', 'Manchester', 'Leicester', 'Coventry', 'Kingston upon Hull', 'Cardiff',
        'Bradford', 'Belfast', 'Stoke-on-Trent', 'Wolverhampton', 'Plymouth', 'Nottingham',
        'Southampton', 'Reading', 'Derby', 'Dudley', 'Newcastle upon Tyne', 'Portsmouth',
        'Luton', 'Preston', 'Aberdeen', 'Milton Keynes', 'Sunderland', 'Norwich', 'Walsall',
        'Swansea', 'Bournemouth', 'Southend-on-Sea', 'Swindon', 'Dundee', 'Huddersfield',
        'Oxford', 'Poole', 'Middlesbrough', 'Blackpool', 'Bolton', 'Ipswich', 'Telford',
        'York', 'West Bromwich', 'Peterborough', 'Stockport', 'Brighton', 'Slough', 'Gloucester',
        'Watford', 'Rotherham', 'Cambridge', 'Exeter', 'Eastbourne', 'Sutton Coldfield',
        'Blackburn', 'Colchester', 'Oldham', 'St Helens', 'Crawley', 'Woking', 'Gillingham',
        'Wigan', 'Mansfield', 'Salford', 'Basildon', 'Worthing', 'Rochdale', 'Solihull',
        'Basingstoke', 'Maidstone', 'Romford', 'Bedford', 'Warrington', 'Stockton-on-Tees',
        'Halifax', 'Doncaster', 'Chelmsford', 'Grimsby', 'Hartlepool', 'Chester', 'Fulham',
        'Nuneaton', 'Ealing', 'Aylesbury', 'Edmonton', 'Saint Albans', 'Burnley', 'Scunthorpe',
        'Dudley', 'Gateshead', 'Birkenhead', 'Warwick', 'Bracknell', 'Battersea', 'Harlow'
      ].sort(),
      
      // 🇺🇸 USA
      'États-Unis': [
        'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphie', 'San Antonio',
        'San Diego', 'Dallas', 'San José', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
        'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington DC',
        'Boston', 'El Paso', 'Nashville', 'Détroit', 'Oklahoma City', 'Portland', 'Las Vegas',
        'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno',
        'Mesa', 'Sacramento', 'Atlanta', 'Kansas City', 'Colorado Springs', 'Omaha', 'Raleigh',
        'Miami', 'Long Beach', 'Virginia Beach', 'Oakland', 'Minneapolis', 'Tulsa', 'Tampa',
        'Arlington', 'La Nouvelle-Orléans', 'Wichita', 'Bakersfield', 'Cleveland', 'Aurora',
        'Anaheim', 'Honolulu', 'Santa Ana', 'Riverside', 'Corpus Christi', 'Lexington', 'Henderson',
        'Stockton', 'Saint Paul', 'Cincinnati', 'Saint-Louis', 'Pittsburgh', 'Greensboro', 'Lincoln',
        'Anchorage', 'Plano', 'Orlando', 'Irvine', 'Newark', 'Durham', 'Chula Vista', 'Toledo',
        'Fort Wayne', 'Saint-Pétersbourg', 'Laredo', 'Jersey City', 'Chandler', 'Madison',
        'Lubbock', 'Scottsdale', 'Reno', 'Buffalo', 'Gilbert', 'Glendale', 'North Las Vegas',
        'Winston-Salem', 'Chesapeake', 'Norfolk', 'Fremont', 'Garland', 'Irving', 'Hialeah',
        'Richmond', 'Boise', 'Spokane', 'Baton Rouge', 'Des Moines', 'Tacoma', 'San Bernardino'
      ].sort(),
      
      // 🇨🇦 CANADA
      Canada: [
        'Toronto', 'Montréal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Québec',
        'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Oshawa', 'Windsor', 'Saskatoon',
        'Regina', 'Sherbrooke', 'Barrie', 'Kelowna', 'Abbotsford', 'Kingston', 'Saguenay',
        'Trois-Rivières', 'Guelph', 'Moncton', 'Brantford', 'Saint John', 'Thunder Bay',
        'Peterborough', 'Cambridge', 'Chatham-Kent', 'Waterloo', 'Cape Breton', 'Lethbridge',
        'Nanaimo', 'Kamloops', 'Belleville', 'Welland', 'Sault Ste. Marie', 'Sarnia', 'Caledon',
        'Norfolk', 'Newmarket', 'Shawinigan', 'Delta', 'Saint-Jean-sur-Richelieu', 'Châteauguay',
        'Drummondville', 'Saint-Jérôme', 'Granby', 'Saint-Hyacinthe', 'Fredericton', 'Chilliwack',
        'Red Deer', 'Maple Ridge', 'Saint John\'s', 'Brossard', 'Repentigny', 'Whitby', 'Nanaimo',
        'Kanata', 'Ajax', 'Langley', 'North Bay', 'Waterloo', 'Terrebonne', 'Milton', 'Pickering',
        'Niagara Falls', 'Brantford', 'Newmarket', 'Salaberry-de-Valleyfield', 'Halton Hills',
        'Norfolk County', 'Shawinigan', 'Cornwall', 'Joliette', 'Victoriaville', 'Woodstock',
        'Charlottetown', 'Georgetown', 'Quinte West', 'West Vancouver', 'Timmins', 'Fort McMurray',
        'Bowmanville', 'Rimouski', 'Sorel-Tracy', 'Prince Albert', 'Campbell River', 'Penticton',
        'Courtenay', 'Orangeville', 'Moose Jaw', 'Brandon', 'Brockville', 'Saint-Georges', 'Sept-Îles',
        'Rouyn-Noranda', 'Whitehorse', 'Cobourg', 'Clarence-Rockland', 'Yellowknife', 'Squamish'
      ].sort(),
      
      // 🇹🇭 THAÏLANDE
      Thaïlande: [
        'Bangkok', 'Nonthaburi', 'Pak Kret', 'Hat Yai', 'Chaophraya Surasak', 'Surat Thani',
        'Chiang Mai', 'Nakhon Ratchasima', 'Udon Thani', 'Chon Buri', 'Nakhon Si Thammarat',
        'Khon Kaen', 'Nakhon Sawan', 'Nakhon Pathom', 'Phitsanulok', 'Pattaya', 'Songkhla',
        'Rayong', 'Yala', 'Ubon Ratchathani', 'Nakhon Phanom', 'Si Racha', 'Chachoengsao',
        'Samut Prakan', 'Samut Sakhon', 'Chiang Rai', 'Sakon Nakhon', 'Phuket', 'Hua Hin',
        'Phetchaburi', 'Kanchanaburi', 'Suphan Buri', 'Buri Ram', 'Saraburi', 'Nong Khai',
        'Lampang', 'Phrae', 'Mae Sot', 'Kamphaeng Phet', 'Samut Songkhram', 'Krabi', 'Chumphon',
        'Phetchabun', 'Ratchaburi', 'Sakhon Nakhon', 'Surin', 'Uttaradit', 'Ang Thong', 'Roi Et',
        'Ayutthaya', 'Trang', 'Narathiwat', 'Pak Chong', 'Koh Samui', 'Ban Pong', 'Lopburi',
        'Ranong', 'Sa Kaeo', 'Phra Nakhon Si Ayutthaya', 'Prachuap Khiri Khan', 'Chanthaburi',
        'Phatthalung', 'Lamphun', 'Nong Bua Lamphu', 'Prachin Buri', 'Si Sa Ket', 'Satun',
        'Mukdahan', 'Yasothon', 'Phichit', 'Amnat Charoen', 'Nakhon Nayok', 'Phangnga', 'Loei',
        'Chaiyaphum', 'Phayao', 'Samut Prakan', 'Kalsin', 'Sukhothai', 'Nan', 'Tak', 'Surat Thani',
        'Maha Sarakham', 'Sing Buri', 'Mae Hong Son', 'Phrae', 'Chachoengsao', 'Nonthaburi',
        'Pathum Thani', 'Uthai Thani', 'Chai Nat', 'Nakhon Chai Si', 'Bang Bua Thong', 'Om Noi'
      ].sort(),
      
      // 🇲🇦 MAROC
      Maroc: [
        'Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Agadir', 'Tanger', 'Meknès', 'Oujda',
        'Kenitra', 'Tétouan', 'Salé', 'Nador', 'Khouribga', 'Béni Mellal', 'El Jadida',
        'Taza', 'Mohammedia', 'Settat', 'Berrechid', 'Khemisset', 'Inezgane', 'Ksar El Kebir',
        'Larache', 'Guelmim', 'Berkane', 'Taourirt', 'Bouznika', 'Oued Zem', 'Sidi Kacem',
        'Errachidia', 'Ouarzazate', 'Safi', 'Essaouira', 'Al Hoceima', 'Tiznit', 'Tan-Tan',
        'Ouazzane', 'Guercif', 'Dakhla', 'Fnideq', 'Sidi Slimane', 'Midelt', 'Azrou', 'Tifelt',
        'Moulay Yacoub', 'El Aioun', 'Azemmour', 'Temara', 'Skhirat', 'Khénifra', 'Sidi Bennour',
        'Martil', 'Aïn Harrouda', 'Benslimane', 'Al Khmissat', 'Sidi Yahya El Gharb', 'Zaïo',
        'Asilah', 'Rissani', 'Kasba Tadla', 'Sidi Rahal', 'Imzouren', 'Boujdour', 'Taroudant',
        'Sefrou', 'Youssoufia', 'Tan-Tan', 'Zagora', 'Assa', 'Agdz', 'Tinejdad', 'Ouled Teima',
        'Beni Ansar', 'Smara', 'Boujniba', 'Kariat Arkmane', 'Attaouia', 'Imintanoute', 'Skoura',
        'Kalaat M\'Gouna', 'Ribate El Kheir', 'Sidi Mokhtar', 'Tinghir', 'Goulmima', 'Tarfaya',
        'Aoulouz', 'Tata', 'Boumalne Dades', 'Ahfir', 'Lakhsas', 'Alnif', 'Boulemane', 'Khenifra'
      ].sort(),
      
      // 🇹🇳 TUNISIE
      Tunisie: [
        'Tunis', 'Sfax', 'Sousse', 'Ettadhamen', 'Kairouan', 'Gabès', 'Bizerte', 'Ariana',
        'Gafsa', 'El Mourouj', 'Kasserine', 'Monastir', 'Tataouine', 'Ben Arous', 'La Marsa',
        'Medenine', 'La Goulette', 'Hammamet', 'Nabeul', 'Béja', 'Le Kef', 'Mahdia', 'Sidi Bouzid',
        'Jendouba', 'Tozeur', 'Kébili', 'Siliana', 'Zaghouan', 'Radès', 'Le Bardo', 'Douar Hicher',
        'Hammam Lif', 'Hammam Sousse', 'Sakiet Eddaier', 'Sakiet Ezzit', 'Kalaa Kebira', 'Agareb',
        'Jebeniana', 'El Ain', 'Ezzouhour', 'El Ksar', 'Ezzahra', 'Dar Chaabane El Fehri',
        'Hammam Chott', 'Bou Mhel el-Bassatine', 'Khezama Ouest', 'Khezama Est', 'Chihia', 'Chebba',
        'Menzel Temime', 'Korba', 'Mateur', 'Menzel Bourguiba', 'Grombalia', 'Beni Khiar',
        'Mornag', 'El Fahs', 'Somaa', 'Moulares', 'Redeyef', 'Metlaoui', 'Nefta', 'Degache',
        'Souk Lahad', 'Cebbala Ouled Asker', 'Sened', 'Menzel Chaker', 'Mahrès', 'Skhira',
        'Salakta', 'El Jem', 'Ksour Essaf', 'Regueb', 'Sidi El Hani', 'Msaken', 'Moknine',
        'Jemmal', 'Ksar Hellal', 'Ksibet el-Médiouni', 'Bembla', 'Sayada', 'Lemta', 'Bouhjar',
        'Menzel Hayet', 'Zaouiet Kontoch', 'Beni Hassen', 'Ajim', 'Soliman', 'Tazerka', 'Takelsa',
        'Enfida', 'Bir Ali Ben Khalifa', 'Sidi Bou Ali', 'Hergla', 'Mezzouna', 'Ouerdanine'
      ].sort(),
      
      // 🇸🇳 SÉNÉGAL
      Sénégal: [
        'Dakar', 'Pikine', 'Touba', 'Thiès', 'Rufisque', 'Kaolack', 'M\'Bour', 'Ziguinchor',
        'Saint-Louis', 'Diourbel', 'Louga', 'Tambacounda', 'Richard-Toll', 'Kolda', 'Mbacké',
        'Tivaouane', 'Joal-Fadiouth', 'Kaffrine', 'Dahra', 'Bignona', 'Fatick', 'Dagana',
        'Bambey', 'Sédhiou', 'Nguékhokh', 'Kayar', 'Pout', 'Mékhé', 'Matam', 'Oussouye',
        'Guinguinéo', 'Bakel', 'Mboro', 'Linguère', 'Ourossogui', 'Saly', 'Kédougou', 'Koungheul',
        'Khombole', 'Gossas', 'Ndioum', 'Rosso', 'Nioro du Rip', 'Kanel', 'Kébémer', 'Podor',
        'Goudomp', 'Thiadiaye', 'Ndoffane', 'Dioffior', 'Tivaoune Peulh', 'Golléré', 'Keur Massar',
        'Pikine Ouest', 'Pikine Est', 'Pikine Nord', 'Guédiawaye', 'Diamaguène', 'Yeumbeul',
        'Malika', 'Keur Mbaye Fall', 'Cambérène', 'Bargny', 'Diamniadio', 'Sangalkam', 'Bambilor',
        'Yoff', 'Ngor', 'Ouakam', 'Mermoz', 'Sacré-Coeur', 'Almadies', 'Plateau', 'Médina',
        'Grand-Dakar', 'Biscuiterie', 'Dieuppeul', 'Derklé', 'Hann', 'HLM', 'Colobane', 'Fass',
        'Gueule Tapée', 'Fann', 'Point E', 'Amitié', 'Sicap', 'Mamelles', 'Ouagou Niayes',
        'Parcelles Assainies', 'Grand-Yoff', 'Patte d\'Oie', 'Soprim', 'Liberté', 'Dieupeul',
        'Castors', 'Golf', 'Dalifort', 'Bène Baraque', 'Hann Bel-Air', 'Cité Millionnaire'
      ].sort(),
      
      // 🇩🇿 ALGÉRIE
      Algérie: [
        'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa', 'Sétif',
        'Sidi Bel Abbès', 'Biskra', 'Tébessa', 'El Oued', 'Skikda', 'Tiaret', 'Béjaïa',
        'Tlemcen', 'Béchar', 'Mostaganem', 'El Eulma', 'Bordj Bou Arreridj', 'Chlef', 'Souk Ahras',
        'Médéa', 'Tizi Ouzou', 'Ech-Chettia', 'Laghouat', 'M\'Sila', 'Jijel', 'Relizane',
        'Guelma', 'Aïn Beïda', 'Khenchela', 'Barika', 'Messaad', 'Collo', 'Touggourt', 'Saïda',
        'Mascara', 'Ouargla', 'Ras El Oued', 'Aïn M\'Lila', 'Aïn Témouchent', 'Ghardaïa',
        'Sig', 'Khemis Miliana', 'Chelghoum Laïd', 'Oum El Bouaghi', 'Tamanrasset', 'Mila',
        'Aïn Defla', 'Naama', 'Aïn Sefra', 'Bougara', 'Tindouf', 'Adrar', 'Boumerdès', 'El Bayadh',
        'Illizi', 'El Tarf', 'Tipaza', 'Tissemsilt', 'Aflou', 'Mecheria', 'Bordj Badji Mokhtar',
        'El Meghaier', 'El Meniaa', 'Ouled Djellal', 'Béni Abbès', 'In Salah', 'In Guezzam',
        'Djanet', 'El M\'Ghair', 'El Menia', 'Hassi Messaoud', 'Sidi Khouiled', 'Hassi Bahbah',
        'Metlili', 'Aïn Touta', 'El Hadjira', 'Sidi Okba', 'Merouana', 'El Kseur', 'Reguiba',
        'Bir El Djir', 'Khemis El Khechna', 'Mouzaia', 'Beni Tamou', 'Sobha', 'Beni Mered',
        'Barbacha', 'Sidi Moussa', 'Hadjout', 'Sfisef', 'Saoula', 'El Amria', 'Sidi Khaled',
        'Draa Ben Khedda', 'Tadmaït', 'Sidi Abdelli', 'Bir Mourad Raïs', 'Berriane', 'Zeribet El Oued'
      ].sort(),
      
      // Autres pays...
      'Côte d\'Ivoire': [
        'Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro', 'Korhogo', 'San-Pédro', 'Divo', 'Man',
        'Gagnoa', 'Abengourou', 'Agboville', 'Grand-Bassam', 'Dabou', 'Dimbokro', 'Sinfra',
        'Bingerville', 'Adzopé', 'Séguéla', 'Bondoukou', 'Oumé', 'Ferkessédougou', 'Daoukro',
        'Odienné', 'Danané', 'Tingréla', 'Guiglo', 'Biankouma', 'Sassandra', 'Touba', 'Bouna'
      ].sort(),
      
      Madagascar: [
        'Antananarivo', 'Toamasina', 'Antsirabe', 'Fianarantsoa', 'Mahajanga', 'Toliara',
        'Antsiranana', 'Ambovombe', 'Antanifotsy', 'Tsiroanomandidy', 'Moramanga', 'Morondava',
        'Manakara', 'Farafangana', 'Ambositra', 'Maroantsetra', 'Sambava', 'Maevatanana',
        'Maintirano', 'Ambatolampy', 'Betafo', 'Marovoay', 'Ankazobe', 'Antsohihy', 'Ampanihy'
      ].sort(),
      
      Portugal: [
        'Lisbonne', 'Porto', 'Vila Nova de Gaia', 'Amadora', 'Braga', 'Setúbal', 'Coimbra',
        'Queluz', 'Funchal', 'Cacém', 'Almada', 'Agualva', 'Rio de Mouro', 'Odivelas', 'Aveiro',
        'Viseu', 'Guimarães', 'Leiria', 'Matosinhos', 'Faro', 'Évora', 'Castelo Branco',
        'Portimão', 'Ponta Delgada', 'Viana do Castelo', 'Seixal', 'Barreiro', 'Sintra'
      ].sort(),
      
      Australie: [
        'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adélaïde', 'Gold Coast', 'Newcastle',
        'Canberra', 'Sunshine Coast', 'Wollongong', 'Hobart', 'Geelong', 'Townsville', 'Cairns',
        'Darwin', 'Toowoomba', 'Ballarat', 'Bendigo', 'Albury', 'Launceston', 'Mackay',
        'Rockhampton', 'Bunbury', 'Bundaberg', 'Coffs Harbour', 'Wagga Wagga', 'Hervey Bay',
        'Mildura', 'Shepparton', 'Gladstone', 'Port Macquarie', 'Tamworth', 'Traralgon',
        'Orange', 'Geraldton', 'Bowral', 'Dubbo', 'Nowra', 'Bathurst', 'Warrnambool', 'Kalgoorlie',
        'Busselton', 'Albany', 'Warragul', 'Devonport', 'Mount Gambier', 'Lismore', 'Nelson Bay'
      ].sort(),
      
      Brésil: [
        'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte',
        'Manaus', 'Curitiba', 'Recife', 'Goiânia', 'Belém', 'Porto Alegre', 'São Luís',
        'Maceió', 'Natal', 'Campo Grande', 'João Pessoa', 'Teresina', 'Florianópolis',
        'Aracaju', 'Cuiabá', 'Porto Velho', 'Macapá', 'Rio Branco', 'Vitória', 'Boa Vista',
        'Palmas', 'Santos', 'Campinas', 'São José dos Campos', 'Osasco', 'Ribeirão Preto',
        'Sorocaba', 'Guarulhos', 'Juiz de Fora', 'Jundiaí', 'Piracicaba', 'Bauru', 'São Vicente',
        'Canoas', 'Franca', 'Pelotas', 'Anápolis', 'Vitória da Conquista', 'Paulista',
        'Ponta Grossa', 'Blumenau', 'Limeira', 'Suzano', 'Caucaia', 'Foz do Iguaçu', 'Maringá',
        'Petrópolis', 'Uberaba', 'Cascavel', 'Praia Grande', 'Volta Redonda', 'Taubaté'
      ].sort(),
      
      Japon: [
        'Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Kobe', 'Kyoto', 'Fukuoka',
        'Kawasaki', 'Saitama', 'Hiroshima', 'Sendai', 'Chiba', 'Kitakyushu', 'Sakai',
        'Niigata', 'Hamamatsu', 'Shizuoka', 'Sagamihara', 'Okayama', 'Kumamoto', 'Kagoshima',
        'Funabashi', 'Hachioji', 'Kawaguchi', 'Himeji', 'Suginami', 'Itabashi', 'Matsuyama',
        'Toshima', 'Machida', 'Nishinomiya', 'Kurashiki', 'Amagasaki', 'Nagasaki', 'Oita',
        'Kanazawa', 'Takamatsu', 'Toyama', 'Matsudo', 'Fujisawa', 'Kochi', 'Aomori', 'Miyazaki',
        'Akita', 'Naha', 'Wakayama', 'Koriyama', 'Kashiwa', 'Tokorozawa', 'Takatsuki'
      ].sort(),
      
      Cameroun: [
        'Douala', 'Yaoundé', 'Garoua', 'Bamenda', 'Maroua', 'Bafoussam', 'Ngaoundéré',
        'Bertoua', 'Loum', 'Kumba', 'Nkongsamba', 'Mbouda', 'Dschang', 'Foumban', 'Ebolowa',
        'Kousséri', 'Guider', 'Meiganga', 'Yagoua', 'Mbalmayo', 'Bafang', 'Tiko', 'Kribi',
        'Buea', 'Sangmélima', 'Foumbot', 'Bangangté', 'Batouri', 'Banyo', 'Nkambé', 'Bali',
        'Mbanga', 'Mokolo', 'Melong', 'Manjo', 'Garoua-Boulaï', 'Mora', 'Kaélé', 'Tibati',
        'Ndop', 'Akonolinga', 'Eseka', 'Mamfé', 'Obala', 'Muyuka', 'Nanga-Eboko', 'Abong-Mbang',
        'Fundong', 'Nkoteng', 'Fontem', 'Mbandjock', 'Touboro', 'Ngaoundal', 'Yokadouma',
        'Pitoa', 'Tombel', 'Kékem', 'Magba', 'Bélabo', 'Tonga', 'Maga', 'Koutaba', 'Blangoua',
        'Guidiguis', 'Bogo', 'Batibo', 'Yabassi', 'Figuil', 'Makénéné', 'Gazawa', 'Tcholliré'
      ].sort(),
      

    };
  }

  // Récupérer les villes d'un pays
  getCities(country) {
    return this.cities[country] || [];
  }

  // Récupérer les pays disponibles
  getAvailableCountries() {
    return Object.keys(this.cities);
  }

  // Rechercher des villes (pour la fonction de recherche)
  searchCities(country, searchTerm) {
    const cities = this.getCities(country);
    if (!searchTerm) return cities;
    
    const term = searchTerm.toLowerCase();
    return cities.filter(city => city.toLowerCase().includes(term));
  }

  // Vérifier si une ville existe dans un pays
  isCityValid(country, city) {
    const cities = this.getCities(country);
    return cities.includes(city);
  }
}

module.exports = new CityService();