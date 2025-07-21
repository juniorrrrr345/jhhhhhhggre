const mongoose = require('mongoose');
require('dotenv').config();

// Configuration exacte SwissQuality qui fonctionnait
const WORKING_CONFIG = {
  _id: 'main',
  welcome: {
    text: `🎉 Bienvenue sur SwissQuality !

🔌 Découvrez nos boutiques premium sélectionnées.

👇 Naviguez avec les boutons ci-dessous :`,
    image: 'https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    socialMedia: [
      {
        name: 'Telegram',
        emoji: '📱',
        url: '@swissqualitysupport',
        order: 1
      },
      {
        name: 'Support',
        emoji: '🆘',
        url: 'support@swissquality.ch',
        order: 2
      }
    ]
  },
  
  boutique: {
    name: 'SwissQuality',
    subtitle: 'Votre boutique premium de confiance',
    logo: '',
    backgroundImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    vipTitle: '👑 Section VIP Premium',
    vipSubtitle: 'Nos partenaires de confiance sélectionnés',
    searchTitle: '🔍 Recherche Avancée',
    searchSubtitle: 'Trouvez exactement ce que vous cherchez'
  },
  
  buttons: {
    topPlugs: {
      text: '🔌 Top Des Plugs',
      enabled: true
    },
    vipPlugs: {
      text: '👑 Boutiques VIP',
      enabled: true  
    },
    contact: {
      text: '📞 Contact',
      content: `📞 Contactez SwissQuality

🔹 Telegram : @swissqualitysupport
🔹 Email : support@swissquality.ch
🔹 Support 24/7 disponible

Nous sommes là pour vous aider ! 💪`,
      enabled: true
    },
    info: {
      text: 'ℹ️ Info',
      content: `ℹ️ À propos de SwissQuality

🇨🇭 Boutique premium suisse
🔒 Sécurité et confiance garanties  
⭐ Partenaires vérifiés et certifiés
📦 Livraison rapide et discrète
💯 Satisfaction client prioritaire

SwissQuality - La qualité suisse à votre service ! 🎯`,
      enabled: true
    }
  },
  
  socialMedia: {
    telegram: '@swissqualitysupport',
    instagram: '',
    whatsapp: '',
    website: ''
  },
  
  vip: {
    enabled: true,
    title: '🌟 SECTION VIP PREMIUM',
    description: 'Nos plugs premium sélectionnés pour une qualité exceptionnelle',
    position: 'top'
  },
  
  filters: {
    byService: '🔍 Filtrer par service',
    byCountry: '🌍 Filtrer par pays',
    all: '📋 Tous les plugs'
  },
  
  messages: {
    welcome: '🎉 Bienvenue sur SwissQuality ! Votre plateforme premium.',
    noPlugsFound: '😅 Aucun plug trouvé pour ces critères. Essayez avec d\'autres filtres.',
    error: '❌ Une erreur est survenue. Notre équipe SwissQuality travaille à la résoudre.',
    errorOccurred: '❌ Erreur technique temporaire. Veuillez réessayer dans quelques instants.'
  },
  
  supportMenu: {
    enabled: true,
    text: `🆘 Support SwissQuality Premium

🔹 Support technique 24/7
🔹 Aide personnalisée
🔹 Résolution rapide des problèmes
🔹 Conseils d'experts

Contactez-nous via Telegram : @swissqualitysupport`,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  
  infoMenu: {
    enabled: true,
    text: `ℹ️ SwissQuality - Excellence Suisse

🇨🇭 Depuis 2020, SwissQuality s'engage à vous offrir :

✅ Des partenaires rigoureusement sélectionnés
✅ Une qualité suisse reconnue
✅ Un service client d'exception  
✅ La confidentialité absolue
✅ Des prix compétitifs

Votre satisfaction est notre priorité ! 🎯`,
    image: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  
  updatedAt: new Date()
};

async function restoreWorkingConfig() {
  try {
    console.log('🔧 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    // Schéma flexible pour accepter toute structure
    const configSchema = new mongoose.Schema({}, { strict: false });
    const Config = mongoose.model('Config', configSchema);
    
    console.log('🗑️  Suppression de l\'ancienne configuration...');
    await Config.deleteOne({ _id: 'main' });
    
    console.log('💾 Insertion de la configuration SwissQuality...');
    const newConfig = new Config(WORKING_CONFIG);
    await newConfig.save();
    
    console.log('✅ Configuration SwissQuality restaurée avec succès !');
    console.log('📋 Configuration sauvegardée :');
    console.log('   - Nom boutique:', WORKING_CONFIG.boutique.name);
    console.log('   - Message d\'accueil:', WORKING_CONFIG.welcome.text.substring(0, 50) + '...');
    console.log('   - Image configurée:', WORKING_CONFIG.welcome.image ? 'Oui' : 'Non');
    console.log('   - Support activé:', WORKING_CONFIG.supportMenu.enabled ? 'Oui' : 'Non');
    console.log('   - Info activé:', WORKING_CONFIG.infoMenu.enabled ? 'Oui' : 'Non');
    
  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter la restauration
restoreWorkingConfig().then(() => {
  console.log('\n🎉 Configuration SwissQuality restaurée !');
  console.log('👉 Vous pouvez maintenant démarrer le bot et accéder au panel admin.');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});