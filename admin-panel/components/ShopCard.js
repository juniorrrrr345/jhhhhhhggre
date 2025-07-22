import Link from 'next/link'
import { getProxiedImageUrl } from '../lib/imageUtils'

export default function ShopCard({ plug, index, layout = 'grid' }) {
  const getPositionBadge = (position) => {
    if (position === 0) return '🥇'
    if (position === 1) return '🥈'
    if (position === 2) return '🥉'
    return null
  }

  return (
    <Link 
      key={plug._id} 
      href={`/shop/${plug._id}`}
      style={{ textDecoration: 'none' }}
    >
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        padding: '8px',
        border: '1px solid #2a2a2a',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative'
      }}>
        {/* Badge Position */}
        {getPositionBadge(index) && (
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            fontSize: '14px',
            zIndex: 2
          }}>
            {getPositionBadge(index)}
          </div>
        )}

        {/* Badge VIP */}
        {plug.isVip && (
          <div style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            backgroundColor: '#FFD700',
            color: '#000000',
            padding: '2px 4px',
            borderRadius: '6px',
            fontSize: '8px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            ⭐
          </div>
        )}

        {/* Image */}
        <div style={{
          width: '100%',
          height: '80px',
          backgroundColor: '#2a2a2a',
          borderRadius: '6px',
          marginBottom: '6px',
          backgroundImage: plug.image ? `url("${getProxiedImageUrl(plug.image)}")` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {!plug.image && (
            <span style={{ fontSize: '18px' }}>🏪</span>
          )}
        </div>

        {/* Informations */}
        <h3 style={{
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold',
          margin: '0 0 4px 0',
          lineHeight: '1.2',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {plug.name}
        </h3>

        <p style={{
          color: '#8e8e93',
          fontSize: '10px',
          margin: '0 0 6px 0',
          lineHeight: '1.2',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical'
        }}>
          {plug.description}
        </p>

        {/* Services */}
        <div style={{ 
          display: 'flex', 
          gap: '2px', 
          marginBottom: '6px',
          flexWrap: 'wrap'
        }}>
          {plug.services?.delivery?.enabled && (
            <span style={{
              backgroundColor: '#007AFF',
              color: '#ffffff',
              padding: '1px 3px',
              borderRadius: '4px',
              fontSize: '8px'
            }}>
              🚚
            </span>
          )}
          {plug.services?.postal?.enabled && (
            <span style={{
              backgroundColor: '#34C759',
              color: '#ffffff',
              padding: '1px 3px',
              borderRadius: '4px',
              fontSize: '8px'
            }}>
              ✈️
            </span>
          )}
          {plug.services?.meetup?.enabled && (
            <span style={{
              backgroundColor: '#FF9500',
              color: '#ffffff',
              padding: '1px 3px',
              borderRadius: '4px',
              fontSize: '8px'
            }}>
              🏠
            </span>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#8e8e93',
            fontSize: '12px'
          }}>
            ❤️ {plug.likes || 0}
          </div>
          <div style={{
            color: '#8e8e93',
            fontSize: '12px'
          }}>
            {plug.countries?.join(', ') || '🌍'}
          </div>
        </div>
      </div>
    </Link>
  )
}