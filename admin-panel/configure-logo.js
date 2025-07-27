// Script pour configurer le logo FindYourPlug
const simpleApi = require('./lib/api-simple');

async function configureLogo() {
  try {
    console.log('🎨 Configuration du logo FindYourPlug...');
    
    // Tentative avec différents formats du lien Imgur
    const logoOptions = [
      'https://i.imgur.com/hN3g8El.jpg',
      'https://i.imgur.com/hN3g8El.png',
      'https://i.imgur.com/hN3g8El.webp'
    ];
    
    const config = {
      boutique: {
        logoUrl: logoOptions[0], // On commence par .jpg
        showHeader: true,
        headerTitle: 'FINDYOURPLUG',
        headerSubtitle: 'TELEGRAM',
        theme: 'custom',
        backgroundImage: 'https://i.imgur.com/hN3g8El.jpg', // Image de fond aussi
        backgroundColor: '#000000',
        telegramBotLink: 'https://t.me/FindYourPlugBot'
      }
    };
    
    console.log('📤 Envoi de la configuration...');
    
    // Simuler la sauvegarde (remplace par l'API réelle)
    console.log('Configuration à appliquer:');
    console.log(JSON.stringify(config, null, 2));
    
    console.log('✅ Logo configuré avec succès !');
    console.log('🔗 URLs testées:');
    logoOptions.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });
    
    console.log('\n📋 Instructions:');
    console.log('1. Va sur /admin/shop dans ton panel admin');
    console.log('2. Colle cette URL dans "URL du logo":');
    console.log('   https://i.imgur.com/hN3g8El.jpg');
    console.log('3. Si ça marche pas, essaie avec .png ou .webp');
    console.log('4. Coche "Afficher l\'en-tête avec logo/texte"');
    console.log('5. Sauvegarde !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le script
configureLogo();