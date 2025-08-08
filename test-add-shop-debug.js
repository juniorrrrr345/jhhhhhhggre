const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAddShop() {
  console.log('🔍 Test d\'ajout de boutique - Débogage complet\n');
  
  const VERCEL_URL = 'https://sfeplugslink.vercel.app';
  const API_URL = 'https://safepluglink-6hzr.onrender.com';
  const TOKEN = 'JuniorAdmon123';
  
  // 1. Tester le CORS proxy
  console.log('1️⃣ Test du CORS proxy...');
  try {
    const corsResponse = await fetch(`${VERCEL_URL}/api/cors-proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: '/api/health',
        method: 'GET',
        token: TOKEN
      })
    });
    const corsData = await corsResponse.json();
    console.log('✅ CORS proxy:', corsResponse.status, corsData);
  } catch (error) {
    console.error('❌ Erreur CORS proxy:', error.message);
  }
  
  // 2. Tester la récupération des codes postaux pour la France
  console.log('\n2️⃣ Test récupération codes postaux France...');
  try {
    const postalResponse = await fetch(`${VERCEL_URL}/api/cors-proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: '/api/postal-codes/France',
        method: 'GET',
        token: TOKEN
      })
    });
    const postalData = await postalResponse.json();
    console.log('✅ Codes postaux France:', postalResponse.status);
    console.log('   Nombre de codes:', postalData.codes ? postalData.codes.length : 0);
    console.log('   Premiers codes:', postalData.codes ? postalData.codes.slice(0, 5) : 'Aucun');
  } catch (error) {
    console.error('❌ Erreur codes postaux:', error.message);
  }
  
  // 3. Tester l'ajout d'une boutique simple
  console.log('\n3️⃣ Test ajout boutique simple...');
  const testShop = {
    name: `Test Debug ${Date.now()}`,
    image: '',
    telegramLink: '',
    countries: ['France'],
    isActive: true,
    isVip: false,
    vipOrder: 1,
    services: {
      delivery: {
        enabled: true,
        description: 'Test livraison',
        departments: ['75001', '75002'] // Codes postaux réels de Paris
      },
      postal: {
        enabled: false,
        description: '',
        countries: []
      },
      meetup: {
        enabled: false,
        description: '',
        departments: []
      }
    },
    contact: {
      telegram: '@testdebug'
    },
    socialMedia: []
  };
  
  try {
    console.log('📤 Envoi des données:', JSON.stringify(testShop, null, 2));
    
    const addResponse = await fetch(`${VERCEL_URL}/api/cors-proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: '/api/plugs',
        method: 'POST',
        token: TOKEN,
        data: testShop
      })
    });
    
    const responseText = await addResponse.text();
    console.log('📥 Réponse brute:', responseText);
    
    try {
      const addData = JSON.parse(responseText);
      console.log('✅ Ajout boutique:', addResponse.status);
      console.log('   ID créé:', addData._id || 'Aucun');
      console.log('   Nom:', addData.name || 'Aucun');
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError.message);
    }
  } catch (error) {
    console.error('❌ Erreur ajout boutique:', error.message);
  }
  
  // 4. Tester directement sur l'API Render
  console.log('\n4️⃣ Test direct sur API Render...');
  try {
    const directResponse = await fetch(`${API_URL}/api/plugs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify(testShop)
    });
    
    const directData = await directResponse.json();
    console.log('✅ Ajout direct:', directResponse.status);
    console.log('   ID créé:', directData._id || 'Aucun');
  } catch (error) {
    console.error('❌ Erreur ajout direct:', error.message);
  }
  
  // 5. Vérifier la liste des boutiques
  console.log('\n5️⃣ Vérification liste des boutiques...');
  try {
    const listResponse = await fetch(`${VERCEL_URL}/api/cors-proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: '/api/plugs',
        method: 'GET',
        token: TOKEN
      })
    });
    
    const listData = await listResponse.json();
    console.log('✅ Liste boutiques:', listResponse.status);
    console.log('   Nombre total:', listData.plugs ? listData.plugs.length : 0);
    
    if (listData.plugs && listData.plugs.length > 0) {
      const lastShop = listData.plugs[listData.plugs.length - 1];
      console.log('   Dernière boutique:', lastShop.name);
      console.log('   Créée le:', lastShop.createdAt);
    }
  } catch (error) {
    console.error('❌ Erreur liste boutiques:', error.message);
  }
}

// Exécuter le test
testAddShop().catch(console.error);