const axios = require('axios');

// Token utilisé sur Render (d'après les logs)
const BOT_TOKEN = '8049816368:AAHyroX2rkSFeT3HEMesn_qgqD6nFCYxciY';
const WEBHOOK_URL = 'https://safepluglink-6hzr.onrender.com';

async function fixRenderWebhook() {
  console.log('🔧 Correction du webhook pour Render...\n');
  console.log('Token:', BOT_TOKEN.substring(0, 10) + '...');
  console.log('URL de base:', WEBHOOK_URL);
  
  try {
    // 1. Supprimer l'ancien webhook
    console.log('\n1️⃣ Suppression de l\'ancien webhook...');
    const deleteResponse = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`, {
      params: { drop_pending_updates: true }
    });
    console.log('Résultat:', deleteResponse.data);
    
    // 2. Attendre
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Configurer le nouveau webhook
    const webhookUrl = `${WEBHOOK_URL}/webhook/${BOT_TOKEN}`;
    console.log('\n2️⃣ Configuration du nouveau webhook...');
    console.log('URL complète:', webhookUrl);
    
    const setResponse = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      url: webhookUrl,
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: false
    });
    
    console.log('Résultat:', setResponse.data);
    
    // 4. Vérifier
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n3️⃣ Vérification finale...');
    const infoResponse = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const info = infoResponse.data.result;
    
    console.log('\n📋 Configuration actuelle:');
    console.log('- URL configurée:', info.url);
    console.log('- Correspond à notre URL:', info.url === webhookUrl ? '✅ OUI' : '❌ NON');
    console.log('- Dernière erreur:', info.last_error_message || '✅ Aucune');
    console.log('- Updates en attente:', info.pending_update_count || 0);
    
    if (info.url === webhookUrl && !info.last_error_message) {
      console.log('\n✅ SUCCÈS! Le webhook est correctement configuré.');
      console.log('📱 Testez maintenant avec /start sur Telegram!');
    } else {
      console.log('\n⚠️ Attention: La configuration peut nécessiter un redémarrage du service sur Render.');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    if (error.response) {
      console.error('Statut:', error.response.status);
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter
fixRenderWebhook().then(() => {
  console.log('\n💡 Si le bot ne répond toujours pas:');
  console.log('1. Vérifiez que le service est bien démarré sur Render');
  console.log('2. Regardez les logs sur Render pour voir si les webhooks arrivent');
  console.log('3. Assurez-vous que WEBHOOK_URL est défini à: https://safepluglink-6hzr.onrender.com');
  console.log('4. Redémarrez le service sur Render si nécessaire');
});