import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Debug() {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const runTests = async () => {
    setLoading(true)
    const testResults = {}

    // Test 1: Variables d'environnement
    console.log('🔧 Test des variables d\'environnement')
    testResults.env = {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV
    }

    // Test 2: API directe - Health check
    try {
      console.log('🏥 Test API directe - Health check')
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://jhhhhhhggre.onrender.com'
      const healthResponse = await fetch(`${apiBaseUrl}/health`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      testResults.healthDirect = {
        status: healthResponse.status,
        ok: healthResponse.ok,
        data: healthResponse.ok ? await healthResponse.json() : await healthResponse.text()
      }
    } catch (error) {
      testResults.healthDirect = {
        error: error.message
      }
    }

    // Test 3: API directe - Config (sans auth)
    try {
      console.log('⚙️ Test API directe - Config (sans auth)')
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://jhhhhhhggre.onrender.com'
      const configResponse = await fetch(`${apiBaseUrl}/api/public/config`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      testResults.configDirect = {
        status: configResponse.status,
        ok: configResponse.ok,
        data: configResponse.ok ? await configResponse.json() : await configResponse.text()
      }
    } catch (error) {
      testResults.configDirect = {
        error: error.message
      }
    }

    // Test 4: Proxy - Health check
    try {
      console.log('🔄 Test Proxy - Health check')
      const proxyHealthResponse = await fetch('/api/proxy?endpoint=/health', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      testResults.healthProxy = {
        status: proxyHealthResponse.status,
        ok: proxyHealthResponse.ok,
        data: proxyHealthResponse.ok ? await proxyHealthResponse.json() : await proxyHealthResponse.text()
      }
    } catch (error) {
      testResults.healthProxy = {
        error: error.message
      }
    }

    // Test 5: Proxy - Config (sans auth)
    try {
      console.log('🔄 Test Proxy - Config (sans auth)')
      const proxyConfigResponse = await fetch('/api/proxy?endpoint=/api/public/config', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      testResults.configProxy = {
        status: proxyConfigResponse.status,
        ok: proxyConfigResponse.ok,
        data: proxyConfigResponse.ok ? await proxyConfigResponse.json() : await proxyConfigResponse.text()
      }
    } catch (error) {
      testResults.configProxy = {
        error: error.message
      }
    }

    setResults(testResults)
    setLoading(false)
  }

  const formatResult = (result) => {
    if (!result) return 'Non testé'
    
    if (result.error) {
      return <span className="text-red-600">❌ Erreur: {result.error}</span>
    }
    
    if (result.ok) {
      return <span className="text-green-600">✅ Succès (Status: {result.status})</span>
    } else {
      return <span className="text-orange-600">⚠️ Échec (Status: {result.status})</span>
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Diagnostic de Connexion</h1>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              ← Retour à la connexion
            </button>
          </div>

          <button
            onClick={runTests}
            disabled={loading}
            className="mb-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Tests en cours...' : '🔍 Lancer les tests de diagnostic'}
          </button>

          {Object.keys(results).length > 0 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Variables d'environnement</h3>
                <pre className="text-sm bg-white p-3 rounded border overflow-auto">
                  {JSON.stringify(results.env, null, 2)}
                </pre>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Résultats des tests</h3>
                <div className="space-y-3">
                  <div>
                    <strong>API Directe - Health Check:</strong> {formatResult(results.healthDirect)}
                  </div>
                  <div>
                    <strong>API Directe - Config Public:</strong> {formatResult(results.configDirect)}
                  </div>
                  <div>
                    <strong>Proxy - Health Check:</strong> {formatResult(results.healthProxy)}
                  </div>
                  <div>
                    <strong>Proxy - Config Public:</strong> {formatResult(results.configProxy)}
                  </div>
                </div>
              </div>

              {/* Détails des réponses */}
              {Object.entries(results).map(([testName, result]) => (
                testName !== 'env' && result && result.data && (
                  <div key={testName} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-semibold mb-2">Détails - {testName}</h4>
                    <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-64">
                      {typeof result.data === 'object' ? JSON.stringify(result.data, null, 2) : result.data}
                    </pre>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}