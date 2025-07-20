import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState({})
  const [apiTest, setApiTest] = useState(null)

  useEffect(() => {
    // Collecter les informations de debug
    const info = {
      // Variables d'environnement
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      API_BASE_URL: process.env.API_BASE_URL,
      
      // Informations runtime
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      location: typeof window !== 'undefined' ? window.location.href : 'SSR',
      timestamp: new Date().toISOString()
    }
    
    setDebugInfo(info)
    
    // Test de l'API
    testApi()
  }, [])

  const testApi = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
      const url = `${apiBaseUrl}/api/public/plugs?filter=active&limit=100&t=${new Date().getTime()}`
      
      console.log('🧪 Testing API:', url)
      
      const response = await fetch(url, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      const result = {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      }
      
      if (response.ok) {
        const data = await response.json()
        result.data = data
        result.plugsCount = data.plugs?.length || 0
      } else {
        result.error = `HTTP ${response.status} ${response.statusText}`
      }
      
      setApiTest(result)
      console.log('🧪 API Test Result:', result)
      
    } catch (error) {
      setApiTest({
        error: error.message,
        stack: error.stack
      })
      console.error('🧪 API Test Error:', error)
    }
  }

  return (
    <>
      <Head>
        <title>Debug Page - Variables et API</title>
      </Head>

      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Page de Debug</h1>
          
          {/* Variables d'environnement */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">🌍 Variables d'environnement</h2>
            <div className="space-y-2">
              {Object.entries(debugInfo).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b">
                  <span className="font-medium text-gray-700">{key}:</span>
                  <span className="text-gray-900 break-all">{value || '❌ undefined'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Test API */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📡 Test API</h2>
            
            {apiTest === null ? (
              <div className="text-gray-500">⏳ Test en cours...</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="font-medium">URL testée:</span>
                  <div className="bg-gray-100 p-2 rounded text-sm break-all">{apiTest.url}</div>
                </div>
                
                <div>
                  <span className="font-medium">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    apiTest.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {apiTest.status} {apiTest.statusText}
                  </span>
                </div>

                {apiTest.error && (
                  <div>
                    <span className="font-medium text-red-600">Erreur:</span>
                    <div className="bg-red-50 p-2 rounded text-sm text-red-700">{apiTest.error}</div>
                  </div>
                )}

                {apiTest.data && (
                  <div>
                    <span className="font-medium text-green-600">Données reçues:</span>
                    <div className="bg-green-50 p-2 rounded text-sm">
                      <div>✅ {apiTest.plugsCount} boutiques trouvées</div>
                      {apiTest.data.plugs?.map((plug, index) => (
                        <div key={index} className="ml-4">
                          • {plug.name} {plug.isVip ? '⭐' : ''} ({plug.isActive ? 'Actif' : 'Inactif'})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">📊 Données complètes (JSON)</summary>
                  <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto mt-2">
                    {JSON.stringify(apiTest, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={testApi}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              🔄 Relancer le test API
            </button>
          </div>
        </div>
      </div>
    </>
  )
}