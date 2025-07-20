#!/usr/bin/env node

// Script de test pour vérifier la configuration
const mongoose = require('mongoose');

// Configuration MongoDB (remplacer par votre URI)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/boutique_vip';

// Modèle Config simple
const configSchema = new mongoose.Schema({
  _id: String,
  boutique: {
    name: String,
    subtitle: String,
    logo: String,
    vipTitle: String,
    searchTitle: String
  },
  welcome: {
    text: String,
    image: String
  },
  socialMedia: {
    telegram: String,
    whatsapp: String,
    website: String
  },
  buttons: {
    topPlugs: { text: String },
    vipPlugs: { text: String },
    contact: { text: String, content: String },
    info: { text: String, content: String }
  }
}, { collection: 'configs', timestamps: true });

const Config = mongoose.model('Config', configSchema);

async function testConfig() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Créer ou mettre à jour la configuration de test
    const testConfig = {
      _id: 'main',
      boutique: {
        name: 'cacaca',
        subtitle: 'fac caca',
        logo: 'https://imgur.com/a/4VbSOHD',
        vipTitle: 'TESTE',
        searchTitle: 'TESTE'
      },
      welcome: {
        text: '🎉 Bienvenue sur notre bot premium !',
        image: 'https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Bot+Image'
      },
      socialMedia: {
        telegram: '',
        whatsapp: '',
        website: ''
      },
      buttons: {
        topPlugs: { text: '🔌 Top Des Plugs' },
        vipPlugs: { text: '⭐ Boutiques VIP' },
        contact: { text: '📞 Contact', content: 'Contactez-nous pour plus d\'informations !' },
        info: { text: 'ℹ️ Info', content: 'Découvrez notre plateforme premium.' }
      }
    };

    console.log('💾 Application de la configuration...');
    const config = await Config.findByIdAndUpdate('main', testConfig, { 
      new: true, 
      upsert: true 
    });
    
    console.log('✅ Configuration appliquée avec succès !');
    console.log('📊 Configuration actuelle :');
    console.log('- Nom boutique :', config.boutique?.name);
    console.log('- Sous-titre :', config.boutique?.subtitle);
    console.log('- Logo :', config.boutique?.logo);
    console.log('- Titre VIP :', config.boutique?.vipTitle);
    console.log('- Titre Recherche :', config.boutique?.searchTitle);

    console.log('\n🎯 Test terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test :', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
    process.exit(0);
  }
}

if (require.main === module) {
  testConfig();
}

module.exports = { testConfig };