// Proxy CORS pour contourner les restrictions
// Système de protection anti-flood 429 (RÉINITIALISÉ)
let last429Count = 0;
let last429Time = 0;
const MAX_429_PER_MINUTE = 10; // Augmenté de 5 à 10 pour être moins strict
const EMERGENCY_BLOCK_DURATION = 30000; // Réduit de 60s à 30s

export default async function handler(req, res) {
  // Réinitialiser les compteurs si plus de 2 minutes se sont écoulées
  const now = Date.now();
  if (now - last429Time > 120000) { // 2 minutes
    last429Count = 0;
    last429Time = 0;
  }
  
  // Vérification urgence: Si trop d'erreurs 429 récentes, bloquer temporairement
  if (now - last429Time < EMERGENCY_BLOCK_DURATION && last429Count >= MAX_429_PER_MINUTE) {
    console.log(`🚫 EMERGENCY BLOCK: Trop d'erreurs 429 (${last429Count}) - proxy bloqué temporairement`);
    return res.status(503).json({
      error: 'Serveur temporairement surchargé. Utilisez le mode hors ligne pour vous connecter.',
      reason: 'server_overloaded',
      retryAfter: Math.ceil((EMERGENCY_BLOCK_DURATION - (now - last429Time)) / 1000),
      suggestion: 'Utilisez le mot de passe "JuniorAdmon123" pour une connexion hors ligne immédiate'
    });
  }
  // Configuration CORS - autoriser les domaines Vercel et développement
  const origin = req.headers.origin;
  
  // Autoriser tous les domaines Vercel et localhost pour l'accès public
  if (origin && (
    origin.includes('.vercel.app') || 
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  )) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Fallback pour les domaines Vercel
    res.setHeader('Access-Control-Allow-Origin', '*'); // Temporaire pour boutique publique
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const { endpoint, method = 'GET', token, data } = req.body || {}
    const apiUrl = process.env.BOT_API_URL || 'https://jhhhhhhggre.onrender.com'
    
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
    
    // Ajouter l'autorisation SEULEMENT si token fourni ET endpoint privé
    const isPublicEndpoint = endpoint && (endpoint.startsWith('/api/public/') || endpoint === '/api/public/config');
    
    if (!isPublicEndpoint) {
      // Endpoints privés : token requis
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      } else if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization
      }
    }
    // Endpoints publics : pas de token nécessaire
    
    console.log(`🔑 Endpoint ${isPublicEndpoint ? 'PUBLIC' : 'PRIVÉ'} - Token utilisé: ${headers.Authorization ? 'Oui' : 'Non'}`)
    
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
    
    // Compteur d'erreurs 429 pour protection
    if (response.status === 429) {
      const now = Date.now();
      // Reset compteur si plus d'une minute
      if (now - last429Time > EMERGENCY_BLOCK_DURATION) {
        last429Count = 1;
        last429Time = now;
      } else {
        last429Count++;
      }
      console.log(`🚫 Erreur 429 #${last429Count} détectée`);
    }
    
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