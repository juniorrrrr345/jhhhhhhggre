import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'
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

  useEffect(() => {
    fetchConfig()
    fetchPlugs()
    
    const interval = setInterval(() => {
      fetchConfig()
      fetchPlugs()
    }, 30000)
    
    const handleStorageChange = (event) => {
      if (event?.key === 'boutique_sync_signal') {
        fetchConfig()
        fetchPlugs()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const fetchConfig = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
      const response = await fetch(`${apiBaseUrl}/api/public/config?t=${Date.now()}`, {
        cache: 'no-cache'
      })
      
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Error loading config:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchPlugs = async () => {
    try {
      setLoading(true)
      
      // Essayer d'abord l'API directe
      let data
      try {
        const timestamp = new Date().getTime()
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
        const url = `${apiBaseUrl}/api/public/plugs?filter=active&limit=100&t=${timestamp}`
        
        console.log('🔍 Tentative directe:', url)
        const response = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        if (response.ok) {
          data = await response.json()
          console.log('✅ API directe réussie:', data)
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (directError) {
        console.log('❌ API directe échouée:', directError.message)
        console.log('🔄 Tentative via proxy...')
        
        // Fallback vers le proxy
        const proxyUrl = `/api/proxy?endpoint=/api/public/plugs&filter=active&limit=100&t=${new Date().getTime()}`
        const proxyResponse = await fetch(proxyUrl, {
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        if (proxyResponse.ok) {
          data = await proxyResponse.json()
          console.log('✅ Proxy réussi:', data)
        } else {
          throw new Error(`Proxy failed: HTTP ${proxyResponse.status}`)
        }
      }
      
      if (data && Array.isArray(data.plugs)) {
        // Trier par VIP en premier
        const sortedPlugs = data.plugs.sort((a, b) => {
          if (a.isVip && !b.isVip) return -1
          if (!a.isVip && b.isVip) return 1
          return 0
        })
        
        console.log('✅ Plugs loaded:', sortedPlugs.length, 'boutiques')
        console.log('🏪 Boutiques:', sortedPlugs.map(p => ({ name: p.name, isVip: p.isVip })))
        setPlugs(sortedPlugs)
      } else {
        console.error('❌ Invalid data structure:', data)
        setPlugs([])
      }
      
    } catch (error) {
      console.error('💥 Fetch error final:', error)
      setPlugs([])
    } finally {
      setLoading(false)
    }
  }

  // Afficher le chargement initial jusqu'à ce que la config soit chargée
  if (initialLoading) {
    return (
      <>
        <Head>
          <title>Chargement...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div 
          className="min-h-screen bg-black flex items-center justify-center"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white font-medium">Chargement de la boutique...</p>
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
        className="min-h-screen bg-black"
        style={config?.boutique?.backgroundImage ? {
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${config.boutique.backgroundImage})`,
          backgroundSize: '300px 300px', // Taille fixe pour répétition
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat', // Répéter le background
          backgroundAttachment: 'fixed'
        } : {}}
      >
        {/* Header */}
        {config && (
          <header className="bg-gray-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center h-16">
                <div className="text-center">
                  <h1 className="text-xl font-bold text-white">
                    🏪 {config?.boutique?.name || 'Boutique'}
                  </h1>
                  {config?.boutique?.subtitle && (
                    <p className="text-gray-300 text-sm">
                      {config.boutique.subtitle}
                    </p>
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
                  className="text-white font-medium border-b-2 border-white pb-3 flex items-center"
                >
                  <span className="mr-1">🏠</span>
                  Accueil
                </Link>
                <Link 
                  href="/shop/search" 
                  className="text-gray-300 hover:text-white pb-3 flex items-center"
                >
                  <span className="mr-1">🔍</span>
                  Recherche
                </Link>
                <Link 
                  href="/shop/vip" 
                  className="text-gray-300 hover:text-white pb-3 flex items-center"
                >
                  <span className="mr-1">👑</span>
                  VIP
                </Link>
              </div>
            </div>
          </nav>
        )}

        {/* Toutes les boutiques */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                      <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <h3 className="text-3xl font-bold text-white">
                  🏪 {config?.boutique?.name || 'Boutique'}
                </h3>
              </div>
              {config?.boutique?.subtitle && (
                <p className="text-gray-300 max-w-2xl mx-auto">
                  {config.boutique.subtitle}
                </p>
              )}
            </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-gray-300">Chargement des produits...</p>
            </div>
          ) : plugs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏪</div>
              <h3 className="text-xl font-medium text-white mb-2">Aucun produit disponible</h3>
              <p className="text-gray-300">Revenez plus tard pour découvrir nos produits.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {plugs.map((plug, index) => (
                <Link key={plug._id} href={`/shop/${plug._id}`}>
                  <div className="bg-black border border-gray-600 rounded-lg overflow-hidden hover:border-gray-400 transition-colors duration-300 cursor-pointer">
                    {/* Image */}
                    <div className="relative h-32 sm:h-40">
                      <img
                        src={plug.image || '/placeholder.jpg'}
                        alt={plug.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
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
                      <h3 className="text-sm sm:text-base font-bold text-white mb-2 truncate">{plug.name}</h3>
                      <p className="text-gray-300 mb-3 text-xs sm:text-sm line-clamp-2 h-8">{plug.description}</p>

                      {/* Localisation */}
                      {plug.countries && plug.countries.length > 0 && (
                        <div className="flex items-center text-xs sm:text-sm text-gray-400 mb-2">
                          <MapPinIcon className="w-3 h-3 mr-1" />
                          <span className="truncate">{plug.countries.join(', ')}</span>
                        </div>
                      )}

                      {/* Services */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {plug.services?.delivery?.enabled && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-white">
                            <TruckIcon className="w-2.5 h-2.5 mr-1" />
                            Livraison
                          </span>
                        )}
                        {plug.services?.postal?.enabled && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-white">
                            <GlobeAltIcon className="w-2.5 h-2.5 mr-1" />
                            Postal
                          </span>
                        )}
                        {plug.services?.meetup?.enabled && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-white">
                            <HomeIcon className="w-2.5 h-2.5 mr-1" />
                            Meetup
                          </span>
                        )}
                      </div>

                      {/* Likes */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                        <span className="text-gray-300 text-xs sm:text-sm">Voir détails</span>
                        <div className="flex items-center text-red-400 text-xs sm:text-sm font-medium">
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
      </div>
    </>
  )
}