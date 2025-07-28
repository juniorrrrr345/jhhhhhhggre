import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import LanguageSelector, { useTranslation, getCurrentLanguage } from '../../components/LanguageSelector'
import ShopNavigation from '../../components/ShopNavigation'
import telegramLinksSync from '../../lib/telegram-links-sync'

export default function ShopInscription() {
  const [currentLanguage, setCurrentLanguage] = useState('fr')
  const [config, setConfig] = useState({
    inscriptionTelegramLink: 'https://t.me/findyourplugsav'
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
        inscriptionTelegramLink: links.inscriptionTelegramLink || 'https://t.me/findyourplugsav'
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
        console.log('🔗 Config reçue de l\'API bot:', data.telegramLinks)
        setConfig({
          inscriptionTelegramLink: data.telegramLinks?.inscriptionTelegramLink || 'https://t.me/findyourplugsav'
        })
        return
      }
      
      // Priorité 2: localStorage (configuré par le panel admin)
      const savedLinks = localStorage.getItem('telegramLinks')
      if (savedLinks) {
        const links = JSON.parse(savedLinks)
        setConfig({
          inscriptionTelegramLink: links.inscriptionTelegramLink || 'https://t.me/FindYourPlugBot'
        })
        return
      }
      
      // Priorité 3: Lien par défaut
      setConfig({
        inscriptionTelegramLink: 'https://t.me/FindYourPlugBot'
      })
    } catch (error) {
      console.error('Erreur lors du chargement de la config:', error)
      
      // Fallback vers localStorage en cas d'erreur
      const savedLinks = localStorage.getItem('telegramLinks')
      if (savedLinks) {
        const links = JSON.parse(savedLinks)
        setConfig({
          inscriptionTelegramLink: links.inscriptionTelegramLink || 'https://t.me/FindYourPlugBot'
        })
      } else {
        setConfig({
          inscriptionTelegramLink: 'https://t.me/FindYourPlugBot'
        })
      }
    }
  }

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage)
  }

  // Fonction pour calculer les styles de thème (même que les autres pages)
  const getThemeStyles = () => {
    return {
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
  }

  return (
    <>
      <Head>
        <title>Inscription - FindYourPlug</title>
        <meta name="description" content="Inscrivez-vous sur FindYourPlug via notre bot Telegram" />
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
              📝 {t('inscription_title')}
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
          padding: '40px 20px',
          textAlign: 'center',
          paddingBottom: '120px'
        }}>
          {/* Titre principal */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              margin: '0 0 16px 0',
              color: '#ffffff'
            }}>
              {t('inscription_join_title')} 🚀
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#8e8e93',
              maxWidth: '400px',
              margin: '0 auto',
              lineHeight: '1.5'
            }}>
              {t('inscription_description')}
            </p>
          </div>

          {/* Bouton d'inscription */}
          <a
            href={config.inscriptionTelegramLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              backgroundColor: '#0088cc',
              color: '#ffffff',
              padding: '16px 32px',
              borderRadius: '25px',
              textDecoration: 'none',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: '0 4px 16px rgba(0, 136, 204, 0.3)',
              transition: 'transform 0.2s ease',
              marginBottom: '40px'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🚀 {t('inscription_button')}
          </a>

          {/* Avantages */}
          <div style={{
            maxWidth: '500px',
            margin: '0 auto',
            textAlign: 'left'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              ✨ {t('inscription_why_title')}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: '👁️', text: t('inscription_why_visibility') },
                { icon: '🔍', text: t('inscription_why_access') },
                { icon: '⭐', text: t('inscription_why_votes') },
                { icon: '📍', text: t('inscription_why_location') },
                { icon: '🚚', text: t('inscription_why_delivery') },
                { icon: '📱', text: t('inscription_why_interface') },
                { icon: '🔔', text: t('inscription_why_notifications') }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: '#1a1a1a',
                  borderRadius: '12px',
                  border: '1px solid #333333'
                }}>
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <span style={{ 
                    color: '#ffffff',
                    fontSize: '16px'
                  }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div style={{
            marginTop: '40px',
            padding: '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            border: '1px solid #0088cc',
            maxWidth: '400px',
            margin: '40px auto 0'
          }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#0088cc',
              marginBottom: '12px'
            }}>
              📋 {t('inscription_how_title')}
            </h4>
            <ol style={{
              color: '#8e8e93',
              fontSize: '14px',
              lineHeight: '1.6',
              paddingLeft: '20px',
              margin: 0
            }}>
              <li>{t('inscription_how_step1')}</li>
              <li>{t('inscription_how_step2')}</li>
              <li>{t('inscription_how_step3')}</li>
              <li>{t('inscription_how_step4')}</li>
              <li>{t('inscription_how_step5')}</li>
            </ol>
          </div>

          
        </div>

        {/* Navigation */}
        <ShopNavigation currentLanguage={currentLanguage} currentPage="inscription" />
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </>
  )
}