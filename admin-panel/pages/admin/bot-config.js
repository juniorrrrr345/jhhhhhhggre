import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import toast, { Toaster } from 'react-hot-toast'
import { simpleApi } from '../../lib/api-simple'

export default function BotConfiguration() {
  const [config, setConfig] = useState({
    // Message d'accueil Bot
    welcome: {
      text: '',
      image: ''
    },
    // Boutons du bot
    buttons: {
      contact: {
        text: '📞 Contact',
        content: 'Contactez-nous pour plus d\'informations.',
        enabled: true
      },
      info: {
        text: 'ℹ️ Info',
        content: 'Informations sur notre plateforme.',
        enabled: true
      }
    },
    // Réseaux sociaux globaux
    socialMedia: {
      telegram: '',
      whatsapp: ''
    }
  })

  // États pour les messages de diffusion
  const [message, setMessage] = useState('')
  const [image, setImage] = useState('')
  const [sending, setSending] = useState(false)
  const [stats, setStats] = useState({ sent: 0, failed: 0, total: 0 })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Chargement configuration bot...')
      
      const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
      
      // Utiliser l'API simple avec gestion d'erreur améliorée
      const data = await simpleApi.getConfig(token)
      console.log('✅ Configuration bot chargée:', data)
      
      setConfig({
        welcome: {
          text: data.welcome?.text || '',
          image: data.welcome?.image || ''
        },
        buttons: {
            contact: {
              text: data.buttons?.contact?.text || '📞 Contact',
              content: data.buttons?.contact?.content || 'Contactez-nous pour plus d\'informations.',
              enabled: data.buttons?.contact?.enabled !== false
            },
            info: {
              text: data.buttons?.info?.text || 'ℹ️ Info',
              content: data.buttons?.info?.content || 'Informations sur notre plateforme.',
              enabled: data.buttons?.info?.enabled !== false
            }
          },
          socialMedia: {
            telegram: data.socialMedia?.telegram || '',
            whatsapp: data.socialMedia?.whatsapp || ''
          }
        })
        
        toast.success('Configuration chargée')
      } catch (error) {
        console.error('❌ Erreur chargement config:', error)
        setError(error.message)
        if (error.message.includes('429')) {
          toast.error('Trop de tentatives. Veuillez patienter quelques secondes.')
        } else if (error.message.includes('401')) {
          toast.error('Session expirée. Veuillez vous reconnecter.')
          router.push('/')
        } else if (error.message.includes('Timeout')) {
          toast.error('Le serveur met trop de temps à répondre. Configuration par défaut utilisée.')
          // Utiliser une configuration par défaut au lieu de rester bloqué
          setConfig({
            welcome: {
              text: 'Bienvenue sur SafePlugLink! Explorez nos services.',
              image: ''
            },
            buttons: {
              contact: {
                text: '📞 Contact',
                content: 'Contactez-nous pour plus d\'informations.',
                enabled: true
              },
              info: {
                text: 'ℹ️ Info',
                content: 'Informations sur notre plateforme.',
                enabled: true
              }
            },
            socialMedia: {
              telegram: '',
              whatsapp: ''
            }
          })
        } else {
          toast.error('Erreur lors du chargement de la configuration: ' + error.message)
        }
      } finally {
        setLoading(false)
      }
    }

  const saveConfig = async () => {
    try {
      setSaving(true)
      console.log('💾 Sauvegarde configuration bot...')
      
      const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
      
      const configData = {
        welcome: config.welcome,
        buttons: config.buttons,
        socialMedia: config.socialMedia
      }
      
      await simpleApi.updateConfig(token, configData)
      console.log('✅ Configuration bot sauvegardée')
      toast.success('Configuration sauvegardée avec succès !')
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error)
      if (error.message.includes('429')) {
        toast.error('Trop de tentatives. Veuillez patienter quelques secondes.')
      } else if (error.message.includes('401')) {
        toast.error('Session expirée. Veuillez vous reconnecter.')
        router.push('/')
      } else {
        toast.error('Erreur lors de la sauvegarde: ' + error.message)
      }
    } finally {
      setSaving(false)
    }
  }

  const updateWelcome = (field, value) => {
    setConfig(prev => ({
      ...prev,
      welcome: {
        ...prev.welcome,
        [field]: value
      }
    }))
  }

  const updateButton = (buttonType, field, value) => {
    setConfig(prev => ({
      ...prev,
      buttons: {
        ...prev.buttons,
        [buttonType]: {
          ...prev.buttons[buttonType],
          [field]: value
        }
      }
    }))
  }

  const updateSocialMedia = (platform, value) => {
    setConfig(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }))
  }

  const sendBroadcast = async () => {
    if (!message.trim()) {
      toast.error('Veuillez saisir un message')
      return
    }

    const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
    if (!token) {
      toast.error('Non authentifié')
      return
    }

    setSending(true)
    setStats({ sent: 0, failed: 0, total: 0 })

    try {
      const broadcastData = {
        message: message.trim(),
        image: image.trim() || null
      }
      
      const data = await simpleApi.broadcast(token, broadcastData)
      setStats({
        sent: data.sent || 0,
        failed: data.failed || 0,
        total: data.total || 0
      })
      toast.success(`Message envoyé à ${data.sent} utilisateurs !`)
      setMessage('')
      setImage('')
      
    } catch (error) {
      console.error('❌ Erreur broadcast:', error)
      if (error.message.includes('429')) {
        toast.error('Trop de tentatives. Veuillez patienter.')
      } else if (error.message.includes('401')) {
        toast.error('Session expirée. Veuillez vous reconnecter.')
        router.push('/')
      } else {
        toast.error('Erreur : ' + error.message)
      }
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Configuration Bot - Admin Panel</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Chargement de la configuration...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Configuration Bot Telegram - Admin Panel</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="mb-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Retour
            </button>
            
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                  🤖 Configuration Bot Telegram
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Configurez le message d'accueil, les réseaux sociaux et envoyez des messages à tous les utilisateurs
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
                <button
                  onClick={() => {
                    simpleApi.clearCache()
                    fetchConfig()
                    toast.success('Cache nettoyé et configuration rechargée')
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  🔄 Actualiser
                </button>
                <button
                  onClick={saveConfig}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Message d'accueil */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  👋 Message d'Accueil (/start)
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message de bienvenue</label>
                    <textarea
                      value={config.welcome.text}
                      onChange={(e) => updateWelcome('text', e.target.value)}
                      rows={4}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Bienvenue sur notre bot Telegram !"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image d'accueil (URL)</label>
                    <input
                      type="url"
                      value={config.welcome.image}
                      onChange={(e) => updateWelcome('image', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/welcome.jpg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Réseaux Sociaux */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  📱 Réseaux Sociaux du Bot
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telegram</label>
                    <input
                      type="text"
                      value={config.socialMedia.telegram}
                      onChange={(e) => updateSocialMedia('telegram', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="@votre_channel ou https://t.me/votre_channel"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Affiché dans le menu contact du bot
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                    <input
                      type="text"
                      value={config.socialMedia.whatsapp}
                      onChange={(e) => updateSocialMedia('whatsapp', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+33123456789 ou https://wa.me/33123456789"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Affiché dans le menu contact du bot
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons du Bot */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  🔘 Boutons du Bot
                </h3>
                
                <div className="space-y-6">
                  {/* Bouton Contact */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Bouton Contact</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.buttons.contact.enabled}
                          onChange={(e) => updateButton('contact', 'enabled', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Activé</span>
                      </label>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Texte du bouton</label>
                        <input
                          type="text"
                          value={config.buttons.contact.text}
                          onChange={(e) => updateButton('contact', 'text', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Contenu</label>
                        <textarea
                          value={config.buttons.contact.content}
                          onChange={(e) => updateButton('contact', 'content', e.target.value)}
                          rows={2}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bouton Info */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Bouton Info</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.buttons.info.enabled}
                          onChange={(e) => updateButton('info', 'enabled', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Activé</span>
                      </label>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Texte du bouton</label>
                        <input
                          type="text"
                          value={config.buttons.info.text}
                          onChange={(e) => updateButton('info', 'text', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Contenu</label>
                        <textarea
                          value={config.buttons.info.content}
                          onChange={(e) => updateButton('info', 'content', e.target.value)}
                          rows={2}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages aux utilisateurs */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  📢 Messages aux Utilisateurs
                </h3>

                {/* Statistiques */}
                {(stats.sent > 0 || stats.failed > 0) && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">📊 Dernier envoi</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
                        <div className="text-xs text-gray-500">Envoyés</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                        <div className="text-xs text-gray-500">Échecs</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message *</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Votre message à tous les utilisateurs..."
                      disabled={sending}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image (optionnel)</label>
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                      disabled={sending}
                    />
                  </div>

                  <button
                    onClick={sendBroadcast}
                    disabled={sending || !message.trim()}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        📢 Envoyer à tous les utilisateurs
                      </>
                    )}
                  </button>
                </div>

                {/* Avertissement */}
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="text-yellow-400 text-sm">⚠️</div>
                    </div>
                    <div className="ml-2">
                      <p className="text-xs text-yellow-700">
                        Ce message sera envoyé à tous les utilisateurs du bot. Vérifiez bien le contenu avant l'envoi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Toaster position="top-right" />
    </>
  )
}