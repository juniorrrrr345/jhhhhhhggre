import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../../components/Layout'
import toast from 'react-hot-toast'
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline'

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
    telegramLink: '', // Optionnel maintenant
    isVip: false,
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
    socialMedia: [] // Format tableau avec name, emoji, url
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
    if (id) {
      loadPlug()
    }
  }, [id])

  const loadPlug = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
      
      let response
      try {
        response = await fetch(`${apiBaseUrl}/api/plugs/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      } catch (directError) {
        response = await fetch(`/api/proxy?endpoint=/api/plugs/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }

      if (response.ok) {
        const plug = await response.json()
        setFormData({
          name: plug.name || '',
          description: plug.description || '',
          image: plug.image || '',
          telegramLink: plug.telegramLink || '',
          isVip: plug.isVip || false,
          countries: plug.countries || [],
          services: {
            delivery: {
              enabled: plug.services?.delivery?.enabled || false,
              description: plug.services?.delivery?.description || ''
            },
            postal: {
              enabled: plug.services?.postal?.enabled || false,
              description: plug.services?.postal?.description || ''
            },
            meetup: {
              enabled: plug.services?.meetup?.enabled || false,
              description: plug.services?.meetup?.description || ''
            }
          },
          socialMedia: Array.isArray(plug.socialMedia) ? plug.socialMedia : []
        })
      } else {
        const errorText = await response.text()
        console.error('Erreur response:', response.status, errorText)
        toast.error(`Erreur lors du chargement du plug: ${response.status}`)
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(`Erreur lors du chargement: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleServiceChange = (service, field, value) => {
    setFormData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: {
          ...prev.services[service],
          [field]: value
        }
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Le nom est requis')
      return
    }

    setSaving(true)
    
    try {
      const token = localStorage.getItem('adminToken')
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
      
      let response
      try {
        response = await fetch(`${apiBaseUrl}/api/plugs/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
      } catch (directError) {
        response = await fetch(`/api/proxy?endpoint=/api/plugs/${id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            _method: 'PUT',
            ...formData
          })
        })
      }

      if (response.ok) {
        toast.success('Plug modifié avec succès !')
        router.push('/admin/plugs')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la modification')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la modification')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modifier le Plug</h1>
          <p className="text-gray-600 mt-1">Modifiez les informations du plug</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Informations de base</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la boutique *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Ma Boutique Premium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image de la boutique
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez votre boutique et vos produits..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lien Telegram (optionnel)
              </label>
              <input
                type="url"
                value={formData.telegramLink}
                onChange={(e) => handleInputChange('telegramLink', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://t.me/votre_boutique"
              />
              <p className="text-xs text-gray-500 mt-1">Lien vers votre canal ou groupe Telegram</p>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isVip}
                  onChange={(e) => handleInputChange('isVip', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Boutique VIP</span>
              </label>
            </div>
          </div>

          {/* Pays de livraison */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pays de livraison</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {countries.map(country => (
                <label key={country} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.countries.includes(country)}
                    onChange={() => toggleCountry(country)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{country}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Services disponibles</h2>
            
            {/* Livraison */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={formData.services.delivery.enabled}
                  onChange={(e) => handleServiceChange('delivery', 'enabled', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-lg font-medium">🚚 Livraison</span>
              </div>
              {formData.services.delivery.enabled && (
                <input
                  type="text"
                  value={formData.services.delivery.description}
                  onChange={(e) => handleServiceChange('delivery', 'description', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Livraison rapide en moins de 2h dans Paris"
                />
              )}
            </div>

            {/* Envoi postal */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={formData.services.postal.enabled}
                  onChange={(e) => handleServiceChange('postal', 'enabled', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-lg font-medium">✈️ Envoi postal</span>
              </div>
              {formData.services.postal.enabled && (
                <input
                  type="text"
                  value={formData.services.postal.description}
                  onChange={(e) => handleServiceChange('postal', 'description', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Envoi postal sécurisé partout en Europe"
                />
              )}
            </div>

            {/* Meetup */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={formData.services.meetup.enabled}
                  onChange={(e) => handleServiceChange('meetup', 'enabled', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-lg font-medium">🏠 Meetup local</span>
              </div>
              {formData.services.meetup.enabled && (
                <input
                  type="text"
                  value={formData.services.meetup.description}
                  onChange={(e) => handleServiceChange('meetup', 'description', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Rencontre possible sur Paris 15ème"
                />
              )}
            </div>
          </div>

          {/* Réseaux sociaux personnalisés */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Réseaux sociaux personnalisés</h2>
              <button
                type="button"
                onClick={addSocialMedia}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 flex items-center space-x-1"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            </div>
            
            {formData.socialMedia.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun réseau social ajouté</p>
            ) : (
              <div className="space-y-4">
                {formData.socialMedia.map((social, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={social.name}
                          onChange={(e) => updateSocialMedia(index, 'name', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Instagram"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Emoji
                        </label>
                        <input
                          type="text"
                          value={social.emoji}
                          onChange={(e) => updateSocialMedia(index, 'emoji', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="📸"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL
                        </label>
                        <input
                          type="url"
                          value={social.url}
                          onChange={(e) => updateSocialMedia(index, 'url', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                      
                      <div>
                        <button
                          type="button"
                          onClick={() => removeSocialMedia(index)}
                          className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 flex items-center space-x-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Modification...' : 'Modifier le plug'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/plugs')}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}