const mongoose = require('mongoose');

// Configuration MongoDB
const MONGODB_URI = 'mongodb+srv://teste:Junior@junior.jiy8uam.mongodb.net/?retryWrites=true&w=majority&appName=Junior';

// Schéma Config complet
const ConfigSchema = new mongoose.Schema({
  _id: { type: String, default: 'main' },
  welcomeMessage: {
    fr: String,
    en: String,
    es: String,
    ar: String
  },
  languages: {
    enabled: { type: Boolean, default: true },
    available: [String],
    currentLanguage: { type: String, default: 'fr' }
  },
  shopConfig: {
    name: { type: String, default: 'FINDYOURPLUG' },
    logo: String,
    background: String
  },
  socialMedia: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    emoji: { type: String, required: true },
    enabled: { type: Boolean, default: true }
  }],
  socialMediaList: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    emoji: { type: String, required: true },
    enabled: { type: Boolean, default: true }
  }],
  contactMessage: {
    fr: String,
    en: String,
    es: String,
    ar: String
  },
  infoMessage: {
    fr: String,
    en: String,
    es: String,
    ar: String
  },
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: {
    fr: String,
    en: String,
    es: String,
    ar: String
  },
  adminToken: String,
  botToken: String,
  webAppUrl: String
});

const Config = mongoose.model('Config', ConfigSchema);

async function initializeConfig() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Configuration complète comme avant
    const completeConfig = {
      _id: 'main',
      welcomeMessage: {
        fr: "🎉 Bienvenue sur FINDYOURPLUG ! 🎉\n\n🌟 Votez pour vos plugs préférés et découvrez les meilleurs de votre région !\n\n💼 Vous êtes un professionnel ?\nInscrivez votre service gratuitement et gagnez en visibilité !\n\n🔥 C'est simple, rapide et efficace pour trouver ce dont vous avez besoin !",
        en: "🎉 Welcome to FINDYOURPLUG! 🎉\n\n🌟 Vote for your favorite plugs and discover the best in your area!\n\n💼 Are you a professional?\nRegister your service for free and gain visibility!\n\n🔥 It's simple, fast and effective to find what you need!",
        es: "🎉 ¡Bienvenido a FINDYOURPLUG! 🎉\n\n🌟 ¡Vota por tus plugs favoritos y descubre los mejores de tu zona!\n\n💼 ¿Eres profesional?\n¡Registra tu servicio gratis y gana visibilidad!\n\n🔥 ¡Es simple, rápido y efectivo para encontrar lo que necesitas!",
        ar: "🎉 مرحباً بك في FINDYOURPLUG! 🎉\n\n🌟 صوت لأفضل البائعين واكتشف الأفضل في منطقتك!\n\n💼 هل أنت محترف؟\nسجل خدمتك مجاناً واحصل على المزيد من الظهور!\n\n🔥 بسيط وسريع وفعال للعثور على ما تحتاجه!"
      },
      languages: {
        enabled: true,
        available: ['fr', 'en', 'es', 'ar'],
        currentLanguage: 'fr'
      },
      shopConfig: {
        name: 'FINDYOURPLUG',
        logo: 'https://i.imgur.com/D5YB1pj.jpeg',
        background: 'https://i.imgur.com/D5YB1pj.jpeg'
      },
      socialMedia: [
        {
          name: 'Telegram',
          url: 'https://t.me/+zcP68c4M_3NlM2Y0',
          emoji: '📱',
          enabled: true
        },
        {
          name: 'Instagram',
          url: 'https://www.instagram.com/find.yourplug',
          emoji: '📸',
          enabled: true
        },
        {
          name: 'Luffa',
          url: 'https://callup.luffa.im/c/EnvtiTHkbvP',
          emoji: '🧽',
          enabled: true
        },
        {
          name: 'Discord',
          url: 'https://discord.gg/g2dACUC3',
          emoji: '🎮',
          enabled: true
        },
        {
          name: 'Contact',
          url: 'https://t.me/contact',
          emoji: '📞',
          enabled: true
        },
        {
          name: 'Potato',
          url: 'https://dym168.org/findyourplug',
          emoji: '🥔',
          enabled: true
        }
      ],
      socialMediaList: [
        {
          name: 'Telegram',
          url: 'https://t.me/+zcP68c4M_3NlM2Y0',
          emoji: '📱',
          enabled: true
        },
        {
          name: 'Instagram',
          url: 'https://www.instagram.com/find.yourplug',
          emoji: '📸',
          enabled: true
        },
        {
          name: 'Luffa',
          url: 'https://callup.luffa.im/c/EnvtiTHkbvP',
          emoji: '🧽',
          enabled: true
        },
        {
          name: 'Discord',
          url: 'https://discord.gg/g2dACUC3',
          emoji: '🎮',
          enabled: true
        },
        {
          name: 'Contact',
          url: 'https://t.me/contact',
          emoji: '📞',
          enabled: true
        },
        {
          name: 'Potato',
          url: 'https://dym168.org/findyourplug',
          emoji: '🥔',
          enabled: true
        }
      ],
      contactMessage: {
        fr: "📞 **Contactez-nous**\n\nVous avez des questions ? Besoin d'aide ?\n\n📧 Email: support@findyourplug.com\n📱 Telegram: @findyourplug_support\n\n🕐 Nous répondons sous 24h !",
        en: "📞 **Contact Us**\n\nHave questions? Need help?\n\n📧 Email: support@findyourplug.com\n📱 Telegram: @findyourplug_support\n\n🕐 We respond within 24 hours!",
        es: "📞 **Contáctanos**\n\n¿Tienes preguntas? ¿Necesitas ayuda?\n\n📧 Email: support@findyourplug.com\n📱 Telegram: @findyourplug_support\n\n🕐 ¡Respondemos en 24 horas!",
        ar: "📞 **اتصل بنا**\n\nهل لديك أسئلة؟ تحتاج مساعدة؟\n\n📧 البريد: support@findyourplug.com\n📱 تيليجرام: @findyourplug_support\n\n🕐 نرد خلال 24 ساعة!"
      },
      infoMessage: {
        fr: "ℹ️ **À propos de FINDYOURPLUG**\n\n🌟 La première plateforme de mise en relation entre clients et professionnels !\n\n✅ Trouvez rapidement ce que vous cherchez\n✅ Votez pour vos services préférés\n✅ Inscription gratuite pour les pros\n\n🚀 Rejoignez notre communauté !",
        en: "ℹ️ **About FINDYOURPLUG**\n\n🌟 The first platform connecting customers and professionals!\n\n✅ Quickly find what you're looking for\n✅ Vote for your favorite services\n✅ Free registration for professionals\n\n🚀 Join our community!",
        es: "ℹ️ **Acerca de FINDYOURPLUG**\n\n🌟 ¡La primera plataforma que conecta clientes y profesionales!\n\n✅ Encuentra rápidamente lo que buscas\n✅ Vota por tus servicios favoritos\n✅ Registro gratuito para profesionales\n\n🚀 ¡Únete a nuestra comunidad!",
        ar: "ℹ️ **حول FINDYOURPLUG**\n\n🌟 أول منصة تربط العملاء بالمحترفين!\n\n✅ اعثر بسرعة على ما تبحث عنه\n✅ صوت لخدماتك المفضلة\n✅ تسجيل مجاني للمحترفين\n\n🚀 انضم إلى مجتمعنا!"
      },
      maintenanceMode: false,
      maintenanceMessage: {
        fr: "🔧 Maintenance en cours...\n\nNous revenons très bientôt !",
        en: "🔧 Maintenance in progress...\n\nWe'll be back soon!",
        es: "🔧 Mantenimiento en curso...\n\n¡Volveremos pronto!",
        ar: "🔧 صيانة جارية...\n\nسنعود قريباً!"
      },
      adminToken: 'ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1',
      botToken: '8049816368:AAHyroX2rkSFeT3HEMesn_qgqD6nFCYxciY',
      webAppUrl: 'https://findyourplug-admin.onrender.com/shop'
    };

    // Supprimer l'ancienne config si elle existe
    await Config.deleteOne({ _id: 'main' });
    
    // Créer la nouvelle config
    const config = new Config(completeConfig);
    await config.save();
    
    console.log('✅ Configuration complète initialisée avec succès !');
    console.log('📱 Réseaux sociaux:', config.socialMedia.length);
    console.log('🌍 Langues disponibles:', config.languages.available);
    console.log('🏪 Nom de la boutique:', config.shopConfig.name);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnecté de MongoDB');
  }
}

initializeConfig();