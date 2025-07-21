import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import toast, { Toaster } from 'react-hot-toast'
import SocialMediaManager from '../../components/SocialMediaManager'

// Fonction wrapper pour toast avec gestion d'erreur
const safeToast = {
  success: (message, options = {}) => {
    try {
      return toast.success(message, options)
    } catch (e) {
      console.log('Toast success:', message)
    }
  },
  error: (message, options = {}) => {
    try {
      return toast.error(message, options)
    } catch (e) {
      console.log('Toast error:', message)
    }
  },
  info: (message, options = {}) => {
    try {
      return toast(message, { icon: '💾', ...options })
    } catch (e) {
      console.log('Toast info:', message)
    }
  }
}

export default function SimpleConfig() {
  const [config, setConfig] = useState({
    // Configuration Interface
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
      socialMedia: [] // Réseaux sociaux personnalisés d'accueil
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
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let token = localStorage.getItem('adminToken')
    if (!token) {
      // Définir le token par défaut au lieu de rediriger
      token = 'JuniorAdmon123'
      localStorage.setItem('adminToken', token)
      console.log('🔑 Token par défaut défini')
    }
    fetchConfig(token)
  }, [])

  const fetchConfig = async (token) => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/proxy?endpoint=/api/config&t=${Date.now()}`, {
        headers: { 
          'Authorization': token,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })

      if (response.ok) {
        const data = await response.json()
        
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
          }
        })
        
        safeToast.success('Configuration chargée !')
      } else {
        safeToast.error(`Erreur: ${response.status}`)
      }
    } catch (error) {
      console.error('Erreur:', error)
      safeToast.error(`Erreur: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    const token = localStorage.getItem('adminToken')
    
    // Vérifier que le token existe
    if (!token) {
      safeToast.error('Token d\'authentification manquant. Veuillez vous reconnecter.')
      return
    }
    
    console.log('🔑 Token trouvé:', token ? `***${token.slice(-4)}` : 'absent')
    setSaving(true)
    
    // Protection timeout global pour éviter le blocage infini
    const globalTimeout = setTimeout(() => {
      console.error('⏰ Timeout global de sauvegarde')
      setSaving(false)
      safeToast.error('Timeout: Sauvegarde trop longue')
    }, 30000) // 30 secondes max

    try {
      console.log('💾 Début sauvegarde...')
      safeToast.info('Sauvegarde...')

      // Nettoyer les données avant envoi (éviter les problèmes de sérialisation)
      const cleanData = JSON.parse(JSON.stringify(config))
      
      // Supprimer les champs qui peuvent poser problème
      delete cleanData._id
      delete cleanData.__v
      delete cleanData.updatedAt
      delete cleanData.createdAt
      
      console.log('📦 Données nettoyées:', Object.keys(cleanData))

      // Sauvegarde de la configuration
      const response = await Promise.race([
        fetch('/api/proxy?endpoint=/api/config', {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            _method: 'PUT',
            ...cleanData
          })
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout sauvegarde')), 15000)
        )
      ])

      if (response.ok) {
        console.log('✅ Configuration sauvée')
        safeToast.success('Configuration sauvée !')
        
        // Synchronisation immédiate avec la boutique
        syncWithShop()
        
        // Rechargement du bot (non-bloquant)
        setTimeout(async () => {
          try {
            console.log('🔄 Rechargement bot...')
            const reloadResponse = await Promise.race([
              fetch('/api/proxy?endpoint=/api/bot/reload', {
                method: 'POST',
                headers: {
                  'Authorization': token,
                  'Content-Type': 'application/json'
                }
              }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout reload')), 10000)
              )
            ])
            
                         if (reloadResponse.ok) {
               console.log('✅ Bot rechargé')
               safeToast.success('Bot rechargé !')
             } else {
               console.log('⚠️ Erreur rechargement bot')
               safeToast.error('Erreur rechargement bot')
             }
           } catch (reloadError) {
             console.log('❌ Erreur rechargement:', reloadError.message)
             safeToast.error('Erreur rechargement: ' + reloadError.message)
          }
        }, 500) // Délai réduit
        
      } else {
        console.error('❌ Erreur sauvegarde HTTP:', response.status)
        safeToast.error(`Erreur sauvegarde: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error)
      safeToast.error('Erreur: ' + error.message)
    } finally {
      // IMPORTANT: Toujours nettoyer l'état
      clearTimeout(globalTimeout)
      setSaving(false)
      console.log('🔄 État saving remis à false')
    }
  }

  // Fonction pour synchroniser avec la boutique
  const syncWithShop = () => {
    try {
      // Signal de synchronisation pour la boutique
      const syncEvent = {
        type: 'config_updated',
        timestamp: Date.now(),
        source: 'admin_simple',
        data: config
      }
      
      // Signaux pour la synchronisation cross-tab
      localStorage.setItem('global_sync_signal', JSON.stringify(syncEvent))
      localStorage.setItem('boutique_sync_signal', JSON.stringify(syncEvent))
      
      // Déclencher les événements
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'global_sync_signal',
        newValue: JSON.stringify(syncEvent)
      }))
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'boutique_sync_signal',
        newValue: JSON.stringify(syncEvent)
      }))
      
      console.log('📡 Signal de synchronisation boutique envoyé')
      
      // Notification de synchronisation
      setTimeout(() => {
        safeToast.success('Boutique synchronisée !', { duration: 2000 })
      }, 1000)
      
    } catch (error) {
      console.error('❌ Erreur sync boutique:', error)
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
      return newConfig
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Configuration Simple - Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">🔧 Configuration Simple</h1>
                <p className="text-gray-600">Bot Telegram et Boutique</p>
              </div>
              <button
                onClick={() => router.push('/admin')}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                ← Retour
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="space-y-6">
            
            {/* Configuration Interface */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🎨 Interface</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de la page
                  </label>
                  <input
                    type="text"
                    value={config.interface.title}
                    onChange={(e) => updateConfig('interface.title', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="PLUGS FINDER"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ligne 1
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
                    Ligne de survol
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
                    Ligne 2
                  </label>
                  <input
                    type="text"
                    value={config.interface.tagline2}
                    onChange={(e) => updateConfig('interface.tagline2', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="CHILL"
                  />
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🎉 Message d'Accueil Bot</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image d'accueil (URL)
                  </label>
                  <input
                    type="url"
                    value={config.welcome.image || ''}
                    onChange={(e) => updateConfig('welcome.image', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="https://example.com/welcome-image.jpg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    📸 Cette image apparaîtra dans tous les menus du bot (sauf détails des plugs)
                  </p>
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
                
                {/* Gestionnaire de réseaux sociaux d'accueil */}
                <div className="border-t border-gray-200 pt-6">
                  <SocialMediaManager
                    socialMedia={config.welcome.socialMedia || []}
                    onChange={(socialMedia) => updateConfig('welcome.socialMedia', socialMedia)}
                  />
                </div>
              </div>
            </div>

            {/* Réseaux Sociaux */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📱 Contact</h2>
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

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/admin/diagnostic')}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  🔍 Diagnostic
                </button>
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
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sauvegarde en cours...
                    </div>
                  ) : (
                    '💾 Sauvegarder la configuration'
                  )}
                </button>
                <button
                  onClick={() => window.open('/shop', '_blank')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  🏪 Voir Boutique
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}