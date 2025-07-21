import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import toast, { Toaster } from 'react-hot-toast'

export default function ShopConfig() {
  const [config, setConfig] = useState({
    // Configuration Interface Boutique
    interface: {
      title: 'PLUGS FINDER',
      tagline1: 'JUSTE UNE',
      taglineHighlight: 'MINI-APP TELEGRAM',
      tagline2: 'CHILL',
      backgroundImage: ''
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
      
      const response = await fetch(`http://localhost:3000/api/config?t=${Date.now()}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
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
          }
        })
        
        toast.success('Configuration chargée !')
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Erreur chargement config:', error)
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
      console.log('💾 Sauvegarde configuration boutique...')
      
      // Nettoyer les données
      const cleanData = {
        interface: config.interface
      }
      
      console.log('📦 Données à sauvegarder:', cleanData)

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
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error)
      toast.error('Erreur: ' + error.message)
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
        <title>Configuration Boutique - Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">🎨 Configuration Boutique</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Personnalisez l'apparence de votre boutique
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
            
            {/* Aperçu */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
              <h2 className="text-lg font-semibold mb-4">📱 Aperçu de votre boutique</h2>
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
                    <p className="text-xs mt-2 opacity-75">
                      🖼️ Image de fond configurée
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Configuration Interface */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🎨 Personnalisation</h2>
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
                  <p className="text-xs text-gray-500 mt-1">
                    Le titre principal affiché en haut de votre boutique
                  </p>
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
                  <p className="text-xs text-gray-500 mt-1">
                    URL d'une image qui sera utilisée comme arrière-plan de votre boutique
                  </p>
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
                    '💾 Sauvegarder les modifications'
                  )}
                </button>
                
                <button
                  onClick={() => window.open('/shop', '_blank')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  👁️ Voir la boutique
                </button>
              </div>
            </div>

            {/* Aide */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-400 text-xl">💡</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Conseil
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Après avoir sauvegardé, cliquez sur "Voir la boutique" pour vérifier que vos modifications apparaissent correctement. 
                      Les changements sont appliqués immédiatement sur toutes les pages de votre boutique.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}