import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { api } from '../../lib/api'
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
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    fetchPlugs()
    
    // Auto-refresh toutes les 30 secondes pour la synchronisation
    const interval = setInterval(() => {
      fetchPlugs()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

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
        setLastUpdate(new Date())
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

  return (
    <>
      <Head>
        <title>Boutique VIP - Découvrez nos plugs premium</title>
        <meta name="description" content="Découvrez notre sélection de boutiques VIP avec livraison, envoi postal et meetup disponibles." />
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
                  <h1 className="text-xl font-bold text-white">Boutique</h1>
                  <p className="text-gray-300 text-sm">Sélection de boutiques</p>
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
                className="text-gray-900 font-medium border-b-2 border-gray-900 pb-3"
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
                className="text-gray-500 hover:text-gray-700 pb-3"
              >
                ⭐ VIP
              </Link>
            </div>
          </div>
        </nav>



        {/* Toutes les boutiques */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              🏆 Classement des Boutiques
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Boutiques classées par nombre de likes des utilisateurs. Les plus appréciées en premier ! 
              Les boutiques VIP sont mises en avant.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Chargement des boutiques...</p>
            </div>
          ) : plugs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏪</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune boutique disponible</h3>
              <p className="text-gray-500">Revenez plus tard pour découvrir nos boutiques.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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


      </div>
    </>
  )
}