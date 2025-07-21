import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import toast, { Toaster } from 'react-hot-toast'

export default function BotConfig() {
  const [config, setConfig] = useState({
    welcome: {
      text: '',
      image: ''
    },
    boutique: {
      name: '',
      subtitle: '',
      backgroundImage: ''
    },
    buttons: {
      topPlugs: { text: '🔌 Top Des Plugs' },
      vipPlugs: { text: '👑 Boutiques VIP' },
      contact: { text: '📞 Contact', content: '' },
      info: { text: 'ℹ️ Info', content: '' }
    },
    supportMenu: {
      enabled: false,
      text: '',
      image: ''
    },
    infoMenu: {
      enabled: false,
      text: '',
      image: ''
    },
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
    fetchConfig(token)
  }, [])

  const fetchConfig = async (token) => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/proxy?endpoint=/api/config', {
        headers: { 
          'Authorization': token,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        const mergedConfig = {
          welcome: {
            text: data.welcome?.text || '🎉 Bienvenue sur notre bot premium !',
            image: data.welcome?.image || ''
          },
          boutique: {
            name: data.boutique?.name || '',
            subtitle: data.boutique?.subtitle || '',
            backgroundImage: data.boutique?.backgroundImage || ''
          },
          buttons: {
            topPlugs: { text: data.buttons?.topPlugs?.text || '🔌 Top Des Plugs' },
            vipPlugs: { text: data.buttons?.vipPlugs?.text || '👑 Boutiques VIP' },
            contact: { 
              text: data.buttons?.contact?.text || '📞 Contact',
              content: data.buttons?.contact?.content || ''
            },
            info: { 
              text: data.buttons?.info?.text || 'ℹ️ Info',
              content: data.buttons?.info?.content || ''
            }
          },
          supportMenu: {
            enabled: data.supportMenu?.enabled || false,
            text: data.supportMenu?.text || '',
            image: data.supportMenu?.image || ''
          },
          infoMenu: {
            enabled: data.infoMenu?.enabled || false,
            text: data.infoMenu?.text || '',
            image: data.infoMenu?.image || ''
          },
          messages: {
            welcome: data.messages?.welcome || '',
            noPlugsFound: data.messages?.noPlugsFound || '',
            error: data.messages?.error || ''
          }
        }
        
        setConfig(mergedConfig)
        toast.success('Configuration chargée avec succès !')
      } else {
        toast.error(`Erreur lors du chargement: ${response.status}`)
      }
    } catch (error) {
      console.error('Erreur chargement config:', error)
      toast.error(`Erreur de connexion: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async (retryCount = 0) => {
    const token = localStorage.getItem('adminToken')
    setSaving(true)

    try {
      console.log('💾 Sauvegarde configuration...', retryCount + 1)
      
      if (!token) {
        throw new Error('Token d\'authentification manquant')
      }
      
      // CORRECTION: Validation des données avant envoi
      const configToSave = { ...config }
      
      // Nettoyer les données undefined
      const cleanConfig = (obj) => {
        if (Array.isArray(obj)) {
          return obj.map(cleanConfig).filter(item => item !== null && item !== undefined);
        } else if (obj !== null && typeof obj === 'object') {
          const cleaned = {};
          Object.keys(obj).forEach(key => {
            const value = cleanConfig(obj[key]);
            if (value !== undefined && value !== null && value !== '') {
              cleaned[key] = value;
            }
          });
          return cleaned;
        }
        return obj;
      }
      
      const cleanedConfig = cleanConfig(configToSave)
      console.log('🧹 Configuration nettoyée:', Object.keys(cleanedConfig))
      
      const response = await fetch('/api/proxy?endpoint=/api/config', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          _method: 'PUT',
          ...cleanedConfig
        }),
        signal: AbortSignal.timeout(60000) // 60 secondes timeout
      })

      console.log('📡 Response status:', response.status, response.statusText)

      if (response.ok) {
        const savedConfig = await response.json()
        console.log('✅ Configuration sauvegardée:', savedConfig)
        toast.success('Configuration sauvegardée avec succès !', {
          duration: 4000,
          icon: '💾'
        })
        
        // Mettre à jour l'état local avec les données sauvegardées
        if (savedConfig && typeof savedConfig === 'object') {
          setConfig(prevConfig => ({
            ...prevConfig,
            ...savedConfig
          }))
        }
        
        // Recharger le bot après un délai
        setTimeout(() => {
          reloadBot();
        }, 1000);
        
      } else {
        // Lire la réponse d'erreur
        let errorData;
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: await response.text() }
        }
        
        console.error('❌ Erreur sauvegarde:', response.status, errorData)
        throw new Error(`Erreur ${response.status}: ${errorData.error || errorData.message || 'Erreur inconnue'}`)
      }

    } catch (error) {
      console.error('💥 Erreur sauvegarde config:', error)
      
      // Retry automatique pour certaines erreurs
      const shouldRetry = (
        (error.message.includes('Load failed') || 
         error.message.includes('fetch') || 
         error.name === 'AbortError' ||
         error.message.includes('timeout') ||
         error.message.includes('Erreur 50')) // Erreurs serveur 5xx
        && retryCount < 3
      )
      
      if (shouldRetry) {
        const delay = Math.min(2000 * Math.pow(2, retryCount), 8000) // Backoff exponentiel
        console.log(`🔄 Retry automatique ${retryCount + 1}/3 dans ${delay}ms...`)
        toast.info(`Nouvelle tentative ${retryCount + 1}/3 dans ${delay/1000}s...`, {
          duration: delay,
          icon: '🔄'
        })
        
        setTimeout(() => {
          saveConfig(retryCount + 1)
        }, delay)
        return
      }
      
      // Messages d'erreur spécifiques et plus clairs
      let errorMessage = 'Erreur lors de la sauvegarde'
      let errorIcon = '❌'
      
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorMessage = 'Timeout: La sauvegarde a pris trop de temps. Vérifiez votre connexion.'
        errorIcon = '⏱️'
      } else if (error.message.includes('Load failed') || error.message.includes('fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Erreur de connexion: Impossible de contacter le serveur bot. Vérifiez que le bot est démarré.'
        errorIcon = '🔌'
      } else if (error.message.includes('401')) {
        errorMessage = 'Erreur d\'authentification: Votre session a expiré. Reconnectez-vous.'
        errorIcon = '🔐'
      } else if (error.message.includes('400')) {
        errorMessage = 'Données invalides: Vérifiez les champs remplis.'
        errorIcon = '📝'
      } else if (error.message.includes('413')) {
        errorMessage = 'Données trop volumineuses: Réduisez la taille des images ou textes.'
        errorIcon = '📏'
      } else if (error.message.includes('50')) {
        errorMessage = 'Erreur serveur: Le serveur bot rencontre un problème. Réessayez dans quelques instants.'
        errorIcon = '🚨'
      }
      
      toast.error(errorMessage, {
        duration: 6000,
        icon: errorIcon
      })
    } finally {
      setSaving(false)
    }
  }

  const reloadBot = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      toast.info('🔄 Rechargement du bot en cours...')
      
      const response = await fetch('/api/proxy?endpoint=/api/bot/reload', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        toast.success('✅ Bot rechargé avec succès !')
      } else {
        toast.error('⚠️ Erreur rechargement bot')
      }
    } catch (error) {
      console.error('Erreur rechargement bot:', error)
      toast.error('❌ Erreur rechargement bot')
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
          <p className="text-gray-600">Chargement de la configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Configuration Bot - Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Configuration Bot</h1>
                <p className="mt-1 text-sm text-gray-500">Personnalisez votre bot Telegram</p>
              </div>
              <button
                onClick={() => router.push('/admin')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Retour
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            
            {/* Message d'accueil */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🎉 Message d'Accueil</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Texte de bienvenue
                  </label>
                  <textarea
                    value={config.welcome.text}
                    onChange={(e) => updateConfig('welcome.text', e.target.value)}
                    className="w-full border-2 border-gray-400 text-gray-900 rounded-lg p-3 h-24 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Bienvenue sur notre plateforme !"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Image de bienvenue (URL)
                  </label>
                  <input
                    type="url"
                    value={config.welcome.image}
                    onChange={(e) => updateConfig('welcome.image', e.target.value)}
                    className="w-full border-2 border-gray-400 text-gray-900 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="https://example.com/image.jpg"
                  />
                  {config.welcome.image && (
                    <img 
                      src={config.welcome.image} 
                      alt="Preview"
                      className="mt-2 w-64 h-32 object-cover rounded border-2 border-gray-300"
                      onError={(e) => {e.target.style.display = 'none'}}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Configuration Boutique */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🏪 Configuration Boutique</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Nom de la boutique
                  </label>
                  <input
                    type="text"
                    value={config.boutique.name}
                    onChange={(e) => updateConfig('boutique.name', e.target.value)}
                    className="w-full border-2 border-gray-400 text-gray-900 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="SwissQuality"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Sous-titre
                  </label>
                  <input
                    type="text"
                    value={config.boutique.subtitle}
                    onChange={(e) => updateConfig('boutique.subtitle', e.target.value)}
                    className="w-full border-2 border-gray-400 text-gray-900 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Votre boutique premium"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image de fond (répétée) - URL
                  </label>
                  <input
                    type="url"
                    value={config.boutique.backgroundImage}
                    onChange={(e) => updateConfig('boutique.backgroundImage', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="https://example.com/pattern.jpg"
                  />
                  {config.boutique.backgroundImage && (
                    <img 
                      src={config.boutique.backgroundImage} 
                      alt="Background"
                      className="mt-2 w-32 h-32 object-cover rounded border"
                      onError={(e) => {e.target.style.display = 'none'}}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Boutons du Bot */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🔘 Boutons du Bot</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bouton Top Plugs
                    </label>
                    <input
                      type="text"
                      value={config.buttons.topPlugs.text}
                      onChange={(e) => updateConfig('buttons.topPlugs.text', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bouton VIP
                    </label>
                    <input
                      type="text"
                      value={config.buttons.vipPlugs.text}
                      onChange={(e) => updateConfig('buttons.vipPlugs.text', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bouton Contact
                    </label>
                    <input
                      type="text"
                      value={config.buttons.contact.text}
                      onChange={(e) => updateConfig('buttons.contact.text', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bouton Info
                    </label>
                    <input
                      type="text"
                      value={config.buttons.info.text}
                      onChange={(e) => updateConfig('buttons.info.text', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenu page Contact
                    </label>
                    <textarea
                      value={config.buttons.contact.content}
                      onChange={(e) => updateConfig('buttons.contact.content', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 h-20 resize-none"
                      placeholder="Contactez-nous pour..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenu page Info
                    </label>
                    <textarea
                      value={config.buttons.info.content}
                      onChange={(e) => updateConfig('buttons.info.content', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 h-20 resize-none"
                      placeholder="Informations sur..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Support Menu */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🔧 Support Menu Personnalisé</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="supportEnabled"
                    checked={config.supportMenu.enabled}
                    onChange={(e) => updateConfig('supportMenu.enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <label htmlFor="supportEnabled" className="text-sm font-medium text-gray-700">
                    Activer le sous-menu Support Swiss
                  </label>
                </div>

                {config.supportMenu.enabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texte du Support
                      </label>
                      <textarea
                        value={config.supportMenu.text}
                        onChange={(e) => updateConfig('supportMenu.text', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 h-20 resize-none"
                        placeholder="Contactez notre équipe Support..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image du Support (URL)
                      </label>
                      <input
                        type="url"
                        value={config.supportMenu.image}
                        onChange={(e) => updateConfig('supportMenu.image', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3"
                        placeholder="https://example.com/support.jpg"
                      />
                      {config.supportMenu.image && (
                        <img 
                          src={config.supportMenu.image} 
                          alt="Support"
                          className="mt-2 w-48 h-24 object-cover rounded border"
                          onError={(e) => {e.target.style.display = 'none'}}
                        />
                      )}
                                         </div>
                  </>
                )}
                             </div>
             </div>

             {/* Info Menu */}
             <div className="bg-white rounded-lg shadow p-6">
               <h2 className="text-xl font-semibold text-gray-900 mb-4">ℹ️ Info Menu Personnalisé</h2>
               
               <div className="space-y-4">
                 <div className="flex items-center space-x-3">
                   <input
                     type="checkbox"
                     id="infoEnabled"
                     checked={config.infoMenu.enabled}
                     onChange={(e) => updateConfig('infoMenu.enabled', e.target.checked)}
                     className="h-4 w-4 text-blue-600 rounded border-gray-300"
                   />
                   <label htmlFor="infoEnabled" className="text-sm font-medium text-gray-700">
                     Activer le sous-menu Info personnalisé
                   </label>
                 </div>

                 {config.infoMenu.enabled && (
                   <>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Texte Info
                       </label>
                       <textarea
                         value={config.infoMenu.text}
                         onChange={(e) => updateConfig('infoMenu.text', e.target.value)}
                         className="w-full border border-gray-300 rounded-lg p-3 h-20 resize-none"
                         placeholder="Informations sur notre service..."
                       />
                     </div>

                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Image Info (URL)
                       </label>
                       <input
                         type="url"
                         value={config.infoMenu.image}
                         onChange={(e) => updateConfig('infoMenu.image', e.target.value)}
                         className="w-full border border-gray-300 rounded-lg p-3"
                         placeholder="https://example.com/info.jpg"
                       />
                       {config.infoMenu.image && (
                         <img 
                           src={config.infoMenu.image} 
                           alt="Info"
                           className="mt-2 w-48 h-24 object-cover rounded border"
                           onError={(e) => {e.target.style.display = 'none'}}
                         />
                       )}
                                            </div>
                   </>
                 )}
               </div>
             </div>

             {/* Messages */}
             <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">💬 Messages du Bot</h2>
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
                    placeholder="🎉 Bienvenue !"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message aucun résultat
                  </label>
                  <input
                    type="text"
                    value={config.messages.noPlugsFound}
                    onChange={(e) => updateConfig('messages.noPlugsFound', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="😅 Aucun résultat trouvé"
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
                    placeholder="❌ Une erreur est survenue"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">⚡ Actions</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={reloadBot}
                  disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center justify-center">
                    🔄 Recharger Bot
                  </span>
                </button>
                <button
                  onClick={saveConfig}
                  disabled={saving}
                  className={`flex-1 ${saving ? 'bg-orange-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
                >
                  {saving ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sauvegarde en cours...
                    </span>
                  ) : '💾 Sauvegarder Configuration'}
                </button>
              </div>
              <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">
                <p><strong>💡 Conseil :</strong> Pensez à sauvegarder après chaque modification importante. Le rechargement du bot prend effet automatiquement après la sauvegarde.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}