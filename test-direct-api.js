#!/usr/bin/env node

/**
 * Test direct de l'API pour diagnostiquer le problème de sauvegarde
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
        'User-Agent': 'Direct-Test/1.0',
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

async function testApiDirectly() {
  console.log('🧪 Test direct API sans passer par Vercel...\n');

  try {
    // Test 1: GET config sans auth (doit échouer)
    console.log('1. 📋 Test GET config sans auth...');
    const noAuthResult = await makeRequest('/api/config');
    console.log(`   Status: ${noAuthResult.status}`);
    console.log(`   Response: ${JSON.stringify(noAuthResult.data).substring(0, 100)}...`);

    // Test 2: GET config avec mauvais token
    console.log('\n2. 🔑 Test GET config avec mauvais token...');
    const badTokenResult = await makeRequest('/api/config', {
      headers: { 'Authorization': 'Bearer fake-token' }
    });
    console.log(`   Status: ${badTokenResult.status}`);
    console.log(`   Response: ${JSON.stringify(badTokenResult.data).substring(0, 100)}...`);

    // Test 3: GET config avec token admin réel
    console.log('\n3. ✅ Test GET config avec token admin...');
    // Chercher le token dans la config
    const fs = require('fs');
    let adminToken = null;
    
    try {
      const configPath = require('path').join(__dirname, 'bot/config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        adminToken = config.adminToken;
      }
    } catch (e) {
      console.log('   ⚠️ Impossible de lire config.json local');
    }

    if (!adminToken) {
      console.log('   ⚠️ Token admin non trouvé, utilisation token de test');
      adminToken = 'test-admin-token';
    }

    const goodTokenResult = await makeRequest('/api/config', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`   Status: ${goodTokenResult.status}`);
    console.log(`   Has config data: ${!!goodTokenResult.data && typeof goodTokenResult.data === 'object'}`);

    if (goodTokenResult.status === 200) {
      console.log('   ✅ GET config fonctionne !');
      
      // Test 4: PUT config (sauvegarde)
      console.log('\n4. 💾 Test PUT config (sauvegarde)...');
      const testConfig = {
        ...goodTokenResult.data,
        boutique: {
          ...goodTokenResult.data.boutique,
          name: 'Test Boutique ' + Date.now()
        }
      };

      const saveResult = await makeRequest('/api/config', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: testConfig
      });
      
      console.log(`   Status: ${saveResult.status}`);
      console.log(`   Response: ${JSON.stringify(saveResult.data).substring(0, 200)}...`);
      
      if (saveResult.status === 200) {
        console.log('   ✅ PUT config fonctionne aussi !');
        console.log('\n🎉 L\'API fonctionne directement !');
        console.log('❓ Le problème vient donc du proxy Vercel ou de l\'authentification frontend');
      } else {
        console.log('   ❌ PUT config échoue');
        console.log('❓ Problème dans l\'API backend');
      }
    } else {
      console.log('   ❌ GET config échoue même avec token');
      console.log('❓ Problème d\'authentification ou API backend');
    }

  } catch (error) {
    console.error('❌ Erreur test API:', error.message);
  }
}

testApiDirectly();