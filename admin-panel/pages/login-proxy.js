import { useState } from 'react'
import { useRouter } from 'next/router'

export default function ProxyLogin() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleProxyLogin = async () => {
    setLoading(true)
    setResult('🔄 Test de connexion via proxy...')

    try {
      const password = 'JuniorAdmon123'
      
      console.log('🔐 Tentative de connexion via proxy...')
      
      const response = await fetch('/api/cors-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify({
          endpoint: '/api/config',
          method: 'GET'
        })
      })
      
      console.log('📡 Status proxy:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        setResult('✅ Connexion via proxy réussie ! Redirection en cours...')
        
        // Stocker le token
        localStorage.setItem('adminToken', password)
        
        // Redirection vers le panel admin
        setTimeout(() => {
          router.push('/admin')
        }, 1000)
        
      } else {
        const errorData = await response.json()
        setResult(`❌ Erreur proxy: ${response.status} - ${errorData.error || 'Erreur inconnue'}`)
      }
      
    } catch (error) {
      console.error('❌ Erreur:', error)
      setResult(`❌ Erreur de connexion proxy: ${error.message}`)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion Proxy</h1>
            <p className="text-gray-600">Contournement des restrictions CORS</p>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="font-bold text-purple-800 mb-2">🔄 Méthode Proxy :</h3>
              <ul className="text-purple-700 text-sm space-y-1">
                <li>• Utilise un proxy interne</li>
                <li>• Contourne les restrictions CORS</li>
                <li>• Serveur : https://jhhhhhhggre.onrender.com</li>
                <li>• Mot de passe : JuniorAdmon123</li>
              </ul>
            </div>

            <button
              onClick={handleProxyLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-500 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? '🔄 Connexion en cours...' : '🚀 Se connecter via proxy'}
            </button>

            {result && (
              <div className={`p-4 rounded-lg border-l-4 ${
                result.includes('✅') 
                  ? 'bg-green-50 border-green-400 text-green-800'
                  : result.includes('❌')
                  ? 'bg-red-50 border-red-400 text-red-800'
                  : 'bg-blue-50 border-blue-400 text-blue-800'
              }`}>
                {result}
              </div>
            )}

            <div className="text-center space-y-2">
              <a 
                href="/"
                className="block text-sm text-gray-500 hover:text-gray-700 underline"
              >
                ← Retour à la connexion normale
              </a>
              <a 
                href="/login-direct"
                className="block text-sm text-gray-500 hover:text-gray-700 underline"
              >
                🚀 Connexion directe
              </a>
              <a 
                href="/diagnostic"
                className="block text-sm text-gray-500 hover:text-gray-700 underline"
              >
                🔧 Diagnostic complet
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}