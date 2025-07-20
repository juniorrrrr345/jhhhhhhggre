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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVipPlugs()
    
    // Auto-refresh toutes les 30 secondes pour la synchronisation
    const interval = setInterval(() => {
      fetchVipPlugs()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchVipPlugs = async () => {
    try {
      setLoading(true)
      
      // Essayer d'abord l'API directe
      let data
      try {
        const timestamp = new Date().getTime()
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
        const url = `${apiBaseUrl}/api/public/plugs?filter=vip&limit=50&t=${timestamp}`
        
        console.log('🔍 VIP tentative directe:', url)
        const response = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        if (response.ok) {
          data = await response.json()
          console.log('✅ VIP API directe réussie')
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (directError) {
        console.log('❌ VIP API directe échouée:', directError.message)
        console.log('🔄 VIP tentative via proxy...')
        
        // Fallback vers le proxy
        const proxyUrl = `/api/proxy?endpoint=/api/public/plugs&filter=vip&limit=50&t=${new Date().getTime()}`
        const proxyResponse = await fetch(proxyUrl, {
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        if (proxyResponse.ok) {
          data = await proxyResponse.json()
          console.log('✅ VIP proxy réussi')
        } else {
          throw new Error(`VIP proxy failed: HTTP ${proxyResponse.status}`)
        }
      }
      
      if (data && Array.isArray(data.plugs)) {
        console.log('👑 VIP data received:', data.plugs.length, 'VIP plugs')
        setVipPlugs(data.plugs)
      } else {
        console.error('❌ Invalid VIP data structure:', data)
        setVipPlugs([])
             }
     } catch (error) {
      console.error('💥 VIP fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Boutiques VIP - Selection Premium</title>
        <meta name="description" content="Découvrez notre sélection exclusive de boutiques VIP premium avec services garantis." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-gray-900 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                    <StarIcon className="h-5 w-5 text-gray-900" />
                  </div>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-white">Boutique VIP</h1>
                  <p className="text-gray-300 text-sm">Sélection premium exclusive</p>
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
                className="text-gray-500 hover:text-gray-700 pb-3"
              >
                🔍 Recherche
              </Link>
              <Link 
                href="/shop/vip" 
                className="text-yellow-600 font-medium border-b-2 border-yellow-600 pb-3"
              >
                ⭐ VIP
              </Link>
            </div>
          </div>
        </nav>



        {/* Boutiques VIP */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              👑 Collection VIP
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {loading ? 'Chargement...' : `${vipPlugs.length} boutique(s) VIP disponible(s)`}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Chargement des boutiques VIP...</p>
            </div>
          ) : vipPlugs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👑</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune boutique VIP disponible</h3>
              <p className="text-gray-500 mb-6">Les boutiques VIP seront bientôt disponibles.</p>
              <Link
                href="/shop"
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                🏠 Voir toutes les boutiques
              </Link>
            </div>
          ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {vipPlugs.map((plug) => (
                <Link key={plug._id} href={`/shop/${plug._id}`}>
                                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-400 transition-colors duration-300 cursor-pointer">
                                      {/* Image avec badge VIP */}
                    <div className="relative h-32 sm:h-40">
                      <img
                        src={plug.image || '/placeholder.jpg'}
                        alt={plug.name}
                        className="w-full h-full object-cover grayscale"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-900 text-white">
                          <StarIcon className="w-3 h-3 mr-1" />
                          VIP
                        </span>
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


      </div>
    </>
  )
}