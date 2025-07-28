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

  // Fonction pour assigner automatiquement un logo selon le nom (identique à l'admin)
  const getLogoByName = (name) => {
    const lowercaseName = name.toLowerCase()
    if (lowercaseName.includes('telegram')) return 'https://i.imgur.com/54wA9SM.png'
    if (lowercaseName.includes('discord')) return 'https://i.imgur.com/oXPAefr.png'
    if (lowercaseName.includes('instagram')) return 'https://i.imgur.com/O5TxmOS.jpeg'
    if (lowercaseName.includes('whatsapp')) return 'https://i.imgur.com/WhatsApp.png'
    if (lowercaseName.includes('twitter') || lowercaseName.includes('x')) return 'https://i.imgur.com/twitter.png'
    if (lowercaseName.includes('facebook')) return 'https://i.imgur.com/facebook.png'
    if (lowercaseName.includes('tiktok')) return 'https://i.imgur.com/tiktok.png'
    if (lowercaseName.includes('youtube')) return 'https://i.imgur.com/youtube.png'
    if (lowercaseName.includes('snapchat')) return 'https://i.imgur.com/snapchat.png'
    if (lowercaseName.includes('linkedin')) return 'https://i.imgur.com/linkedin.png'
    if (lowercaseName.includes('potato')) return 'https://i.imgur.com/1iCRHRB.jpeg'
    if (lowercaseName.includes('luffa')) return 'https://i.imgur.com/PtqXOhb.png'
    if (lowercaseName.includes('find your plug') || lowercaseName.includes('findyourplug')) return 'https://i.imgur.com/VwBPgtw.jpeg'
          return 'https://i.imgur.com/54wA9SM.png' // Fallback vers Telegram
  }

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
    if (typeof window === 'undefined') return
    
    // Intégration Telegram Web App pour Mini App
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
      console.log('✅ Telegram Mini App initialisée');
      
      // SYSTÈME INTELLIGENT : Refresh au retour si nécessaire
      let lastVisibilityRefresh = 0;
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          const now = Date.now();
          // Throttling: minimum 30 secondes entre chaque refresh de visibilité
          if (now - lastVisibilityRefresh > 30000) {
            console.log('📱 Retour Mini App - Check nouvelles boutiques...');
            lastVisibilityRefresh = now;
            
            // Forcer un nouveau fetch en invalidant le cache si nécessaire
            const lastFetch = sessionStorage.getItem('miniapp_last_fetch');
            if (!lastFetch || (now - parseInt(lastFetch)) > 120000) {
              console.log('🔄 Refresh boutiques après retour Mini App');
              setTimeout(() => {
                fetchPlugs();
              }, 800);
            }
          }
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Cleanup
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
    
      // Configuration initiale
  initializeData()
  
  // Boutique initialisée
}, [])

// Fonction pour forcer le rafraîchissement (pour debug)
const forceRefresh = () => {
  console.log('🔄 Rafraîchissement forcé...')
  fetchConfig()
}

// Écouter les mises à jour des réseaux sociaux
useEffect(() => {
  const handleSocialMediaUpdate = (event) => {
    console.log('🔄 Réseaux sociaux mis à jour, rechargement...')
    // Forcer un re-render en modifiant un état
    setConfig(prev => ({ ...prev, _updated: Date.now() }))
  }

  window.addEventListener('shopSocialMediaUpdated', handleSocialMediaUpdate)
  
  return () => {
    window.removeEventListener('shopSocialMediaUpdated', handleSocialMediaUpdate)
  }
}, [])

  // Listener pour les changements de localStorage (synchronisation temps réel)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e) => {
      if (e.key === 'shopSocialMediaBackup' && e.newValue) {
        try {
          const newShopSocialMedia = JSON.parse(e.newValue)
          console.log('🔄 Mise à jour temps réel shopSocialMediaList:', newShopSocialMedia)
          setConfig(prev => ({
            ...prev,
            shopSocialMediaList: newShopSocialMedia
          }))
          toast.success('🏪 Réseaux sociaux boutique mis à jour', { duration: 2000 })
        } catch (e) {
          console.log('❌ Erreur parsing shopSocialMediaBackup:', e)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
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

  // PAS D'AUTO-REFRESH - Charger seulement au besoin
  // useEffect supprimé pour éviter les rechargements constants

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage)
  }

  const initializeData = () => {
    // Initialiser la langue depuis localStorage
    if (typeof window !== 'undefined') {
      setCurrentLanguage(getCurrentLanguage())
    }
    
    fetchConfig()
    fetchPlugs()
  }

  const fetchConfig = async () => {
    try {
      // TOUJOURS utiliser l'API publique avec cache-busting forcé
      const timestamp = Date.now()
      console.log('🔄 Récupération config ACTUELLE pour mini-app...')
      
      // Utiliser l'API publique avec cache-busting agressif
      const response = await fetch(`https://jhhhhhhggre.onrender.com/api/public/config?t=${timestamp}&cb=${Math.random()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Config ACTUELLE récupérée pour mini-app')
        console.log('📊 shopSocialMediaList length:', data?.shopSocialMediaList?.length || 0)
        setConfig(data)
        return
      }
      
      // Fallback vers l'API avec token si nécessaire
      console.log('⚠️ Fallback vers API avec token...')
      const token = 'JuniorAdmon123'
      const directResponse = await fetch(`https://jhhhhhhggre.onrender.com/api/config?t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      })
      if (directResponse.ok) {
        const data = await directResponse.json()
        console.log('✅ Config fallback récupérée')
        setConfig(data)
        return
      }
      
      console.log('❌ Impossible de récupérer la config')
        
    } catch (error) {
      console.error('❌ Erreur récupération config:', error)
      // Utiliser config par défaut si tout échoue
      setConfig({
        boutique: {},
        shopSocialMediaList: [],
        socialMedia: {},
        welcome: {},
        interface: {},
        messages: {},
        buttons: {}
      })
    }
  }

  const fetchPlugs = async () => {
    try {
      console.log('🔍 Chargement boutiques mini app...')
      setLoading(true)
      
      // TIMEOUT DE SÉCURITÉ : Forcer loading=false après 8 secondes
      const safetyTimeout = setTimeout(() => {
        console.log('⏰ TIMEOUT SÉCURITÉ: Force loading=false après 8s');
        setLoading(false);
      }, 8000);
      
      // Cache intelligent mini app : Évite les reloads inutiles
      const lastFetch = sessionStorage.getItem('miniapp_last_fetch');
      const now = Date.now();
      
      // Si données récentes (moins de 3 minutes) et qu'on a déjà des boutiques
      if (lastFetch && (now - parseInt(lastFetch)) < 180000 && plugs.length > 0) {
        console.log('📱 Boutiques mini app en cache (moins de 3min) - Skip fetch');
        clearTimeout(safetyTimeout);
        setLoading(false);
        return;
      }
      
      // APPEL DIRECT OPTIMISÉ MINI APP
      const response = await fetch('https://jhhhhhhggre.onrender.com/api/public/plugs?limit=50&t=' + now, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`API failed: ${response.status}`);
      }
      
      const data = await response.json()
      
      // Clear le timeout car tout va bien
      clearTimeout(safetyTimeout);
      
      if (data && data.plugs) {
        console.log('🎯 Boutiques mini app récupérées:', data.plugs.length)
        setPlugs(data.plugs)
        
        // Marquer la dernière récupération
        sessionStorage.setItem('miniapp_last_fetch', now.toString());
        
        // Synchroniser les likes en temps réel
        const likesData = {}
        data.plugs.forEach(plug => {
          if (plug._id && plug.likes !== undefined) {
            likesData[plug._id] = plug.likes
          }
        })
        setLikesSync(likesData)
      } else {
        console.log('⚠️ Aucune boutique trouvée dans mini app')
        setPlugs([])
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement boutiques mini app:', error.message)
      // En cas d'erreur, garder les boutiques existantes si on en a
      if (plugs.length === 0) {
        setPlugs([])
      }
    } finally {
      setLoading(false)
      console.log('✅ Loading mini app terminé')
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
          <script src="https://telegram.org/js/telegram-web-app.js"></script>
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
          <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
          <meta httpEquiv="Pragma" content="no-cache" />
          <meta httpEquiv="Expires" content="0" />
          <script src="https://telegram.org/js/telegram-web-app.js"></script>
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
            {t('shop_welcome_title')}
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
              {t('shop_welcome_search')}
            </p>
            <p style={{ 
              margin: '0 0 12px 0',
              padding: '8px 12px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              {t('shop_welcome_vote')}
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
            {t('shop_social_title')}
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {/* Réseaux sociaux fixes pour la boutique */}
            {(() => {
              // Lire depuis localStorage en priorité (plus fiable)
              let localSocialMedia = []
              try {
                const saved = localStorage.getItem('shopSocialMediaList')
                if (saved) {
                  localSocialMedia = JSON.parse(saved)
                  console.log('📱 Réseaux sociaux depuis localStorage:', localSocialMedia)
                }
              } catch (e) {
                console.log('❌ Erreur lecture localStorage:', e)
              }

              return [
                { 
                  id: 'telegram',
                  name: localSocialMedia?.find(s => s.id === 'telegram')?.name || 'Telegram',
                  logo: 'https://i.imgur.com/54wA9SM.png',
                  url: localSocialMedia?.find(s => s.id === 'telegram')?.url || 'https://t.me/+zcP68c4M_3NlM2Y0'
                },
                { 
                  id: 'instagram',
                  name: localSocialMedia?.find(s => s.id === 'instagram')?.name || 'Instagram',
                  logo: 'https://i.imgur.com/O5TxmOS.jpeg',
                  url: localSocialMedia?.find(s => s.id === 'instagram')?.url || 'https://www.instagram.com/find.yourplug?igsh=ajRwcjE1eGhoaXMz&utm_source=qr'
                },
                { 
                  id: 'luffa',
                  name: localSocialMedia?.find(s => s.id === 'luffa')?.name || 'Luffa',
                  logo: 'https://i.imgur.com/PtqXOhb.png',
                  url: localSocialMedia?.find(s => s.id === 'luffa')?.url || 'https://callup.luffa.im/c/EnvtiTHkbvP'
                },
                { 
                  id: 'discord',
                  name: localSocialMedia?.find(s => s.id === 'discord')?.name || 'Discord',
                  logo: 'https://i.imgur.com/oXPAefr.png',
                  url: localSocialMedia?.find(s => s.id === 'discord')?.url || 'https://discord.gg/g2dACUC3'
                },
                { 
                  id: 'potato',
                  name: localSocialMedia?.find(s => s.id === 'potato')?.name || 'Potato',
                  logo: 'https://i.imgur.com/1iCRHRB.jpeg',
                  url: localSocialMedia?.find(s => s.id === 'potato')?.url || 'https://dym168.org/findyourplug'
                }
              ]
            })().map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '50px',
                  height: '50px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
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
                  src={social.logo || getLogoByName(social.name)}
                  alt={social.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    objectFit: 'contain',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: '3px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
                  }}
                  onError={(e) => {
                    // Fallback vers un logo par défaut si l'image ne charge pas
                    e.target.src = getLogoByName(social.name) || 'https://i.imgur.com/54wA9SM.png';
                  }}
                />
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