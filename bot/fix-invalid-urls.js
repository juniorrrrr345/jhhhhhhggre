require('dotenv').config();
const mongoose = require('mongoose');
const Config = require('./src/models/Config');

async function fixInvalidUrls() {
  try {
    console.log('🔧 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');

    console.log('📋 Récupération de la configuration...');
    const config = await Config.findById('main');
    
    if (!config) {
      console.log('❌ Configuration non trouvée');
      return;
    }

    let hasChanges = false;

    // Vérifier et corriger les URLs des réseaux sociaux du message d'accueil
    if (config.welcome && config.welcome.socialMedia) {
      console.log('🔍 Vérification des URLs des réseaux sociaux...');
      
      for (let i = config.welcome.socialMedia.length - 1; i >= 0; i--) {
        const social = config.welcome.socialMedia[i];
        console.log(`Vérification: ${social.emoji} ${social.name} -> ${social.url}`);
        
        // Vérifier si c'est une adresse email (contient @ mais pas une URL valide)
        if (social.url && social.url.includes('@') && !social.url.startsWith('http')) {
          console.log(`🚫 URL invalide détectée (adresse email): ${social.url}`);
          
          // Option 1: Supprimer ce réseau social car c'est une adresse email
          console.log(`❌ Suppression du réseau social "${social.name}" avec l'URL invalide`);
          config.welcome.socialMedia.splice(i, 1);
          hasChanges = true;
          
          // Option 2: Si c'est un support, on pourrait le convertir en URL mailto: (mais Telegram ne le supporte pas bien)
          // social.url = `mailto:${social.url}`;
        } else {
          // Vérifier que l'URL est valide
          try {
            if (!social.url.startsWith('http://') && !social.url.startsWith('https://')) {
              social.url = 'https://' + social.url;
              hasChanges = true;
              console.log(`✅ URL corrigée: ${social.url}`);
            }
            new URL(social.url);
            console.log(`✅ URL valide: ${social.url}`);
          } catch (error) {
            console.log(`🚫 URL invalide supprimée: ${social.url}`);
            config.welcome.socialMedia.splice(i, 1);
            hasChanges = true;
          }
        }
      }
    }

    // Vérifier les réseaux sociaux globaux
    if (config.socialMedia) {
      console.log('🔍 Vérification des réseaux sociaux globaux...');
      
      for (const [key, url] of Object.entries(config.socialMedia)) {
        if (url && typeof url === 'string') {
          console.log(`Vérification ${key}: ${url}`);
          
          // Vérifier si c'est une adresse email
          if (url.includes('@') && !url.startsWith('http')) {
            console.log(`🚫 URL globale invalide détectée (adresse email): ${url}`);
            delete config.socialMedia[key];
            hasChanges = true;
          } else {
            // Vérifier que l'URL est valide
            try {
              let correctedUrl = url;
              if (!url.startsWith('http://') && !url.startsWith('https://')) {
                correctedUrl = 'https://' + url;
              }
              new URL(correctedUrl);
              if (correctedUrl !== url) {
                config.socialMedia[key] = correctedUrl;
                hasChanges = true;
                console.log(`✅ URL globale corrigée: ${correctedUrl}`);
              } else {
                console.log(`✅ URL globale valide: ${url}`);
              }
            } catch (error) {
              console.log(`🚫 URL globale invalide supprimée: ${url}`);
              delete config.socialMedia[key];
              hasChanges = true;
            }
          }
        }
      }
    }

    if (hasChanges) {
      console.log('💾 Sauvegarde des modifications...');
      await config.save();
      console.log('✅ Configuration mise à jour avec succès');
      
      // Afficher la configuration finale
      console.log('\n📋 Configuration finale des réseaux sociaux d\'accueil:');
      if (config.welcome && config.welcome.socialMedia) {
        config.welcome.socialMedia.forEach((social, index) => {
          console.log(`${index + 1}. ${social.emoji} ${social.name}: ${social.url}`);
        });
      }
      
      console.log('\n📋 Configuration finale des réseaux sociaux globaux:');
      if (config.socialMedia) {
        for (const [key, url] of Object.entries(config.socialMedia)) {
          console.log(`${key}: ${url}`);
        }
      }
    } else {
      console.log('ℹ️ Aucune modification nécessaire');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

fixInvalidUrls();