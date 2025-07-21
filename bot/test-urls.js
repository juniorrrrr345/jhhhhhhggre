require('dotenv').config();
const mongoose = require('mongoose');
const Config = require('./src/models/Config');
const { createMainKeyboard } = require('./src/utils/keyboards');

async function testUrls() {
  try {
    console.log('🔧 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');

    const config = await Config.findById('main');
    
    if (!config) {
      console.log('❌ Configuration non trouvée');
      return;
    }
    
    console.log('🧪 Test de création du clavier principal...');
    
    try {
      const keyboard = createMainKeyboard(config);
      console.log('✅ Clavier créé avec succès !');
      
      // Afficher la structure du clavier
      console.log('\n📋 Structure du clavier:');
      keyboard.reply_markup.inline_keyboard.forEach((row, rowIndex) => {
        console.log(`Ligne ${rowIndex + 1}:`);
        row.forEach((button, buttonIndex) => {
          if (button.url) {
            console.log(`  - Bouton URL: "${button.text}" -> ${button.url}`);
          } else {
            console.log(`  - Bouton Callback: "${button.text}" -> ${button.callback_data}`);
          }
        });
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de la création du clavier:', error);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

testUrls();