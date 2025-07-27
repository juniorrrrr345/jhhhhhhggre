require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import du modèle Config existant
const Config = require('../src/models/Config');

// Configuration de la base de données locale
const LOCAL_DB = process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram_bot';

// Connexion MongoDB flexible
const connectDB = async () => {
  try {
    // Essayer d'abord avec l'URI d'environnement, puis avec une base locale
    console.log('🔄 Tentative de connexion à MongoDB...');
    
    const conn = await mongoose.connect(LOCAL_DB, {
      serverSelectionTimeoutMS: 5000, // Timeout rapide
    });
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error.message);
    console.log('💡 Tentative avec base de données locale...');
    
    try {
      const localConn = await mongoose.connect('mongodb://localhost:27017/telegram_bot_local', {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`✅ MongoDB local connecté: ${localConn.connection.host}`);
      return true;
    } catch (localError) {
      console.error('❌ Impossible de se connecter à MongoDB local:', localError.message);
      return false;
    }
  }
};

// Fonction pour créer une configuration par défaut
const createDefaultConfig = () => {
  return {
    _id: 'main',
    buttons: {
      socialMedia: {
        enabled: true,
        text: '📱 Réseaux Sociaux',
        content: 'Rejoignez notre communauté sur nos différents réseaux sociaux ! 🚀'
      }
    },
    welcome: {
      text: 'Bienvenue sur notre bot !',
      socialMedia: []
    },
    socialMedia: [
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
      }
    ],
    socialMediaList: []
  };
};

// Mode sans base de données : écriture dans un fichier JSON
const fixWithoutDatabase = async () => {
  console.log('🔧 Mode sans base de données - Création d\'un fichier de configuration...');
  
  const configData = createDefaultConfig();
  
  // Synchroniser tous les champs
  configData.socialMediaList = configData.socialMedia.map(item => ({
    ...item,
    enabled: true
  }));
  configData.welcome.socialMedia = [...configData.socialMedia];
  
  const configPath = path.join(__dirname, '../config-backup.json');
  fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
  
  console.log('✅ Configuration sauvegardée dans:', configPath);
  console.log('📱 Réseaux sociaux configurés:');
  configData.socialMedia.forEach((social, index) => {
    console.log(`   ${index + 1}. ${social.emoji} ${social.name}: ${social.url}`);
  });
  
  return configData;
};

const fixTelegramSocialMedia = async () => {
  try {
    console.log('🔄 Correction de l\'affichage des réseaux sociaux sur Telegram...');
    
    // Tentative de connexion à la base de données
    const connected = await connectDB();
    
    if (!connected) {
      // Mode sans base de données
      await fixWithoutDatabase();
      console.log('\n📝 Instructions pour appliquer la configuration:');
      console.log('1. Utilisez le panneau d\'administration pour importer config-backup.json');
      console.log('2. Ou copiez manuellement la configuration dans votre base de données');
      process.exit(0);
    }
    
    // Mode avec base de données
    console.log('💾 Mode avec base de données activé');
    
    // Trouver la configuration principale
    let config = await Config.findById('main');
    
    if (!config) {
      console.log('⚠️ Aucune config trouvée, création d\'une nouvelle...');
      const defaultConfig = createDefaultConfig();
      config = new Config(defaultConfig);
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
    
    // Définir les réseaux sociaux par défaut
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
      }
    ];
    
    // Choisir la source de données
    let sourceData = null;
    if (config.socialMediaList && Array.isArray(config.socialMediaList) && config.socialMediaList.length > 0) {
      console.log('📥 Utilisation de socialMediaList existante');
      sourceData = config.socialMediaList.map(item => ({
        name: item.name,
        emoji: item.emoji || '🌐',
        url: item.url,
        order: item.order || 0
      }));
    } else if (config.socialMedia && Array.isArray(config.socialMedia) && config.socialMedia.length > 0) {
      console.log('📥 Utilisation de socialMedia existante');
      sourceData = config.socialMedia;
    } else if (config.welcome.socialMedia && Array.isArray(config.welcome.socialMedia) && config.welcome.socialMedia.length > 0) {
      console.log('📥 Utilisation de welcome.socialMedia existante');
      sourceData = config.welcome.socialMedia;
    } else {
      console.log('📥 Utilisation des réseaux sociaux par défaut');
      sourceData = defaultSocialMedia;
    }
    
    // Synchroniser tous les champs
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
      enabled: item.enabled !== false,
      order: item.order || 0
    }));
    
    config.welcome.socialMedia = sourceData.map(item => ({
      name: item.name,
      emoji: item.emoji || '🌐',
      url: item.url,
      order: item.order || 0
    }));
    
    // Marquer les champs comme modifiés
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
    console.log(`- Nombre de réseaux sociaux: ${config.socialMedia.length}`);
    
    console.log('\n📱 Réseaux sociaux configurés:');
    config.socialMedia.forEach((social, index) => {
      console.log(`   ${index + 1}. ${social.emoji} ${social.name}: ${social.url}`);
    });
    
    console.log('\n🔍 Vérification de la structure:');
    console.log('- socialMedia est un array:', Array.isArray(config.socialMedia));
    console.log('- socialMediaList est un array:', Array.isArray(config.socialMediaList));
    console.log('- welcome.socialMedia est un array:', Array.isArray(config.welcome.socialMedia));
    
    console.log('\n🎯 Le problème d\'affichage des réseaux sociaux sur Telegram devrait maintenant être résolu !');
    console.log('🔄 Redémarrez votre bot Telegram pour appliquer les changements.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    console.log('\n💡 Tentative en mode secours...');
    await fixWithoutDatabase();
    process.exit(1);
  }
};

// Exécuter le script
fixTelegramSocialMedia();