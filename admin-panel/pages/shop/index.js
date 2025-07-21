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

export default function ShopHome() {
  const [plugs, setPlugs] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
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
      console.log('👁️ Fenêtre focus - rafraîchissement des données')
      fetchConfig()
      fetchPlugs()
    }

    // Écouteur pour détecter les changements de données en temps réel
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page visible - vérification des mises à jour')
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
        console.log('❌ Config directe échouée:', directError.message)
        
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
          console.log('❌ Config proxy échouée:', proxyError.message)
          throw proxyError
        }
      }

      setConfig(data)
    } catch (error) {
      console.error('❌ Erreur chargement config:', error)
      toast.error('Erreur de connexion')
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchPlugs = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const timestamp = new Date().getTime()
      
      let data
      try {
        const directResponse = await fetch(`${apiBaseUrl}/api/public/plugs?limit=50&t=${timestamp}`, {
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
          console.log('✅ API directe réussie:', data)
        } else {
          throw new Error(`Direct plugs failed: HTTP ${directResponse.status}`)
        }
      } catch (directError) {
        console.log('❌ Plugs directs échoués:', directError.message)
        
        try {
          const proxyResponse = await fetch(`/api/proxy?endpoint=/api/public/plugs&limit=50&t=${new Date().getTime()}`, {
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
          console.log('✅ Proxy réussi:', data)
        } catch (proxyError) {
          console.log('❌ Plugs proxy échoués:', proxyError.message)
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
        console.error('❌ Structure de données inattendue:', data)
        plugsArray = []
      }

      const sortedPlugs = plugsArray.sort((a, b) => {
        if (a.isVip && !b.isVip) return -1
        if (!a.isVip && b.isVip) return 1
        return 0
      })

      console.log('🔌 Plugs chargés:', sortedPlugs.length, 'boutiques')
      setPlugs(sortedPlugs)
    } catch (error) {
      console.error('❌ Erreur chargement plugs:', error)
      setPlugs([])
    } finally {
      setLoading(false)
    }
  }

  const currentPlugs = plugs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (initialLoading) {
    return (
      <>
        <Head>
          <title>Chargement...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p style={{ color: 'white' }} className="font-medium">Chargement de la boutique...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{config?.boutique?.name || 'Boutique'}</title>
        <meta name="description" content="Découvrez notre sélection de produits premium avec livraison, envoi postal et meetup disponibles." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
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
          <header className="bg-gray-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
              <div className="flex items-center justify-center h-14 sm:h-16">
                <div className="text-center">
                  <h1 style={{ color: 'white' }} className="text-lg sm:text-xl font-bold">
                    🔌 {config?.boutique?.name || 'Boutique'}
                  </h1>
                  {config?.boutique?.subtitle && (
                    <p style={{ color: 'white' }} className="text-xs sm:text-sm">{config.boutique.subtitle}</p>
                  )}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Navigation */}
        {config && (
          <nav className="bg-black shadow-sm border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
              <div className="flex justify-center space-x-4 sm:space-x-8 h-10 sm:h-12 items-center">
                <Link 
                  href="/shop" 
                  style={{ color: 'white' }}
                  className="font-medium pb-2 sm:pb-3 flex items-center hover:opacity-75 transition-opacity"
                >
                  <span className="mr-1 text-sm sm:text-base">🏠</span>
                  <span style={{ color: 'white' }} className="text-xs sm:text-sm">Accueil</span>
                </Link>
                <Link 
                  href="/shop/search" 
                  style={{ color: 'white' }}
                  className="pb-2 sm:pb-3 flex items-center hover:opacity-75 transition-opacity"
                >
                  <span className="mr-1 text-sm sm:text-base">🔍</span>
                  <span style={{ color: 'white' }} className="text-xs sm:text-sm">Recherche</span>
                </Link>
                <Link 
                  href="/shop/vip" 
                  style={{ color: 'white' }}
                  className="pb-2 sm:pb-3 flex items-center hover:opacity-75 transition-opacity"
                >
                  <span className="mr-1 text-sm sm:text-base">👑</span>
                  <span style={{ color: 'white' }} className="text-xs sm:text-sm">VIP</span>
                </Link>
              </div>
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className="py-6 sm:py-12">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            {/* Hero Section */}
            {config && (
              <div className="text-center mb-6 sm:mb-12">
                <div className="flex items-center justify-center mb-2 sm:mb-4">
                  <h2 style={{ color: 'white' }} className="text-xl sm:text-3xl font-bold">
                    🔌 {config?.boutique?.name || 'Boutique Premium'}
                  </h2>
                </div>
                <p style={{ color: 'white' }} className="max-w-2xl mx-auto text-sm sm:text-base">
                  {loading ? 'Chargement...' : `${plugs.length} produit(s) disponible(s)`}
                </p>
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p style={{ color: 'white' }}>Chargement des produits...</p>
              </div>
            ) : plugs.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-white mb-4 flex items-center justify-center">
                  <GlobeAltIcon className="h-8 w-8" />
                </div>
                <h3 style={{ color: 'white' }} className="text-xl font-medium mb-2">Aucun produit disponible</h3>
                <p style={{ color: 'white' }}>Revenez plus tard pour découvrir nos produits.</p>
              </div>
            ) : (
              <>
                {/* Products Grid - 2 colonnes adaptatif pour tous appareils */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-8">
                  {currentPlugs.map((plug, index) => (
                    <Link 
                      key={plug._id || index} 
                      href={`/shop/${plug._id}`} 
                      className="block group hover:scale-105 transition-transform duration-200"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div className="shop-card bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 w-full">
                        {/* Image simplifiée - comme dans le bot */}
                        <div className="relative h-32 sm:h-40 md:h-48 bg-gray-900 overflow-hidden">
                          {plug.image && plug.image.trim() !== '' ? (
                            <img
                              src={plug.image}
                              alt={plug.name || 'Boutique'}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                              <div className="text-center">
                                <GlobeAltIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-1" />
                                <p className="text-gray-500 text-xs">Aucune image</p>
                              </div>
                            </div>
                          )}
                          
                          {/* VIP Badge */}
                          {plug.isVip && (
                            <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                              <span className="inline-flex items-center px-1 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-bold bg-yellow-500" style={{ color: 'white' }}>
                                <StarIcon className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                <span className="hidden sm:inline">VIP</span>
                                <span className="sm:hidden text-xs">V</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content adaptatif */}
                        <div className="p-2 sm:p-3 md:p-4">
                          <h3 style={{ color: 'white' }} className="text-xs sm:text-sm md:text-base font-bold mb-1 sm:mb-2 line-clamp-1">{plug.name}</h3>
                          <p style={{ color: '#e5e7eb' }} className="mb-2 sm:mb-3 text-xs sm:text-sm line-clamp-2 min-h-[24px] sm:min-h-[32px] md:min-h-[36px]">{plug.description}</p>

                          {/* Location */}
                          {plug.countries && plug.countries.length > 0 && (
                            <div className="flex items-center text-xs mb-1 sm:mb-2" style={{ color: 'white' }}>
                              <MapPinIcon className="w-2 h-2 sm:w-3 sm:h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{plug.countries.join(', ')}</span>
                            </div>
                          )}

                          {/* Services - Adaptés mobile */}
                          <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                            {plug.services?.delivery?.enabled && (
                              <span className="px-1 py-0.5 sm:px-2 sm:py-1 bg-green-600 text-white text-xs rounded-full flex items-center">
                                <TruckIcon className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                <span className="hidden sm:inline">Livraison</span>
                                <span className="sm:hidden">L</span>
                              </span>
                            )}
                            {plug.services?.postal?.enabled && (
                              <span className="px-1 py-0.5 sm:px-2 sm:py-1 bg-gray-800 text-white text-xs rounded-full border border-gray-600 flex items-center">
                                <span className="text-xs">📮</span>
                                <span className="hidden sm:inline ml-1">Postal</span>
                              </span>
                            )}
                            {plug.services?.meetup?.enabled && (
                              <span className="px-1 py-0.5 sm:px-2 sm:py-1 bg-purple-600 text-white text-xs rounded-full flex items-center">
                                <HomeIcon className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                <span className="hidden sm:inline">Meetup</span>
                                <span className="sm:hidden">M</span>
                              </span>
                            )}
                          </div>

                          {/* Likes */}
                          <div className="flex items-center text-xs font-medium" style={{ color: 'white' }}>
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