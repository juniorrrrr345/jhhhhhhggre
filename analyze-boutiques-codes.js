#!/usr/bin/env node

console.log('🔍 ANALYSE DES CODES POSTAUX UTILISÉS DANS LES BOUTIQUES\n');

const boutiques = require('./boutiques_locales.json');

// Extraire tous les départements/codes utilisés
const codesUtilises = new Map(); // pays -> Set de codes

boutiques.plugs.forEach((plug, index) => {
  console.log(`🏪 Boutique ${index + 1}: ${plug.name}`);
  
  plug.countries.forEach(country => {
    if (!codesUtilises.has(country)) {
      codesUtilises.set(country, new Set());
    }
    
    // Vérifier les services avec départements
    if (plug.services && plug.services.delivery && plug.services.delivery.departments) {
      console.log(`   📦 Livraison ${country}: ${plug.services.delivery.departments.join(', ')}`);
      plug.services.delivery.departments.forEach(dept => {
        codesUtilises.get(country).add(dept);
      });
    }
    
    if (plug.services && plug.services.meetup && plug.services.meetup.departments) {
      console.log(`   🤝 Meetup ${country}: ${plug.services.meetup.departments.join(', ')}`);
      plug.services.meetup.departments.forEach(dept => {
        codesUtilises.get(country).add(dept);
      });
    }
  });
  console.log('');
});

console.log('📊 RÉSUMÉ DES CODES POSTAUX RÉELLEMENT UTILISÉS:');
codesUtilises.forEach((codes, pays) => {
  if (codes.size > 0) {
    console.log(`🏴 ${pays}: ${Array.from(codes).sort().join(', ')} (${codes.size} codes)`);
  }
});

console.log('\n🎯 RECOMMANDATIONS:');
console.log('📱 TELEGRAM: Utiliser seulement ces codes pour chaque pays');
console.log('🌐 VERCEL: Utiliser tous les codes des grandes villes');

// Générer le code pour Telegram
console.log('\n📱 CODE POUR TELEGRAM (codes boutiques uniquement):');
codesUtilises.forEach((codes, pays) => {
  if (codes.size > 0) {
    console.log(`   ${pays}: [${Array.from(codes).sort().map(c => `'${c}'`).join(', ')}]`);
  }
});