const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const VERCEL_URL = 'https://sfeplugslink.vercel.app';
const ADMIN_TOKEN = 'JuniorAdmon123';

async function testCorsProxy() {
  console.log('🧪 Test du proxy CORS sur Vercel...\n');
  
  try {
    const response = await fetch(`${VERCEL_URL}/api/cors-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: '/health',
        method: 'GET'
      })
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

async function testAddShopViaVercel() {
  console.log('\n🧪 Test d\'ajout de boutique via Vercel...\n');
  
  const shopData = {
    name: 'Test Vercel ' + Date.now(),
    image: '',
    countries: ['France'],
    isVip: false,
    isActive: true,
    services: {
      delivery: {
        enabled: true,
        description: 'Livraison test',
        departments: ['75']
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
      telegram: '@testvercel'
    },
    socialMedia: []
  };
  
  try {
    const response = await fetch(`${VERCEL_URL}/api/cors-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: '/api/plugs',
        method: 'POST',
        token: ADMIN_TOKEN,
        data: shopData
      })
    });
    
    console.log('Status:', response.status);
    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

async function main() {
  console.log('🚀 Test de l\'API Vercel\n');
  console.log('URL:', VERCEL_URL);
  
  await testCorsProxy();
  await testAddShopViaVercel();
}

main();