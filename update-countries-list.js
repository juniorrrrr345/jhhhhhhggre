#!/usr/bin/env node

console.log('🌍 MISE À JOUR LISTE DES PAYS\n');

// Liste complète des pays d'Europe + pays spéciaux
const nouveauxPays = [
  // EUROPE (ordre alphabétique)
  'Albanie',
  'Allemagne', 
  'Andorre',
  'Autriche',
  'Belgique',
  'Biélorussie',
  'Bosnie-Herzégovine',
  'Bulgarie',
  'Chypre',
  'Croatie',
  'Danemark',
  'Espagne',
  'Estonie',
  'Finlande',
  'France',
  'Grèce',
  'Hongrie',
  'Irlande',
  'Islande',
  'Italie',
  'Kosovo',
  'Lettonie',
  'Liechtenstein',
  'Lituanie',
  'Luxembourg',
  'Macédoine du Nord',
  'Malte',
  'Moldavie',
  'Monaco',
  'Monténégro',
  'Norvège',
  'Pays-Bas',
  'Pologne',
  'Portugal',
  'République tchèque',
  'Roumanie',
  'Royaume-Uni',
  'Russie',
  'Saint-Marin',
  'Serbie',
  'Slovaquie',
  'Slovénie',
  'Suède',
  'Ukraine',
  'Vatican',
  
  // PAYS SPÉCIAUX (hors Europe)
  'Suisse',      // Déjà en Europe mais mentionné spécifiquement
  'Thaïlande',
  'Canada', 
  'États-Unis',  // USA
  'Maroc'
];

console.log('📋 NOUVELLE LISTE DES PAYS:');
console.log(`Total: ${nouveauxPays.length} pays\n`);

console.log('🇪🇺 PAYS D\'EUROPE:');
const paysEurope = nouveauxPays.slice(0, -4); // Tous sauf les 4 derniers
paysEurope.forEach((pays, index) => {
  console.log(`   ${(index + 1).toString().padStart(2, '0')}. ${pays}`);
});

console.log('\n🌍 PAYS SPÉCIAUX (hors Europe):');
console.log('   • Thaïlande 🇹🇭');
console.log('   • Canada 🇨🇦');
console.log('   • États-Unis 🇺🇸');
console.log('   • Maroc 🇲🇦');

console.log('\n✅ PRÊT À APPLIQUER:');
console.log('   1. Mise à jour du service postal Telegram');
console.log('   2. Mise à jour du service postal Vercel');  
console.log('   3. Adaptation des codes postaux');

// Générer le code pour les services
console.log('\n📝 CODE À APPLIQUER:');
console.log('const nouveauxPays = [');
nouveauxPays.forEach(pays => {
  console.log(`  '${pays}',`);
});
console.log('];');

module.exports = nouveauxPays;