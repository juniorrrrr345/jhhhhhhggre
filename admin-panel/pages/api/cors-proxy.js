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
    const responseData = await response.json();
    
    console.log(`📡 Proxy response: ${response.status}`);
    
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