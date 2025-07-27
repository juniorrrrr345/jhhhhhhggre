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
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),
        linear-gradient(45deg, #1a1a1a 0%, #2d2d2d 100%)
      `,
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
          backgroundColor: '#000000',
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
                Bot Telegram + MiniApp
              </h3>
              <div style={{
                fontSize: '36px',
                fontWeight: '900',
                color: '#007AFF',
                marginBottom: '8px'
              }}>
                500€
              </div>
              <p style={{
                color: '#8e8e93',
                fontSize: '14px'
              }}>
                Solution complète clé en main
              </p>
            </div>

            {/* Avantages */}
            <div style={{
              display: 'grid',
              gap: '16px',
              marginBottom: '30px'
            }}>
              {[
                { icon: '🏪', title: 'Menu boutique intégré', desc: 'Tes clients consultent ton menu directement sur ton bot' },
                { icon: '👥', title: 'Conserve tes clients', desc: 'Plus de perte de clients lors de fermetures de canaux' },
                { icon: '📱', title: 'MiniApp moderne', desc: 'Interface web intégrée dans Telegram' },
                { icon: '🔒', title: '100% sécurisé', desc: 'Ton bot t\'appartient, personne peut te le supprimer' },
                { icon: '⚡', title: 'Installation rapide', desc: 'Livré en 48-72h maximum' },
                { icon: '🎨', title: 'Design personnalisé', desc: 'Couleurs et style adaptés à ton image' }
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