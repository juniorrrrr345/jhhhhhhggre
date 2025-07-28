// API pour forcer la synchronisation des données locales vers le serveur principal
export default async function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    console.log('🔄 Début de synchronisation forcée...');
    
    // 1. Récupérer les données locales
    const localResponse = await fetch(`${req.headers.origin}/api/local-plugs`);
    if (!localResponse.ok) {
      throw new Error('Impossible de récupérer les données locales');
    }
    
    const localData = await localResponse.json();
    console.log(`📦 ${localData.count} boutiques trouvées localement`);
    
    // 2. Tester si le serveur principal est disponible
    const apiUrl = process.env.BOT_API_URL || 'https://jhhhhhhggre.onrender.com';
    const healthCheck = await fetch(`${apiUrl}/health`, { 
      method: 'GET',
      timeout: 5000 
    });
    
    if (!healthCheck.ok) {
      return res.status(503).json({ 
        error: 'Serveur principal toujours indisponible',
        localCount: localData.count,
        message: 'Gardez vos modifications locales, elles seront synchronisées plus tard'
      });
    }
    
    console.log('✅ Serveur principal disponible');
    
    // 3. Synchroniser chaque boutique locale vers le serveur principal
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ error: 'Token requis pour la synchronisation' });
    }
    
    const syncResults = {
      success: 0,
      errors: 0,
      details: []
    };
    
    for (const plug of localData.plugs) {
      try {
        // Ignorer les boutiques de test locales
        if (plug._id.startsWith('local_')) {
          continue;
        }
        
        const syncResponse = await fetch(`${apiUrl}/api/plugs/${plug._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(plug)
        });
        
        if (syncResponse.ok) {
          syncResults.success++;
          syncResults.details.push(`✅ ${plug.name} synchronisée`);
        } else {
          syncResults.errors++;
          syncResults.details.push(`❌ ${plug.name} échouée: ${syncResponse.status}`);
        }
        
      } catch (error) {
        syncResults.errors++;
        syncResults.details.push(`❌ ${plug.name} erreur: ${error.message}`);
      }
    }
    
    console.log(`🎯 Synchronisation terminée: ${syncResults.success} réussies, ${syncResults.errors} échouées`);
    
    res.status(200).json({
      success: true,
      message: 'Synchronisation terminée',
      results: syncResults,
      serverStatus: 'available'
    });
    
  } catch (error) {
    console.error('❌ Erreur synchronisation forcée:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la synchronisation',
      details: error.message 
    });
  }
}