import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import toast from 'react-hot-toast'

export default function BoutiqueDebug() {
  const [config, setConfig] = useState(null)
  const [publicConfig, setPublicConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [serverStatus, setServerStatus] = useState({
    admin: 'unknown',
    bot: 'unknown'
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
    
    loadConfigs()
    
    // Actualiser toutes les 5 secondes
    const interval = setInterval(loadConfigs, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadConfigs = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      
      // Test de l'état des serveurs
      setServerStatus(prev => ({ ...prev, admin: 'testing', bot: 'testing' }))
      
      // Charger la config admin
      try {
        const adminResponse = await fetch('/api/proxy?endpoint=/api/config', {
                  headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
        })
        
        if (adminResponse.ok) {
          const adminData = await adminResponse.json()
          setConfig(adminData)
          setServerStatus(prev => ({ ...prev, admin: 'online' }))
          console.log('🔧 Config admin:', adminData)
        } else {
          setServerStatus(prev => ({ ...prev, admin: 'error' }))
          console.error('❌ Erreur config admin:', adminResponse.status)
        }
      } catch (error) {
        setServerStatus(prev => ({ ...prev, admin: 'offline' }))
        console.error('❌ Erreur connexion admin:', error)
      }
      
      // Charger la config publique
      try {
        const publicResponse = await fetch('/api/proxy?endpoint=/api/public/config', {
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        if (publicResponse.ok) {
          const publicData = await publicResponse.json()
          setPublicConfig(publicData)
          setServerStatus(prev => ({ ...prev, bot: 'online' }))
          console.log('🏪 Config publique:', publicData)
        } else {
          setServerStatus(prev => ({ ...prev, bot: 'error' }))
          console.error('❌ Erreur config publique:', publicResponse.status)
        }
      } catch (error) {
        setServerStatus(prev => ({ ...prev, bot: 'offline' }))
        console.error('❌ Erreur connexion bot:', error)
      }
      
    } catch (error) {
      console.error('Erreur générale:', error)
    } finally {
      setLoading(false)
    }
  }

  const forceUpdate = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      
      // Forcer une mise à jour de la config
      const updateResponse = await fetch('/api/proxy?endpoint=/api/config', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _method: 'PUT',
          ...config,
          updatedAt: new Date().toISOString()
        })
      })
      
      if (updateResponse.ok) {
        toast.success('Configuration forcée !')
        loadConfigs()
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const cleanBoutique = async () => {
    if (!confirm('Êtes-vous sûr de vouloir nettoyer la configuration boutique ? Cela va réinitialiser les valeurs par défaut.')) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      
      const cleanResponse = await fetch('/api/proxy?endpoint=/api/config/clean-boutique', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ _method: 'POST' })
      })
      
      if (cleanResponse.ok) {
        toast.success('Configuration boutique nettoyée !')
        loadConfigs()
      } else {
        toast.error('Erreur lors du nettoyage')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const testBoutique = () => {
    window.open('/shop', '_blank')
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Diagnostic Boutique</h1>
            <p className="text-gray-600 mt-1">Vérifiez la synchronisation de la configuration boutique</p>
            
            {/* État des serveurs */}
            <div className="flex space-x-4 mt-2">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${
                serverStatus.admin === 'online' ? 'bg-green-100 text-green-800' :
                serverStatus.admin === 'offline' ? 'bg-red-100 text-red-800' :
                serverStatus.admin === 'error' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                <span>🖥️ Serveur Admin:</span>
                <span>{
                  serverStatus.admin === 'online' ? '✅ En ligne' :
                  serverStatus.admin === 'offline' ? '❌ Hors ligne' :
                  serverStatus.admin === 'error' ? '⚠️ Erreur' :
                  serverStatus.admin === 'testing' ? '🔄 Test...' :
                  '❓ Inconnu'
                }</span>
              </div>
              
              <div className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${
                serverStatus.bot === 'online' ? 'bg-green-100 text-green-800' :
                serverStatus.bot === 'offline' ? 'bg-red-100 text-red-800' :
                serverStatus.bot === 'error' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                <span>🤖 Serveur Bot:</span>
                <span>{
                  serverStatus.bot === 'online' ? '✅ En ligne' :
                  serverStatus.bot === 'offline' ? '❌ Hors ligne' :
                  serverStatus.bot === 'error' ? '⚠️ Erreur' :
                  serverStatus.bot === 'testing' ? '🔄 Test...' :
                  '❓ Inconnu'
                }</span>
              </div>
            </div>
          </div>
          <div className="space-x-3">
            <button
              onClick={loadConfigs}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              🔄 Actualiser
            </button>
            <button
              onClick={cleanBoutique}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              🧹 Nettoyer Config
            </button>
            <button
              onClick={testBoutique}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              🏪 Tester Boutique
            </button>
          </div>
        </div>

        {/* Comparaison des configurations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Admin */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-blue-600">Configuration Admin</h2>
            {config ? (
              <div className="space-y-4">
                <div>
                  <strong>Nom boutique :</strong>
                  <span className="ml-2 text-gray-700">{config.boutique?.name || '(vide)'}</span>
                </div>
                <div>
                  <strong>Logo :</strong>
                  <span className="ml-2 text-gray-700">{config.boutique?.logo ? '✅ Défini' : '❌ Vide'}</span>
                </div>
                <div>
                  <strong>Background :</strong>
                  <span className="ml-2 text-gray-700">{config.boutique?.backgroundImage ? '✅ Défini' : '❌ Vide'}</span>
                </div>
                <div>
                  <strong>Sous-titre :</strong>
                  <span className="ml-2 text-gray-700">{config.boutique?.subtitle || '(vide)'}</span>
                </div>
                <div>
                  <strong>Mise à jour :</strong>
                  <span className="ml-2 text-gray-700">{config.updatedAt ? new Date(config.updatedAt).toLocaleString() : '(jamais)'}</span>
                </div>
              </div>
            ) : (
              <p className="text-red-500">❌ Impossible de charger la config admin</p>
            )}
            
            {config && (
              <details className="mt-4">
                <summary className="cursor-pointer text-blue-500">Voir JSON complet</summary>
                <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(config.boutique, null, 2)}
                </pre>
              </details>
            )}
          </div>

          {/* Configuration Publique */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-green-600">Configuration Publique (Boutique)</h2>
            {publicConfig ? (
              <div className="space-y-4">
                <div>
                  <strong>Nom boutique :</strong>
                  <span className="ml-2 text-gray-700">{publicConfig.boutique?.name || '(vide)'}</span>
                </div>
                <div>
                  <strong>Logo :</strong>
                  <span className="ml-2 text-gray-700">{publicConfig.boutique?.logo ? '✅ Défini' : '❌ Vide'}</span>
                </div>
                <div>
                  <strong>Background :</strong>
                  <span className="ml-2 text-gray-700">{publicConfig.boutique?.backgroundImage ? '✅ Défini' : '❌ Vide'}</span>
                </div>
                <div>
                  <strong>Sous-titre :</strong>
                  <span className="ml-2 text-gray-700">{publicConfig.boutique?.subtitle || '(vide)'}</span>
                </div>
              </div>
            ) : (
              <p className="text-red-500">❌ Impossible de charger la config publique</p>
            )}
            
            {publicConfig && (
              <details className="mt-4">
                <summary className="cursor-pointer text-green-500">Voir JSON complet</summary>
                <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(publicConfig.boutique, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>

        {/* Status de synchronisation */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Status de Synchronisation</h2>
          
          {config && publicConfig ? (
            <div className="space-y-3">
              <div className={`p-3 rounded ${
                config.boutique?.name === publicConfig.boutique?.name 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <strong>Nom :</strong> {
                  config.boutique?.name === publicConfig.boutique?.name 
                    ? '✅ Synchronisé' 
                    : `❌ Désynchronisé (Admin: "${config.boutique?.name}" vs Public: "${publicConfig.boutique?.name}")`
                }
              </div>
              
              <div className={`p-3 rounded ${
                config.boutique?.logo === publicConfig.boutique?.logo 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <strong>Logo :</strong> {
                  config.boutique?.logo === publicConfig.boutique?.logo 
                    ? '✅ Synchronisé' 
                    : '❌ Désynchronisé'
                }
              </div>
              
              <div className={`p-3 rounded ${
                config.boutique?.backgroundImage === publicConfig.boutique?.backgroundImage 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <strong>Background :</strong> {
                  config.boutique?.backgroundImage === publicConfig.boutique?.backgroundImage 
                    ? '✅ Synchronisé' 
                    : '❌ Désynchronisé'
                }
              </div>
            </div>
          ) : (
            <p className="text-yellow-600">⚠️ Impossible de comparer les configurations</p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔧 Instructions de dépannage</h3>
          <ol className="list-decimal list-inside space-y-2 text-yellow-700">
            <li>Vérifiez que les configurations admin et publique sont identiques</li>
            <li>Si elles diffèrent, utilisez "⚡ Forcer MAJ" pour resynchroniser</li>
            <li>Testez la boutique avec "🏪 Tester Boutique"</li>
            <li>Si le problème persiste, vérifiez les logs du serveur</li>
          </ol>
        </div>
      </div>
    </Layout>
  )
}