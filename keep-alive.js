const https = require('https');
const http = require('http');

// URL de votre service Render (remplacez par votre vraie URL)
const SERVICE_URL = process.env.RENDER_EXTERNAL_URL || 'https://votre-bot.onrender.com';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes (Render s'endort après 15 min)

console.log('🔄 Keep-Alive service démarré');
console.log(`📡 URL à ping: ${SERVICE_URL}`);
console.log(`⏰ Intervalle: ${PING_INTERVAL / 1000 / 60} minutes`);

function pingService() {
  const url = SERVICE_URL + '/health'; // Endpoint de santé
  const protocol = url.startsWith('https') ? https : http;
  
  const startTime = Date.now();
  
  protocol.get(url, (res) => {
    const duration = Date.now() - startTime;
    console.log(`✅ Ping réussi - Status: ${res.statusCode} - Durée: ${duration}ms - ${new Date().toLocaleTimeString()}`);
  }).on('error', (err) => {
    console.log(`❌ Erreur ping: ${err.message} - ${new Date().toLocaleTimeString()}`);
  });
}

// Ping immédiat au démarrage
pingService();

// Ping régulier
setInterval(pingService, PING_INTERVAL);

// Keep alive du processus
process.on('SIGINT', () => {
  console.log('🛑 Keep-Alive service arrêté');
  process.exit(0);
});

console.log('🚀 Keep-Alive actif - Le bot restera éveillé !');