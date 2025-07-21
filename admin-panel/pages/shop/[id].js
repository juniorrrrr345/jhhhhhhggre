import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { api } from '../../lib/api'
import { getProxiedImageUrl } from '../../lib/imageUtils'
import toast from 'react-hot-toast'

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
      fetchPlug(id)
    }
  }, [id])

  const fetchConfig = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
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

  const fetchPlug = async (id) => {
    try {
      setLoading(true)
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const timestamp = new Date().getTime()
      
      let data
      try {
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

      let plugsArray = []
      if (data && Array.isArray(data.plugs)) {
        plugsArray = data.plugs
      } else if (Array.isArray(data)) {
        plugsArray = data
      } else {
        console.error('❌ Structure de données détail inattendue:', data)
        setNotFound(true)
        return
      }

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

  const getCountryFlag = (countries) => {
    if (!countries || countries.length === 0) return '🌍'
    const countryFlagMap = {
      'France': '🇫🇷',
      'Belgique': '🇧🇪',
      'Suisse': '🇨🇭',
      'Canada': '🇨🇦',
      'Allemagne': '🇩🇪',
      'Espagne': '🇪🇸',
      'Italie': '🇮🇹',
      'Portugal': '🇵🇹',
      'Royaume-Uni': '🇬🇧',
      'Pays-Bas': '🇳🇱'
    }
    return countryFlagMap[countries[0]] || '🌍'
  }

  if (initialLoading) {
    return (
      <>
        <Head>
          <title>Chargement...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>
        <div style={{ backgroundColor: '#000000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              border: '2px solid transparent',
              borderTop: '2px solid #ffffff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#ffffff', fontWeight: '500' }}>Chargement de la boutique...</p>
          </div>
        </div>
      </>
    )
  }

  if (notFound) {
    return (
      <>
        <Head>
          <title>Boutique non trouvée</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>
        <div style={{ 
          backgroundColor: '#000000', 
          minHeight: '100vh',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#ffffff',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏪</div>
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#ffffff' }}>
              Boutique non trouvée
            </h3>
            <p style={{ color: '#8e8e93', marginBottom: '32px', fontSize: '16px' }}>
              Cette boutique n'existe pas ou a été supprimée.
            </p>
            <Link href="/shop" style={{ 
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#007AFF',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '500'
            }}>
              ← Retour aux boutiques
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{plug.name} - {config?.boutique?.name || 'PlugsFinder Bot'}</title>
        <meta name="description" content={plug.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <div style={{ 
        backgroundColor: '#000000', 
        minHeight: '100vh',
        color: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundImage: config?.interface?.backgroundImage ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("${config.interface.backgroundImage}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        {/* Header avec bouton retour */}
        <header style={{ 
          backgroundColor: '#1a1a1a',
          padding: '16px 20px',
          borderBottom: '1px solid #2a2a2a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => router.back()} 
              style={{
                background: 'none',
                border: 'none',
                color: '#007AFF',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '0'
              }}
            >
              ←
            </button>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <h1 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                margin: '0',
                color: '#ffffff'
              }}>
                {plug.name}
              </h1>
              <p style={{ 
                fontSize: '13px', 
                margin: '2px 0 0 0',
                color: '#8e8e93'
              }}>
                {plug.isVip ? 'Boutique VIP' : 'Boutique'} • {getCountryFlag(plug.countries)}
              </p>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav style={{ 
          backgroundColor: '#000000',
          padding: '0 20px',
          borderBottom: '1px solid #2a2a2a'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '40px',
            paddingBottom: '16px'
          }}>
            <Link href="/shop" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textDecoration: 'none',
              color: '#8e8e93'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: 'transparent', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px'
              }}>
                🏠
              </div>
              <span style={{ fontSize: '12px', color: '#8e8e93' }}>Plugs</span>
            </Link>
            <Link href="/shop/search" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textDecoration: 'none',
              color: '#8e8e93'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: 'transparent', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px'
              }}>
                🔍
              </div>
              <span style={{ fontSize: '12px', color: '#8e8e93' }}>Rechercher</span>
            </Link>
            <Link href="/shop/vip" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textDecoration: 'none',
              color: '#8e8e93'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: 'transparent', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px'
              }}>
                🎁
              </div>
              <span style={{ fontSize: '12px', color: '#8e8e93' }}>VIP</span>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ padding: '20px' }}>
          {/* Image principale */}
          <div style={{ 
            width: '100%', 
            height: '240px', 
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#2a2a2a',
            marginBottom: '20px',
            position: 'relative'
          }}>
            {plug.image && plug.image.trim() !== '' ? (
              <img
                src={getProxiedImageUrl(plug.image)}
                alt={plug.name || 'Boutique'}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex',
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '48px'
              }}>
                {plug.isVip ? '👑' : '🏪'}
              </div>
            )}
            
            {/* Badge VIP overlay */}
            {plug.isVip && (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                backgroundColor: '#FFD700',
                color: '#000000',
                fontSize: '14px',
                fontWeight: 'bold',
                padding: '6px 12px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                👑 VIP
              </div>
            )}
          </div>

          {/* Informations principales */}
          <div style={{ 
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px'
          }}>
            {/* Nom et localisation */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>{getCountryFlag(plug.countries)}</span>
                <h2 style={{ 
                  fontSize: '24px',
                  fontWeight: 'bold',
                  margin: '0',
                  color: plug.isVip ? '#FFD700' : '#ffffff'
                }}>
                  {plug.name}
                </h2>
              </div>
              <p style={{ 
                color: '#8e8e93', 
                fontSize: '16px',
                margin: '0',
                lineHeight: '1.4'
              }}>
                {plug.description}
              </p>
            </div>

            {/* Statistiques */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderTop: '1px solid #2a2a2a',
              borderBottom: '1px solid #2a2a2a'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>👍</div>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: plug.isVip ? '#FFD700' : '#ffffff'
                }}>
                  {plug.likes || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#8e8e93' }}>Likes</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>📍</div>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#ffffff'
                }}>
                  {plug.countries ? plug.countries.length : 0}
                </div>
                <div style={{ fontSize: '12px', color: '#8e8e93' }}>Pays</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>⭐</div>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: plug.isVip ? '#FFD700' : '#ffffff'
                }}>
                  {plug.isVip ? 'VIP' : 'STD'}
                </div>
                <div style={{ fontSize: '12px', color: '#8e8e93' }}>Type</div>
              </div>
            </div>

            {/* Localisation */}
            {plug.countries && plug.countries.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#ffffff'
                }}>
                  📍 Localisation
                </h3>
                <p style={{ color: '#8e8e93', fontSize: '15px', margin: '0' }}>
                  {plug.countries.join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Services */}
          <div style={{ 
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: '#ffffff'
            }}>
              🚀 Services disponibles
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Livraison */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '12px',
                backgroundColor: plug.services?.delivery?.enabled ? '#0a4a2a' : '#2a2a2a',
                borderRadius: '8px',
                border: plug.services?.delivery?.enabled ? '1px solid #22c55e' : '1px solid #3a3a3a'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>📦</span>
                  <div>
                    <div style={{ fontWeight: '500', color: '#ffffff' }}>Livraison</div>
                    {plug.services?.delivery?.price && (
                      <div style={{ fontSize: '13px', color: '#8e8e93' }}>
                        {plug.services.delivery.price}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ 
                  color: plug.services?.delivery?.enabled ? '#22c55e' : '#ef4444',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  {plug.services?.delivery?.enabled ? '✓ Disponible' : '✗ Non disponible'}
                </div>
              </div>

              {/* Postal */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '12px',
                backgroundColor: plug.services?.postal?.enabled ? '#1a3a4a' : '#2a2a2a',
                borderRadius: '8px',
                border: plug.services?.postal?.enabled ? '1px solid #3b82f6' : '1px solid #3a3a3a'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>📍</span>
                  <div>
                    <div style={{ fontWeight: '500', color: '#ffffff' }}>Postal</div>
                    {plug.services?.postal?.price && (
                      <div style={{ fontSize: '13px', color: '#8e8e93' }}>
                        {plug.services.postal.price}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ 
                  color: plug.services?.postal?.enabled ? '#3b82f6' : '#ef4444',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  {plug.services?.postal?.enabled ? '✓ Disponible' : '✗ Non disponible'}
                </div>
              </div>

              {/* Meetup */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '12px',
                backgroundColor: plug.services?.meetup?.enabled ? '#4a2a1a' : '#2a2a2a',
                borderRadius: '8px',
                border: plug.services?.meetup?.enabled ? '1px solid #f59e0b' : '1px solid #3a3a3a'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>💰</span>
                  <div>
                    <div style={{ fontWeight: '500', color: '#ffffff' }}>Meetup</div>
                    {plug.services?.meetup?.price && (
                      <div style={{ fontSize: '13px', color: '#8e8e93' }}>
                        {plug.services.meetup.price}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ 
                  color: plug.services?.meetup?.enabled ? '#f59e0b' : '#ef4444',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  {plug.services?.meetup?.enabled ? '✓ Disponible' : '✗ Non disponible'}
                </div>
              </div>
            </div>
          </div>

          {/* Réseaux sociaux */}
          {plug.socialMedia && plug.socialMedia.length > 0 && (
            <div style={{ 
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: '#ffffff'
              }}>
                🌐 Réseaux sociaux
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {plug.socialMedia.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: '#2a2a2a',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#ffffff',
                      border: '1px solid #3a3a3a',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#3a3a3a'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}
                  >
                    <span style={{ fontSize: '20px' }}>{social.emoji}</span>
                    <span style={{ fontWeight: '500' }}>{social.name}</span>
                    <span style={{ marginLeft: 'auto', color: '#8e8e93' }}>→</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Informations complémentaires */}
          {plug.additionalInfo && (
            <div style={{ 
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '12px',
                color: '#ffffff'
              }}>
                ℹ️ Informations complémentaires
              </h3>
              <div style={{ 
                color: '#8e8e93', 
                fontSize: '15px',
                lineHeight: '1.5'
              }}>
                {formatText(plug.additionalInfo)}
              </div>
            </div>
          )}

          {/* Bouton retour */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link 
              href="/shop" 
              style={{ 
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#007AFF',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '500'
              }}
            >
              ← Retour aux boutiques
            </Link>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}