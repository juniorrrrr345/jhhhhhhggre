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

  // États pour la gestion multi-langue
  const [selectedLanguage, setSelectedLanguage] = useState('fr')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()
  
  // Langues supportées
  const supportedLanguages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ]

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
      
      const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
      
      const configData = {
        welcome: config.welcome,
        buttons: config.buttons,
        languages: config.languages
      }
      
      const result = await simpleApi.updateConfig(token, configData)
      
      // Synchroniser avec le bot
      const robustSync = getRobustSync()
      if (robustSync) {
        robustSync.syncConfigUpdate(configData)
      }
      
      // Configuration sauvegardée et synchronisée
      toast.success('✅ Configuration sauvegardée avec succès!')
      console.log('✅ Configuration sauvegardée:', result)
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error)
      console.error('❌ Stack trace:', error.stack)
      
      if (error.message.includes('401')) {
        toast.error('🔐 Session expirée. Veuillez vous reconnecter.')
        router.push('/')
      } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        toast.error('🚫 Serveur bot temporairement indisponible. Configuration non sauvegardée.')
      } else if (error.message.includes('Timeout')) {
        toast.error('⏱️ Timeout: Serveur bot trop lent. Configuration non sauvegardée.')
      } else {
        toast.error('❌ Erreur lors de la sauvegarde: ' + error.message)
      }
    } finally {
      console.log('🔄 Fin sauvegarde - setSaving(false)')
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
            <img 
              src="https://i.imgur.com/VwBPgtw.jpeg" 
              alt="Loading..." 
              className="h-12 w-12 mx-auto mb-4 animate-pulse"
              style={{ borderRadius: '50%' }}
            />
                          <p className="text-black">Chargement de la configuration...</p>
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
              onClick={() => router.push('/admin')}
              className="mb-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Retour au Dashboard
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

          {/* Sélecteur de langue */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                🌍 Langue de Configuration
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Choisissez la langue pour configurer les textes. Les modifications seront appliquées dans toutes les langues configurées.
              </p>
              
              <div className="flex flex-wrap gap-2">
                {supportedLanguages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedLanguage === lang.code
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {lang.flag} {lang.name}
                  </button>
                ))}
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


              
              

        </div>
      </div>
      
      <Toaster position="top-right" />
    </>
  )
}