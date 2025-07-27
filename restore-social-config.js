// Script pour restaurer la configuration des réseaux sociaux
const https = require('https');

const BOT_API_URL = 'https://jhhhhhhggre.onrender.com';
const ADMIN_TOKEN = 'JuniorAdmon123';

// Configuration des réseaux sociaux que vous aviez
const socialMediaConfig = {
  socialMedia: [
    {
      name: 'Telegram',
      emoji: '📱',
      url: 'https://t.me/+zcP68c4M_3NlM2Y0',
      order: 1
    },
    {
      name: 'Contact',
      emoji: '📞', 
      url: 'https://t.me/findyourplugsav',
      order: 2
    }
  ],
  socialMediaList: [
    {
      name: 'Telegram',
      emoji: '📱',
      url: 'https://t.me/+zcP68c4M_3NlM2Y0',
      enabled: true,
      order: 1
    },
    {
      name: 'Contact',
      emoji: '📞',
      url: 'https://t.me/findyourplugsav', 
      enabled: true,
      order: 2
    }
  ]
};

// Fonction pour envoyer la configuration
const updateConfig = () => {
  const data = JSON.stringify(socialMediaConfig);
  
  const options = {
    hostname: 'jhhhhhhggre.onrender.com',
    port: 443,
    path: '/api/admin/config',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': `Bearer ${ADMIN_TOKEN}`
    }
  };

  const req = https.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Configuration des réseaux sociaux restaurée !');
        console.log('📱 Réseaux configurés:');
        socialMediaConfig.socialMedia.forEach((social, i) => {
          console.log(`  ${i+1}. ${social.emoji} ${social.name}: ${social.url}`);
        });
        console.log('\n🎯 Testez maintenant le bouton "📱 Réseaux Sociaux" sur votre bot !');
      } else {
        console.error('❌ Erreur HTTP:', res.statusCode);
        console.error('Réponse:', responseData);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Erreur de connexion:', err.message);
  });

  req.write(data);
  req.end();
};

console.log('🔄 Restauration de la configuration des réseaux sociaux...');
console.log('🎯 URL Bot:', BOT_API_URL);
updateConfig();