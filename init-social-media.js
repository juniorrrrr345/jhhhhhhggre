const mongoose = require('mongoose');

// Nouvelle URI MongoDB
const MONGODB_URI = 'mongodb+srv://teste:Junior@junior.jiy8uam.mongodb.net/?retryWrites=true&w=majority&appName=Junior';

// Réseaux sociaux à initialiser
const socialMediaList = [
  { 
    id: 'telegram',
    name: 'Telegram', 
    emoji: '📱', 
    url: 'https://t.me/+zcP68c4M_3NlM2Y0',
    enabled: true
  },
  { 
    id: 'instagram',
    name: 'Instagram', 
    emoji: '📸', 
    url: 'https://www.instagram.com/find.yourplug',
    enabled: true
  },
  { 
    id: 'luffa',
    name: 'Luffa', 
    emoji: '🛜', 
    url: 'https://callup.luffa.im/c/EnvtiTHkbvP',
    enabled: true
  },
  { 
    id: 'discord',
    name: 'Discord', 
    emoji: '🎮', 
    url: 'https://discord.gg/g2dACUC3',
    enabled: true
  },
  { 
    id: 'potato',
    name: 'Potato', 
    emoji: '🥔', 
    url: 'https://dym168.org/findyourplug',
    enabled: true
  }
];

async function initSocialMedia() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    // Définir le schéma Config
    const ConfigSchema = new mongoose.Schema({
      _id: { type: String, default: 'main' },
      welcomeMessage: String,
      contactMessage: String,
      infoMessage: String,
      supportLink: String,
      image: String,
      socialMedia: mongoose.Schema.Types.Mixed,
      socialMediaList: [{
        id: String,
        name: String,
        emoji: String,
        url: String,
        enabled: Boolean
      }],
      languages: mongoose.Schema.Types.Mixed,
      shopConfig: mongoose.Schema.Types.Mixed
    }, { timestamps: true });
    
    const Config = mongoose.models.Config || mongoose.model('Config', ConfigSchema);
    
    // Récupérer la configuration existante
    let config = await Config.findById('main');
    
    if (!config) {
      console.log('❌ Aucune configuration trouvée. Création...');
      config = await Config.create({
        _id: 'main',
        socialMediaList: socialMediaList
      });
    } else {
      console.log('✅ Configuration existante trouvée');
      
      // Mettre à jour les réseaux sociaux
      config.socialMediaList = socialMediaList;
      
      // Aussi mettre à jour l'ancien format pour compatibilité
      config.socialMedia = {
        telegram: 'https://t.me/+zcP68c4M_3NlM2Y0',
        instagram: 'https://www.instagram.com/find.yourplug',
        whatsapp: ''
      };
      
      await config.save();
    }
    
    console.log('\n✅ Réseaux sociaux initialisés avec succès !');
    console.log('\n📱 Réseaux sociaux configurés :');
    socialMediaList.forEach(social => {
      console.log(`   ${social.emoji} ${social.name}: ${social.url}`);
    });
    
    console.log('\n📋 Prochaines étapes :');
    console.log('1. Les réseaux sociaux sont maintenant dans la base de données');
    console.log('2. Vous pouvez les modifier depuis : https://sfeplugslink.vercel.app/admin/social-media');
    console.log('3. Le bot affichera automatiquement ces réseaux sociaux');
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Lancer l'initialisation
initSocialMedia();