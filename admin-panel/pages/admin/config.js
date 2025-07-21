import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import toast, { Toaster } from 'react-hot-toast'

export default function ConfigurationSimple() {
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
      console.log('🔄 Chargement configuration...')
      
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/proxy?endpoint=/api/config', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Configuration chargée')
        
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
          },
          messages: {
            welcome: data.messages?.welcome || '',
            noPlugsFound: data.messages?.noPlugsFound || '',
            error: data.messages?.error || ''
          }
        })
        
        toast.success('Configuration chargée')
      } else {
        throw new Error('Erreur de chargement')
      }
    } catch (error) {
      console.error('❌ Erreur:', error)
      toast.error('Erreur de chargement')
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
      console.log('💾 Sauvegarde...')
      
      const response = await fetch('/api/proxy?endpoint=/api/config', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        toast.success('Configuration sauvée !')
        
        // Rafraîchir le cache
        try {
          await fetch('/api/proxy?endpoint=/api/cache/refresh', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          })
        } catch (e) {
          console.log('Cache refresh ignoré')
        }
        
      } else {
        throw new Error('Erreur de sauvegarde')
      }
    } catch (error) {
      console.error('❌ Erreur:', error)
      toast.error('Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const updateInterface = (field, value) => {
    setConfig(prev => ({
      ...prev,
      interface: { ...prev.interface, [field]: value }
    }))
  }

  const updateWelcome = (field, value) => {
    setConfig(prev => ({
      ...prev,
      welcome: { ...prev.welcome, [field]: value }
    }))
  }

  const updateButton = (buttonType, field, value) => {
    setConfig(prev => ({
      ...prev,
      buttons: {
        ...prev.buttons,
        [buttonType]: { ...prev.buttons[buttonType], [field]: value }
      }
    }))
  }

  const updateSocialMedia = (field, value) => {
    setConfig(prev => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [field]: value }
    }))
  }

  const updateMessages = (field, value) => {
    setConfig(prev => ({
      ...prev,
      messages: { ...prev.messages, [field]: value }
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Configuration - Admin Panel</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  ⚙️ Configuration
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Configurez votre boutique et votre bot Telegram
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <button
                  onClick={saveConfig}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Interface */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  🎨 Interface Boutique
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Titre principal</label>
                    <input
                      type="text"
                      value={config.interface.title}
                      onChange={(e) => updateInterface('title', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="PLUGS FINDER"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Première ligne</label>
                    <input
                      type="text"
                      value={config.interface.tagline1}
                      onChange={(e) => updateInterface('tagline1', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="JUSTE UNE"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Texte en surbrillance</label>
                    <input
                      type="text"
                      value={config.interface.taglineHighlight}
                      onChange={(e) => updateInterface('taglineHighlight', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="MINI-APP TELEGRAM"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dernière ligne</label>
                    <input
                      type="text"
                      value={config.interface.tagline2}
                      onChange={(e) => updateInterface('tagline2', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="CHILL"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image de fond (URL)</label>
                    <input
                      type="url"
                      value={config.interface.backgroundImage}
                      onChange={(e) => updateInterface('backgroundImage', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Message d'accueil Bot */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  🤖 Message d'Accueil Bot
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Texte de bienvenue</label>
                    <textarea
                      value={config.welcome.text}
                      onChange={(e) => updateWelcome('text', e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Message de bienvenue pour les nouveaux utilisateurs..."
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

            {/* Réseaux Sociaux */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  📱 Réseaux Sociaux
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telegram</label>
                    <input
                      type="text"
                      value={config.socialMedia.telegram}
                      onChange={(e) => updateSocialMedia('telegram', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="@votre_channel"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                    <input
                      type="text"
                      value={config.socialMedia.whatsapp}
                      onChange={(e) => updateSocialMedia('whatsapp', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+33123456789"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Messages du Bot */}
            <div className="bg-white shadow rounded-lg lg:col-span-2">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  💬 Messages du Bot
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message de bienvenue</label>
                    <textarea
                      value={config.messages.welcome}
                      onChange={(e) => updateMessages('welcome', e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Bienvenue sur notre bot !"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message "aucun résultat"</label>
                    <textarea
                      value={config.messages.noPlugsFound}
                      onChange={(e) => updateMessages('noPlugsFound', e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Aucune boutique trouvée."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message d'erreur</label>
                    <textarea
                      value={config.messages.error}
                      onChange={(e) => updateMessages('error', e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Une erreur s'est produite."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Aperçu Boutique */}
            <div className="bg-white shadow rounded-lg lg:col-span-2">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  👁️ Aperçu Boutique
                </h3>
                
                <div className="bg-black text-white p-6 rounded-lg" style={{
                  backgroundImage: config.interface.backgroundImage ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("${config.interface.backgroundImage}")` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">
                      {config.interface.title || 'PLUGS FINDER'}
                    </h2>
                    <div className="text-lg">
                      <span className="text-white mr-2">
                        {config.interface.tagline1 || 'JUSTE UNE'}
                      </span>
                      <span className="text-blue-400 font-bold mr-2">
                        {config.interface.taglineHighlight || 'MINI-APP TELEGRAM'}
                      </span>
                      <span className="text-white">
                        {config.interface.tagline2 || 'CHILL'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    onClick={() => window.open('/shop', '_blank')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    🔗 Ouvrir la boutique
                  </button>
                  <button
                    onClick={() => router.push('/admin/broadcast')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    📢 Messages diffusion
                  </button>
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