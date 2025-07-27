require('dotenv').config({ path: './bot/.env' });
const mongoose = require('mongoose');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔄 Connexion à MongoDB...');
console.log('URI:', MONGODB_URI?.substring(0, 30) + '...');

// Schéma de configuration
const configSchema = new mongoose.Schema({
  _id: String,
  socialMedia: Array,
  socialMediaList: Array,
  buttons: Object,
}, { strict: false });

const Config = mongoose.model('Config', configSchema);

// Configuration à restaurer
const socialMediaConfig = [
  {
    name: 'Telegram',
    emoji: '📱',
    url: 'https://t.me/+zcP68c4M_3NlM2Y0',
    order: 1
  },
  {
    name: 'Contact',
    emoji: '📞',
    url: 'https://t.me/findyourplugsav',
    order: 2
  }
];

const restoreConfig = async () => {
  try {
    // Connexion avec timeout plus long
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connecté à MongoDB !');
    
    // Chercher ou créer la config
    let config = await Config.findById('main');
    
    if (!config) {
      console.log('📝 Création d\'une nouvelle configuration...');
      config = new Config({ _id: 'main' });
    } else {
      console.log('📝 Configuration existante trouvée, mise à jour...');
    }
    
    // Mettre à jour les réseaux sociaux
    config.socialMedia = socialMediaConfig;
    config.socialMediaList = socialMediaConfig.map(item => ({
      ...item,
      enabled: true
    }));
    
    // S'assurer que le bouton est activé
    if (!config.buttons) config.buttons = {};
    if (!config.buttons.socialMedia) config.buttons.socialMedia = {};
    
    config.buttons.socialMedia.enabled = true;
    config.buttons.socialMedia.text = '📱 Réseaux Sociaux';
    config.buttons.socialMedia.content = 'Rejoignez notre communauté sur nos différents réseaux sociaux ! 🚀';
    
    // Sauvegarder
    await config.save();
    
    console.log('✅ Configuration restaurée avec succès !');
    console.log('📱 Réseaux sociaux configurés:');
    socialMediaConfig.forEach((social, i) => {
      console.log(`  ${i+1}. ${social.emoji} ${social.name}: ${social.url}`);
    });
    
    console.log('\n🎯 Votre bot Telegram peut maintenant afficher les réseaux sociaux !');
    console.log('💡 Testez le bouton "📱 Réseaux Sociaux" sur votre bot.');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Solutions possibles:');
      console.log('1. Vérifier la connexion internet');
      console.log('2. Vérifier l\'URI MongoDB dans bot/.env');
      console.log('3. Vérifier que MongoDB Atlas est accessible');
    }
    
    process.exit(1);
  }
};

restoreConfig();