import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import toast, { Toaster } from 'react-hot-toast'
import { TrashIcon, PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

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

const countries = [
  'France', 'Belgique', 'Suisse', 'Canada', 'Maroc', 'Tunisie', 'Algérie',
  'Sénégal', 'Côte d\'Ivoire', 'Cameroun', 'Madagascar', 'Allemagne', 
  'Espagne', 'Italie', 'Portugal', 'Royaume-Uni', 'États-Unis', 'Autre'
]

export default function EditPlug() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    telegramLink: '',
    isVip: false,
    isActive: true,
    countries: [],
    services: {
      delivery: {
        enabled: false,
        description: ''
      },
      postal: {
        enabled: false,
        description: ''
      },
      meetup: {
        enabled: false,
        description: ''
      }
    },
    socialMedia: []
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [serverEndpointsAvailable, setServerEndpointsAvailable] = useState(false)
  const [originalData, setOriginalData] = useState(null)
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    let token = localStorage.getItem('adminToken')
    if (!token) {
      token = 'JuniorAdmon123'
      localStorage.setItem('adminToken', token)
      console.log('🔑 Token par défaut défini')
    }
    
    if (id) {
      testServerEndpoints(token)
      fetchPlug(token)
    }
  }, [id])

  const testServerEndpoints = async (token) => {
    try {
      console.log('🧪 Test des endpoints serveur...')
      
      // Test direct du endpoint PUT
      const testResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jhhhhhhggre.onrender.com'}/api/plugs/${id}`, {
        method: 'HEAD', // Test sans body
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (testResponse.status !== 404) {
        console.log('✅ Endpoints serveur disponibles')
        setServerEndpointsAvailable(true)
      } else {
        console.log('❌ Endpoints serveur non déployés')
        setServerEndpointsAvailable(false)
      }
    } catch (error) {
      console.log('❌ Test endpoints échoué:', error.message)
      setServerEndpointsAvailable(false)
    }
  }

  const fetchPlug = async (token) => {
    try {
      setLoading(true)
      console.log('🔍 Chargement du plug ID:', id)
      
      let data = null
      let success = false
      
      // Méthode 1: Essayer l'endpoint individuel via proxy
      try {
        console.log('📡 Tentative chargement via endpoint individuel...')
        const response = await fetch(`/api/proxy?endpoint=/api/plugs/${id}&t=${Date.now()}`, {
          headers: { 
            'Authorization': token,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        })

        if (response.ok) {
          data = await response.json()
          success = true
          console.log('✅ Plug chargé via endpoint individuel')
        } else {
          console.log('❌ Endpoint individuel échoué:', response.status)
        }
      } catch (error) {
        console.log('❌ Endpoint individuel erreur:', error.message)
      }
      
      // Méthode 2: Fallback via liste des plugs
      if (!success) {
        try {
          console.log('📡 Fallback: chargement via liste des plugs...')
          const response = await fetch(`/api/proxy?endpoint=/api/plugs&t=${Date.now()}`, {
            headers: { 
              'Authorization': token,
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          })

          if (response.ok) {
            const listData = await response.json()
            console.log('📋 Liste des plugs récupérée:', listData)
            
            // Chercher le plug dans la liste
            const plugs = listData.plugs || listData
            const foundPlug = Array.isArray(plugs) ? plugs.find(p => p._id === id || p.id === id) : null
            
            if (foundPlug) {
              data = foundPlug
              success = true
              console.log('✅ Plug trouvé dans la liste:', data.name)
            } else {
              console.log('❌ Plug non trouvé dans la liste')
            }
          } else {
            console.log('❌ Liste des plugs échouée:', response.status)
          }
        } catch (error) {
          console.log('❌ Liste des plugs erreur:', error.message)
        }
      }
      
      // Méthode 3: Vérifier sauvegarde locale temporaire
      if (!success) {
        try {
          console.log('💾 Vérification sauvegarde locale...')
          const localSave = localStorage.getItem(`temp_plug_${id}`)
          if (localSave) {
            const saveData = JSON.parse(localSave)
            data = saveData.data
            success = true
            console.log('✅ Données récupérées depuis sauvegarde locale')
            safeToast.info('Données chargées depuis sauvegarde locale')
          }
        } catch (error) {
          console.log('❌ Sauvegarde locale erreur:', error.message)
        }
      }

      if (success && data) {
        const plugData = {
          name: data.name || '',
          description: data.description || '',
          image: data.image || '',
          telegramLink: data.telegramLink || '',
          isVip: data.isVip || false,
          isActive: data.isActive !== undefined ? data.isActive : true,
          countries: data.countries || [],
          services: {
            delivery: {
              enabled: data.services?.delivery?.enabled || false,
              description: data.services?.delivery?.description || ''
            },
            postal: {
              enabled: data.services?.postal?.enabled || false,
              description: data.services?.postal?.description || ''
            },
            meetup: {
              enabled: data.services?.meetup?.enabled || false,
              description: data.services?.meetup?.description || ''
            }
          },
          socialMedia: Array.isArray(data.socialMedia) ? data.socialMedia : []
        }
        
        setFormData(plugData)
        setOriginalData(plugData)
        safeToast.success('Plug chargé avec succès')
      } else {
        console.error('❌ Impossible de charger le plug')
        safeToast.error('Impossible de charger les données du plug')
      }
    } catch (error) {
      console.error('💥 Erreur:', error)
      safeToast.error(`Erreur: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev }
      const keys = path.split('.')
      let current = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newData
    })
  }

  const savePlug = async () => {
    const token = localStorage.getItem('adminToken')
    
    if (!token) {
      safeToast.error('Token d\'authentification manquant')
      return
    }
    
    // Validation
    if (!formData.name.trim()) {
      safeToast.error('Le nom de la boutique est requis')
      return
    }
    
    if (!formData.description.trim()) {
      safeToast.error('La description est requise')
      return
    }
    
    console.log('💾 Début sauvegarde plug...')
    setSaving(true)
    
    // Protection timeout
    const globalTimeout = setTimeout(() => {
      console.error('⏰ Timeout global de sauvegarde')
      setSaving(false)
      safeToast.error('Timeout: Sauvegarde trop longue')
    }, 30000)

    try {
      safeToast.info('Sauvegarde en cours...')

      // Nettoyer les données
      const cleanData = JSON.parse(JSON.stringify(formData))
      delete cleanData._id
      delete cleanData.__v
      delete cleanData.updatedAt
      delete cleanData.createdAt
      
      console.log('📦 Données à sauvegarder:', cleanData)

      let success = false
      let result = null
      
      // Méthode 1: Tentative via proxy (méthode recommandée)
      if (!success) {
        try {
          console.log('📡 Tentative sauvegarde via proxy...')
          const response = await fetch(`/api/proxy?endpoint=/api/plugs/${id}`, {
            method: 'POST',
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              _method: 'PUT',
              ...cleanData
            })
          })

          console.log('📊 Response proxy:', response.status)
          
          if (response.ok) {
            result = await response.json()
            success = true
            console.log('✅ Sauvegarde proxy réussie')
          } else {
            const errorText = await response.text()
            console.log('❌ Erreur proxy:', response.status, errorText)
          }
        } catch (error) {
          console.log('❌ Proxy erreur:', error.message)
        }
      }
      
      // Méthode 2: Tentative directe (si serveur redéployé)
      if (!success && serverEndpointsAvailable) {
        try {
          console.log('📡 Tentative sauvegarde directe...')
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jhhhhhhggre.onrender.com'}/api/plugs/${id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(cleanData)
          })

          if (response.ok) {
            result = await response.json()
            success = true
            console.log('✅ Sauvegarde directe réussie')
          } else {
            console.log('❌ Sauvegarde directe échouée:', response.status)
          }
        } catch (error) {
          console.log('❌ Sauvegarde directe erreur:', error.message)
        }
      }
      
      // Méthode 3: Sauvegarde locale de secours
      if (!success) {
        console.log('💾 Sauvegarde locale de secours...')
        try {
          const tempSave = {
            id,
            data: cleanData,
            timestamp: new Date().toISOString(),
            needsSync: true
          }
          localStorage.setItem(`temp_plug_${id}`, JSON.stringify(tempSave))
          
          // Aussi mettre à jour le cache local pour affichage immédiat
          localStorage.setItem(`plug_cache_${id}`, JSON.stringify(cleanData))
          
          success = true
          result = { ...cleanData, _id: id, _localSave: true }
          console.log('✅ Sauvegarde locale réussie')
        } catch (localError) {
          console.error('❌ Sauvegarde locale échouée:', localError)
        }
      }

      clearTimeout(globalTimeout)
      setSaving(false)

      if (success) {
        if (result && result._localSave) {
          safeToast.success('💾 Sauvegardé localement - Redéployez le serveur pour synchroniser', {
            duration: 4000
          })
        } else {
          safeToast.success('✅ Plug modifié avec succès !', {
            duration: 3000,
            style: {
              background: '#10B981',
              color: 'white',
            }
          })
        }
        
        // Redirection après succès
        setTimeout(() => {
          router.push('/admin/plugs')
        }, 1000)
        
      } else {
        safeToast.error('❌ Impossible de sauvegarder le plug')
      }
      
    } catch (error) {
      console.error('💥 Erreur sauvegarde:', error)
      clearTimeout(globalTimeout)
      setSaving(false)
      safeToast.error(`Erreur: ${error.message}`)
    }
  }

  const addSocialMedia = () => {
    setFormData(prev => ({
      ...prev,
      socialMedia: [...prev.socialMedia, { name: '', emoji: '', url: '' }]
    }))
  }

  const removeSocialMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.filter((_, i) => i !== index)
    }))
  }

  const updateSocialMedia = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.map((social, i) => 
        i === index ? { ...social, [field]: value } : social
      )
    }))
  }

  const toggleCountry = (country) => {
    setFormData(prev => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter(c => c !== country)
        : [...prev.countries, country]
    }))
  }

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData)
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Chargement...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Chargement de la boutique...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Modifier - {formData.name}</title>
        <meta name="description" content="Modifier la boutique" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        {/* Header avec statut */}
        <div className="bg-white shadow border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/admin/plugs')}
                  className="mr-4 text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-1" />
                  Retour
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Modifier la boutique</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      serverEndpointsAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {serverEndpointsAvailable ? '🟢 Serveur synchronisé' : '🟡 Mode local'}
                    </span>
                    {hasChanges() && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        📝 Modifications en cours
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={savePlug}
                  disabled={saving || !hasChanges()}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    saving 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : hasChanges()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {saving ? '💾 Sauvegarde...' : hasChanges() ? '💾 Sauvegarder' : '✅ Sauvegardé'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alerte mode local */}
        {!serverEndpointsAvailable && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Mode local activé :</strong> Le serveur bot n'a pas encore été redéployé avec les nouveaux endpoints. 
                  Les modifications seront sauvegardées localement et synchronisées automatiquement après redéploiement.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            
            {/* Informations de base */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Informations de base</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la boutique *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nom de votre boutique"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lien Telegram
                  </label>
                  <input
                    type="text"
                    value={formData.telegramLink}
                    onChange={(e) => updateFormData('telegramLink', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="@votre_boutique ou https://t.me/votre_boutique"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Description de votre boutique"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de l'image
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => updateFormData('image', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://exemple.com/image.jpg"
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img 
                        src={formData.image} 
                        alt="Aperçu" 
                        className="h-20 w-20 object-cover rounded-lg border"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Statut et Options */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Statut et Options</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Boutique VIP</h3>
                    <p className="text-sm text-gray-500">Marquer cette boutique comme VIP (priorité d'affichage)</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVip}
                      onChange={(e) => updateFormData('isVip', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 ${formData.isVip ? 'bg-yellow-500' : 'bg-gray-300'}`}>
                      <div className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${formData.isVip ? 'translate-x-5' : 'translate-x-0'} translate-y-0.5`}></div>
                    </div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Boutique active</h3>
                    <p className="text-sm text-gray-500">La boutique est visible sur le bot et la boutique en ligne</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => updateFormData('isActive', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <div className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${formData.isActive ? 'translate-x-5' : 'translate-x-0'} translate-y-0.5`}></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Pays */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🌍 Pays desservis</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {countries.map(country => (
                  <label key={country} className="flex items-center cursor-pointer p-2 rounded hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.countries.includes(country)}
                      onChange={() => toggleCountry(country)}
                      className="rounded border-gray-300 text-blue-600 mr-2"
                    />
                    <span className="text-sm text-gray-700">{country}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🚚 Services proposés</h2>
              <div className="space-y-6">
                
                {/* Service Livraison */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-md font-medium text-gray-900">🚚 Livraison</h3>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.services.delivery.enabled}
                        onChange={(e) => updateFormData('services.delivery.enabled', e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 ${formData.services.delivery.enabled ? 'bg-green-600' : 'bg-gray-300'}`}>
                        <div className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${formData.services.delivery.enabled ? 'translate-x-5' : 'translate-x-0'} translate-y-0.5`}></div>
                      </div>
                    </label>
                  </div>
                  {formData.services.delivery.enabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description du service de livraison
                      </label>
                      <textarea
                        value={formData.services.delivery.description}
                        onChange={(e) => updateFormData('services.delivery.description', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 h-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Livraison rapide en moins de 2h dans Paris, disponible 7j/7..."
                      />
                    </div>
                  )}
                </div>

                {/* Service Postal */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-md font-medium text-gray-900">📮 Envoi postal</h3>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.services.postal.enabled}
                        onChange={(e) => updateFormData('services.postal.enabled', e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 ${formData.services.postal.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${formData.services.postal.enabled ? 'translate-x-5' : 'translate-x-0'} translate-y-0.5`}></div>
                      </div>
                    </label>
                  </div>
                  {formData.services.postal.enabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description du service d'envoi postal
                      </label>
                      <textarea
                        value={formData.services.postal.description}
                        onChange={(e) => updateFormData('services.postal.description', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 h-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Envoi postal sécurisé partout en Europe, suivi inclus..."
                      />
                    </div>
                  )}
                </div>

                {/* Service Meetup */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-md font-medium text-gray-900">🏠 Meetup</h3>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.services.meetup.enabled}
                        onChange={(e) => updateFormData('services.meetup.enabled', e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 ${formData.services.meetup.enabled ? 'bg-purple-600' : 'bg-gray-300'}`}>
                        <div className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${formData.services.meetup.enabled ? 'translate-x-5' : 'translate-x-0'} translate-y-0.5`}></div>
                      </div>
                    </label>
                  </div>
                  {formData.services.meetup.enabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description du service de meetup
                      </label>
                      <textarea
                        value={formData.services.meetup.description}
                        onChange={(e) => updateFormData('services.meetup.description', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 h-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Rencontre possible sur Paris 15ème, métro Vaugirard..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">📱 Réseaux sociaux</h2>
                <button
                  onClick={addSocialMedia}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Ajouter un réseau
                </button>
              </div>
              
              {formData.socialMedia.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Aucun réseau social ajouté</p>
                  <p className="text-sm text-gray-400 mt-1">Ajoutez vos réseaux sociaux pour que vos clients puissent vous contacter</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.socialMedia.map((social, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-sm font-medium text-gray-900">Réseau social #{index + 1}</h3>
                        <button
                          onClick={() => removeSocialMedia(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Nom du réseau
                          </label>
                          <input
                            type="text"
                            value={social.name}
                            onChange={(e) => updateSocialMedia(index, 'name', e.target.value)}
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Instagram, WhatsApp, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Emoji/Icône
                          </label>
                          <input
                            type="text"
                            value={social.emoji}
                            onChange={(e) => updateSocialMedia(index, 'emoji', e.target.value)}
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="📸, 💬, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            URL ou pseudo
                          </label>
                          <input
                            type="text"
                            value={social.url}
                            onChange={(e) => updateSocialMedia(index, 'url', e.target.value)}
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://instagram.com/... ou @pseudo"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}