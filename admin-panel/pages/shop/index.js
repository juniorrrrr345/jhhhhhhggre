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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  useEffect(() => {
    fetchConfig()
    fetchPlugs()
    
    // Debug logs
    console.log('🔄 Boutique initialisée')
  }, [])

  // Debug: afficher la config quand elle change
  useEffect(() => {
    if (config) {
      console.log('📊 Config reçue:', {
        boutique: config.boutique,
        hasName: !!config.boutique?.name,
        hasSubtitle: !!config.boutique?.subtitle
      })
    }
  }, [config])

  const fetchConfig = async () => {
    try {
      const timestamp = Date.now()
      const response = await fetch(`/api/proxy?endpoint=/api/public/config&t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Config boutique chargée:', {
          name: data.boutique?.name,
          subtitle: data.boutique?.subtitle
        })
        setConfig(data)
      } else {
        console.error('❌ Erreur API proxy:', response.status)
      }
    } catch (error) {
      console.error('❌ Erreur chargement config:', error)
    }
  }

  const fetchPlugs = async () => {
    try {
      console.log('🔍 Chargement boutiques via API directe...')
      
      let data = null
      
      // 1. Essayer l'API directe du bot (comme VIP et search)
      try {
        const directResponse = await fetch('https://jhhhhhhggre.onrender.com/api/plugs?limit=50', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer JuniorAdmon123',
            'Content-Type': 'application/json'
          }
        })
        
        if (directResponse.ok) {
          data = await directResponse.json()
          console.log('✅ API directe réussie:', data)
        } else {
          throw new Error(`Direct failed: HTTP ${directResponse.status}`)
        }
      } catch (directError) {
        console.log('❌ API directe échoué:', directError.message)
        
        // 2. Fallback avec proxy si direct échoue
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL
          const proxyResponse = await fetch(`${apiBaseUrl}/api/proxy`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              endpoint: '/api/plugs',
              method: 'GET',
              params: { limit: 50 }
            })
          })
          
          if (proxyResponse.ok) {
            data = await proxyResponse.json()
            console.log('✅ Proxy réussi:', data)
          } else {
            throw new Error(`Proxy failed: HTTP ${proxyResponse.status}`)
          }
        } catch (proxyError) {
          console.log('❌ Proxy échoué:', proxyError.message)
          throw proxyError
        }
      }
      
      // Traitement des données
      let plugsArray = []
      if (data && Array.isArray(data.plugs)) {
        plugsArray = data.plugs
      } else if (Array.isArray(data)) {
        plugsArray = data
      }

      const sortedPlugs = plugsArray.sort((a, b) => {
        if (a.isVip && !b.isVip) return -1
        if (!a.isVip && b.isVip) return 1
        return (b.likes || 0) - (a.likes || 0)
      })

      console.log(`🎉 ${sortedPlugs.length} boutiques chargées !`)
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

  if (loading) {
    return (
      <>
        <Head>
          <title>PlugsFinder Bot</title>
        </Head>
        <div style={{ 
          backgroundColor: '#000000', 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '3px solid #007AFF',
              borderTop: '3px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p>Chargement...</p>
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
        backgroundImage: config?.boutique?.backgroundImage ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("${config.boutique.backgroundImage}")` : 'none',
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
            {config?.boutique?.name || 'PlugsFinder Bot'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ color: '#ffffff', fontSize: '14px' }}>
              {config?.boutique?.subtitle || ''}
            </span>
            <span style={{ 
              backgroundColor: '#007AFF', 
              color: '#ffffff', 
              padding: '4px 8px', 
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {config?.boutique?.taglineHighlight || 'MINI-APP TELEGRAM'}
            </span>
            <span style={{ color: '#ffffff', fontSize: '14px' }}>
              {config?.boutique?.tagline2 || 'CHILL'}
            </span>
          </div>
        </div>



        {/* Contenu Principal */}
        <div style={{ padding: '20px', paddingBottom: '120px' }}>
          {plugs.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: '#8e8e93'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏪</div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Aucune boutique disponible</h3>
              <p style={{ fontSize: '14px' }}>Revenez bientôt pour découvrir nos partenaires !</p>
            </div>
          ) : (
            <>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '8px',
                marginBottom: '20px'
              }}>
                {currentPlugs.map((plug, index) => (
                  <Link 
                    key={plug._id} 
                    href={`/shop/${plug._id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      backgroundColor: '#1a1a1a',
                      borderRadius: '8px',
                      padding: '8px',
                      border: '1px solid #2a2a2a',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      position: 'relative'
                    }}>
                      {/* Badge Position */}
                      {getPositionBadge(index) && (
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          left: '4px',
                          fontSize: '14px',
                          zIndex: 2
                        }}>
                          {getPositionBadge(index)}
                        </div>
                      )}

                      {/* Badge VIP */}
                      {plug.isVip && (
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          backgroundColor: '#FFD700',
                          color: '#000000',
                          padding: '2px 4px',
                          borderRadius: '6px',
                          fontSize: '8px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          ⭐
                        </div>
                      )}

                      {/* Image */}
                      <div style={{
                        width: '100%',
                        height: '80px',
                        backgroundColor: '#2a2a2a',
                        borderRadius: '6px',
                        marginBottom: '6px',
                        backgroundImage: plug.image ? `url("${getProxiedImageUrl(plug.image)}")` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {!plug.image && (
                          <span style={{ fontSize: '18px' }}>🏪</span>
                        )}
                      </div>

                      {/* Informations */}
                      <h3 style={{
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        margin: '0 0 4px 0',
                        lineHeight: '1.2',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {plug.name}
                      </h3>

                      <p style={{
                        color: '#8e8e93',
                        fontSize: '10px',
                        margin: '0 0 6px 0',
                        lineHeight: '1.2',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {plug.description}
                      </p>

                      {/* Services */}
                      <div style={{ 
                        display: 'flex', 
                        gap: '2px', 
                        marginBottom: '6px',
                        flexWrap: 'wrap'
                      }}>
                        {plug.services?.delivery?.enabled && (
                          <span style={{
                            backgroundColor: '#007AFF',
                            color: '#ffffff',
                            padding: '1px 3px',
                            borderRadius: '4px',
                            fontSize: '8px'
                          }}>
                            🚚
                          </span>
                        )}
                        {plug.services?.postal?.enabled && (
                          <span style={{
                            backgroundColor: '#34C759',
                            color: '#ffffff',
                            padding: '1px 3px',
                            borderRadius: '4px',
                            fontSize: '8px'
                          }}>
                            ✈️
                          </span>
                        )}
                        {plug.services?.meetup?.enabled && (
                          <span style={{
                            backgroundColor: '#FF9500',
                            color: '#ffffff',
                            padding: '1px 3px',
                            borderRadius: '4px',
                            fontSize: '8px'
                          }}>
                            🏠
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#8e8e93',
                          fontSize: '12px'
                        }}>
                          ❤️ {plug.likes || 0}
                        </div>
                        <div style={{
                          color: '#8e8e93',
                          fontSize: '12px'
                        }}>
                          {plug.countries?.join(', ') || '🌍'}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(plugs.length / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>

        {/* Navigation en bas */}
        <nav style={{ 
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          backgroundColor: '#000000',
          padding: '12px 0',
          borderTop: '1px solid #2a2a2a',
          zIndex: 1000
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
            maxWidth: '100%'
          }}>
            <Link href="/shop" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textDecoration: 'none',
              color: '#007AFF',
              flex: 1
            }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                backgroundColor: '#007AFF', 
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px',
                fontSize: '24px'
              }}>
                🏠
              </div>
              <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: '600' }}>Accueil</span>
            </Link>
            <Link href="/shop/search" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textDecoration: 'none',
              color: '#8e8e93',
              flex: 1
            }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                backgroundColor: '#1a1a1a', 
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px',
                fontSize: '24px',
                border: '1px solid #2a2a2a'
              }}>
                🔍
              </div>
              <span style={{ fontSize: '14px', color: '#8e8e93', fontWeight: '600' }}>Recherche</span>
            </Link>
            <Link href="/shop/vip" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textDecoration: 'none',
              color: '#8e8e93',
              flex: 1
            }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                backgroundColor: '#1a1a1a', 
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px',
                fontSize: '24px',
                border: '1px solid #2a2a2a'
              }}>
                ⭐
              </div>
              <span style={{ fontSize: '14px', color: '#8e8e93', fontWeight: '600' }}>VIP</span>
            </Link>
          </div>
        </nav>
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