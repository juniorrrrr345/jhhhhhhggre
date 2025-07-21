import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { api } from '../../lib/api'
import { getProxiedImageUrl } from '../../lib/imageUtils'
import toast from 'react-hot-toast'
import Pagination from '../../components/Pagination'

export default function ShopVIP() {
  const [vipPlugs, setVipPlugs] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    fetchConfig()
    fetchPlugs()
    
    const interval = setInterval(() => {
      fetchConfig()
      fetchPlugs()
    }, 15000)
    
    const handleStorageChange = (event) => {
      if (event?.key === 'boutique_sync_signal' || event?.key === 'global_sync_signal') {
        console.log('🔄 Signal de synchronisation reçu:', event.key)
        setTimeout(() => {
          fetchConfig()
          fetchPlugs()
        }, 500)
        if (typeof toast !== 'undefined') {
          toast.success('🔄 Données synchronisées!', {
            duration: 2000,
            icon: '🔄'
          })
        }
      }
    }

    const handleFocus = () => {
      console.log('👁️ Fenêtre focus - rafraîchissement des données VIP')
      fetchConfig()
      fetchPlugs()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page VIP visible - vérification des mises à jour')
        fetchConfig()
        fetchPlugs()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

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
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchPlugs = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
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

      let plugsArray = []
      if (data && Array.isArray(data.plugs)) {
        plugsArray = data.plugs
      } else if (Array.isArray(data)) {
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

  const getPositionBadge = (index) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return null
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
            <p style={{ color: '#ffffff', fontWeight: '500' }}>Chargement des boutiques VIP...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>VIP - {config?.boutique?.name || 'PlugsFinder Bot'}</title>
        <meta name="description" content="Découvrez notre sélection exclusive de boutiques VIP premium avec services garantis." />
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
        {/* Header Titre Principal VIP */}
        <div style={{ 
          backgroundColor: '#000000',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            margin: '0 0 8px 0',
            color: '#FFD700',
            letterSpacing: '2px'
          }}>
            VIP {config?.interface?.title || 'PLUGS FINDER'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ color: '#ffffff', fontSize: '14px' }}>BOUTIQUES</span>
            <span style={{ 
              backgroundColor: '#FFD700', 
              color: '#000000', 
              padding: '4px 8px', 
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              PREMIUM VIP
            </span>
            <span style={{ color: '#ffffff', fontSize: '14px' }}>EXCLUSIVES</span>
          </div>
        </div>

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
              color: '#FFD700'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#FFD700', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px'
              }}>
                🎁
              </div>
              <span style={{ fontSize: '12px', color: '#ffffff' }}>VIP</span>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                border: '2px solid transparent',
                borderTop: '2px solid #FFD700',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: '#ffffff' }}>Chargement des boutiques VIP...</p>
            </div>
          ) : vipPlugs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👑</div>
              <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '500', marginBottom: '8px' }}>
                Aucune boutique VIP disponible
              </h3>
              <p style={{ color: '#8e8e93', marginBottom: '24px' }}>Les boutiques VIP seront bientôt disponibles.</p>
              <Link href="/shop" style={{ 
                color: '#007AFF', 
                textDecoration: 'none',
                fontSize: '16px'
              }}>
                Retour aux boutiques
              </Link>
            </div>
          ) : (
            <>
              {/* Liste des boutiques VIP */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {currentPlugs.map((plug, index) => (
                  <Link 
                    key={plug._id || index} 
                    href={`/shop/${plug._id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{ 
                      backgroundColor: '#1a1a1a',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      border: '1px solid #FFD700',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2a2a1a'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
                    >
                      {/* Image/Logo avec effet VIP */}
                      <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: '#2a2a2a',
                        flexShrink: 0,
                        border: '2px solid #FFD700',
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
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextElementSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          display: plug.image ? 'none' : 'flex',
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '24px'
                        }}>
                          👑
                        </div>
                        {/* Badge VIP en overlay */}
                        <div style={{
                          position: 'absolute',
                          top: '-2px',
                          right: '-2px',
                          backgroundColor: '#FFD700',
                          color: '#000000',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          padding: '2px 4px',
                          borderRadius: '6px'
                        }}>
                          VIP
                        </div>
                      </div>

                      {/* Contenu principal */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Nom et drapeau */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          marginBottom: '4px'
                        }}>
                          <span style={{ fontSize: '16px' }}>{getCountryFlag(plug.countries)}</span>
                          <h3 style={{ 
                            fontSize: '16px',
                            fontWeight: '600',
                            margin: '0',
                            color: '#FFD700',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {plug.name}
                          </h3>
                        </div>

                        {/* Services */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          marginBottom: '4px'
                        }}>
                          {plug.services?.delivery?.enabled && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              fontSize: '12px',
                              color: '#ffffff'
                            }}>
                              <span>📦</span>
                              <span>Livraison</span>
                            </div>
                          )}
                          {plug.services?.postal?.enabled && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              fontSize: '12px',
                              color: '#ffffff'
                            }}>
                              <span>📍</span>
                              <span>Postal</span>
                            </div>
                          )}
                          {plug.services?.meetup?.enabled && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              fontSize: '12px',
                              color: '#ffffff'
                            }}>
                              <span>💰</span>
                              <span>Meetup</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Likes et badge position VIP */}
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-end',
                        gap: '4px'
                      }}>
                        {getPositionBadge(index) && (
                          <span style={{ fontSize: '20px' }}>{getPositionBadge(index)}</span>
                        )}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px'
                        }}>
                          <span style={{ fontSize: '16px' }}>👍</span>
                          <span style={{ 
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#FFD700'
                          }}>
                            {plug.likes || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {vipPlugs.length > itemsPerPage && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  marginTop: '32px'
                }}>
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