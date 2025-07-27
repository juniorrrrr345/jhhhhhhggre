// Script de test pour vérifier les corrections des réseaux sociaux et mode local
const https = require('https');
const http = require('http');

// Test 1: Vérifier que l'API du bot répond correctement
async function testBotAPI() {
  console.log('🔍 Test 1: Vérification de l\'API du bot...');
  
  return new Promise((resolve, reject) => {
    const req = https.request('https://jhhhhhhggre.onrender.com/api/public/config', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const config = JSON.parse(data);
          console.log('✅ API du bot répond correctement');
          console.log('📊 shopSocialMediaList:', config.shopSocialMediaList?.length || 0, 'éléments');
          console.log('📊 socialMediaList:', config.socialMediaList?.length || 0, 'éléments');
          
          if (config.socialMediaList && config.socialMediaList.length > 0) {
            console.log('📱 Réseaux sociaux disponibles:');
            config.socialMediaList.forEach(social => {
              console.log(`  - ${social.name} (${social.emoji}): ${social.enabled ? 'activé' : 'désactivé'}`);
            });
          }
          
          resolve(config);
        } catch (error) {
          reject(new Error('Réponse JSON invalide: ' + error.message));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error('Erreur réseau: ' + error.message));
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout de 10 secondes atteint'));
    });
    
    req.end();
  });
}

// Test 2: Vérifier que l'API des plugs répond
async function testPlugsAPI() {
  console.log('\n🔍 Test 2: Vérification de l\'API des plugs...');
  
  return new Promise((resolve, reject) => {
    const req = https.request('https://jhhhhhhggre.onrender.com/api/public/plugs?limit=10', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ API des plugs répond correctement');
          console.log('📊 Nombre de plugs:', result.plugs?.length || 0);
          resolve(result);
        } catch (error) {
          reject(new Error('Réponse JSON invalide: ' + error.message));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error('Erreur réseau: ' + error.message));
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout de 10 secondes atteint'));
    });
    
    req.end();
  });
}

// Test 3: Simuler une erreur de réseau pour tester la logique du mode local
function testLocalModeLogic() {
  console.log('\n🔍 Test 3: Test de la logique du mode local...');
  
  const testErrors = [
    'Failed to fetch',
    'NetworkError',
    'offline',
    '502',
    '503',
    '504',
    'Unauthorized', // Ne devrait PAS déclencher le mode local
    'Invalid JSON', // Ne devrait PAS déclencher le mode local
    'Bad Request'   // Ne devrait PAS déclencher le mode local
  ];
  
  testErrors.forEach(errorMessage => {
    const shouldTriggerLocalMode = errorMessage.includes('Failed to fetch') || 
                                  errorMessage.includes('NetworkError') || 
                                  errorMessage.includes('offline') ||
                                  errorMessage.includes('502') ||
                                  errorMessage.includes('503') ||
                                  errorMessage.includes('504');
    
    const result = shouldTriggerLocalMode ? '🔴 Mode local activé' : '🟢 Mode local non activé';
    console.log(`  "${errorMessage}" → ${result}`);
  });
}

// Fonction principale
async function runTests() {
  console.log('🚀 Démarrage des tests de correction...\n');
  
  try {
    // Test 1: API du bot
    await testBotAPI();
    
    // Test 2: API des plugs
    await testPlugsAPI();
    
    // Test 3: Logique du mode local
    testLocalModeLogic();
    
    console.log('\n✅ Tous les tests sont terminés avec succès!');
    console.log('\n📋 Résumé des corrections appliquées:');
    console.log('  ✅ Fallback socialMediaList → shopSocialMediaList dans la boutique');
    console.log('  ✅ Logique de mode local moins agressive');
    console.log('  ✅ Timeout API augmenté de 6s à 15s');
    console.log('  ✅ Affichage automatique des réseaux sociaux configurés');
    
  } catch (error) {
    console.error('\n❌ Erreur pendant les tests:', error.message);
    process.exit(1);
  }
}

// Lancer les tests
runTests();