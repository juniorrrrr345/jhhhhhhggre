import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import toast from 'react-hot-toast'

export default function BoutiqueConfig() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
    
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/proxy?endpoint=/api/config', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
        console.log('✅ Config boutique chargée:', data.boutique)
      } else {
        const errorData = await response.json()
        console.error('❌ Erreur chargement config:', errorData)
        toast.error('Erreur lors du chargement')
      }
    } catch (error) {
      console.error('❌ Erreur:', error)
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const saveBoutiqueConfig = async () => {
    if (!config) return
    
    setSaving(true)
    try {
      const token = localStorage.getItem('adminToken')
      
      const payload = {
        _method: 'PUT',
        boutique: config.boutique
      }
      
      console.log('💾 Sauvegarde config boutique:', payload)
      
      const response = await fetch('/api/proxy?endpoint=/api/config', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Config boutique sauvée:', result)
        toast.success('Configuration boutique sauvée !')
        
        // Forcer le rechargement après un délai
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        const errorData = await response.json()
        console.error('❌ Erreur sauvegarde:', errorData)
        toast.error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error)
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const updateBoutiqueField = (field, value) => {
    setConfig(prev => ({
      ...prev,
      boutique: {
        ...prev.boutique,
        [field]: value
      }
    }))
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

  if (!config) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h1>
          <button
            onClick={loadConfig}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
          >
            Réessayer
          </button>
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
            <h1 className="text-2xl font-bold text-gray-900">Configuration Boutique</h1>
            <p className="text-gray-600 mt-1">Personnalisez l'apparence de votre boutique Vercel</p>
          </div>
          <div className="space-x-3">
            <button
              onClick={testBoutique}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              🏪 Tester Boutique
            </button>
            <a
              href="/admin/config/boutique-debug"
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded inline-block"
            >
              🔍 Diagnostic
            </a>
          </div>
        </div>

        {/* Configuration Boutique */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🏪 Paramètres Boutique</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations principales */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Informations principales</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la boutique
                </label>
                <input
                  type="text"
                  value={config.boutique?.name || ''}
                  onChange={(e) => updateBoutiqueField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Ma Boutique Premium"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Le nom qui apparaîtra en haut de votre boutique
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sous-titre
                </label>
                <input
                  type="text"
                  value={config.boutique?.subtitle || ''}
                  onChange={(e) => updateBoutiqueField('subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Votre destination shopping premium"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Description courte sous le nom
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL du logo
                </label>
                <input
                  type="url"
                  value={config.boutique?.logo || ''}
                  onChange={(e) => updateBoutiqueField('logo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://exemple.com/logo.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Logo qui apparaîtra dans l'en-tête
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image de fond
                </label>
                <input
                  type="url"
                  value={config.boutique?.backgroundImage || ''}
                  onChange={(e) => updateBoutiqueField('backgroundImage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://exemple.com/background.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Image de fond pour toute la boutique
                </p>
              </div>
            </div>

            {/* Textes de section VIP */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Section VIP</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre VIP
                </label>
                <input
                  type="text"
                  value={config.boutique?.vipTitle || ''}
                  onChange={(e) => updateBoutiqueField('vipTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 👑 Boutiques VIP Premium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sous-titre VIP
                </label>
                <input
                  type="text"
                  value={config.boutique?.vipSubtitle || ''}
                  onChange={(e) => updateBoutiqueField('vipSubtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Découvrez nos boutiques sélectionnées"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre recherche
                </label>
                <input
                  type="text"
                  value={config.boutique?.searchTitle || ''}
                  onChange={(e) => updateBoutiqueField('searchTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Recherche de boutiques"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sous-titre recherche
                </label>
                <input
                  type="text"
                  value={config.boutique?.searchSubtitle || ''}
                  onChange={(e) => updateBoutiqueField('searchSubtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Trouvez votre boutique idéale"
                />
              </div>
            </div>
          </div>

          {/* Aperçu */}
          {(config.boutique?.name || config.boutique?.logo) && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Aperçu</h3>
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border">
                {config.boutique?.logo ? (
                  <img 
                    src={config.boutique.logo} 
                    alt="Logo" 
                    className="h-12 w-12 rounded-lg object-cover"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 font-bold">
                      {config.boutique?.name ? config.boutique.name.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {config.boutique?.name || 'Nom de la boutique'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {config.boutique?.subtitle || 'Sous-titre de la boutique'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={loadConfig}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              🔄 Recharger
            </button>
            <button
              onClick={saveBoutiqueConfig}
              disabled={saving}
              className={`px-6 py-2 rounded text-white font-medium ${
                saving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {saving ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Remplissez les champs ci-dessus avec vos informations</li>
            <li>Cliquez sur "💾 Sauvegarder" pour appliquer les changements</li>
            <li>Utilisez "🏪 Tester Boutique" pour voir le résultat</li>
            <li>Si les changements ne s'affichent pas, utilisez "🔍 Diagnostic" pour déboguer</li>
          </ol>
        </div>
      </div>
    </Layout>
  )
}