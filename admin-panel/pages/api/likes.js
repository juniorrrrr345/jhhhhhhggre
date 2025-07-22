// API pour la synchronisation des likes entre le bot et le panel admin
export default async function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const { plugId, userId, action } = req.body;
    
    if (!plugId || !userId || !action) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    // URL de base de l'API Render
    const API_BASE_URL = process.env.API_BASE_URL || 'https://jhhhhhhggre.onrender.com';
    
    console.log(`🔄 API LIKES: ${action} pour plug ${plugId} par user ${userId}`);
    
    // Faire la requête vers l'API du bot
    const response = await fetch(`${API_BASE_URL}/api/likes/${plugId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Admin/1.0'
      },
      body: JSON.stringify({
        userId: parseInt(userId),
        action: action
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.log(`❌ Erreur API likes:`, result);
      return res.status(response.status).json(result);
    }
    
    console.log(`✅ API LIKES: ${action} réussi pour ${result.plugName} - ${result.likes} likes`);
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Erreur API likes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
} 