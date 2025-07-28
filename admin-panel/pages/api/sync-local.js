// Endpoint pour synchroniser les données du serveur principal vers l'API locale
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
    console.log('🔄 Début synchronisation serveur principal -> API locale');
    
    // 1. Récupérer les données du serveur principal
    const apiUrl = process.env.BOT_API_URL || 'https://jhhhhhhggre.onrender.com';
    
    let mainServerData = null;
    try {
      const response = await Promise.race([
        fetch(`${apiUrl}/api/public/plugs`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout 8s')), 8000)
        )
      ]);
      
      if (response.ok) {
        mainServerData = await response.json();
        console.log(`✅ ${mainServerData.plugs?.length || 0} boutiques récupérées du serveur principal`);
      } else {
        throw new Error(`Serveur principal: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Serveur principal indisponible:', error.message);
      return res.status(503).json({ 
        error: 'Serveur principal indisponible',
        message: 'Impossible de synchroniser pour le moment'
      });
    }
    
    // 2. Vérifier qu'on a des données valides
    if (!mainServerData || !mainServerData.plugs || !Array.isArray(mainServerData.plugs)) {
      return res.status(400).json({ 
        error: 'Données invalides du serveur principal'
      });
    }
    
    // 3. Sauvegarder dans l'API locale
    const syncResults = {
      processed: 0,
      success: 0,
      errors: 0,
      details: []
    };
    
    for (const plug of mainServerData.plugs) {
      try {
        syncResults.processed++;
        
        // Appeler l'API locale pour sauvegarder/mettre à jour
        const localUrl = plug._id ? 
          `${req.headers.origin || 'https://sfeplugslink.vercel.app'}/api/local-plugs?id=${plug._id}` :
          `${req.headers.origin || 'https://sfeplugslink.vercel.app'}/api/local-plugs`;
        
        const localResponse = await fetch(localUrl, {
          method: plug._id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(plug)
        });
        
        if (localResponse.ok) {
          syncResults.success++;
          syncResults.details.push(`✅ ${plug.name}`);
        } else {
          syncResults.errors++;
          syncResults.details.push(`❌ ${plug.name} (${localResponse.status})`);
        }
        
      } catch (error) {
        syncResults.errors++;
        syncResults.details.push(`❌ ${plug.name} (${error.message})`);
      }
    }
    
    console.log(`🎯 Synchronisation terminée: ${syncResults.success}/${syncResults.processed} réussies`);
    
    res.status(200).json({
      success: true,
      message: `Synchronisation terminée: ${syncResults.success}/${syncResults.processed} boutiques`,
      results: syncResults,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erreur synchronisation:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la synchronisation',
      details: error.message 
    });
  }
}