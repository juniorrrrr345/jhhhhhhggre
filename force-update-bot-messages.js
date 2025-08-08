const https = require('https');

console.log('🔧 FORÇAGE DES MESSAGES CONTACT/INFO DANS TOUTES LES LANGUES\n');

const messages = {
  contact: {
    fr: "Contactez-nous pour plus d'informations.\n@Findyourplugadmin",
    en: "Contact us for more information.\n@Findyourplugadmin",
    it: "Contattaci per maggiori informazioni.\n@Findyourplugadmin",
    es: "Contáctanos para más información.\n@Findyourplugadmin",
    de: "Kontaktieren Sie uns für weitere Informationen.\n@Findyourplugadmin"
  },
  info: {
    fr: "Nous listons les plugs du monde entier par Pays / Ville découvrez notre mini-app 🌍🔌\n\nPour toute demande spécifique contacter nous @Findyourplugadmin 📲",
    en: "We list plugs worldwide by Country / City discover our mini-app 🌍🔌\n\nFor any specific request contact us @Findyourplugadmin 📲",
    it: "Elenchiamo plug in tutto il mondo per Paese / Città scopri la nostra mini-app 🌍🔌\n\nPer qualsiasi richiesta specifica contattaci @Findyourplugadmin 📲",
    es: "Listamos plugs en todo el mundo por País / Ciudad descubre nuestra mini-app 🌍🔌\n\nPara cualquier solicitud específica contáctanos @Findyourplugadmin 📲",
    de: "Wir listen Plugs weltweit nach Land / Stadt auf, entdecken Sie unsere Mini-App 🌍🔌\n\nFür spezielle Anfragen kontaktieren Sie uns @Findyourplugadmin 📲"
  }
};

console.log('📋 NOUVEAUX MESSAGES:');
console.log('\n📞 CONTACT:');
Object.entries(messages.contact).forEach(([lang, text]) => {
  console.log(`${lang}: ${text.replace('\n', ' ')}`);
});
console.log('\nℹ️ INFO:');
Object.entries(messages.info).forEach(([lang, text]) => {
  console.log(`${lang}: ${text.substring(0, 50)}...`);
});

// Appeler l'API pour forcer la mise à jour
const options = {
  hostname: 'safepluglink-6hzr.onrender.com',
  path: '/api/force-contact-info-update',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer JuniorAdmon123'
  }
};

const req = https.request(options, (res) => {
  console.log(`\n📡 Status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    console.log('✅ Messages forcés avec succès!');
  }
});

req.on('error', (error) => {
  console.error('❌ Erreur:', error.message);
});

req.end();

console.log('\n⚠️ IMPORTANT:');
console.log('1. Attendez que Render redéploie avec le dernier commit');
console.log('2. OU forcez un redéploiement manuel sur Render');
console.log('3. Les messages afficheront @Findyourplugadmin dans toutes les langues');
