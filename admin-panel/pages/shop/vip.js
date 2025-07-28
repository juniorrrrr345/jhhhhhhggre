import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { simpleApi as api } from '../../lib/api-simple'
import { getProxiedImageUrl } from '../../lib/imageUtils'
import toast from 'react-hot-toast'
import Pagination from '../../components/Pagination'
import ShopCard from '../../components/ShopCard'
import LanguageSelector, { useTranslation, getCurrentLanguage } from '../../components/LanguageSelector'
import ShopNavigation from '../../components/ShopNavigation'
import { useLanguage } from '../../hooks/useLanguage'

export default function ShopVIP() {
  const [vipPlugs, setVipPlugs] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const currentLanguage = useLanguage()
  const [, setCurrentLanguage] = useState('fr') // Gardé pour la compatibilité
  const [shopSocialMedias, setShopSocialMedias] = useState([])
  const [likesSync, setLikesSync] = useState({}) // Pour synchroniser les likes en temps réel
  const { t } = useTranslation(currentLanguage)
  const itemsPerPage = 20

  useEffect(() => {
    // Initialiser la langue depuis localStorage
    if (typeof window !== 'undefined') {
      setCurrentLanguage(getCurrentLanguage())
    }
    
    fetchConfig()
    fetchPlugs()
    
    // SYNC TEMPS RÉEL avec panel admin
    const handleForceRefresh = (event) => {
      console.log('🚀 Signal panel admin reçu VIP - FORCE refresh boutiques...');
      console.log('📊 Détails:', event.detail);
      setTimeout(() => {
        fetchPlugs();
        fetchConfig();
      }, 200);
    };
    
    window.addEventListener('forceRefreshMiniApp', handleForceRefresh);
    
    // Cleanup
    return () => {
      window.removeEventListener('forceRefreshMiniApp', handleForceRefresh);
    };
  }, [])

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage)
    // Re-fetch data when language changes
    fetchPlugs()
  }

  useEffect(() => {
    if (currentLanguage) {
      fetchPlugs()
    }
  }, [currentLanguage])

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
      console.error('Erreur chargement config VIP:', error)
      // Config par défaut pour VIP
      setConfig({
        boutique: { name: 'FINDYOURPLUG VIP', subtitle: 'Mode Offline' }
      })
      console.log('📱 Mode offline VIP config: Configuration par défaut')
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchPlugs = async () => {
    try {
      setLoading(true)
      console.log('👑 SIMPLE - Chargement direct API locale (VIP)...')
      
      // STRATÉGIE SIMPLE : API LOCALE EN PREMIER
      const response = await fetch('/api/local-plugs', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error(`API locale failed: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ SIMPLE - Données API locale reçues (VIP):', data)

      if (data && data.plugs && Array.isArray(data.plugs)) {
        // Filtrer SEULEMENT les boutiques VIP
        const vipOnly = data.plugs.filter(plug => plug.isVip === true)
        
        // Tri intelligent: par nombre de likes puis par récence
        const sortedVipPlugs = vipOnly.sort((a, b) => {
          // 1. Par likes (du plus haut au plus bas)
          if ((b.likes || 0) !== (a.likes || 0)) {
            return (b.likes || 0) - (a.likes || 0)
          }
          
          // 2. En cas d'égalité, par date de création (plus récent en premier)
          const aDate = new Date(a.createdAt || 0)
          const bDate = new Date(b.createdAt || 0)
          return bDate - aDate
        })
        
        console.log('👑 SIMPLE - Boutiques VIP filtrées et triées:', sortedVipPlugs.length, 'boutiques VIP')
        setVipPlugs(sortedVipPlugs)
        
        // Synchroniser les likes en temps réel
        const likesData = {}
        sortedVipPlugs.forEach(plug => {
          if (plug._id && plug.likes !== undefined) {
            likesData[plug._id] = plug.likes
          }
        })
        setLikesSync(likesData)
        console.log('❤️ SIMPLE - Likes VIP synchronisés:', Object.keys(likesData).length, 'boutiques')
        
        // Afficher le TOP 3 VIP pour debug
        if (sortedVipPlugs.length > 0) {
          console.log('👑 SIMPLE - TOP 3 VIP:')
          sortedVipPlugs.slice(0, 3).forEach((plug, index) => {
            const badge = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
            console.log(`${badge} ${plug.name}: ${plug.likes || 0} likes 👑VIP`)
          })
        }
      } else {
        console.log('⚠️ SIMPLE - Aucune boutique VIP trouvée')
        setVipPlugs([])
      }
      
    } catch (error) {
      console.error('Erreur chargement VIP:', error)
      setVipPlugs([])
    } finally {
      setLoading(false)
    }
  }

  const currentPagePlugs = vipPlugs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getPositionBadge = (index) => {
    const globalIndex = (currentPage - 1) * itemsPerPage + index
    if (globalIndex === 0) return '🥇'
    if (globalIndex === 1) return '🥈'
    if (globalIndex === 2) return '🥉'
    if (globalIndex < 10) return `${globalIndex + 1}⭐`
    return `${globalIndex + 1}°`
  }

  const totalPages = Math.ceil(vipPlugs.length / itemsPerPage)

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
          <title>{t('loading')} VIP...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>
        <div style={{ 
          backgroundColor: '#1a1a1a',
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), 
            url("https://i.imgur.com/iISKonz.jpeg")
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '60px', 
              height: '60px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}>
              <img 
                src="https://i.imgur.com/VwBPgtw.jpeg" 
                alt="FindYourPlug Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
            <p style={{ color: '#FFD700', fontWeight: '500' }}>{t('loading')} VIP...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
              <Head>
          <title>{t('vip')} - FindYourPlug</title>
          <meta name="description" content={`${t('vip_desc') || 'Boutiques VIP exclusives'}`} />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>

      <div style={{ 
        backgroundColor: '#1a1a1a',
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), 
          url("https://i.imgur.com/iISKonz.jpeg")
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        color: '#ffffff',
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        {/* Header */}
        <header style={{ 
          backgroundColor: 'transparent',
          padding: '20px',
          textAlign: 'center',
          borderBottom: '1px solid #2a2a2a'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{ flex: 1 }}></div>
            <LanguageSelector 
              onLanguageChange={handleLanguageChange} 
              currentLanguage={currentLanguage} 
              compact={true} 
            />
          </div>
          
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '2px'
          }}>
            👑 {t('vip')}
          </h1>
          <p style={{ 
            margin: '16px auto 0',
            padding: '12px 16px',
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '500',
            textShadow: '0 1px 3px rgba(0,0,0,0.7)',
            lineHeight: '1.5',
            maxWidth: '450px',
            whiteSpace: 'pre-line'
          }}>
            {t('vip_desc') || 'Boutiques VIP exclusives'}
          </p>
        </header>

        {/* Main Content */}
        <main style={{ padding: '20px', paddingBottom: '90px', minHeight: 'calc(100vh - 200px)' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  border: '2px solid transparent',
                  borderTop: '2px solid #FFD700',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }}></div>
                <p style={{ color: '#8e8e93' }}>{t('loading_vip') || 'Chargement des boutiques VIP'}...</p>
              </div>
            </div>
          ) : (
            <>
              {currentPagePlugs.length === 0 ? (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minHeight: '300px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '80px', marginBottom: '20px' }}>👑</div>
                  <h3 style={{ 
                    fontSize: '24px', 
                    fontWeight: '600', 
                    marginBottom: '12px',
                    color: '#FFD700'
                  }}>
                    {t('no_vip_shops') || 'Aucune boutique VIP'}
                  </h3>
                  <p style={{ 
                    color: '#8e8e93', 
                    fontSize: '16px',
                    maxWidth: '300px',
                    lineHeight: '1.5'
                  }}>
                    {t('no_vip_shops_desc') || 'Aucune boutique VIP n\'est disponible pour le moment.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Stats */}
                  <div style={{ 
                    backgroundColor: '#1a1a1a',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '20px',
                    border: '1px solid #FFD700'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: '24px', 
                          fontWeight: 'bold', 
                          color: '#FFD700',
                          marginBottom: '4px'
                        }}>
                          {vipPlugs.length}
                        </div>
                        <div style={{ 
                          fontSize: '14px', 
                          color: '#8e8e93'
                        }}>
                          {t('vip_shops_available') || 'Boutiques VIP disponibles'}
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '32px',
                        opacity: '0.8'
                      }}>
                        👑
                      </div>
                    </div>
                  </div>

                  {/* Grid des boutiques */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                                      {currentPagePlugs.map((plug, index) => (
                    <ShopCard 
                      key={plug._id} 
                      plug={plug} 
                      config={config}
                      currentLanguage={currentLanguage}
                      index={(currentPage - 1) * itemsPerPage + index}
                      likes={likesSync[plug._id] !== undefined ? likesSync[plug._id] : (plug.likes || 0)}
                      getPositionBadge={getPositionBadge}
                    />
                  ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </>
              )}
            </>
          )}
        </main>

        {/* Navigation */}
        <ShopNavigation currentLanguage={currentLanguage} currentPage="vip" />
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