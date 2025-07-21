import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import {
  StarIcon,
  MapPinIcon,
  TruckIcon,
  GlobeAltIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

export default function ShopDetail() {
  const router = useRouter()
  const { id } = router.query
  const [plug, setPlug] = useState(null)
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchPlug()
    }
    fetchConfig()
  }, [id])

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
    }
  }

  const fetchPlug = async () => {
    try {
      setLoading(true)
      
      // Essayer d'abord l'API directe
      let data
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
        const timestamp = new Date().getTime()
        const url = `${apiBaseUrl}/api/public/plugs?filter=active&limit=1000&t=${timestamp}`
        
        console.log('🔍 Tentative directe pour détails:', url)
        const response = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        if (response.ok) {
          data = await response.json()
          console.log('✅ API directe réussie pour détails')
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (directError) {
        console.log('❌ API directe échouée pour détails:', directError.message)
        console.log('🔄 Tentative via proxy pour détails...')
        
        // Fallback vers le proxy
        const proxyUrl = `/api/proxy?endpoint=/api/public/plugs&filter=active&limit=1000&t=${new Date().getTime()}`
        const proxyResponse = await fetch(proxyUrl, {
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        if (proxyResponse.ok) {
          data = await proxyResponse.json()
          console.log('✅ Proxy réussi pour détails')
        } else {
          throw new Error(`Proxy failed: HTTP ${proxyResponse.status}`)
        }
      }
      
      if (data && Array.isArray(data.plugs)) {
        const foundPlug = data.plugs.find(p => p._id === id)
        if (foundPlug) {
          setPlug(foundPlug)
          console.log('✅ Plug trouvé:', foundPlug.name)
        } else {
          console.error('❌ Plug non trouvé avec ID:', id)
        }
      } else {
        console.error('❌ Invalid data structure for details:', data)
      }
      
    } catch (error) {
      console.error('💥 Fetch error pour détails:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-black flex items-center justify-center"
        style={config?.boutique?.backgroundImage ? {
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${config.boutique.backgroundImage})`,
          backgroundSize: '300px 300px',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed'
        } : {}}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-medium">Chargement de la boutique...</p>
        </div>
      </div>
    )
  }

  if (!plug) {
    return (
      <div 
        className="min-h-screen bg-black flex items-center justify-center"
        style={config?.boutique?.backgroundImage ? {
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${config.boutique.backgroundImage})`,
          backgroundSize: '300px 300px',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed'
        } : {}}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Boutique non trouvée</h1>
          <Link href="/shop" className="text-white hover:text-gray-200 underline">
            ← Retour aux boutiques
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{plug.name} - {config?.boutique?.name || 'Boutique'}</title>
        <meta name="description" content={plug.description} />
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
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Header */}
        <header className="bg-gray-900 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-16">
              <div className="text-center">
                <h1 className="text-xl font-bold text-white">
                  🔌 {config?.boutique?.name || 'Boutique'}
                </h1>
                <p className="text-white text-sm">
                  {plug.name}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-black shadow-sm border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center space-x-8 h-12 items-center">
              <Link 
                href="/shop" 
                className="text-white font-medium border-b-2 border-white pb-3 flex items-center"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                <span className="mr-1">🏠</span>
                Retour à la liste
              </Link>
              <Link 
                href="/shop/search" 
                className="text-white hover:text-gray-200 pb-3 flex items-center"
              >
                <span className="mr-1">🔍</span>
                Recherche
              </Link>
              <Link 
                href="/shop/vip" 
                className="text-white hover:text-gray-200 pb-3 flex items-center"
              >
                <span className="mr-1">👑</span>
                VIP
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-black border border-gray-600 rounded-lg shadow-lg overflow-hidden">
            {plug.image && (
              <div className="h-64 bg-gray-200">
                <img 
                  src={plug.image} 
                  alt={plug.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{plug.name}</h2>
                <div className="flex items-center space-x-3">
                  {plug.isVip && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-black">
                      <StarIcon className="w-4 h-4 mr-1" />
                      VIP
                    </span>
                  )}
                  <div className="flex items-center text-white">
                    <span className="mr-1">❤️</span>
                    <span className="font-medium">{plug.likes || 0} likes</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-200 mb-6">{plug.description}</p>

              {/* Services */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">🔧 Services disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plug.services?.delivery?.enabled && (
                    <div className="bg-white bg-opacity-10 border border-white border-opacity-30 p-4 rounded-lg backdrop-blur-sm">
                      <h4 className="font-medium text-white mb-2 flex items-center">
                        <TruckIcon className="w-5 h-5 mr-2" />
                        Livraison
                      </h4>
                      <p className="text-sm text-gray-200">{plug.services.delivery.description}</p>
                    </div>
                  )}
                  {plug.services?.postal?.enabled && (
                    <div className="bg-white bg-opacity-10 border border-white border-opacity-30 p-4 rounded-lg backdrop-blur-sm">
                      <h4 className="font-medium text-white mb-2 flex items-center">
                        <GlobeAltIcon className="w-5 h-5 mr-2" />
                        Envoi postal
                      </h4>
                      <p className="text-sm text-gray-200">{plug.services.postal.description}</p>
                    </div>
                  )}
                  {plug.services?.meetup?.enabled && (
                    <div className="bg-white bg-opacity-10 border border-white border-opacity-30 p-4 rounded-lg backdrop-blur-sm">
                      <h4 className="font-medium text-white mb-2 flex items-center">
                        <MapPinIcon className="w-5 h-5 mr-2" />
                        Meetup
                      </h4>
                      <p className="text-sm text-gray-200">{plug.services.meetup.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pays */}
              {plug.countries && plug.countries.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">🌍 Pays desservis</h3>
                  <div className="flex flex-wrap gap-2">
                    {plug.countries.map((country, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-white border border-gray-600"
                      >
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact et Réseaux Sociaux Personnalisés */}
              <div className="border-t border-gray-600 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">📱 Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Telegram principal */}
                  {plug.telegramLink && (
                    <a
                      href={plug.telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      📱 Telegram
                    </a>
                  )}
                  
                  {/* Réseaux sociaux personnalisés */}
                  {plug.socialMedia && Array.isArray(plug.socialMedia) && plug.socialMedia
                    .filter(social => social && social.name && social.url)
                    .map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors border border-gray-600"
                      >
                        {social.emoji} {social.name}
                      </a>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}