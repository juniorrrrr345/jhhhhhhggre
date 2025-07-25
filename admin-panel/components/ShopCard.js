import Link from 'next/link'
import { useState } from 'react'
import { getProxiedImageUrl } from '../lib/imageUtils'

export default function ShopCard({ plug, index, layout = 'grid', currentLanguage = 'fr' }) {
  const [likes, setLikes] = useState(plug.likes || 0)
  const [isVoting, setIsVoting] = useState(false)
  
  const getPositionBadge = (position) => {
    if (position === 0) return '🥇'
    if (position === 1) return '🥈'
    if (position === 2) return '🥉'
    return null
  }

  const translateService = (service) => {
    const translations = {
      'delivery': {
        fr: 'Livraison',
        en: 'Delivery',
        it: 'Consegna',
        es: 'Entrega',
        de: 'Lieferung'
      },
      'meetup': {
        fr: 'Meetup',
        en: 'Meetup',
        it: 'Incontro',
        es: 'Encuentro',
        de: 'Treffen'
      },
      'postal': {
        fr: 'Envoi postal',
        en: 'Postal shipping',
        it: 'Spedizione postale',
        es: 'Envío postal',
        de: 'Postversand'
      }
    }
    return translations[service]?.[currentLanguage] || service
  }

  const getVotesText = () => {
    const translations = {
      fr: 'votes',
      en: 'votes',
      it: 'voti',
      es: 'votos',
      de: 'Stimmen'
    }
    return translations[currentLanguage] || 'votes'
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

  const handleVote = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isVoting) return
    
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
        console.log(`✅ Vote réussi: ${result.plugName} - ${result.likes} likes`)
      } else {
        console.error('❌ Erreur vote:', result.error)
      }
    } catch (error) {
      console.error('❌ Erreur lors du vote:', error)
    } finally {
      setIsVoting(false)
    }
  }

  // Format uniforme (beau format VIP original) pour toutes les pages
  return (
    <Link 
      key={plug._id} 
      href={`/shop/${plug._id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{ 
        backgroundColor: '#1a1a1a',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        border: plug.isVip ? '1px solid #FFD700' : '1px solid #2a2a2a',
        borderRadius: '8px',
        marginBottom: '8px'
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = '#2a2a2a'}
      onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
      >
        {/* Image/Logo avec effet VIP */}
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#2a2a2a',
          flexShrink: 0,
          border: plug.isVip ? '2px solid #FFD700' : 'none',
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
                e.target.style.display = 'none'
                e.target.nextElementSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: plug.image ? 'none' : 'flex',
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            {plug.isVip ? '👑' : '🏪'}
          </div>
          {/* Badge VIP en overlay */}
          {plug.isVip && (
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              backgroundColor: '#FFD700',
              color: '#000000',
              fontSize: '10px',
              fontWeight: 'bold',
              padding: '2px 4px',
              borderRadius: '6px'
            }}>
              VIP
            </div>
          )}
        </div>

        {/* Contenu principal */}
        <div style={{ 
          flex: 1, 
          minWidth: 0,
          marginRight: '12px'  // Espace pour éviter collision avec les likes
        }}>
          {/* Nom et drapeau */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '6px'
          }}>
            <span style={{ fontSize: '16px' }}>{getCountryFlag(plug.countries)}</span>
            <h3 style={{ 
              fontSize: '16px',
              fontWeight: '600',
              margin: '0',
              color: plug.isVip ? '#FFD700' : '#ffffff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {plug.name}
            </h3>
          </div>

          {/* Services - Structure améliorée */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '6px',
            alignItems: 'center',
            maxWidth: '100%'
          }}>
            {plug.services?.delivery?.enabled && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '3px',
                fontSize: '11px',
                color: '#ffffff',
                backgroundColor: '#0a4a2a',
                padding: '2px 6px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                border: '1px solid #22c55e'
              }}>
                <span>📦</span>
                <span>{translateService('delivery')}</span>
              </div>
            )}
            {plug.services?.postal?.enabled && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '3px',
                fontSize: '11px',
                color: '#ffffff',
                backgroundColor: '#1a3a4a',
                padding: '2px 6px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                border: '1px solid #3b82f6'
              }}>
                <span>📬</span>
                <span>{translateService('postal')}</span>
              </div>
            )}
            {plug.services?.meetup?.enabled && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '3px',
                fontSize: '11px',
                color: '#ffffff',
                backgroundColor: '#4a2a1a',
                padding: '2px 6px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                border: '1px solid #f59e0b'
              }}>
                <span>🤝</span>
                <span>{translateService('meetup')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Likes et badge position - Version compacte */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          flexShrink: 0,
          minWidth: '80px',
          textAlign: 'center'
        }}>
          {getPositionBadge(index) && (
            <span style={{ fontSize: '18px' }}>{getPositionBadge(index)}</span>
          )}
          
          {/* Section vote compacte */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px'
          }}>
            {/* Affichage likes seulement - PAS de bouton vote */}
            <div style={{
              fontSize: '14px',
              color: '#ffffff',
              textAlign: 'center'
            }}>
              👍
            </div>
            <span style={{ 
              fontSize: '14px',
              fontWeight: '600',
              color: plug.isVip ? '#FFD700' : '#ffffff',
              lineHeight: '1.2'
            }}>
              {likes}
            </span>
            <span style={{ 
              fontSize: '10px',
              color: '#8e8e93',
              lineHeight: '1'
            }}>
              {getVotesText()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}