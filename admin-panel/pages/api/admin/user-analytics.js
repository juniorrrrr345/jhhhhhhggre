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
    
    const botResponse = await fetch(botUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ timeRange, dateFilter })
    })

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
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des statistiques',
      details: error.message 
    })
  }
}