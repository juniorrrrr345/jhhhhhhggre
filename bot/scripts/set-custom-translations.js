const axios = require('axios');

// Configuration
const BOT_URL = process.env.BOT_URL || 'https://safepluglink-6hzr.onrender.com';

// Vos textes personnalisés traduits
const CUSTOM_TRANSLATIONS = {
  contact: {
    fr: "Votre message Contact personnalisé en français",
    en: "Your custom Contact message in English",
    it: "Il tuo messaggio Contact personalizzato in italiano",
    es: "Tu mensaje de Contacto personalizado en español",
    de: "Ihre benutzerdefinierte Kontakt-Nachricht auf Deutsch"
  },
  info: {
    fr: "Votre message Info personnalisé en français",
    en: "Your custom Info message in English", 
    it: "Il tuo messaggio Info personalizzato in italiano",
    es: "Tu mensaje de Info personalizado en español",
    de: "Ihre benutzerdefinierte Info-Nachricht auf Deutsch"
  }
};

async function setCustomTranslations() {
  try {
    console.log('🌐 Définition des traductions personnalisées...');
    
    const response = await axios.post(`${BOT_URL}/api/set-contact-info-translations`, {
      contactTranslations: CUSTOM_TRANSLATIONS.contact,
      infoTranslations: CUSTOM_TRANSLATIONS.info
    });
    
    console.log('✅ Traductions définies avec succès:', response.data);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

// Exécuter
setCustomTranslations();