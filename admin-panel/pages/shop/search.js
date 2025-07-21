import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { api } from '../../lib/api'
import { getProxiedImageUrl } from '../../lib/imageUtils'
import toast from 'react-hot-toast'
import Pagination from '../../components/Pagination'
import {
  StarIcon,
  MapPinIcon,
  TruckIcon,
  GlobeAltIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

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
  const itemsPerPage = 20

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
    
    // Écouter les changements du localStorage entre onglets
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await api.get('/config/public')
      if (response?.data) {
        setConfig(response.data)
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement de la configuration:', error)
    }
  }

  const fetchPlugs = async () => {
    try {
      console.log('🔄 Chargement des plugs pour la recherche...')
      setLoading(true)
      
      const response = await api.get('/plugs/public')
      console.log('📡 Réponse API plugs:', response)
      
      if (response?.data) {
        let plugsArray = []
        
        if (Array.isArray(response.data)) {
          plugsArray = response.data
        } else if (response.data.plugs && Array.isArray(response.data.plugs)) {
          plugsArray = response.data.plugs
        } else if (typeof response.data === 'object') {
          plugsArray = Object.values(response.data).filter(item => item && typeof item === 'object')
        }
        
        // Filtrer pour ne garder que les plugs valides et actifs
        const validPlugs = plugsArray
          .filter(plug => {
            return plug && 
                   typeof plug === 'object' && 
                   plug._id && 
                   plug.name && 
                   plug.status !== 'inactive' &&
                   plug.status !== 'suspended'
          })
          .sort((a, b) => {
            // Trier par: VIP d'abord, puis par likes décroissants, puis par nom
            if (a.isVip && !b.isVip) return -1
            if (!a.isVip && b.isVip) return 1
            
            const likesA = a.likes || 0
            const likesB = b.likes || 0
            if (likesB !== likesA) return likesB - likesA
            
            return (a.name || '').localeCompare(b.name || '')
          })
        
        console.log('🔍 Plugs recherche chargés:', plugsArray.length, 'boutiques')
        console.log('✅ Plugs valides filtrés:', validPlugs.length)
        
        setAllPlugs(validPlugs)
        setPlugs(validPlugs)
      } else {
        console.warn('⚠️ Aucune donnée reçue de l\'API')
        setAllPlugs([])
        setPlugs([])
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des plugs:', error)
      toast.error('Erreur lors du chargement des boutiques')
      setAllPlugs([])
      setPlugs([])
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }

  // Filtrage des plugs
  useEffect(() => {
    let filtered = [...allPlugs]
    
    // Filtre par recherche textuelle
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim()
      filtered = filtered.filter(plug => 
        (plug.name || '').toLowerCase().includes(searchLower) ||
        (plug.description || '').toLowerCase().includes(searchLower) ||
        (plug.countries || []).some(country => country.toLowerCase().includes(searchLower))
      )
    }
    
    // Filtre par pays
    if (countryFilter) {
      filtered = filtered.filter(plug => 
        plug.countries && plug.countries.includes(countryFilter)
      )
    }
    
    // Filtre par service
    if (serviceFilter) {
      filtered = filtered.filter(plug => {
        if (!plug.services) return false
        return plug.services[serviceFilter]?.enabled === true
      })
    }
    
    // Filtre VIP
    if (vipFilter) {
      if (vipFilter === 'vip') {
        filtered = filtered.filter(plug => plug.isVip === true)
      } else if (vipFilter === 'standard') {
        filtered = filtered.filter(plug => !plug.isVip)
      }
    }
    
    setPlugs(filtered)
    setCurrentPage(1) // Reset à la première page lors du filtrage
  }, [allPlugs, search, countryFilter, serviceFilter, vipFilter])

  // Récupérer la liste unique des pays
  const uniqueCountries = [...new Set(
    allPlugs.flatMap(plug => plug.countries || [])
  )].sort()

  // Pagination
  const indexOfLastPlug = currentPage * itemsPerPage
  const indexOfFirstPlug = indexOfLastPlug - itemsPerPage
  const currentPlugs = plugs.slice(indexOfFirstPlug, indexOfLastPlug)

  const resetFilters = () => {
    setSearch('')
    setCountryFilter('')
    setServiceFilter('')
    setVipFilter('')
    setCurrentPage(1)
  }

  const getServiceIcon = (serviceType) => {
    switch(serviceType) {
      case 'delivery': return '🚚'
      case 'postal': return '📮'
      case 'meetup': return '📍'
      default: return '🔹'
    }
  }

  const getServiceName = (serviceType) => {
    switch(serviceType) {
      case 'delivery': return 'Livraison'
      case 'postal': return 'Postal'
      case 'meetup': return 'Meet up'
      default: return serviceType
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{config?.boutique?.searchTitle || '🔍 Rechercher'} | {config?.boutique?.name || 'PlugsFinder Bot'}</title>
        <meta name="description" content={config?.boutique?.searchSubtitle || 'Trouvez ce que vous cherchez'} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <div 
        className="min-h-screen bg-black"
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
          color: 'white'
        }}
      >
        {/* Header fixe */}
        <header className="bg-gray-900 sticky top-0 z-50 shadow-lg border-b border-gray-700">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🔍</span>
                <div>
                  <h1 className="text-lg font-bold text-white">
                    {config?.boutique?.searchTitle || 'Rechercher'}
                  </h1>
                  <p className="text-xs text-gray-400">
                    {config?.boutique?.name || 'mini-application'}
                  </p>
                </div>
              </div>
              <button className="p-2 text-gray-400">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="1"/>
                  <circle cx="12" cy="12" r="1"/>
                  <circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Section Filtres */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <span className="mr-2">🔄</span>
              Filtres
            </h2>
          </div>
          
          <div className="space-y-3">
            {/* Filtre Pays */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                <span className="mr-1">🌍</span>
                Pays
              </label>
              <div className="relative">
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les pays</option>
                  {uniqueCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Filtre Services */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Services
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setServiceFilter('')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    serviceFilter === '' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setServiceFilter('meetup')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                    serviceFilter === 'meetup' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <span>📍</span>
                  <span>Meet up</span>
                </button>
                <button
                  onClick={() => setServiceFilter('delivery')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                    serviceFilter === 'delivery' 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <span>🚚</span>
                  <span>Livraison</span>
                </button>
                <button
                  onClick={() => setServiceFilter('postal')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                    serviceFilter === 'postal' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <span>📮</span>
                  <span>Postal</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des boutiques */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Recherche en cours...</p>
            </div>
          ) : plugs.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-white mb-4 flex items-center justify-center">
                <MagnifyingGlassIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-white">Aucune boutique trouvée</h3>
              <p className="text-gray-400 mb-6">Essayez de modifier vos critères de recherche.</p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {currentPlugs.map((plug, index) => {
                // Déterminer les services disponibles
                const availableServices = []
                if (plug.services?.postal?.enabled) availableServices.push('postal')
                if (plug.services?.meetup?.enabled) availableServices.push('meetup')
                if (plug.services?.delivery?.enabled) availableServices.push('delivery')

                return (
                  <Link 
                    key={plug._id || index} 
                    href={`/shop/${plug._id}`}
                    className="block"
                  >
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:bg-gray-750 transition-colors">
                      <div className="flex items-center space-x-3">
                        {/* Logo/Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                          {plug.image && plug.image.trim() !== '' ? (
                            <img
                              src={getProxiedImageUrl(plug.image)}
                              alt={plug.name || 'Boutique'}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-700">
                              <GlobeAltIcon className="w-8 h-8 text-gray-500" />
                            </div>
                          )}
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          {/* Nom et pays */}
                          <div className="flex items-center space-x-2 mb-1">
                            {plug.countries && plug.countries.length > 0 && (
                              <span className="text-sm">🇫🇷</span>
                            )}
                            <h3 className="font-bold text-white text-lg truncate">
                              {plug.name}
                            </h3>
                          </div>

                          {/* Services */}
                          <div className="flex items-center space-x-2 mb-2">
                            {availableServices.map((service, idx) => (
                              <span key={idx} className="text-lg">
                                {getServiceIcon(service)}
                              </span>
                            ))}
                          </div>

                          {/* Likes */}
                          <div className="flex items-center justify-end">
                            <div className="flex items-center space-x-1 bg-gray-700 px-2 py-1 rounded-full">
                              <span className="text-sm">👍</span>
                              <span className="text-white text-sm font-medium">
                                {plug.likes || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {plugs.length > itemsPerPage && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalItems={plugs.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* Navigation Bottom */}
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700">
          <div className="flex justify-around py-2">
            <Link href="/shop" className="flex flex-col items-center py-2 text-gray-400">
              <span className="text-xl mb-1">🏠</span>
              <span className="text-xs">Plugs</span>
            </Link>
            <div className="flex flex-col items-center py-2 text-blue-500">
              <span className="text-xl mb-1">🔍</span>
              <span className="text-xs">Rechercher</span>
            </div>
            <Link href="/shop/vip" className="flex flex-col items-center py-2 text-gray-400">
              <span className="text-xl mb-1">🎁</span>
              <span className="text-xs">Giveaway</span>
            </Link>
          </div>
        </nav>

        {/* Espace pour la navigation bottom */}
        <div className="h-16"></div>
      </div>
    </>
  )
}