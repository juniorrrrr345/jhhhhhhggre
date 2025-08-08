const https = require('https');
const http = require('http');

console.log('🔍 Test de connexion au bot Render\n');

const botUrl = 'https://safepluglink-6hzr.onrender.com';

// Test 1: Health check
console.log('1️⃣ Test Health Check...');
https.get(`${botUrl}/health`, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Headers:`, res.headers);
    console.log(`   Response: ${data.substring(0, 200)}`);
    console.log('');
    
    // Test 2: API Config
    testApiConfig();
  });
}).on('error', (err) => {
  console.error('   ❌ Erreur:', err.message);
  testApiConfig();
});

function testApiConfig() {
  console.log('2️⃣ Test API Config...');
  
  const options = {
    hostname: 'safepluglink-6hzr.onrender.com',
    path: '/api/config',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer JuniorAdmon123',
      'Content-Type': 'application/json'
    }
  };
  
  https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Content-Type: ${res.headers['content-type']}`);
      
      if (res.headers['content-type']?.includes('text/html')) {
        console.log('   ⚠️  Réponse HTML détectée (au lieu de JSON)');
        console.log(`   HTML: ${data.substring(0, 500)}...`);
      } else {
        try {
          const json = JSON.parse(data);
          console.log('   ✅ Réponse JSON valide');
          console.log(`   Data:`, JSON.stringify(json, null, 2).substring(0, 200));
        } catch (e) {
          console.log('   ❌ Erreur parsing JSON:', e.message);
          console.log(`   Raw data: ${data.substring(0, 200)}`);
        }
      }
      console.log('');
      
      // Test 3: Public API
      testPublicApi();
    });
  }).on('error', (err) => {
    console.error('   ❌ Erreur:', err.message);
    testPublicApi();
  }).end();
}

function testPublicApi() {
  console.log('3️⃣ Test API Publique (plugs)...');
  
  https.get(`${botUrl}/api/public/plugs?limit=1`, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Content-Type: ${res.headers['content-type']}`);
      
      if (res.headers['content-type']?.includes('text/html')) {
        console.log('   ⚠️  Réponse HTML détectée');
        const title = data.match(/<title>(.*?)<\/title>/);
        const h1 = data.match(/<h1>(.*?)<\/h1>/);
        if (title) console.log(`   Title: ${title[1]}`);
        if (h1) console.log(`   H1: ${h1[1]}`);
        console.log(`   HTML Preview: ${data.substring(0, 300)}...`);
      } else {
        try {
          const json = JSON.parse(data);
          console.log('   ✅ Réponse JSON valide');
          console.log(`   Nombre de plugs: ${json.plugs?.length || 0}`);
        } catch (e) {
          console.log('   ❌ Erreur parsing JSON:', e.message);
        }
      }
      console.log('');
      
      // Test 4: Vercel Proxy
      testVercelProxy();
    });
  }).on('error', (err) => {
    console.error('   ❌ Erreur:', err.message);
    testVercelProxy();
  });
}

function testVercelProxy() {
  console.log('4️⃣ Test Proxy Vercel...');
  console.log('   ⚠️  Ce test nécessite que le panel soit déployé sur Vercel');
  console.log('');
  
  console.log('📊 Résumé:');
  console.log('- URL du bot:', botUrl);
  console.log('- Si vous voyez des réponses HTML, le bot peut être:');
  console.log('  1. En maintenance sur Render');
  console.log('  2. Pas encore démarré (service gratuit en sommeil)');
  console.log('  3. Mal configuré');
  console.log('');
  console.log('💡 Solutions possibles:');
  console.log('1. Attendez 1-2 minutes que le bot se réveille');
  console.log('2. Vérifiez les logs sur Render.com');
  console.log('3. Redéployez le bot si nécessaire');
}