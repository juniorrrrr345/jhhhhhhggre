// Script pour maintenir l'API Render éveillée
const axios = require('axios');

const API_URL = process.env.RENDER_URL || 'https://safepluglink-6hzr.onrender.com';

async function keepAlive() {
  try {
    console.log('🏃 Ping keep-alive vers:', API_URL);
    const response = await axios.get(`${API_URL}/health`, {
      timeout: 30000 // 30 secondes de timeout
    });
    console.log('✅ Keep-alive réussi:', response.status);
  } catch (error) {
    console.error('❌ Erreur keep-alive:', error.message);
  }
}

// Ping toutes les 12 minutes (avant les 15 min de timeout)
setInterval(keepAlive, 12 * 60 * 1000);

// Premier ping immédiat
keepAlive();

console.log('🔄 Service keep-alive démarré (ping toutes les 12 minutes)');