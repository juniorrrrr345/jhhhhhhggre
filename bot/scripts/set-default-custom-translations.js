const axios = require('axios');

// Configuration
const BOT_URL = process.env.BOT_URL || 'https://jhhhhhhggre.onrender.com';

// Traductions basées sur vos messages personnalisés
// Ces traductions seront utilisées si vous n'avez pas défini de message personnalisé
const DEFAULT_CUSTOM_TRANSLATIONS = {
  contact: {
    fr: "Contactez-nous pour plus d'informations.", // Votre message actuel
    en: "Contact us for more information.",
    it: "Contattaci per maggiori informazioni.",
    es: "Contáctanos para más información.",
    de: "Kontaktieren Sie uns für weitere Informationen."
  },
  info: {
    fr: "Informations sur notre plateforme.", // Votre message actuel
    en: "Information about our platform.",
    it: "Informazioni sulla nostra piattaforma.",
    es: "Información sobre nuestra plataforma.",
    de: "Informationen über unsere Plattform."
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