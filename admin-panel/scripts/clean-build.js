const fs = require('fs');
const path = require('path');

console.log('🧹 Nettoyage des fichiers de build...');

// Fichiers à supprimer s'ils existent
const conflictingFiles = [
  'pages/api/config.ts',
  'pages/api/products.ts', 
  'pages/api/socket.ts',
  '.next',
  'node_modules/.cache'
];

conflictingFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`🗑️ Suppression de ${filePath}`);
    try {
      if (fs.lstatSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
      console.log(`✅ ${filePath} supprimé`);
    } catch (error) {
      console.log(`⚠️ Impossible de supprimer ${filePath}:`, error.message);
    }
  } else {
    console.log(`ℹ️ ${filePath} n'existe pas`);
  }
});

console.log('✅ Nettoyage terminé');