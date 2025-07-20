import { useState, useEffect } from 'react'

export default function Test() {
  const [apiStatus, setApiStatus] = useState('testing...')
  const [envVars, setEnvVars] = useState({})

  useEffect(() => {
    // Tester la connexion API
    const testApi = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
        
        // Test simple de ping
        const response = await fetch(`${apiUrl}/api/config`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test',
            'Cache-Control': 'no-cache'
          }
        })
        
        if (response.status === 401) {
          setApiStatus('✅ API accessible (401 attendu pour test)')
        } else if (response.ok) {
          setApiStatus('✅ API accessible et fonctionne')
        } else {
          setApiStatus(`❌ API répond avec erreur: ${response.status}`)
        }
      } catch (error) {
        setApiStatus(`❌ Erreur de connexion API: ${error.message}`)
      }
    }

    // Récupérer les variables d'environnement
    setEnvVars({
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
    })

    testApi()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Page de Test - Vercel</h1>
        
        <div className="grid gap-6">
          {/* Status API */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Status API</h2>
            <p className="text-lg">{apiStatus}</p>
          </div>

          {/* Variables d'environnement */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Variables d'environnement</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(envVars, null, 2)}
            </pre>
          </div>

          {/* Informations système */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Informations système</h2>
            <ul className="space-y-2">
              <li><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'Server-side'}</li>
              <li><strong>URL actuelle:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</li>
              <li><strong>Timestamp:</strong> {new Date().toISOString()}</li>
            </ul>
          </div>

          {/* Test Proxy */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Proxy</h2>
            <button 
              onClick={async () => {
                try {
                  const response = await fetch('/api/proxy?endpoint=/api/config', {
                    headers: {
                      'Authorization': 'Bearer test'
                    }
                  })
                  alert(`Proxy test: ${response.status} - ${response.ok ? 'OK' : 'Error'}`)
                } catch (error) {
                  alert(`Proxy error: ${error.message}`)
                }
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Tester le Proxy
            </button>
          </div>

          {/* Lien vers l'admin */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Navigation</h2>
            <div className="space-x-4">
              <a href="/" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Retour à l'accueil
              </a>
              <a href="/admin" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                Aller à l'admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}