import { useState } from 'react'
import { simpleApi } from '../../lib/api-simple'
import toast from 'react-hot-toast'

export default function TestConnection() {
  const [results, setResults] = useState({})
  const [testing, setTesting] = useState(false)
  const [currentTest, setCurrentTest] = useState('')

  const tests = [
    {
      name: 'Bot Health Check',
      key: 'health',
      action: async () => {
        const response = await fetch('https://jhhhhhhggre.onrender.com/health')
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return await response.text()
      }
    },
    {
      name: 'API Config (Direct)',
      key: 'config-direct', 
      action: async () => {
        const response = await fetch('https://jhhhhhhggre.onrender.com/api/config', {
          headers: { 'Authorization': 'Bearer JuniorAdmon123' }
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        return `✅ Config loaded - Bot: ${data.boutique?.name || 'N/A'}`
      }
    },
    {
      name: 'API Config (Proxy)',
      key: 'config-proxy',
      action: async () => {
        const data = await simpleApi.getConfig('JuniorAdmon123')
        return `✅ Config via proxy - Bot: ${data.boutique?.name || 'N/A'}`
      }
    },
    {
      name: 'Public Plugs (Direct)',
      key: 'plugs-direct',
      action: async () => {
        const response = await fetch('https://jhhhhhhggre.onrender.com/api/public/plugs?limit=2')
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        return `✅ ${data.plugs?.length || 0} boutiques trouvées`
      }
    },
    {
      name: 'Proxy CORS Status',
      key: 'proxy-cors',
      action: async () => {
        const response = await fetch('/api/cors-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: '/health',
            method: 'GET'
          })
        })
        if (!response.ok) throw new Error(`Proxy error: ${response.status}`)
        return '✅ Proxy CORS fonctionnel'
      }
    }
  ]

  const runTest = async (test) => {
    setCurrentTest(test.name)
    try {
      const result = await test.action()
      setResults(prev => ({
        ...prev,
        [test.key]: { success: true, message: result }
      }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [test.key]: { success: false, message: error.message }
      }))
    }
  }

  const runAllTests = async () => {
    setTesting(true)
    setResults({})
    
    for (const test of tests) {
      await runTest(test)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Délai entre tests
    }
    
    setTesting(false)
    setCurrentTest('')
    toast.success('Tests terminés')
  }

  const clearCache = () => {
    simpleApi.clearCache()
    toast.success('Cache nettoyé')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">🔧 Test de Connectivité</h1>
            <p className="text-gray-600">Diagnostiquez les problèmes de connexion avec le bot</p>
          </div>

          <div className="p-6">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={runAllTests}
                disabled={testing}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded"
              >
                {testing ? `🔄 Test en cours... (${currentTest})` : '🚀 Lancer tous les tests'}
              </button>
              
              <button
                onClick={clearCache}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                🧹 Nettoyer Cache
              </button>

              <button
                onClick={() => window.location.href = '/admin'}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                ← Retour Admin
              </button>
            </div>

            <div className="space-y-4">
              {tests.map((test) => {
                const result = results[test.key]
                return (
                  <div key={test.key} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {!result ? '⏳' : result.success ? '✅' : '❌'}
                        </span>
                        <span className="font-medium">{test.name}</span>
                      </div>
                      <button
                        onClick={() => runTest(test)}
                        disabled={testing}
                        className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm"
                      >
                        Test
                      </button>
                    </div>
                    {result && (
                      <div className={`mt-2 text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                        {result.message}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-blue-900 mb-2">💡 Solutions aux problèmes courants :</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• <strong>Erreur 429 :</strong> Trop de requêtes - Attendez 1 minute et réessayez</li>
                <li>• <strong>Erreur 500/502 :</strong> Bot Render en maintenance - Vérifiez les logs Render</li>
                <li>• <strong>Proxy error :</strong> Problème Vercel → Render - Utilisez le test direct</li>
                <li>• <strong>Network error :</strong> Problème de réseau - Rechargez la page</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}