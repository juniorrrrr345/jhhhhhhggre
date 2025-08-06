require('dotenv').config();
const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://safepluglink-6hzr.onrender.com';

// Nettoyer l'URL
const cleanUrl = WEBHOOK_URL.endsWith('/') ? WEBHOOK_URL.slice(0, -1) : WEBHOOK_URL;
const fullWebhookUrl = `${cleanUrl}/webhook/${BOT_TOKEN}`;

async function checkWebhook() {
  try {
    console.log('🔍 Vérification du webhook actuel...');
    
    // Obtenir les infos du webhook
    const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const webhookInfo = response.data.result;
    
    console.log('\n📋 Informations du webhook:');
    console.log('URL actuelle:', webhookInfo.url || 'Aucune');
    console.log('Dernière erreur:', webhookInfo.last_error_message || 'Aucune');
    console.log('Dernière erreur date:', webhookInfo.last_error_date ? new Date(webhookInfo.last_error_date * 1000) : 'N/A');
    console.log('Updates en attente:', webhookInfo.pending_update_count || 0);
    console.log('Certificat SSL valide:', webhookInfo.has_custom_certificate ? 'Personnalisé' : 'Par défaut');
    
    return webhookInfo;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    return null;
  }
}

async function deleteWebhook() {
  try {
    console.log('\n🗑️ Suppression du webhook...');
    const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
    
    if (response.data.ok) {
      console.log('✅ Webhook supprimé avec succès');
      return true;
    } else {
      console.error('❌ Erreur:', response.data.description);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error.message);
    return false;
  }
}

async function setWebhook() {
  try {
    console.log('\n🔧 Configuration du nouveau webhook...');
    console.log('URL:', fullWebhookUrl);
    
    const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      url: fullWebhookUrl,
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: false
    });
    
    if (response.data.ok) {
      console.log('✅ Webhook configuré avec succès');
      return true;
    } else {
      console.error('❌ Erreur:', response.data.description);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    return false;
  }
}

async function testWebhook() {
  try {
    console.log('\n🧪 Test du webhook...');
    console.log('Envoi d\'une requête de test à:', fullWebhookUrl);
    
    // Envoyer une requête de test
    const testPayload = {
      update_id: 999999999,
      message: {
        message_id: 1,
        date: Math.floor(Date.now() / 1000),
        chat: {
          id: 123456789,
          type: 'private'
        },
        from: {
          id: 123456789,
          is_bot: false,
          first_name: 'Test'
        },
        text: '/test_webhook'
      }
    };
    
    const response = await axios.post(fullWebhookUrl, testPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Réponse du serveur:', response.status, response.statusText);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('Statut:', error.response.status);
      console.error('Données:', error.response.data);
    }
    return false;
  }
}

async function main() {
  console.log('🤖 Debug du Webhook Telegram Bot');
  console.log('================================\n');
  
  // 1. Vérifier le webhook actuel
  const currentWebhook = await checkWebhook();
  
  // 2. Si l'URL est incorrecte ou s'il y a des erreurs, réinitialiser
  if (!currentWebhook || currentWebhook.url !== fullWebhookUrl || currentWebhook.last_error_message) {
    console.log('\n⚠️ Le webhook doit être reconfiguré');
    
    // Supprimer l'ancien
    await deleteWebhook();
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Configurer le nouveau
    await setWebhook();
    
    // Vérifier à nouveau
    await new Promise(resolve => setTimeout(resolve, 2000));
    await checkWebhook();
  } else {
    console.log('\n✅ Le webhook est correctement configuré');
  }
  
  // 3. Tester le webhook
  console.log('\n📝 Voulez-vous tester le webhook? (Cela enverra une fausse requête)');
  console.log('Si oui, décommentez la ligne suivante:');
  console.log('// await testWebhook();');
}

// Exécuter
main().catch(console.error);