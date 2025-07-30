// API locale qui fait le proxy vers le bot pour récupérer les boutiques
export default async function handler(req, res) {
  try {
    // Utiliser l'URL du bot depuis les variables d'environnement
    const botUrl = process.env.NEXT_PUBLIC_BOT_URL || 'https://jhhhhhhggre.onrender.com'
    const adminToken = 'JuniorAdmon123'
    
    console.log('🔄 Proxy vers le bot:', botUrl)
    
    // Faire la requête au bot avec authentification
    const response = await fetch(`${botUrl}/api/plugs?limit=100`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`Bot API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Filtrer uniquement les boutiques actives pour la mini-app
    const activePlugs = (data.plugs || []).filter(plug => plug.isActive)
    
    // Retourner les données du bot
    res.status(200).json({
      plugs: activePlugs,
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