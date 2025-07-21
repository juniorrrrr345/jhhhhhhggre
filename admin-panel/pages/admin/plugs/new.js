import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  PhotoIcon,
  StarIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const COUNTRIES = [
  'France', 'Belgique', 'Suisse', 'Canada', 'Maroc', 'Tunisie', 'Algérie',
  'Espagne', 'Italie', 'Allemagne', 'Pays-Bas', 'Luxembourg', 'Autre'
]

export default function NewPlug() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    telegramLink: '', // Lien Telegram optionnel
    countries: [],
    isActive: true,
    isVip: false,
    vipOrder: 1,
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
    socialMedia: [
      // Chaque réseau social aura : name, emoji, url
    ]
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
  }, [])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
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

  const savePlug = async () => {
    if (!formData.name.trim()) {
      toast.error('Le nom de la boutique est requis')
      return
    }

    if (!formData.description.trim()) {
      toast.error('La description est requise')
      return
    }

    if (formData.countries.length === 0) {
      toast.error('Sélectionnez au moins un pays')
      return
    }

    const token = localStorage.getItem('adminToken')
    setLoading(true)

    try {
      const response = await fetch(`${process.env.API_BASE_URL}/api/plugs`, {
        method: 'POST',
        headers: {
          'Authorization': token, // Proxy gère Bearer automatiquement
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Boutique créée avec succès !')
        router.push('/admin/plugs')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la création')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Nouvelle Boutique">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nouvelle Boutique</h1>
            <p className="text-gray-600">Ajoutez une nouvelle boutique à votre catalogue</p>
          </div>
          <button
            onClick={() => router.push('/admin/plugs')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <XMarkIcon className="w-4 h-4 mr-2" />
            Annuler
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations de base */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Informations de base</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la boutique *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: PlugParis"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Décrivez votre boutique..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de l'image
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://exemple.com/image.jpg"
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
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://t.me/votre_canal"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ajoutez le lien Telegram principal de votre boutique (optionnel)
                  </p>
                </div>
              </div>
            </div>

            {/* Pays */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Pays de service *</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {COUNTRIES.map(country => (
                    <button
                      key={country}
                      type="button"
                      onClick={() => toggleCountry(country)}
                      className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                        formData.countries.includes(country)
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      🌍 {country}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Services proposés</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Livraison */}
                <div>
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={formData.services.delivery.enabled}
                      onChange={(e) => handleServiceChange('delivery', 'enabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      🚚 Service de livraison
                    </label>
                  </div>
                  {formData.services.delivery.enabled && (
                    <input
                      type="text"
                      value={formData.services.delivery.description}
                      onChange={(e) => handleServiceChange('delivery', 'description', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Livraison rapide en moins de 2h"
                    />
                  )}
                </div>

                {/* Postal */}
                <div>
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={formData.services.postal.enabled}
                      onChange={(e) => handleServiceChange('postal', 'enabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      ✈️ Envoi postal
                    </label>
                  </div>
                  {formData.services.postal.enabled && (
                    <input
                      type="text"
                      value={formData.services.postal.description}
                      onChange={(e) => handleServiceChange('postal', 'description', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Envoi postal sécurisé dans toute la France"
                    />
                  )}
                </div>

                {/* Meetup */}
                <div>
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={formData.services.meetup.enabled}
                      onChange={(e) => handleServiceChange('meetup', 'enabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      🏠 Service meetup
                    </label>
                  </div>
                  {formData.services.meetup.enabled && (
                    <input
                      type="text"
                      value={formData.services.meetup.description}
                      onChange={(e) => handleServiceChange('meetup', 'description', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Rencontre en lieu sûr"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Réseaux sociaux</h2>
              </div>
              <div className="p-6 space-y-4">
                {formData.socialMedia.map((social, index) => (
                  <div key={index} className="flex space-x-2 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du réseau
                      </label>
                      <input
                        type="text"
                        value={social.name || ''}
                        onChange={(e) => updateSocialMedia(index, 'name', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Instagram, TikTok, Discord..."
                      />
                    </div>
                    <div className="w-20">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emoji
                      </label>
                      <input
                        type="text"
                        value={social.emoji || ''}
                        onChange={(e) => updateSocialMedia(index, 'emoji', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center"
                        placeholder="📱"
                        maxLength="2"
                      />
                    </div>
                    <div className="flex-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lien
                      </label>
                      <input
                        type="url"
                        value={social.url || ''}
                        onChange={(e) => updateSocialMedia(index, 'url', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://exemple.com"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSocialMedia(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addSocialMedia}
                  className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:text-gray-800 hover:border-gray-400"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Ajouter un réseau social
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statut */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Statut</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-3 text-sm font-medium text-gray-700">
                    Boutique active
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isVip}
                    onChange={(e) => handleInputChange('isVip', e.target.checked)}
                    className="h-4 w-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <label className="ml-3 text-sm font-medium text-gray-700">
                    <span className="flex items-center">
                      <StarIcon className="w-4 h-4 mr-1 text-yellow-500" />
                      Boutique VIP
                    </span>
                  </label>
                </div>
                {formData.isVip && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ordre VIP
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.vipOrder}
                      onChange={(e) => handleInputChange('vipOrder', parseInt(e.target.value) || 1)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Plus le nombre est petit, plus la boutique sera affichée en premier
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Prévisualisation image */}
            {formData.image && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Prévisualisation</h2>
                </div>
                <div className="p-6">
                  <img
                    src={formData.image}
                    alt="Prévisualisation"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <button
                  onClick={savePlug}
                  disabled={loading}
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Créer la boutique
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}