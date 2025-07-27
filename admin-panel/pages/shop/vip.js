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

export default function ShopVIP() {
  const [vipPlugs, setVipPlugs] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentLanguage, setCurrentLanguage] = useState('fr')
  const { t } = useTranslation(currentLanguage)
  const itemsPerPage = 20

  useEffect(() => {
    // Initialiser la langue depuis localStorage
    if (typeof window !== 'undefined') {
      setCurrentLanguage(getCurrentLanguage())
    }
    
    fetchConfig()
    fetchPlugs()
    
    // Plus de refresh automatique - utiliser le bouton "Actualiser" si besoin
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
      
      // APPEL DIRECT au bot pour récupérer les VRAIES boutiques VIP
      const response = await fetch('https://jhhhhhhggre.onrender.com/api/public/plugs?filter=vip&limit=100', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()

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
      console.error('Erreur chargement VIP:', error)
      // Mode offline VIP : données par défaut
      const fallbackVipPlugs = [
        {
          _id: 'fallback_vip_1',
          name: 'Boutique VIP Premium',
          description: 'Serveur temporairement indisponible',
          image: 'https://via.placeholder.com/300x200/fbbf24/000000?text=VIP',
          isActive: true,
          isVip: true,
          likes: 100,
          countries: ['France'],
          services: ['Livraison Premium'],
          departments: ['75']
        }
      ]
      setVipPlugs(fallbackVipPlugs)
      console.log('📱 Mode offline VIP: Données par défaut')
    } finally {
      setLoading(false)
    }
  }

  const currentPagePlugs = vipPlugs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(vipPlugs.length / itemsPerPage)

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
          <title>{t('loading')} VIP...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>
        <div style={{ backgroundColor: '#000000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              border: '2px solid transparent',
              borderTop: '2px solid #FFD700',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#FFD700', fontWeight: '500' }}>{t('loading')} VIP...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{t('vip')} - {config?.boutique?.name || 'FINDYOURPLUG'}</title>
        <meta name="description" content={`${t('vip_desc') || 'Boutiques VIP exclusives'}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <div style={{ 
        backgroundColor: '#000000', 
        minHeight: '100vh',
        color: '#ffffff',
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backgroundImage: config?.boutique?.backgroundImage ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("${config.boutique.backgroundImage}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        {/* Header */}
        <header style={{ 
          backgroundColor: '#000000',
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
            🎯 {t('vip')}
          </h1>
          <p style={{ 
            color: '#8e8e93', 
            fontSize: '16px',
            margin: '0',
            fontWeight: '400'
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
                    {currentPagePlugs.map((plug) => (
                      <ShopCard 
                        key={plug._id} 
                        plug={plug} 
                        config={config}
                        currentLanguage={currentLanguage}
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