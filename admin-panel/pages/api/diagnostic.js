// Endpoint de diagnostic pour tester la connectivité avec le bot
export default async function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const diagnosticResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    overall: 'PENDING'
  }

  try {
    // URL de base de l'API
    const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
    
    console.log('🔍 Démarrage diagnostic connectivité bot...')
    console.log('🔗 URL cible:', API_BASE_URL)

    // Test 1: Ping basique de l'API
    let pingTest = {
      name: 'Ping API Bot',
      status: 'PENDING',
      url: API_BASE_URL,
      duration: 0,
      error: null
    }

    try {
      const pingStart = Date.now()
      const pingResponse = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Admin-Panel-Diagnostic/1.0'
        },
        signal: AbortSignal.timeout(10000) // 10 secondes
      })
      
      pingTest.duration = Date.now() - pingStart
      pingTest.status = pingResponse.ok ? 'SUCCESS' : 'FAILED'
      pingTest.httpStatus = pingResponse.status
      
      if (!pingResponse.ok) {
        pingTest.error = `HTTP ${pingResponse.status}: ${pingResponse.statusText}`
      }
    } catch (pingError) {
      pingTest.status = 'FAILED'
      pingTest.error = pingError.message
      pingTest.duration = 10000 // Timeout
    }
    
    diagnosticResults.tests.push(pingTest)

    // Test 2: Configuration publique
    let configTest = {
      name: 'Configuration Publique',
      status: 'PENDING',
      url: `${API_BASE_URL}/api/public/config`,
      duration: 0,
      error: null
    }

    try {
      const configStart = Date.now()
      const configResponse = await fetch(`${API_BASE_URL}/api/public/config`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Admin-Panel-Diagnostic/1.0'
        },
        signal: AbortSignal.timeout(15000) // 15 secondes
      })
      
      configTest.duration = Date.now() - configStart
      configTest.status = configResponse.ok ? 'SUCCESS' : 'FAILED'
      configTest.httpStatus = configResponse.status
      
      if (configResponse.ok) {
        const configData = await configResponse.json()
        configTest.configExists = !!configData
        configTest.boutiqueName = configData?.boutique?.name || 'Non configuré'
      } else {
        configTest.error = `HTTP ${configResponse.status}: ${configResponse.statusText}`
      }
    } catch (configError) {
      configTest.status = 'FAILED'
      configTest.error = configError.message
    }
    
    diagnosticResults.tests.push(configTest)

    // Test 3: Authentification admin (si token fourni)
    if (req.headers.authorization) {
      let authTest = {
        name: 'Authentification Admin',
        status: 'PENDING',
        url: `${API_BASE_URL}/api/config`,
        duration: 0,
        error: null
      }

      try {
        const authStart = Date.now()
        const authResponse = await fetch(`${API_BASE_URL}/api/config`, {
          method: 'GET',
          headers: {
            'Authorization': req.headers.authorization,
            'User-Agent': 'Admin-Panel-Diagnostic/1.0'
          },
          signal: AbortSignal.timeout(15000)
        })
        
        authTest.duration = Date.now() - authStart
        authTest.status = authResponse.ok ? 'SUCCESS' : 'FAILED'
        authTest.httpStatus = authResponse.status
        
        if (!authResponse.ok) {
          authTest.error = `HTTP ${authResponse.status}: ${authResponse.statusText}`
        }
      } catch (authError) {
        authTest.status = 'FAILED'
        authTest.error = authError.message
      }
      
      diagnosticResults.tests.push(authTest)
    }

    // Déterminer le statut global
    const successCount = diagnosticResults.tests.filter(t => t.status === 'SUCCESS').length
    const totalTests = diagnosticResults.tests.length
    
    if (successCount === totalTests) {
      diagnosticResults.overall = 'SUCCESS'
    } else if (successCount > 0) {
      diagnosticResults.overall = 'PARTIAL'
    } else {
      diagnosticResults.overall = 'FAILED'
    }

    // Recommandations basées sur les résultats
    diagnosticResults.recommendations = []
    
    if (pingTest.status === 'FAILED') {
      if (pingTest.error?.includes('timeout') || pingTest.error?.includes('AbortError')) {
        diagnosticResults.recommendations.push('Le serveur bot semble être démarré mais très lent. Vérifiez les ressources.')
      } else if (pingTest.error?.includes('ENOTFOUND') || pingTest.error?.includes('getaddrinfo')) {
        diagnosticResults.recommendations.push('URL du serveur bot incorrecte. Vérifiez la configuration API_BASE_URL.')
      } else if (pingTest.error?.includes('ECONNREFUSED')) {
        diagnosticResults.recommendations.push('Le serveur bot est arrêté. Redémarrez-le sur Render.')
      } else {
        diagnosticResults.recommendations.push('Problème de connectivité réseau. Vérifiez votre connexion internet.')
      }
    }

    if (configTest.status === 'FAILED' && pingTest.status === 'SUCCESS') {
      diagnosticResults.recommendations.push('API accessible mais endpoint de configuration défaillant. Vérifiez les routes du bot.')
    }

    console.log('✅ Diagnostic terminé:', diagnosticResults.overall)
    res.json(diagnosticResults)

  } catch (error) {
    console.error('❌ Erreur diagnostic:', error)
    
    diagnosticResults.overall = 'ERROR'
    diagnosticResults.error = {
      message: error.message,
      type: error.name
    }
    
    res.status(500).json(diagnosticResults)
  }
}