const mongoose = require('mongoose');

// Connexion MongoDB
const connectDB = async () => {
  try {
    // Utiliser la variable d'environnement MONGODB_URI si disponible
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
  buttons: Object,
  botTexts: Object,
  languages: Object,
  socialMediaList: Array
}, { collection: 'configs' });

const Config = mongoose.model('Config', configSchema);

// Fonction pour mettre à jour toutes les configurations
const forceUpdateTranslations = async () => {
  try {
    console.log('🔧 Mise à jour des traductions et configurations...');
    
    const config = await Config.findById('main');
    if (!config) {
      console.log('❌ Configuration non trouvée');
      return;
    }
    
    // 1. Mettre à jour les boutons pour utiliser les nouvelles traductions
    if (!config.buttons) config.buttons = {};
    if (!config.buttons.topPlugs) config.buttons.topPlugs = {};
    
    // Forcer l'utilisation des traductions au lieu de texte en dur
    config.buttons.topPlugs.text = 'VOTER POUR VOTRE PLUG 🗳️'; // Fallback français
    config.buttons.topPlugs.enabled = true;
    
    console.log('✅ Bouton topPlugs mis à jour');
    
    // 2. Mettre à jour les textes du bot
    if (!config.botTexts) config.botTexts = {};
    config.botTexts.topPlugsTitle = 'VOTER POUR VOTRE PLUG 🗳️';
    
    console.log('✅ Textes du bot mis à jour');
    
    // 3. S'assurer que les traductions sont initialisées
    if (!config.languages) {
      config.languages = {
        enabled: true,
        currentLanguage: 'fr',
        availableLanguages: [
          { code: 'fr', name: 'Français', flag: '🇫🇷', enabled: true },
          { code: 'en', name: 'English', flag: '🇬🇧', enabled: true },
          { code: 'it', name: 'Italiano', flag: '🇮🇹', enabled: true },
          { code: 'es', name: 'Español', flag: '🇪🇸', enabled: true },
          { code: 'de', name: 'Deutsch', flag: '🇩🇪', enabled: true }
        ],
        translations: new Map()
      };
    }
    
    // Initialiser les traductions pour menu_topPlugs
    if (!config.languages.translations) {
      config.languages.translations = new Map();
    }
    
    const topPlugsTranslations = new Map();
    topPlugsTranslations.set('fr', 'VOTER POUR VOTRE PLUG 🗳️');
    topPlugsTranslations.set('en', 'VOTE FOR YOUR PLUG 🗳️');
    topPlugsTranslations.set('it', 'VOTA PER IL TUO PLUG 🗳️');
    topPlugsTranslations.set('es', 'VOTA POR TU PLUG 🗳️');
    topPlugsTranslations.set('de', 'STIMME FÜR DEINEN PLUG 🗳️');
    
    config.languages.translations.set('menu_topPlugs', topPlugsTranslations);
    
    console.log('✅ Traductions menu_topPlugs configurées');
    
    // 4. Mettre à jour l'emoji Potato
    if (!config.socialMediaList) {
      config.socialMediaList = [];
    }
    
    const potatoIndex = config.socialMediaList.findIndex(item => 
      item.name && item.name.toLowerCase().includes('potato')
    );
    
    if (potatoIndex !== -1) {
      config.socialMediaList[potatoIndex].emoji = '🏴‍☠️';
      console.log('✅ Emoji Potato mis à jour vers 🏴‍☠️');
    } else {
      config.socialMediaList.push({
        id: 'potato',
        name: 'Potato',
        emoji: '🏴‍☠️',
        url: 'https://dym168.org/findyourplug',
        enabled: true
      });
      console.log('✅ Potato ajouté avec emoji 🏴‍☠️');
    }
    
    // 5. Sauvegarder
    await config.save();
    console.log('🚀 Configuration sauvegardée');
    
    // 6. Afficher le résultat
    console.log('\n📊 Résumé des modifications :');
    console.log('- Bouton topPlugs:', config.buttons.topPlugs.text);
    console.log('- Titre topPlugs:', config.botTexts.topPlugsTitle);
    console.log('- Langues disponibles:', config.languages.availableLanguages.map(l => l.name).join(', '));
    
    const potatoItem = config.socialMediaList.find(item => 
      item.name && item.name.toLowerCase().includes('potato')
    );
    console.log('- Potato emoji:', potatoItem?.emoji || 'Non trouvé');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Déconnexion MongoDB');
  }
};

// Exécuter la mise à jour
const main = async () => {
  await connectDB();
  await forceUpdateTranslations();
};

main();