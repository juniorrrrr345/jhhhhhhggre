const fs = require('fs');
const path = require('path');

console.log('🧹 Nettoyage des fichiers de build...');

// Répertoires et fichiers à nettoyer
const pathsToClean = [
  'admin-panel/.next',
  'admin-panel/pages/api/config.ts',
  'admin-panel/pages/api/products.ts',
  'admin-panel/pages/api/socket.ts',
  'admin-panel/app/api/config',
  'admin-panel/app/api/products', 
  'admin-panel/app/api/socket',
  '.next',
  'node_modules/.cache'
];

pathsToClean.forEach(relativePath => {
  const fullPath = path.join(process.cwd(), relativePath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`🗑️ Suppression de ${relativePath}`);
    try {
      if (fs.lstatSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
      console.log(`✅ ${relativePath} supprimé`);
    } catch (error) {
      console.log(`⚠️ Impossible de supprimer ${relativePath}:`, error.message);
    }
  } else {
    console.log(`ℹ️ ${relativePath} n'existe pas`);
  }
});

console.log('✅ Nettoyage terminé');