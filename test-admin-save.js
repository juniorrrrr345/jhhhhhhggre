const API_BASE_URL = process.env.API_BASE_URL || 'https://jhhhhhhggre.onrender.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'JuniorAdmon123';

const testAdminSave = async () => {
  console.log('🧪 Test de sauvegarde depuis l\'admin panel...\n');

  // Test 1: Vérifier l'authentification
  console.log('1️⃣ Test d\'authentification...');
  try {
    const authResponse = await fetch(`${API_BASE_URL}/api/config`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ADMIN_PASSWORD}`,
        'Content-Type': 'application/json'
      }
    });

    if (authResponse.ok) {
      console.log('✅ Authentification réussie');
      const currentConfig = await authResponse.json();
      console.log('📊 Config actuelle chargée:', Object.keys(currentConfig));
    } else {
      console.log('❌ Authentification échouée:', authResponse.status);
      return;
    }
  } catch (error) {
    console.log('❌ Erreur test auth:', error.message);
    return;
  }

  // Test 2: Tester la sauvegarde de configuration
  console.log('\n2️⃣ Test de sauvegarde...');
  try {
    const testConfig = {
      welcome: { 
        text: '🎉 Test de sauvegarde !', 
        image: 'https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Test+Save' 
      },
      boutique: {
        name: 'Test Boutique Save',
        subtitle: 'Test de sauvegarde configuration',
        logo: 'https://via.placeholder.com/100x100',
        backgroundImage: 'https://via.placeholder.com/1920x1080'
      },
      messages: {
        welcome: 'Test message bienvenue',
        noPlugsFound: 'Test aucun plug trouvé',
        error: 'Test message erreur'
      },
      socialMedia: {
        telegram: 'https://t.me/test',
        whatsapp: 'https://wa.me/123456789',
        website: 'https://test.com'
      },
      buttons: {
        topPlugs: { text: '🔌 Test Top Plugs' },
        vipPlugs: { text: '⭐ Test VIP' },
        contact: { text: '📞 Test Contact', content: 'Test contenu contact' },
        info: { text: 'ℹ️ Test Info', content: 'Test contenu info' }
      },
      filters: {
        all: 'Test tous les plugs',
        byService: 'Test par service',
        byCountry: 'Test par pays'
      },
      botTexts: {
        topPlugsTitle: 'Test titre top plugs',
        vipTitle: 'Test titre VIP',
        backButtonText: 'Test retour'
      }
    };

    console.log('📤 Envoi configuration test...');
    const saveResponse = await fetch(`${API_BASE_URL}/api/config`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ADMIN_PASSWORD}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(testConfig)
    });

    console.log('📡 Réponse sauvegarde:', saveResponse.status, saveResponse.statusText);

    if (saveResponse.ok) {
      const savedConfig = await saveResponse.json();
      console.log('✅ Configuration sauvegardée avec succès');
      console.log('📊 Config sauvegardée:', Object.keys(savedConfig));
      
      // Vérifier que les données sont bien présentes
      if (savedConfig.boutique?.name === testConfig.boutique.name) {
        console.log('✅ Données boutique correctement sauvegardées');
      } else {
        console.log('⚠️ Données boutique différentes après sauvegarde');
      }

      if (savedConfig.welcome?.text === testConfig.welcome.text) {
        console.log('✅ Données welcome correctement sauvegardées');
      } else {
        console.log('⚠️ Données welcome différentes après sauvegarde');
      }

    } else {
      const errorText = await saveResponse.text();
      console.log('❌ Erreur sauvegarde:', saveResponse.status, errorText);
    }

  } catch (error) {
    console.log('❌ Erreur test sauvegarde:', error.message);
  }

  // Test 3: Tester le rechargement du bot
  console.log('\n3️⃣ Test de rechargement bot...');
  try {
    const reloadResponse = await fetch(`${API_BASE_URL}/api/bot/reload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_PASSWORD}`,
        'Content-Type': 'application/json'
      }
    });

    if (reloadResponse.ok) {
      const reloadResult = await reloadResponse.json();
      console.log('✅ Bot rechargé avec succès:', reloadResult);
    } else {
      const errorText = await reloadResponse.text();
      console.log('❌ Erreur rechargement bot:', reloadResponse.status, errorText);
    }
  } catch (error) {
    console.log('❌ Erreur test rechargement:', error.message);
  }

  // Test 4: Vérifier que la configuration est bien rechargée
  console.log('\n4️⃣ Vérification configuration après rechargement...');
  try {
    // Attendre un peu pour laisser le temps au bot de se recharger
    await new Promise(resolve => setTimeout(resolve, 2000));

    const verifyResponse = await fetch(`${API_BASE_URL}/api/public/config?t=${Date.now()}`, {
      cache: 'no-cache'
    });

    if (verifyResponse.ok) {
      const verifiedConfig = await verifyResponse.json();
      console.log('✅ Configuration publique accessible');
      console.log('📊 Config publique:', Object.keys(verifiedConfig));
      
      if (verifiedConfig.boutique?.name?.includes('Test')) {
        console.log('✅ Nouvelles données présentes dans l\'API publique');
      } else {
        console.log('⚠️ Anciennes données encore présentes dans l\'API publique');
      }
    } else {
      console.log('❌ Erreur vérification config publique:', verifyResponse.status);
    }
  } catch (error) {
    console.log('❌ Erreur vérification:', error.message);
  }

  console.log('\n🏁 Tests terminés!');
};

// Exporter pour utilisation
if (require.main === module) {
  testAdminSave().catch(console.error);
}

module.exports = testAdminSave;