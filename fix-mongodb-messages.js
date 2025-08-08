const mongoose = require('mongoose');

// Configuration MongoDB
const MONGODB_URI = 'mongodb+srv://Junior:Fida2021@juniorcluster.qzwxr.mongodb.net/telegram-bot?retryWrites=true&w=majority';

// Schéma de configuration
const configSchema = new mongoose.Schema({
  _id: String,
  buttons: {
    contact: {
      text: Object,
      content: Object,
      enabled: Boolean
    },
    info: {
      text: Object,
      content: Object,
      enabled: Boolean
    }
  }
}, { collection: 'configs' });

const Config = mongoose.model('Config', configSchema);

async function updateMessages() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    // Récupérer la configuration actuelle
    const config = await Config.findById('main');
    if (!config) {
      console.log('❌ Configuration non trouvée');
      return;
    }
    
    console.log('📋 Configuration actuelle trouvée');
    
    // Mettre à jour les messages Contact
    config.buttons.contact.content = {
      fr: "Contactez-nous pour plus d'informations.\n@Findyourplugadmin",
      en: "Contact us for more information.\n@Findyourplugadmin",
      it: "Contattaci per maggiori informazioni.\n@Findyourplugadmin",
      es: "Contáctanos para más información.\n@Findyourplugadmin",
      de: "Kontaktieren Sie uns für weitere Informationen.\n@Findyourplugadmin"
    };
    
    // Mettre à jour les messages Info
    config.buttons.info.content = {
      fr: "Nous listons les plugs du monde entier par Pays / Ville découvrez notre mini-app 🌍🔌\n\nPour toute demande spécifique contacter nous @Findyourplugadmin 📲",
      en: "We list plugs worldwide by Country / City discover our mini-app 🌍🔌\n\nFor any specific request contact us @Findyourplugadmin 📲",
      it: "Elenchiamo plug in tutto il mondo per Paese / Città scopri la nostra mini-app 🌍🔌\n\nPer qualsiasi richiesta specifica contattaci @Findyourplugadmin 📲",
      es: "Listamos plugs en todo el mundo por País / Ciudad descubre nuestra mini-app 🌍🔌\n\nPara cualquier solicitud específica contáctanos @Findyourplugadmin 📲",
      de: "Wir listen Plugs weltweit nach Land / Stadt auf, entdecken Sie unsere Mini-App 🌍🔌\n\nFür spezielle Anfragen kontaktieren Sie uns @Findyourplugadmin 📲"
    };
    
    // Sauvegarder
    await config.save();
    console.log('✅ Messages mis à jour dans MongoDB!');
    
    // Afficher les nouveaux messages
    console.log('\n📞 NOUVEAUX MESSAGES CONTACT:');
    Object.entries(config.buttons.contact.content).forEach(([lang, text]) => {
      console.log(`${lang}: ${text.replace(/\n/g, ' ')}`);
    });
    
    console.log('\nℹ️ NOUVEAUX MESSAGES INFO:');
    Object.entries(config.buttons.info.content).forEach(([lang, text]) => {
      console.log(`${lang}: ${text.substring(0, 60)}...`);
    });
    
    console.log('\n✅ TERMINÉ! Les boutons afficheront maintenant @Findyourplugadmin');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnecté de MongoDB');
  }
}

// Exécuter
updateMessages();