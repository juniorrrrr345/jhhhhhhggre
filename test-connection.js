// Test de connexion au serveur distant
const https = require('https');

const testConnection = () => {
  console.log('🧪 Test de connexion à https://safepluglink-6hzr.onrender.com');
  
  const req = https.get('https://safepluglink-6hzr.onrender.com/health', (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('✅ Serveur accessible!');
      console.log('📊 Réponse:', data);
      
      // Test d'authentification
      console.log('\n🔐 Test d\'authentification...');
      testAuth();
    });
  });
  
  req.on('error', (err) => {
    console.error('❌ Erreur de connexion:', err.message);
  });
};

const testAuth = () => {
  const https = require('https');
  const postData = '';
  
  const options = {
    hostname: 'jhhhhhhggre.onrender.com',
    port: 443,
    path: '/api/config',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer JuniorAdmon123',
      'Content-Type': 'application/json'
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Authentification réussie!');
        console.log('📋 Configuration récupérée (premieres lignes):');
        console.log(data.substring(0, 200) + '...');
      } else {
        console.log('❌ Échec authentification, statut:', res.statusCode);
        console.log('📄 Réponse:', data);
      }
    });
  });
  
  req.on('error', (err) => {
    console.error('❌ Erreur authentification:', err.message);
  });
  
  req.end();
};

// Lancement du test
testConnection();