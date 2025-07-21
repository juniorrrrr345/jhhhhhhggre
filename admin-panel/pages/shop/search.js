import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'
import Pagination from '../../components/Pagination'
import {
  StarIcon,
  MapPinIcon,
  TruckIcon,
  GlobeAltIcon,
  HomeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

// Composant pour gérer l'affichage des images avec fallback
const ImageWithFallback = ({ src, alt, className, fallbackIcon: FallbackIcon = GlobeAltIcon }) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Reset state when src changes
  useEffect(() => {
    setImageError(false)
    setImageLoading(true)
  }, [src])

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    console.log('❌ Erreur chargement image:', src)
    setImageError(true)
    setImageLoading(false)
  }

  // Si pas d'image source ou erreur, afficher le fallback
  if (!src || imageError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
        <FallbackIcon className="w-16 h-16 text-gray-600" />
      </div>
    )
  }

  return (
    <>
      {/* Loading placeholder */}
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="animate-pulse">
            <FallbackIcon className="w-16 h-16 text-gray-600" />
          </div>
        </div>
      )}
      
      {/* Image */}
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          display: imageLoading ? 'none' : 'block'
        }}
      />
    </>
  )
}

export default function ShopSearch() {
  const [plugs, setPlugs] = useState([])
  const [allPlugs, setAllPlugs] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [vipFilter, setVipFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    fetchConfig()
    fetchPlugs()
    
    // Synchronisation plus fréquente pour une meilleure réactivité
    const interval = setInterval(() => {
      fetchConfig()
      fetchPlugs()
    }, 15000) // Réduit à 15 secondes
    
    const handleStorageChange = (event) => {
      if (event?.key === 'boutique_sync_signal' || event?.key === 'global_sync_signal') {
        console.log('🔄 Signal de synchronisation reçu:', event.key)
        setTimeout(() => {
          fetchConfig()
          fetchPlugs()
        }, 500)
        if (typeof toast !== 'undefined') {
          toast.success('🔄 Données synchronisées!', {
            duration: 2000,
            icon: '🔄'
          })
        }
      }
    }

    // Écouteur pour le focus de la fenêtre (rafraîchir quand l'utilisateur revient)
    const handleFocus = () => {
      console.log('👁️ Fenêtre focus - rafraîchissement des données recherche')
      fetchConfig()
      fetchPlugs()
    }

    // Écouteur pour détecter les changements de données en temps réel
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page recherche visible - vérification des mises à jour')
        fetchConfig()
        fetchPlugs()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    filterPlugs()
  }, [search, countryFilter, serviceFilter, vipFilter, allPlugs])

  const fetchConfig = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const timestamp = new Date().getTime()
      
      let data
      try {
        const directResponse = await fetch(`${apiBaseUrl}/api/public/config?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        
        if (directResponse.ok) {
          data = await directResponse.json()
        } else {
          throw new Error(`Direct config failed: HTTP ${directResponse.status}`)
        }
      } catch (directError) {
        console.log('❌ Config recherche directe échouée:', directError.message)
        
        try {
          const proxyResponse = await fetch(`/api/proxy?endpoint=/api/public/config&t=${new Date().getTime()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          })
          
          if (!proxyResponse.ok) {
            throw new Error(`Config proxy failed: HTTP ${proxyResponse.status}`)
          }
          
          data = await proxyResponse.json()
        } catch (proxyError) {
          console.log('❌ Config recherche proxy échouée:', proxyError.message)
          throw proxyError
        }
      }

      setConfig(data)
    } catch (error) {
      console.log('❌ Erreur chargement config recherche:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchPlugs = async (forceRefresh = false) => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const timestamp = new Date().getTime()
      
      let data
      try {
        const directResponse = await fetch(`${apiBaseUrl}/api/public/plugs?limit=100&t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        
        if (directResponse.ok) {
          data = await directResponse.json()
          console.log('✅ API recherche directe réussie:', data)
        } else {
          throw new Error(`Direct plugs failed: HTTP ${directResponse.status}`)
        }
      } catch (directError) {
        console.log('❌ Plugs recherche directs échoués:', directError.message)
        
        try {
          const proxyResponse = await fetch(`/api/proxy?endpoint=/api/public/plugs&limit=100&t=${new Date().getTime()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          })
          
          if (!proxyResponse.ok) {
            throw new Error(`Plugs proxy failed: HTTP ${proxyResponse.status}`)
          }
          
          data = await proxyResponse.json()
          console.log('✅ Recherche proxy réussi:', data)
        } catch (proxyError) {
          console.log('❌ Plugs recherche proxy échoués:', proxyError.message)
          throw proxyError
        }
      }

      // Traiter la structure de réponse correcte { plugs: [...] }
      let plugsArray = []
      if (data && Array.isArray(data.plugs)) {
        plugsArray = data.plugs
      } else if (Array.isArray(data)) {
        // Fallback si la réponse est directement un tableau
        plugsArray = data
      } else {
        console.error('❌ Structure de données recherche inattendue:', data)
        plugsArray = []
      }

      console.log('🔍 Plugs recherche chargés:', plugsArray.length, 'boutiques')
      setAllPlugs(plugsArray)
    } catch (error) {
      console.error('❌ Erreur chargement plugs recherche:', error)
      setAllPlugs([])
    } finally {
      setLoading(false)
    }
  }

  const filterPlugs = () => {
    let filtered = allPlugs.filter(plug => {
      const matchesSearch = search === '' || 
        plug.name.toLowerCase().includes(search.toLowerCase()) ||
        plug.description.toLowerCase().includes(search.toLowerCase())
      
      const matchesCountry = countryFilter === '' || 
        (plug.countries && plug.countries.some(country => 
          country.toLowerCase().includes(countryFilter.toLowerCase())
        ))
      
      const matchesService = serviceFilter === '' || 
        (serviceFilter === 'delivery' && plug.services?.delivery?.enabled) ||
        (serviceFilter === 'postal' && plug.services?.postal?.enabled) ||
        (serviceFilter === 'meetup' && plug.services?.meetup?.enabled)
      
      const matchesVip = vipFilter === '' || 
        (vipFilter === 'vip' && plug.isVip) ||
        (vipFilter === 'standard' && !plug.isVip)
      
      return matchesSearch && matchesCountry && matchesService && matchesVip
    })

    // Trier par VIP en premier
    filtered = filtered.sort((a, b) => {
      if (a.isVip && !b.isVip) return -1
      if (!a.isVip && b.isVip) return 1
      return 0
    })

    setPlugs(filtered)
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setSearch('')
    setCountryFilter('')
    setServiceFilter('')
    setVipFilter('')
  }

  const uniqueCountries = [...new Set(allPlugs.flatMap(plug => plug.countries || []))].sort()

  const currentPlugs = plugs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (initialLoading) {
    return (
      <>
        <Head>
          <title>Chargement...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p style={{ color: 'white' }} className="font-medium">Chargement de la recherche...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Recherche - {config?.boutique?.name || 'Boutique'}</title>
        <meta name="description" content="Recherchez vos boutiques préférées par nom, pays ou service." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div 
        className="min-h-screen"
        style={{
          backgroundColor: '#000000',
          backgroundImage: config?.boutique?.backgroundImage ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("${config.boutique.backgroundImage}")` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          color: 'white'
        }}
      >
        {/* Header */}
        {config && (
          <header className="bg-black shadow-lg border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center h-20">
                <div className="text-center">
                  <h1 className="text-responsive-title font-bold text-white text-shadow-3d">
                    🔍 {config?.boutique?.name || 'Recherche'}
                  </h1>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Navigation */}
        {config && (
          <nav className="bg-black shadow-sm border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-center space-x-8 h-12 items-center">
                <Link 
                  href="/shop" 
                  style={{ color: 'white' }}
                  className="pb-3 flex items-center hover:opacity-75 transition-opacity"
                >
                  <span className="mr-1">🏠</span>
                  <span style={{ color: 'white' }}>Accueil</span>
                </Link>
                <Link 
                  href="/shop/search" 
                  style={{ color: 'white' }}
                  className="font-medium pb-3 flex items-center hover:opacity-75 transition-opacity"
                >
                  <span className="mr-1">🔍</span>
                  <span style={{ color: 'white' }}>Recherche</span>
                </Link>
                <Link 
                  href="/shop/vip" 
                  style={{ color: 'white' }}
                  className="pb-3 flex items-center hover:opacity-75 transition-opacity"
                >
                  <span className="mr-1">👑</span>
                  <span style={{ color: 'white' }}>VIP</span>
                </Link>
              </div>
            </div>
          </nav>
        )}

        {/* Section de recherche */}
        {config && (
          <div className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <h2 style={{ color: 'white' }} className="text-3xl font-bold">
                    🔍 Recherche dans {config?.boutique?.name || 'la boutique'}
                  </h2>
                </div>
              </div>
              
              {/* Filtres de recherche */}
              <div className="bg-black border border-gray-600 rounded-xl shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Recherche textuelle */}
                  <div>
                    <label style={{ color: 'white' }} className="block text-sm font-medium mb-2">
                      Rechercher
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon style={{ color: 'white' }} className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                        style={{ color: 'white' }}
                        placeholder="Rechercher une boutique..."
                      />
                    </div>
                  </div>

                  {/* Filtre par pays */}
                  <div>
                    <label style={{ color: 'white' }} className="block text-sm font-medium mb-2">
                      Pays
                    </label>
                    <select
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                      style={{ color: 'white' }}
                    >
                      <option value="">Tous les pays</option>
                      {uniqueCountries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtre par service */}
                  <div>
                    <label style={{ color: 'white' }} className="block text-sm font-medium mb-2">
                      Service
                    </label>
                    <select
                      value={serviceFilter}
                      onChange={(e) => setServiceFilter(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                      style={{ color: 'white' }}
                    >
                      <option value="">Tous les services</option>
                      <option value="delivery">Livraison</option>
                      <option value="postal">Postal</option>
                      <option value="meetup">Meetup</option>
                    </select>
                  </div>

                  {/* Filtre VIP */}
                  <div>
                    <label style={{ color: 'white' }} className="block text-sm font-medium mb-2">
                      Type
                    </label>
                    <select
                      value={vipFilter}
                      onChange={(e) => setVipFilter(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                      style={{ color: 'white' }}
                    >
                      <option value="">Tous</option>
                      <option value="vip">VIP uniquement</option>
                      <option value="standard">Standard uniquement</option>
                    </select>
                  </div>
                </div>

                {/* Bouton reset */}
                <div className="mt-4 text-center">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                    style={{ color: 'white' }}
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Résultats */}
        <main className="pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Titre des résultats */}
            <div className="text-center mb-8">
              <h3 style={{ color: 'white' }} className="text-2xl font-bold mb-2">
                📋 Résultats de recherche
              </h3>
              <p style={{ color: 'white' }}>
                {loading ? 'Recherche en cours...' : `${plugs.length} boutique(s) trouvée(s)`}
              </p>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p style={{ color: 'white' }}>Recherche en cours...</p>
              </div>
            ) : plugs.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-white mb-4 flex items-center justify-center">
                  <MagnifyingGlassIcon className="h-8 w-8" />
                </div>
                <h3 style={{ color: 'white' }} className="text-xl font-medium mb-2">Aucune boutique trouvée</h3>
                <p style={{ color: 'white' }} className="mb-6">Essayez de modifier vos critères de recherche.</p>
              </div>
            ) : (
              <>
                {/* Products Grid - 2 boutiques par ligne même sur mobile */}
                                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-8 px-2 sm:px-0">
                  {currentPlugs.map((plug, index) => (
                    <Link 
                      key={plug._id || index} 
                      href={`/shop/${plug._id}`} 
                      className="block group hover:scale-105 transition-transform duration-200"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div className="shop-card bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 w-full max-w-none">
                        {/* Image */}
                        <div className="relative h-32 sm:h-40 md:h-48 bg-gray-900">
                          {plug.image ? (
                            <ImageWithFallback
                              src={plug.image}
                              alt={plug.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageWithFallback
                              fallbackIcon={GlobeAltIcon}
                              className="w-full h-full object-cover"
                            />
                          )}
                          
                          {/* VIP Badge */}
                          {plug.isVip && (
                            <div className="absolute top-2 right-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-500" style={{ color: 'white' }}>
                                <StarIcon className="w-3 h-3 mr-1" />
                                VIP
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-2 sm:p-3 md:p-4">
                          <h3 style={{ color: 'white' }} className="text-sm sm:text-base font-bold mb-2 truncate">{plug.name}</h3>
                          <p style={{ color: '#e5e7eb' }} className="mb-3 text-xs sm:text-sm line-clamp-2 h-8">{plug.description}</p>

                          {/* Location */}
                          {plug.countries && plug.countries.length > 0 && (
                            <div className="flex items-center text-xs sm:text-sm mb-2" style={{ color: 'white' }}>
                              <MapPinIcon className="w-3 h-3 mr-1" />
                              <span className="truncate">{plug.countries.join(', ')}</span>
                            </div>
                          )}

                          {/* Services */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {plug.services?.delivery?.enabled && (
                              <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full flex items-center">
                                <TruckIcon className="w-3 h-3 mr-1" />
                                Livraison
                              </span>
                            )}
                            {plug.services?.postal?.enabled && (
                              <span className="px-2 py-1 bg-gray-800 text-white text-xs rounded-full border border-gray-600">
                                📮 Postal
                              </span>
                            )}
                            {plug.services?.meetup?.enabled && (
                              <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full flex items-center">
                                <HomeIcon className="w-3 h-3 mr-1" />
                                Meetup
                              </span>
                            )}
                          </div>

                          {/* Likes */}
                          <div className="flex items-center text-xs sm:text-sm font-medium" style={{ color: 'white' }}>
                            <span className="mr-1">❤️</span>
                            <span>{plug.likes || 0} like{(plug.likes || 0) !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {plugs.length > itemsPerPage && (
                  <div className="flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={plugs.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  )
}