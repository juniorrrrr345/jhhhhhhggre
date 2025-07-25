const mongoose = require('mongoose');
require('dotenv').config();

const { handleStart } = require('./src/handlers/startHandler');

const testStartMenu = async () => {
  try {
    console.log('🚀 Test du menu /start...');
    
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Simuler un contexte Telegram pour /start
    const mockCtx = {
      from: {
        id: 123456789,
        username: 'testuser'
      },
      message: {
        text: '/start',
        message_id: 1
      },
      chat: {
        id: 123456789
      },
      reply: async (message, keyboard) => {
        console.log('📝 Message /start:');
        console.log(message);
        console.log('\n🔘 Clavier généré:');
        
        if (keyboard && keyboard.reply_markup && keyboard.reply_markup.inline_keyboard) {
          let socialFound = false;
          keyboard.reply_markup.inline_keyboard.forEach((row, i) => {
            const rowTexts = row.map(btn => {
              if (btn.url) {
                console.log(`🔗 RÉSEAU SOCIAL: ${btn.text} -> ${btn.url}`);
                socialFound = true;
                return `[${btn.text}->URL]`;
              }
              return btn.text;
            }).join(' | ');
            console.log(`  Ligne ${i+1}: ${rowTexts}`);
          });
          
          if (socialFound) {
            console.log('\n✅ RÉSEAUX SOCIAUX TROUVÉS dans le menu /start !');
          } else {
            console.log('\n❌ AUCUN réseau social trouvé dans le menu /start');
          }
        }
        
        return true;
      },
      replyWithPhoto: async (photo, options) => {
        console.log('📸 Message /start avec photo:');
        console.log(options.caption);
        console.log('\n🔘 Clavier avec photo:');
        
        if (options.reply_markup && options.reply_markup.inline_keyboard) {
          let socialFound = false;
          options.reply_markup.inline_keyboard.forEach((row, i) => {
            const rowTexts = row.map(btn => {
              if (btn.url) {
                console.log(`🔗 RÉSEAU SOCIAL: ${btn.text} -> ${btn.url}`);
                socialFound = true;
                return `[${btn.text}->URL]`;
              }
              return btn.text;
            }).join(' | ');
            console.log(`  Ligne ${i+1}: ${rowTexts}`);
          });
          
          if (socialFound) {
            console.log('\n✅ RÉSEAUX SOCIAUX TROUVÉS dans le menu /start avec photo !');
          } else {
            console.log('\n❌ AUCUN réseau social trouvé dans le menu /start avec photo');
          }
        }
        
        return true;
      }
    };
    
    // Tester le handler /start
    await handleStart(mockCtx);
    
    console.log('\n🎉 Test /start terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test /start:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Test terminé');
  }
};

if (require.main === module) {
  testStartMenu();
}

module.exports = testStartMenu;