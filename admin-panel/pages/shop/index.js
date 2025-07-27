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

export default function ShopHome() {
  const [plugs, setPlugs] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [likesSync, setLikesSync] = useState({}) // Pour synchroniser les likes en temps réel
  const [currentLanguage, setCurrentLanguage] = useState('fr')
  const { t } = useTranslation(currentLanguage)
  const itemsPerPage = 50

  // Fonction pour calculer les styles de thème
  const getThemeStyles = () => {
    if (!config?.boutique) return { 
      backgroundColor: '#1a1a1a',
      backgroundImage: `
        linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), 
        url("https://i.imgur.com/iISKonz.jpeg")
      `,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      color: '#ffffff'
    }
    
    const { theme, backgroundColor, backgroundImage } = config.boutique
    
    switch (theme) {
      case 'light':
        return {
          backgroundColor: '#ffffff',
          color: '#000000',
          backgroundImage: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)'
        }
      case 'custom':
        return {
          backgroundColor: backgroundColor || '#1a1a1a',
          color: '#ffffff',
          backgroundImage: backgroundImage ? 
            `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("${backgroundImage}")` : 
            `
              linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), 
              url("https://i.imgur.com/iISKonz.jpeg")
            `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }
      case 'dark':
      default:
        return {
          backgroundColor: backgroundColor || '#1a1a1a',
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), 
            url("https://i.imgur.com/iISKonz.jpeg")
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          color: '#ffffff'
        }
    }
  }

  useEffect(() => {
    // Initialiser la langue depuis localStorage
    if (typeof window !== 'undefined') {
      setCurrentLanguage(getCurrentLanguage())
    }
    
    fetchConfig()
    fetchPlugs()
    
    // Boutique initialisée
  }, [])

  // Config mise à jour
  useEffect(() => {
    // Config loaded silently
  }, [config])

  // Recharger les données quand la langue change
  useEffect(() => {
    if (currentLanguage) {
      // Recharger les données pour s'assurer qu'elles sont à jour
      fetchPlugs()
    }
  }, [currentLanguage])

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage)
  }

  const fetchConfig = async () => {
    try {
      // Récupérer la config publique du bot
      const data = await api.getPublicConfig()
      setConfig(data)
      
      // Récupérer aussi les liens Telegram depuis l'API publique
      try {
        const response = await fetch('https://jhhhhhhggre.onrender.com/api/public/config', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const publicData = await response.json()
          // Mettre à jour la config avec les liens Telegram
          setConfig(prev => ({
            ...prev,
            telegramLinks: {
              inscription: publicData.boutique?.inscriptionTelegramLink || 'https://t.me/FindYourPlugBot',
              services: publicData.boutique?.servicesTelegramLink || 'https://t.me/FindYourPlugBot'
            }
          }))
          
          // Sauvegarder aussi en localStorage pour les autres pages
          localStorage.setItem('telegramLinks', JSON.stringify({
            inscriptionTelegramLink: publicData.boutique?.inscriptionTelegramLink || 'https://t.me/FindYourPlugBot',
            servicesTelegramLink: publicData.boutique?.servicesTelegramLink || 'https://t.me/FindYourPlugBot'
          }))
        }
      } catch (telegramError) {
        console.log('Erreur récupération liens Telegram:', telegramError)
        // Fallback vers localStorage
        const savedLinks = localStorage.getItem('telegramLinks')
        if (savedLinks) {
          const links = JSON.parse(savedLinks)
          setConfig(prev => ({
            ...prev,
            telegramLinks: {
              inscription: links.inscriptionTelegramLink || 'https://t.me/FindYourPlugBot',
              services: links.servicesTelegramLink || 'https://t.me/FindYourPlugBot'
            }
          }))
        }
      }
    } catch (error) {
      console.error('Erreur chargement config:', error)
    }
  }

  const fetchPlugs = async () => {
    try {
      console.log('🔍 Chargement boutiques DIRECTEMENT depuis le bot...')
      setLoading(true)
      
      // APPEL DIRECT au bot pour récupérer les VRAIES boutiques
      console.log('📡 Tentative de connexion à l\'API...')
      const response = await fetch('https://jhhhhhhggre.onrender.com/api/public/plugs?limit=50', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        // Ajouter un timeout
        signal: AbortSignal.timeout(10000) // 10 secondes
      })
      
      console.log('📡 Réponse reçue:', response.status, response.statusText)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('📡 Données reçues:', data)
      
      if (data && data.plugs) {
        console.log('🎯 Boutiques récupérées:', data.plugs.length)
        setPlugs(data.plugs)
        
        // Synchroniser les likes en temps réel
        const likesData = {}
        data.plugs.forEach(plug => {
          if (plug._id && plug.likes !== undefined) {
            likesData[plug._id] = plug.likes
          }
        })
        setLikesSync(likesData)
      } else {
        console.log('⚠️ Aucune boutique trouvée dans la réponse')
        setPlugs([])
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement boutiques:', error.message)
      
      // Ne pas afficher les données de fallback, juste un tableau vide
      setPlugs([])
      console.log('📱 Erreur API: Aucune boutique affichée')
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
          <title>FindYourPlug</title>
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
            <p>Chargement...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
              <Head>
          <title>FindYourPlug</title>
          <meta name="description" content="Découvrez notre sélection de boutiques premium avec livraison et services disponibles." />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>

      <div style={{ 
        ...getThemeStyles(),
        minHeight: '100vh',
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        {/* Header Titre Principal */}
        <div style={{ 
          backgroundColor: 'transparent',
          padding: '20px',
          position: 'relative'
        }}>
          {/* Sélecteur de langue en haut à droite */}
          <div style={{ 
            position: 'absolute',
            top: '20px',
            right: '20px'
          }}>
            <LanguageSelector 
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
              compact={true}
            />
          </div>
          
          {/* Logo / Titre */}
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ 
              height: '120px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              {config?.boutique?.logoUrl ? (
                <div style={{
                  backgroundColor: '#000000',
                  borderRadius: '20px',
                  padding: '8px',
                  display: 'inline-block',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                }}>
                  <img
                    src={config.boutique.logoUrl}
                    alt="FindYourPlug Logo"
                    style={{
                      maxHeight: '100px',
                      maxWidth: '350px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                      borderRadius: '15px'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'block'
                    }}
                  />
                </div>
              ) : null}
              {/* Fallback logo si pas de logo configuré */}
              <div style={{ 
                display: config?.boutique?.logoUrl ? 'none' : 'block'
              }}>
                <div style={{
                  backgroundColor: '#000000',
                  borderRadius: '20px',
                  padding: '8px',
                  display: 'inline-block',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                }}>
                  <img 
                    src="/images/logo.png" 
                    alt="FindYourPlug Logo" 
                    style={{
                      maxHeight: '100px',
                      maxWidth: '350px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                      borderRadius: '15px'
                    }}
                  />
                </div>
                {config?.boutique?.headerSubtitle && (
                  <div style={{ 
                    backgroundColor: '#007AFF', 
                    color: '#ffffff', 
                    padding: '4px 8px', 
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'inline-block',
                    marginTop: '8px'
                  }}>
                    {config.boutique.headerSubtitle}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section de présentation */}
        <div style={{ 
          padding: '20px 15px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.1), rgba(0, 122, 255, 0.05))',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '800',
            margin: '0 0 20px 0',
            color: '#ffffff',
            letterSpacing: '0.5px',
            lineHeight: '1.2',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}>
            👋 Bienvenue sur FindYourPlug
          </h1>
          
          <div style={{ 
            fontSize: '16px',
            lineHeight: '1.5',
            color: '#ffffff',
            maxWidth: '450px',
            margin: '0 auto',
            fontWeight: '500',
            textShadow: '0 1px 3px rgba(0,0,0,0.7)'
          }}>
            <p style={{ 
              margin: '0 0 12px 0',
              padding: '8px 12px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              🔍 Utilisez la barre de recherche pour trouver un plug près de chez vous ou en envoi postal
            </p>
            <p style={{ 
              margin: '0 0 12px 0',
              padding: '8px 12px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              ⭐ N'hésitez pas à voter pour votre Plug préféré
            </p>

          </div>
        </div>

        {/* Section Réseaux Sociaux */}
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          padding: '16px',
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.2)',
          margin: '20px'
        }}>
          <p style={{
            color: '#ffffff',
            fontSize: '14px',
            marginBottom: '12px',
            fontWeight: '500',
            textShadow: '0 1px 3px rgba(0,0,0,0.7)'
          }}>
            {currentLanguage === 'fr' && 'Rejoins nous sur tous nos réseaux 🔒🛜'}
            {currentLanguage === 'en' && 'Join us on all our networks 🔒🛜'}
            {currentLanguage === 'it' && 'Unisciti a tutti i nostri network 🔒🛜'}
            {currentLanguage === 'es' && 'Únete a todas nuestras redes 🔒🛜'}
            {currentLanguage === 'de' && 'Tritt allen unseren Netzwerken bei 🔒🛜'}
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {/* Réseaux sociaux avec vrais logos PNG */}
            {[
              { 
                name: 'Telegram', 
                logo: 'https://i.imgur.com/PP2GVMv.png',
                emoji: '📱',
                url: 'https://t.me/FindYourPlugBot' 
              },
              { 
                name: 'Potato', 
                logo: 'https://i.imgur.com/LaRHc9L.png',
                emoji: '🥔',
                url: '#' 
              },
              { 
                name: 'Instagram', 
                logo: 'https://i.imgur.com/YBE4cnb.jpeg',
                emoji: '📸',
                url: '#' 
              },
              { 
                name: 'Luffa', 
                logo: 'https://i.imgur.com/zkZtY0m.png',
                emoji: '🧽',
                url: '#' 
              },
              { 
                name: 'Discord', 
                logo: 'https://i.imgur.com/JgmWPPZ.png',
                emoji: '🎮',
                url: '#' 
              }
            ].map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.2)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <img 
                  src={social.logo}
                  alt={social.name}
                  style={{
                    width: '22px',
                    height: '22px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    padding: '3px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                  onError={(e) => {
                    // Fallback vers emoji si l'image ne charge pas
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'inline';
                  }}
                />
                <span style={{ 
                  fontSize: '16px',
                  display: 'none',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                }}>
                  {social.emoji}
                </span>
              </a>
            ))}
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
              <div style={{ 
                width: '60px', 
                height: '60px',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{t('noShops')}</h3>
              <p style={{ fontSize: '14px' }}>
                {currentLanguage === 'fr' && 'Revenez bientôt pour découvrir nos partenaires !'}
                {currentLanguage === 'en' && 'Come back soon to discover our partners!'}
                {currentLanguage === 'it' && 'Torna presto per scoprire i nostri partner!'}
                {currentLanguage === 'es' && '¡Vuelve pronto para descubrir nuestros socios!'}
                {currentLanguage === 'de' && 'Kommen Sie bald zurück, um unsere Partner zu entdecken!'}
              </p>
            </div>
          ) : (
            <>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '1px',
                marginBottom: '20px'
              }}>
                {currentPlugs.map((plug, index) => (
                  <ShopCard key={plug._id} plug={plug} index={index} currentLanguage={currentLanguage} />
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

        {/* Navigation en bas - Style uniforme */}
        <ShopNavigation currentLanguage={currentLanguage} currentPage="home" />
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