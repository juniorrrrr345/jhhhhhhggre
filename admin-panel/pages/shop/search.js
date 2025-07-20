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
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [allPlugs, setAllPlugs] = useState([])

  useEffect(() => {
    fetchConfig()
    fetchAllPlugs()
    
    // Auto-refresh pour la synchronisation (réduit à 15 secondes pour la recherche)
    const interval = setInterval(() => {
      fetchConfig()
      if (allPlugs.length === 0) {
        fetchAllPlugs()
      }
    }, 15000)
    
    // Écouter les signaux de synchronisation du panel admin
    const handleSyncSignal = (event) => {
      if (event.key === 'boutique_sync_signal') {
        console.log('🔄 [SEARCH] Signal de synchronisation reçu, rechargement...');
        fetchConfig();
        // Relancer la recherche actuelle si il y en a une
        if (searchTerm || selectedService || selectedCountry) {
          searchPlugs();
        }
      }
    };
    
    const handleStorageChange = (event) => {
      if (event.key === 'boutique_sync_signal') {
        console.log('🔄 [SEARCH] Signal de synchronisation cross-tab reçu, rechargement...');
        fetchConfig();
        if (searchTerm || selectedService || selectedCountry) {
          searchPlugs();
        }
      }
    };
    
    // Écouter les événements de synchronisation
    window.addEventListener('storage', handleSyncSignal);
    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier s'il y a un signal en attente au chargement
    const checkPendingSync = () => {
      const pendingSync = localStorage.getItem('boutique_sync_signal');
      if (pendingSync) {
        try {
          const signal = JSON.parse(pendingSync);
          // Si le signal est récent (moins de 5 minutes), on synchronise
          if (Date.now() - signal.timestamp < 300000) {
            console.log('🔄 [SEARCH] Signal de synchronisation en attente détecté');
            fetchConfig();
          }
        } catch (error) {
          console.error('[SEARCH] Erreur parsing signal sync:', error);
        }
      }
    };
    
    checkPendingSync();
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleSyncSignal);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [])

  useEffect(() => {
    if (allPlugs.length > 0) {
      filterPlugs()
    }
  }, [search, selectedCountry, selectedService, allPlugs])

  const fetchConfig = async () => {
    try {
      // Utiliser l'endpoint public de configuration
      const timestamp = new Date().getTime()
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
      
      console.log('🔍 Récupération config recherche depuis:', apiBaseUrl)
      
      // Essayer d'abord l'API directe
      try {
        const response = await fetch(`${apiBaseUrl}/api/public/config?t=${timestamp}`, {
          cache: 'no-cache',
          headers: { 
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Config recherche chargée:', data)
          setConfig(data)
          return
        }
      } catch (directError) {
        console.log('❌ Config recherche directe échouée:', directError.message)
      }
      
      // Fallback vers le proxy si disponible
      try {
        const response = await fetch(`/api/proxy?endpoint=/api/public/config&t=${timestamp}`, {
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Config recherche via proxy chargée:', data)
          setConfig(data)
        }
      } catch (proxyError) {
        console.log('❌ Config recherche proxy échouée:', proxyError.message)
      }
      
    } catch (error) {
      console.log('❌ Erreur chargement config recherche:', error)
    }
  }

  const fetchAllPlugs = async () => {
    try {
      setLoading(true)
      
      // Essayer d'abord l'API directe
      let data
      try {
        const timestamp = new Date().getTime()
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
        const url = `${apiBaseUrl}/api/public/plugs?filter=active&limit=100&t=${timestamp}`
        
        console.log('🔍 Search tentative directe:', url)
        const response = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        if (response.ok) {
          data = await response.json()
          console.log('✅ Search API directe réussie')
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (directError) {
        console.log('❌ Search API directe échouée:', directError.message)
        console.log('🔄 Search tentative via proxy...')
        
        // Fallback vers le proxy
        const proxyUrl = `/api/proxy?endpoint=/api/public/plugs&filter=active&limit=100&t=${new Date().getTime()}`
        const proxyResponse = await fetch(proxyUrl, {
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        if (proxyResponse.ok) {
          data = await proxyResponse.json()
          console.log('✅ Search proxy réussi')
        } else {
          throw new Error(`Search proxy failed: HTTP ${proxyResponse.status}`)
        }
      }
      
      if (data && Array.isArray(data.plugs)) {
        console.log('📊 Search data received:', data.plugs.length, 'plugs')
        setAllPlugs(data.plugs)
        setPlugs(data.plugs)
      } else {
        console.error('❌ Invalid search data structure:', data)
        setAllPlugs([])
        setPlugs([])
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

    // Trier par VIP en premier, puis par likes
    filteredPlugs.sort((a, b) => {
      if (a.isVip && !b.isVip) return -1
      if (!a.isVip && b.isVip) return 1
      // Si même statut VIP, trier par likes
      return (b.likes || 0) - (a.likes || 0)
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
        <title>Recherche - {config?.boutique?.name || 'Boutique'}</title>
        <meta name="description" content="Recherchez vos boutiques préférées par nom, pays ou service." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-gray-900 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {config?.boutique?.logo ? (
                    <img 
                      src={config.boutique.logo} 
                      alt="Logo" 
                      className="h-8 w-8 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {config?.boutique?.name ? config.boutique.name.charAt(0).toUpperCase() : 'B'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-white">
                    {config?.boutique?.searchTitle || config?.boutique?.name || ''}
                  </h1>
                  <p className="text-gray-300 text-sm">
                    {config?.boutique?.searchSubtitle || ''}
                  </p>
                </div>
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
                className="text-gray-500 hover:text-gray-700 pb-3 flex items-center"
              >
                {config?.boutique?.logo ? (
                  <img src={config.boutique.logo} alt="Logo" className="h-4 w-4 mr-2 rounded object-cover" />
                ) : (
                  <span className="mr-1">🏠</span>
                )}
                Accueil
              </Link>
              <Link 
                href="/shop/search" 
                className="text-blue-600 font-medium border-b-2 border-blue-600 pb-3 flex items-center"
              >
                {config?.boutique?.logo ? (
                  <img src={config.boutique.logo} alt="Logo" className="h-4 w-4 mr-2 rounded object-cover" />
                ) : (
                  <span className="mr-1">🔍</span>
                )}
                Recherche
              </Link>
              <Link 
                href="/shop/vip" 
                className="text-gray-500 hover:text-gray-700 pb-3 flex items-center"
              >
                {config?.boutique?.logo && (
                  <img src={config.boutique.logo} alt="Logo" className="h-4 w-4 mr-2 rounded object-cover" />
                )}
                VIP
              </Link>

            </div>
          </div>
        </nav>

        {/* Section de recherche */}
        <div className="bg-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                {config?.boutique?.logo ? (
                  <img 
                    src={config.boutique.logo} 
                    alt="Logo" 
                    className="h-12 w-12 rounded-lg object-cover mr-4"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white text-lg font-bold">
                      {config?.boutique?.name ? config.boutique.name.charAt(0).toUpperCase() : 'B'}
                    </span>
                  </div>
                )}
                <h2 className="text-3xl font-bold text-white">
                  {config?.boutique?.searchTitle || config?.boutique?.name || ''}
                </h2>
              </div>
              <p className="text-gray-300">
                {config?.boutique?.searchSubtitle || ''}
              </p>
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
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {plugs.map((plug, index) => (
                <Link key={plug._id} href={`/shop/${plug._id}`}>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-400 transition-colors duration-300 cursor-pointer">
                    {/* Image */}
                    <div className="relative h-32 sm:h-40">
                      <img
                        src={plug.image || '/placeholder.jpg'}
                        alt={plug.name}
                        className="w-full h-full object-cover grayscale"
                      />
                      {/* Badges en haut à droite pour ne pas cacher le nom */}
                      <div className="absolute top-2 right-2 space-y-1">
                        {plug.isVip && (
                          <div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-900 text-white">
                              <StarIcon className="w-3 h-3 mr-1" />
                              VIP
                            </span>
                          </div>
                        )}
                        {/* Badge Top 3 */}
                        {index < 3 && plug.likes > 0 && (
                          <div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-3 sm:p-4">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 truncate">{plug.name}</h3>
                      <p className="text-gray-600 mb-3 text-xs sm:text-sm line-clamp-2 h-8">{plug.description}</p>

                      {/* Localisation */}
                      {plug.countries && plug.countries.length > 0 && (
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2">
                          <MapPinIcon className="w-3 h-3 mr-1" />
                          <span className="truncate">{plug.countries.join(', ')}</span>
                        </div>
                      )}

                      {/* Services */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {plug.services?.delivery?.enabled && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            <TruckIcon className="w-2.5 h-2.5 mr-1" />
                            Livraison
                          </span>
                        )}
                        {plug.services?.postal?.enabled && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            <GlobeAltIcon className="w-2.5 h-2.5 mr-1" />
                            Postal
                          </span>
                        )}
                        {plug.services?.meetup?.enabled && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            <HomeIcon className="w-2.5 h-2.5 mr-1" />
                            Meetup
                          </span>
                        )}
                      </div>

                      {/* Likes */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-gray-600 text-xs sm:text-sm">Voir détails</span>
                        <div className="flex items-center text-red-500 text-xs sm:text-sm font-medium">
                          <span className="mr-1">❤️</span>
                          <span>{plug.likes || 0} like{(plug.likes || 0) !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {config?.boutique?.logo ? (
                  <img 
                    src={config.boutique.logo} 
                    alt="Logo" 
                    className="h-6 w-6 rounded object-cover mr-2"
                  />
                ) : null}
                <h3 className="text-lg font-medium">
                  {config?.boutique?.name || 'Boutique Premium'}
                </h3>
              </div>
              <p className="text-gray-400 mb-4">
                {config?.boutique?.subtitle || 'Votre destination shopping premium'}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}