import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { 
  PlusIcon,
  TrashIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const SOCIAL_ICONS = {
  'Telegram': '📱',
  'WhatsApp': '💬',
  'Instagram': '📸',
  'Facebook': '👥',
  'Twitter': '🐦',
  'TikTok': '🎵',
  'YouTube': '📺',
  'Discord': '🎮',
  'Snapchat': '👻',
  'LinkedIn': '💼',
  'Website': '🌐',
  'Email': '📧',
  'Phone': '📞',
  'Autre': '🔗'
}

export default function Reseaux() {
  const [config, setConfig] = useState({
    bot: {
      socialMedia: []
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }

    fetchConfig(token)
  }, [])

  const fetchConfig = async (token) => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL
      const response = await fetch(`${apiBaseUrl}/api/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          endpoint: '/admin/config',
          method: 'GET'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setConfig({
          bot: {
            socialMedia: data.bot?.socialMedia || []
          }
        })
      }
    } catch (error) {
      console.error('❌ Erreur chargement config:', error)
      toast.error('Erreur de chargement de la configuration')
    } finally {
      setLoading(false)
    }
  }

  const addSocialMedia = () => {
    setConfig(prev => ({
      ...prev,
      bot: {
        ...prev.bot,
        socialMedia: [
          ...prev.bot.socialMedia,
          {
            platform: 'Telegram',
            name: '',
            url: '',
            id: Date.now()
          }
        ]
      }
    }))
  }

  const updateSocialMedia = (id, field, value) => {
    setConfig(prev => ({
      ...prev,
      bot: {
        ...prev.bot,
        socialMedia: prev.bot.socialMedia.map(social =>
          social.id === id ? { ...social, [field]: value } : social
        )
      }
    }))
  }

  const removeSocialMedia = (id) => {
    setConfig(prev => ({
      ...prev,
      bot: {
        ...prev.bot,
        socialMedia: prev.bot.socialMedia.filter(social => social.id !== id)
      }
    }))
  }

  const saveConfig = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      toast.error('Non authentifié')
      return
    }

    // Validation
    const invalidSocials = config.bot.socialMedia.filter(social => 
      !social.name.trim() || !social.url.trim()
    )
    
    if (invalidSocials.length > 0) {
      toast.error('Veuillez remplir tous les champs (nom et URL)')
      return
    }

    setSaving(true)

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL
      const response = await fetch(`${apiBaseUrl}/api/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          endpoint: '/admin/config',
          method: 'PUT',
          data: {
            bot: config.bot
          }
        })
      })

      if (response.ok) {
        toast.success('Configuration des réseaux sociaux sauvegardée !')
      } else {
        throw new Error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const generatePreviewMessage = () => {
    if (config.bot.socialMedia.length === 0) {
      return "🤖 Bienvenue sur notre bot !\n\nAucun réseau social configuré."
    }

    let message = "🤖 Bienvenue sur notre bot !\n\n📱 Suivez-nous :"
    
    config.bot.socialMedia.forEach(social => {
      const icon = SOCIAL_ICONS[social.platform] || '🔗'
      message += `\n${icon} ${social.name}`
    })

    return message
  }

  if (loading) {
    return (
      <Layout title="Réseaux Sociaux">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Réseaux Sociaux">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📱 Configuration Réseaux Sociaux</h1>
          <p className="mt-2 text-gray-600">
            Configurez les réseaux sociaux qui s'afficheront dans le message d'accueil du bot Telegram (/start)
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={addSocialMedia}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Ajouter un réseau
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            {showPreview ? 'Masquer' : 'Aperçu'}
          </button>
        </div>

        {/* Aperçu du message */}
        {showPreview && (
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">📱 Aperçu du message d'accueil</h3>
            <div className="bg-white border border-gray-300 rounded-lg p-4 font-mono text-sm whitespace-pre-line">
              {generatePreviewMessage()}
            </div>
          </div>
        )}

        {/* Liste des réseaux sociaux */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Réseaux sociaux configurés ({config.bot.socialMedia.length})
            </h3>
          </div>

          <div className="p-6">
            {config.bot.socialMedia.length === 0 ? (
              <div className="text-center py-8">
                <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun réseau social</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Commencez par ajouter vos premiers réseaux sociaux
                </p>
                <div className="mt-6">
                  <button
                    onClick={addSocialMedia}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Ajouter un réseau
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {config.bot.socialMedia.map((social, index) => (
                  <div key={social.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Plateforme */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Plateforme
                          </label>
                          <select
                            value={social.platform}
                            onChange={(e) => updateSocialMedia(social.id, 'platform', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {Object.keys(SOCIAL_ICONS).map(platform => (
                              <option key={platform} value={platform}>
                                {SOCIAL_ICONS[platform]} {platform}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Nom d'affichage */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom d'affichage
                          </label>
                          <input
                            type="text"
                            value={social.name}
                            onChange={(e) => updateSocialMedia(social.id, 'name', e.target.value)}
                            placeholder="ex: @moncompte"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        {/* URL */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL/Lien
                          </label>
                          <input
                            type="url"
                            value={social.url}
                            onChange={(e) => updateSocialMedia(social.id, 'url', e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Bouton supprimer */}
                      <button
                        onClick={() => removeSocialMedia(social.id)}
                        className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                        title="Supprimer ce réseau"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Aperçu de l'élément */}
                    <div className="mt-3 p-2 bg-gray-50 rounded-md text-sm">
                      <span className="font-medium">Aperçu :</span>
                      <span className="ml-2">
                        {SOCIAL_ICONS[social.platform]} {social.name || 'Nom non défini'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        {config.bot.socialMedia.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={saveConfig}
              disabled={saving}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Sauvegarder la configuration
                </>
              )}
            </button>
          </div>
        )}

        {/* Informations */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-800 mb-2">ℹ️ Comment ça fonctionne</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Les réseaux sociaux configurés ici s'afficheront dans le message d'accueil du bot (/start)</li>
            <li>• Chaque réseau aura un bouton cliquable qui redirigera vers l'URL configurée</li>
            <li>• L'ordre d'affichage correspond à l'ordre de cette liste</li>
            <li>• Les modifications sont appliquées immédiatement sur le bot</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}