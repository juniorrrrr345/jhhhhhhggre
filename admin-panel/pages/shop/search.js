import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { api } from '../../lib/api'
import { getProxiedImageUrl } from '../../lib/imageUtils'
import toast from 'react-hot-toast'
import Pagination from '../../components/Pagination'
import ShopCard from '../../components/ShopCard'

export default function ShopSearch() {
  const [plugs, setPlugs] = useState([])
  const [allPlugs, setAllPlugs] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [vipFilter, setVipFilter] = useState('')
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
      console.log('👁️ Fenêtre focus - rafraîchissement des données recherche')
      fetchConfig()
      fetchPlugs()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page recherche visible - vérification des mises à jour')
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

  useEffect(() => {
    filterPlugs()
  }, [search, countryFilter, serviceFilter, vipFilter, allPlugs])

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
        console.log('❌ Config directe échouée:', directError.message)
        
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
          console.log('❌ Config proxy échouée:', proxyError.message)
          throw proxyError
        }
      }

      setConfig(data)
    } catch (error) {
      console.error('❌ Erreur chargement config:', error)
      toast.error('Erreur de connexion')
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchPlugs = async () => {
    try {
      setLoading(true)
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const timestamp = new Date().getTime()
      
      let data
      try {
        const directResponse = await fetch(`${apiBaseUrl}/api/public/plugs?limit=100&t=${timestamp}`, {
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
          console.log('✅ API recherche directe réussie:', data)
        } else {
          throw new Error(`Direct plugs failed: HTTP ${directResponse.status}`)
        }
      } catch (directError) {
        console.log('❌ Plugs recherche directs échoués:', directError.message)
        
        try {
          const proxyResponse = await fetch(`/api/proxy?endpoint=/api/public/plugs&limit=100&t=${new Date().getTime()}`, {
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
          console.log('✅ Recherche proxy réussi:', data)
        } catch (proxyError) {
          console.log('❌ Plugs recherche proxy échoués:', proxyError.message)
          throw proxyError
        }
      }

      let plugsArray = []
      if (data && Array.isArray(data.plugs)) {
        plugsArray = data.plugs
      } else if (Array.isArray(data)) {
        plugsArray = data
      } else {
        console.error('❌ Structure de données recherche inattendue:', data)
        plugsArray = []
      }

      console.log('🔍 Plugs recherche chargés:', plugsArray.length, 'boutiques')
      setAllPlugs(plugsArray)
    } catch (error) {
      console.error('❌ Erreur chargement plugs recherche:', error)
      setAllPlugs([])
    } finally {
      setLoading(false)
    }
  }

  const filterPlugs = () => {
    let filtered = allPlugs.filter(plug => {
      const matchesSearch = search === '' || 
        plug.name.toLowerCase().includes(search.toLowerCase()) ||
        plug.description.toLowerCase().includes(search.toLowerCase())
      
      const matchesCountry = countryFilter === '' || 
        (plug.countries && plug.countries.some(country => 
          country.toLowerCase().includes(countryFilter.toLowerCase())
        ))
      
      const matchesService = serviceFilter === '' || 
        (serviceFilter === 'delivery' && plug.services?.delivery?.enabled) ||
        (serviceFilter === 'postal' && plug.services?.postal?.enabled) ||
        (serviceFilter === 'meetup' && plug.services?.meetup?.enabled)
      
      const matchesVip = vipFilter === '' || 
        (vipFilter === 'vip' && plug.isVip) ||
        (vipFilter === 'standard' && !plug.isVip)
      
      return matchesSearch && matchesCountry && matchesService && matchesVip
    })

    filtered = filtered.sort((a, b) => {
      if (a.isVip && !b.isVip) return -1
      if (!a.isVip && b.isVip) return 1
      return (b.likes || 0) - (a.likes || 0)
    })

    setPlugs(filtered)
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setSearch('')
    setCountryFilter('')
    setServiceFilter('')
    setVipFilter('')
  }

  const uniqueCountries = [...new Set(allPlugs.flatMap(plug => plug.countries || []))].sort()

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
            <p style={{ color: '#ffffff', fontWeight: '500' }}>Chargement de la recherche...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Recherche - {config?.boutique?.name || 'PlugsFinder Bot'}</title>
        <meta name="description" content="Recherchez vos boutiques préférées par nom, pays ou service." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <div style={{ 
        backgroundColor: '#000000', 
        minHeight: '100vh',
        color: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundImage: config?.boutique?.backgroundImage ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("${config.boutique.backgroundImage}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        {/* Header Titre Principal Recherche */}
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
            {config?.boutique?.searchTitle || config?.boutique?.name || 'RECHERCHE'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ color: '#ffffff', fontSize: '14px' }}>
              {config?.boutique?.searchSubtitle || ''}
            </span>
            <span style={{ 
              backgroundColor: '#007AFF', 
              color: '#ffffff', 
              padding: '4px 8px', 
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {config?.boutique?.searchBlueText || 'RECHERCHE'}
            </span>
          </div>
        </div>



        {/* Section Filtres de recherche */}
        <div style={{ 
          backgroundColor: '#1a1a1a',
          padding: '20px',
          margin: '20px',
          borderRadius: '12px',
          border: '1px solid #2a2a2a'
        }}>
          {/* Barre de recherche principale */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Rechercher une boutique..."
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          </div>

          {/* Filtres avancés */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '12px',
            marginBottom: '16px'
          }}>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px'
              }}
            >
              <option value="" style={{ color: '#ffffff', backgroundColor: '#2a2a2a' }}>🌍 Tous pays</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country} style={{ color: '#ffffff', backgroundColor: '#2a2a2a' }}>{country}</option>
              ))}
            </select>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px'
              }}
            >
              <option value="" style={{ color: '#ffffff', backgroundColor: '#2a2a2a' }}>🚀 Tous services</option>
              <option value="delivery" style={{ color: '#ffffff', backgroundColor: '#2a2a2a' }}>📦 Livraison</option>
              <option value="postal" style={{ color: '#ffffff', backgroundColor: '#2a2a2a' }}>📍 Postal</option>
              <option value="meetup" style={{ color: '#ffffff', backgroundColor: '#2a2a2a' }}>💰 Meetup</option>
            </select>

            <select
              value={vipFilter}
              onChange={(e) => setVipFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px'
              }}
            >
              <option value="" style={{ color: '#ffffff', backgroundColor: '#2a2a2a' }}>⭐ Tous types</option>
              <option value="vip" style={{ color: '#ffffff', backgroundColor: '#2a2a2a' }}>👑 VIP uniquement</option>
              <option value="standard" style={{ color: '#ffffff', backgroundColor: '#2a2a2a' }}>🔹 Standard uniquement</option>
            </select>
          </div>

          {/* Bouton reset */}
          <button
            onClick={resetFilters}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007AFF',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🔄 Réinitialiser
          </button>
        </div>

        {/* Résultats */}
        <main style={{ padding: '0 20px 90px' }}>
          {/* Compteur de résultats */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '20px',
            color: '#8e8e93',
            fontSize: '14px'
          }}>
            {loading ? 'Recherche en cours...' : `${plugs.length} boutique(s) trouvée(s)`}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                border: '2px solid transparent',
                borderTop: '2px solid #007AFF',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: '#ffffff' }}>Recherche en cours...</p>
            </div>
          ) : plugs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '500', marginBottom: '8px' }}>
                Aucune boutique trouvée
              </h3>
              <p style={{ color: '#8e8e93', marginBottom: '24px' }}>Essayez de modifier vos critères de recherche.</p>
            </div>
          ) : (
            <>
              {/* Liste des résultats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {currentPlugs.map((plug, index) => (
                  <ShopCard key={plug._id || index} plug={plug} index={index} layout="list" />
                ))}
                    <div style={{ 
                      backgroundColor: '#1a1a1a',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      border: plug.isVip ? '1px solid #FFD700' : 'none',
                      borderRadius: '8px',
                      marginBottom: '8px'
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
                        flexShrink: 0,
                        border: plug.isVip ? '2px solid #FFD700' : 'none',
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
                          {plug.isVip ? '👑' : '🏪'}
                        </div>
                        {/* Badge VIP si applicable */}
                        {plug.isVip && (
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
                        )}
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
                            color: plug.isVip ? '#FFD700' : '#ffffff',
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
                            color: plug.isVip ? '#FFD700' : '#ffffff'
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

              {/* Texte final */}
              {config?.boutique?.searchFinalText && (
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '40px',
                  padding: '20px',
                  backgroundColor: '#1a1a1a',
                  borderRadius: '12px',
                  border: '1px solid #2a2a2a'
                }}>
                  <p style={{ 
                    color: '#ffffff', 
                    fontSize: '16px', 
                    margin: '0',
                    lineHeight: '1.5'
                  }}>
                    {config.boutique.searchFinalText}
                  </p>
                </div>
              )}
            </>
          )}
        </main>

        {/* Navigation en bas */}
        <nav style={{ 
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          backgroundColor: '#000000',
          padding: '12px 20px',
          borderTop: '1px solid #2a2a2a',
          zIndex: 1000
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '40px'
          }}>
            <Link href="/shop" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textDecoration: 'none',
              color: '#8e8e93'
            }}>
              <div style={{ 
                width: '45px', 
                height: '45px', 
                backgroundColor: 'transparent', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '6px',
                fontSize: '22px'
              }}>
                🏠
              </div>
              <span style={{ fontSize: '13px', color: '#8e8e93', fontWeight: '500' }}>Accueil</span>
            </Link>
            <Link href="/shop/search" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textDecoration: 'none',
              color: '#007AFF'
            }}>
              <div style={{ 
                width: '45px', 
                height: '45px', 
                backgroundColor: '#007AFF', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '6px',
                fontSize: '22px'
              }}>
                🔍
              </div>
              <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '500' }}>Recherche</span>
            </Link>
            <Link href="/shop/vip" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textDecoration: 'none',
              color: '#8e8e93'
            }}>
              <div style={{ 
                width: '45px', 
                height: '45px', 
                backgroundColor: 'transparent', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '6px',
                fontSize: '22px'
              }}>
                ⭐
              </div>
              <span style={{ fontSize: '13px', color: '#8e8e93', fontWeight: '500' }}>VIP</span>
            </Link>
          </div>
        </nav>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Force white text for select options */
        select option {
          color: #ffffff !important;
          background-color: #2a2a2a !important;
        }
        
        select {
          color: #ffffff !important;
        }
      `}</style>
    </>
  )
}