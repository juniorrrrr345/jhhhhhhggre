// Utiliser le fetch natif de Node.js v18+

const API_BASE_URL = process.env.API_BASE_URL || 'https://jhhhhhhggre.onrender.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'JuniorAdmon123';

const testCorrections = async () => {
  console.log('🔧 Test des corrections apportées...\n');

  // Test 1: Vérifier la sauvegarde avec réseaux sociaux
  console.log('1️⃣ Test de sauvegarde avec réseaux sociaux...');
  try {
    const testPlug = {
      name: 'Test Boutique Corrections',
      description: 'Test des corrections de synchronisation',
      image: 'https://example.com/test-image.jpg',
      countries: ['France', 'Belgique'],
      services: {
        delivery: { enabled: true, description: 'Livraison rapide 24h' },
        postal: { enabled: true, description: 'Envoi postal sécurisé' },
        meetup: { enabled: false, description: '' }
      },
      socialMedia: [
        { name: 'Telegram', emoji: '📱', url: 'https://t.me/test' },
        { name: 'WhatsApp', emoji: '💬', url: 'https://wa.me/123456789' },
        { name: 'Instagram', emoji: '📸', url: 'https://instagram.com/test' }
      ],
      isVip: false,
      isActive: true
    };

    const response = await fetch(`${API_BASE_URL}/api/plugs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_PASSWORD}`
      },
      body: JSON.stringify(testPlug)
    });

    if (response.ok) {
      const newPlug = await response.json();
      console.log('✅ Plug créé avec succès');
      console.log(`📸 Image synchronisée: ${newPlug.image ? 'Oui' : 'Non'}`);
      console.log(`📱 Réseaux sociaux: ${newPlug.socialMedia?.length || 0} éléments`);
      
      // Test de mise à jour
      console.log('\n2️⃣ Test de mise à jour...');
      const updateData = {
        ...newPlug,
        description: 'Description mise à jour',
        socialMedia: [
          ...newPlug.socialMedia,
          { name: 'Site Web', emoji: '🌐', url: 'https://test.com' }
        ]
      };

      const updateResponse = await fetch(`${API_BASE_URL}/api/plugs/${newPlug._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_PASSWORD}`
        },
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        const updatedPlug = await updateResponse.json();
        console.log('✅ Plug mis à jour avec succès');
        console.log(`📱 Réseaux sociaux après MAJ: ${updatedPlug.socialMedia?.length || 0} éléments`);
      } else {
        console.log('❌ Erreur lors de la mise à jour');
      }

      // Nettoyage
      await fetch(`${API_BASE_URL}/api/plugs/${newPlug._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${ADMIN_PASSWORD}`
        }
      });
      console.log('🧹 Plug de test supprimé');

    } else {
      console.log('❌ Erreur lors de la création du plug de test');
      console.log('Response status:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur lors du test:', error.message);
  }

  // Test 2: Vérifier les API publiques
  console.log('\n3️⃣ Test des API publiques...');
  try {
    const configResponse = await fetch(`${API_BASE_URL}/api/public/config`);
    if (configResponse.ok) {
      console.log('✅ API config publique fonctionne');
    } else {
      console.log('❌ Problème avec API config publique');
    }

    const plugsResponse = await fetch(`${API_BASE_URL}/api/public/plugs?filter=active&limit=5`);
    if (plugsResponse.ok) {
      const data = await plugsResponse.json();
      console.log(`✅ API plugs publique fonctionne (${data.plugs?.length || 0} plugs)`);
      
      // Vérifier la structure des réseaux sociaux
      if (data.plugs && data.plugs.length > 0) {
        const firstPlug = data.plugs[0];
        console.log(`📱 Structure réseaux sociaux: ${Array.isArray(firstPlug.socialMedia) ? 'Array ✅' : 'Autre format ⚠️'}`);
        if (firstPlug.socialMedia && firstPlug.socialMedia.length > 0) {
          console.log(`📱 Premier réseau social:`, firstPlug.socialMedia[0]);
        }
      }
    } else {
      console.log('❌ Problème avec API plugs publique');
    }
  } catch (error) {
    console.log('❌ Erreur lors du test des API publiques:', error.message);
  }

  // Test 3: Test CORS
  console.log('\n4️⃣ Test CORS...');
  try {
    const corsResponse = await fetch(`${API_BASE_URL}/api/plugs`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://safeplugslink.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    if (corsResponse.ok) {
      console.log('✅ CORS preflight fonctionne');
      console.log('CORS headers:', corsResponse.headers.get('access-control-allow-methods'));
    } else {
      console.log('❌ Problème CORS preflight');
    }
  } catch (error) {
    console.log('❌ Erreur test CORS:', error.message);
  }

  console.log('\n🏁 Tests terminés!');
};

// Exporter pour utilisation
if (require.main === module) {
  testCorrections().catch(console.error);
}

module.exports = testCorrections;