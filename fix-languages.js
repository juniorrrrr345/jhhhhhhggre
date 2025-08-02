const mongoose = require('mongoose');

// Nouvelle URI MongoDB
const MONGODB_URI = 'mongodb+srv://teste:Junior@junior.jiy8uam.mongodb.net/?retryWrites=true&w=majority&appName=Junior';

async function fixLanguages() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté');
    
    // Schéma Config simplifié
    const ConfigSchema = new mongoose.Schema({
      _id: String,
      languages: {
        enabled: { type: Boolean, default: true },
        available: { type: [String], default: ['fr', 'en', 'es', 'ar'] },
        currentLanguage: { type: String, default: 'fr' },
        translations: { type: mongoose.Schema.Types.Mixed, default: {} }
      }
    }, { strict: false });
    
    const Config = mongoose.models.Config || mongoose.model('Config', ConfigSchema);
    
    // Mettre à jour la configuration
    const config = await Config.findById('main');
    
    if (config) {
      console.log('📝 Configuration actuelle des langues:');
      console.log('   Activé:', config.languages?.enabled);
      console.log('   Langue actuelle:', config.languages?.currentLanguage);
      console.log('   Langues disponibles:', config.languages?.available);
      
      // Corriger la configuration
      if (!config.languages) {
        config.languages = {};
      }
      
      config.languages.enabled = true;
      config.languages.available = ['fr', 'en', 'es', 'ar'];
      config.languages.currentLanguage = config.languages.currentLanguage || 'fr';
      
      // S'assurer que translations est un objet vide si non défini
      if (!config.languages.translations) {
        config.languages.translations = {};
      }
      
      await config.save();
      
      console.log('\n✅ Configuration des langues corrigée !');
      console.log('   Langues disponibles: FR, EN, ES, AR');
      console.log('   Langue actuelle:', config.languages.currentLanguage);
    } else {
      console.log('❌ Aucune configuration trouvée');
    }
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

fixLanguages();