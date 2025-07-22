import { useState, useEffect } from 'react'

export default function Diagnostic() {
  const [results, setResults] = useState([])
  const [testing, setTesting] = useState(false)

  const addResult = (message, type = 'info') => {
    setResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }])
  }

  const testConnection = async () => {
    setTesting(true)
    setResults([])
    
    try {
      // Test 1: Variables d'environnement
      addResult('🔍 Variables d\'environnement:', 'info')
      addResult(`NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`, 'info')
      addResult(`API_BASE_URL: ${process.env.API_BASE_URL}`, 'info')
      
      // Test 2: URL utilisée
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://jhhhhhhggre.onrender.com'
      addResult(`🌐 URL utilisée: ${apiBaseUrl}`, 'info')
      
      // Test 3: Santé du serveur
      addResult('🏥 Test de santé...', 'info')
      try {
        const healthResponse = await fetch(`${apiBaseUrl}/health`)
        if (healthResponse.ok) {
          const healthData = await healthResponse.json()
          addResult(`✅ Serveur accessible - Status: ${healthData.status}`, 'success')
        } else {
          addResult(`❌ Erreur santé: ${healthResponse.status}`, 'error')
          setTesting(false)
          return
        }
      } catch (healthError) {
        addResult(`❌ Erreur de connexion santé: ${healthError.message}`, 'error')
        setTesting(false)
        return
      }
      
      // Test 4: Test d'authentification
      addResult('🔐 Test d\'authentification...', 'info')
      const password = 'ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1'
      
      try {
        const response = await fetch(`${apiBaseUrl}/api/config`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${password}`,
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json'
          }
        })
        
        addResult(`📡 Status de réponse: ${response.status}`, 'info')
        
        if (response.ok) {
          const data = await response.json()
          addResult('✅ Authentification réussie !', 'success')
          addResult(`📋 Config récupérée: ${data.boutique?.name || 'Non défini'}`, 'success')
        } else if (response.status === 401) {
          addResult('❌ Mot de passe incorrect', 'error')
        } else {
          const text = await response.text()
          addResult(`❌ Erreur: ${response.status} - ${text.substring(0, 100)}`, 'error')
        }
      } catch (authError) {
        addResult(`❌ Erreur d'authentification: ${authError.message}`, 'error')
      }
      
    } catch (error) {
      addResult(`❌ Erreur générale: ${error.message}`, 'error')
    }
    
    setTesting(false)
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">🧪 Diagnostic de Connexion</h1>
          
          <div className="mb-6">
            <button
              onClick={testConnection}
              disabled={testing}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {testing ? '🔄 Test en cours...' : '🚀 Relancer le test'}
            </button>
          </div>

          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded border-l-4 ${
                  result.type === 'success' 
                    ? 'bg-green-50 border-green-400 text-green-800'
                    : result.type === 'error'
                    ? 'bg-red-50 border-red-400 text-red-800'
                    : 'bg-blue-50 border-blue-400 text-blue-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="flex-1">{result.message}</span>
                  <span className="text-xs opacity-60 ml-4">{result.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          {results.length === 0 && !testing && (
            <div className="text-center text-gray-500 py-8">
              Cliquez sur "Relancer le test" pour commencer le diagnostic
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-bold text-yellow-800 mb-2">💡 Instructions :</h3>
            <ul className="text-yellow-700 space-y-1 text-sm">
              <li>• Si l'authentification échoue, vérifiez le mot de passe</li>
              <li>• Si la connexion échoue, vérifiez votre réseau</li>
              <li>• Le serveur distant doit être accessible via HTTPS</li>
            </ul>
          </div>

          <div className="mt-4 text-center">
            <a 
              href="/"
              className="text-blue-500 hover:text-blue-600 underline"
            >
              ← Retour à la page de connexion
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}