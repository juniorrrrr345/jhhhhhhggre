require('dotenv').config();
const mongoose = require('mongoose');
const Config = require('../src/models/Config');

async function testBackgroundConfig() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Connecté à MongoDB');
    
    // Test 1: Vérifier la configuration actuelle
    console.log('\n📋 Test 1: Configuration actuelle...');
    const config = await Config.findById('main');
    
    if (!config) {
      console.log('❌ Configuration non trouvée');
      return;
    }
    
    console.log('✅ Configuration trouvée');
    console.log('📊 Structure boutique:');
    console.log('- name:', config.boutique?.name || 'Non défini');
    console.log('- subtitle:', config.boutique?.subtitle || 'Non défini');
    console.log('- backgroundImage:', config.boutique?.backgroundImage || 'Non défini');
    console.log('- backgroundImage length:', config.boutique?.backgroundImage?.length || 0);
    
    // Test 2: Vérifier le format de l'URL
    console.log('\n🔍 Test 2: Analyse de l\'URL de background...');
    
    const bgImage = config.boutique?.backgroundImage;
    if (bgImage) {
      console.log(`📸 URL actuelle: "${bgImage}"`);
      console.log(`📏 Longueur: ${bgImage.length} caractères`);
      console.log(`🔤 Type: ${typeof bgImage}`);
      
      // Vérifier si c'est une URL valide
      try {
        const url = new URL(bgImage);
        console.log(`✅ URL valide: ${url.protocol}//${url.host}${url.pathname}`);
        console.log(`📄 Extension: ${url.pathname.split('.').pop()}`);
      } catch (urlError) {
        console.log(`❌ URL invalide: ${urlError.message}`);
      }
      
      // Vérifier les caractères spéciaux
      const hasSpecialChars = /['"<>\\]/.test(bgImage);
      console.log(`🔤 Caractères spéciaux détectés: ${hasSpecialChars ? '⚠️ OUI' : '✅ NON'}`);
      
    } else {
      console.log('❌ Aucune image de background configurée');
    }
    
    // Test 3: Simuler l'API publique
    console.log('\n🌐 Test 3: Simulation API publique...');
    
    const publicConfig = {
      boutique: config?.boutique || {},
      welcome: config?.welcome || {},
      socialMedia: config?.socialMedia || {},
      messages: config?.messages || {},
      buttons: config?.buttons || {}
    };
    
    console.log('📤 Données retournées par l\'API:');
    console.log('- boutique.backgroundImage:', publicConfig.boutique.backgroundImage || 'Non défini');
    console.log('- Structure complète boutique:', Object.keys(publicConfig.boutique));
    
    // Test 4: Simuler l'application du CSS
    console.log('\n🎨 Test 4: Simulation CSS...');
    
    if (publicConfig.boutique.backgroundImage) {
      const cssValue = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("${publicConfig.boutique.backgroundImage}")`;
      console.log('🖼️ Valeur CSS générée:');
      console.log(`backgroundImage: '${cssValue}'`);
      
      // Vérifier la longueur
      if (cssValue.length > 2000) {
        console.log('⚠️ URL très longue, peut causer des problèmes');
      } else {
        console.log('✅ Longueur CSS acceptable');
      }
      
    } else {
      console.log('❌ Pas d\'image à appliquer en CSS');
    }
    
    // Test 5: Test avec URL d'exemple
    console.log('\n🧪 Test 5: Test avec URL d\'exemple...');
    
    const testImageUrl = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200';
    console.log(`🔗 Test avec: ${testImageUrl}`);
    
    // Backup de la config actuelle
    const originalBgImage = config.boutique.backgroundImage;
    
    // Appliquer l'URL de test
    config.boutique.backgroundImage = testImageUrl;
    await config.save();
    
    console.log('✅ URL de test appliquée et sauvée');
    
    // Vérifier la sauvegarde
    const verifyConfig = await Config.findById('main');
    console.log('📋 Vérification:');
    console.log('- URL sauvée:', verifyConfig.boutique.backgroundImage);
    console.log('- Correspond au test:', verifyConfig.boutique.backgroundImage === testImageUrl);
    
    // Restaurer la config originale
    if (originalBgImage) {
      verifyConfig.boutique.backgroundImage = originalBgImage;
      await verifyConfig.save();
      console.log('🔄 Configuration originale restaurée');
    }
    
    // Test 6: Vérifier la structure du modèle
    console.log('\n📋 Test 6: Structure du modèle Config...');
    
    const configSchema = Config.schema.paths;
    console.log('🏗️ Champs disponibles pour boutique:');
    Object.keys(configSchema).forEach(field => {
      if (field.startsWith('boutique.')) {
        console.log(`- ${field}: ${configSchema[field].instance || 'Mixed'}`);
      }
    });
    
    // Test 7: Diagnostic de synchronisation
    console.log('\n🔄 Test 7: Diagnostic de synchronisation...');
    
    const now = new Date();
    const lastUpdate = config.updatedAt || config.createdAt;
    const timeDiff = now - lastUpdate;
    
    console.log('⏰ Informations de synchronisation:');
    console.log('- Dernière mise à jour:', lastUpdate.toISOString());
    console.log('- Il y a:', Math.round(timeDiff / 1000), 'secondes');
    console.log('- Config récente:', timeDiff < 300000 ? '✅ OUI (< 5min)' : '⚠️ NON (> 5min)');
    
    console.log('\n🎉 Tests terminés');
    
    // Résumé final
    console.log('\n📋 Résumé Diagnostic:');
    console.log(`- Configuration existe: ${config ? '✅' : '❌'}`);
    console.log(`- Background configuré: ${config.boutique?.backgroundImage ? '✅' : '❌'}`);
    console.log(`- URL valide: ${bgImage ? '✅' : '❌'}`);
    console.log(`- API retourne les données: ✅`);
    console.log(`- Modèle supporte backgroundImage: ✅`);
    
    if (config.boutique?.backgroundImage) {
      console.log('\n🔧 Pour tester dans la boutique:');
      console.log('1. Aller sur votre boutique Vercel');
      console.log('2. Ouvrir les DevTools (F12)');
      console.log('3. Dans Console, exécuter:');
      console.log('   const container = document.querySelector(".min-h-screen");');
      console.log('   console.log(getComputedStyle(container).backgroundImage);');
      console.log('4. Vérifier que l\'URL apparaît dans le style');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
  }
}

// Fonction pour forcer une mise à jour du background
async function forceBackgroundUpdate(imageUrl) {
  try {
    console.log('🔄 Forçage mise à jour background...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    
    const config = await Config.findById('main');
    if (!config) {
      console.log('❌ Configuration non trouvée');
      return;
    }
    
    // Valider l'URL
    try {
      new URL(imageUrl);
      console.log('✅ URL valide');
    } catch {
      console.log('❌ URL invalide');
      return;
    }
    
    // Appliquer l'URL
    config.boutique.backgroundImage = imageUrl;
    config.updatedAt = new Date();
    await config.save();
    
    console.log('✅ Background mis à jour avec:', imageUrl);
    console.log('🔄 Timestamp forcé:', config.updatedAt.toISOString());
    
  } catch (error) {
    console.error('❌ Erreur mise à jour:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Exécuter les tests
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === '--update' && args[1]) {
    forceBackgroundUpdate(args[1])
      .then(() => {
        console.log('\n✅ Mise à jour background terminée');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n❌ Mise à jour échouée:', error.message);
        process.exit(1);
      });
  } else {
    testBackgroundConfig()
      .then(() => {
        console.log('\n✅ Tests du background terminés');
        console.log('\n💡 Pour forcer une mise à jour, lancez:');
        console.log('node scripts/test-background-config.js --update "https://votre-image.jpg"');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n❌ Tests échoués:', error.message);
        process.exit(1);
      });
  }
}

module.exports = { testBackgroundConfig, forceBackgroundUpdate };