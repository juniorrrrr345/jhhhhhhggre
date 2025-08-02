const fs = require('fs');

// Configuration
const API_URL = 'https://jhhhhhhggre.onrender.com';
const ADMIN_TOKEN = 'ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1'; // Token admin

async function backupData() {
  console.log('🔄 Sauvegarde des données depuis Render...\n');
  
  const backup = {
    date: new Date().toISOString(),
    source: 'Render API',
    data: {}
  };
  
  try {
    // 1. Récupérer toutes les boutiques
    console.log('📦 Récupération des boutiques...');
    const plugsResponse = await fetch(`${API_URL}/api/public/plugs?limit=1000`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!plugsResponse.ok) {
      throw new Error(`Erreur API: ${plugsResponse.status}`);
    }
    
    const plugsData = await plugsResponse.json();
    backup.data.plugs = plugsData.plugs || [];
    console.log(`✅ ${backup.data.plugs.length} boutiques sauvegardées`);
    
    // 2. Récupérer la configuration
    console.log('\n⚙️ Récupération de la configuration...');
    const configResponse = await fetch(`${API_URL}/api/public/config`);
    const configData = await configResponse.json();
    backup.data.config = configData;
    console.log('✅ Configuration sauvegardée');
    
    // 3. Sauvegarder dans un fichier
    const filename = `backup-render-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(backup, null, 2));
    
    console.log(`\n✅ Sauvegarde complète dans: ${filename}`);
    console.log('\n📊 Résumé:');
    console.log(`   - Boutiques: ${backup.data.plugs.length}`);
    console.log(`   - Configuration: ✓`);
    console.log(`   - Taille du fichier: ${(fs.statSync(filename).size / 1024).toFixed(2)} KB`);
    
    // Afficher quelques boutiques
    if (backup.data.plugs.length > 0) {
      console.log('\n📋 Aperçu des boutiques:');
      backup.data.plugs.slice(0, 5).forEach((plug, i) => {
        console.log(`   ${i + 1}. ${plug.name} (${plug.isVip ? 'VIP' : 'Standard'}) - ${plug.likes || 0} likes`);
      });
      if (backup.data.plugs.length > 5) {
        console.log(`   ... et ${backup.data.plugs.length - 5} autres`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Lancer la sauvegarde
backupData();