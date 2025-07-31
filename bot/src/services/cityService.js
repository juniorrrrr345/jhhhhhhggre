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
      
      // 🇦🇹 AUTRICHE
      Autriche: [
        'Vienne', 'Graz', 'Linz', 'Salzbourg', 'Innsbruck', 'Klagenfurt', 'Villach', 'Wels',
        'Sankt Pölten', 'Dornbirn', 'Wiener Neustadt', 'Steyr', 'Feldkirch', 'Bregenz', 'Leonding',
        'Klosterneuburg', 'Baden', 'Wolfsberg', 'Leoben', 'Krems', 'Traun', 'Amstetten',
        'Lustenau', 'Kapfenberg', 'Mödling', 'Hallein', 'Kufstein', 'Traiskirchen', 'Schwechat',
        'Braunau am Inn', 'Stockerau', 'Saalfelden', 'Ansfelden', 'Tulln', 'Hohenems', 'Spittal',
        'Telfs', 'Ternitz', 'Perchtoldsdorf', 'Feldkirchen', 'Bludenz', 'Bad Ischl', 'Eisenstadt',
        'Schwaz', 'Hall in Tirol', 'Gmunden', 'Wörgl', 'Wals-Siezenheim', 'Marchtrenk', 'Bruck an der Mur'
      ].sort(),
      
      // 🇱🇺 LUXEMBOURG
      Luxembourg: [
        'Luxembourg', 'Esch-sur-Alzette', 'Differdange', 'Dudelange', 'Ettelbruck', 'Diekirch',
        'Wiltz', 'Echternach', 'Rumelange', 'Grevenmacher', 'Bertrange', 'Bettembourg',
        'Schifflange', 'Belvaux', 'Pétange', 'Rodange', 'Strassen', 'Mersch', 'Kayl',
        'Hesperange', 'Mondorf-les-Bains', 'Remich', 'Niederanven', 'Mondercange', 'Larochette',
        'Redange', 'Junglinster', 'Wasserbillig', 'Mamer', 'Capellen', 'Clervaux', 'Vianden',
        'Bascharage', 'Sandweiler', 'Sanem', 'Steinfort', 'Steinsel', 'Walferdange', 'Kehlen'
      ].sort(),
      
      // 🇮🇪 IRLANDE
      Irlande: [
        'Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford', 'Drogheda', 'Dundalk', 'Swords',
        'Bray', 'Navan', 'Kilkenny', 'Ennis', 'Carlow', 'Tralee', 'Newbridge', 'Portlaoise',
        'Balbriggan', 'Naas', 'Athlone', 'Mullingar', 'Celbridge', 'Wexford', 'Sligo',
        'Clonmel', 'Greystones', 'Malahide', 'Carrigaline', 'Tullamore', 'Killarney', 'Arklow',
        'Maynooth', 'Cobh', 'Castlebar', 'Midleton', 'Mallow', 'Ashbourne', 'Ballina', 'Laytown',
        'Enniscorthy', 'Wicklow', 'Tramore', 'Cavan', 'Athy', 'Skerries', 'Longford', 'Dungarvan',
        'Rush', 'Gorey', 'Ratoath', 'Shannon', 'Tuam', 'Youghal', 'Monaghan', 'Nenagh', 'Trim',
        'New Ross', 'Thurles', 'Roscommon', 'Kinsale', 'Ballinasloe', 'Passage West', 'Fermoy'
      ].sort(),
      
      // 🇩🇰 DANEMARK
      Danemark: [
        'Copenhague', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg', 'Randers', 'Kolding', 'Horsens',
        'Vejle', 'Roskilde', 'Herning', 'Hørsholm', 'Helsingør', 'Silkeborg', 'Næstved',
        'Fredericia', 'Viborg', 'Køge', 'Holstebro', 'Taastrup', 'Slagelse', 'Hillerød',
        'Holbæk', 'Sønderborg', 'Svendborg', 'Hjørring', 'Frederikshavn', 'Nørresundby',
        'Ringsted', 'Haderslev', 'Ølstykke', 'Skive', 'Birkerød', 'Farum', 'Skanderborg',
        'Nyborg', 'Aabenraa', 'Solrød Strand', 'Værløse', 'Thisted', 'Varde', 'Rønne',
        'Nakskov', 'Kalundborg', 'Frederiksværk', 'Brøndby', 'Lillerød', 'Middelfart',
        'Grenaa', 'Vordingborg', 'Haslev', 'Korsør', 'Vejen', 'Humlebæk', 'Faaborg'
      ].sort(),
      
      // 🇸🇪 SUÈDE
      Suède: [
        'Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping',
        'Helsingborg', 'Jönköping', 'Norrköping', 'Lund', 'Umeå', 'Gävle', 'Borås', 'Sundsvall',
        'Eskilstuna', 'Södertälje', 'Karlstad', 'Täby', 'Växjö', 'Halmstad', 'Luleå',
        'Trollhättan', 'Östersund', 'Borlänge', 'Tumba', 'Upplands Väsby', 'Falun', 'Kalmar',
        'Kristianstad', 'Karlskrona', 'Skövde', 'Skellefteå', 'Lidingö', 'Uddevalla',
        'Landskrona', 'Nyköping', 'Motala', 'Vallentuna', 'Kungsbacka', 'Varberg', 'Ängelholm',
        'Sandviken', 'Örnsköldsvik', 'Alingsås', 'Trelleborg', 'Piteå', 'Enköping', 'Märsta',
        'Kiruna', 'Visby', 'Ystad', 'Hudiksvall', 'Härnösand', 'Lidköping', 'Vänersborg'
      ].sort(),
      
      // 🇳🇴 NORVÈGE
      Norvège: [
        'Oslo', 'Bergen', 'Stavanger', 'Trondheim', 'Drammen', 'Fredrikstad', 'Kristiansand',
        'Sandnes', 'Tromsø', 'Sarpsborg', 'Skien', 'Bodø', 'Ålesund', 'Sandefjord', 'Haugesund',
        'Tønsberg', 'Moss', 'Porsgrunn', 'Ringsaker', 'Arendal', 'Hamar', 'Larvik', 'Halden',
        'Harstad', 'Lillehammer', 'Molde', 'Kongsberg', 'Horten', 'Gjøvik', 'Askøy', 'Kristiansund',
        'Elverum', 'Leirvik', 'Alta', 'Mo i Rana', 'Narvik', 'Ski', 'Jessheim', 'Askim',
        'Hønefoss', 'Grimstad', 'Steinkjer', 'Stjørdal', 'Ski', 'Nesoddtangen', 'Drøbak',
        'Råholt', 'Vennesla', 'Mosjøen', 'Holmestrand', 'Levanger', 'Egersund', 'Florø',
        'Bryne', 'Kongsvinger', 'Svolvær', 'Sandnessjøen', 'Hammerfest', 'Vadsø', 'Kirkenes'
      ].sort(),
      
      // 🇫🇮 FINLANDE
      Finlande: [
        'Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu', 'Turku', 'Jyväskylä', 'Lahti',
        'Kuopio', 'Kouvola', 'Pori', 'Joensuu', 'Lappeenranta', 'Hämeenlinna', 'Vaasa',
        'Rovaniemi', 'Seinäjoki', 'Mikkeli', 'Kotka', 'Salo', 'Porvoo', 'Kokkola', 'Hyvinkää',
        'Lohja', 'Järvenpää', 'Rauma', 'Kajaani', 'Kerava', 'Savonlinna', 'Nokia', 'Kaarina',
        'Ylöjärvi', 'Kangasala', 'Vihti', 'Riihimäki', 'Raseborg', 'Imatra', 'Raisio',
        'Raahe', 'Sastamala', 'Tornio', 'Iisalmi', 'Valkeakoski', 'Kuusamo', 'Kemi', 'Varkaus',
        'Uusikaupunki', 'Laukaa', 'Sipoo', 'Naantali', 'Pieksämäki', 'Lempäälä', 'Heinola',
        'Hollola', 'Kauhava', 'Pargas', 'Jakobstad', 'Keuruu', 'Hamina', 'Huittinen'
      ].sort(),
      
      // 🇮🇸 ISLANDE
      Islande: [
        'Reykjavik', 'Kópavogur', 'Hafnarfjörður', 'Akureyri', 'Reykjanesbær', 'Garðabær',
        'Mosfellsbær', 'Árborg', 'Akranes', 'Fjarðabyggð', 'Múlaþing', 'Vestmannaeyjar',
        'Skagafjörður', 'Ísafjörður', 'Borgarbyggð', 'Seltjarnarnes', 'Hveragerði', 'Þorlákshöfn',
        'Grindavík', 'Sandgerði', 'Garður', 'Neskaupstaður', 'Dalvík', 'Reyðarfjörður',
        'Húsavík', 'Egilsstaðir', 'Selfoss', 'Keflavík', 'Vogar', 'Njarðvík', 'Höfn',
        'Sauðárkrókur', 'Stykkishólmur', 'Eskifjörður', 'Bolungarvík', 'Patreksfjörður',
        'Ólafsfjörður', 'Blönduós', 'Hvolsvöllur', 'Siglufjörður', 'Vík í Mýrdal'
      ].sort(),
      
      // 🇵🇱 POLOGNE
      Pologne: [
        'Varsovie', 'Cracovie', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz',
        'Lublin', 'Białystok', 'Katowice', 'Gdynia', 'Częstochowa', 'Radom', 'Sosnowiec',
        'Toruń', 'Kielce', 'Rzeszów', 'Gliwice', 'Zabrze', 'Olsztyn', 'Bielsko-Biała',
        'Bytom', 'Zielona Góra', 'Rybnik', 'Ruda Śląska', 'Opole', 'Tychy', 'Gorzów Wielkopolski',
        'Dąbrowa Górnicza', 'Elbląg', 'Płock', 'Wałbrzych', 'Włocławek', 'Tarnów', 'Chorzów',
        'Koszalin', 'Kalisz', 'Legnica', 'Grudziądz', 'Jaworzno', 'Słupsk', 'Jastrzębie-Zdrój',
        'Nowy Sącz', 'Konin', 'Piotrków Trybunalski', 'Inowrocław', 'Lubin', 'Siedlce',
        'Piła', 'Ostrowiec Świętokrzyski', 'Siemianowice Śląskie', 'Głogów', 'Pabianice',
        'Zamość', 'Leszno', 'Żory', 'Pruszków', 'Ostrołęka', 'Ełk', 'Tarnobrzeg'
      ].sort(),
      
      // 🇨🇿 RÉPUBLIQUE TCHÈQUE
      'République Tchèque': [
        'Prague', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc', 'České Budějovice',
        'Hradec Králové', 'Ústí nad Labem', 'Pardubice', 'Haviřov', 'Zlín', 'Kladno', 'Most',
        'Opava', 'Frýdek-Místek', 'Jihlava', 'Karviná', 'Teplice', 'Karlovy Vary', 'Děčín',
        'Chomutov', 'Přerov', 'Jablonec nad Nisou', 'Mladá Boleslav', 'Prostějov', 'Třebíč',
        'Třinec', 'Tábor', 'Znojmo', 'Příbram', 'Orlová', 'Cheb', 'Trutnov', 'Kolín',
        'Písek', 'Kroměříž', 'Šumperk', 'Vsetín', 'Valašské Meziříčí', 'Litvínov', 'Uherské Hradiště',
        'Hodonín', 'Český Těšín', 'Břeclav', 'Krnov', 'Litoměřice', 'Sokolov', 'Nový Jičín',
        'Havlíčkův Brod', 'Chrudim', 'Kopřivnice', 'Žďár nad Sázavou', 'Bohumín', 'Vyškov'
      ].sort(),
      
      // 🇸🇰 SLOVAQUIE
      Slovaquie: [
        'Bratislava', 'Košice', 'Prešov', 'Žilina', 'Nitra', 'Banská Bystrica', 'Trnava',
        'Martin', 'Trenčín', 'Poprad', 'Prievidza', 'Zvolen', 'Považská Bystrica', 'Michalovce',
        'Spišská Nová Ves', 'Komárno', 'Levice', 'Humenné', 'Bardejov', 'Liptovský Mikuláš',
        'Ružomberok', 'Lučenec', 'Piešťany', 'Topoľčany', 'Trebišov', 'Čadca', 'Dubnica nad Váhom',
        'Rimavská Sobota', 'Partizánske', 'Vranov nad Topľou', 'Pezinok', 'Šaľa', 'Brezno',
        'Senica', 'Dunajská Streda', 'Snina', 'Rožňava', 'Púchov', 'Žiar nad Hronom',
        'Kysucké Nové Mesto', 'Skalica', 'Sereď', 'Galanta', 'Senec', 'Dolný Kubín', 'Bánovce nad Bebravou',
        'Stará Ľubovňa', 'Stupava', 'Hlohovec', 'Bytča', 'Zlaté Moravce', 'Kežmarok',
        'Levoča', 'Myjava', 'Revúca', 'Stropkov', 'Sabinov', 'Svidník', 'Šamorín'
      ].sort(),
      
      // 🇭🇺 HONGRIE
      Hongrie: [
        'Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs', 'Győr', 'Nyíregyháza', 'Kecskemét',
        'Székesfehérvár', 'Szombathely', 'Szolnok', 'Tatabánya', 'Kaposvár', 'Érd', 'Veszprém',
        'Békéscsaba', 'Zalaegerszeg', 'Sopron', 'Eger', 'Nagykanizsa', 'Dunaújváros', 'Hódmezővásárhely',
        'Salgótarján', 'Cegléd', 'Baja', 'Ozd', 'Vác', 'Gödöllő', 'Dunakeszi', 'Esztergom',
        'Szigetszentmiklós', 'Pápa', 'Kiskunfélegyháza', 'Gyöngyös', 'Ajka', 'Budaörs',
        'Hajdúböszörmény', 'Szentendre', 'Mosonmagyaróvár', 'Siófok', 'Orosháza', 'Várpalota',
        'Kazincbarcika', 'Jászberény', 'Nagykőrös', 'Komárom', 'Gyula', 'Hajdúszoboszló',
        'Dombóvár', 'Mátészalka', 'Balassagyarmat', 'Ózd', 'Paks', 'Karcag', 'Makó',
        'Tapolca', 'Oroszlány', 'Mezőkövesd', 'Mohács', 'Keszthely', 'Tata'
      ].sort(),
      
      // 🇸🇮 SLOVÉNIE
      Slovénie: [
        'Ljubljana', 'Maribor', 'Celje', 'Kranj', 'Velenje', 'Koper', 'Novo Mesto', 'Ptuj',
        'Trbovlje', 'Kamnik', 'Jesenice', 'Nova Gorica', 'Domžale', 'Škofja Loka', 'Izola',
        'Murska Sobota', 'Postojna', 'Logatec', 'Vrhnika', 'Slovenska Bistrica', 'Grosuplje',
        'Litija', 'Brežice', 'Krško', 'Radovljica', 'Ravne na Koroškem', 'Žalec', 'Ajdovščina',
        'Idrija', 'Mozirje', 'Sežana', 'Ilirska Bistrica', 'Medvode', 'Zagorje ob Savi',
        'Slovenske Konjice', 'Cerknica', 'Kočevje', 'Ribnica', 'Piran', 'Bled', 'Rogaška Slatina',
        'Šentjur', 'Tolmin', 'Trebnje', 'Laško', 'Črnomelj', 'Prevalje', 'Ljutomer', 'Ormož',
        'Radlje ob Dravi', 'Sevnica', 'Dravograd', 'Metlika', 'Gornja Radgona', 'Lenart'
      ].sort(),
      
      // 🇭🇷 CROATIE
      Croatie: [
        'Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Slavonski Brod', 'Pula', 'Karlovac',
        'Varaždin', 'Šibenik', 'Sisak', 'Velika Gorica', 'Vinkovci', 'Vukovar', 'Dubrovnik',
        'Bjelovar', 'Koprivnica', 'Požega', 'Zaprešić', 'Solin', 'Čakovec', 'Virovitica',
        'Samobor', 'Kutina', 'Metković', 'Županja', 'Petrinja', 'Rovinj', 'Makarska',
        'Nova Gradiška', 'Križevci', 'Sinj', 'Mali Lošinj', 'Slatina', 'Trogir', 'Ogulin',
        'Knin', 'Omiš', 'Imotski', 'Valpovo', 'Umag', 'Gospić', 'Ilok', 'Našice',
        'Labin', 'Krapina', 'Ivanić-Grad', 'Delnice', 'Glina', 'Novska', 'Poreč',
        'Buje', 'Pleternica', 'Biograd na Moru', 'Vodice', 'Kastav', 'Kutjevo', 'Vrgorac'
      ].sort(),
      
      // 🇷🇴 ROUMANIE
      Roumanie: [
        'Bucarest', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Craiova', 'Brașov',
        'Galați', 'Ploiești', 'Oradea', 'Brăila', 'Arad', 'Pitești', 'Sibiu', 'Bacău',
        'Târgu Mureș', 'Baia Mare', 'Buzău', 'Botoșani', 'Satu Mare', 'Râmnicu Vâlcea',
        'Drobeta-Turnu Severin', 'Suceava', 'Piatra Neamț', 'Târgu Jiu', 'Târgoviște',
        'Focșani', 'Bistrița', 'Tulcea', 'Reșița', 'Hunedoara', 'Giurgiu', 'Roman',
        'Barlad', 'Alba Iulia', 'Zalău', 'Sfântu Gheorghe', 'Turda', 'Mediaș', 'Slobozia',
        'Onești', 'Alexandria', 'Petroșani', 'Lugoj', 'Medgidia', 'Pașcani', 'Tecuci',
        'Miercurea Ciuc', 'Sighetu Marmației', 'Mangalia', 'Rădăuți', 'Câmpina', 'Dej',
        'Câmpulung', 'Odorheiu Secuiesc', 'Reghin', 'Mioveni', 'Făgăraș', 'Caracal',
        'Fetești', 'Curtea de Argeș', 'Năvodari', 'Sighișoara', 'Roșiorii de Vede', 'Dorohoi'
      ].sort(),
      
      // 🇧🇬 BULGARIE
      Bulgarie: [
        'Sofia', 'Plovdiv', 'Varna', 'Bourgas', 'Roussé', 'Stara Zagora', 'Pleven', 'Sliven',
        'Dobrich', 'Choumen', 'Pernik', 'Haskovo', 'Vratsa', 'Kyoustendil', 'Asenovgrad',
        'Montana', 'Lovetch', 'Kardzhali', 'Veliko Tarnovo', 'Pazardzhik', 'Blagoevgrad',
        'Sandanski', 'Smolyan', 'Sevlievo', 'Silistra', 'Razgrad', 'Gorna Oryahovitsa',
        'Vidin', 'Troyan', 'Karlovo', 'Aytos', 'Botevgrad', 'Gotse Delchev', 'Svishtov',
        'Harmanli', 'Parvomay', 'Lom', 'Nova Zagora', 'Elhovo', 'Byala Slatina', 'Rakovski',
        'Popovo', 'Dupnitsa', 'Petrich', 'Chirpan', 'Peshtera', 'Svilengrad', 'Samokov',
        'Tutrakan', 'Cherven Bryag', 'Kozloduy', 'Ihtiman', 'Kubrat', 'Belene', 'Veliki Preslav',
        'Pomorie', 'Valchi Dol', 'Dulovo', 'Varshets', 'Sopot', 'Belogradchik'
      ].sort(),
      
      // 🇬🇷 GRÈCE
      Grèce: [
        'Athènes', 'Thessalonique', 'Patras', 'Héraklion', 'Larissa', 'Volos', 'Rhodes',
        'Ioannina', 'Chania', 'Chalcis', 'Agrinio', 'Katerini', 'Trikala', 'Serres', 'Lamia',
        'Alexandroupoli', 'Kozani', 'Kavala', 'Kalamata', 'Veria', 'Corfu', 'Komotini',
        'Mytilene', 'Tripoli', 'Chios', 'Drama', 'Xanthi', 'Rethymno', 'Kilkis',
        'Livadeia', 'Arta', 'Preveza', 'Korinthos', 'Ermoupoli', 'Kifisia', 'Aigio',
        'Orestiada', 'Amaliada', 'Argos', 'Naousa', 'Sparti', 'Edessa', 'Thiva',
        'Elefsis', 'Megara', 'Florina', 'Giannitsa', 'Ptolemaida', 'Kastoria', 'Grevenà',
        'Nafplio', 'Atalanti', 'Zakynthos', 'Sitia', 'Mandra', 'Tyrnavos', 'Glyfada'
      ].sort(),
      
      // 🇨🇾 CHYPRE
      Chypre: [
        'Nicosie', 'Limassol', 'Larnaca', 'Famagouste', 'Paphos', 'Kyrenia', 'Paralimni',
        'Morphou', 'Aradhippou', 'Mesa Geitonia', 'Agios Athanasios', 'Ypsonas',
        'Lakatamia', 'Strovolos', 'Aglandjia', 'Engomi', 'Agios Dometios', 'Latsia',
        'Geri', 'Tseri', 'Dali', 'Livadia', 'Polis', 'Chlorakas', 'Pegeia', 'Oroklini',
        'Xylofagou', 'Deryneia', 'Sotira', 'Ayia Napa', 'Protaras', 'Kiti', 'Tersefanou',
        'Aradippou', 'Kornos', 'Avgorou', 'Achna', 'Vrysoulles', 'Frenaros', 'Liopetri'
      ].sort(),
      
      // 🇲🇹 MALTE
      Malte: [
        'Birkirkara', 'Mosta', 'San Pawl il-Baħar', 'Qormi', 'Żabbar', 'Naxxar', 'Sliema',
        'San Ġwann', 'Fgura', 'Żejtun', 'Rabat', 'Attard', 'Paola', 'Tarxien', 'Msida',
        'Gżira', 'Swieqi', 'St. Julian\'s', 'Ħamrun', 'Marsaskala', 'Marsaxlokk', 'Gudja',
        'Għaxaq', 'Birżebbuġa', 'Siġġiewi', 'Marsa', 'Żurrieq', 'Qrendi', 'Luqa', 'Santa Venera',
        'Kalkara', 'Għargħur', 'San Ġiljan', 'Balzan', 'Mellieħa', 'Senglea', 'Vittoriosa',
        'Cospicua', 'Floriana', 'Valletta', 'Mdina', 'Lija', 'Dingli', 'Xgħajra', 'Kirkop',
        'Safi', 'Mqabba', 'Żebbuġ', 'Victoria', 'Xewkija', 'Xagħra', 'Nadur', 'Qala'
      ].sort(),
      
      // 🇪🇪 ESTONIE
      Estonie: [
        'Tallinn', 'Tartu', 'Narva', 'Pärnu', 'Kohtla-Järve', 'Viljandi', 'Rakvere', 'Maardu',
        'Sillamäe', 'Kuressaare', 'Võru', 'Valga', 'Haapsalu', 'Jõhvi', 'Paide', 'Keila',
        'Kiviõli', 'Tapa', 'Põlva', 'Jõgeva', 'Türi', 'Elva', 'Rapla', 'Saue', 'Põltsamaa',
        'Sindi', 'Paldiski', 'Kärdla', 'Kunda', 'Tõrva', 'Narva-Jõesuu', 'Räpina', 'Otepää',
        'Tamsalu', 'Kilingi-Nõmme', 'Võhma', 'Antsla', 'Lihula', 'Mustvee', 'Loksa',
        'Kallaste', 'Mõisaküla', 'Püssi', 'Suure-Jaani', 'Abja-Paluoja', 'Kehra'
      ].sort(),
      
      // 🇱🇻 LETTONIE
      Lettonie: [
        'Riga', 'Daugavpils', 'Liepāja', 'Jelgava', 'Jūrmala', 'Ventspils', 'Rēzekne',
        'Valmiera', 'Jēkabpils', 'Ogre', 'Tukums', 'Salaspils', 'Cēsis', 'Kuldīga',
        'Olaine', 'Saldus', 'Talsi', 'Dobele', 'Krāslava', 'Bauska', 'Ludza', 'Sigulda',
        'Madona', 'Aizkraukle', 'Līvāni', 'Alūksne', 'Gulbene', 'Balvi', 'Limbaži',
        'Preiļi', 'Valka', 'Smiltene', 'Ilūkste', 'Aizpute', 'Kandava', 'Grobiņa',
        'Dagda', 'Viļāni', 'Brocēni', 'Rūjiena', 'Saulkrasti', 'Viesīte', 'Cesvaine',
        'Ape', 'Seda', 'Stende', 'Subate', 'Jaunjelgava', 'Piltene', 'Aknīste'
      ].sort(),
      
      // 🇱🇹 LITUANIE
      Lituanie: [
        'Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys', 'Alytus', 'Marijampolė',
        'Mažeikiai', 'Jonava', 'Utena', 'Kėdainiai', 'Tauragė', 'Telšiai', 'Ukmergė',
        'Visaginas', 'Plungė', 'Kretinga', 'Radviliškis', 'Palanga', 'Šilutė', 'Gargždai',
        'Druskininkai', 'Rokiškis', 'Biržai', 'Kuršėnai', 'Elektrėnai', 'Jurbarkas',
        'Garliava', 'Vilkaviškis', 'Raseiniai', 'Anykščiai', 'Lentvaris', 'Grigiškės',
        'Naujoji Akmenė', 'Prienai', 'Joniškis', 'Kelmė', 'Varėna', 'Kaišiadorys',
        'Pasvalys', 'Zarasai', 'Kupiškis', 'Skuodas', 'Molėtai', 'Kazlų Rūda',
        'Šakiai', 'Ignalina', 'Pabradė', 'Švenčionėliai', 'Šalčininkai', 'Trakai'
      ].sort(),
      
      // 🇲🇨 MONACO
      Monaco: [
        'Monte-Carlo', 'La Condamine', 'Fontvieille', 'Monaco-Ville', 'Moneghetti',
        'Saint-Roman', 'Larvotto', 'La Rousse', 'Les Révoires', 'Saint-Michel',
        'La Colle', 'Les Moneghetti', 'Ravin de Sainte-Dévote'
      ].sort(),
      
      // 🇦🇩 ANDORRE
      Andorre: [
        'Andorra la Vella', 'Escaldes-Engordany', 'Encamp', 'Sant Julià de Lòria',
        'La Massana', 'Santa Coloma', 'Ordino', 'Canillo', 'El Pas de la Casa',
        'Arinsal', 'La Cortinada', 'Llorts', 'El Tarter', 'Soldeu', 'Incles',
        'Aldosa', 'Anyós', 'Sispony', 'Aixàs', 'Aixirivall'
      ].sort(),
      
      // 🇸🇲 SAINT-MARIN
      'Saint-Marin': [
        'Serravalle', 'Borgo Maggiore', 'San Marino', 'Domagnano', 'Fiorentino',
        'Acquaviva', 'Faetano', 'Chiesanuova', 'Montegiardino', 'Dogana', 'Falciano',
        'Ventoso', 'Torraccia', 'Montecchio', 'Cailungo', 'Ca\' Giannino', 'Valdragone',
        'Confine', 'Rovereta', 'Teglio', 'Murata', 'Pianacci', 'Canepa', 'Castellaro',
        'Casole', 'Galavotto', 'Santa Mustiola', 'Poggio Chiesanuova', 'Poggio Casalino'
      ].sort(),
      
      // 🇻🇦 VATICAN
      Vatican: [
        'Cité du Vatican'
      ],
      
      // 🇱🇮 LIECHTENSTEIN
      Liechtenstein: [
        'Schaan', 'Vaduz', 'Triesen', 'Balzers', 'Eschen', 'Mauren', 'Triesenberg',
        'Ruggell', 'Gamprin', 'Schellenberg', 'Planken', 'Nendeln', 'Bendern',
        'Malbun', 'Steg', 'Masescha', 'Silum', 'Gaflei', 'Rotenboden'
      ].sort(),
      
      // 🇨🇦 CANADA
      Canada: [
        'Toronto', 'Montréal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg',
        'Québec', 'Hamilton', 'Kitchener', 'London', 'Halifax', 'St. Catharines', 'Oshawa',
        'Victoria', 'Windsor', 'Saskatoon', 'Regina', 'Sherbrooke', 'Barrie', 'Kelowna',
        'Abbotsford', 'Kingston', 'Saguenay', 'Trois-Rivières', 'Guelph', 'Moncton',
        'Brantford', 'Saint John', 'Thunder Bay', 'Peterborough', 'Sudbury', 'Cambridge',
        'Lethbridge', 'Nanaimo', 'Kamloops', 'Belleville', 'Chatham-Kent', 'Cape Breton',
        'Sarnia', 'Prince George', 'Fredericton', 'Chilliwack', 'Red Deer', 'Drummondville',
        'Saint-Jérôme', 'Granby', 'Medicine Hat', 'Wood Buffalo', 'Norfolk County',
        'Cornwall', 'Saint-Hyacinthe', 'Vernon', 'St. Albert', 'Charlottetown', 'Brandon'
      ].sort(),
      
      // 🇺🇸 USA (États-Unis)
      USA: [
        'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
        'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
        'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle',
        'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City',
        'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee',
        'Albuquerque', 'Tucson', 'Fresno', 'Mesa', 'Sacramento', 'Atlanta', 'Kansas City',
        'Colorado Springs', 'Omaha', 'Raleigh', 'Miami', 'Long Beach', 'Virginia Beach',
        'Oakland', 'Minneapolis', 'Tulsa', 'Tampa', 'Arlington', 'New Orleans',
        'Wichita', 'Bakersfield', 'Cleveland', 'Aurora', 'Anaheim', 'Honolulu', 'Santa Ana',
        'Riverside', 'Corpus Christi', 'Lexington', 'Henderson', 'Stockton', 'Saint Paul',
        'Cincinnati', 'St. Louis', 'Pittsburgh', 'Greensboro', 'Lincoln', 'Anchorage',
        'Plano', 'Orlando', 'Irvine', 'Newark', 'Durham', 'Chula Vista', 'Toledo',
        'Fort Wayne', 'St. Petersburg', 'Laredo', 'Jersey City', 'Chandler', 'Madison',
        'Lubbock', 'Scottsdale', 'Reno', 'Buffalo', 'Gilbert', 'Glendale', 'North Las Vegas',
        'Winston-Salem', 'Chesapeake', 'Norfolk', 'Fremont', 'Garland', 'Irving',
        'Hialeah', 'Richmond', 'Boise', 'Spokane', 'Baton Rouge', 'Des Moines'
      ].sort(),
      
      // 🇨🇮 CÔTE D'IVOIRE
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
      
      // 🇹🇳 TUNISIE
      Tunisie: [
        'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana', 'Gafsa',
        'Monastir', 'Ben Arous', 'Kasserine', 'Médenine', 'Nabeul', 'Tataouine', 'Béja',
        'Kef', 'Mahdia', 'Sidi Bouzid', 'Jendouba', 'Tozeur', 'Manouba', 'Siliana', 'Zaghouan',
        'Kebili', 'La Marsa', 'Hammamet', 'Zarzis', 'Houmt Souk', 'Djerba', 'Rades', 'El Mourouj',
        'Hammam Lif', 'La Goulette', 'Mégrine', 'Hammam Sousse', 'Mateur', 'Douz', 'Radès',
        'Oued Ellil', 'Moknine', 'Kalâa Kebira', 'Sakiet Ezzit', 'Dar Chaâbane', 'La Soukra',
        'Akouda', 'Kalâa Seghira', 'Hammam Chott', 'Boumerdès', 'Sidi Alouane', 'Agareb',
        'Sidi Bennour', 'El Battan', 'Mornag', 'Korba', 'Menzel Temime', 'Menzel Bourguiba',
        'Ksar Hellal', 'Ksibet el-Médiouni', 'Sahline', 'Téboulba', 'Ouerdanine', 'Mareth',
        'Mnihla', 'Ghardimaou', 'Kerkennah', 'Chihia', 'Hajeb El Ayoun', 'Sidi Bou Ali'
      ].sort(),
      
      // 🇩🇿 ALGÉRIE
      Algérie: [
        'Alger', 'Oran', 'Constantine', 'Batna', 'Djelfa', 'Sétif', 'Annaba', 'Sidi Bel Abbès',
        'Biskra', 'Tébessa', 'El Oued', 'Skikda', 'Tiaret', 'Béjaïa', 'Tlemcen', 'Béchar',
        'Mostaganem', 'El Eulma', 'Bordj Bou Arréridj', 'Souk Ahras', 'Chlef', 'Médéa',
        'Tizi Ouzou', 'Laghouat', 'M\'Sila', 'Jijel', 'Relizane', 'Saïda', 'Guelma', 'Ghardaïa',
        'Blida', 'Mascara', 'Boumerdès', 'El Khroub', 'Khenchela', 'Ouargla', 'Aïn Beïda',
        'Oum El Bouaghi', 'Adrar', 'Tindouf', 'Aïn Témouchent', 'El Bayadh', 'Mila', 'Naâma',
        'Tamanrasset', 'Tipaza', 'Illizi', 'Tissemsilt', 'El Tarf', 'Bouira', 'Aïn Defla',
        'Khemis Miliana', 'Sour El Ghozlane', 'Aflou', 'Hadjout', 'Tolga', 'Sidi Aïch',
        'Birine', 'Dar El Beïda', 'Réghaïa', 'Aïn Taya', 'Birtouta', 'Zeralda', 'Bir El Djir',
        'Hassi Bahbah', 'Messaad', 'Collo', 'Sougueur', 'Ksar Chellala', 'Rechaïga', 'Aïn Oussara',
        'Sidi Khaled', 'Aïn El Turk', 'El Meghaïer', 'Fouka', 'Koléa', 'Cherchell', 'Baraki'
      ].sort(),
      
      // 🇲🇦 MAROC
      Maroc: [
        'Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Agadir', 'Tanger', 'Meknès', 'Oujda',
        'Kénitra', 'Tétouan', 'Salé', 'Nador', 'Khouribga', 'Béni Mellal', 'Safi', 'El Jadida',
        'Taza', 'Mohammédia', 'Laâyoune', 'Settat', 'Larache', 'Khémisset', 'Guelmim', 'Berkane',
        'Errachidia', 'Oued Zem', 'Al Hoceïma', 'Dakhla', 'Tifelt', 'Essaouira', 'Taroudant',
        'Kelaat Sraghna', 'Oulad Teïma', 'Youssoufia', 'Sidi Kacem', 'Tan-Tan', 'Ouarzazate',
        'Sidi Slimane', 'Ksar El Kébir', 'Tarfaya', 'Guercif', 'Dcheira El Jihadia', 'Fnideq',
        'Ouazzane', 'Sidi Yahya El Gharb', 'Martil', 'Aïn Harrouda', 'Skhirat', 'Ouad Laou',
        'Benslimane', 'Midelt', 'Azrou', 'Bouskoura', 'Fquih Ben Salah', 'Tiznit', 'Zagora',
        'Aït Melloul', 'Sidi Bennour', 'Maknes', 'Sidi Ifni', 'Chefchaouen', 'Had Soualem',
        'Kalaat M\'Gouna', 'Tinghir', 'Ifrane', 'Azemmour', 'Beni Ansar', 'Sidi Rahal',
        'Oued Amlil', 'Tifnit', 'Moulay Bousselham', 'Sabaa Aiyoun', 'Zinat', 'Imzouren'
      ].sort(),
      
      // 🌍 AUTRE (villes génériques)
      Autre: [
        'Capitale', 'Centre-ville', 'Banlieue', 'Zone industrielle', 'Zone commerciale',
        'Quartier résidentiel', 'Centre historique', 'Port', 'Aéroport', 'Gare centrale',
        'Université', 'Zone touristique', 'Périphérie', 'Nouveau quartier', 'Vieille ville'
      ].sort()

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