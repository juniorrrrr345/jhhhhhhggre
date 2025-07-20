// Proxy API pour contourner les problèmes de connectivité Vercel → Render
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
    const { endpoint, ...params } = req.query
    
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint requis' })
    }

    // URL de base de l'API Render
    const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
    
    // Construction de l'URL complète
    let targetUrl = `${API_BASE_URL}${endpoint}`
    
    // Ajouter les paramètres de query
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key]) {
        queryParams.append(key, params[key])
      }
    })
    
    if (queryParams.toString()) {
      targetUrl += `?${queryParams.toString()}`
    }
    
    console.log('🔄 Proxy vers:', targetUrl)
    
    // Faire la requête vers Render
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Proxy/1.0'
      }
    }
    
    // Ajouter le body pour POST/PUT
    if (req.method === 'POST' || req.method === 'PUT') {
      fetchOptions.body = JSON.stringify(req.body)
    }
    
    // Ajouter l'authorization si présente
    if (req.headers.authorization) {
      // Assurer le format Bearer
      const auth = req.headers.authorization.startsWith('Bearer ') 
        ? req.headers.authorization 
        : `Bearer ${req.headers.authorization}`;
      fetchOptions.headers.Authorization = auth;
    }
    
    const response = await fetch(targetUrl, fetchOptions)
    const data = await response.json()
    
    console.log('✅ Proxy response:', response.status)
    
    // Retourner la réponse
    res.status(response.status).json(data)
    
  } catch (error) {
    console.error('❌ Proxy error:', error)
    res.status(500).json({ 
      error: 'Erreur proxy', 
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}