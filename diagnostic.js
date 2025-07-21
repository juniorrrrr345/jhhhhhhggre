const axios = require('axios');

const API_URL = process.env.API_URL || 'https://jhhhhhhggre.onrender.com';
const ADMIN_URL = process.env.ADMIN_URL || 'https://safeplugslink.vercel.app';

async function checkBotHealth() {
  try {
    console.log('🔍 Vérification de l\'état du bot...');
    
    // Test de santé général
    const healthResponse = await axios.get(`${API_URL}/health`, { timeout: 10000 });
    console.log('✅ Bot API santé:', healthResponse.data.status);
    
    // Test de diagnostic détaillé
    const diagnosticResponse = await axios.get(`${API_URL}/api/bot/diagnostic`, { timeout: 15000 });
    console.log('📊 Diagnostic bot:', JSON.stringify(diagnosticResponse.data, null, 2));
    
    // Test de configuration publique
    const configResponse = await axios.get(`${API_URL}/api/public/config`, { timeout: 10000 });
    console.log('⚙️ Configuration publique disponible:', !!configResponse.data);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur vérification bot:', error.message);
    return false;
  }
}

async function checkAdminPanel() {
  try {
    console.log('🔍 Vérification du panel admin...');
    
    // Test de santé du panel admin
    const adminResponse = await axios.get(`${ADMIN_URL}/api/health`, { timeout: 10000 });
    console.log('✅ Admin panel santé:', adminResponse.status === 200 ? 'OK' : 'KO');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur vérification admin panel:', error.message);
    return false;
  }
}

async function runDiagnostic() {
  console.log('🩺 === DIAGNOSTIC SYSTÈME ===');
  console.log(`🌐 API Bot: ${API_URL}`);
  console.log(`🔧 Admin Panel: ${ADMIN_URL}`);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('=====================================\n');
  
  const botOk = await checkBotHealth();
  console.log('');
  const adminOk = await checkAdminPanel();
  
  console.log('\n=====================================');
  console.log('📋 RÉSUMÉ:');
  console.log(`🤖 Bot: ${botOk ? '✅ OK' : '❌ PROBLÈME'}`);
  console.log(`🔧 Admin: ${adminOk ? '✅ OK' : '❌ PROBLÈME'}`);
  
  if (botOk && adminOk) {
    console.log('🎉 Système opérationnel !');
  } else {
    console.log('⚠️ Des problèmes ont été détectés.');
    
    if (!botOk) {
      console.log('💡 Solutions pour le bot:');
      console.log('   1. Vérifiez que le serveur Render est démarré');
      console.log('   2. Vérifiez la configuration MongoDB');
      console.log('   3. Vérifiez le token Telegram');
    }
    
    if (!adminOk) {
      console.log('💡 Solutions pour l\'admin:');
      console.log('   1. Vérifiez que Vercel est déployé');
      console.log('   2. Vérifiez la configuration du proxy');
    }
  }
  
  console.log('=====================================');
}

// Executer le diagnostic si appelé directement
if (require.main === module) {
  runDiagnostic().catch(console.error);
}

module.exports = { runDiagnostic, checkBotHealth, checkAdminPanel };