// Test du système dynamique Vercel
const postalCodeService = require('./admin-panel/lib/postalCodeServiceVercel');

console.log('🧪 Test du système dynamique Vercel PostalCode Service\n');

// Statistiques générales
const stats = postalCodeService.getStats();
console.log('📊 STATISTIQUES:');
console.log(`   Pays disponibles: ${stats.countries}`);
console.log(`   Total départements: ${stats.totalDepartments}`);
console.log(`   Dernière mise à jour: ${stats.lastReload}\n`);

// Détail par pays
console.log('🌍 DÉTAIL PAR PAYS:');
stats.countriesDetail.forEach(country => {
  console.log(`   🏴 ${country.name}: ${country.departments} départements`);
  console.log(`      └── [${country.codes.join(', ')}]`);
});

console.log('\n🔍 TESTS SPÉCIFIQUES:');

// Test France
const franceCodes = postalCodeService.getPostalCodes('France');
console.log(`France: ${franceCodes.length} codes → [${franceCodes.join(', ')}]`);

// Test pays disponibles
const availableCountries = postalCodeService.getAvailableCountries();
console.log(`Pays disponibles: [${availableCountries.join(', ')}]`);

console.log('\n✅ Test terminé!');