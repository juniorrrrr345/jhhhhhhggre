require('dotenv').config();
const mongoose = require('mongoose');
const Config = require('./src/models/Config');

async function quickDiagnostic() {
  console.log('🔍 Diagnostic rapide du bot...\n');
  
  try {
    // Test de connexion MongoDB
    console.log('1. 🔌 Test de connexion MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('   ✅ MongoDB connecté avec succès');
    
    // Test de récupération de la configuration
    console.log('2. 📋 Test de récupération de la configuration...');
    const config = await Config.findById('main');
    
    if (!config) {
      console.log('   ❌ Configuration non trouvée');
      return;
    }
    console.log('   ✅ Configuration récupérée avec succès');
    
    // Vérification des URLs des réseaux sociaux
    console.log('3. 🔗 Vérification des URLs des réseaux sociaux...');
    let invalidUrls = 0;
    
    // Réseaux sociaux d'accueil
    if (config.welcome && config.welcome.socialMedia) {
      config.welcome.socialMedia.forEach(social => {
        if (social.url.includes('@') && !social.url.startsWith('http')) {
          console.log(`   ❌ URL invalide (email): ${social.name} -> ${social.url}`);
          invalidUrls++;
        } else {
          console.log(`   ✅ URL valide: ${social.name} -> ${social.url}`);
        }
      });
    }
    
    // Réseaux sociaux globaux
    if (config.socialMedia) {
      for (const [key, url] of Object.entries(config.socialMedia)) {
        if (url && url.trim() !== '') {
          if (url.includes('@') && !url.startsWith('http')) {
            console.log(`   ❌ URL globale invalide (email): ${key} -> ${url}`);
            invalidUrls++;
          } else {
            console.log(`   ✅ URL globale valide: ${key} -> ${url}`);
          }
        }
      }
    }
    
    if (invalidUrls === 0) {
      console.log('   ✅ Toutes les URLs sont valides');
    } else {
      console.log(`   ⚠️ ${invalidUrls} URLs invalides détectées`);
    }
    
    // Test du token bot
    console.log('4. 🤖 Vérification du token bot...');
    if (process.env.TELEGRAM_BOT_TOKEN) {
      console.log('   ✅ Token bot configuré');
    } else {
      console.log('   ❌ Token bot manquant');
    }
    
    console.log('\n🎉 Diagnostic terminé !');
    
  } catch (error) {
    console.error('❌ Erreur durant le diagnostic:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

quickDiagnostic();