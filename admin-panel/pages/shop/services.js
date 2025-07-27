import { useState, useEffect } from 'react'
import Head from 'next/head'
import LanguageSelector, { useTranslation, getCurrentLanguage } from '../../components/LanguageSelector'
import ShopNavigation from '../../components/ShopNavigation'
import telegramLinksSync from '../../lib/telegram-links-sync'

export default function ShopServices() {
  const [currentLanguage, setCurrentLanguage] = useState('fr')
  const [config, setConfig] = useState({
    servicesTelegramLink: 'https://t.me/FindYourPlugBot'
  })
  const { t } = useTranslation(currentLanguage)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentLanguage(getCurrentLanguage())
    }
    
    // Charger la configuration
    fetchConfig()
    
    // Écouter les mises à jour des liens
    telegramLinksSync.onLinksUpdate((links) => {
      setConfig({
        servicesTelegramLink: links.servicesTelegramLink || 'https://t.me/FindYourPlugBot'
      })
    })
  }, [])

  const fetchConfig = async () => {
    try {
      // Priorité 1: API publique du bot
      const response = await fetch('https://jhhhhhhggre.onrender.com/api/public/config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setConfig({
          servicesTelegramLink: data.boutique?.servicesTelegramLink || 'https://t.me/FindYourPlugBot'
        })
        return
      }
      
      // Priorité 2: localStorage (configuré par le panel admin)
      const savedLinks = localStorage.getItem('telegramLinks')
      if (savedLinks) {
        const links = JSON.parse(savedLinks)
        setConfig({
          servicesTelegramLink: links.servicesTelegramLink || 'https://t.me/FindYourPlugBot'
        })
        return
      }
      
      // Priorité 3: Lien par défaut
      setConfig({
        servicesTelegramLink: 'https://t.me/FindYourPlugBot'
      })
    } catch (error) {
      console.error('Erreur lors du chargement de la config:', error)
      
      // Fallback vers localStorage en cas d'erreur
      const savedLinks = localStorage.getItem('telegramLinks')
      if (savedLinks) {
        const links = JSON.parse(savedLinks)
        setConfig({
          servicesTelegramLink: links.servicesTelegramLink || 'https://t.me/FindYourPlugBot'
        })
      } else {
        setConfig({
          servicesTelegramLink: 'https://t.me/FindYourPlugBot'
        })
      }
    }
  }

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage)
  }

  // Fonction pour calculer les styles de thème
  const getThemeStyles = () => {
    return {
      backgroundColor: '#1a1a1a',
      backgroundImage: `
        linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), 
        url("https://i.imgur.com/VwBPgtw.jpeg")
      `,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      color: '#ffffff'
    }
  }

  return (
    <>
      <Head>
        <title>Services - FindYourPlug</title>
        <meta name="description" content="Bots Telegram + MiniApp personnalisés - Solution complète pour votre business" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <div style={{ 
        ...getThemeStyles(),
        minHeight: '100vh',
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        {/* Header */}
        <div style={{ 
          backgroundColor: 'transparent',
          padding: '20px',
          position: 'relative'
        }}>
          {/* Sélecteur de langue */}
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
          
          {/* Titre */}
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              margin: '0 0 8px 0',
              color: '#ffffff',
              letterSpacing: '2px'
            }}>
              🛠️ {t('services_title')}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ 
                backgroundColor: '#007AFF', 
                color: '#ffffff', 
                padding: '4px 8px', 
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                TELEGRAM
              </span>
            </div>
          </div>
        </div>

        {/* Contenu Principal */}
        <div style={{ 
          padding: '20px',
          paddingBottom: '120px'
        }}>
          {/* Accroche principale */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px',
            padding: '30px 20px',
            background: 'linear-gradient(135deg, #ff4757, #ff3742)',
            borderRadius: '20px',
            margin: '0 auto 40px',
            maxWidth: '600px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '16px',
              lineHeight: '1.3'
            }}>
              😤 {t('services_frustrated_title')}
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#ffffff',
              marginBottom: '20px',
              opacity: 0.9
            }}>
              {t('services_solution_text')} 🔥
            </p>
            <div style={{
              fontSize: '16px',
              color: '#ffffff',
              fontWeight: '600'
            }}>
              ⬇️ {t('services_discover_text')} ⬇️
            </div>
          </div>

          {/* Offre principale */}
          <div style={{
            maxWidth: '700px',
            margin: '0 auto',
            backgroundColor: '#1a1a1a',
            borderRadius: '20px',
            padding: '30px',
            border: '2px solid #007AFF',
            boxShadow: '0 8px 32px rgba(0, 122, 255, 0.2)',
            marginBottom: '30px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                🤖✨
              </div>
              <h3 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '16px'
              }}>
                {t('services_bot_title')}
              </h3>
              <div style={{
                fontSize: '36px',
                fontWeight: '900',
                color: '#007AFF',
                marginBottom: '8px'
              }}>
                {t('services_bot_price')}
              </div>
              <p style={{
                color: '#8e8e93',
                fontSize: '14px'
              }}>
                {t('services_bot_subtitle')}
              </p>
            </div>

            {/* Avantages */}
            <div style={{
              display: 'grid',
              gap: '16px',
              marginBottom: '30px'
            }}>
              {[
                { icon: '🏪', title: t('services_bot_menu'), desc: t('services_bot_menu_desc') },
                { icon: '👥', title: t('services_bot_clients'), desc: t('services_bot_clients_desc') },
                { icon: '📱', title: t('services_bot_miniapp'), desc: t('services_bot_miniapp_desc') },
                { icon: '🔒', title: t('services_bot_secure'), desc: t('services_bot_secure_desc') },
                { icon: '⚡', title: t('services_bot_fast'), desc: t('services_bot_fast_desc') },
                { icon: '🎨', title: t('services_bot_design'), desc: t('services_bot_design_desc') }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px',
                  backgroundColor: '#2a2a2a',
                  borderRadius: '12px',
                  border: '1px solid #333333'
                }}>
                  <span style={{ fontSize: '24px', flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <h4 style={{
                      color: '#ffffff',
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: '0 0 4px 0'
                    }}>
                      {item.title}
                    </h4>
                    <p style={{
                      color: '#8e8e93',
                      fontSize: '14px',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton de contact */}
            <div style={{ textAlign: 'center' }}>
              <a
                href={config.servicesTelegramLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#007AFF',
                  color: '#ffffff',
                  padding: '16px 32px',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                💬 {t('services_order_button')}
              </a>
            </div>
          </div>

          {/* Option Site Web */}
          <div style={{
            maxWidth: '700px',
            margin: '0 auto 30px',
            backgroundColor: '#1a1a1a',
            borderRadius: '20px',
            padding: '30px',
            border: '2px solid #FF6B35',
            boxShadow: '0 8px 32px rgba(255, 107, 53, 0.2)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                🌐✨
              </div>
              <h3 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '16px'
              }}>
                {t('services_web_title')}
              </h3>
              <div style={{
                fontSize: '36px',
                fontWeight: '900',
                color: '#FF6B35',
                marginBottom: '8px'
              }}>
                {t('services_web_price')}
              </div>
              <p style={{
                color: '#8e8e93',
                fontSize: '14px'
              }}>
                {t('services_web_subtitle')}
              </p>
            </div>

            {/* Avantages Site Web */}
            <div style={{
              display: 'grid',
              gap: '16px',
              marginBottom: '30px'
            }}>
              {[
                { icon: '📱', title: t('services_web_responsive'), desc: t('services_web_responsive_desc') },
                { icon: '⚡', title: t('services_web_performance'), desc: t('services_web_performance_desc') },
                { icon: '🎨', title: t('services_web_design'), desc: t('services_web_design_desc') },
                { icon: '🔧', title: t('services_web_maintenance'), desc: t('services_web_maintenance_desc') },
                { icon: '📊', title: t('services_web_analytics'), desc: t('services_web_analytics_desc') },
                { icon: '🔒', title: t('services_web_secure'), desc: t('services_web_secure_desc') }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px',
                  backgroundColor: '#2a2a2a',
                  borderRadius: '12px',
                  border: '1px solid #333333'
                }}>
                  <span style={{ fontSize: '24px', flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <h4 style={{
                      color: '#ffffff',
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: '0 0 4px 0'
                    }}>
                      {item.title}
                    </h4>
                    <p style={{
                      color: '#8e8e93',
                      fontSize: '14px',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton de contact Site Web */}
            <div style={{ textAlign: 'center' }}>
              <a
                href={config.servicesTelegramLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                                  backgroundColor: '#FF6B35',
                color: '#ffffff',
                padding: '16px 32px',
                borderRadius: '25px',
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: 'bold',
                boxShadow: '0 4px 16px rgba(255, 107, 53, 0.3)',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              💬 {t('services_web_order')}
            </a>
            </div>
          </div>

          {/* Support et garanties */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {/* SAV */}
            <div style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #333333',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>🛠️</div>
              <h4 style={{
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px'
              }}>
                SAV 7J/7
              </h4>
              <p style={{
                color: '#8e8e93',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                Support technique disponible tous les jours pour t'aider en cas de problème
              </p>
            </div>

            {/* Garantie */}
            <div style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #333333',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>✅</div>
              <h4 style={{
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px'
              }}>
                Satisfaction garantie
              </h4>
              <p style={{
                color: '#8e8e93',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                Si tu n'es pas satisfait, on reprend ton bot et on te rembourse
              </p>
            </div>
          </div>


        </div>

        {/* Navigation */}
        <ShopNavigation currentLanguage={currentLanguage} currentPage="services" />
      </div>
    </>
  )
}