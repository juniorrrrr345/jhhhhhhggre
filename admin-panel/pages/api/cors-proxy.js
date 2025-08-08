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
    // Utiliser la variable d'environnement ou l'URL par défaut
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BOT_API_URL || 'https://jhhhhhhggre.onrender.com';
    
    console.log(`🔄 Proxy request: ${method} ${endpoint} to ${apiUrl}`);
    
    // Préparer les headers
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter l'autorisation si token fourni
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Faire la requête avec timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 secondes de timeout
    
    const fetchOptions = {
      method: method,
      headers: headers,
      signal: controller.signal
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${apiUrl}${endpoint}`, fetchOptions);
    clearTimeout(timeoutId);
    
    console.log(`📡 Proxy response: ${response.status}`);
    
    // Gérer les erreurs 503 spécifiquement (service en sommeil)
    if (response.status === 503) {
      console.log('⚠️ Service en sommeil, tentative de réveil...');
      res.status(503).json({ 
        error: 'Service temporairement indisponible',
        message: 'Le serveur est en cours de réveil, veuillez réessayer dans quelques secondes',
        retry: true
      });
      return;
    }
    
    // Gérer les erreurs 429 spécifiquement
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || 60;
      res.status(429).json({ 
        error: 'Trop de requêtes',
        message: 'Veuillez patienter avant de réessayer',
        retryAfter: parseInt(retryAfter)
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
      
      // Si c'est une page HTML d'erreur Render
      if (text.includes('<!DOCTYPE html>') && response.status >= 500) {
        res.status(503).json({ 
          error: 'Service indisponible',
          message: 'Le serveur bot est actuellement hors ligne ou en maintenance',
          status: response.status,
          retry: true
        });
        return;
      }
      
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
    
    // Gérer les timeouts
    if (error.name === 'AbortError') {
      res.status(504).json({ 
        error: 'Timeout',
        message: 'Le serveur met trop de temps à répondre. Il est peut-être en cours de réveil.',
        retry: true
      });
      return;
    }
    
    // Gérer les erreurs de connexion
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      res.status(503).json({ 
        error: 'Service indisponible',
        message: 'Impossible de se connecter au serveur bot',
        retry: true
      });
      return;
    }
    
    res.status(500).json({ 
      error: 'Erreur proxy',
      message: error.message 
    });
  }
}