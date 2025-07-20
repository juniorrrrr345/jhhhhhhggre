import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import {
  MagnifyingGlassIcon,
  StarIcon,
  MapPinIcon,
  TruckIcon,
  GlobeAltIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

export default function Shop() {
  const [plugs, setPlugs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedService, setSelectedService] = useState('')

  useEffect(() => {
    fetchPlugs()
  }, [search, selectedCountry, selectedService])

  const fetchPlugs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        filter: 'active',
        search,
        limit: 100
      })

      const response = await fetch(`${process.env.API_BASE_URL}/api/plugs?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        let filteredPlugs = data.plugs

        // Filtrer par pays
        if (selectedCountry) {
          filteredPlugs = filteredPlugs.filter(plug => 
            plug.countries?.includes(selectedCountry)
          )
        }

        // Filtrer par service
        if (selectedService) {
          filteredPlugs = filteredPlugs.filter(plug => 
            plug.services?.[selectedService]?.enabled
          )
        }

        // Trier par VIP en premier
        filteredPlugs.sort((a, b) => {
          if (a.isVip && !b.isVip) return -1
          if (!a.isVip && b.isVip) return 1
          return 0
        })

        setPlugs(filteredPlugs)
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUniqueCountries = () => {
    const countries = new Set()
    plugs.forEach(plug => {
      plug.countries?.forEach(country => countries.add(country))
    })
    return Array.from(countries).sort()
  }

  const getServiceIcon = (service) => {
    switch(service) {
      case 'delivery': return '🚚'
      case 'postal': return '✈️'
      case 'meetup': return '🏠'
      default: return '📦'
    }
  }

  const getServiceName = (service) => {
    switch(service) {
      case 'delivery': return 'Livraison'
      case 'postal': return 'Envoi postal'
      case 'meetup': return 'Meetup'
      default: return service
    }
  }

  return (
    <>
      <Head>
        <title>Boutique VIP - Découvrez nos plugs premium</title>
        <meta name="description" content="Découvrez notre sélection de boutiques VIP avec livraison, envoi postal et meetup disponibles." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-purple-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                    <StarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-white">Boutique VIP</h1>
                  <p className="text-blue-100 text-sm">Plugs premium sélectionnés</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="https://t.me/votre_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  📱 Telegram Bot
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">
                🌟 Boutiques Premium
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Découvrez notre sélection exclusive de boutiques vérifiées avec livraison rapide, 
                envoi postal sécurisé et options de meetup.
              </p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Recherche */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nom de boutique..."
                  />
                </div>
              </div>

              {/* Pays */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tous les pays</option>
                  {getUniqueCountries().map(country => (
                    <option key={country} value={country}>🌍 {country}</option>
                  ))}
                </select>
              </div>

              {/* Service */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tous les services</option>
                  <option value="delivery">🚚 Livraison</option>
                  <option value="postal">✈️ Envoi postal</option>
                  <option value="meetup">🏠 Meetup</option>
                </select>
              </div>

              {/* Reset */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearch('')
                    setSelectedCountry('')
                    setSelectedService('')
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des boutiques */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Chargement des boutiques...</p>
            </div>
          ) : plugs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune boutique trouvée</h3>
              <p className="text-gray-500">Essayez de modifier vos filtres de recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plugs.map((plug) => (
                <div
                  key={plug._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Image */}
                  <div className="relative h-48">
                    <img
                      src={plug.image || '/placeholder.jpg'}
                      alt={plug.name}
                      className="w-full h-full object-cover"
                    />
                    {plug.isVip && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                          <StarIcon className="w-4 h-4 mr-1" />
                          VIP
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plug.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{plug.description}</p>

                    {/* Localisation */}
                    {plug.countries && plug.countries.length > 0 && (
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {plug.countries.join(', ')}
                      </div>
                    )}

                    {/* Services */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {plug.services?.delivery?.enabled && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <TruckIcon className="w-3 h-3 mr-1" />
                          Livraison
                        </span>
                      )}
                      {plug.services?.postal?.enabled && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <GlobeAltIcon className="w-3 h-3 mr-1" />
                          Postal
                        </span>
                      )}
                      {plug.services?.meetup?.enabled && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <HomeIcon className="w-3 h-3 mr-1" />
                          Meetup
                        </span>
                      )}
                    </div>

                    {/* Bouton de contact */}
                    <div className="space-y-2">
                      {plug.socialMedia?.telegram && (
                        <a
                          href={plug.socialMedia.telegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          📱 Contacter sur Telegram
                        </a>
                      )}
                      {plug.socialMedia?.whatsapp && (
                        <a
                          href={plug.socialMedia.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-green-500 hover:bg-green-600 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          💬 Contacter sur WhatsApp
                        </a>
                      )}
                      {plug.socialMedia?.website && (
                        <a
                          href={plug.socialMedia.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-gray-500 hover:bg-gray-600 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          🌐 Visiter le site
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Boutique VIP</h3>
              <p className="text-gray-400 mb-4">Votre sélection de boutiques premium</p>
              <div className="flex justify-center space-x-4">
                <a
                  href="https://t.me/votre_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  📱 Telegram Bot
                </a>
                <span className="text-gray-600">•</span>
                <Link href="/admin" className="text-purple-400 hover:text-purple-300">
                  🔧 Admin
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}