// Proxy spécifique pour les images - contourne les problèmes CORS sur Vercel
export default async function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  try {
    const { url } = req.query
    
    if (!url) {
      return res.status(400).json({ error: 'URL d\'image requise' })
    }

    // Valider que l'URL est une image valide
    if (!url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) && !url.includes('postimg.cc') && !url.includes('imgur.com')) {
      return res.status(400).json({ error: 'URL d\'image non valide' })
    }

    console.log('🖼️ Proxy image vers:', url)
    
    // Récupérer l'image
    const imageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BoutiqueBot/1.0)',
        'Accept': 'image/*,*/*;q=0.8',
        'Referer': 'https://postimg.cc/',
      },
      // Timeout de 10 secondes pour les images
      signal: AbortSignal.timeout(10000)
    })

    if (!imageResponse.ok) {
      console.log('❌ Erreur récupération image:', imageResponse.status, imageResponse.statusText)
      return res.status(imageResponse.status).json({ 
        error: 'Impossible de récupérer l\'image',
        status: imageResponse.status,
        statusText: imageResponse.statusText
      })
    }

    // Vérifier que c'est bien une image
    const contentType = imageResponse.headers.get('content-type')
    if (!contentType || !contentType.startsWith('image/')) {
      console.log('❌ Type de contenu invalide:', contentType)
      return res.status(400).json({ error: 'Le contenu n\'est pas une image valide' })
    }

    // Transférer les headers importants
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=3600') // Cache 1 heure
    
    if (imageResponse.headers.get('content-length')) {
      res.setHeader('Content-Length', imageResponse.headers.get('content-length'))
    }

    console.log('✅ Image proxifiée avec succès:', {
      contentType,
      contentLength: imageResponse.headers.get('content-length')
    })

    // Streamer l'image
    const imageBuffer = await imageResponse.arrayBuffer()
    res.status(200).send(Buffer.from(imageBuffer))
    
  } catch (error) {
    console.error('❌ Erreur proxy image:', error)
    
    let errorMessage = error.message
    let statusCode = 500
    
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      errorMessage = 'Timeout lors du chargement de l\'image'
      statusCode = 504
    } else if (error.message.includes('fetch') || error.message.includes('Network')) {
      errorMessage = 'Impossible de récupérer l\'image depuis la source'
      statusCode = 503
    }
    
    res.status(statusCode).json({ 
      error: 'Erreur proxy image', 
      message: errorMessage,
      originalError: error.message,
      timestamp: new Date().toISOString()
    })
  }
}