// Test pour vérifier que tous les codes postaux sont générés
import { getPostalCodesForCountry } from './admin-panel/lib/postal-codes-complete.js';

console.log('🧪 Test du système de codes postaux complets\n');

// Test pour la France
const franceCodes = getPostalCodesForCountry('France');
console.log(`🇫🇷 France: ${franceCodes.length} codes postaux`);
console.log(`   Premiers codes: ${franceCodes.slice(0, 5).join(', ')}`);
console.log(`   Derniers codes: ${franceCodes.slice(-5).join(', ')}`);

// Vérifier que tous les départements sont couverts
const departments = new Set();
franceCodes.forEach(code => {
  if (code.length === 5) {
    departments.add(code.substring(0, 2));
  }
});
console.log(`   Départements couverts: ${departments.size}`);

// Test pour d'autres pays
const countries = ['Belgique', 'Suisse', 'Allemagne', 'Espagne', 'Italie', 'États-Unis'];
countries.forEach(country => {
  const codes = getPostalCodesForCountry(country);
  console.log(`\n🌍 ${country}: ${codes.length} codes postaux`);
  if (codes.length > 0) {
    console.log(`   Exemples: ${codes.slice(0, 3).join(', ')}...`);
  }
});

// Test de recherche
console.log('\n🔍 Test de recherche de codes postaux:');
const searchTerm = '750'; // Recherche Paris
const parisResults = franceCodes.filter(code => code.includes(searchTerm));
console.log(`   Recherche "${searchTerm}": ${parisResults.length} résultats`);
console.log(`   Exemples: ${parisResults.slice(0, 10).join(', ')}`);

console.log('\n✅ Test terminé!');