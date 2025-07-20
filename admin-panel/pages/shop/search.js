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

export default function ShopSearch() {
  const [plugs, setPlugs] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [allPlugs, setAllPlugs] = useState([])

  useEffect(() => {
    fetchAllPlugs()
    
    // Auto-refresh toutes les 30 secondes pour la synchronisation
    const interval = setInterval(() => {
      fetchAllPlugs()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (allPlugs.length > 0) {
      filterPlugs()
    }
  }, [search, selectedCountry, selectedService, allPlugs])

  const fetchAllPlugs = async () => {
    try {
      setLoading(true)
      // Utiliser l'endpoint public pour la boutique
      const timestamp = new Date().getTime()
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
      const url = `${apiBaseUrl}/api/public/plugs?filter=active&limit=100&t=${timestamp}`
      
      console.log('🔍 Search fetching from:', url)
      const response = await fetch(url, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Search data received:', data.plugs?.length || 0, 'plugs')
        
        if (data && Array.isArray(data.plugs)) {
          setAllPlugs(data.plugs)
          setPlugs(data.plugs)
        } else {
          console.error('❌ Invalid search data structure:', data)
          setAllPlugs([])
          setPlugs([])
        }
      } else {
        console.error('❌ Search response error:', response.status)
      }
    } catch (error) {
      console.error('💥 Search fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPlugs = () => {
    let filteredPlugs = [...allPlugs]

    // Filtrer par recherche
    if (search) {
      filteredPlugs = filteredPlugs.filter(plug => 
        plug.name.toLowerCase().includes(search.toLowerCase()) ||
        plug.description.toLowerCase().includes(search.toLowerCase())
      )
    }

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

  const getUniqueCountries = () => {
    const countries = new Set()
    allPlugs.forEach(plug => {
      plug.countries?.forEach(country => countries.add(country))
    })
    return Array.from(countries).sort()
  }

  const resetFilters = () => {
    setSearch('')
    setSelectedCountry('')
    setSelectedService('')
  }

  return (
    <>
      <Head>
        <title>Recherche - Boutique VIP</title>
        <meta name="description" content="Recherchez vos boutiques préférées par nom, pays ou service." />
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

        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 h-12 items-center">
              <Link 
                href="/shop" 
                className="text-gray-500 hover:text-gray-700 pb-3"
              >
                🏠 Accueil
              </Link>
              <Link 
                href="/shop/search" 
                className="text-blue-600 font-medium border-b-2 border-blue-600 pb-3"
              >
                🔍 Recherche
              </Link>
              <Link 
                href="/shop/vip" 
                className="text-gray-500 hover:text-gray-700 pb-3"
              >
                ⭐ VIP
              </Link>
            </div>
          </div>
        </nav>

        {/* Section de recherche */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">🔍 Recherche avancée</h2>
              <p className="text-blue-100">Trouvez la boutique parfaite selon vos critères</p>
            </div>
            
            {/* Filtres de recherche */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Recherche textuelle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom ou description
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Rechercher une boutique..."
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
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    Type de service
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tous les services</option>
                    <option value="delivery">🚚 Livraison rapide</option>
                    <option value="postal">✈️ Envoi postal</option>
                    <option value="meetup">🏠 Meetup local</option>
                  </select>
                </div>

                {/* Bouton reset */}
                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    🔄 Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              📋 Résultats de recherche
            </h3>
            <p className="text-gray-600">
              {loading ? 'Recherche en cours...' : `${plugs.length} boutique(s) trouvée(s)`}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Recherche en cours...</p>
            </div>
          ) : plugs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune boutique trouvée</h3>
              <p className="text-gray-500 mb-6">Essayez de modifier vos critères de recherche.</p>
              <button
                onClick={resetFilters}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                🔄 Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

                    {/* Boutons de contact */}
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