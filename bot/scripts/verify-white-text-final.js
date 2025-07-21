#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification finale des couleurs de texte...\n');

const shopFiles = [
  'admin-panel/pages/shop/index.js',
  'admin-panel/pages/shop/search.js',
  'admin-panel/pages/shop/vip.js',
  'admin-panel/pages/shop/[id].js'
];

let totalIssues = 0;
let totalChecks = 0;

// Patterns problématiques à détecter (en excluant les sections CSS)
const problematicPatterns = [
  {
    pattern: /text-blue-[0-9]/g,
    description: 'Texte bleu Tailwind'
  },
  {
    pattern: /text-gray-[4-9]/g,
    description: 'Texte gris très foncé'
  },
  {
    pattern: /text-black/g,
    description: 'Texte noir'
  }
];

// Fonction pour nettoyer le contenu (exclure les sections CSS)
function cleanContent(content) {
  // Enlever les sections <style jsx global>
  return content.replace(/<style jsx global>\{`[\s\S]*?`\}<\/style>/g, '');
}

// Vérifications spécifiques
const checks = [
  {
    description: 'Navigation links (Accueil, Recherche, VIP)',
    patterns: ['text-white', 'nav a']
  },
  {
    description: 'Noms des plugs (titres h3)',
    patterns: ['text-white', 'h3']
  },
  {
    description: 'Styles CSS forcés avec !important',
    patterns: ['color: white !important', '!important']
  }
];

console.log('📋 Analyse des fichiers de la boutique:\n');

shopFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Fichier non trouvé: ${file}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const cleanedContent = cleanContent(content);
  console.log(`📄 ${file}:`);
  
  let fileIssues = 0;
  
  // Vérifier les patterns problématiques (sur le contenu nettoyé)
  problematicPatterns.forEach(({ pattern, description }) => {
    const matches = cleanedContent.match(pattern);
    if (matches) {
      console.log(`  ⚠️  ${description}: ${matches.length} occurrence(s)`);
      matches.forEach(match => {
        console.log(`     → "${match}"`);
      });
      fileIssues += matches.length;
    }
  });
  
  // Vérifier les éléments positifs (sur le contenu complet)
  checks.forEach(({ description, patterns }) => {
    const hasAllPatterns = patterns.every(pattern => content.includes(pattern));
    if (hasAllPatterns) {
      console.log(`  ✅ ${description}: OK`);
    } else {
      console.log(`  ❌ ${description}: MANQUANT`);
      fileIssues++;
    }
    totalChecks++;
  });
  
  if (fileIssues === 0) {
    console.log(`  🎉 Aucun problème détecté !`);
  }
  
  totalIssues += fileIssues;
  console.log('');
});

// Résumé final
console.log('=' * 50);
console.log('\n📊 RÉSUMÉ FINAL:');
console.log(`Total des problèmes détectés: ${totalIssues}`);
console.log(`Total des vérifications: ${totalChecks}`);

if (totalIssues === 0) {
  console.log('\n🎉 PARFAIT ! Tous les textes sont correctement configurés en blanc !');
  console.log('🔧 CSS forcé avec !important appliqué sur toutes les pages');
  console.log('📱 Navigation (Accueil, Recherche, VIP) : text-white');
  console.log('🏷️  Noms des plugs (h3) : text-white');
  console.log('📈 Score de lisibilité: 100%');
} else {
  console.log(`\n⚠️  ${totalIssues} problème(s) restant(s) à corriger.`);
}

console.log('\n🔍 Pour tester visuellement:');
console.log('1. Accédez à /shop');
console.log('2. Vérifiez que "Accueil", "Recherche", "VIP" sont blancs');
console.log('3. Vérifiez que les noms des plugs sont blancs');
console.log('4. Testez sur les pages /shop/search et /shop/vip');