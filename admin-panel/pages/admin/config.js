import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import toast from 'react-hot-toast'
import {
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

export default function Config() {
  const [config, setConfig] = useState({
    messages: {
      welcome: '',
      noPlugsFound: '',
      error: ''
    },
    socialMedia: {
      telegram: '',
      whatsapp: '',
      website: ''
    },
    buttons: {
      topPlugs: { text: '🔌 Top Des Plugs' },
      contact: { text: '📞 Contact' },
      info: { text: 'ℹ️ Info' }
    },
    filters: {
      all: 'Tous les plugs',
      byService: 'Par service',
      byCountry: 'Par pays'
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
    fetchConfig(token)
  }, [])

  const fetchConfig = async (token) => {
    try {
      setLoading(true)
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL
      console.log('🔍 Fetching config from:', apiBaseUrl)
      
      const response = await fetch(`${apiBaseUrl}/api/config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      console.log('⚙️ Config fetch response:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Config loaded:', data)
        setConfig(data)
      } else {
        console.error('❌ Config fetch error:', response.status, response.statusText)
        toast.error('Erreur lors du chargement')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

        const saveConfig = async () => {
        const token = localStorage.getItem('adminToken')
        setSaving(true)

        try {
          // Essayer d'abord l'API directe
          let success = false
          try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
            console.log('💾 Admin config tentative directe:', apiBaseUrl)
            
            const response = await fetch(`${apiBaseUrl}/api/config`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(config)
            })

            if (response.ok) {
              console.log('✅ Admin config direct réussi')
              success = true
              toast.success('Configuration sauvegardée !')
              
              // Recharger automatiquement le bot après sauvegarde
              setTimeout(() => {
                reloadBot();
              }, 1000);
            } else {
              throw new Error(`HTTP ${response.status}`)
            }
          } catch (directError) {
            console.log('❌ Admin config direct échoué:', directError.message)
            console.log('🔄 Admin config tentative via proxy...')
            
            // Fallback vers le proxy
            const proxyResponse = await fetch('/api/proxy?endpoint=/api/config', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token
              },
              body: JSON.stringify(config)
            })

            if (proxyResponse.ok) {
              console.log('✅ Admin config proxy réussi')
              success = true
              toast.success('Configuration sauvegardée via proxy !')
            } else {
              throw new Error(`Proxy failed: HTTP ${proxyResponse.status}`)
            }
          }

          if (!success) {
            toast.error('Erreur lors de la sauvegarde')
          }
        } catch (error) {
          console.error('💥 Admin config error final:', error)
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

  const updateNestedConfig = (section, subsection, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }))
  }

  // Fonction pour recharger le bot
  const reloadBot = async () => {
    const token = localStorage.getItem('adminToken');

    try {
      console.log('🔄 Rechargement du bot...');
      
      // Essayer l'API directe d'abord
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com';
        const response = await fetch(`${apiBaseUrl}/api/bot/reload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          console.log('✅ Bot rechargé avec succès');
        }
      } catch (directError) {
        console.log('❌ Rechargement direct échoué, tentative proxy...');
        
        // Fallback vers le proxy
        await fetch('/api/reload-bot', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('💥 Erreur rechargement bot:', error);
    }
  }

  if (loading) {
    return (
      <Layout title="Configuration Bot">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Configuration Bot">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration du Bot</h1>
          <p className="text-gray-600">Personnalisez les messages et paramètres de votre bot Telegram</p>
        </div>

        {/* Messages du bot */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
              Messages du Bot
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Message d'accueil */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message d'accueil (/start)
              </label>
              <textarea
                value={config.messages?.welcome || ''}
                onChange={(e) => updateConfig('messages', 'welcome', e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Bienvenue sur notre bot ! 🎉..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Message affiché quand un utilisateur tape /start
              </p>
            </div>

            {/* Message aucun plug trouvé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message "Aucun plug trouvé"
              </label>
              <textarea
                value={config.messages?.noPlugsFound || ''}
                onChange={(e) => updateConfig('messages', 'noPlugsFound', e.target.value)}
                rows={2}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="😅 Aucun plug trouvé pour vos critères..."
              />
            </div>

            {/* Message d'erreur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message d'erreur générique
              </label>
              <input
                type="text"
                value={config.messages?.error || ''}
                onChange={(e) => updateConfig('messages', 'error', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="❌ Une erreur est survenue..."
              />
            </div>
          </div>
        </div>

        {/* Textes des boutons */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Textes des Boutons</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bouton "Top Des Plugs"
                </label>
                <input
                  type="text"
                  value={config.buttons?.topPlugs?.text || ''}
                  onChange={(e) => updateNestedConfig('buttons', 'topPlugs', 'text', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="🔌 Top Des Plugs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bouton "Contact"
                </label>
                <input
                  type="text"
                  value={config.buttons?.contact?.text || ''}
                  onChange={(e) => updateNestedConfig('buttons', 'contact', 'text', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="📞 Contact"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu page "Contact"
                </label>
                <textarea
                  value={config.buttons?.contact?.content || ''}
                  onChange={(e) => updateNestedConfig('buttons', 'contact', 'content', e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contactez-nous pour plus d'informations..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bouton "Info"
                </label>
                <input
                  type="text"
                  value={config.buttons?.info?.text || ''}
                  onChange={(e) => updateNestedConfig('buttons', 'info', 'text', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ℹ️ Info"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu page "Info"
                </label>
                <textarea
                  value={config.buttons?.info?.content || ''}
                  onChange={(e) => updateNestedConfig('buttons', 'info', 'content', e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Informations sur notre plateforme..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <GlobeAltIcon className="w-5 h-5 mr-2" />
              Réseaux Sociaux
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telegram
              </label>
              <input
                type="url"
                value={config.socialMedia?.telegram || ''}
                onChange={(e) => updateConfig('socialMedia', 'telegram', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://t.me/votre_channel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp
              </label>
              <input
                type="url"
                value={config.socialMedia?.whatsapp || ''}
                onChange={(e) => updateConfig('socialMedia', 'whatsapp', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://wa.me/33123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Web
              </label>
              <input
                type="url"
                value={config.socialMedia?.website || ''}
                onChange={(e) => updateConfig('socialMedia', 'website', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://votre-site.com"
              />
            </div>
          </div>
        </div>

        {/* Textes des filtres */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Textes des Filtres</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  "Tous les plugs"
                </label>
                <input
                  type="text"
                  value={config.filters?.all || ''}
                  onChange={(e) => updateConfig('filters', 'all', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tous les plugs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  "Par service"
                </label>
                <input
                  type="text"
                  value={config.filters?.byService || ''}
                  onChange={(e) => updateConfig('filters', 'byService', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Par service"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  "Par pays"
                </label>
                <input
                  type="text"
                  value={config.filters?.byCountry || ''}
                  onChange={(e) => updateConfig('filters', 'byCountry', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Par pays"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
          <button
            onClick={saveConfig}
            disabled={saving}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <CheckIcon className="w-5 h-5 mr-2" />
                Sauvegarder la configuration
              </>
            )}
          </button>
        </div>
      </div>
    </Layout>
  )
}