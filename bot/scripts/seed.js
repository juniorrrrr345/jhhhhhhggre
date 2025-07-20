require('dotenv').config();
const mongoose = require('mongoose');
const Plug = require('../src/models/Plug');
const Config = require('../src/models/Config');

const samplePlugs = [
  {
    name: "PlugParis",
    description: "Service de livraison premium à Paris et région parisienne. Produits de qualité supérieure.",
    image: "https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=PlugParis",
    countries: ["France"],
    services: {
      delivery: {
        enabled: true,
        description: "Livraison rapide en moins de 2h dans Paris"
      },
      postal: {
        enabled: true,
        description: "Envoi postal sécurisé dans toute la France"
      },
      meetup: {
        enabled: true,
        description: "Rendez-vous possible dans les lieux publics"
      }
    },
    socialMedia: {
      telegram: "https://t.me/plugparis",
      instagram: "https://instagram.com/plugparis",
      whatsapp: "https://wa.me/33123456789"
    },
    isVip: true,
    vipOrder: 1,
    isActive: true
  },
  {
    name: "LyonConnect",
    description: "Votre connection privilégiée à Lyon. Service discret et fiable depuis 2020.",
    image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=LyonConnect",
    countries: ["France"],
    services: {
      delivery: {
        enabled: true,
        description: "Livraison dans Lyon et banlieue en 1h"
      },
      postal: {
        enabled: false,
        description: ""
      },
      meetup: {
        enabled: true,
        description: "Meetup dans le centre-ville uniquement"
      }
    },
    socialMedia: {
      telegram: "https://t.me/lyonconnect",
      website: "https://lyonconnect.fr"
    },
    isVip: true,
    vipOrder: 2,
    isActive: true
  },
  {
    name: "BelgiumSupplier",
    description: "Fournisseur belge avec expérience internationale. Expédition Europe.",
    image: "https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=BelgiumSupplier",
    countries: ["Belgique", "Pays-Bas", "Luxembourg"],
    services: {
      delivery: {
        enabled: false,
        description: ""
      },
      postal: {
        enabled: true,
        description: "Expédition sécurisée dans toute l'Europe"
      },
      meetup: {
        enabled: true,
        description: "Rencontres possibles à Bruxelles et Anvers"
      }
    },
    socialMedia: {
      telegram: "https://t.me/belgiumsupplier",
      whatsapp: "https://wa.me/32987654321"
    },
    isVip: false,
    isActive: true
  },
  {
    name: "SwissQuality",
    description: "Qualité suisse garantie. Service premium pour clientèle exigeante.",
    image: "https://via.placeholder.com/300x200/EF4444/FFFFFF?text=SwissQuality",
    countries: ["Suisse"],
    services: {
      delivery: {
        enabled: true,
        description: "Livraison express dans toute la Suisse"
      },
      postal: {
        enabled: true,
        description: "Envoi postal premium ultra-sécurisé"
      },
      meetup: {
        enabled: false,
        description: ""
      }
    },
    socialMedia: {
      telegram: "https://t.me/swissquality",
      website: "https://swissquality.ch"
    },
    isVip: true,
    vipOrder: 3,
    isActive: true
  },
  {
    name: "MarseillePort",
    description: "Basé au port de Marseille. Connexions méditerranéennes établies.",
    image: "https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=MarseillePort",
    countries: ["France", "Italie", "Espagne"],
    services: {
      delivery: {
        enabled: true,
        description: "Livraison Marseille et PACA"
      },
      postal: {
        enabled: true,
        description: "Expédition vers Méditerranée"
      },
      meetup: {
        enabled: true,
        description: "Rencontres port de Marseille"
      }
    },
    socialMedia: {
      telegram: "https://t.me/marseilleport",
      instagram: "https://instagram.com/marseilleport"
    },
    isVip: false,
    isActive: true
  }
];

const defaultConfig = {
  _id: 'main',
  welcome: {
    image: "https://via.placeholder.com/500x300/4F46E5/FFFFFF?text=Bot+Telegram+VIP",
    text: "🌟 Bienvenue sur notre plateforme VIP !\n\nDécouvrez nos meilleurs plugs sélectionnés avec soin pour vous offrir un service de qualité premium.\n\n🔥 Section VIP mise à jour quotidiennement\n✅ Services vérifiés et de confiance"
  },
  buttons: {
    topPlugs: {
      text: "🔌 Top Des Plugs",
      enabled: true
    },
    contact: {
      text: "📞 Contact",
      content: "Besoin d'aide ou d'informations ?\n\n📧 Email: admin@botplugs.com\n📱 Support disponible 24h/7j\n\n🔒 Toutes vos communications sont cryptées et sécurisées.",
      enabled: true
    },
    info: {
      text: "ℹ️ Info",
      content: "🤖 Bot Telegram VIP System\n\n🎯 Plateforme premium de mise en relation\n🔐 Sécurité et discrétion garanties\n⭐ Sélection VIP mise à jour en temps réel\n🌍 Couverture internationale\n\n📊 Statistiques mises à jour en continu",
      enabled: true
    }
  },
  socialMedia: {
    telegram: "https://t.me/botplugsvip",
    instagram: "https://instagram.com/botplugsvip",
    whatsapp: "https://wa.me/33199887766",
    website: "https://botplugs.com"
  },
  vip: {
    enabled: true,
    title: "🌟 SECTION VIP PREMIUM",
    description: "Nos plugs premium sélectionnés pour leur fiabilité et qualité de service",
    position: "top"
  },
  filters: {
    byService: "🔍 Filtrer par service",
    byCountry: "🌍 Filtrer par pays",
    all: "📋 Tous les plugs"
  },
  messages: {
    noPlugsFound: "😅 Aucun plug trouvé pour ces critères.\nEssayez d'autres filtres ou contactez-nous.",
    errorOccurred: "❌ Une erreur est survenue, veuillez réessayer dans quelques instants."
  },
  botTexts: {
    vipTitle: "👑 Boutiques VIP Premium",
    vipDescription: "✨ Découvrez nos boutiques sélectionnées",
    topPlugsTitle: "🔌 Top Des Plugs", 
    topPlugsDescription: "Choisissez une option pour découvrir nos plugs :",
    allPlugsTitle: "📋 Tous nos plugs :",
    filterServiceTitle: "🔍 Filtrer par service",
    filterServiceDescription: "Choisissez le type de service :",
    filterCountryTitle: "🌍 Filtrer par pays",
    filterCountryDescription: "Choisissez un pays :"
  },
  boutique: {
    name: "Boutique",
    logo: "",
    subtitle: "Sélection de boutiques"
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🗃️ Nettoyage de la base de données...');
    await Plug.deleteMany({});
    await Config.deleteMany({});
    
    console.log('📝 Création de la configuration par défaut...');
    await Config.create(defaultConfig);
    
    console.log('👥 Création des plugs d\'exemple...');
    await Plug.insertMany(samplePlugs);
    
    console.log(`✅ Base de données initialisée avec succès !`);
    console.log(`📊 ${samplePlugs.length} plugs créés`);
    console.log(`⭐ ${samplePlugs.filter(p => p.isVip).length} plugs VIP`);
    console.log(`🌍 ${[...new Set(samplePlugs.flatMap(p => p.countries))].length} pays couverts`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
};

// Vérifier si le script est exécuté directement
if (require.main === module) {
  seedDatabase();
}