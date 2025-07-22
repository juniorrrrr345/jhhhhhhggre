import { useState } from 'react'
import toast from 'react-hot-toast'

export default function TestAuth() {
  const [password, setPassword] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testPasswords = [
    'JuniorAdmon123',
    'ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1'
  ]

  const testPassword = async (pwd) => {
    setLoading(true)
    try {
      const response = await fetch('/api/cors-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: '/api/config',
          method: 'GET',
          token: pwd
        })
      })

      if (response.ok) {
        setResult(`✅ Password "${pwd.slice(0, 20)}..." FONCTIONNE`)
        return true
      } else {
        const error = await response.json()
        setResult(`❌ Password "${pwd.slice(0, 20)}..." NE FONCTIONNE PAS (${error.error})`)
        return false
      }
    } catch (error) {
      setResult(`❌ Erreur: ${error.message}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  const testCustomPassword = async () => {
    if (!password) {
      toast.error('Entrez un mot de passe')
      return
    }
    await testPassword(password)
  }

  const testAllPasswords = async () => {
    for (const pwd of testPasswords) {
      await testPassword(pwd)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">🔐 Test d'Authentification</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tester un mot de passe personnalisé :
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez le mot de passe"
            />
            <button
              onClick={testCustomPassword}
              disabled={loading}
              className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Test en cours...' : 'Tester ce mot de passe'}
            </button>
          </div>

          <hr />

          <div>
            <h3 className="text-lg font-medium mb-2">Tester tous les mots de passe connus :</h3>
            <button
              onClick={testAllPasswords}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Tester JuniorAdmon123 + Token sécurisé
            </button>
          </div>

          {result && (
            <div className={`p-3 rounded-md ${
              result.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {result}
            </div>
          )}

          <div className="text-xs text-gray-500">
            <p><strong>Mots de passe testés :</strong></p>
            <p>1. JuniorAdmon123 (ancien)</p>
            <p>2. ADMIN_TOKEN_F3F3... (nouveau token sécurisé)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
