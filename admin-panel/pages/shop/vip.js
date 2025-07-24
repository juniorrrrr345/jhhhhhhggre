import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { simpleApi as api } from '../../lib/api-simple'
import { getProxiedImageUrl } from '../../lib/imageUtils'
import toast from 'react-hot-toast'
import Pagination from '../../components/Pagination'
import ShopCard from '../../components/ShopCard'

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
    
    // ========== SYNC AUTOMATIQUE AVEC LIKES BOT ==========
    const syncInterval = setInterval(() => {
      console.log('🔄 VIP - Synchronisation automatique des likes...')
      fetchPlugs()
    }, 30000)
    
    return () => clearInterval(syncInterval)
  }, [])

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
        setConfig(data)
      }
    } catch (error) {
      console.error('❌ Erreur chargement config VIP:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchPlugs = async () => {
    try {
      setLoading(true)
      const data = await api.getPublicPlugs({ limit: 100 })

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
        backgroundImage: config?.boutique?.backgroundImage ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("${config.boutique.backgroundImage}")` : 'none',
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
            color: '#ffffff',
            letterSpacing: '2px'
          }}>
            {config?.boutique?.vipTitle || config?.boutique?.name || 'VIP PLUGS FINDER'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ color: '#ffffff', fontSize: '14px' }}>
              {config?.boutique?.vipSubtitle || ''}
            </span>
            <span style={{ 
              backgroundColor: '#007AFF', 
              color: '#ffffff', 
              padding: '4px 8px', 
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {config?.boutique?.vipBlueText || 'VIP'}
            </span>
          </div>
        </div>



        {/* Main Content */}
        <main style={{ padding: '20px', paddingBottom: '90px' }}>
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
                  <ShopCard key={plug._id || index} plug={plug} index={index} />
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

              {/* Texte final */}
              {config?.boutique?.vipFinalText && (
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
                    {config.boutique.vipFinalText}
                  </p>
                </div>
              )}
            </>
          )}
        </main>

        {/* Navigation en bas - Style uniforme */}
        <nav style={{ 
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          backgroundColor: '#1a1a1a',
          padding: '12px 20px',
          borderTop: '1px solid #2a2a2a',
          zIndex: 1000
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            alignItems: 'center',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <Link href="/shop" style={{ 
              color: '#8e8e93', 
              textDecoration: 'none',
              fontSize: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ fontSize: '20px' }}>🏠</span>
              Boutiques
            </Link>
            <Link href="/shop/search" style={{ 
              color: '#8e8e93', 
              textDecoration: 'none',
              fontSize: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ fontSize: '20px' }}>🔍</span>
              Rechercher
            </Link>
            <Link href="/shop/vip" style={{ 
              color: '#007AFF', 
              textDecoration: 'none',
              fontSize: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ fontSize: '20px' }}>👑</span>
              VIP
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