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
    const { endpoint, method = 'GET', token, data } = req.body || {}
    const apiUrl = 'https://jhhhhhhggre.onrender.com'
    
    console.log(`🔄 Proxy request: ${method} ${endpoint}`)
    console.log(`🔑 Token provided: ${token ? 'Yes' : 'No'}`)
    console.log(`📦 Data provided: ${data ? 'Yes' : 'No'}`)
    if (data && endpoint === '/api/plugs') {
      console.log(`📋 Plug data being sent:`, JSON.stringify(data, null, 2))
    }
    if (data && endpoint.includes('upload-image')) {
      console.log(`📸 Image data keys:`, Object.keys(data))
      console.log(`📸 Has imageBase64:`, !!data.imageBase64)
      console.log(`📸 Filename:`, data.filename)
    }
    
    // Préparer les headers
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Admin-Panel-Proxy/1.0'
    }
    
    // Ajouter l'autorisation avec le token du body ou du header
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    } else if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization
    }
    
    // Faire la requête vers l'API distante
    const fetchOptions = {
      method: method,
      headers: headers
    }
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      // Envoyer les données directement sans encapsulation pour éviter les problèmes
      console.log(`📤 Body being sent to API:`, JSON.stringify(data, null, 2))
      fetchOptions.body = JSON.stringify(data)
    }
    
    const response = await fetch(`${apiUrl}${endpoint}`, fetchOptions)
    
    console.log(`📡 Proxy response: ${response.status}`)
    
    // Récupérer la réponse
    const responseText = await response.text()
    
    // Retourner la réponse avec le bon status
    if (response.status >= 200 && response.status < 300) {
      try {
        const jsonData = JSON.parse(responseText)
        res.status(response.status).json(jsonData)
      } catch (parseError) {
        res.status(response.status).json({ data: responseText })
      }
    } else {
      res.status(response.status).json({ error: responseText })
    }
    
  } catch (error) {
    console.error('❌ Proxy error:', error.message)
    res.status(500).json({ 
      error: 'Erreur proxy', 
      details: error.message 
    })
  }
}