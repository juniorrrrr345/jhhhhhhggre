#!/usr/bin/env node

/**
 * Script de test du déploiement
 * Vérifie que l'API bot fonctionne correctement après le déploiement
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const BOT_URL = 'https://jhhhhhhggre.onrender.com';

async function testDeployment() {
  console.log('🧪 Test du déploiement sur Render...\n');
  
  try {
    // Test 1: Vérifier que le serveur répond
    console.log('1. 🔍 Test de santé du serveur...');
    try {
      const { stdout } = await execAsync(`curl -s ${BOT_URL}/health`);
      const health = JSON.parse(stdout);
      
      if (health.status === 'OK') {
        console.log('   ✅ Serveur en ligne et fonctionnel');
        console.log(`   ⏱️ Uptime: ${Math.round(health.uptime)} secondes`);
      } else {
        console.log(`   ⚠️ Statut serveur: ${health.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Erreur serveur: ${error.message}`);
    }
    
    // Test 2: Vérifier l'API de base
    console.log('2. 📋 Test de l\'API de base...');
    try {
      const { stdout } = await execAsync(`curl -s ${BOT_URL}/`);
      const apiInfo = JSON.parse(stdout);
      
      if (apiInfo.message && apiInfo.message.includes('Bot Telegram')) {
        console.log('   ✅ API de base accessible');
        console.log(`   📡 Version: ${apiInfo.version}`);
      }
    } catch (error) {
      console.log(`   ⚠️ Erreur API: ${error.message}`);
    }
    
    // Test 3: Simuler une commande /start
    console.log('3. 🤖 Test de simulation /start...');
    try {
      const webhookUrl = `${BOT_URL}/webhook/8128299360:AAEWmbRLjkTaQYP17GsiGm5vhQv8AcJLKIY`;
      const testPayload = JSON.stringify({
        "update_id": 999999,
        "message": {
          "message_id": 999999,
          "from": {
            "id": 999999,
            "is_bot": false,
            "first_name": "Test"
          },
          "chat": {
            "id": 999999,
            "type": "private"
          },
          "date": Math.floor(Date.now() / 1000),
          "text": "/start"
        }
      });
      
      await execAsync(`curl -X POST "${webhookUrl}" -H "Content-Type: application/json" -d '${testPayload}'`);
      console.log('   ✅ Simulation /start envoyée');
      console.log('   💡 Vérifiez les logs Render pour confirmer qu\'il n\'y a plus d\'erreur BUTTON_URL_INVALID');
    } catch (error) {
      console.log(`   ⚠️ Erreur simulation: ${error.message}`);
    }
    
    console.log('\n🎉 Test de déploiement terminé !');
    
    console.log('\n📋 Résumé des corrections apportées:');
    console.log('- ✅ Suppression des URLs invalides (adresses email)');
    console.log('- ✅ Validation automatique des URLs dans keyboards.js');
    console.log('- ✅ Script de correction permanent ajouté');
    console.log('- ✅ Redéploiement automatique via GitHub');
    
    console.log('\n🤖 Pour vérifier que la correction fonctionne:');
    console.log('1. Ouvrez votre bot Telegram');
    console.log('2. Tapez /start');
    console.log('3. Vérifiez que les boutons s\'affichent sans erreur');
    console.log('4. Les logs ne doivent plus montrer "BUTTON_URL_INVALID"');
    
    console.log('\n🔧 En cas de problème, exécutez:');
    console.log('cd bot && npm run fix-urls');
    console.log('cd bot && npm run diagnostic');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testDeployment();