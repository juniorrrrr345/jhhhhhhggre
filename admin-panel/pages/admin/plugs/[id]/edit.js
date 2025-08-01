import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../../components/Layout'
import toast from 'react-hot-toast'
import { simpleApi } from '../../../../lib/api-simple'
import { getRobustSync } from '../../../../lib/robust-sync'
import postalCodeService from '../../../../lib/postalCodeService'
import cityService from '../../../../lib/cityService'
import {
  PlusIcon,
  PhotoIcon,
  StarIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

// Utiliser les pays du service postal + quelques autres
const COUNTRIES = [
  ...new Set([
    ...postalCodeService.getAvailableCountries(),
    'Tunisie', 'Algérie'
  ])
].sort()

export default function EditPlugV2() {
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    telegramLink: '', // Lien Telegram optionnel
    countries: [],
    isActive: true,
    isVip: false,
    vipOrder: 1,
    services: {
      delivery: {
        enabled: false,
        description: '',
        cities: []
      },
      postal: {
        enabled: false,
        description: '',
        countries: []
      },
      meetup: {
        enabled: false,
        description: '',
        cities: []
      }
    },
    socialMedia: [
      // Chaque réseau social aura : name, emoji, url
    ]
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedCountries, setSelectedCountries] = useState([])
  const [citySearch, setCitySearch] = useState('')
  const [meetupCitySearch, setMeetupCitySearch] = useState('')
  const [citiesByCountry, setCitiesByCountry] = useState({})
  const router = useRouter()
  const { id } = router.query

  // Fonction pour récupérer les villes depuis l'API
  const fetchCities = async (country) => {
    const token = localStorage.getItem('adminToken')
    const cities = await cityService.fetchCities(country, token)
    
    setCitiesByCountry(prev => ({
      ...prev,
      [country]: cities
    }))
    
    return cities
  }

  // Obtenir les villes disponibles pour les pays sélectionnés
  const getAvailableCities = () => {
    if (selectedCountries.length === 0) return []
    
    const citiesByCountryArray = []
    
    // Créer une structure pour afficher les villes par pays
    selectedCountries.forEach(country => {
      const cities = citiesByCountry[country] || []
      if (cities.length > 0) {
        citiesByCountryArray.push({
          country,
          cities: cities
        })
      }
    })
    
    console.log('getAvailableCities appelé:', {
      selectedCountries,
      citiesByCountry,
      result: citiesByCountryArray
    })
    
    return citiesByCountryArray
  }

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
  }, [])

  // Charger les villes quand les pays sont sélectionnés
  useEffect(() => {
    // Ne pas charger les villes tant que les données du plug ne sont pas chargées
    if (loading) return
    
    const loadCities = async () => {
      console.log('Chargement des villes pour:', selectedCountries)
      
      // Limiter à 5 pays maximum pour éviter trop de requêtes
      const countriesToLoad = selectedCountries.slice(0, 5)
      
      for (const country of countriesToLoad) {
        if (!citiesByCountry[country]) {
          try {
            console.log(`Chargement des villes pour ${country}...`)
            await fetchCities(country)
            // Augmenter la pause à 2 secondes entre les requêtes
            await new Promise(resolve => setTimeout(resolve, 2000))
          } catch (error) {
            console.log(`Pas de villes disponibles pour ${country}`)
            // Marquer le pays comme traité même s'il n'y a pas de villes
            setCitiesByCountry(prev => ({
              ...prev,
              [country]: []
            }))
          }
        }
      }
      
      // Si plus de 5 pays, afficher un message
      if (selectedCountries.length > 5) {
        console.log(`Chargement limité aux 5 premiers pays pour éviter les erreurs`)
      }
    }
    
    if (selectedCountries.length > 0) {
      loadCities()
    }
  }, [selectedCountries.join(','), loading]) // Utiliser join pour éviter les re-renders infinis

  // Charger les données du plug
  const fetchPlug = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const response = await simpleApi.getPlugs(token)
      const plugs = response.plugs || []
      const plug = plugs.find(p => p._id === id || p.id === id)
      
      if (!plug) {
        toast.error('Boutique non trouvée')
        router.push('/admin/plugs')
        return
      }

      // Remplir le formulaire avec les données existantes
      setFormData({
        name: plug.name || '',
        image: plug.image || '',
        telegramLink: plug.telegramLink || '',
        isVip: plug.isVip || false,
        vipOrder: plug.vipOrder || 1,
        isActive: plug.isActive !== undefined ? plug.isActive : true,
        countries: plug.countries || [],
        services: {
          delivery: {
            enabled: plug.services?.delivery?.enabled || false,
            description: plug.services?.delivery?.description || '',
            cities: plug.services?.delivery?.cities || []
          },
          postal: {
            enabled: plug.services?.postal?.enabled || false,
            description: plug.services?.postal?.description || '',
            countries: plug.services?.postal?.countries || []
          },
          meetup: {
            enabled: plug.services?.meetup?.enabled || false,
            description: plug.services?.meetup?.description || '',
            cities: plug.services?.meetup?.cities || []
          }
        },
        socialMedia: plug.socialMedia || []
      })

      // Mettre à jour les pays sélectionnés
      setSelectedCountries(plug.countries || [])
      
      // Debug : afficher les données chargées
      console.log('Données chargées:', {
        countries: plug.countries,
        deliveryEnabled: plug.services?.delivery?.enabled,
        deliveryCities: plug.services?.delivery?.cities,
        meetupEnabled: plug.services?.meetup?.enabled,
        meetupCities: plug.services?.meetup?.cities
      })
      
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      toast.error('Erreur lors du chargement de la boutique')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchPlug()
    }
  }, [id])

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
    console.log('handleServiceChange appelé:', { service, field, value })
    
    setFormData(prev => {
      console.log('État actuel des services:', prev.services)
      
      // Protection contre les services non définis
      if (!prev.services[service]) {
        console.error(`Service ${service} non défini dans formData`)
        return prev
      }
      
      // Si on active un service et qu'on n'a pas encore chargé les villes, les charger
      if (field === 'enabled' && value === true && selectedCountries.length > 0) {
        // Log désactivé temporairement
        // console.log(`Service ${service} activé, villes disponibles:`, citiesByCountry)
      }
      
      return {
        ...prev,
        services: {
          ...prev.services,
          [service]: {
            ...prev.services[service],
            [field]: value
          }
        }
      }
    })
  }

  const toggleCity = (service, city) => {
    // Protection contre les services non définis
    if (!formData.services[service]) {
      console.error(`Service ${service} non défini`)
      return
    }
    
    const currentCities = formData.services[service].cities || []
    const newCities = currentCities.includes(city)
      ? currentCities.filter(c => c !== city)
      : [...currentCities, city]
    
    handleServiceChange(service, 'cities', newCities)
  }

  const togglePostalCountry = (country) => {
    const currentCountries = formData.services.postal.countries || []
    const newCountries = currentCountries.includes(country)
      ? currentCountries.filter(c => c !== country)
      : [...currentCountries, country]
    
    handleServiceChange('postal', 'countries', newCountries)
  }

  const toggleCountry = (country) => {
    const newCountries = formData.countries.includes(country)
      ? formData.countries.filter(c => c !== country)
      : [...formData.countries, country]
    
    setFormData(prev => ({
      ...prev,
      countries: newCountries
    }))
    
    // Mettre à jour les pays sélectionnés pour les départements
    setSelectedCountries(newCountries)
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
      toast.error('Le nom de la boutique est requis')
      return
    }

    setSaving(true)

    try {
      // Préparer les données exactement comme l'API les attend
      const plugData = {
        name: formData.name.trim(),
        image: formData.image || '',
        countries: formData.countries,
        isVip: formData.isVip,
        services: {
          delivery: {
            enabled: formData.services.delivery.enabled,
            description: formData.services.delivery.description || '',
                          cities: formData.services.delivery.cities || []
          },
          postal: {
            enabled: formData.services.postal.enabled,
            description: formData.services.postal.description || '',
            countries: formData.services.postal.countries || []
          },
          meetup: {
            enabled: formData.services.meetup.enabled,
            description: formData.services.meetup.description || '',
                          cities: formData.services.meetup.cities || []
          }
        },
        contact: {
          telegram: formData.telegramLink || '@defaultcontact'
        },
        socialMedia: formData.socialMedia.filter(sm => sm.name && sm.url)
      }

      // Appel simple et direct à l'API pour UPDATE
      const response = await fetch('/api/cors-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: `/api/plugs/${id}`,
          method: 'PUT',
          token: localStorage.getItem('adminToken'),
          data: plugData
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        toast.success('✅ Boutique modifiée avec succès !')
        setTimeout(() => {
          router.push('/admin/plugs?refresh=true')
        }, 1000)
      } else {
        throw new Error(result.error || 'Erreur lors de la modification')
      }

    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error.message || 'Erreur lors de la création de la boutique')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Modifier Boutique">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de la boutique...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Modifier Boutique">
      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Modifier Boutique</h1>
              <p className="text-gray-600">Modifiez les informations de votre boutique</p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/admin/plugs?refresh=true')}
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
                      checked={formData.services?.delivery?.enabled || false}
                      onChange={(e) => {
                        try {
                          handleServiceChange('delivery', 'enabled', e.target.checked)
                        } catch (error) {
                          console.error('Erreur checkbox delivery:', error)
                        }
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      🚚 Service de livraison
                    </label>
                  </div>
                  {formData.services?.delivery?.enabled && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={formData.services?.delivery?.description || ''}
                        onChange={(e) => handleServiceChange('delivery', 'description', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Livraison disponible sur 75001, 75002, 75003, 92100, 93100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Entrez les codes postaux dans la description pour la recherche dans la mini-app
                      </p>
                      
                      {/* Départements pour la livraison */}
                      {selectedCountries.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            📍 Villes de livraison disponibles :
                          </label>
                          
                          {/* Champ de recherche pour les villes */}
                          <div className="mb-3 relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Rechercher une ville..."
                              value={citySearch}
                              onChange={(e) => setCitySearch(e.target.value)}
                              className="w-full pl-10 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                            {getAvailableCities().map(({ country, cities }) => {
                              // Filtrer les villes selon la recherche
                              const filteredCities = citySearch 
                                ? cities.filter(city => city.toLowerCase().includes(citySearch.toLowerCase()))
                                : cities;
                              
                              if (filteredCities.length === 0) return null;
                              
                              return (
                                <div key={country} className="mb-4">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                    🌍 {country} ({filteredCities.length} villes)
                                  </h4>
                                  <div className="grid grid-cols-3 gap-2">
                                    {filteredCities.map(city => (
                                      <button
                                        key={`${country}-${city}`}
                                        type="button"
                                        onClick={() => toggleCity('delivery', city)}
                                        className={`px-3 py-2 rounded text-sm font-medium border transition-colors ${
                                          (formData.services.delivery.cities || []).includes(city)
                                            ? 'bg-blue-500 border-blue-500 text-white'
                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                      >
                                        {city}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Sélectionnés: {(formData.services?.delivery?.cities || []).length} villes
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Postal */}
                <div>
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={formData.services?.postal?.enabled || false}
                      onChange={(e) => {
                        try {
                          handleServiceChange('postal', 'enabled', e.target.checked)
                        } catch (error) {
                          console.error('Erreur checkbox postal:', error)
                        }
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      ✈️ Envoi postal
                    </label>
                  </div>
                  {formData.services?.postal?.enabled && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={formData.services?.postal?.description || ''}
                        onChange={(e) => handleServiceChange('postal', 'description', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Envoi postal sécurisé dans toute la France"
                      />
                      
                      {/* Pays pour l'envoi postal */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🌍 Pays d'envoi postal disponibles :
                        </label>
                        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                          <div className="grid grid-cols-3 gap-2">
                            {COUNTRIES.map(country => (
                              <button
                                key={country}
                                type="button"
                                onClick={() => togglePostalCountry(country)}
                                className={`px-3 py-2 rounded text-sm font-medium border transition-colors ${
                                  (formData.services.postal.countries || []).includes(country)
                                    ? 'bg-blue-500 border-blue-500 text-white'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                🌍 {country}
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Sélectionnés: {(formData.services.postal.countries || []).length} pays
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Meetup */}
                <div>
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={formData.services?.meetup?.enabled || false}
                      onChange={(e) => {
                        try {
                          handleServiceChange('meetup', 'enabled', e.target.checked)
                        } catch (error) {
                          console.error('Erreur checkbox meetup:', error)
                        }
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      🏠 Service meetup
                    </label>
                  </div>
                  {formData.services?.meetup?.enabled && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={formData.services?.meetup?.description || ''}
                        onChange={(e) => handleServiceChange('meetup', 'description', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Meetup disponible sur 75001, 75002, 92100, 93100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Entrez les codes postaux dans la description pour la recherche dans la mini-app
                      </p>
                      
                      {/* Départements pour les meetups */}
                                              {selectedCountries.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            📍 Villes de meetup disponibles :
                          </label>
                          
                          {/* Champ de recherche pour les villes */}
                          <div className="mb-3 relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Rechercher une ville..."
                              value={meetupCitySearch}
                              onChange={(e) => setMeetupCitySearch(e.target.value)}
                              className="w-full pl-10 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                            {getAvailableCities().map(({ country, cities }) => {
                              // Filtrer les villes selon la recherche
                              const filteredCities = meetupCitySearch 
                                ? cities.filter(city => city.toLowerCase().includes(meetupCitySearch.toLowerCase()))
                                : cities;
                              
                              if (filteredCities.length === 0) return null;
                              
                              return (
                                <div key={country} className="mb-4">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                    🌍 {country} ({filteredCities.length} villes)
                                  </h4>
                                  <div className="grid grid-cols-3 gap-2">
                                    {filteredCities.map(city => (
                                      <button
                                        key={`${country}-${city}`}
                                        type="button"
                                        onClick={() => toggleCity('meetup', city)}
                                        className={`px-3 py-2 rounded text-sm font-medium border transition-colors ${
                                          (formData.services.meetup.cities || []).includes(city)
                                            ? 'bg-purple-500 border-purple-500 text-white'
                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                      >
                                        {city}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Sélectionnés: {(formData.services?.meetup?.cities || []).length} villes
                          </p>
                        </div>
                      )}
                    </div>
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
                  type="submit"
                  disabled={loading || saving}
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Modification...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5 mr-2" />
                      Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </Layout>
  )
}