require('dotenv').config();
const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8049816368:AAHyroX2rkSFeT3HEMesn_qgqD6nFCYxciY';
const WEBHOOK_URL = 'https://safepluglink-6hzr.onrender.com';

async function fixWebhook() {
  console.log('🔧 Correction du webhook Telegram...\n');
  
  try {
    // 1. D'abord supprimer l'ancien webhook
    console.log('1️⃣ Suppression de l\'ancien webhook...');
    const deleteResponse = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
    console.log('✅ Webhook supprimé:', deleteResponse.data);
    
    // 2. Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Configurer le nouveau webhook avec la bonne URL
    const webhookUrl = `${WEBHOOK_URL}/webhook/${BOT_TOKEN}`;
    console.log('\n2️⃣ Configuration du nouveau webhook...');
    console.log('URL:', webhookUrl);
    
    const setResponse = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      url: webhookUrl,
      allowed_updates: ['message', 'callback_query', 'inline_query', 'chosen_inline_result'],
      drop_pending_updates: false,
      max_connections: 100
    });
    
    console.log('✅ Webhook configuré:', setResponse.data);
    
    // 4. Vérifier la configuration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n3️⃣ Vérification de la configuration...');
    const infoResponse = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const info = infoResponse.data.result;
    
    console.log('\n📋 État du webhook:');
    console.log('- URL:', info.url);
    console.log('- Certificat SSL:', info.has_custom_certificate ? 'Personnalisé' : 'Par défaut ✅');
    console.log('- Updates en attente:', info.pending_update_count || 0);
    console.log('- Dernière erreur:', info.last_error_message || 'Aucune ✅');
    console.log('- IP autorisées:', info.ip_address || 'Toutes');
    console.log('- Max connexions:', info.max_connections || 40);
    
    if (info.url === webhookUrl && !info.last_error_message) {
      console.log('\n✅ Webhook configuré avec succès!');
      console.log('🎉 Le bot devrait maintenant répondre aux commandes /start');
    } else {
      console.log('\n⚠️ Il y a peut-être encore un problème');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    if (error.response) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter immédiatement
fixWebhook();