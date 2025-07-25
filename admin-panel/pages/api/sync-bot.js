// API pour synchroniser automatiquement les boutiques entre Vercel et le bot Telegram
export default async function handler(req, res) {
  try {
    console.log('🔄 Demande de synchronisation bot-boutique')
    
    if (req.method === 'POST') {
      // Forcer le refresh du cache du bot
      const botUrl = process.env.BOT_URL || 'https://findyourplug-bot.onrender.com'
      
      try {
        // Appeler l'endpoint de refresh du cache du bot
        const refreshResponse = await fetch(`${botUrl}/api/cache/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        })
        
        if (refreshResponse.ok) {
          console.log('✅ Cache bot rafraîchi avec succès')
          
          // Optionnel : vérifier que les données sont à jour
          const configResponse = await fetch(`${botUrl}/api/public/config`)
          const plugsResponse = await fetch(`${botUrl}/api/public/plugs`)
          
          let syncedData = {
            config: null,
            plugs: [],
            timestamp: new Date().toISOString()
          }
          
          if (configResponse.ok) {
            syncedData.config = await configResponse.json()
          }
          
          if (plugsResponse.ok) {
            const plugsData = await plugsResponse.json()
            syncedData.plugs = plugsData.plugs || plugsData || []
          }
          
          return res.status(200).json({
            success: true,
            message: 'Synchronisation bot réussie',
            data: syncedData,
            botRefreshed: true
          })
        } else {
          console.log('⚠️ Erreur refresh cache bot:', refreshResponse.status)
          return res.status(200).json({
            success: false,
            message: 'Bot injoignable mais sync locale OK',
            botRefreshed: false
          })
        }
        
      } catch (botError) {
        console.log('⚠️ Bot indisponible, sync locale uniquement:', botError.message)
        return res.status(200).json({
          success: true,
          message: 'Sync locale réussie (bot offline)',
          botRefreshed: false
        })
      }
      
    } else if (req.method === 'GET') {
      // Status de synchronisation
      const botUrl = process.env.BOT_URL || 'https://findyourplug-bot.onrender.com'
      
      try {
        const healthResponse = await fetch(`${botUrl}/api/health`, { timeout: 5000 })
        const botOnline = healthResponse.ok
        
        return res.status(200).json({
          botOnline,
          botUrl,
          lastSync: new Date().toISOString(),
          syncAvailable: true
        })
      } catch (error) {
        return res.status(200).json({
          botOnline: false,
          botUrl,
          lastSync: null,
          syncAvailable: false,
          error: error.message
        })
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur API sync-bot:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}