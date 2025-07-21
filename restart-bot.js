const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const API_URL = process.env.API_URL || 'https://jhhhhhhggre.onrender.com';

async function restartBot() {
  console.log('🔄 === REDÉMARRAGE DU BOT ===');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('=====================================\n');
  
  try {
    // 1. Vérifier l'état actuel
    console.log('1️⃣ Vérification de l\'état actuel...');
    try {
      const healthResponse = await axios.get(`${API_URL}/health`, { timeout: 5000 });
      console.log('✅ Bot actuellement en ligne:', healthResponse.data.status);
    } catch (error) {
      console.log('⚠️ Bot actuellement hors ligne ou inaccessible');
    }
    
    // 2. Recharger la configuration
    console.log('\n2️⃣ Rechargement de la configuration...');
    try {
      const reloadResponse = await axios.post(`${API_URL}/api/bot/reload`, {}, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${process.env.ADMIN_PASSWORD || 'JuniorAdmon123'}`
        }
      });
      console.log('✅ Configuration rechargée:', reloadResponse.data.message);
    } catch (error) {
      console.log('⚠️ Impossible de recharger la configuration:', error.message);
    }
    
    // 3. Test des commandes du bot
    console.log('\n3️⃣ Test des fonctionnalités...');
    try {
      const diagnosticResponse = await axios.get(`${API_URL}/api/bot/diagnostic`, { timeout: 10000 });
      const diagnostic = diagnosticResponse.data;
      
      console.log(`🤖 Bot connecté: ${diagnostic.bot.connected ? '✅' : '❌'}`);
      console.log(`📊 Base de données: ${diagnostic.database.status === 'connected' ? '✅' : '❌'}`);
      console.log(`⚙️ Configuration: ${diagnostic.database.configExists ? '✅' : '❌'}`);
      
      if (diagnostic.bot.connected && diagnostic.database.status === 'connected' && diagnostic.database.configExists) {
        console.log('\n🎉 Bot opérationnel !');
        console.log(`📱 Nom du bot: ${diagnostic.bot.info.username}`);
        console.log(`🆔 ID du bot: ${diagnostic.bot.info.id}`);
        console.log(`⏱️ Temps de fonctionnement: ${Math.round(diagnostic.environment.uptime)} secondes`);
      } else {
        console.log('\n⚠️ Problèmes détectés dans le diagnostic');
      }
      
    } catch (error) {
      console.log('❌ Impossible d\'effectuer le diagnostic:', error.message);
    }
    
    console.log('\n=====================================');
    console.log('✅ Processus de redémarrage terminé');
    console.log('💡 Le bot devrait maintenant répondre aux commandes /start');
    console.log('=====================================');
    
  } catch (error) {
    console.error('\n❌ Erreur lors du redémarrage:', error.message);
    console.log('\n💡 Solutions possibles:');
    console.log('   1. Vérifiez que le serveur Render est en ligne');
    console.log('   2. Vérifiez les variables d\'environnement');
    console.log('   3. Contactez l\'administrateur système');
  }
}

// Instructions d'utilisation
function showUsage() {
  console.log('🔧 === UTILISATION ===');
  console.log('node restart-bot.js          - Redémarrer le bot');
  console.log('npm run restart              - Alias pour le redémarrage');
  console.log('');
  console.log('Variables d\'environnement requises:');
  console.log('- API_URL: URL de l\'API du bot (défaut: https://jhhhhhhggre.onrender.com)');
  console.log('- ADMIN_PASSWORD: Mot de passe admin (défaut: JuniorAdmon123)');
}

// Executer le redémarrage si appelé directement
if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showUsage();
  } else {
    restartBot().catch(console.error);
  }
}

module.exports = { restartBot };