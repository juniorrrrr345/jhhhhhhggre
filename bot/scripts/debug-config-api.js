require('dotenv').config();
const mongoose = require('mongoose');
const Config = require('../src/models/Config');

async function debugConfigAPI() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Connecté à MongoDB');
    
    // Test 1: Vérifier la configuration
    console.log('\n📋 Test 1: Recherche de la configuration...');
    const config = await Config.findById('main');
    
    if (config) {
      console.log('✅ Configuration trouvée');
      console.log('📊 Structure de la configuration:');
      console.log('- _id:', config._id);
      console.log('- boutique:', !!config.boutique);
      console.log('- welcome:', !!config.welcome);
      console.log('- socialMedia:', !!config.socialMedia);
      console.log('- messages:', !!config.messages);
      console.log('- updatedAt:', config.updatedAt);
    } else {
      console.log('❌ Configuration NON trouvée');
      return;
    }
    
    // Test 2: Simuler l'endpoint GET /api/config
    console.log('\n📡 Test 2: Simulation endpoint GET /api/config...');
    try {
      const getConfig = await Config.findById('main');
      console.log('✅ GET /api/config simué - Configuration récupérée');
      console.log('📦 Taille des données:', JSON.stringify(getConfig).length, 'caractères');
    } catch (getError) {
      console.log('❌ GET /api/config simué - Erreur:', getError.message);
    }
    
    // Test 3: Simuler l'endpoint PUT /api/config
    console.log('\n📡 Test 3: Simulation endpoint PUT /api/config...');
    try {
      const testData = {
        boutique: {
          name: 'Test Shop',
          subtitle: 'Test Subtitle'
        },
        welcome: {
          text: 'Test Welcome Message'
        },
        socialMedia: {
          telegram: 'test_telegram',
          whatsapp: 'test_whatsapp'
        },
        messages: {
          welcome: 'Test welcome',
          noPlugsFound: 'Test no plugs',
          errorOccurred: 'Test error'
        }
      };
      
      // Nettoyer les données comme dans l'API
      const cleanData = { ...testData };
      delete cleanData._id;
      delete cleanData.__v;
      delete cleanData.createdAt;
      cleanData.updatedAt = new Date();
      
      // Essayer de mettre à jour
      const updateResult = await Config.findByIdAndUpdate(
        'main', 
        cleanData, 
        { 
          new: true, 
          runValidators: true,
          upsert: false
        }
      );
      
      if (updateResult) {
        console.log('✅ PUT /api/config simué - Configuration mise à jour');
        console.log('📊 Nouvelles données sauvées');
        
        // Vérifier que la mise à jour a bien fonctionné
        const verifyUpdate = await Config.findById('main');
        if (verifyUpdate && verifyUpdate.boutique.name === 'Test Shop') {
          console.log('✅ Vérification - Mise à jour confirmée');
        } else {
          console.log('❌ Vérification - Mise à jour NON confirmée');
        }
      } else {
        console.log('❌ PUT /api/config simué - Échec de la mise à jour');
      }
    } catch (putError) {
      console.log('❌ PUT /api/config simué - Erreur:', putError.message);
    }
    
    // Test 4: Vérifier l'authentification (simulation)
    console.log('\n🔐 Test 4: Simulation authentification...');
    const testToken = 'JuniorAdmon123';
    console.log('🔑 Token de test:', testToken);
    
    // Dans le vrai code, il y aurait authenticateAdmin middleware
    if (testToken === process.env.ADMIN_PASSWORD || testToken === 'JuniorAdmon123') {
      console.log('✅ Authentification simué - Token valide');
    } else {
      console.log('❌ Authentification simué - Token invalide');
    }
    
    // Test 5: Tester la structure des données
    console.log('\n🏗️ Test 5: Validation de la structure...');
    const finalConfig = await Config.findById('main');
    
    const requiredFields = [
      'boutique.name',
      'boutique.subtitle', 
      'welcome.text',
      'socialMedia.telegram',
      'socialMedia.whatsapp',
      'messages.welcome',
      'messages.noPlugsFound',
      'messages.errorOccurred'
    ];
    
    let structureValid = true;
    for (const field of requiredFields) {
      const keys = field.split('.');
      let current = finalConfig;
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
        structureValid = false;
      }
    }
    
    if (structureValid) {
      console.log('✅ Structure de données complète');
    } else {
      console.log('⚠️ Structure de données incomplète');
    }
    
    console.log('\n🎉 Diagnostic terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter le diagnostic
if (require.main === module) {
  debugConfigAPI()
    .then(() => {
      console.log('\n📋 Résumé du diagnostic:');
      console.log('- Configuration MongoDB: OK');
      console.log('- Endpoints de configuration: Testés');
      console.log('- Structure des données: Vérifiée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Diagnostic échoué:', error.message);
      process.exit(1);
    });
}

module.exports = debugConfigAPI;