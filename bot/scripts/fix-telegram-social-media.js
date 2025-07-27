require('dotenv').config();
const mongoose = require('mongoose');

// Connexion MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error.message);
    process.exit(1);
  }
};

// Import du modèle Config existant
const Config = require('../src/models/Config');

const fixTelegramSocialMedia = async () => {
  try {
    await connectDB();
    
    console.log('🔄 Correction de l\'affichage des réseaux sociaux sur Telegram...');
    
    // Trouver la configuration principale
    let config = await Config.findById('main');
    
    if (!config) {
      console.log('⚠️ Aucune config trouvée, création d\'une nouvelle...');
      config = new Config({ _id: 'main' });
    }
    
    console.log('📋 État actuel de la configuration:');
    console.log('- socialMedia (array):', Array.isArray(config.socialMedia), config.socialMedia?.length || 0);
    console.log('- socialMediaList (array):', Array.isArray(config.socialMediaList), config.socialMediaList?.length || 0);
    console.log('- welcome.socialMedia (array):', Array.isArray(config.welcome?.socialMedia), config.welcome?.socialMedia?.length || 0);
    
    // S'assurer que les structures de base existent
    if (!config.buttons) config.buttons = {};
    if (!config.buttons.socialMedia) config.buttons.socialMedia = {};
    if (!config.welcome) config.welcome = {};
    
    // Configurer le bouton réseaux sociaux
    config.buttons.socialMedia.enabled = true;
    config.buttons.socialMedia.text = '📱 Réseaux Sociaux';
    config.buttons.socialMedia.content = 'Rejoignez notre communauté sur nos différents réseaux sociaux ! 🚀';
    
    // Définir les réseaux sociaux par défaut selon votre configuration précédente
    const defaultSocialMedia = [
      {
        name: 'Telegram',
        emoji: '📱',
        url: 'https://t.me/+zcP68c4M_3NlM2Y0',
        order: 1
      },
      {
        name: 'Contact',
        emoji: '📞',
        url: 'https://t.me/findyourplugsav',
        order: 2
      },
      {
        name: 'Discord',
        emoji: '💬',
        url: 'https://discord.gg/votre-serveur',
        order: 3
      },
      {
        name: 'Instagram',
        emoji: '📷',
        url: 'https://instagram.com/votre_compte',
        order: 4
      }
    ];
    
    // Priorité 1: Utiliser socialMediaList si elle existe et n'est pas vide
    let sourceData = null;
    if (config.socialMediaList && Array.isArray(config.socialMediaList) && config.socialMediaList.length > 0) {
      console.log('📥 Utilisation de socialMediaList existante');
      sourceData = config.socialMediaList.map(item => ({
        name: item.name,
        emoji: item.emoji || '🌐',
        url: item.url,
        order: item.order || 0
      }));
    }
    // Priorité 2: Utiliser socialMedia si elle existe et n'est pas vide
    else if (config.socialMedia && Array.isArray(config.socialMedia) && config.socialMedia.length > 0) {
      console.log('📥 Utilisation de socialMedia existante');
      sourceData = config.socialMedia;
    }
    // Priorité 3: Utiliser welcome.socialMedia si elle existe
    else if (config.welcome.socialMedia && Array.isArray(config.welcome.socialMedia) && config.welcome.socialMedia.length > 0) {
      console.log('📥 Utilisation de welcome.socialMedia existante');
      sourceData = config.welcome.socialMedia;
    }
    // Sinon: Utiliser les valeurs par défaut
    else {
      console.log('📥 Utilisation des réseaux sociaux par défaut');
      sourceData = defaultSocialMedia;
    }
    
    // Synchroniser tous les champs avec les mêmes données
    config.socialMedia = sourceData.map(item => ({
      name: item.name,
      emoji: item.emoji || '🌐',
      url: item.url,
      order: item.order || 0
    }));
    
    config.socialMediaList = sourceData.map(item => ({
      name: item.name,
      emoji: item.emoji || '🌐',
      url: item.url,
      enabled: item.enabled !== false, // true par défaut
      order: item.order || 0
    }));
    
    config.welcome.socialMedia = sourceData.map(item => ({
      name: item.name,
      emoji: item.emoji || '🌐',
      url: item.url,
      order: item.order || 0
    }));
    
    // Marquer les champs comme modifiés pour Mongoose
    config.markModified('socialMedia');
    config.markModified('socialMediaList');
    config.markModified('welcome.socialMedia');
    config.markModified('buttons.socialMedia');
    
    // Sauvegarder
    await config.save();
    
    console.log('✅ Configuration mise à jour avec succès !');
    console.log('📊 Résumé de la configuration:');
    console.log(`- Bouton activé: ${config.buttons.socialMedia.enabled}`);
    console.log(`- Texte du bouton: "${config.buttons.socialMedia.text}"`);
    console.log(`- Message d'intro: "${config.buttons.socialMedia.content}"`);
    console.log(`- Nombre de réseaux sociaux: ${config.socialMedia.length}`);
    
    console.log('\n📱 Réseaux sociaux configurés:');
    config.socialMedia.forEach((social, index) => {
      console.log(`   ${index + 1}. ${social.emoji} ${social.name}: ${social.url}`);
    });
    
    console.log('\n🔍 Vérification de la structure:');
    console.log('- socialMedia est un array:', Array.isArray(config.socialMedia));
    console.log('- socialMediaList est un array:', Array.isArray(config.socialMediaList));
    console.log('- welcome.socialMedia est un array:', Array.isArray(config.welcome.socialMedia));
    console.log('- Tous ont le même nombre d\'éléments:', 
      config.socialMedia.length === config.socialMediaList.length && 
      config.socialMedia.length === config.welcome.socialMedia.length
    );
    
    console.log('\n🎯 Le problème d\'affichage des réseaux sociaux sur Telegram devrait maintenant être résolu !');
    console.log('🔄 Redémarrez votre bot Telegram pour appliquer les changements.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    process.exit(1);
  }
};

// Exécuter le script
fixTelegramSocialMedia();