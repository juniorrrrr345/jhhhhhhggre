// Proxy CORS pour contourner les restrictions
export default async function handler(req, res) {
  // Configuration CORS permissive pour ce proxy
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const { endpoint, method = 'GET', body } = req.body || {}
    const apiUrl = 'https://jhhhhhhggre.onrender.com'
    
    console.log(`🔄 Proxy request: ${method} ${endpoint}`)
    
    // Préparer les headers
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Admin-Panel-Proxy/1.0'
    }
    
    // Ajouter l'autorisation si présente
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization
    }
    
    // Faire la requête vers l'API distante
    const fetchOptions = {
      method: method,
      headers: headers
    }
    
    if (body && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(body)
    }
    
    const response = await fetch(`${apiUrl}${endpoint}`, fetchOptions)
    
    console.log(`📡 Proxy response: ${response.status}`)
    
    // Récupérer la réponse
    const data = await response.text()
    
    // Retourner la réponse avec le bon status
    res.status(response.status).json(
      response.status >= 200 && response.status < 300 
        ? JSON.parse(data) 
        : { error: data }
    )
    
  } catch (error) {
    console.error('❌ Proxy error:', error.message)
    res.status(500).json({ 
      error: 'Erreur proxy', 
      details: error.message 
    })
  }
}