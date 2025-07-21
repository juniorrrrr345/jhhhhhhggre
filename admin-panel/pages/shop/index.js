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
          fetchPlugs(true) // Forcer le rafraîchissement
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
      fetchPlugs(true) // Forcer le rafraîchissement au focus
    }

    // Écouteur pour détecter les changements de données en temps réel
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page visible - vérification des mises à jour')
        fetchConfig()
        fetchPlugs(true) // Forcer le rafraîchissement quand la page redevient visible
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

  const fetchPlugs = async (forceRefresh = false) => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const timestamp = new Date().getTime()
      
      // Si c'est un rafraîchissement forcé, ajouter plus de paramètres anti-cache
      const cacheParams = forceRefresh ? `&refresh=${timestamp}&bust=${Math.random()}` : `&t=${timestamp}`
      
      let data
      try {
        const directResponse = await fetch(`${apiBaseUrl}/api/public/plugs?limit=50${cacheParams}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            ...(forceRefresh && { 'X-Force-Refresh': 'true' })
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
          const proxyResponse = await fetch(`/api/proxy?endpoint=/api/public/plugs&limit=50${cacheParams}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              ...(forceRefresh && { 'X-Force-Refresh': 'true' })
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

      // Nettoyer les données pour éviter les cartes corrompues
      const cleanedPlugs = plugsArray.filter(plug => {
        // Vérifier que les propriétés essentielles existent
        if (!plug || !plug._id || !plug.name) {
          console.warn('🚮 Plug invalide filtré:', plug)
          return false
        }
        
        // Nettoyer l'URL d'image si elle existe
        if (plug.image && typeof plug.image === 'string') {
          plug.image = plug.image.trim()
          // Si l'URL est vide après trim, la supprimer
          if (plug.image === '') {
            delete plug.image
          }
        }
        
        return true
      })

      const sortedPlugs = cleanedPlugs.sort((a, b) => {
        if (a.isVip && !b.isVip) return -1
        if (!a.isVip && b.isVip) return 1
        return 0
      })

      console.log('🔌 Plugs chargés:', sortedPlugs.length, 'boutiques (', plugsArray.length - cleanedPlugs.length, 'filtrés)')
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
          <meta name="viewport" content="width=device-width, initial-scale=1" />
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
                    🔌 {config?.boutique?.name || 'Boutique'}
                  </h1>
                  {config?.boutique?.subtitle && (
                    <p style={{ color: 'white' }} className="text-sm mt-1 text-gray-300">{config.boutique.subtitle}</p>
                  )}
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
                  className="font-medium pb-3 flex items-center hover:opacity-75 transition-opacity"
                >
                  <span className="mr-1">🏠</span>
                  <span style={{ color: 'white' }}>Accueil</span>
                </Link>
                <Link 
                  href="/shop/search" 
                  style={{ color: 'white' }}
                  className="pb-3 flex items-center hover:opacity-75 transition-opacity"
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

        {/* Main Content */}
        <main className="py-6 sm:py-8 lg:py-12">
          <div className="max-w-7xl mx-auto responsive-container">
            {/* Hero Section */}
            {config && (
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-4">
                  <h2 style={{ color: 'white' }} className="text-3xl font-bold">
                    🔌 {config?.boutique?.name || 'Boutique Premium'}
                  </h2>
                </div>
                <p style={{ color: 'white' }} className="max-w-2xl mx-auto">
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
                {/* Products Grid - Responsive */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 px-2 sm:px-0">
                  {currentPlugs.map((plug, index) => (
                    <Link 
                      key={plug._id || index} 
                      href={`/shop/${plug._id}`} 
                      className="block group hover:scale-105 transition-transform duration-200"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div className="shop-card bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 w-full h-full flex flex-col">
                        {/* Image */}
                        <div className="relative h-32 sm:h-36 md:h-40 lg:h-48 bg-gray-900 flex-shrink-0">
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
                        <div className="p-3 sm:p-4 flex-1 flex flex-col">
                          <h3 style={{ color: 'white' }} className="text-sm sm:text-base font-bold mb-2 line-clamp-1">{plug.name}</h3>
                          <p style={{ color: '#e5e7eb' }} className="mb-3 text-xs sm:text-sm line-clamp-2 flex-1">{plug.description}</p>

                          {/* Location */}
                          {plug.countries && plug.countries.length > 0 && (
                            <div className="flex items-center text-xs mb-2" style={{ color: 'white' }}>
                              <MapPinIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{plug.countries.slice(0, 2).join(', ')}{plug.countries.length > 2 ? '...' : ''}</span>
                            </div>
                          )}

                          {/* Services */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {plug.services?.delivery?.enabled && (
                              <span className="px-1.5 py-0.5 bg-green-600 text-white text-xs rounded flex items-center">
                                🚚
                              </span>
                            )}
                            {plug.services?.postal?.enabled && (
                              <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded">
                                ✈️
                              </span>
                            )}
                            {plug.services?.meetup?.enabled && (
                              <span className="px-1.5 py-0.5 bg-purple-600 text-white text-xs rounded">
                                🏠
                              </span>
                            )}
                          </div>

                          {/* Likes */}
                          <div className="flex items-center text-xs font-medium mt-auto" style={{ color: 'white' }}>
                            <span className="mr-1">❤️</span>
                            <span>{plug.likes || 0}</span>
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