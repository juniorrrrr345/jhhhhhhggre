import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { api } from '../../lib/api'
import { getProxiedImageUrl } from '../../lib/imageUtils'
import toast from 'react-hot-toast'
import Pagination from '../../components/Pagination'

export default function ShopHome() {
  const [plugs, setPlugs] = useState([])
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
          fetchConfigFresh()
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
      console.log('👁️ Fenêtre focus - rafraîchissement des données')
      fetchConfigFresh()
      fetchPlugs()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page visible - vérification des mises à jour')
        fetchConfigFresh()
        fetchPlugs()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Force reload initial après un court délai
    setTimeout(() => {
      fetchConfigFresh()
    }, 1000)
    
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
        const directResponse = await fetch(`${apiBaseUrl}/api/public/config?t=${timestamp}&force=true`, {
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
          console.log('✅ Config direct:', {
            interface: !!data.interface,
            title: data.interface?.title
          })
          
          // ⚠️ CORRECTION: Créer la section interface si elle manque
          if (!data.interface) {
            console.log('⚠️ Section interface manquante sur serveur distant')
            data.interface = {
              title: 'PLUGS FINDER',
              tagline1: 'JUSTE UNE',
              taglineHighlight: 'MINI-APP TELEGRAM',
              tagline2: 'CHILL',
              backgroundImage: ''
            }
          }
        } else {
          throw new Error(`Direct config failed: HTTP ${directResponse.status}`)
        }
      } catch (directError) {
        console.log('❌ Config directe échouée:', directError.message)
        
        try {
          const proxyResponse = await fetch(`/api/proxy?endpoint=/api/public/config&t=${timestamp}&force=true`, {
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
          console.log('✅ Config proxy:', {
            interface: !!data.interface,
            title: data.interface?.title
          })
          
          // ⚠️ CORRECTION: Créer la section interface si elle manque (proxy)
          if (!data.interface) {
            console.log('⚠️ Section interface manquante via proxy - création fallback')
            data.interface = {
              title: 'PLUGS FINDER',
              tagline1: 'JUSTE UNE',
              taglineHighlight: 'MINI-APP TELEGRAM',
              tagline2: 'CHILL',
              backgroundImage: ''
            }
          }
        } catch (proxyError) {
          console.log('❌ Config proxy échouée:', proxyError.message)
          throw proxyError
        }
      }

      setConfig(data)
      console.log('🎨 Configuration interface mise à jour:', {
        title: data.interface?.title,
        tagline1: data.interface?.tagline1,
        backgroundImage: !!data.interface?.backgroundImage
      })
    } catch (error) {
      console.error('❌ Erreur chargement config:', error)
      toast.error('Erreur de connexion')
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchConfigFresh = async () => {
    try {
      console.log('🔄 Rechargement forcé de la configuration...')
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const timestamp = Date.now()
      
      let data
      try {
        // Force un reload total avec headers anti-cache
        const directResponse = await fetch(`${apiBaseUrl}/api/public/config?t=${timestamp}&bust=${Math.random()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Force-Refresh': 'true'
          },
          cache: 'no-store'
        })
        
        if (directResponse.ok) {
          data = await directResponse.json()
          console.log('✅ Config fresh direct:', {
            interface: !!data.interface,
            title: data.interface?.title,
            timestamp: timestamp
          })
          
          // ⚠️ CORRECTION: Créer la section interface si elle manque
          if (!data.interface) {
            console.log('⚠️ Section interface manquante sur serveur distant - création fallback')
            data.interface = {
              title: 'PLUGS FINDER',
              tagline1: 'JUSTE UNE',
              taglineHighlight: 'MINI-APP TELEGRAM',
              tagline2: 'CHILL',
              backgroundImage: ''
            }
          }
        } else {
          throw new Error(`Fresh config failed: HTTP ${directResponse.status}`)
        }
      } catch (directError) {
        console.log('❌ Config fresh directe échouée:', directError.message)
        
        try {
          const proxyResponse = await fetch(`/api/proxy?endpoint=/api/public/config&t=${timestamp}&bust=${Math.random()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'X-Force-Refresh': 'true'
            },
            cache: 'no-store'
          })
          
          if (!proxyResponse.ok) {
            throw new Error(`Fresh config proxy failed: HTTP ${proxyResponse.status}`)
          }
          
          data = await proxyResponse.json()
          console.log('✅ Config fresh proxy:', {
            interface: !!data.interface,
            title: data.interface?.title,
            timestamp: timestamp
          })
          
          // ⚠️ CORRECTION: Créer la section interface si elle manque (proxy fresh)
          if (!data.interface) {
            console.log('⚠️ Section interface manquante via proxy fresh - création fallback')
            data.interface = {
              title: 'PLUGS FINDER',
              tagline1: 'JUSTE UNE',
              taglineHighlight: 'MINI-APP TELEGRAM',
              tagline2: 'CHILL',
              backgroundImage: ''
            }
          }
        } catch (proxyError) {
          console.log('❌ Config fresh proxy échouée, fallback vers config normale')
          await fetchConfig()
          return
        }
      }

      setConfig(data)
      console.log('🎨 Configuration interface FRESH mise à jour:', {
        title: data.interface?.title,
        tagline1: data.interface?.tagline1,
        taglineHighlight: data.interface?.taglineHighlight,
        tagline2: data.interface?.tagline2,
        backgroundImage: !!data.interface?.backgroundImage,
        timestamp: timestamp
      })
    } catch (error) {
      console.error('❌ Erreur chargement config fresh:', error)
      // Fallback vers config normale
      await fetchConfig()
    }
  }

  const fetchPlugs = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const timestamp = new Date().getTime()
      
      let data
      try {
        const directResponse = await fetch(`${apiBaseUrl}/api/public/plugs?limit=50&t=${timestamp}`, {
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
          console.log('✅ API directe réussie:', data)
        } else {
          throw new Error(`Direct plugs failed: HTTP ${directResponse.status}`)
        }
      } catch (directError) {
        console.log('❌ Plugs directs échoués:', directError.message)
        
        try {
          const proxyResponse = await fetch(`/api/proxy?endpoint=/api/public/plugs&limit=50&t=${new Date().getTime()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          })
          
          if (!proxyResponse.ok) {
            throw new Error(`Plugs proxy failed: HTTP ${proxyResponse.status}`)
          }
          
          data = await proxyResponse.json()
          console.log('✅ Proxy réussi:', data)
        } catch (proxyError) {
          console.log('❌ Plugs proxy échoués:', proxyError.message)
          throw proxyError
        }
      }

      let plugsArray = []
      if (data && Array.isArray(data.plugs)) {
        plugsArray = data.plugs
      } else if (Array.isArray(data)) {
        plugsArray = data
      } else {
        console.error('❌ Structure de données inattendue:', data)
        plugsArray = []
      }

      const sortedPlugs = plugsArray.sort((a, b) => {
        if (a.isVip && !b.isVip) return -1
        if (!a.isVip && b.isVip) return 1
        return (b.likes || 0) - (a.likes || 0)
      })

      console.log('🔌 Plugs chargés:', sortedPlugs.length, 'boutiques')
      setPlugs(sortedPlugs)
    } catch (error) {
      console.error('❌ Erreur chargement plugs:', error)
      setPlugs([])
    } finally {
      setLoading(false)
    }
  }

  const currentPlugs = plugs.slice(
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
            <p style={{ color: '#ffffff', fontWeight: '500' }}>Chargement de la boutique...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{config?.boutique?.name || 'PlugsFinder Bot'}</title>
        <meta name="description" content="Découvrez notre sélection de boutiques premium avec livraison et services disponibles." />
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
        {/* Header Titre Principal */}
        <div style={{ 
          backgroundColor: '#000000',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            margin: '0 0 8px 0',
            color: '#ffffff',
            letterSpacing: '2px'
          }}>
            {config?.interface?.title || 'PLUGS FINDER'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ color: '#ffffff', fontSize: '14px' }}>
              {config?.interface?.tagline1 || 'JUSTE UNE'}
            </span>
            <span style={{ 
              backgroundColor: '#007AFF', 
              color: '#ffffff', 
              padding: '4px 8px', 
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {config?.interface?.taglineHighlight || 'MINI-APP TELEGRAM'}
            </span>
            <span style={{ color: '#ffffff', fontSize: '14px' }}>
              {config?.interface?.tagline2 || 'CHILL'}
            </span>
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
              color: '#007AFF'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#007AFF', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px'
              }}>
                🏠
              </div>
              <span style={{ fontSize: '12px', color: '#ffffff' }}>Plugs</span>
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
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                border: '2px solid transparent',
                borderTop: '2px solid #ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: '#ffffff' }}>Chargement des boutiques...</p>
            </div>
          ) : plugs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌍</div>
              <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '500', marginBottom: '8px' }}>
                Aucune boutique disponible
              </h3>
              <p style={{ color: '#8e8e93' }}>Revenez plus tard pour découvrir nos boutiques.</p>
            </div>
          ) : (
            <>
              {/* Liste des boutiques */}
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
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2a2a2a'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
                    >
                      {/* Image/Logo */}
                      <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: '#2a2a2a',
                        flexShrink: 0
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
                          🏪
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
                            color: '#ffffff',
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

                      {/* Likes et badge position */}
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
                            color: '#ffffff'
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
              {plugs.length > itemsPerPage && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  marginTop: '32px'
                }}>
                  <Pagination
                    currentPage={currentPage}
                    totalItems={plugs.length}
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