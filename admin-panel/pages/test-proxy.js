import { useState } from 'react'
import { api } from '../lib/api-proxy'

export default function TestProxy() {
  const [results, setResults] = useState([])
  const [testing, setTesting] = useState(false)

  const addResult = (message, type = 'info') => {
    setResults(prev => [...prev, { 
      message, 
      type, 
      timestamp: new Date().toLocaleTimeString() 
    }])
  }

  const runFullTest = async () => {
    setTesting(true)
    setResults([])
    
    const token = 'ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1'
    
    try {
      addResult('🚀 Test complet du proxy CORS', 'info')
      
      // Test 1: Health check
      addResult('1️⃣ Test Health Check...', 'info')
      try {
        const health = await api.getHealth()
        addResult(`✅ Health: ${health.status}`, 'success')
      } catch (error) {
        addResult(`❌ Health failed: ${error.message}`, 'error')
      }
      
      // Test 2: Configuration
      addResult('2️⃣ Test Configuration...', 'info')
      try {
        const config = await api.getConfig(token)
        addResult(`✅ Config: ${config.boutique?.name || 'OK'}`, 'success')
      } catch (error) {
        addResult(`❌ Config failed: ${error.message}`, 'error')
      }
      
      // Test 3: Stats
      addResult('3️⃣ Test Statistiques...', 'info')
      try {
        const stats = await api.getStats(token)
        addResult(`✅ Stats: ${stats.totalPlugs} plugs`, 'success')
      } catch (error) {
        addResult(`❌ Stats failed: ${error.message}`, 'error')
      }
      
      // Test 4: Plugs
      addResult('4️⃣ Test Plugs...', 'info')
      try {
        const plugs = await api.getPlugs(token, { page: 1, limit: 5 })
        addResult(`✅ Plugs: ${plugs.plugs?.length || 0} chargés`, 'success')
      } catch (error) {
        addResult(`❌ Plugs failed: ${error.message}`, 'error')
      }
      
      // Test 5: Plugs publics
      addResult('5️⃣ Test Plugs Publics...', 'info')
      try {
        const publicPlugs = await api.getPublicPlugs({ page: 1, limit: 5 })
        addResult(`✅ Public Plugs: ${publicPlugs.plugs?.length || 0} chargés`, 'success')
      } catch (error) {
        addResult(`❌ Public Plugs failed: ${error.message}`, 'error')
      }
      
      addResult('🎉 Test terminé avec succès !', 'success')
      
    } catch (error) {
      addResult(`💥 Erreur générale: ${error.message}`, 'error')
    }
    
    setTesting(false)
  }

  const testSpecific = async (testName, testFn) => {
    addResult(`🔄 Test ${testName}...`, 'info')
    try {
      const result = await testFn()
      addResult(`✅ ${testName}: OK`, 'success')
      console.log(`${testName} result:`, result)
    } catch (error) {
      addResult(`❌ ${testName}: ${error.message}`, 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">🧪 Test Complet Proxy CORS</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <button
              onClick={runFullTest}
              disabled={testing}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {testing ? '🔄 Tests en cours...' : '🚀 Test Complet'}
            </button>
            
            <button
              onClick={() => testSpecific('Health', () => api.getHealth())}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              🏥 Test Health
            </button>
            
            <button
              onClick={() => testSpecific('Config', () => api.getConfig('ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1'))}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              ⚙️ Test Config
            </button>
            
            <button
              onClick={() => testSpecific('Stats', () => api.getStats('ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1'))}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              📊 Test Stats
            </button>
            
            <button
              onClick={() => testSpecific('Plugs', () => api.getPlugs('ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1'))}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              🔌 Test Plugs
            </button>
            
            <button
              onClick={() => testSpecific('Public', () => api.getPublicPlugs())}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              🌐 Test Public
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
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

          {results.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Cliquez sur un bouton pour commencer les tests
            </div>
          )}

          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-bold text-green-800 mb-2">✅ Proxy fonctionnel :</h3>
            <ul className="text-green-700 space-y-1 text-sm">
              <li>• Le proxy contourne les restrictions CORS</li>
              <li>• Toutes les requêtes passent par le serveur local</li>
              <li>• Authentication via Bearer token</li>
              <li>• Fallback automatique si nécessaire</li>
            </ul>
          </div>

          <div className="mt-4 text-center space-y-2">
            <a 
              href="/admin"
              className="inline-block bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium mr-4"
            >
              🏛️ Aller au Panel Admin
            </a>
            <a 
              href="/"
              className="text-blue-500 hover:text-blue-600 underline"
            >
              ← Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}