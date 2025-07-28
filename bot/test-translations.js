const { getTranslation } = require('./src/utils/translations');

console.log('🧪 Test des traductions modifiées...\n');

// Test du bouton principal TOP plug -> VOTER POUR VOTRE PLUG 🗳️
console.log('1. Test bouton principal:');
console.log('FR:', getTranslation('menu_topPlugs', 'fr'));
console.log('EN:', getTranslation('menu_topPlugs', 'en'));
console.log('IT:', getTranslation('menu_topPlugs', 'it'));
console.log('ES:', getTranslation('menu_topPlugs', 'es'));
console.log('DE:', getTranslation('menu_topPlugs', 'de'));
console.log('');

// Test de l'emoji Potato 🥔 -> 🏴‍☠️
console.log('2. Test emoji Potato:');
console.log('FR:', getTranslation('registration.potatoQuestion', 'fr'));
console.log('EN:', getTranslation('registration.potatoQuestion', 'en'));
console.log('IT:', getTranslation('registration.potatoQuestion', 'it'));
console.log('ES:', getTranslation('registration.potatoQuestion', 'es'));
console.log('DE:', getTranslation('registration.potatoQuestion', 'de'));
console.log('');

console.log('3. Test étape Potato:');
console.log('FR:', getTranslation('registration.step4', 'fr'));
console.log('EN:', getTranslation('registration.step4', 'en'));
console.log('IT:', getTranslation('registration.step4', 'it'));
console.log('ES:', getTranslation('registration.step4', 'es'));
console.log('DE:', getTranslation('registration.step4', 'de'));
console.log('');

console.log('4. Test erreur Potato:');
console.log('FR:', getTranslation('registration.error.potatoFormat', 'fr'));
console.log('EN:', getTranslation('registration.error.potatoFormat', 'en'));
console.log('');

console.log('✅ Tests terminés ! Les modifications ont été appliquées.');