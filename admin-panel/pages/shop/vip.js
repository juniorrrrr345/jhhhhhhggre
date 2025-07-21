import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import {
  StarIcon,
  MapPinIcon,
  TruckIcon,
  GlobeAltIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

export default function ShopVIP() {
  const [vipPlugs, setVipPlugs] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    fetchConfig()
    fetchVipPlugs()
    
    const interval = setInterval(() => {
      fetchConfig()
      fetchVipPlugs()
    }, 30000)
    
    const handleStorageChange = (event) => {
      if (event?.key === 'boutique_sync_signal') {
        fetchConfig()
        fetchVipPlugs()
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
      const timestamp = new Date().getTime()
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
      
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
          setConfig(data)
          return
        }
      } catch (directError) {
        console.log('❌ Config VIP directe échouée:', directError.message)
      }
      
      try {
        const response = await fetch(`/api/proxy?endpoint=/api/public/config&t=${timestamp}`, {
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        if (response.ok) {
          const data = await response.json()
          setConfig(data)
        }
      } catch (proxyError) {
        console.log('❌ Config VIP proxy échouée:', proxyError.message)
      }
      
    } catch (error) {
      console.log('❌ Erreur chargement config VIP:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchVipPlugs = async () => {
    try {
      setLoading(true)
      
      let data
      try {
        const timestamp = new Date().getTime()
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
        const url = `${apiBaseUrl}/api/public/plugs?filter=vip&limit=50&t=${timestamp}`
        
        const response = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        if (response.ok) {
          data = await response.json()
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (directError) {
        const proxyUrl = `/api/proxy?endpoint=/api/public/plugs&filter=vip&limit=50&t=${new Date().getTime()}`
        const proxyResponse = await fetch(proxyUrl, {
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        if (proxyResponse.ok) {
          data = await proxyResponse.json()
        } else {
          throw new Error(`VIP proxy failed: HTTP ${proxyResponse.status}`)
        }
      }
      
      if (data && Array.isArray(data.plugs)) {
        const sortedPlugs = data.plugs.sort((a, b) => (b.likes || 0) - (a.likes || 0))
        setVipPlugs(sortedPlugs)
      } else {
        setVipPlugs([])
      }
     } catch (error) {
      console.error('💥 VIP fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-white font-medium">Chargement de la boutique VIP...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{config?.boutique?.vipTitle || config?.boutique?.name || 'VIP'}</title>
        <meta name="description" content="Découvrez notre sélection exclusive de boutiques VIP premium avec services garantis." />
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
                    👑 {config?.boutique?.name || 'Boutique VIP'}
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
                  className="text-gray-300 hover:text-white pb-3 flex items-center"
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
                  className="text-yellow-400 font-medium border-b-2 border-yellow-400 pb-3 flex items-center"
                >
                  <span className="mr-1">👑</span>
                  VIP
                </Link>
              </div>
            </div>
          </nav>
        )}

        {/* Boutiques VIP */}
        {config && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <h3 className="text-3xl font-bold text-white">
                  👑 VIP - {config?.boutique?.name || 'Boutique Premium'}
                </h3>
              </div>
              <p className="text-gray-300 max-w-2xl mx-auto">
                {loading ? 'Chargement...' : `${vipPlugs.length} produit(s) VIP disponible(s)`}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                <p className="mt-4 text-gray-300">Chargement des produits VIP...</p>
              </div>
            ) : vipPlugs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👑</div>
                <h3 className="text-xl font-medium text-white mb-2">Aucun produit VIP disponible</h3>
                <p className="text-gray-300 mb-6">Les produits VIP seront bientôt disponibles.</p>
                <Link
                  href="/shop"
                  className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  🏠 Voir toutes les boutiques
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {vipPlugs.map((plug, index) => (
                  <Link key={plug._id} href={`/shop/${plug._id}`}>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-400 transition-colors duration-300 cursor-pointer">
                      <div className="relative h-32 sm:h-40">
                        <img
                          src={plug.image || '/placeholder.jpg'}
                          alt={plug.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute top-2 right-2 space-y-1">
                          <div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-900 text-white">
                              <StarIcon className="w-3 h-3 mr-1" />
                              VIP
                            </span>
                          </div>
                          {index < 3 && plug.likes > 0 && (
                            <div>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 truncate">{plug.name}</h3>
                        <p className="text-gray-600 mb-3 text-xs sm:text-sm line-clamp-2 h-8">{plug.description}</p>

                        {plug.countries && plug.countries.length > 0 && (
                          <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2">
                            <MapPinIcon className="w-3 h-3 mr-1" />
                            <span className="truncate">{plug.countries.join(', ')}</span>
                          </div>
                        )}

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
        )}
      </div>
    </>
  )
}