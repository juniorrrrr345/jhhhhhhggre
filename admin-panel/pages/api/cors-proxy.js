// Proxy CORS simplifié
export default async function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { endpoint, method = 'GET', token, data } = req.body || {};
    const apiUrl = 'https://jhhhhhhggre.onrender.com';
    
    console.log(`🔄 Proxy request: ${method} ${endpoint}`);
    
    // Préparer les headers
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter l'autorisation si token fourni
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Faire la requête
    const fetchOptions = {
      method: method,
      headers: headers
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${apiUrl}${endpoint}`, fetchOptions);
    
    console.log(`📡 Proxy response: ${response.status}`);
    
    // Gérer les erreurs 429 spécifiquement
    if (response.status === 429) {
      res.status(429).json({ 
        error: 'Trop de requêtes',
        message: 'Veuillez patienter avant de réessayer'
      });
      return;
    }
    
    // Essayer de parser le JSON, sinon retourner le texte
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      // Si ce n'est pas du JSON, retourner une erreur
      const text = await response.text();
      console.error('❌ Non-JSON response:', text.substring(0, 100));
      res.status(response.status).json({ 
        error: 'Réponse invalide du serveur',
        status: response.status
      });
      return;
    }
    
    // Retourner la réponse
    res.status(response.status).json(responseData);
    
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Erreur proxy',
      message: error.message 
    });
  }
}