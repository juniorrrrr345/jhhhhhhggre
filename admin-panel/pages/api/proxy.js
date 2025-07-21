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
    
    // CORRECTION: Meilleure gestion de _method pour simuler PUT/DELETE via POST
    if (req.body && typeof req.body === 'object' && req.body._method) {
      actualMethod = req.body._method.toUpperCase()
      console.log(`🔄 Conversion méthode: ${req.method} → ${actualMethod} via _method`)
      
      // Retirer _method du body et créer une copie propre
      const { _method, ...rest } = req.body
      bodyData = rest
      
      // Log pour debug
      console.log('📦 Body après nettoyage _method:', {
        originalKeys: Object.keys(req.body),
        cleanedKeys: Object.keys(bodyData),
        size: JSON.stringify(bodyData).length
      })
    }
    
    // Faire la requête vers Render avec timeout
    const fetchOptions = {
      method: actualMethod,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Proxy/1.0',
        'Cache-Control': 'no-cache',
        'Accept': 'application/json'
      },
      // Timeout adaptatif selon l'endpoint
      signal: AbortSignal.timeout(endpoint.includes('/config') ? 45000 : 20000)
    }
    
    // Ajouter le body pour POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(actualMethod)) {
      fetchOptions.body = JSON.stringify(bodyData)
      console.log('📦 Body envoyé:', {
        method: actualMethod,
        bodySize: fetchOptions.body.length,
        contentType: fetchOptions.headers['Content-Type']
      })
    }
    
    // Ajouter l'authorization si présente
    if (req.headers.authorization) {
      // Assurer le format Bearer
      const auth = req.headers.authorization.startsWith('Bearer ') 
        ? req.headers.authorization 
        : `Bearer ${req.headers.authorization}`;
      fetchOptions.headers.Authorization = auth;
      console.log('🔐 Auth header ajouté:', auth.substring(0, 20) + '...');
    }
    
    console.log('📡 Fetch options:', {
      url: targetUrl,
      method: actualMethod,
      hasAuth: !!fetchOptions.headers.Authorization,
      hasBody: !!fetchOptions.body,
      timeout: endpoint.includes('/config') ? '45s' : '20s'
    });
    
    const response = await fetch(targetUrl, fetchOptions)
    
    console.log('✅ Proxy response:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length')
    })
    
    // Vérifier le content-type de la réponse
    const contentType = response.headers.get('content-type')
    
    if (!contentType || !contentType.includes('application/json')) {
      // Si ce n'est pas du JSON, récupérer le texte
      const text = await response.text()
      console.error('❌ Réponse non-JSON reçue:', {
        contentType,
        textLength: text.length,
        preview: text.substring(0, 200)
      })
      
      return res.status(response.status).json({
        error: 'Réponse invalide du serveur',
        contentType,
        status: response.status,
        statusText: response.statusText,
        preview: text.substring(0, 200),
        fullResponse: text.length < 1000 ? text : `${text.substring(0, 1000)}...`
      })
    }
    
    const data = await response.json()
    console.log('📊 Proxy data received:', {
      type: typeof data,
      isArray: Array.isArray(data),
      keys: typeof data === 'object' && data ? Object.keys(data) : 'N/A',
      size: JSON.stringify(data).length
    });
    
    // CORRECTION: Transférer tous les headers importants
    const importantHeaders = ['cache-control', 'last-modified', 'etag', 'expires']
    importantHeaders.forEach(header => {
      const value = response.headers.get(header)
      if (value) {
        res.setHeader(header, value)
      }
    })
    
    // Retourner la réponse
    res.status(response.status).json(data)
    
  } catch (error) {
    console.error('❌ Proxy error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    
    // Différencier les types d'erreurs avec plus de précision
    let errorMessage = error.message;
    let statusCode = 500;
    
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      errorMessage = 'Timeout: Le serveur bot ne répond pas (augmentez le timeout si nécessaire)';
      statusCode = 504;
    } else if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
      errorMessage = 'Impossible de contacter le serveur bot - Vérifiez que le bot est démarré';
      statusCode = 503;
    } else if (error.message.includes('getaddrinfo')) {
      errorMessage = 'Erreur de résolution DNS - Vérifiez l\'URL du serveur bot';
      statusCode = 502;
    }
    
    res.status(statusCode).json({ 
      error: 'Erreur proxy', 
      message: errorMessage,
      originalError: error.message,
      errorType: error.name,
      timestamp: new Date().toISOString()
    })
  }
}