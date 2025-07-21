import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import toast, { Toaster } from 'react-hot-toast'

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
    // Configuration Boutique
    boutique: {
      name: '',
      subtitle: '',
      backgroundImage: ''
    },
    // Message d'accueil Bot
    welcome: {
      text: ''
    },
    // Réseaux sociaux
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
          boutique: {
            name: data.boutique?.name || '',
            subtitle: data.boutique?.subtitle || '',
            backgroundImage: data.boutique?.backgroundImage || ''
          },
          welcome: {
            text: data.welcome?.text || ''
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
            
            {/* Configuration Boutique */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🏪 Boutique</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la boutique
                    </label>
                    <input
                      type="text"
                      value={config.boutique.name}
                      onChange={(e) => updateConfig('boutique.name', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      placeholder="SwissQuality"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sous-titre
                    </label>
                    <input
                      type="text"
                      value={config.boutique.subtitle}
                      onChange={(e) => updateConfig('boutique.subtitle', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      placeholder="Votre boutique premium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image de fond (URL)
                  </label>
                  <input
                    type="url"
                    value={config.boutique.backgroundImage}
                    onChange={(e) => updateConfig('boutique.backgroundImage', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="https://example.com/background.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Message d'Accueil Bot */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🎉 Message d'Accueil Bot</h2>
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

            {/* Messages du Bot */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">💬 Messages Bot</h2>
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
                  onClick={() => router.push('/admin/diagnostic')}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  🔍 Diagnostic
                </button>
                <button
                  onClick={() => window.open('/shop', '_blank')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  🏪 Voir Boutique
                </button>
                <button
                  onClick={saveConfig}
                  disabled={saving}
                  className={`flex-1 ${saving ? 'bg-orange-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200`}
                >
                  {saving ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sauvegarde...
                    </span>
                  ) : '💾 Sauvegarder'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}