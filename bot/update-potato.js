// Script pour mettre à jour l'emoji Potato vers 🏴‍☠️
const https = require('https');

const updatePotatoEmoji = () => {
  console.log('🔧 Mise à jour emoji Potato vers 🏴‍☠️...');
  
  // Données à envoyer
  const postData = JSON.stringify({
    action: 'update_potato_emoji',
    emoji: '🏴‍☠️'
  });
  
  // Options de la requête
  const options = {
    hostname: 'jhhhhhhggre.onrender.com',
    port: 443,
    path: '/api/config',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Authorization': 'Bearer JuniorAdmon123'
    }
  };
  
  // Créer la requête
  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Réponse:', data);
      console.log('🏴‍☠️ Emoji Potato mis à jour !');
    });
  });
  
  req.on('error', (e) => {
    console.error('❌ Erreur:', e.message);
  });
  
  // Envoyer les données
  req.write(postData);
  req.end();
};

// Exécuter la mise à jour
updatePotatoEmoji();