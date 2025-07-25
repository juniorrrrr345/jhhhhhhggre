import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { simpleApi as api } from '../../lib/api-simple'
import { getProxiedImageUrl } from '../../lib/imageUtils'
import toast from 'react-hot-toast'
import Pagination from '../../components/Pagination'
import ShopCard from '../../components/ShopCard'
import LanguageSelector, { useTranslation, getCurrentLanguage } from '../../components/LanguageSelector'

export default function ShopHome() {
  const [plugs, setPlugs] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [likesSync, setLikesSync] = useState({}) // Pour synchroniser les likes en temps réel
  const [currentLanguage, setCurrentLanguage] = useState('fr')
  const { t } = useTranslation(currentLanguage)
  const itemsPerPage = 50

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

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage)
  }

  const fetchConfig = async () => {
    try {
      const data = await api.getPublicConfig()
      setConfig(data)
    } catch (error) {
      console.error('Erreur chargement config:', error)
    }
  }

  const fetchPlugs = async () => {
    try {
      console.log('🔍 Chargement boutiques...')
      setLoading(true)
      
      // Utiliser l'API simple avec fallback automatique
      const data = await api.getPublicPlugs({ limit: 50 })
      
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
      
      // Mode offline : afficher des données par défaut au lieu d'une erreur
      const fallbackPlugs = [
        {
          _id: 'fallback_1',
          name: 'Boutique Exemple',
          description: 'Serveur temporairement indisponible',
          image: 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Boutique',
          isActive: true,
          isVip: false,
          likes: 0,
          countries: ['France'],
          services: ['Livraison'],
          departments: ['75']
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
          <title>FINDYOURPLUG</title>
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
        <title>{config?.boutique?.name || 'FINDYOURPLUG'}</title>
        <meta name="description" content="Découvrez notre sélection de boutiques premium avec livraison et services disponibles." />
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
            />
          </div>
          
          {/* Titre centré */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              margin: '0 0 8px 0',
              color: '#ffffff',
              letterSpacing: '2px'
            }}>
              {t('findyourplug')}
            </h2>
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
        <div style={{ padding: '20px', paddingBottom: '120px' }}>
          {plugs.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: '#8e8e93'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏪</div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Aucune boutique disponible</h3>
              <p style={{ fontSize: '14px' }}>Revenez bientôt pour découvrir nos partenaires !</p>
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
                  <ShopCard key={plug._id} plug={plug} index={index} />
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
        <nav style={{ 
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          backgroundColor: '#1a1a1a',
          padding: '12px 20px',
          borderTop: '1px solid #2a2a2a',
          zIndex: 1000
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around',
            alignItems: 'center',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <Link href="/shop" style={{ 
              color: '#007AFF', 
              textDecoration: 'none',
              fontSize: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ fontSize: '20px' }}>🏠</span>
              Boutiques
            </Link>
            <Link href="/shop/search" style={{ 
              color: '#8e8e93', 
              textDecoration: 'none',
              fontSize: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ fontSize: '20px' }}>🔍</span>
              Rechercher
            </Link>
            <Link href="/shop/vip" style={{ 
              color: '#8e8e93', 
              textDecoration: 'none',
              fontSize: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ fontSize: '20px' }}>👑</span>
              VIP
            </Link>
          </div>
        </nav>
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