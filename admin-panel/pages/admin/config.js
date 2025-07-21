import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import toast, { Toaster } from 'react-hot-toast'

export default function CompleteConfig() {
  const [config, setConfig] = useState({
    // Configuration Interface Boutique
    interface: {
      title: 'PLUGS FINDER',
      tagline1: 'JUSTE UNE',
      taglineHighlight: 'MINI-APP TELEGRAM',
      tagline2: 'CHILL',
      backgroundImage: ''
    },
    // Message d'accueil Bot
    welcome: {
      text: '',
      image: '',
      socialMedia: []
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
    },
    // Messages du bot
    messages: {
      welcome: '',
      noPlugsFound: '',
      error: ''
    }
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
    fetchConfig(token)
  }, [])

  const fetchConfig = async (token) => {
    try {
      setLoading(true)
      console.log('🔄 Chargement configuration...')
      
      const response = await fetch(`http://localhost:3000/api/config`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Données reçues:', Object.keys(data))
        
        setConfig({
          interface: {
            title: data.interface?.title || 'PLUGS FINDER',
            tagline1: data.interface?.tagline1 || 'JUSTE UNE',
            taglineHighlight: data.interface?.taglineHighlight || 'MINI-APP TELEGRAM',
            tagline2: data.interface?.tagline2 || 'CHILL',
            backgroundImage: data.interface?.backgroundImage || ''
          },
          welcome: {
            text: data.welcome?.text || '',
            image: data.welcome?.image || '',
            socialMedia: data.welcome?.socialMedia || []
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
          },
          messages: {
            welcome: data.messages?.welcome || '',
            noPlugsFound: data.messages?.noPlugsFound || '',
            error: data.messages?.error || ''
          }
        })
        
        toast.success('Configuration chargée avec succès !')
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Erreur chargement config:', error)
      toast.error('Erreur de chargement: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      toast.error('Non authentifié')
      return
    }

    setSaving(true)

    try {
      console.log('💾 Sauvegarde configuration complète...')
      
      // Préparer toutes les données
      const cleanData = {
        interface: config.interface,
        welcome: config.welcome,
        buttons: config.buttons,
        socialMedia: config.socialMedia,
        messages: config.messages
      }
      
      console.log('📦 Données à sauvegarder:', Object.keys(cleanData))

      const response = await fetch('http://localhost:3000/api/config', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanData)
      })

      if (response.ok) {
        console.log('✅ Configuration sauvée')
        toast.success('Configuration sauvée avec succès !')
        
        // Forcer le rafraîchissement du cache
        try {
          await fetch('http://localhost:3000/api/cache/refresh', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          console.log('✅ Cache rafraîchi')
        } catch (cacheError) {
          console.log('⚠️ Erreur cache refresh:', cacheError.message)
        }
        
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error)
      toast.error('Erreur de sauvegarde: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (path, value) => {
    setConfig(prev => {
      const newConfig = { ...prev }
      const keys = path.split('.')
      let current = newConfig
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      console.log(`📝 Mis à jour: ${path} = ${value}`)
      return newConfig
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Configuration Complète - Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">⚙️ Configuration Complète</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Boutique et Bot Telegram
                </p>
              </div>
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                ← Retour
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="space-y-6">
            
            {/* Aperçu Boutique */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
              <h2 className="text-lg font-semibold mb-4">🏪 Aperçu Boutique</h2>
              <div className="bg-black bg-opacity-30 rounded-lg p-4">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">
                    {config.interface.title}
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span>{config.interface.tagline1}</span>
                    <span className="bg-blue-500 px-2 py-1 rounded text-xs font-bold">
                      {config.interface.taglineHighlight}
                    </span>
                    <span>{config.interface.tagline2}</span>
                  </div>
                  {config.interface.backgroundImage && (
                    <p className="text-xs mt-2 opacity-75">🖼️ Image de fond configurée</p>
                  )}
                </div>
              </div>
            </div>

            {/* Configuration Interface Boutique */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🎨 Interface Boutique</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre principal *
                  </label>
                  <input
                    type="text"
                    value={config.interface.title}
                    onChange={(e) => updateConfig('interface.title', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 text-lg font-bold"
                    placeholder="PLUGS FINDER"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Première ligne
                    </label>
                    <input
                      type="text"
                      value={config.interface.tagline1}
                      onChange={(e) => updateConfig('interface.tagline1', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      placeholder="JUSTE UNE"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texte mis en avant
                    </label>
                    <input
                      type="text"
                      value={config.interface.taglineHighlight}
                      onChange={(e) => updateConfig('interface.taglineHighlight', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      placeholder="MINI-APP TELEGRAM"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dernière ligne
                    </label>
                    <input
                      type="text"
                      value={config.interface.tagline2}
                      onChange={(e) => updateConfig('interface.tagline2', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      placeholder="CHILL"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image de fond (URL)
                  </label>
                  <input
                    type="url"
                    value={config.interface.backgroundImage}
                    onChange={(e) => updateConfig('interface.backgroundImage', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="https://example.com/background.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Message d'Accueil Bot */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🤖 Message d'Accueil Bot</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image d'accueil (URL)
                  </label>
                  <input
                    type="url"
                    value={config.welcome.image}
                    onChange={(e) => updateConfig('welcome.image', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="https://example.com/welcome-image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texte de bienvenue
                  </label>
                  <textarea
                    value={config.welcome.text}
                    onChange={(e) => updateConfig('welcome.text', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 h-20"
                    placeholder="🎉 Bienvenue sur notre bot premium !"
                  />
                </div>
              </div>
            </div>

            {/* Boutons du Bot */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🔘 Boutons du Bot</h2>
              <div className="space-y-6">
                
                {/* Bouton Contact */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-md font-medium text-gray-900">📞 Bouton Contact</h3>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.buttons.contact.enabled}
                        onChange={(e) => updateConfig('buttons.contact.enabled', e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 ${config.buttons.contact.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${config.buttons.contact.enabled ? 'translate-x-5' : 'translate-x-0'} translate-y-0.5`}></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">Activé</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texte du bouton
                      </label>
                      <input
                        type="text"
                        value={config.buttons.contact.text}
                        onChange={(e) => updateConfig('buttons.contact.text', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3"
                        placeholder="📞 Contact"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message affiché
                      </label>
                      <textarea
                        value={config.buttons.contact.content}
                        onChange={(e) => updateConfig('buttons.contact.content', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 h-20"
                        placeholder="Contactez-nous pour plus d'informations."
                      />
                    </div>
                  </div>
                </div>

                {/* Bouton Info */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-md font-medium text-gray-900">ℹ️ Bouton Info</h3>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.buttons.info.enabled}
                        onChange={(e) => updateConfig('buttons.info.enabled', e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 ${config.buttons.info.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${config.buttons.info.enabled ? 'translate-x-5' : 'translate-x-0'} translate-y-0.5`}></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">Activé</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texte du bouton
                      </label>
                      <input
                        type="text"
                        value={config.buttons.info.text}
                        onChange={(e) => updateConfig('buttons.info.text', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3"
                        placeholder="ℹ️ Info"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message affiché
                      </label>
                      <textarea
                        value={config.buttons.info.content}
                        onChange={(e) => updateConfig('buttons.info.content', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 h-20"
                        placeholder="Informations sur notre plateforme."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Réseaux Sociaux */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📱 Réseaux Sociaux</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telegram
                  </label>
                  <input
                    type="text"
                    value={config.socialMedia.telegram}
                    onChange={(e) => updateConfig('socialMedia.telegram', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="@votre_canal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={config.socialMedia.whatsapp}
                    onChange={(e) => updateConfig('socialMedia.whatsapp', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="+33123456789"
                  />
                </div>
              </div>
            </div>

            {/* Messages du Bot */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">💬 Messages du Bot</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message de bienvenue
                  </label>
                  <input
                    type="text"
                    value={config.messages.welcome}
                    onChange={(e) => updateConfig('messages.welcome', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="Bienvenue !"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message "aucun résultat"
                  </label>
                  <input
                    type="text"
                    value={config.messages.noPlugsFound}
                    onChange={(e) => updateConfig('messages.noPlugsFound', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="Aucun résultat trouvé"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message d'erreur
                  </label>
                  <input
                    type="text"
                    value={config.messages.error}
                    onChange={(e) => updateConfig('messages.error', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="Une erreur est survenue"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={saveConfig}
                  disabled={saving}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                    saving
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {saving ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sauvegarde en cours...
                    </div>
                  ) : (
                    '💾 Sauvegarder la configuration'
                  )}
                </button>
                
                <button
                  onClick={() => window.open('/shop', '_blank')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  👁️ Voir la boutique
                </button>
                
                <button
                  onClick={() => router.push('/admin/broadcast')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                >
                  📢 Messages diffusion
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}