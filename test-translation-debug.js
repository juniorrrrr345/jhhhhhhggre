require('dotenv').config();
const mongoose = require('mongoose');

async function testTranslations() {
  try {
    console.log('🔗 Connexion MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Import des modèles et fonctions après la connexion
    const Config = require('./bot/src/models/Config');
    const { createLanguageKeyboard } = require('./bot/src/utils/translations');

    // Récupérer la config
    const config = await Config.findById('main');
    if (!config) {
      console.log('❌ Aucune config trouvée');
      return;
    }

    console.log('\n📋 ÉTAT DES TRADUCTIONS:');
    console.log('- languages.enabled:', config.languages?.enabled);
    console.log('- languages.currentLanguage:', config.languages?.currentLanguage);
    console.log('- languages.availableLanguages:', config.languages?.availableLanguages?.length || 0);
    console.log('- languages.translations:', config.languages?.translations?.size || 0);

    if (config.languages?.translations) {
      console.log('\n🔍 CLÉS DE TRADUCTIONS DISPONIBLES:');
      const keys = Array.from(config.languages.translations.keys());
      keys.slice(0, 10).forEach(key => {
        console.log(`  - ${key}`);
      });
      if (keys.length > 10) {
        console.log(`  ... et ${keys.length - 10} autres`);
      }
    }

    // Tester la création du clavier de langue
    console.log('\n🎹 TEST CLAVIER DE LANGUE:');
    try {
      const keyboard = createLanguageKeyboard('fr');
      const buttons = keyboard?.reply_markup?.inline_keyboard || [];
      console.log('✅ Clavier créé avec', buttons.length, 'rangées');
      console.log('Boutons:', buttons.flat().map(btn => btn.text).join(', '));
    } catch (error) {
      console.error('❌ Erreur création clavier:', error.message);
    }

    // Activer les traductions si pas encore fait
    if (!config.languages?.enabled) {
      console.log('\n🔧 ACTIVATION DES TRADUCTIONS...');
      config.languages = {
        ...config.languages,
        enabled: true
      };
      await config.save();
      console.log('✅ Traductions activées');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

testTranslations();