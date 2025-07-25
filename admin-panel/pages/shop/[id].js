import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { simpleApi as api } from '../../lib/api-simple'
import { getProxiedImageUrl } from '../../lib/imageUtils'
import toast from 'react-hot-toast'
import LanguageSelector, { useTranslation, getCurrentLanguage } from '../../components/LanguageSelector'
import ShopNavigation from '../../components/ShopNavigation'

export default function ShopPlugDetail() {
  const router = useRouter()
  const { id } = router.query
  const [plug, setPlug] = useState(null)
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [likes, setLikes] = useState(0)
  const [isVoting, setIsVoting] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState('fr')
  const { t } = useTranslation(currentLanguage)

  useEffect(() => {
    // Initialiser la langue depuis localStorage
    if (typeof window !== 'undefined') {
      setCurrentLanguage(getCurrentLanguage())
    }
  }, [])

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage)
  }

  useEffect(() => {
    if (router.isReady && id) {
      const loadData = async () => {
        try {
          setInitialLoading(true)
          await Promise.all([fetchConfig(), fetchPlug(id)])
        } catch (error) {
          console.error('❌ Erreur chargement données:', error)
        } finally {
          setInitialLoading(false)
        }
      }
      loadData()
    }
  }, [router.isReady, id])

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
        // Méthode 1: Essayer l'API directe avec tous les plugs
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
          console.log('✅ API détail directe réussie, recherche plug:', id)
        } else {
          throw new Error(`Direct API failed: HTTP ${directResponse.status}`)
        }
      } catch (directError) {
        console.log('❌ API directe échouée:', directError.message)
        
        try {
          // Méthode 2: Fallback via proxy
          const proxyResponse = await fetch(`/api/proxy?endpoint=/api/public/plugs&limit=1000&t=${new Date().getTime()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          })
          
          if (proxyResponse.ok) {
            data = await proxyResponse.json()
            console.log('✅ Plug détail via proxy réussi')
          } else {
            throw new Error(`Proxy failed: HTTP ${proxyResponse.status}`)
          }
        } catch (proxyError) {
          console.log('❌ Proxy échoué:', proxyError.message)
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
        
        // Vérifier que le plug a les propriétés nécessaires
        if (!foundPlug.name) {
          console.warn('⚠️ Plug sans nom:', foundPlug)
        }
        if (!foundPlug.services) {
          console.warn('⚠️ Plug sans services:', foundPlug.name)
          foundPlug.services = {
            delivery: { enabled: false },
            postal: { enabled: false },
            meetup: { enabled: false }
          }
        }
        
        setPlug(foundPlug)
        setLikes(foundPlug.likes || 0)
      } else {
        console.log('❌ Plug non trouvé avec ID:', id)
        console.log('📋 Plugs disponibles:', plugsArray.map(p => ({ id: p._id, name: p.name })))
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

  const handleVote = async () => {
    if (isVoting || !plug) return
    
    setIsVoting(true)
    
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plugId: plug._id,
          userId: 12345, // ID de test pour le panel admin
          action: 'like'
        })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setLikes(result.likes)
        toast.success(`${t('vote_added')} ! ${result.plugName} ${t('has_now')} ${result.likes} ${t('likes')}`)
        console.log(`✅ Vote réussi: ${result.plugName} - ${result.likes} likes`)
      } else {
        toast.error(result.error || t('error_voting'))
        console.error('❌ Erreur vote:', result.error)
      }
    } catch (error) {
      toast.error(t('error_connection'))
      console.error('❌ Erreur lors du vote:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const translateService = (serviceKey) => {
    const serviceMap = {
      'delivery': t('delivery'),
      'postal': t('postal'), 
      'meetup': t('meetup')
    }
    return serviceMap[serviceKey] || serviceKey
  }

  const getVotesText = () => {
    return t('votes') || 'Votes'
  }

  if (initialLoading) {
    return (
      <>
        <Head>
          <title>{t('loading') || 'Chargement'}...</title>
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
            <p style={{ color: '#ffffff', fontWeight: '500' }}>{t('loading_shop') || 'Chargement de la boutique'}...</p>
          </div>
        </div>
      </>
    )
  }

  if (notFound) {
    return (
      <>
        <Head>
          <title>{t('shop_not_found') || 'Boutique non trouvée'}</title>
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
              {t('shop_not_found') || 'Boutique non trouvée'}
            </h3>
            <p style={{ color: '#8e8e93', marginBottom: '32px', fontSize: '16px' }}>
              {t('shop_not_found_desc') || 'Cette boutique n\'existe pas ou a été supprimée.'}
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
              ← {t('back_to_shops') || 'Retour aux boutiques'}
            </Link>
          </div>
        </div>
      </>
    )
  }

  // Protection supplémentaire pour s'assurer que plug est défini
  if (!plug) {
    return (
      <>
        <Head>
          <title>{t('loading') || 'Chargement'}...</title>
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
            <p style={{ color: '#ffffff', fontWeight: '500' }}>{t('loading_shop') || 'Chargement de la boutique'}...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{plug?.name || 'Boutique'} - {config?.boutique?.name || 'FINDYOURPLUG'}</title>
        <meta name="description" content={plug?.description || ''} />
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
        {/* Header */}
        <div style={{ 
          backgroundColor: '#000000',
          padding: '20px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <button 
              onClick={() => router.back()} 
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#333333',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                minWidth: 'fit-content'
              }}
            >
              ← {t('back') || 'Retour'}
            </button>
            
            <LanguageSelector 
              onLanguageChange={handleLanguageChange} 
              currentLanguage={currentLanguage} 
              compact={true} 
            />
            
            {plug && plug.isVip && (
              <div style={{
                backgroundColor: '#FFD700',
                color: '#000000',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap'
              }}>
                ⭐ VIP
              </div>
            )}
          </div>
          
          {plug && (
            <>
              <h1 style={{ 
                fontSize: 'clamp(24px, 5vw, 32px)', 
                fontWeight: 'bold', 
                margin: '0 0 8px 0',
                color: '#ffffff',
                letterSpacing: '1px',
                wordBreak: 'break-word',
                lineHeight: '1.2'
              }}>
                {plug.name}
              </h1>
              
              {plug.description && (
                <p style={{ 
                  color: '#8e8e93', 
                  fontSize: '14px',
                  margin: '0',
                  lineHeight: '1.4',
                  maxWidth: '600px',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}>
                  {plug.description}
                </p>
              )}
            </>
          )}
        </div>

        {/* Main Content */}
        <main style={{ padding: '20px', paddingBottom: '90px', maxWidth: '800px', margin: '0 auto' }}>
          {plug && (
            <>
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
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `
                        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px;">
                          ${plug.isVip ? '👑' : '🏪'}
                        </div>
                      `;
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
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    👑 VIP
                  </div>
                )}
              </div>

              {/* Statistiques principales */}
              <div style={{ 
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '16px',
                border: plug.isVip ? '2px solid #FFD700' : '1px solid #2a2a2a'
              }}>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                  gap: '16px',
                  textAlign: 'center'
                }}>
                  {/* Votes */}
                  <div style={{ padding: '8px' }}>
                    <button
                      onClick={handleVote}
                      disabled={isVoting}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: isVoting ? 'not-allowed' : 'pointer',
                        fontSize: '24px',
                        marginBottom: '8px',
                        padding: '8px',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                        color: '#ffffff',
                        width: '100%'
                      }}
                      onMouseEnter={(e) => {
                        if (!isVoting) e.target.style.backgroundColor = '#333333'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent'
                      }}
                    >
                      {isVoting ? '⏳' : '👍'}
                    </button>
                    <div style={{ 
                      fontSize: 'clamp(18px, 4vw, 24px)', 
                      fontWeight: 'bold', 
                      color: plug.isVip ? '#FFD700' : '#ffffff',
                      marginBottom: '4px'
                    }}>
                      {likes}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#8e8e93',
                      wordBreak: 'break-word'
                    }}>
                      {getVotesText()}
                    </div>
                  </div>
                  
                  {/* Pays */}
                  <div style={{ padding: '8px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                      {getCountryFlag(plug.countries)}
                    </div>
                    <div style={{ 
                      fontSize: 'clamp(18px, 4vw, 24px)', 
                      fontWeight: 'bold', 
                      color: '#ffffff',
                      marginBottom: '4px'
                    }}>
                      {plug.countries ? plug.countries.length : 0}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#8e8e93',
                      wordBreak: 'break-word'
                    }}>
                      {t('countries') || 'Pays'}
                    </div>
                  </div>

                  {/* Type */}
                  <div style={{ padding: '8px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>⭐</div>
                    <div style={{ 
                      fontSize: 'clamp(14px, 3vw, 18px)', 
                      fontWeight: 'bold', 
                      color: plug.isVip ? '#FFD700' : '#ffffff',
                      marginBottom: '4px'
                    }}>
                      {plug.isVip ? 'VIP' : 'STD'}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#8e8e93',
                      wordBreak: 'break-word'
                    }}>
                      {t('type') || 'Type'}
                    </div>
                  </div>
                </div>

                {/* Localisation */}
                {plug?.countries && Array.isArray(plug.countries) && plug.countries.length > 0 && (
                  <div style={{ 
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid #2a2a2a'
                  }}>
                    <h3 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      marginBottom: '8px',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      📍 {t('location') || 'Localisation'}
                    </h3>
                    <p style={{ 
                      color: '#8e8e93', 
                      fontSize: '15px', 
                      margin: '0',
                      lineHeight: '1.4',
                      wordBreak: 'break-word'
                    }}>
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
                  🚀 {t('available_services') || 'Services disponibles'}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Livraison */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: plug?.services?.delivery?.enabled ? '#0a4a2a' : '#2a2a2a',
                    borderRadius: '8px',
                    border: plug?.services?.delivery?.enabled ? '1px solid #22c55e' : '1px solid #3a3a3a',
                    minHeight: '60px'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      flex: '1',
                      minWidth: '0'
                    }}>
                      <span style={{ 
                        fontSize: '20px',
                        flexShrink: '0'
                      }}>📦</span>
                      <div style={{ minWidth: '0', flex: '1' }}>
                        <div style={{ 
                          fontWeight: '500', 
                          color: '#ffffff',
                          fontSize: '15px',
                          lineHeight: '1.3',
                          wordBreak: 'break-word',
                          textAlign: 'left'
                        }}>
                          {translateService('delivery') || 'Livraison'}
                        </div>
                        {plug?.services?.delivery?.price && (
                          <div style={{ 
                            fontSize: '13px', 
                            color: '#8e8e93',
                            marginTop: '2px'
                          }}>
                            {plug.services.delivery.price}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ 
                      color: plug?.services?.delivery?.enabled ? '#22c55e' : '#ef4444',
                      fontWeight: '500',
                      fontSize: '14px',
                      textAlign: 'center',
                      minWidth: '100px',
                      flexShrink: '0'
                    }}>
                      {plug?.services?.delivery?.enabled ? `✓ ${t('available') || 'Disponible'}` : `✗ ${t('not_available') || 'Non disponible'}`}
                    </div>
                  </div>

                  {/* Postal */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: plug?.services?.postal?.enabled ? '#1a3a4a' : '#2a2a2a',
                    borderRadius: '8px',
                    border: plug?.services?.postal?.enabled ? '1px solid #3b82f6' : '1px solid #3a3a3a',
                    minHeight: '60px'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      flex: '1',
                      minWidth: '0'
                    }}>
                      <span style={{ 
                        fontSize: '20px',
                        flexShrink: '0'
                      }}>📬</span>
                      <div style={{ minWidth: '0', flex: '1' }}>
                        <div style={{ 
                          fontWeight: '500', 
                          color: '#ffffff',
                          fontSize: '15px',
                          lineHeight: '1.3',
                          wordBreak: 'break-word',
                          textAlign: 'left'
                        }}>
                          {translateService('postal') || 'Envoi postal'}
                        </div>
                        {plug?.services?.postal?.price && (
                          <div style={{ 
                            fontSize: '13px', 
                            color: '#8e8e93',
                            marginTop: '2px'
                          }}>
                            {plug.services.postal.price}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ 
                      color: plug?.services?.postal?.enabled ? '#3b82f6' : '#ef4444',
                      fontWeight: '500',
                      fontSize: '14px',
                      textAlign: 'center',
                      minWidth: '100px',
                      flexShrink: '0'
                    }}>
                      {plug?.services?.postal?.enabled ? `✓ ${t('available') || 'Disponible'}` : `✗ ${t('not_available') || 'Non disponible'}`}
                    </div>
                  </div>

                  {/* Meetup */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: plug?.services?.meetup?.enabled ? '#4a2a1a' : '#2a2a2a',
                    borderRadius: '8px',
                    border: plug?.services?.meetup?.enabled ? '1px solid #f59e0b' : '1px solid #3a3a3a',
                    minHeight: '60px'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      flex: '1',
                      minWidth: '0'
                    }}>
                      <span style={{ 
                        fontSize: '20px',
                        flexShrink: '0'
                      }}>🤝</span>
                      <div style={{ minWidth: '0', flex: '1' }}>
                        <div style={{ 
                          fontWeight: '500', 
                          color: '#ffffff',
                          fontSize: '15px',
                          lineHeight: '1.3',
                          wordBreak: 'break-word',
                          textAlign: 'left'
                        }}>
                          {translateService('meetup') || 'Meetup'}
                        </div>
                        {plug?.services?.meetup?.price && (
                          <div style={{ 
                            fontSize: '13px', 
                            color: '#8e8e93',
                            marginTop: '2px'
                          }}>
                            {plug.services.meetup.price}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ 
                      color: plug?.services?.meetup?.enabled ? '#f59e0b' : '#ef4444',
                      fontWeight: '500',
                      fontSize: '14px',
                      textAlign: 'center',
                      minWidth: '100px',
                      flexShrink: '0'
                    }}>
                      {plug?.services?.meetup?.enabled ? `✓ ${t('available') || 'Disponible'}` : `✗ ${t('not_available') || 'Non disponible'}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Réseaux sociaux */}
              {plug?.socialMedia && Array.isArray(plug.socialMedia) && plug.socialMedia.length > 0 && (
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
                    🌐 {t('social_media') || 'Réseaux sociaux'}
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
              {plug?.additionalInfo && (
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
                    ℹ️ {t('additional_info') || 'Informations complémentaires'}
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
            </>
          )}
        </main>

        {/* Navigation */}
        <ShopNavigation currentLanguage={currentLanguage} currentPage="detail" />
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