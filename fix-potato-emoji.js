const mongoose = require('mongoose');
require('dotenv').config();

// Connexion MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://admin:lCGYmBzwZwkpTgvT@tesye.qazpla.mongodb.net/testdatabase?retryWrites=true&w=majority';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error);
    process.exit(1);
  }
};

// Schema Config
const configSchema = new mongoose.Schema({
  _id: String,
  socialMedia: Array,
  socialMediaList: Array
}, { collection: 'configs' });

const Config = mongoose.model('Config', configSchema);

// Fonction pour ajouter/corriger Potato avec emoji pot
const fixPotatoEmoji = async () => {
  try {
    console.log('🔧 Correction emoji Potato vers 🏴‍☠️...');
    
    const config = await Config.findById('main');
    if (!config) {
      console.log('❌ Configuration non trouvée');
      return;
    }
    
    // Initialiser socialMediaList si inexistant
    if (!config.socialMediaList) {
      config.socialMediaList = [];
    }
    
    // Vérifier si Potato existe déjà
    const potatoIndex = config.socialMediaList.findIndex(item => 
      item.name && item.name.toLowerCase().includes('potato')
    );
    
    if (potatoIndex !== -1) {
      // Mettre à jour l'emoji existant
      config.socialMediaList[potatoIndex].emoji = '🏴‍☠️';
      console.log('✅ Emoji Potato mis à jour vers 🏴‍☠️');
    } else {
      // Ajouter Potato avec emoji drapeau pirate
      config.socialMediaList.push({
        id: 'potato',
        name: 'Potato',
        emoji: '🏴‍☠️',
        url: 'https://dym168.org/findyourplug',
        enabled: true
      });
      console.log('✅ Potato ajouté avec emoji 🏴‍☠️');
    }
    
    // Sauvegarder
    await config.save();
    console.log('🚀 Configuration sauvegardée');
    
    // Afficher le résultat
    const potatoItem = config.socialMediaList.find(item => 
      item.name && item.name.toLowerCase().includes('potato')
    );
    console.log('📱 Potato dans le bot:', potatoItem);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Déconnexion MongoDB');
  }
};

// Exécuter la correction
const main = async () => {
  await connectDB();
  await fixPotatoEmoji();
};

main();