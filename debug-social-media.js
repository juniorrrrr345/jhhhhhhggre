// Script de debug pour les réseaux sociaux
const https = require('https');

// Simuler la fonction cleanUrl du bot
function cleanUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  // Nettoyer l'URL
  url = url.trim();
  
  // Si c'est un username Telegram (@username), le convertir en URL
  if (url.startsWith('@')) {
    return `https://t.me/${url.substring(1)}`;
  }
  
  // Ajouter https:// si nécessaire
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  try {
    new URL(url);
    return url;
  } catch {
    return null;
  }
}

// Récupérer la config du bot
function getConfig() {
  return new Promise((resolve, reject) => {
    https.get('https://jhhhhhhggre.onrender.com/api/public/config', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Test des réseaux sociaux
async function testSocialMedia() {
  try {
    console.log('🔍 Récupération de la configuration...');
    const config = await getConfig();
    
    console.log('\n📱 Réseaux sociaux trouvés:');
    console.log(JSON.stringify(config.socialMedia, null, 2));
    
    if (config.socialMedia && Array.isArray(config.socialMedia) && config.socialMedia.length > 0) {
      console.log('\n🔄 Test de création des boutons...');
      
      const socialButtons = [];
      config.socialMedia.forEach((social, index) => {
        console.log(`\n--- Réseau ${index + 1}: ${social.name} ---`);
        console.log(`Nom: "${social.name}"`);
        console.log(`Emoji: "${social.emoji}"`);
        console.log(`URL brute: "${social.url}"`);
        
        if (social.name && social.url) {
          const cleanedUrl = cleanUrl(social.url);
          console.log(`URL nettoyée: "${cleanedUrl}"`);
          
          if (cleanedUrl) {
            const emoji = social.emoji || '🌐';
            const buttonText = `${emoji} ${social.name}`;
            console.log(`✅ Bouton créé: "${buttonText}" -> ${cleanedUrl}`);
            socialButtons.push({ text: buttonText, url: cleanedUrl });
          } else {
            console.log(`❌ URL invalide pour ${social.name}`);
          }
        } else {
          console.log(`❌ Données incomplètes pour ${social.name}`);
        }
      });
      
      console.log(`\n🎯 Total: ${socialButtons.length} bouton(s) valide(s)`);
      if (socialButtons.length > 0) {
        console.log('Boutons qui devraient apparaître:', socialButtons);
      }
      
    } else {
      console.log('❌ Aucun réseau social trouvé ou format invalide');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testSocialMedia();