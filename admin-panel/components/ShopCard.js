import Link from 'next/link'
import { getProxiedImageUrl } from '../lib/imageUtils'

export default function ShopCard({ plug, index, layout = 'grid' }) {
  const getPositionBadge = (position) => {
    if (position === 0) return '🥇'
    if (position === 1) return '🥈'
    if (position === 2) return '🥉'
    return null
  }

  // Layout liste (pour VIP et recherche)
  if (layout === 'list') {
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
        }}>
          {/* Image/Logo */}
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
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🏪
              </div>
            )}
            
            {/* Badge VIP sur l'image */}
            {plug.isVip && (
              <div style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                backgroundColor: '#FFD700',
                color: '#000000',
                padding: '2px 4px',
                borderRadius: '4px',
                fontSize: '8px',
                fontWeight: 'bold'
              }}>
                ⭐
              </div>
            )}
          </div>

          {/* Informations principales */}
          <div style={{ 
            flex: 1,
            minWidth: 0
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '4px'
            }}>
              <h3 style={{
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 'bold',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1
              }}>
                {plug.name}
              </h3>
              
              {getPositionBadge(index) && (
                <span style={{ fontSize: '16px' }}>
                  {getPositionBadge(index)}
                </span>
              )}
            </div>
            
            <p style={{
              color: '#8e8e93',
              fontSize: '12px',
              margin: '0 0 8px 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {plug.description}
            </p>
            
            {/* Services */}
            <div style={{ 
              display: 'flex', 
              gap: '4px', 
              marginBottom: '8px',
              flexWrap: 'wrap'
            }}>
              {plug.services?.delivery?.enabled && (
                <span style={{
                  backgroundColor: '#007AFF',
                  color: '#ffffff',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  🚚 Livraison
                </span>
              )}
              {plug.services?.postal?.enabled && (
                <span style={{
                  backgroundColor: '#34C759',
                  color: '#ffffff',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  ✈️ Postal
                </span>
              )}
              {plug.services?.meetup?.enabled && (
                <span style={{
                  backgroundColor: '#FF9500',
                  color: '#ffffff',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  🏠 Meetup
                </span>
              )}
            </div>
            
            {/* Footer info */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: '#8e8e93'
            }}>
              <span>❤️ {plug.likes || 0} likes</span>
              <span>{plug.countries?.join(', ') || '🌍'}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Layout grid (pour l'accueil) - format existant
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