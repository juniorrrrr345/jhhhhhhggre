import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import toast, { Toaster } from 'react-hot-toast'
import { simpleApi } from '../../lib/api-simple'

export default function ShopConfiguration() {
  const [config, setConfig] = useState({
    boutique: {
      backgroundImage: '',
      backgroundColor: '#000000',
      theme: 'dark',
      telegramBotLink: 'https://t.me/FindYourPlugBot',
      logoUrl: '',
      headerTitle: 'FINDYOURPLUG',
      headerSubtitle: 'TELEGRAM',
      showHeader: true
    }
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkAuthAndFetchConfig()
  }, [])

  const checkAuthAndFetchConfig = async () => {
    let token = localStorage.getItem('adminToken')
    
    if (!token) {
      setError('Vous devez vous connecter pour accéder à cette page')
      setLoading(false)
      return
    }

    await fetchConfig()
  }

  const fetchConfig = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await simpleApi.get('/api/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response && response.success) {
        setConfig(prev => ({
          ...prev,
          ...response.config
        }))
      }
    } catch (error) {
      console.error('Erreur récupération config:', error)
      setError('Erreur lors du chargement de la configuration')
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    try {
      setSaving(true)
      
      const response = await simpleApi.post('/api/config', config, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response && response.success) {
        toast.success('Configuration sauvegardée !')
      } else {
        throw new Error(response?.error || 'Erreur inconnue')
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const updateBoutique = (field, value) => {
    // Correction automatique des liens Imgur
    if (field === 'backgroundImage' && value) {
      if (value.includes('imgur.com') && value.endsWith('.jpeg')) {
        value = value.replace('.jpeg', '.jpg')
      }
      if (value.includes('imgur.com') && value.startsWith('http://')) {
        value = value.replace('http://', 'https://')
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

  if (loading) {
    return (
      <>
        <Head>
          <title>Configuration Boutique - Admin Panel</title>
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
        <title>Configuration Boutique - Admin Panel</title>
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
                  🛍️ Configuration Boutique
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Configurez l'apparence et les liens de votre boutique en ligne
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
                <button
                  onClick={() => {
                    simpleApi.clearCache()
                    fetchConfig()
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
                  {saving ? '⏳ Sauvegarde en cours...' : '💾 Sauvegarder'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Configuration du thème */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  🎨 Thème et Apparence
                </h3>
                
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
                        placeholder="https://i.imgur.com/exemple.jpg"
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
                </div>
              </div>
            </div>

            {/* Configuration du header et logo */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  🏷️ Logo et En-tête
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL du logo
                    </label>
                    <input
                      type="url"
                      value={config.boutique?.logoUrl || ''}
                      onChange={(e) => updateBoutique('logoUrl', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://i.imgur.com/logo.png"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Remplacera le texte FINDYOURPLUG dans le header
                    </p>
                    
                    {/* Aperçu du logo */}
                    {config.boutique?.logoUrl && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Aperçu</label>
                        <div className="relative h-16 w-32 rounded-lg overflow-hidden border border-gray-300 bg-black flex items-center justify-center">
                          <img
                            src={config.boutique.logoUrl}
                            alt="Aperçu du logo"
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                          <div 
                            className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500 text-xs"
                            style={{display: 'none'}}
                          >
                            Logo non accessible
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Affichage du header */}
                  <div>
                    <label className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        checked={config.boutique?.showHeader || false}
                        onChange={(e) => updateBoutique('showHeader', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Afficher l'en-tête avec logo/texte
                      </span>
                    </label>

                    {/* Titre principal (fallback si pas de logo) */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Titre principal (si pas de logo)
                        </label>
                        <input
                          type="text"
                          value={config.boutique?.headerTitle || ''}
                          onChange={(e) => updateBoutique('headerTitle', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="FINDYOURPLUG"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sous-titre
                        </label>
                        <input
                          type="text"
                          value={config.boutique?.headerSubtitle || ''}
                          onChange={(e) => updateBoutique('headerSubtitle', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="TELEGRAM"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration des liens */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  🔗 Liens et Actions
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Lien bot Telegram */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lien vers votre bot Telegram
                    </label>
                    <input
                      type="url"
                      value={config.boutique?.telegramBotLink || ''}
                      onChange={(e) => updateBoutique('telegramBotLink', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://t.me/VotreBot"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Utilisé pour les boutons "S'inscrire" et "Commander maintenant"
                    </p>
                  </div>

                  {/* Test du lien */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tester le lien
                    </label>
                    <a
                      href={config.boutique?.telegramBotLink || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      🚀 Tester le lien Telegram
                    </a>
                    <p className="text-xs text-gray-500 mt-1">
                      Ouvre le lien dans un nouvel onglet pour vérifier
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Prévisualisation */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  👀 Prévisualisation
                </h3>
                
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div 
                    className="h-32 w-full relative"
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
                      {config.boutique?.showHeader && (
                        <div className="text-center">
                          {config.boutique?.logoUrl ? (
                            <img
                              src={config.boutique.logoUrl}
                              alt="Logo"
                              className="h-12 mx-auto"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          ) : (
                            <div>
                              <div className={`text-lg font-bold ${config.boutique?.theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                {config.boutique?.headerTitle || 'FINDYOURPLUG'}
                              </div>
                              {config.boutique?.headerSubtitle && (
                                <div className={`text-sm ${config.boutique?.theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                                  {config.boutique.headerSubtitle}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Bouton pour voir la boutique */}
                <div className="mt-4">
                  <a
                    href="/shop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    🛍️ Voir la boutique en direct
                    <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
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