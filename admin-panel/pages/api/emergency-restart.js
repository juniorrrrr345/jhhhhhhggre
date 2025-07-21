// Endpoint d'urgence pour redémarrer le serveur bot
export default async function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  try {
    console.log('🚨 Demande de redémarrage d\'urgence du bot...')
    
    // URLs possibles pour le bot
    const possibleUrls = [
      process.env.API_BASE_URL,
      process.env.NEXT_PUBLIC_API_BASE_URL,
      'https://jhhhhhhggre.onrender.com',
      'https://bot-telegram-render.onrender.com'
    ].filter(Boolean)

    const results = []
    let successCount = 0

    // Essayer de contacter chaque URL
    for (const baseUrl of possibleUrls) {
      const result = {
        url: baseUrl,
        status: 'TESTING',
        actions: []
      }

      try {
        // 1. Test de santé
        console.log(`🔍 Test de santé: ${baseUrl}`)
        const healthResponse = await fetch(`${baseUrl}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        })

        if (healthResponse.ok) {
          result.actions.push({ action: 'health_check', status: 'SUCCESS', code: healthResponse.status })
          
          // 2. Tentative de rechargement si l'auth est fournie
          if (req.headers.authorization) {
            console.log(`🔄 Tentative rechargement: ${baseUrl}`)
            const reloadResponse = await fetch(`${baseUrl}/api/bot/reload`, {
              method: 'POST',
              headers: {
                'Authorization': req.headers.authorization,
                'Content-Type': 'application/json'
              },
              signal: AbortSignal.timeout(15000)
            })

            result.actions.push({ 
              action: 'reload_attempt', 
              status: reloadResponse.ok ? 'SUCCESS' : 'FAILED',
              code: reloadResponse.status
            })

            if (reloadResponse.ok) {
              successCount++
              result.status = 'SUCCESS'
            } else {
              result.status = 'PARTIAL'
            }
          } else {
            result.status = 'PARTIAL'
            result.actions.push({ action: 'reload_attempt', status: 'SKIPPED', reason: 'no_auth' })
          }
        } else {
          result.actions.push({ action: 'health_check', status: 'FAILED', code: healthResponse.status })
          result.status = 'FAILED'
        }

      } catch (error) {
        console.log(`❌ Erreur avec ${baseUrl}:`, error.message)
        result.actions.push({ action: 'connection', status: 'FAILED', error: error.message })
        result.status = 'FAILED'
      }

      results.push(result)
    }

    // Déterminer le statut global
    let overallStatus = 'FAILED'
    if (successCount > 0) {
      overallStatus = 'SUCCESS'
    } else if (results.some(r => r.status === 'PARTIAL')) {
      overallStatus = 'PARTIAL'
    }

    // Recommandations selon les résultats
    const recommendations = []
    
    if (overallStatus === 'FAILED') {
      recommendations.push('Aucun serveur bot accessible. Vérifiez le déploiement sur Render.')
      recommendations.push('Redémarrez manuellement le service sur Render.com')
      recommendations.push('Vérifiez les logs du serveur bot pour identifier le problème')
    } else if (overallStatus === 'PARTIAL') {
      recommendations.push('Serveur bot accessible mais rechargement échoué')
      recommendations.push('Vérifiez l\'authentification admin')
      recommendations.push('Consultez les logs bot pour plus de détails')
    } else {
      recommendations.push('Redémarrage réussi ! Testez les fonctionnalités.')
    }

    // Réponse
    const response = {
      success: overallStatus === 'SUCCESS',
      overall_status: overallStatus,
      timestamp: new Date().toISOString(),
      tested_urls: possibleUrls.length,
      successful_reloads: successCount,
      results,
      recommendations
    }

    const statusCode = overallStatus === 'SUCCESS' ? 200 : overallStatus === 'PARTIAL' ? 207 : 503

    console.log(`${overallStatus === 'SUCCESS' ? '✅' : '❌'} Redémarrage d'urgence terminé:`, overallStatus)
    
    res.status(statusCode).json(response)

  } catch (error) {
    console.error('💥 Erreur critique redémarrage d\'urgence:', error)
    
    res.status(500).json({
      success: false,
      error: 'Erreur critique lors du redémarrage d\'urgence',
      details: error.message,
      timestamp: new Date().toISOString(),
      recommendations: [
        'Redémarrez manuellement le bot sur Render.com',
        'Vérifiez les variables d\'environnement',
        'Contactez le support technique si le problème persiste'
      ]
    })
  }
}