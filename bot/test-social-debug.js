const mongoose = require('mongoose');
require('dotenv').config();

// Configuration MongoDB
const Config = require('./src/models/Config');

async function testSocialMedia() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connecté');

    // Récupérer la config
    const config = await Config.findById('main');
    console.log('\n🔍 Configuration trouvée:', !!config);

    if (config) {
      console.log('\n📋 Structure socialMedia:');
      console.log('- Type:', typeof config.socialMedia);
      console.log('- Is Array:', Array.isArray(config.socialMedia));
      console.log('- Length:', config.socialMedia?.length || 0);
      
      if (config.socialMedia && Array.isArray(config.socialMedia)) {
        console.log('\n📱 Réseaux sociaux trouvés:');
        config.socialMedia.forEach((social, index) => {
          console.log(`   ${index + 1}. ${social.emoji} ${social.name}: ${social.url}`);
        });
      } else {
        console.log('❌ Pas de réseaux sociaux ou format incorrect');
        console.log('Config socialMedia:', config.socialMedia);
      }

      console.log('\n🎛️ Configuration bouton:');
      console.log('- Enabled:', config?.buttons?.socialMedia?.enabled);
      console.log('- Text:', config?.buttons?.socialMedia?.text);
      console.log('- Content:', config?.buttons?.socialMedia?.content);

      // Test de la logique du bot
      console.log('\n🧪 Test logique affichage bot:');
      const shouldShow = config?.buttons?.socialMedia?.enabled !== false;
      console.log('- Bouton doit être affiché:', shouldShow);
      
      const hasNetworks = config?.socialMedia && Array.isArray(config.socialMedia) && config.socialMedia.length > 0;
      console.log('- A des réseaux configurés:', hasNetworks);

      if (hasNetworks) {
        console.log('\n📝 Message qui serait généré:');
        let message = `📱 **Réseaux Sociaux**\n\n${config?.buttons?.socialMedia?.content || 'Suivez-nous sur nos réseaux sociaux !'}`;
        
        message += '\n\n';
        config.socialMedia.forEach((social, index) => {
          if (social.name && social.url) {
            message += `${social.emoji} [${social.name}](${social.url})\n`;
          }
        });
        
        console.log(message);
      } else {
        console.log('❌ Aucun réseau à afficher');
      }
    }

    // Test du cache
    console.log('\n💾 Test cache:');
    
    // Simuler la fonction de cache du bot
    if (global.cache && global.cache.config) {
      console.log('- Cache global trouvé:', !!global.cache.config);
      console.log('- Cache socialMedia:', global.cache.config.socialMedia?.length || 0);
    } else {
      console.log('- Pas de cache global (normal pour ce test)');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB déconnecté');
  }
}

testSocialMedia();