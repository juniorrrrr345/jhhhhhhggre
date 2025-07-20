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
              📋 Toutes nos boutiques
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Parcourez notre catalogue complet de boutiques vérifiées. 
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plugs.map((plug) => (
                                <Link key={plug._id} href={`/shop/${plug._id}`}>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-400 transition-colors duration-300 cursor-pointer">
                    {/* Image */}
                    <div className="relative h-48">
                      <img
                        src={plug.image || '/placeholder.jpg'}
                        alt={plug.name}
                        className="w-full h-full object-cover grayscale"
                      />
                      {plug.isVip && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-900 text-white">
                            <StarIcon className="w-4 h-4 mr-1" />
                            VIP
                          </span>
                        </div>
                      )}
                    </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plug.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{plug.description}</p>

                    {/* Localisation */}
                    {plug.countries && plug.countries.length > 0 && (
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {plug.countries.join(', ')}
                      </div>
                    )}

                    {/* Services */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {plug.services?.delivery?.enabled && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <TruckIcon className="w-3 h-3 mr-1" />
                          Livraison
                        </span>
                      )}
                      {plug.services?.postal?.enabled && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <GlobeAltIcon className="w-3 h-3 mr-1" />
                          Postal
                        </span>
                      )}
                      {plug.services?.meetup?.enabled && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <HomeIcon className="w-3 h-3 mr-1" />
                          Meetup
                        </span>
                      )}
                    </div>

                    {/* Likes */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-gray-600 text-sm">Voir les détails</span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <span className="mr-1">❤️</span>
                        <span>{plug.likes || 0}</span>
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