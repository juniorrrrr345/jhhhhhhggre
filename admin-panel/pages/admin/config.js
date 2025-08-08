import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import toast, { Toaster } from 'react-hot-toast'
import { simpleApi } from '../../lib/api-simple'
import { getRobustSync } from '../../lib/robust-sync'

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
    // Configuration des langues
    languages: {
      enabled: false,
      currentLanguage: 'fr',
      availableLanguages: [],
      translations: new Map()
    },
    // Configuration de la boutique
    boutique: {
      backgroundImage: '',
      backgroundColor: '#000000',
      theme: 'dark', // dark, light, custom
      telegramBotLink: 'https://t.me/FindYourPlugBot' // Lien vers le bot Telegram
    }
  })

  // États
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
        // Configuration des langues
        languages: {
          enabled: data.languages?.enabled || false,
          currentLanguage: data.languages?.currentLanguage || 'fr',
          availableLanguages: data.languages?.availableLanguages || [],
          translations: data.languages?.translations || new Map()
        }
      })
        
        // Configuration chargée silencieusement
      } catch (error) {
        console.error('Erreur chargement config:', error)
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
              text: 'Bienvenue sur FindYourPlug! Explorez nos services.',
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
          }
          })
        } else {
          toast.error('Erreur de chargement')
        }
      } finally {
        setLoading(false)
      }
    }

  const saveConfig = async () => {
    try {
      setSaving(true)
      console.log('💾 Sauvegarde configuration bot...')
      console.log('📝 Données à sauvegarder:', { welcome: config.welcome, buttons: config.buttons })
      
      // Sauvegarder d'abord en localStorage pour la persistance
      const configToSave = {
        welcome: config.welcome,
        buttons: config.buttons,
        languages: config.languages,
        lastUpdate: new Date().toISOString()
      }
      
      localStorage.setItem('botConfig', JSON.stringify(configToSave))
      console.log('✅ Configuration sauvegardée localement')
      
      // Ensuite essayer de synchroniser avec le bot
      try {
        const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
        
        const result = await simpleApi.updateConfig(token, configToSave)
        
        if (result.success) {
          // SYNCHRONISATION IMMÉDIATE MINI APP
          await simpleApi.syncImmediateMiniApp('config_updated')
          
          // Synchroniser avec le bot
          const robustSync = getRobustSync()
          await robustSync.syncConfigToBot({
            config: configToSave,
            updateType: 'full'
          })
          
          toast.success('✅ Configuration sauvegardée et synchronisée!')
          console.log('✅ Config synchronisée avec le bot')
        }
      } catch (botError) {
        console.warn('⚠️ Impossible de synchroniser avec le bot:', botError)
        // Mais on continue car la sauvegarde locale a réussi
        toast.success('✅ Configuration sauvegardée localement (synchronisation bot en attente)')
      }
      
      // Rafraîchir l'affichage
      setTimeout(() => {
        loadConfig()
      }, 500)
      
    } catch (error) {
      console.error('💥 Erreur sauvegarde:', error)
      toast.error(`Erreur: ${error.message}`)
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
  
  // Fonctions utilitaires pour les traductions
  const getTranslation = (key, lang) => {
    const translations = config.languages?.translations || {}
    return translations[key]?.[lang] || ''
  }
  
  const setTranslation = (key, lang, value) => {
    setConfig(prev => {
      const newTranslations = {...(prev.languages?.translations || {})}
      if (!newTranslations[key]) {
        newTranslations[key] = {}
      }
      newTranslations[key][lang] = value
      
      return {
        ...prev,
        languages: {
          ...prev.languages,
          translations: newTranslations
        }
      }
    })
  }

  // Fonctions pour la configuration de la boutique
  const updateBoutique = (field, value) => {
    // Correction automatique des liens Imgur
    if (field === 'backgroundImage' && value) {
      // Corriger .jpeg en .jpg pour Imgur
      if (value.includes('imgur.com') && value.endsWith('.jpeg')) {
        value = value.replace('.jpeg', '.jpg');
      }
      // Forcer HTTPS pour les liens Imgur
      if (value.includes('imgur.com') && value.startsWith('http://')) {
        value = value.replace('http://', 'https://');
      }
    }
    
    setConfig(prev => ({
      ...prev,
      boutique: {
        ...prev.boutique,
        [field]: value
      }
    }))
  }

  // Fonctions supprimées : updateSocialMedia et sendBroadcast

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
                    // Cache nettoyé
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
                  {saving ? '⏳ Sauvegarde en cours...' : '💾 Sauvegarder la configuration'}
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
          </div>

          {/* Configuration du thème de la boutique */}
          <div className="bg-white shadow rounded-lg mt-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                🎨 Thème de la Boutique Vercel
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Personnalisez l'apparence de votre boutique en ligne. Les changements seront visibles immédiatement.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Thème prédéfini */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Thème prédéfini
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'dark', label: '🌙 Sombre (actuel)', desc: 'Fond noir élégant' },
                      { value: 'light', label: '☀️ Clair', desc: 'Fond blanc moderne' },
                      { value: 'custom', label: '🎨 Personnalisé', desc: 'Image de fond custom' }
                    ].map(theme => (
                      <label key={theme.value} className="flex items-center">
                        <input
                          type="radio"
                          name="theme"
                          value={theme.value}
                          checked={config.boutique?.theme === theme.value}
                          onChange={(e) => updateBoutique('theme', e.target.value)}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <span className="ml-3">
                          <span className="text-sm font-medium text-gray-900">{theme.label}</span>
                          <span className="text-sm text-gray-500 block">{theme.desc}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Image de fond personnalisée */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image de fond personnalisée
                  </label>
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={config.boutique?.backgroundImage || ''}
                      onChange={(e) => updateBoutique('backgroundImage', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                      disabled={config.boutique?.theme !== 'custom'}
                    />
                    <p className="text-xs text-gray-500">
                      URL directe vers une image (JPG, PNG, WebP). Recommandé : 1920x1080px minimum.
                      <br />
                      <strong>Pour Imgur :</strong> Utilisez https://i.imgur.com/CODE.jpg (pas .jpeg)
                    </p>
                    
                    {/* Aperçu de l'image */}
                    {config.boutique?.backgroundImage && config.boutique?.theme === 'custom' && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Aperçu</label>
                        <div className="relative h-24 w-full rounded-lg overflow-hidden border border-gray-300">
                          <img
                            src={config.boutique.backgroundImage}
                            alt="Aperçu du fond"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                          <div 
                            className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500 text-xs"
                            style={{display: 'none'}}
                          >
                            Image non accessible
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Couleur de fond de secours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur de fond de secours
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={config.boutique?.backgroundColor || '#000000'}
                      onChange={(e) => updateBoutique('backgroundColor', e.target.value)}
                      className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.boutique?.backgroundColor || '#000000'}
                      onChange={(e) => updateBoutique('backgroundColor', e.target.value)}
                      className="block w-32 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="#000000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Utilisée si l'image ne charge pas ou pour les thèmes unis.
                  </p>
                </div>

                {/* Prévisualisation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prévisualisation
                  </label>
                  <div 
                    className="h-24 w-full rounded-lg border border-gray-300 relative overflow-hidden"
                    style={{
                      backgroundColor: config.boutique?.backgroundColor || '#000000',
                      backgroundImage: config.boutique?.theme === 'custom' && config.boutique?.backgroundImage ? 
                        `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("${config.boutique.backgroundImage}")` : 
                        config.boutique?.theme === 'light' ? 'linear-gradient(135deg, #f3f4f6, #e5e7eb)' : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${config.boutique?.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                          FindYourPlug
                        </div>
                        <div className={`text-sm ${config.boutique?.theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                          Boutique en ligne
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bouton pour voir la boutique */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <a
                  href="/shop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  🛍️ Voir la boutique
                  <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <Toaster position="top-right" />
    </>
  )
}