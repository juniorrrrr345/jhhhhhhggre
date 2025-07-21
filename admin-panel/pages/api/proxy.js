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
    
    // Déterminer la méthode HTTP réelle
    let actualMethod = req.method
    let bodyData = req.body
    
    // Si le body contient _method, l'utiliser (pour simuler PUT/DELETE via POST)
    if (req.body && req.body._method) {
      actualMethod = req.body._method
      // Retirer _method du body
      const { _method, ...rest } = req.body
      bodyData = rest
    }
    
    // Faire la requête vers Render
    const fetchOptions = {
      method: actualMethod,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Proxy/1.0'
      }
    }
    
    // Ajouter le body pour POST/PUT
    if (actualMethod === 'POST' || actualMethod === 'PUT') {
      fetchOptions.body = JSON.stringify(bodyData)
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
    
    console.log('✅ Proxy response:', response.status, response.headers.get('content-type'))
    
    // Vérifier le content-type de la réponse
    const contentType = response.headers.get('content-type')
    
    if (!contentType || !contentType.includes('application/json')) {
      // Si ce n'est pas du JSON, récupérer le texte
      const text = await response.text()
      console.error('❌ Réponse non-JSON reçue:', text.substring(0, 200))
      
      return res.status(response.status).json({
        error: 'Réponse invalide du serveur',
        contentType,
        preview: text.substring(0, 200),
        fullResponse: text.length < 1000 ? text : `${text.substring(0, 1000)}...`
      })
    }
    
    const data = await response.json()
    
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