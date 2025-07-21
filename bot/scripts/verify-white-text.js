const fs = require('fs');
const path = require('path');

async function verifyWhiteText() {
  console.log('🔍 Vérification des couleurs de texte dans la boutique...\n');
  
  const shopPath = path.join(process.cwd(), '../admin-panel/pages/shop');
  const files = [
    'index.js',
    'vip.js', 
    'search.js',
    '[id].js'
  ];
  
  let totalIssues = 0;
  let totalChecked = 0;
  
  for (const file of files) {
    const filePath = path.join(shopPath, file);
    
    if (fs.existsSync(filePath)) {
      console.log(`📄 Analyse de ${file}...`);
      
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      let fileIssues = 0;
      let fileChecked = 0;
      
      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        
        // Chercher les patterns problématiques
        const problematicPatterns = [
          {
            pattern: /text-gray-[3456789]/g,
            description: 'Texte gris foncé'
          },
          {
            pattern: /text-blue-[0-9]/g, 
            description: 'Texte bleu'
          },
          {
            pattern: /text-black/g,
            description: 'Texte noir'
          }
        ];
        
        problematicPatterns.forEach(({ pattern, description }) => {
          const matches = line.match(pattern);
          if (matches) {
            fileIssues++;
            totalIssues++;
            console.log(`  ❌ Ligne ${lineNumber}: ${description} trouvé - ${matches.join(', ')}`);
            console.log(`     "${line.trim()}"`);
          }
        });
        
        // Compter les textes en blanc (pour statistiques)
        const whiteTextPatterns = [
          /text-white/g,
          /text-gray-[12]/g // gris très clair acceptable
        ];
        
        whiteTextPatterns.forEach(pattern => {
          const matches = line.match(pattern);
          if (matches) {
            fileChecked += matches.length;
            totalChecked += matches.length;
          }
        });
      });
      
      if (fileIssues === 0) {
        console.log(`  ✅ Aucun problème trouvé dans ${file}`);
      } else {
        console.log(`  ⚠️ ${fileIssues} problème(s) trouvé(s) dans ${file}`);
      }
      
      console.log(`  📊 ${fileChecked} textes blancs/clairs trouvés\n`);
      
    } else {
      console.log(`  ❌ Fichier ${file} non trouvé\n`);
    }
  }
  
  console.log('📋 Résumé final:');
  console.log(`✅ Textes blancs/clairs: ${totalChecked}`);
  console.log(`❌ Problèmes trouvés: ${totalIssues}`);
  
  if (totalIssues === 0) {
    console.log('\n🎉 Parfait ! Tous les textes sont correctement configurés en blanc/clair.');
  } else {
    console.log('\n⚠️ Des corrections sont nécessaires pour une meilleure lisibilité.');
  }
  
  // Vérification des noms spécifiques mentionnés
  console.log('\n🔍 Vérification des éléments spécifiques...');
  
  const specificChecks = [
    {
      search: /VIP/g,
      context: 'Badges et liens VIP'
    },
    {
      search: /Recherche/g,
      context: 'Navigation Recherche'
    },
    {
      search: /Accueil/g,
      context: 'Navigation Accueil'
    },
    {
      search: /plug\.name/g,
      context: 'Noms des plugs'
    }
  ];
  
  for (const file of files) {
    const filePath = path.join(shopPath, file);
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      specificChecks.forEach(({ search, context }) => {
        const matches = content.match(search);
        if (matches) {
          console.log(`  ✅ ${context}: ${matches.length} occurrence(s) dans ${file}`);
        }
      });
    }
  }
  
  console.log('\n📱 Test recommandé:');
  console.log('1. Aller sur votre boutique Vercel');
  console.log('2. Vérifier visuellement que tous les textes sont lisibles');
  console.log('3. Tester sur mobile et desktop');
  console.log('4. Vérifier toutes les pages: /, /vip, /search, /plug/[id]');
  
  console.log('\n🎯 Éléments à vérifier visuellement:');
  console.log('- ✅ Titres des pages (Test Shop, VIP, Recherche)');
  console.log('- ✅ Noms des plugs (titres en blanc)');
  console.log('- ✅ Navigation (Accueil, Recherche, VIP)');
  console.log('- ✅ Descriptions (gris clair acceptable)');
  console.log('- ✅ Messages d\'état et compteurs');
  console.log('- ✅ Background image s\'affiche correctement');
}

async function analyzeColorUsage() {
  console.log('\n🎨 Analyse détaillée de l\'usage des couleurs...\n');
  
  const shopPath = path.join(process.cwd(), '../admin-panel/pages/shop');
  const files = ['index.js', 'vip.js', 'search.js', '[id].js'];
  
  const colorStats = {
    'text-white': 0,
    'text-gray-200': 0,
    'text-gray-300': 0,
    'text-gray-400': 0,
    'text-gray-500': 0,
    'autres': 0
  };
  
  for (const file of files) {
    const filePath = path.join(shopPath, file);
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Compter les occurrences
      Object.keys(colorStats).forEach(color => {
        if (color !== 'autres') {
          const regex = new RegExp(color.replace('-', '\\-'), 'g');
          const matches = content.match(regex);
          if (matches) {
            colorStats[color] += matches.length;
          }
        }
      });
      
      // Compter les autres couleurs de texte
      const otherTextColors = content.match(/text-(?!white|gray-200|gray-300|gray-400|gray-500)[a-z]+-[0-9]+/g);
      if (otherTextColors) {
        colorStats.autres += otherTextColors.length;
      }
    }
  }
  
  console.log('📊 Statistiques des couleurs:');
  Object.entries(colorStats).forEach(([color, count]) => {
    const status = color === 'text-white' || color === 'text-gray-200' ? '✅' : 
                   color === 'text-gray-300' || color === 'text-gray-400' ? '⚠️' : '❌';
    console.log(`  ${status} ${color}: ${count} utilisations`);
  });
  
  const goodColors = colorStats['text-white'] + colorStats['text-gray-200'];
  const problematicColors = colorStats['text-gray-300'] + colorStats['text-gray-400'] + colorStats['text-gray-500'] + colorStats['autres'];
  
  console.log(`\n📈 Score de lisibilité: ${Math.round(goodColors / (goodColors + problematicColors) * 100)}%`);
}

// Exécuter la vérification
if (require.main === module) {
  verifyWhiteText()
    .then(() => analyzeColorUsage())
    .then(() => {
      console.log('\n✅ Vérification terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur:', error.message);
      process.exit(1);
    });
}

module.exports = { verifyWhiteText, analyzeColorUsage };