import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
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
  ArrowLeftIcon,
  HeartIcon
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

  // Vérifier si l'URL est valide
  const isValidUrl = src && typeof src === 'string' && src.trim() !== '' && 
                     (src.startsWith('http://') || src.startsWith('https://'))

  // Si pas d'image source valide ou erreur, afficher le fallback
  if (!isValidUrl || imageError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
        <FallbackIcon className="w-20 h-20 text-gray-600" />
      </div>
    )
  }

  return (
    <>
      {/* Loading placeholder */}
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="animate-pulse">
            <FallbackIcon className="w-20 h-20 text-gray-600" />
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

export default function ShopPlugDetail() {
  const router = useRouter()
  const { id } = router.query
  const [plug, setPlug] = useState(null)
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (id) {
      fetchConfig()
      fetchPlug()
    }
  }, [id])

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
        console.log('❌ Config détail directe échouée:', directError.message)
        
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
          console.log('❌ Config détail proxy échouée:', proxyError.message)
          throw proxyError
        }
      }

      setConfig(data)
    } catch (error) {
      console.log('❌ Erreur chargement config détail:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchPlug = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const timestamp = new Date().getTime()
      
      let data
      try {
        // D'abord essayer de récupérer le plug spécifique
        const directResponse = await fetch(`${apiBaseUrl}/api/public/plugs?limit=1000&t=${timestamp}`, {
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
          console.log('✅ API détail directe réussie:', data)
        } else {
          throw new Error(`Direct plug failed: HTTP ${directResponse.status}`)
        }
      } catch (directError) {
        console.log('❌ Plug détail direct échoué:', directError.message)
        
        try {
          const proxyResponse = await fetch(`/api/proxy?endpoint=/api/public/plugs&limit=1000&t=${new Date().getTime()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          })
          
          if (proxyResponse.ok) {
            data = await proxyResponse.json()
            console.log('✅ Plug détail via proxy:', data)
          } else if (proxyResponse.status === 404) {
            setNotFound(true)
            return
          } else {
            throw new Error(`Plug proxy failed: HTTP ${proxyResponse.status}`)
          }
        } catch (proxyError) {
          console.log('❌ Plug détail proxy échoué:', proxyError.message)
          setNotFound(true)
          return
        }
      }

      // Traiter la structure de réponse et trouver le plug spécifique
      let plugsArray = []
      if (data && Array.isArray(data.plugs)) {
        plugsArray = data.plugs
      } else if (Array.isArray(data)) {
        // Fallback si la réponse est directement un tableau
        plugsArray = data
      } else {
        console.error('❌ Structure de données détail inattendue:', data)
        setNotFound(true)
        return
      }

      // Trouver le plug avec l'ID correspondant
      const foundPlug = plugsArray.find(p => p._id === id)
      if (foundPlug) {
        console.log('✅ Plug trouvé:', foundPlug.name)
        setPlug(foundPlug)
      } else {
        console.log('❌ Plug non trouvé avec ID:', id)
        setNotFound(true)
      }
    } catch (error) {
      console.error('❌ Erreur chargement plug détail:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const formatText = (text) => {
    if (!text) return ''
    return text.split('\\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\\n').length - 1 && <br />}
      </span>
    ))
  }

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
            <p style={{ color: 'white' }} className="font-medium">Chargement du produit...</p>
          </div>
        </div>
      </>
    )
  }

  if (notFound) {
    return (
      <>
        <Head>
          <title>Produit non trouvé</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div 
          className="min-h-screen flex items-center justify-center"
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
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-white mb-4 flex items-center justify-center">
              <GlobeAltIcon className="h-8 w-8" />
            </div>
            <h3 style={{ color: 'white' }} className="text-xl font-medium mb-2">Boutique non trouvée</h3>
            <p style={{ color: 'white' }} className="mb-6">Cette boutique n'existe pas ou a été supprimée.</p>
            <Link href="/shop" style={{ color: 'white', textDecoration: 'none' }} className="hover:opacity-75">
              Retour aux boutiques
            </Link>
          </div>
        </div>
      </>
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
                  {plug && (
                    <p style={{ color: 'white' }} className="text-sm mt-1 text-gray-300">{plug.name}</p>
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
                  style={{ color: 'white' }}
                  className="pb-3 flex items-center hover:opacity-75"
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back button */}
            <div className="mb-6">
              <button 
                onClick={() => router.back()} 
                className="flex items-center hover:opacity-75 transition-opacity"
                style={{ color: 'white' }}
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                <span style={{ color: 'white' }}>Retour</span>
              </button>
            </div>

            {/* Plug details */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
              {/* Image */}
              <div className="relative h-64 md:h-80 bg-gray-900">
                <ImageWithFallback
                  src={plug.image}
                  alt={plug.name}
                  className="w-full h-full object-cover"
                  fallbackIcon={GlobeAltIcon}
                />
                
                {/* VIP Badge */}
                {plug.isVip && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-500" style={{ color: 'white' }}>
                      <StarIcon className="w-4 h-4 mr-2" />
                      VIP
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 style={{ color: 'white' }} className="text-2xl font-bold mb-4">{plug.name}</h2>
                <p style={{ color: '#e5e7eb' }} className="mb-6">{plug.description}</p>

                {/* Location */}
                {plug.countries && plug.countries.length > 0 && (
                  <div className="mb-6">
                    <h3 style={{ color: 'white' }} className="text-lg font-semibold mb-2">📍 Localisation</h3>
                    <div className="flex items-center" style={{ color: 'white' }}>
                      <MapPinIcon className="w-5 h-5 mr-2" />
                      <span>{plug.countries.join(', ')}</span>
                    </div>
                  </div>
                )}

                {/* Services */}
                <div className="mb-6">
                  <h3 style={{ color: 'white' }} className="text-lg font-semibold mb-3">🚀 Services disponibles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Delivery */}
                    <div className={`p-4 rounded-lg border ${plug.services?.delivery?.enabled ? 'bg-green-900 border-green-600' : 'bg-gray-800 border-gray-600'}`}>
                      <div className="flex items-center mb-2">
                        <TruckIcon className="w-5 h-5 mr-2 text-green-400" />
                        <h4 style={{ color: 'white' }} className="font-semibold">Livraison</h4>
                      </div>
                      {plug.services?.delivery?.enabled ? (
                        <>
                          <p style={{ color: '#e5e7eb' }} className="text-sm mb-2">Service disponible</p>
                          {plug.services.delivery.price && (
                            <p style={{ color: 'white' }} className="text-sm font-semibold">{plug.services.delivery.price}</p>
                          )}
                        </>
                      ) : (
                        <p style={{ color: '#9ca3af' }} className="text-sm">Non disponible</p>
                      )}
                    </div>

                    {/* Postal */}
                    <div className={`p-4 rounded-lg border ${plug.services?.postal?.enabled ? 'bg-gray-800 border-gray-600' : 'bg-gray-800 border-gray-600'}`}>
                      <div className="flex items-center mb-2">
                        <GlobeAltIcon className="w-5 h-5 mr-2 text-white" />
                        <h4 style={{ color: 'white' }} className="font-semibold">Postal</h4>
                      </div>
                      {plug.services?.postal?.enabled ? (
                        <>
                          <p style={{ color: '#e5e7eb' }} className="text-sm mb-2">Service disponible</p>
                          {plug.services.postal.price && (
                            <p style={{ color: 'white' }} className="text-sm font-semibold">{plug.services.postal.price}</p>
                          )}
                        </>
                      ) : (
                        <p style={{ color: '#9ca3af' }} className="text-sm">Non disponible</p>
                      )}
                    </div>

                    {/* Meetup */}
                    <div className={`p-4 rounded-lg border ${plug.services?.meetup?.enabled ? 'bg-gray-800 border-gray-600' : 'bg-gray-800 border-gray-600'}`}>
                      <div className="flex items-center mb-2">
                        <HomeIcon className="w-5 h-5 mr-2 text-white" />
                        <h4 style={{ color: 'white' }} className="font-semibold">Meetup</h4>
                      </div>
                      {plug.services?.meetup?.enabled ? (
                        <>
                          <p style={{ color: '#e5e7eb' }} className="text-sm mb-2">Service disponible</p>
                          {plug.services.meetup.price && (
                            <p style={{ color: 'white' }} className="text-sm font-semibold">{plug.services.meetup.price}</p>
                          )}
                        </>
                      ) : (
                        <p style={{ color: '#9ca3af' }} className="text-sm">Non disponible</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Réseaux sociaux personnalisés */}
                {plug.socialMedia && plug.socialMedia.length > 0 && (
                  <div className="mb-6">
                    <h3 style={{ color: 'white' }} className="text-lg font-semibold mb-4">🌐 Réseaux sociaux</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {plug.socialMedia.map((social, index) => (
                        <a
                          key={index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-4 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                        >
                          <span className="text-2xl mr-3">{social.emoji}</span>
                          <div>
                            <h4 style={{ color: 'white' }} className="font-medium">{social.name}</h4>
                            <p style={{ color: '#9ca3af' }} className="text-sm truncate">{social.url}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional info */}
                {plug.additionalInfo && (
                  <div className="mb-6">
                    <h3 style={{ color: 'white' }} className="text-lg font-semibold mb-3">ℹ️ Informations complémentaires</h3>
                    <div style={{ color: '#e5e7eb' }} className="prose prose-invert max-w-none">
                      {formatText(plug.additionalInfo)}
                    </div>
                  </div>
                )}

                {/* Likes */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                  <div className="flex items-center" style={{ color: 'white' }}>
                    <HeartIcon className="w-6 h-6 mr-2 text-red-500" />
                    <span className="text-lg font-semibold">{plug.likes || 0} like{(plug.likes || 0) !== 1 ? 's' : ''}</span>
                  </div>
                  <Link 
                    href="/shop" 
                    style={{ color: 'white', textDecoration: 'none' }}
                    className="hover:opacity-75"
                  >
                    Retour aux boutiques
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}