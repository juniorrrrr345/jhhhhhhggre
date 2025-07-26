#!/usr/bin/env node

console.log('🔍 EXTRACTION DES CODES POSTAUX RÉELS DES BOUTIQUES\n');

const boutiques = require('./boutiques_locales.json');

// Extraire tous les départements/codes utilisés
const codesParPays = new Map();

boutiques.plugs.forEach((plug, index) => {
  console.log(`🏪 Boutique ${index + 1}: ${plug.name}`);
  
  plug.countries.forEach(country => {
    if (!codesParPays.has(country)) {
      codesParPays.set(country, new Set());
    }
    
    // Vérifier les services avec départements
    if (plug.services && plug.services.delivery && plug.services.delivery.departments) {
      console.log(`   📦 Livraison ${country}: ${plug.services.delivery.departments.join(', ')}`);
      plug.services.delivery.departments.forEach(dept => {
        codesParPays.get(country).add(dept);
      });
    }
    
    if (plug.services && plug.services.meetup && plug.services.meetup.departments) {
      console.log(`   🤝 Meetup ${country}: ${plug.services.meetup.departments.join(', ')}`);
      plug.services.meetup.departments.forEach(dept => {
        codesParPays.get(country).add(dept);
      });
    }
  });
  console.log('');
});

console.log('📋 CODES POSTAUX RÉELS PAR PAYS:');
const result = {};
codesParPays.forEach((codes, pays) => {
  if (codes.size > 0) {
    const codesArray = Array.from(codes).sort();
    result[pays] = codesArray;
    console.log(`${pays}: [${codesArray.map(c => `'${c}'`).join(', ')}]`);
  }
});

console.log('\n📊 STATISTIQUES:');
let totalCodes = 0;
codesParPays.forEach((codes, pays) => {
  totalCodes += codes.size;
  console.log(`   ${pays}: ${codes.size} codes`);
});

console.log(`\n✅ TOTAL: ${totalCodes} codes réels (au lieu de millions)`);
console.log('🚀 Parfait pour Vercel - performance optimale !');

module.exports = result;