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

export default function ShopVIP() {
  const [vipPlugs, setVipPlugs] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    fetchConfig()
    fetchVipPlugs()
    
    const interval = setInterval(() => {
      fetchConfig()
      fetchVipPlugs()
    }, 30000)
    
    const handleStorageChange = (event) => {
      if (event?.key === 'boutique_sync_signal' || event?.key === 'global_sync_signal') {
        console.log('🔄 Signal de synchronisation VIP reçu:', event.key)
        setTimeout(() => {
          fetchConfig()
          fetchVipPlugs()
        }, 500)
        if (typeof toast !== 'undefined') {
          toast.success('🔄 Synchronisation VIP...', {
            duration: 2000,
            icon: '👑'
          })
        }
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
        console.log('❌ Config VIP directe échouée:', directError.message)
        
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
          console.log('❌ Config VIP proxy échouée:', proxyError.message)
          throw proxyError
        }
      }

      setConfig(data)
    } catch (error) {
      console.log('❌ Erreur chargement config VIP:', error)
    }
  }

  const fetchVipPlugs = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const timestamp = new Date().getTime()
      
      let data
      try {
        const url = `${apiBaseUrl}/api/public/plugs?filter=vip&limit=50&t=${timestamp}`
        const directResponse = await fetch(url, {
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
          console.log('✅ API VIP directe réussie:', data)
        } else {
          throw new Error(`VIP direct failed: HTTP ${directResponse.status}`)
        }
      } catch (directError) {
        console.log('❌ VIP directs échoués:', directError.message)
        
        try {
          const proxyUrl = `/api/proxy?endpoint=/api/public/plugs&filter=vip&limit=50&t=${new Date().getTime()}`
          const proxyResponse = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          })
          
          if (!proxyResponse.ok) {
            throw new Error(`VIP proxy failed: HTTP ${proxyResponse.status}`)
          }
          
          data = await proxyResponse.json()
          console.log('✅ VIP proxy réussi:', data)
        } catch (proxyError) {
          console.log('❌ VIP proxy échoués:', proxyError.message)
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
        console.error('❌ Structure de données VIP inattendue:', data)
        plugsArray = []
      }

      const sortedPlugs = plugsArray.sort((a, b) => (b.likes || 0) - (a.likes || 0))
      console.log('👑 Plugs VIP chargés:', sortedPlugs.length, 'boutiques VIP')
      setVipPlugs(sortedPlugs)
    } catch (error) {
      console.error('💥 VIP fetch error:', error)
      setVipPlugs([])
    } finally {
      setLoading(false)
    }
  }

  const currentPlugs = vipPlugs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return (
      <>
        <Head>
          <title>Chargement...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p style={{ color: 'white' }} className="font-medium">Chargement de la boutique VIP...</p>
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center h-16">
                <div className="text-center">
                  <h1 style={{ color: 'white' }} className="text-xl font-bold">
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
                  style={{ color: 'white' }}
                  className="pb-3 flex items-center hover:opacity-75"
                >
                  <span className="mr-1">🏠</span>
                  <span style={{ color: 'white' }}>Accueil</span>
                </Link>
                <Link 
                  href="/shop/search" 
                  style={{ color: 'white' }}
                  className="pb-3 flex items-center hover:opacity-75"
                >
                  <span className="mr-1">🔍</span>
                  <span style={{ color: 'white' }}>Recherche</span>
                </Link>
                <Link 
                  href="/shop/vip" 
                  style={{ color: 'white', borderColor: 'white' }}
                  className="font-medium border-b-2 pb-3 flex items-center"
                >
                  <span className="mr-1">👑</span>
                  <span style={{ color: 'white' }}>VIP</span>
                </Link>
              </div>
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            {config && (
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-4">
                  <h2 style={{ color: 'white' }} className="text-3xl font-bold">
                    👑 VIP - {config?.boutique?.name || 'Boutique Premium'}
                  </h2>
                </div>
                <p style={{ color: 'white' }} className="max-w-2xl mx-auto">
                  {loading ? 'Chargement...' : `${vipPlugs.length} produit(s) VIP disponible(s)`}
                </p>
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p style={{ color: 'white' }}>Chargement des produits VIP...</p>
              </div>
            ) : vipPlugs.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-white mb-4 flex items-center justify-center">
                  <StarIcon className="h-8 w-8" />
                </div>
                <h3 style={{ color: 'white' }} className="text-xl font-medium mb-2">Aucun produit VIP disponible</h3>
                <p style={{ color: 'white' }} className="mb-6">Les produits VIP seront bientôt disponibles.</p>
                <Link href="/shop" style={{ color: 'white' }} className="underline hover:opacity-75">
                  Retour à la boutique
                </Link>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {currentPlugs.map((plug, index) => (
                    <Link 
                      key={plug._id || index} 
                      href={`/shop/${plug._id}`} 
                      className="block group hover:scale-105 transition-transform duration-200"
                      style={{ textDecoration: 'none' }}
                    >
                      <div className="bg-gray-800 border border-yellow-500 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                        {/* Image */}
                        <div className="relative aspect-square bg-gray-900">
                          {plug.image ? (
                            <img
                              src={plug.image}
                              alt={plug.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div 
                            className={`absolute inset-0 flex items-center justify-center ${plug.image ? 'hidden' : 'flex'}`}
                            style={{ display: plug.image ? 'none' : 'flex' }}
                          >
                            <GlobeAltIcon className="w-16 h-16 text-gray-600" />
                          </div>
                          
                          {/* VIP Badge - Always shown for VIP page */}
                          <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-500" style={{ color: 'white' }}>
                              <StarIcon className="w-3 h-3 mr-1" />
                              VIP
                            </span>
                          </div>

                          {/* Ranking Badge for top 3 */}
                          {index < 3 && (
                            <div className="absolute top-2 left-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-600" style={{ color: 'white' }}>
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-3 sm:p-4">
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
                              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
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
                {vipPlugs.length > itemsPerPage && (
                  <div className="flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={vipPlugs.length}
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