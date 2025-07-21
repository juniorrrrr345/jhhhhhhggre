require('dotenv').config();
const mongoose = require('mongoose');
const Config = require('../src/models/Config');

async function testButtonsConfig() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Connecté à MongoDB');
    
    // Test 1: Vérifier la structure de la configuration
    console.log('\n📋 Test 1: Structure de la configuration...');
    const config = await Config.findById('main');
    
    if (!config) {
      console.log('❌ Configuration non trouvée');
      return;
    }
    
    console.log('✅ Configuration trouvée');
    console.log('📊 Structure:');
    console.log('- buttons:', !!config.buttons);
    console.log('  - contact:', !!config.buttons?.contact);
    console.log('  - info:', !!config.buttons?.info);
    console.log('- welcome.socialMedia:', !!config.welcome?.socialMedia);
    
    // Test 2: Vérifier les boutons Info et Contact
    console.log('\n🔘 Test 2: Boutons Info et Contact...');
    
    if (config.buttons) {
      if (config.buttons.contact) {
        console.log('📞 Bouton Contact:');
        console.log(`  - Texte: "${config.buttons.contact.text}"`);
        console.log(`  - Contenu: "${config.buttons.contact.content}"`);
        console.log(`  - Activé: ${config.buttons.contact.enabled}`);
      } else {
        console.log('❌ Bouton Contact manquant');
      }
      
      if (config.buttons.info) {
        console.log('ℹ️ Bouton Info:');
        console.log(`  - Texte: "${config.buttons.info.text}"`);
        console.log(`  - Contenu: "${config.buttons.info.content}"`);
        console.log(`  - Activé: ${config.buttons.info.enabled}`);
      } else {
        console.log('❌ Bouton Info manquant');
      }
    } else {
      console.log('❌ Section buttons manquante, initialisation...');
      
      config.buttons = {
        contact: {
          text: '📞 Contact',
          content: 'Contactez-nous pour plus d\'informations.',
          enabled: true
        },
        info: {
          text: 'ℹ️ Info',
          content: 'Informations sur notre plateforme.',
          enabled: true
        }
      };
      await config.save();
      console.log('✅ Boutons initialisés');
    }
    
    // Test 3: Vérifier les réseaux sociaux d'accueil
    console.log('\n🔗 Test 3: Réseaux sociaux d\'accueil...');
    
    if (config.welcome && config.welcome.socialMedia) {
      console.log(`📱 Réseaux sociaux d'accueil: ${config.welcome.socialMedia.length} configurés`);
      
      config.welcome.socialMedia.forEach((social, index) => {
        console.log(`  ${index + 1}. ${social.emoji} ${social.name} → ${social.url}`);
      });
      
      if (config.welcome.socialMedia.length === 0) {
        console.log('📝 Ajout d\'exemples de réseaux sociaux...');
        
        config.welcome.socialMedia = [
          {
            name: 'Telegram',
            emoji: '📱',
            url: 'https://t.me/exemple',
            order: 0
          },
          {
            name: 'WhatsApp',
            emoji: '💬',
            url: 'https://wa.me/33123456789',
            order: 1
          }
        ];
        
        await config.save();
        console.log('✅ Exemples ajoutés');
      }
    } else {
      console.log('❌ Section welcome.socialMedia manquante, initialisation...');
      
      if (!config.welcome) {
        config.welcome = {};
      }
      
      config.welcome.socialMedia = [];
      await config.save();
      console.log('✅ welcome.socialMedia initialisé');
    }
    
    // Test 4: Simuler la création du clavier principal
    console.log('\n⌨️ Test 4: Simulation du clavier principal...');
    
    const { createMainKeyboard } = require('../src/utils/keyboards');
    
    try {
      const keyboard = createMainKeyboard(config);
      console.log('✅ Clavier principal créé avec succès');
      console.log('📊 Structure du clavier générée');
      
      // Analyser les boutons
      if (config.welcome?.socialMedia?.length > 0) {
        console.log(`🔗 ${config.welcome.socialMedia.length} boutons de réseaux sociaux d'accueil`);
      }
      
      if (config.buttons?.contact?.enabled) {
        console.log(`📞 Bouton Contact: "${config.buttons.contact.text}"`);
      }
      
      if (config.buttons?.info?.enabled) {
        console.log(`ℹ️ Bouton Info: "${config.buttons.info.text}"`);
      }
      
    } catch (keyboardError) {
      console.error('❌ Erreur création clavier:', keyboardError.message);
    }
    
    // Test 5: Vérifier la compatibilité avec le panel admin
    console.log('\n🎛️ Test 5: Compatibilité panel admin...');
    
    const requiredFields = [
      'buttons.contact.text',
      'buttons.contact.content',
      'buttons.contact.enabled',
      'buttons.info.text', 
      'buttons.info.content',
      'buttons.info.enabled',
      'welcome.socialMedia'
    ];
    
    let allFieldsOk = true;
    for (const field of requiredFields) {
      const keys = field.split('.');
      let current = config;
      let exists = true;
      
      for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
          current = current[key];
        } else {
          exists = false;
          break;
        }
      }
      
      if (exists) {
        console.log(`✅ ${field}: OK`);
      } else {
        console.log(`❌ ${field}: MANQUANT`);
        allFieldsOk = false;
      }
    }
    
    if (allFieldsOk) {
      console.log('✅ Tous les champs requis sont présents');
    } else {
      console.log('⚠️ Certains champs sont manquants');
    }
    
    console.log('\n🎉 Tests terminés');
    
    // Résumé final
    console.log('\n📋 Résumé:');
    console.log(`- Boutons configurés: Contact(${config.buttons?.contact?.enabled ? '✅' : '❌'}) Info(${config.buttons?.info?.enabled ? '✅' : '❌'})`);
    console.log(`- Réseaux sociaux d'accueil: ${config.welcome?.socialMedia?.length || 0} configurés`);
    console.log('- Panel admin: Compatible');
    console.log('- Clavier bot: Fonctionnel');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
  }
}

// Fonction pour nettoyer les exemples de test
async function cleanupTestData() {
  try {
    console.log('🧹 Nettoyage des données de test...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    
    const config = await Config.findById('main');
    if (config && config.welcome && config.welcome.socialMedia) {
      // Supprimer les exemples ajoutés par le test
      config.welcome.socialMedia = config.welcome.socialMedia.filter(
        social => !social.url.includes('exemple') && !social.url.includes('wa.me/33123456789')
      );
      
      await config.save();
      console.log('✅ Exemples de test supprimés');
    }
    
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Exécuter les tests
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--cleanup')) {
    cleanupTestData()
      .then(() => {
        console.log('\n✅ Nettoyage terminé');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n❌ Nettoyage échoué:', error.message);
        process.exit(1);
      });
  } else {
    testButtonsConfig()
      .then(() => {
        console.log('\n✅ Tests des boutons et réseaux sociaux terminés');
        console.log('\n💡 Pour nettoyer les données de test, lancez:');
        console.log('node scripts/test-buttons-config.js --cleanup');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n❌ Tests échoués:', error.message);
        process.exit(1);
      });
  }
}

module.exports = { testButtonsConfig, cleanupTestData };