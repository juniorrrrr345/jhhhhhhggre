import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import toast from 'react-hot-toast'

export default function BotConfig() {
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
        console.log('✅ Config bot chargée:', data)
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

  const saveBotConfig = async () => {
    if (!config) return
    
    setSaving(true)
    try {
      const token = localStorage.getItem('adminToken')
      
      // Préparer les données sans la section boutique
      const { boutique, ...botData } = config
      
      const payload = {
        _method: 'PUT',
        ...botData
      }
      
      console.log('💾 Sauvegarde config bot:', payload)
      
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
        console.log('✅ Config bot sauvée:', result)
        toast.success('Configuration bot sauvée !')
        
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

  const updateConfig = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
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
            <h1 className="text-2xl font-bold text-gray-900">Configuration Bot</h1>
            <p className="text-gray-600 mt-1">Personnalisez les messages et comportements de votre bot Telegram</p>
          </div>
          <div className="space-x-3">
            <a
              href="/admin/config/welcome-social"
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded inline-block"
            >
              📱 Réseaux Sociaux
            </a>
          </div>
        </div>

        {/* Message de bienvenue */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🎉 Message de Bienvenue</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de bienvenue
                </label>
                <input
                  type="text"
                  value={config.welcome?.title || ''}
                  onChange={(e) => updateConfig('welcome', 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="🎉 Bienvenue !"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sous-titre
                </label>
                <input
                  type="text"
                  value={config.welcome?.subtitle || ''}
                  onChange={(e) => updateConfig('welcome', 'subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Découvrez nos services"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de l'image
                </label>
                <input
                  type="url"
                  value={config.welcome?.image || ''}
                  onChange={(e) => updateConfig('welcome', 'image', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://exemple.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texte additionnel
                </label>
                <textarea
                  value={config.welcome?.additionalText || ''}
                  onChange={(e) => updateConfig('welcome', 'additionalText', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Texte supplémentaire affiché sous les boutons"
                />
              </div>
            </div>

            {/* Aperçu */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Aperçu</h3>
              <div className="bg-white rounded-lg p-4 border">
                {config.welcome?.image && (
                  <img 
                    src={config.welcome.image} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded mb-3"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <h4 className="font-bold text-lg mb-2">
                  {config.welcome?.title || 'Titre de bienvenue'}
                </h4>
                <p className="text-gray-600 mb-3">
                  {config.welcome?.subtitle || 'Sous-titre de bienvenue'}
                </p>
                {config.welcome?.additionalText && (
                  <p className="text-sm text-gray-500">
                    {config.welcome.additionalText}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Textes du bot */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">💬 Textes du Bot</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Section Top Plugs</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre "Top Des Plugs"
                </label>
                <input
                  type="text"
                  value={config.botTexts?.topPlugsTitle || ''}
                  onChange={(e) => updateConfig('botTexts', 'topPlugsTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="🔌 Top Des Plugs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description "Top Des Plugs"
                </label>
                <textarea
                  value={config.botTexts?.topPlugsDescription || ''}
                  onChange={(e) => updateConfig('botTexts', 'topPlugsDescription', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Choisissez une option pour découvrir nos plugs"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Section VIP</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre VIP
                </label>
                <input
                  type="text"
                  value={config.botTexts?.vipTitle || ''}
                  onChange={(e) => updateConfig('botTexts', 'vipTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="👑 Boutiques VIP Premium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description VIP
                </label>
                <textarea
                  value={config.botTexts?.vipDescription || ''}
                  onChange={(e) => updateConfig('botTexts', 'vipDescription', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Découvrez nos boutiques sélectionnées"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Messages système */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">⚠️ Messages Système</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message "Aucun plug trouvé"
              </label>
              <textarea
                value={config.messages?.noPlugsFound || ''}
                onChange={(e) => updateConfig('messages', 'noPlugsFound', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="😅 Aucun plug trouvé pour vos critères..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message d'erreur générique
              </label>
              <input
                type="text"
                value={config.messages?.error || ''}
                onChange={(e) => updateConfig('messages', 'error', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="❌ Une erreur est survenue..."
              />
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🛠️ Textes des Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texte "Livraison"
              </label>
              <input
                type="text"
                value={config.botTexts?.deliveryServiceText || ''}
                onChange={(e) => updateConfig('botTexts', 'deliveryServiceText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="🚚 Livraison"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texte "Envoi postal"
              </label>
              <input
                type="text"
                value={config.botTexts?.postalServiceText || ''}
                onChange={(e) => updateConfig('botTexts', 'postalServiceText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="✈️ Envoi postal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texte "Meetup"
              </label>
              <input
                type="text"
                value={config.botTexts?.meetupServiceText || ''}
                onChange={(e) => updateConfig('botTexts', 'meetupServiceText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="🏠 Meetup"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={loadConfig}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            🔄 Recharger
          </button>
          <button
            onClick={saveBotConfig}
            disabled={saving}
            className={`px-6 py-2 rounded text-white font-medium ${
              saving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {saving ? '⏳ Sauvegarde...' : '💾 Sauvegarder Bot'}
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Modifiez les textes selon vos préférences</li>
            <li>Utilisez des emojis pour rendre les messages plus attractifs</li>
            <li>Cliquez "💾 Sauvegarder Bot" pour appliquer les changements</li>
            <li>Testez les modifications directement dans votre bot Telegram</li>
          </ol>
        </div>
      </div>
    </Layout>
  )
}