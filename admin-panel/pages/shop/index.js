import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { simpleApi as api } from '../../lib/api-simple'
import { getProxiedImageUrl } from '../../lib/imageUtils'
import toast from 'react-hot-toast'
import Pagination from '../../components/Pagination'
import ShopCard from '../../components/ShopCard'

export default function ShopHome() {
  const [plugs, setPlugs] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [likesSync, setLikesSync] = useState({}) // Pour synchroniser les likes en temps réel
  const itemsPerPage = 50

  useEffect(() => {
    fetchConfig()
    fetchPlugs()
    
    // Debug logs
    console.log('🔄 Boutique initialisée')
    
    // Plus de refresh automatique - utiliser le bouton "Actualiser" si besoin
  }, [])

  // Debug: afficher la config quand elle change
  useEffect(() => {
    if (config) {
      console.log('📊 Config reçue:', {
        boutique: config.boutique,
        hasName: !!config.boutique?.name,
        hasSubtitle: !!config.boutique?.subtitle
      })
    }
  }, [config])

  const fetchConfig = async () => {
    try {
      const data = await api.getPublicConfig()
      console.log('✅ Config boutique chargée:', {
        name: data.boutique?.name,
        subtitle: data.boutique?.subtitle
      })
      setConfig(data)
    } catch (error) {
      console.error('❌ Erreur chargement config:', error)
    }
  }

  const fetchPlugs = async () => {
    try {
      console.log('🔍 Chargement boutiques...')
      setLoading(true)
      
      // Timeout de 10 secondes pour éviter le chargement infini
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      )
      
      const dataPromise = api.getPublicPlugs({ limit: 50 })
      const data = await Promise.race([dataPromise, timeoutPromise])
      
      if (data && data.plugs && data.plugs.length > 0) {
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
        console.log('🔄 Likes synchronisés:', Object.keys(likesData).length, 'boutiques')
      } else {
        console.log('⚠️ Aucune boutique trouvée')
        setPlugs([])
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement boutiques:', error)
      setPlugs([])
      if (error.message === 'Timeout') {
        toast.error('Chargement trop long. Veuillez réessayer.')
      } else {
        toast.error('Erreur lors du chargement des boutiques')
      }
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
          <title>SAFEPLUGLINK</title>
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
        <title>{config?.boutique?.name || 'SAFEPLUGLINK'}</title>
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
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            margin: '0 0 8px 0',
            color: '#ffffff',
            letterSpacing: '2px'
          }}>
            {config?.boutique?.name || 'SAFEPLUGLINK'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ color: '#ffffff', fontSize: '14px' }}>
              {config?.boutique?.subtitle || ''}
            </span>
            <span style={{ 
              backgroundColor: '#007AFF', 
              color: '#ffffff', 
              padding: '4px 8px', 
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {config?.boutique?.taglineHighlight || 'MINI-APP TELEGRAM'}
            </span>
            <span style={{ color: '#ffffff', fontSize: '14px' }}>
              {config?.boutique?.tagline2 || 'CHILL'}
            </span>
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