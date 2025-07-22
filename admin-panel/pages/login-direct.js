import { useState } from 'react'
import { useRouter } from 'next/router'

export default function DirectLogin() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDirectLogin = async () => {
    setLoading(true)
    setResult('🔄 Test de connexion en cours...')

    try {
      const password = 'ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1'
      const apiUrl = 'https://jhhhhhhggre.onrender.com'
      
      console.log('🔐 Tentative de connexion directe...')
      
      const response = await fetch(`${apiUrl}/api/config`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📡 Status:', response.status)
      
      if (response.ok) {
        setResult('✅ Connexion réussie ! Redirection en cours...')
        
        // Stocker le token
        localStorage.setItem('adminToken', password)
        
        // Redirection vers le panel admin
        setTimeout(() => {
          router.push('/admin')
        }, 1000)
        
      } else {
        const text = await response.text()
        setResult(`❌ Erreur: ${response.status} - ${text}`)
      }
      
    } catch (error) {
      console.error('❌ Erreur:', error)
      setResult(`❌ Erreur de connexion: ${error.message}`)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-600 to-green-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion Directe</h1>
            <p className="text-gray-600">Test de connexion automatique au serveur</p>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">ℹ️ Informations :</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Serveur : https://jhhhhhhggre.onrender.com</li>
                <li>• Mot de passe : JuniorAdmon123</li>
                <li>• Test automatique</li>
              </ul>
            </div>

            <button
              onClick={handleDirectLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-800 text-white py-3 px-4 rounded-lg font-medium hover:from-green-500 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? '🔄 Test en cours...' : '🚀 Tester la connexion'}
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
                href="/diagnostic"
                className="block text-sm text-gray-500 hover:text-gray-700 underline"
              >
                🔧 Page de diagnostic complète
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}