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

    // URL de base de l'API Render avec validation et fallbacks
    const possibleUrls = [
      process.env.API_BASE_URL,
      process.env.NEXT_PUBLIC_API_URL,
      'https://jhhhhhhggre.onrender.com',
      'https://jhhhhhhggre.onrender.com',
      'https://bot-telegram-render.onrender.com' // URL alternative possible
    ].filter(Boolean)
    
    const API_BASE_URL = possibleUrls[0]
    
    // Log pour debug
    console.log('🔗 URLs possibles:', possibleUrls)
    console.log('🔗 URL de base utilisée:', API_BASE_URL)
    console.log('📡 Endpoint demandé:', endpoint)
    
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
    
    // Tentative avec l'URL principale, avec fallback sur d'autres URLs si échec
    let response = null
    let lastError = null
    
         for (let i = 0; i < possibleUrls.length; i++) {
       const currentUrl = possibleUrls[i]
       let attemptUrl = `${currentUrl}${endpoint}`
       
       if (queryParams.toString()) {
         attemptUrl += `?${queryParams.toString()}`
       }
      
      try {
        console.log(`🔄 Tentative ${i + 1}/${possibleUrls.length}: ${attemptUrl}`)
        
        response = await fetch(attemptUrl, fetchOptions)
        
        // Si la réponse est OK ou si c'est une erreur d'authentification (pas de connectivité)
        if (response.ok || response.status === 401 || response.status === 403) {
          console.log(`✅ Connexion réussie avec: ${currentUrl}`)
          break
        } else if (response.status >= 500) {
          // Erreur serveur, essayer la prochaine URL
          console.log(`❌ Erreur serveur ${response.status} avec ${currentUrl}, essai suivant...`)
          lastError = new Error(`HTTP ${response.status} sur ${currentUrl}`)
          response = null
          continue
        } else {
          // Autres erreurs HTTP (4xx sauf auth), garder la réponse
          console.log(`⚠️ Erreur HTTP ${response.status} avec ${currentUrl}`)
          break
        }
      } catch (fetchError) {
        console.log(`❌ Erreur de connexion avec ${currentUrl}: ${fetchError.message}`)
        lastError = fetchError
        response = null
        
        // Si ce n'est pas la dernière URL, continuer
        if (i < possibleUrls.length - 1) {
          continue
        }
      }
    }
    
    // Si aucune URL n'a fonctionné
    if (!response) {
      throw lastError || new Error('Toutes les URLs de fallback ont échoué')
    }
    
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
    
    // CORRECTION: Transférer tous les headers importants y compris ceux de synchronisation
    const importantHeaders = [
      'cache-control', 
      'last-modified', 
      'etag', 
      'expires',
      'x-config-updated',
      'x-public-config-updated'
    ]
    importantHeaders.forEach(header => {
      const value = response.headers.get(header)
      if (value) {
        res.setHeader(header, value)
      }
    })
    
    // Headers anti-cache forcés pour tous les endpoints de configuration
    if (endpoint.includes('/config')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
      res.setHeader('Pragma', 'no-cache')
      res.setHeader('Expires', '0')
      res.setHeader('X-Proxy-Timestamp', new Date().toISOString())
    }
    
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
    let errorDetails = {};
    
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      errorMessage = 'Timeout: Le serveur bot ne répond pas dans les temps (60s). Le bot peut être surchargé.';
      statusCode = 504;
      errorDetails.suggestion = 'Réessayez dans quelques secondes ou vérifiez que le bot Render est actif';
    } else if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED') || error.message.includes('NetworkError')) {
      errorMessage = 'Impossible de contacter le serveur bot - Connexion refusée';
      statusCode = 503;
      errorDetails.suggestion = 'Vérifiez que le bot est démarré sur Render et accessible';
    } else if (error.message.includes('getaddrinfo') || error.message.includes('ENOTFOUND')) {
      errorMessage = 'Erreur de résolution DNS - URL du serveur bot incorrecte';
      statusCode = 502;
      errorDetails.suggestion = 'Vérifiez la variable d\'environnement API_BASE_URL';
    } else if (error.message.includes('JSON') || error.message.includes('SyntaxError')) {
      errorMessage = 'Réponse invalide du serveur bot - Format JSON attendu';
      statusCode = 502;
      errorDetails.suggestion = 'Le serveur bot renvoie une réponse corrompue';
    }
    
    res.status(statusCode).json({ 
      error: 'Erreur proxy', 
      message: errorMessage,
      originalError: error.message,
      errorType: error.name,
      timestamp: new Date().toISOString(),
      ...errorDetails
    })
  }
}