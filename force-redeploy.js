// Script pour forcer le redéploiement sur Render avec le nouveau commit
const https = require('https');

const deployHookUrl = process.env.RENDER_DEPLOY_HOOK || 'https://api.render.com/deploy/srv-cub2kh9jbvhs73b2drs0?key=gQ8Hyr0sdjY';
const commitSha = '5b77675'; // Notre nouveau commit avec les réseaux sociaux

console.log('🚀 Forçage du redéploiement sur Render...');
console.log(`📦 Commit: ${commitSha}`);
console.log(`🔗 Webhook: ${deployHookUrl}`);

const url = `${deployHookUrl}&ref=${commitSha}`;

const options = {
  method: 'POST'
};

const req = https.request(url, options, (res) => {
  console.log(`📡 Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Redéploiement déclenché avec succès !');
      console.log('⏳ Le bot va redémarrer avec les nouvelles fonctionnalités dans ~2-3 minutes');
    } else {
      console.log('❌ Erreur lors du redéploiement:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erreur de connexion:', error.message);
});

req.end();