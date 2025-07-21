#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Test de la boutique recréée...\n');

const shopFiles = [
  'admin-panel/pages/shop/index.js',
  'admin-panel/pages/shop/search.js',
  'admin-panel/pages/shop/vip.js',
  'admin-panel/pages/shop/[id].js'
];

let totalTests = 0;
let passedTests = 0;

const tests = [
  {
    name: 'Style inline color: white',
    check: (content) => content.includes('style={{ color: \'white\' }}')
  },
  {
    name: 'Navigation avec couleurs forcées',
    check: (content) => content.includes('<span style={{ color: \'white\' }}>Accueil</span>')
  },
  {
    name: 'Titres avec couleurs forcées',
    check: (content) => content.includes('style={{ color: \'white\' }} className="text-') && content.includes('font-bold')
  },
  {
    name: 'Background image configuré',
    check: (content) => content.includes('backgroundImage: config?.boutique?.backgroundImage')
  },
  {
    name: 'Container avec color: white',
    check: (content) => content.includes('color: \'white\'')
  },
  {
    name: 'Cards modernes (bg-gray-800)',
    check: (content) => content.includes('bg-gray-800 border border-gray-700 rounded-xl')
  },
  {
    name: 'Transitions et animations',
    check: (content) => content.includes('hover:scale-105 transition-transform') || content.includes('hover:opacity-75')
  }
];

console.log('📋 Tests par fichier:\n');

shopFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Fichier non trouvé: ${file}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`📄 ${file}:`);
  
  let fileTests = 0;
  let filePassed = 0;
  
  tests.forEach(test => {
    fileTests++;
    totalTests++;
    
    if (test.check(content)) {
      console.log(`  ✅ ${test.name}`);
      filePassed++;
      passedTests++;
    } else {
      console.log(`  ❌ ${test.name}`);
    }
  });
  
  // Tests spécifiques par page
  if (file.includes('index.js')) {
    totalTests++;
    if (content.includes('🔌 {config?.boutique?.name || \'Boutique Premium\'}')) {
      console.log(`  ✅ Page d'accueil - Titre correct`);
      filePassed++;
      passedTests++;
    } else {
      console.log(`  ❌ Page d'accueil - Titre manquant`);
    }
  }
  
  if (file.includes('search.js')) {
    totalTests++;
    if (content.includes('🔍 Recherche dans') && content.includes('resetFilters')) {
      console.log(`  ✅ Page recherche - Fonctionnalités complètes`);
      filePassed++;
      passedTests++;
    } else {
      console.log(`  ❌ Page recherche - Fonctionnalités manquantes`);
    }
  }
  
  if (file.includes('vip.js')) {
    totalTests++;
    if (content.includes('👑 VIP -') && content.includes('border-yellow-500')) {
      console.log(`  ✅ Page VIP - Style spécifique VIP`);
      filePassed++;
      passedTests++;
    } else {
      console.log(`  ❌ Page VIP - Style VIP manquant`);
    }
  }
  
  if (file.includes('[id].js')) {
    totalTests++;
    if (content.includes('formatText') && content.includes('fetchPlug')) {
      console.log(`  ✅ Page détail - Fonctionnalités détaillées`);
      filePassed++;
      passedTests++;
    } else {
      console.log(`  ❌ Page détail - Fonctionnalités manquantes`);
    }
  }
  
  console.log(`  📊 Score: ${filePassed}/${fileTests + 1} tests réussis\n`);
});

// Résumé final
console.log('=' * 50);
console.log('\n📊 RÉSUMÉ FINAL:');
console.log(`Tests réussis: ${passedTests}/${totalTests}`);
console.log(`Pourcentage de réussite: ${Math.round((passedTests / totalTests) * 100)}%`);

if (passedTests === totalTests) {
  console.log('\n🎉 PARFAIT ! La boutique a été entièrement recréée !');
  console.log('✨ Toutes les pages utilisent des couleurs blanches forcées');
  console.log('🎨 Design moderne avec cards et animations');
  console.log('🖼️  Background image configuré');
  console.log('📱 Navigation cohérente sur toutes les pages');
  console.log('🔍 Fonctionnalités complètes (recherche, VIP, détails)');
} else {
  console.log(`\n⚠️  ${totalTests - passedTests} test(s) en échec.`);
  console.log('🔧 Vérifiez les éléments manqués ci-dessus.');
}

console.log('\n🚀 Pages de la boutique recréées:');
console.log('• /shop - Page d\'accueil avec grille de produits');
console.log('• /shop/search - Page de recherche avec filtres');
console.log('• /shop/vip - Page VIP avec bordures dorées');
console.log('• /shop/[id] - Page de détail avec informations complètes');