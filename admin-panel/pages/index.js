import { useState } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function Login() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Vérifier si le mot de passe est vide
      if (!password.trim()) {
        toast.error('Veuillez entrer un mot de passe');
        setLoading(false);
        return;
      }

      console.log('🔐 Début de la tentative de connexion...');
      
      // Essayer d'abord l'API directe
      let success = false;
      let errorMessage = '';
      
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://jhhhhhhggre.onrender.com';
        console.log('🔐 Login tentative directe:', apiBaseUrl);
        
        // Test de santé du serveur d'abord
        const healthResponse = await fetch(`${apiBaseUrl}/health`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json'
          }
        });

        console.log('🏥 Health check:', healthResponse.status);
        
        // Utiliser le proxy pour éviter les problèmes CORS
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
        });

        console.log('📡 Response status:', response.status);

        if (response.ok) {
          console.log('✅ Login direct réussi');
          success = true;
        } else if (response.status === 401) {
          errorMessage = 'Mot de passe incorrect';
          throw new Error(`HTTP ${response.status}`);
        } else {
          const responseText = await response.text();
          console.log('❌ Response error:', responseText);
          throw new Error(`HTTP ${response.status}: ${responseText}`);
        }
      } catch (directError) {
        console.log('❌ Login direct échoué:', directError.message);
        
        // Si c'est une erreur 401, pas besoin d'essayer le proxy
        if (directError.message.includes('401')) {
          throw directError;
        }
        
        console.log('🔄 Login tentative via proxy...');
        
        // Fallback vers le proxy
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL
          const proxyResponse = await fetch(`${apiBaseUrl}/api/proxy`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${password}`,
              'Cache-Control': 'no-cache',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              endpoint: '/admin/config',
              method: 'GET'
            })
          });

          console.log('📡 Proxy response status:', proxyResponse.status);

          if (proxyResponse.ok) {
            console.log('✅ Login proxy réussi');
            success = true;
          } else if (proxyResponse.status === 401) {
            errorMessage = 'Mot de passe incorrect';
            throw new Error(`Login proxy failed: HTTP ${proxyResponse.status}`);
          } else {
            const proxyText = await proxyResponse.text();
            console.log('❌ Proxy response error:', proxyText);
            throw new Error(`Login proxy failed: HTTP ${proxyResponse.status}: ${proxyText}`);
          }
        } catch (proxyError) {
          console.log('❌ Login proxy échoué:', proxyError.message);
          throw new Error('Impossible de se connecter au serveur. Le serveur bot est peut-être en cours de démarrage.');
        }
      }

      if (success) {
        // Stocker le token
        localStorage.setItem('adminToken', password);
        toast.success('Connexion réussie !');
        
        // Attendre un peu avant la redirection pour que l'utilisateur voie le message
        setTimeout(() => {
          router.push('/admin');
        }, 1000);
      } else {
        toast.error(errorMessage || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('💥 Login error final:', error);
      
      // Message d'erreur plus spécifique
      if (error.message.includes('401') || error.message.includes('incorrect')) {
        toast.error('Mot de passe incorrect');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        toast.error('Impossible de contacter le serveur. Vérifiez que le serveur bot est démarré.');
      } else if (error.message.includes('démarrage')) {
        toast.error('Le serveur bot est en cours de démarrage. Veuillez patienter et réessayer dans quelques secondes.');
      } else {
        toast.error(`Erreur de connexion: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-gray-800 to-black rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel Admin</h1>
            <p className="text-gray-600">Connectez-vous pour gérer votre bot</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe Admin
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200"
                  placeholder="Entrez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
                              className="w-full bg-gradient-to-r from-gray-800 to-black text-white py-3 px-4 rounded-lg font-medium hover:from-gray-700 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Liens utiles */}
          <div className="mt-6 text-center space-y-2">
            <a 
              href="/login-proxy" 
              className="block text-sm text-purple-500 hover:text-purple-700 underline font-bold"
            >
              🔄 Connexion PROXY (recommandée)
            </a>
            <a 
              href="/login-direct" 
              className="block text-sm text-blue-500 hover:text-blue-700 underline font-medium"
            >
              🚀 Connexion directe automatique
            </a>
            <a 
              href="/diagnostic" 
              className="block text-sm text-gray-500 hover:text-gray-700 underline"
            >
              🔧 Page de diagnostic de connexion
            </a>
          </div>


        </div>
      </div>
    </div>
  )
}