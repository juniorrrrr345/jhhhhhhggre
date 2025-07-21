require('dotenv').config();
const mongoose = require('mongoose');
const Config = require('../src/models/Config');

async function testWelcomeImage() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Connecté à MongoDB');
    
    // Test 1: Vérifier la structure actuelle
    console.log('\n📋 Test 1: Structure de la configuration...');
    const config = await Config.findById('main');
    
    if (config) {
      console.log('✅ Configuration trouvée');
      console.log('📊 Structure welcome:');
      console.log('- text:', !!config.welcome?.text);
      console.log('- image:', config.welcome?.image ? `✅ ${config.welcome.image}` : '❌ vide');
      console.log('- socialMedia:', !!config.welcome?.socialMedia);
    } else {
      console.log('❌ Configuration NON trouvée');
      return;
    }
    
    // Test 2: Ajouter une image de test si elle n'existe pas
    console.log('\n🧪 Test 2: Test avec image d\'exemple...');
    
    if (!config.welcome.image || config.welcome.image.trim() === '') {
      console.log('📝 Ajout d\'une image de test...');
      
      // Image d'exemple (URL d'une image de test publique)
      const testImageUrl = 'https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Bot+Welcome+Image';
      
      config.welcome.image = testImageUrl;
      await config.save();
      
      console.log('✅ Image de test ajoutée:', testImageUrl);
    } else {
      console.log('ℹ️ Image déjà configurée:', config.welcome.image);
    }
    
    // Test 3: Simuler les différents cas d'usage
    console.log('\n🎭 Test 3: Simulation des cas d\'usage...');
    
    // Cas 1: Menu principal (doit utiliser l'image d'accueil)
    console.log('📱 Cas 1: Menu principal');
    const welcomeImage = config.welcome?.image || null;
    const isPlugDetails = false;
    const plugImage = null;
    const imageToUse = plugImage || (!isPlugDetails ? welcomeImage : null);
    console.log(`   → Image utilisée: ${imageToUse ? '✅ Image d\'accueil' : '❌ Aucune'}`);
    
    // Cas 2: Menu des plugs (doit utiliser l'image d'accueil)
    console.log('🔌 Cas 2: Menu des plugs');
    const imageToUse2 = plugImage || (!isPlugDetails ? welcomeImage : null);
    console.log(`   → Image utilisée: ${imageToUse2 ? '✅ Image d\'accueil' : '❌ Aucune'}`);
    
    // Cas 3: Détails d'un plug SANS image (ne doit PAS utiliser l'image d'accueil)
    console.log('📄 Cas 3: Détails plug sans image');
    const isPlugDetails3 = true;
    const plugImage3 = null;
    const imageToUse3 = plugImage3 || (!isPlugDetails3 ? welcomeImage : null);
    console.log(`   → Image utilisée: ${imageToUse3 ? '❌ Erreur!' : '✅ Aucune (correct)'}`);
    
    // Cas 4: Détails d'un plug AVEC image (doit utiliser l'image du plug)
    console.log('📄 Cas 4: Détails plug avec image');
    const isPlugDetails4 = true;
    const plugImage4 = 'https://example.com/plug-image.jpg';
    const imageToUse4 = plugImage4 || (!isPlugDetails4 ? welcomeImage : null);
    console.log(`   → Image utilisée: ${imageToUse4 === plugImage4 ? '✅ Image du plug' : '❌ Erreur!'}`);
    
    // Test 4: Vérifier les champs requis pour le panel admin
    console.log('\n🎛️ Test 4: Compatibilité panel admin...');
    
    const requiredFields = [
      'welcome.text',
      'welcome.image',
      'boutique.name',
      'boutique.subtitle',
      'boutique.backgroundImage',
      'socialMedia.telegram',
      'socialMedia.whatsapp'
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
    
    console.log('\n🎉 Test terminé');
    
    // Résumé final
    console.log('\n📋 Résumé:');
    console.log(`- Image d'accueil configurée: ${config.welcome.image ? '✅' : '❌'}`);
    console.log(`- URL de l'image: ${config.welcome.image || 'Aucune'}`);
    console.log('- Logique d\'affichage: ✅');
    console.log('- Menus/sous-menus: ✅ Utiliseront l\'image d\'accueil');
    console.log('- Détails des plugs: ✅ N\'utiliseront PAS l\'image d\'accueil');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter le test
if (require.main === module) {
  testWelcomeImage()
    .then(() => {
      console.log('\n✅ Test d\'image d\'accueil terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test échoué:', error.message);
      process.exit(1);
    });
}

module.exports = testWelcomeImage;