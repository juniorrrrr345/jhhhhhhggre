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
    
    console.log('🖼️ Image proxy appelé avec:', { url, query: req.query })
    
    if (!url) {
      console.log('❌ URL manquante')
      return redirectToFallbackImage(res, 'URL d\'image requise')
    }

    // Valider que l'URL est une image valide
    const isValidImage = url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || 
                        url.includes('postimg.cc') || 
                        url.includes('imgur.com') ||
                        url.includes('i.imgur.com') ||
                        url.includes('cdn.discordapp.com')
    
    if (!isValidImage) {
      console.log('❌ URL d\'image non valide:', url)
      return redirectToFallbackImage(res, 'URL d\'image non valide')
    }

    console.log('🖼️ Proxy image vers:', url)
    
    // Récupérer l'image
    const imageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Referer': 'https://sfeplugslink.vercel.app/',
      },
      // Timeout de 15 secondes pour les images
      signal: AbortSignal.timeout(15000)
    })

    console.log('📡 Réponse image:', {
      status: imageResponse.status,
      statusText: imageResponse.statusText,
      contentType: imageResponse.headers.get('content-type'),
      contentLength: imageResponse.headers.get('content-length')
    })

    if (!imageResponse.ok) {
      console.log('❌ Erreur récupération image:', imageResponse.status, imageResponse.statusText)
      return redirectToFallbackImage(res, `Erreur ${imageResponse.status}: ${imageResponse.statusText}`)
    }

    // Vérifier que c'est bien une image
    const contentType = imageResponse.headers.get('content-type')
    
    // Si c'est du HTML (page d'erreur), utiliser fallback
    if (contentType && contentType.includes('text/html')) {
      console.log('❌ Page HTML reçue au lieu d\'image - utilisation fallback')
      return redirectToFallbackImage(res, `Type de contenu invalide: ${contentType}`)
    }

    // Transférer les headers importants
    const finalContentType = contentType && contentType.startsWith('image/') ? contentType : 'image/jpeg'
    res.setHeader('Content-Type', finalContentType)
    res.setHeader('Cache-Control', 'public, max-age=3600') // Cache 1 heure
    
    if (imageResponse.headers.get('content-length')) {
      res.setHeader('Content-Length', imageResponse.headers.get('content-length'))
    }

    console.log('✅ Image proxifiée avec succès:', {
      contentType: finalContentType,
      url: url
    })

    // Streamer l'image
    const imageBuffer = await imageResponse.arrayBuffer()
    res.status(200).send(Buffer.from(imageBuffer))
    
  } catch (error) {
    console.error('❌ Erreur proxy image:', error)
    return redirectToFallbackImage(res, error.message)
  }
}

// Fonction pour rediriger vers une image de fallback
function redirectToFallbackImage(res, reason) {
  console.log('🔄 Redirection vers image de fallback:', reason)
  
  // Image de fallback par défaut
  const fallbackImageUrl = 'https://i.imgur.com/PP2GVMv.png'
  
  // Redirection 302 vers l'image de fallback
  res.writeHead(302, {
    'Location': fallbackImageUrl,
    'Cache-Control': 'public, max-age=300'
  })
  res.end()
}