const axios = require('axios');

// Configuration
const BOT_URL = process.env.BOT_URL || 'https://safepluglink-6hzr.onrender.com';

// Traductions de vos messages personnalisés
const DEFAULT_CUSTOM_TRANSLATIONS = {
  contact: {
    fr: "Contactez-nous pour plus d'informations.\n@findyourplugsav",
    en: "Contact us for more information.\n@findyourplugsav",
    it: "Contattaci per maggiori informazioni.\n@findyourplugsav",
    es: "Contáctanos para más información.\n@findyourplugsav",
    de: "Kontaktieren Sie uns für weitere Informationen.\n@findyourplugsav"
  },
  info: {
    fr: "Nous listons les plugs du monde entier par Pays / Ville découvrez notre mini-app 🌍🔌\n\nPour toute demande spécifique contacter nous @findyourplugsav 📲",
    en: "We list plugs worldwide by Country / City discover our mini-app 🌍🔌\n\nFor any specific request contact us @findyourplugsav 📲",
    it: "Elenchiamo plug in tutto il mondo per Paese / Città scopri la nostra mini-app 🌍🔌\n\nPer qualsiasi richiesta specifica contattaci @findyourplugsav 📲",
    es: "Listamos plugs en todo el mundo por País / Ciudad descubre nuestra mini-app 🌍🔌\n\nPara cualquier solicitud específica contáctanos @findyourplugsav 📲",
    de: "Wir listen Plugs weltweit nach Land / Stadt auf, entdecken Sie unsere Mini-App 🌍🔌\n\nFür spezielle Anfragen kontaktieren Sie uns @findyourplugsav 📲"
  }
};

async function setDefaultTranslations() {
  try {
    console.log('🌐 Définition des traductions par défaut...');
    
    const response = await axios.post(`${BOT_URL}/api/set-contact-info-translations`, {
      contactTranslations: DEFAULT_CUSTOM_TRANSLATIONS.contact,
      infoTranslations: DEFAULT_CUSTOM_TRANSLATIONS.info
    });
    
    console.log('✅ Traductions définies avec succès:', response.data);
    console.log('\n📝 Messages traduits:');
    console.log('\nCONTACT:');
    Object.entries(DEFAULT_CUSTOM_TRANSLATIONS.contact).forEach(([lang, text]) => {
      console.log(`  ${lang}: ${text}`);
    });
    console.log('\nINFO:');
    Object.entries(DEFAULT_CUSTOM_TRANSLATIONS.info).forEach(([lang, text]) => {
      console.log(`  ${lang}: ${text}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

// Message d'information
console.log('=====================================');
console.log('🔧 CONFIGURATION DES TRADUCTIONS');
console.log('=====================================');
console.log('\nCe script va configurer les traductions pour vos messages Contact et Info.');
console.log('\nPour personnaliser les messages:');
console.log('1. Modifiez les textes dans ce fichier');
console.log('2. Relancez le script');
console.log('\n=====================================\n');

// Exécuter après un délai pour laisser le temps de lire
setTimeout(setDefaultTranslations, 2000);