const mongoose = require('mongoose');

// Nouvelle URI MongoDB
const MONGODB_URI = 'mongodb+srv://teste:Junior@junior.jiy8uam.mongodb.net/?retryWrites=true&w=majority&appName=Junior';

async function checkConfigState() {
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
      socialMediaList: mongoose.Schema.Types.Mixed,
      languages: mongoose.Schema.Types.Mixed,
      shopConfig: mongoose.Schema.Types.Mixed
    }, { timestamps: true, strict: false });
    
    const Config = mongoose.models.Config || mongoose.model('Config', ConfigSchema);
    
    // Récupérer la configuration
    const config = await Config.findById('main');
    
    if (!config) {
      console.log('❌ Aucune configuration trouvée !');
      return;
    }
    
    console.log('\n📊 État de la configuration :');
    console.log('================================');
    
    // Messages
    console.log('\n📝 Messages :');
    console.log(`   Welcome: ${config.welcomeMessage ? '✅' : '❌'} ${config.welcomeMessage ? config.welcomeMessage.substring(0, 50) + '...' : 'Non défini'}`);
    console.log(`   Contact: ${config.contactMessage ? '✅' : '❌'} ${config.contactMessage ? config.contactMessage.substring(0, 50) + '...' : 'Non défini'}`);
    console.log(`   Info: ${config.infoMessage ? '✅' : '❌'} ${config.infoMessage ? config.infoMessage.substring(0, 50) + '...' : 'Non défini'}`);
    
    // Langues
    console.log('\n🌍 Langues :');
    console.log(`   Activé: ${config.languages?.enabled ? '✅' : '❌'}`);
    console.log(`   Langue actuelle: ${config.languages?.currentLanguage || 'Non définie'}`);
    console.log(`   Langues disponibles: ${config.languages?.available ? config.languages.available.join(', ') : 'Non définies'}`);
    
    // Réseaux sociaux
    console.log('\n📱 Réseaux sociaux :');
    if (config.socialMediaList && Array.isArray(config.socialMediaList)) {
      console.log(`   Format: socialMediaList (nouveau format) ✅`);
      console.log(`   Nombre: ${config.socialMediaList.length}`);
      config.socialMediaList.forEach(social => {
        console.log(`   - ${social.emoji} ${social.name}: ${social.url} ${social.enabled ? '✅' : '❌'}`);
      });
    } else if (config.socialMedia && typeof config.socialMedia === 'object') {
      console.log(`   Format: socialMedia (ancien format) ⚠️`);
      Object.entries(config.socialMedia).forEach(([key, value]) => {
        if (value) {
          console.log(`   - ${key}: ${value}`);
        }
      });
    } else {
      console.log('   ❌ Aucun réseau social configuré');
    }
    
    // Configuration boutique
    console.log('\n🏪 Configuration boutique :');
    console.log(`   Nom: ${config.shopConfig?.name || 'Non défini'}`);
    console.log(`   Logo: ${config.shopConfig?.logo ? '✅' : '❌'}`);
    console.log(`   Background: ${config.shopConfig?.backgroundImage ? '✅' : '❌'}`);
    
    // Raw data pour debug
    console.log('\n🔍 Données brutes (debug) :');
    console.log(JSON.stringify(config.toObject(), null, 2));
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Lancer la vérification
checkConfigState();