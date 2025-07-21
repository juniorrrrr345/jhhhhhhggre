const mongoose = require('mongoose');
const Plug = require('../src/models/Plug');

// Script de migration pour convertir socialMedia de l'ancien format vers le nouveau
async function migrateSocialMedia() {
  try {
    // Utiliser la connexion existante au lieu d'en créer une nouvelle
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB n\'est pas connecté. La migration nécessite une connexion active.');
    }
    
    console.log('🔗 Connexion à MongoDB réussie');
    
    const plugs = await Plug.find({});
    console.log(`📋 ${plugs.length} plugs trouvés`);
    
    let migratedCount = 0;
    
    for (const plug of plugs) {
      let needsUpdate = false;
      const newSocialMedia = [];
      
      // Vérifier si socialMedia est un objet (ancien format)
      if (plug.socialMedia && typeof plug.socialMedia === 'object' && !Array.isArray(plug.socialMedia)) {
        console.log(`🔄 Migration du plug: ${plug.name}`);
        
        // Convertir l'ancien format en nouveau format
        if (plug.socialMedia.telegram) {
          newSocialMedia.push({
            name: 'Telegram',
            emoji: '📱',
            url: plug.socialMedia.telegram
          });
        }
        
        if (plug.socialMedia.instagram) {
          newSocialMedia.push({
            name: 'Instagram',
            emoji: '📸',
            url: plug.socialMedia.instagram
          });
        }
        
        if (plug.socialMedia.whatsapp) {
          newSocialMedia.push({
            name: 'WhatsApp',
            emoji: '💬',
            url: plug.socialMedia.whatsapp
          });
        }
        
        if (plug.socialMedia.website) {
          newSocialMedia.push({
            name: 'Site Web',
            emoji: '🌐',
            url: plug.socialMedia.website
          });
        }
        
        // Mettre à jour le plug avec le nouveau format
        await Plug.findByIdAndUpdate(plug._id, { 
          socialMedia: newSocialMedia 
        });
        migratedCount++;
        console.log(`✅ Migré: ${plug.name} (${newSocialMedia.length} réseaux sociaux)`);
      }
    }
    
    console.log(`🎉 Migration terminée: ${migratedCount} plugs migrés`);
    
  } catch (error) {
    console.error('❌ Erreur migration:', error);
    throw error; // Relancer l'erreur pour que l'appelant puisse la gérer
  }
  // NE PAS fermer la connexion MongoDB ici car elle est utilisée par l'application principale
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  // Si exécuté directement, on doit établir notre propre connexion
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => migrateSocialMedia())
    .then(() => {
      console.log('🔌 Fermeture de la connexion MongoDB');
      return mongoose.disconnect();
    })
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
} else {
  // Si importé comme module, utiliser la connexion existante
  module.exports = migrateSocialMedia;
}