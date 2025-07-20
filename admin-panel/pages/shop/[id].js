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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchPlug()
    }
  }, [id])

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!plug) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Boutique non trouvée</h1>
          <Link href="/shop" className="text-blue-600 hover:text-blue-800">
            ← Retour aux boutiques
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{plug.name} - Boutique VIP</title>
        <meta name="description" content={plug.description} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-purple-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link 
                  href="/shop"
                  className="flex items-center text-white hover:text-blue-100 mr-4"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Retour
                </Link>
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                    <StarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-white">{plug.name}</h1>
                  {plug.isVip && <p className="text-yellow-200 text-sm">⭐ Boutique VIP</p>}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
                <h2 className="text-2xl font-bold text-gray-900">{plug.name}</h2>
                {plug.isVip && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    ⭐ VIP
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-6">{plug.description}</p>

              {/* Services */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🔧 Services disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plug.services.delivery.enabled && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">🚚 Livraison</h4>
                      <p className="text-sm text-blue-700">{plug.services.delivery.description}</p>
                    </div>
                  )}
                  {plug.services.postal.enabled && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">✈️ Envoi postal</h4>
                      <p className="text-sm text-green-700">{plug.services.postal.description}</p>
                    </div>
                  )}
                  {plug.services.meetup.enabled && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">🏠 Meetup</h4>
                      <p className="text-sm text-purple-700">{plug.services.meetup.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pays */}
              {plug.countries && plug.countries.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🌍 Pays desservis</h3>
                  <div className="flex flex-wrap gap-2">
                    {plug.countries.map((country, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                      >
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plug.socialMedia?.telegram && (
                    <a
                      href={plug.socialMedia.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      📱 Telegram
                    </a>
                  )}
                  {plug.socialMedia?.whatsapp && (
                    <a
                      href={plug.socialMedia.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                  {plug.socialMedia?.instagram && (
                    <a
                      href={plug.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center bg-pink-500 hover:bg-pink-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      📸 Instagram
                    </a>
                  )}
                  {plug.socialMedia?.website && (
                    <a
                      href={plug.socialMedia.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      🌐 Site web
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}