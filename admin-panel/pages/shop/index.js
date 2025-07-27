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
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),
        linear-gradient(45deg, #1a1a1a 0%, #2d2d2d 100%)
      `,
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
            `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("${backgroundImage}")` : 
            `
              radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),
              linear-gradient(45deg, #1a1a1a 0%, #2d2d2d 100%)
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
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),
            linear-gradient(45deg, #1a1a1a 0%, #2d2d2d 100%)
          `,
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
      const response = await fetch('https://jhhhhhhggre.onrender.com/api/public/plugs?limit=50', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
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
        setPlugs([])
      }
      
    } catch (error) {
      console.error('Erreur chargement boutiques:', error)
      
      // Mode offline : afficher des données par défaut traduites
      const fallbackPlugs = [
        {
          _id: 'fallback_1',
          name: currentLanguage === 'fr' ? 'Boutique Example' : 
                currentLanguage === 'en' ? 'Example Shop' :
                currentLanguage === 'it' ? 'Negozio Esempio' :
                currentLanguage === 'es' ? 'Tienda Ejemplo' :
                'Beispiel Shop',
          description: currentLanguage === 'fr' ? 'Service temporairement indisponible - Données de test' :
                      currentLanguage === 'en' ? 'Service temporarily unavailable - Test data' :
                      currentLanguage === 'it' ? 'Servizio temporaneamente non disponibile - Dati di test' :
                      currentLanguage === 'es' ? 'Servicio temporalmente no disponible - Datos de prueba' :
                      'Service vorübergehend nicht verfügbar - Testdaten',
          image: 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Shop',
          isActive: true,
          isVip: false,
          likes: 15,
          countries: ['France'],
          services: {
            delivery: { enabled: true }
          },
          departments: ['75'],
          telegram: '@example_shop',
          location: 'Paris'
        },
        {
          _id: 'fallback_2',
          name: currentLanguage === 'fr' ? 'Boutique Premium' : 
                currentLanguage === 'en' ? 'Premium Shop' :
                currentLanguage === 'it' ? 'Negozio Premium' :
                currentLanguage === 'es' ? 'Tienda Premium' :
                'Premium Shop',
          description: currentLanguage === 'fr' ? 'Boutique VIP - Mode hors ligne' :
                      currentLanguage === 'en' ? 'VIP Shop - Offline mode' :
                      currentLanguage === 'it' ? 'Negozio VIP - Modalità offline' :
                      currentLanguage === 'es' ? 'Tienda VIP - Modo fuera de línea' :
                      'VIP Shop - Offline-Modus',
          image: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=VIP',
          isActive: true,
          isVip: true,
          likes: 42,
          countries: ['Spain'],
          services: {
            meetup: { enabled: true },
            postal: { enabled: true }
          },
          departments: ['28'],
          telegram: '@premium_shop',
          location: 'Madrid'
        }
      ]
      
      setPlugs(fallbackPlugs)
      
      // Pas d'erreur rouge, juste un message discret dans la console
      console.log('📱 Mode offline: Affichage des données par défaut')
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
          backgroundColor: '#000000',
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
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {config?.boutique?.logoUrl ? (
                <img
                  src={config.boutique.logoUrl}
                  alt="FindYourPlug Logo"
                  style={{
                    maxHeight: '70px',
                    maxWidth: '300px',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'block'
                  }}
                />
              ) : null}
              {/* Fallback logo si pas de logo configuré */}
              <div style={{ 
                display: config?.boutique?.logoUrl ? 'none' : 'block'
              }}>
                <img 
                  src="/images/logo.png" 
                  alt="FindYourPlug Logo" 
                  style={{
                    maxHeight: '70px',
                    maxWidth: '300px',
                    objectFit: 'contain'
                  }}
                />
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
            fontSize: '22px', 
            fontWeight: '700',
            margin: '0 0 15px 0',
            color: getThemeStyles().color || '#ffffff',
            letterSpacing: '0.3px',
            lineHeight: '1.2'
          }}>
            👋 Bienvenue sur FindYourPlug
          </h1>
          
          <div style={{ 
            fontSize: '14px',
            lineHeight: '1.4',
            color: getThemeStyles().color === '#000000' ? '#666666' : '#e0e0e0',
            maxWidth: '400px',
            margin: '0 auto',
            fontWeight: '400'
          }}>
            <p style={{ margin: '0 0 8px 0' }}>
              🔍 Utilisez la barre de recherche pour trouver un plug près de chez vous ou en envoi postal
            </p>
            <p style={{ margin: '0' }}>
              ⭐ N'hésitez pas à voter pour votre Plug préféré
            </p>
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