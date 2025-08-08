// Script pour vérifier les liens Telegram configurés

console.log('🔍 Vérification des liens Telegram configurés\n');

// Simuler localStorage pour voir ce qui est configuré
const fs = require('fs');

// Vérifier le fichier de config du bot
try {
  const botConfig = fs.readFileSync('./admin-panel/bot-buttons-config.json', 'utf8');
  console.log('📋 Configuration des boutons:');
  console.log(botConfig);
} catch (e) {
  console.log('❌ Pas de configuration de boutons trouvée');
}

console.log('\n💡 Pour configurer les liens:');
console.log('1. Allez dans le panel admin → Gestion des Liens Telegram');
console.log('2. Configurez:');
console.log('   - Lien inscription: https://t.me/votre_bot_ou_groupe');
console.log('   - Lien services: https://t.me/votre_bot_ou_groupe');
console.log('3. Cliquez sur Sauvegarder');
console.log('\n�� Les deux pages utiliseront les liens que vous avez configurés');
