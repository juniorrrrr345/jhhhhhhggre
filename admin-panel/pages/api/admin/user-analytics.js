export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  try {
    const { timeRange = 'all' } = req.query
    
    // Calculer la date de filtre selon la période
    let dateFilter = {}
    const now = new Date()
    
    switch (timeRange) {
      case '1d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }
        break
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }
        break
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } }
        break
      default:
        // 'all' - pas de filtre
        break
    }

    console.log(`📊 Génération stats utilisateurs pour période: ${timeRange}`)
    console.log(`🔗 URL du bot: ${process.env.NEXT_PUBLIC_BOT_API_URL || 'https://jhhhhhhggre.onrender.com'}`)

    // Utiliser le proxy CORS pour récupérer les données depuis le bot
    const botUrl = `${process.env.NEXT_PUBLIC_BOT_API_URL || 'https://jhhhhhhggre.onrender.com'}/api/admin/user-analytics`
    console.log(`📡 Appel vers: ${botUrl}`)
    
    // D'abord réveiller le bot avec un ping si nécessaire
    try {
      const wakeUpUrl = `${process.env.NEXT_PUBLIC_BOT_API_URL || 'https://jhhhhhhggre.onrender.com'}/`
      console.log(`🔄 Réveil du bot via: ${wakeUpUrl}`)
      await fetch(wakeUpUrl, { method: 'HEAD' })
      console.log(`✅ Bot réveillé`)
    } catch (wakeError) {
      console.log(`⚠️ Erreur réveil bot (non critique):`, wakeError.message)
    }
    
    // Timeout de 60 secondes pour laisser le temps au bot
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)
    
    const botResponse = await fetch(botUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ timeRange, dateFilter }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    console.log(`📡 Statut réponse bot: ${botResponse.status}`)
    console.log(`📡 Headers réponse:`, Object.fromEntries(botResponse.headers.entries()))

    if (!botResponse.ok) {
      const errorText = await botResponse.text()
      console.error(`❌ Erreur bot API: ${botResponse.status} - ${errorText}`)
      throw new Error(`Erreur bot API: ${botResponse.status} - ${errorText}`)
    }

    const data = await botResponse.json()
    console.log(`✅ Stats récupérées:`, data)
    
    res.status(200).json(data)
    
  } catch (error) {
    console.error('❌ Erreur API user-analytics:', error)
    
    let errorMessage = 'Erreur lors de la récupération des statistiques'
    if (error.name === 'AbortError') {
      errorMessage = 'Timeout: Le bot met trop de temps à répondre (60s)'
    } else if (error.message.includes('ECONNREFUSED')) {
      errorMessage = 'Impossible de se connecter au bot'
    } else if (error.message.includes('fetch')) {
      errorMessage = 'Erreur de connexion réseau'
    }
    
    res.status(500).json({ 
      error: `Erreur proxy: ${errorMessage}`,
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}