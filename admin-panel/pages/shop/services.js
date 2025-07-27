import { useState, useEffect } from 'react'
import Head from 'next/head'
import LanguageSelector, { useTranslation, getCurrentLanguage } from '../../components/LanguageSelector'
import ShopNavigation from '../../components/ShopNavigation'

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
  }, [])

  const fetchConfig = async () => {
    try {
      // Récupérer directement depuis l'API du bot
      const botApiUrl = 'https://jhhhhhhggre.onrender.com'
      
      const response = await fetch(`${botApiUrl}/api/config`, {
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
      } else {
        // Fallback si l'API n'est pas disponible
        setConfig({
          servicesTelegramLink: 'https://t.me/FindYourPlugBot'
        })
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la config:', error)
      // Fallback en cas d'erreur
      setConfig({
        servicesTelegramLink: 'https://t.me/FindYourPlugBot'
      })
    }
  }

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage)
  }

  // Fonction pour calculer les styles de thème
  const getThemeStyles = () => {
    return {
      backgroundColor: '#000000',
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
              🛠️ SERVICES
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
              😤 T'en as marre que ton canal saute ?
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#ffffff',
              marginBottom: '20px',
              opacity: 0.9
            }}>
              On a LA solution ! 🔥
            </p>
            <div style={{
              fontSize: '16px',
              color: '#ffffff',
              fontWeight: '600'
            }}>
              ⬇️ Découvre notre offre exclusive ⬇️
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
                💬 Commander maintenant
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