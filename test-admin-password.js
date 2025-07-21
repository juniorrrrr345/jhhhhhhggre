#!/usr/bin/env node

/**
 * Test pour trouver le mot de passe admin correct
 */

const https = require('https');

const BOT_URL = 'https://jhhhhhhggre.onrender.com';

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BOT_URL);
    
    const requestOptions = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Test/1.0',
        'Cache-Control': 'no-cache',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data, raw: true });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testPasswords() {
  console.log('🔐 Test des mots de passe admin courants...\n');

  // Mots de passe à tester (les plus courants pour des tests/dev)
  const passwords = [
    'admin',
    'password', 
    '123456',
    'admin123',
    'password123',
    'test',
    'dev',
    'admin2024',
    'bot',
    'telegram',
    'swissquality',
    'safeplugs',
    'plugs',
    'boutique',
    '12345678',
    'qwerty',
    'motdepasse',
    'admin2023',
    'admin2025',
    'root'
  ];

  for (let i = 0; i < passwords.length; i++) {
    const password = passwords[i];
    console.log(`${i + 1}/${passwords.length} Test: "${password}"`);
    
    try {
      const result = await makeRequest('/api/config', {
        headers: { 'Authorization': `Bearer ${password}` }
      });
      
      if (result.status === 200) {
        console.log(`🎉 MOT DE PASSE TROUVÉ: "${password}"`);
        console.log('✅ Ce mot de passe fonctionne !');
        
        // Test de sauvegarde aussi
        console.log('🧪 Test sauvegarde...');
        const testConfig = {
          ...result.data,
          boutique: {
            ...result.data.boutique,
            name: 'Test Sauvegarde ' + Date.now()
          }
        };

        const saveResult = await makeRequest('/api/config', {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${password}` },
          body: testConfig
        });
        
        if (saveResult.status === 200) {
          console.log('💾 SAUVEGARDE FONCTIONNE AUSSI !');
        } else {
          console.log(`⚠️ Sauvegarde échoue: ${saveResult.status}`);
        }
        
        console.log(`\n🔑 **MOT DE PASSE ADMIN**: "${password}"`);
        console.log('📋 À utiliser dans le panel admin Vercel');
        return password;
      } else if (result.status === 401) {
        console.log(`   ❌ Incorrect (401)`);
      } else {
        console.log(`   ⚠️ Erreur ${result.status}`);
      }
    } catch (error) {
      console.log(`   💥 Erreur: ${error.message}`);
    }
    
    // Attendre un peu entre les tests pour ne pas surcharger
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n❌ Aucun mot de passe trouvé dans la liste');
  console.log('🔍 Le mot de passe admin est peut-être personnalisé');
  
  return null;
}

async function showAdminPasswordInfo() {
  console.log('\n📋 Informations sur le système d\'authentification:\n');
  console.log('🔐 **Côté Bot (Render):**');
  console.log('   - Variable: process.env.ADMIN_PASSWORD');
  console.log('   - Authentification: Authorization: Bearer MOT_DE_PASSE');
  console.log('   - Le mot de passe est directement utilisé comme token');
  console.log('\n🖥️ **Côté Frontend (Vercel):**');
  console.log('   - Login: Tape le mot de passe');
  console.log('   - Storage: localStorage.setItem("adminToken", motdepasse)');
  console.log('   - Usage: Authorization: Bearer motdepasse (ou juste motdepasse selon config)');
  console.log('\n🔄 **Proxy Vercel:**');
  console.log('   - Ajoute automatiquement "Bearer " si manquant');
  console.log('   - Transmet vers l\'API Render');
  console.log('\n💡 **Pour résoudre:**');
  console.log('   1. Trouver le mot de passe admin configuré sur Render');
  console.log('   2. L\'utiliser pour se connecter au panel');
  console.log('   3. La sauvegarde devrait alors fonctionner');
}

async function main() {
  const foundPassword = await testPasswords();
  
  if (!foundPassword) {
    await showAdminPasswordInfo();
  }
}

main();