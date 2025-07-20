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
      // Utiliser l'endpoint public pour la boutique
      const timestamp = new Date().getTime()
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
      const url = `${apiBaseUrl}/api/public/plugs?filter=active&limit=100&t=${timestamp}`
      
      console.log('🔍 Fetching from:', url)
      console.log('🌍 API Base URL:', apiBaseUrl)
      
      const response = await fetch(url, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      console.log('📡 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Raw data received:', data)
        
        // Vérifier que data.plugs existe et est un array
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
      } else {
        console.error('❌ Response error:', response.status, response.statusText)
        setPlugs([])
      }
    } catch (error) {
      console.error('💥 Fetch error:', error)
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

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-purple-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                    <StarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-white">Boutique VIP</h1>
                  <p className="text-blue-100 text-sm">Plugs premium sélectionnés</p>
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
                className="text-blue-600 font-medium border-b-2 border-blue-600 pb-3"
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

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              🌟 Boutiques Premium
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Découvrez notre sélection exclusive de boutiques vérifiées avec livraison rapide, 
              envoi postal sécurisé et options de meetup.
            </p>
            {lastUpdate && (
              <p className="text-sm text-blue-200 mb-6">
                🔄 Dernière synchronisation : {lastUpdate.toLocaleTimeString('fr-FR')}
              </p>
            )}
            <div className="flex justify-center space-x-4">
              <Link
                href="/shop/search"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                🔍 Rechercher une boutique
              </Link>
              <Link
                href="/shop/vip"
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                ⭐ Voir les VIP
              </Link>
            </div>
          </div>
        </div>

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
                <div
                  key={plug._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Image */}
                  <div className="relative h-48">
                    <img
                      src={plug.image || '/placeholder.jpg'}
                      alt={plug.name}
                      className="w-full h-full object-cover"
                    />
                    {plug.isVip && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
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

                    {/* Boutons de contact */}
                    <div className="space-y-2">
                      {plug.socialMedia?.telegram && (
                        <a
                          href={plug.socialMedia.telegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          📱 Contacter sur Telegram
                        </a>
                      )}
                      {plug.socialMedia?.whatsapp && (
                        <a
                          href={plug.socialMedia.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-green-500 hover:bg-green-600 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          💬 Contacter sur WhatsApp
                        </a>
                      )}
                      {plug.socialMedia?.website && (
                        <a
                          href={plug.socialMedia.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-gray-500 hover:bg-gray-600 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          🌐 Visiter le site
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Boutique VIP</h3>
              <p className="text-gray-400 mb-4">Votre sélection de boutiques premium</p>
              <div className="flex justify-center space-x-4">
                <a
                  href="https://t.me/votre_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  📱 Telegram Bot
                </a>
                <span className="text-gray-600">•</span>
                <Link href="/admin" className="text-purple-400 hover:text-purple-300">
                  🔧 Admin
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}