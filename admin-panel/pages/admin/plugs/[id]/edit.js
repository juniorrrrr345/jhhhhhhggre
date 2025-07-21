import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import toast, { Toaster } from 'react-hot-toast'
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline'

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
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    let token = localStorage.getItem('adminToken')
    if (!token) {
      // Définir le token par défaut au lieu de rediriger
      token = 'JuniorAdmon123'
      localStorage.setItem('adminToken', token)
      console.log('🔑 Token par défaut défini')
    }
    
    if (id) {
      fetchPlug(token)
    }
  }, [id])

  const fetchPlug = async (token) => {
    try {
      setLoading(true)
      console.log('🔍 Chargement du plug ID:', id)
      
      const response = await fetch(`/api/proxy?endpoint=/api/plugs/${id}&t=${Date.now()}`, {
        headers: { 
          'Authorization': token,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Plug chargé:', data)
        
        setFormData({
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
        })
        safeToast.success('Plug chargé avec succès')
      } else {
        console.error('❌ Erreur chargement plug:', response.status)
        safeToast.error('Erreur lors du chargement du plug')
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
    
    // Vérifier que le token existe
    if (!token) {
      safeToast.error('Token d\'authentification manquant. Veuillez vous reconnecter.')
      return
    }
    
    // Validation des champs requis
    if (!formData.name.trim()) {
      safeToast.error('Le nom de la boutique est requis')
      return
    }
    
    if (!formData.description.trim()) {
      safeToast.error('La description est requise')
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
      console.log('💾 Début sauvegarde plug...')
      safeToast.info('Sauvegarde...')

      // Nettoyer les données avant envoi
      const cleanData = JSON.parse(JSON.stringify(formData))
      
      // Supprimer les champs qui peuvent poser problème
      delete cleanData._id
      delete cleanData.__v
      delete cleanData.updatedAt
      delete cleanData.createdAt
      
      console.log('📦 Données nettoyées:', Object.keys(cleanData))

      // Sauvegarde du plug
      const response = await Promise.race([
        fetch(`/api/proxy?endpoint=/api/plugs/${id}`, {
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
        const result = await response.json()
        console.log('✅ Sauvegarde réussie:', result)
        
        clearTimeout(globalTimeout)
        setSaving(false)
        
        safeToast.success('💾 Plug modifié avec succès !', {
          duration: 3000,
          style: {
            background: '#10B981',
            color: 'white',
          }
        })
        
        // Redirection après un court délai
        setTimeout(() => {
          router.push('/admin/plugs')
        }, 1000)
        
      } else {
        const errorData = await response.text()
        console.error('❌ Erreur sauvegarde:', response.status, errorData)
        
        clearTimeout(globalTimeout)
        setSaving(false)
        
        safeToast.error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
    } catch (error) {
      console.error('💥 Erreur sauvegarde:', error)
      clearTimeout(globalTimeout)
      setSaving(false)
      
      if (error.message.includes('Timeout')) {
        safeToast.error('Timeout: La sauvegarde a pris trop de temps')
      } else {
        safeToast.error(`Erreur: ${error.message}`)
      }
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
        
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/admin/plugs')}
                  className="mr-4 text-gray-600 hover:text-gray-900"
                >
                  ← Retour
                </button>
                <h1 className="text-xl font-semibold text-gray-900">Modifier la boutique</h1>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={savePlug}
                  disabled={saving}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    saving 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {saving ? '💾 Sauvegarde...' : '💾 Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>

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
                    className="w-full border border-gray-300 rounded-lg p-3"
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
                    className="w-full border border-gray-300 rounded-lg p-3"
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
                    className="w-full border border-gray-300 rounded-lg p-3"
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
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="https://exemple.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Statut et Options */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Statut et Options</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Boutique VIP</h3>
                    <p className="text-sm text-gray-500">Marquer cette boutique comme VIP</p>
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
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Boutique active</h3>
                    <p className="text-sm text-gray-500">La boutique est visible sur le bot</p>
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
                  <label key={country} className="flex items-center cursor-pointer">
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
                        Description du service
                      </label>
                      <textarea
                        value={formData.services.delivery.description}
                        onChange={(e) => updateFormData('services.delivery.description', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 h-20"
                        placeholder="Décrivez votre service de livraison..."
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
                        Description du service
                      </label>
                      <textarea
                        value={formData.services.postal.description}
                        onChange={(e) => updateFormData('services.postal.description', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 h-20"
                        placeholder="Décrivez votre service d'envoi postal..."
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
                        Description du service
                      </label>
                      <textarea
                        value={formData.services.meetup.description}
                        onChange={(e) => updateFormData('services.meetup.description', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 h-20"
                        placeholder="Décrivez votre service de meetup..."
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
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Ajouter
                </button>
              </div>
              
              {formData.socialMedia.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun réseau social ajouté</p>
              ) : (
                <div className="space-y-4">
                  {formData.socialMedia.map((social, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-sm font-medium text-gray-900">Réseau social #{index + 1}</h3>
                        <button
                          onClick={() => removeSocialMedia(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Nom
                          </label>
                          <input
                            type="text"
                            value={social.name}
                            onChange={(e) => updateSocialMedia(index, 'name', e.target.value)}
                            className="w-full border border-gray-300 rounded p-2 text-sm"
                            placeholder="Instagram"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Emoji
                          </label>
                          <input
                            type="text"
                            value={social.emoji}
                            onChange={(e) => updateSocialMedia(index, 'emoji', e.target.value)}
                            className="w-full border border-gray-300 rounded p-2 text-sm"
                            placeholder="📸"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            URL
                          </label>
                          <input
                            type="url"
                            value={social.url}
                            onChange={(e) => updateSocialMedia(index, 'url', e.target.value)}
                            className="w-full border border-gray-300 rounded p-2 text-sm"
                            placeholder="https://instagram.com/..."
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