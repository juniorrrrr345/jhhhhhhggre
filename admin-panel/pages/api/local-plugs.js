// API locale qui fait le proxy vers le bot pour récupérer les boutiques
export default async function handler(req, res) {
  try {
    // Utiliser l'URL du bot depuis les variables d'environnement
    const botUrl = process.env.NEXT_PUBLIC_BOT_URL || 'https://jhhhhhhggre.onrender.com'
    
    console.log('🔄 Proxy vers le bot:', botUrl)
    
    // Faire la requête au bot
    const response = await fetch(`${botUrl}/api/plugs/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Bot API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Retourner les données du bot
    res.status(200).json({
      plugs: data.plugs || [],
      success: true,
      source: 'bot-api',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erreur proxy local-plugs:', error)
    
    // En cas d'erreur, retourner un tableau vide
    res.status(200).json({
      plugs: [],
      success: false,
      source: 'local-fallback',
      error: error.message
    })
  }
}