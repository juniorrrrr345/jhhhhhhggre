const boutiques = require('./boutiques_locales.json');
console.log('🔍 ANALYSE PAR PAYS - COMBIEN DE BOUTIQUES PAR PAYS:\n');

const paysCount = {};

boutiques.plugs.forEach(plug => {
  plug.countries.forEach(country => {
    if (!paysCount[country]) {
      paysCount[country] = [];
    }
    paysCount[country].push(plug.name);
  });
});

console.log('📊 NOMBRE DE BOUTIQUES PAR PAYS:');
Object.keys(paysCount).sort().forEach(pays => {
  console.log(`🏴 ${pays}: ${paysCount[pays].length} boutique(s)`);
  paysCount[pays].forEach(boutique => {
    console.log(`   └── ${boutique}`);
  });
  console.log('');
});

console.log('💡 SUGGESTION: Garder seulement les pays avec 2+ boutiques ou tous ?');