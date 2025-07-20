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
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
    const timestamp = new Date().getTime()
    
    const tests = [
      {
        name: 'Test direct simple',
        url: `${apiBaseUrl}/test`,
        description: 'Direct vers Render - Test basique'
      },
      {
        name: 'Test proxy simple',
        url: `/api/proxy?endpoint=/test`,
        description: 'Via proxy Vercel - Test basique'
      },
      {
        name: 'Health check direct',
        url: `${apiBaseUrl}/health`,
        description: 'Direct vers Render - Santé API'
      },
      {
        name: 'Health check proxy',
        url: `/api/proxy?endpoint=/health`,
        description: 'Via proxy Vercel - Santé API'
      },
      {
        name: 'Plugs direct',
        url: `${apiBaseUrl}/api/public/plugs?filter=active&limit=100&t=${timestamp}`,
        description: 'Direct vers Render - Données boutiques'
      },
      {
        name: 'Plugs proxy',
        url: `/api/proxy?endpoint=/api/public/plugs&filter=active&limit=100&t=${timestamp}`,
        description: 'Via proxy Vercel - Données boutiques'
      }
    ]
    
    const results = []
    
    for (const test of tests) {
      try {
        console.log(`🧪 Testing ${test.name}:`, test.url)
        
        const response = await fetch(test.url, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        const result = {
          name: test.name,
          description: test.description,
          url: test.url,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        }
        
        if (response.ok) {
          const data = await response.json()
          result.data = data
          if (data.plugs) {
            result.plugsCount = data.plugs.length
          }
        } else {
          result.error = `HTTP ${response.status} ${response.statusText}`
        }
        
        results.push(result)
        console.log(`✅ ${test.name} result:`, result)
        
      } catch (error) {
        results.push({
          name: test.name,
          description: test.description,
          url: test.url,
          error: error.message,
          stack: error.stack
        })
        console.error(`❌ ${test.name} error:`, error)
      }
    }
    
    setApiTest(results)
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
              <div className="text-gray-500">⏳ Tests en cours...</div>
            ) : Array.isArray(apiTest) ? (
              <div className="space-y-6">
                {apiTest.map((test, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-2">
                      {test.name} - {test.description}
                    </h3>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">URL:</span>
                        <div className="bg-gray-100 p-2 rounded text-sm break-all">{test.url}</div>
                      </div>
                      
                      <div>
                        <span className="font-medium">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-sm ${
                          test.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {test.status || 'Erreur'} {test.statusText || ''}
                        </span>
                      </div>

                      {test.error && (
                        <div>
                          <span className="font-medium text-red-600">Erreur:</span>
                          <div className="bg-red-50 p-2 rounded text-sm text-red-700">{test.error}</div>
                        </div>
                      )}

                      {test.data && (
                        <div>
                          <span className="font-medium text-green-600">Données reçues:</span>
                          <div className="bg-green-50 p-2 rounded text-sm">
                            {test.plugsCount !== undefined ? (
                              <>
                                <div>✅ {test.plugsCount} boutiques trouvées</div>
                                {test.data.plugs?.map((plug, plugIndex) => (
                                  <div key={plugIndex} className="ml-4">
                                    • {plug.name} {plug.isVip ? '⭐' : ''} ({plug.isActive ? 'Actif' : 'Inactif'})
                                  </div>
                                ))}
                              </>
                            ) : (
                              <div>✅ Réponse: {JSON.stringify(test.data)}</div>
                            )}
                          </div>
                        </div>
                      )}

                      <details className="mt-2">
                        <summary className="cursor-pointer font-medium text-sm">📊 Détails complets</summary>
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto mt-1">
                          {JSON.stringify(test, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-red-500">Format de données inattendu</div>
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