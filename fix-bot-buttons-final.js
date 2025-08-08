const https = require('https');

console.log('🔧 CORRECTION FINALE DES BOUTONS - SANS @ DANS LE TEXTE\n');

const newConfig = {
  welcome: {
    text: 'Bienvenue sur FindYourPlug! Explorez nos services.\n\nCliquer sur notre MINI-APP 🔌 pour trouver un plug près de chez vous 📍\n',
    image: 'https://i.imgur.com/yhJq5Ty.png'
  },
  buttons: {
    contact: {
      text: '📞 Contact',
      content: 'Contactez-nous pour plus d\'informations.\nfindyourplugadmin',
      enabled: true
    },
    info: {
      text: 'ℹ️ Info',
      content: 'Nous listons les plugs du monde entier par Pays / Ville découvrez notre mini-app 🌍🔌\n\nPour toute demande spécifique contacter nous findyourplugadmin 📲',
      enabled: true
    }
  }
};

console.log('📋 NOUVEAUX TEXTES (SANS @):');
console.log('\n📞 CONTACT:');
console.log(newConfig.buttons.contact.content);
console.log('\nℹ️ INFO:');
console.log(newConfig.buttons.info.content);

// Sauvegarder localement
const fs = require('fs');
fs.writeFileSync('./admin-panel/bot-buttons-config.json', JSON.stringify({
  buttons: newConfig.buttons,
  lastUpdate: new Date().toISOString()
}, null, 2));

console.log('\n✅ Configuration sauvegardée!');
console.log('\n⚠️ IMPORTANT: Vous DEVEZ redémarrer le bot sur Render pour appliquer ces changements!');
console.log('\n📌 Les textes afficheront "findyourplugadmin" SANS le @ comme demandé.');
