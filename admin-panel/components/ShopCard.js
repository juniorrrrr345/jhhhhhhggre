import Link from 'next/link'
import { useState } from 'react'
import { getProxiedImageUrl } from '../lib/imageUtils'
import { translateCountry, translateCountries, getCountryFlag } from '../lib/country-translations'

export default function ShopCard({ plug, index, layout = 'grid', currentLanguage = 'fr', showCountry = false, filteredCountry = '' }) {
  const [likes, setLikes] = useState(plug.likes || 0)
  const [isVoting, setIsVoting] = useState(false)
  
  const getPositionBadge = (position) => {
    if (position === 0) return '🥇'
    if (position === 1) return '🥈'
    if (position === 2) return '🥉'
    return null
  }

  // Fonction pour extraire les codes postaux d'une description
  const extractPostalCodes = (description) => {
    if (!description) return []
    const departments = new Set()
    
    // D'abord extraire les codes complexes pour éviter les doublons
    const complexPatterns = [
      { pattern: /\b\d{5}-\d{4}\b/g, type: 'usa-long' }, // USA: 12345-6789
      { pattern: /\b\d{5}-\d{3}\b/g, type: 'brazil' }, // Brésil: 01310-100
      { pattern: /\b\d{4}-\d{3}\b/g, type: 'portugal' }, // Portugal: 4000-123
      { pattern: /\b\d{3}-\d{4}\b/g, type: 'japan' }, // Japon: 100-0001
      { pattern: /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d?[A-Z]{0,2}\b/gi, type: 'uk' }, // UK: SW1A 1AA
      { pattern: /\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/gi, type: 'canada' }, // Canada: H2X 1Y7
      { pattern: /\b\d{4}\s?[A-Z]{2}\b/gi, type: 'netherlands' }, // Pays-Bas: 1011 AB
      { pattern: /\b\d{5}\b/g, type: 'five-digits' }, // 5 chiffres
      { pattern: /\b\d{4}\b/g, type: 'four-digits' }, // 4 chiffres
      { pattern: /\b\d{3}\b/g, type: 'three-digits' }, // 3 chiffres
      { pattern: /\b\d{2}\b/g, type: 'two-digits' } // 2 chiffres
    ]
    
    // Marquer les positions déjà utilisées pour éviter les doublons
    const usedPositions = new Set()
    
    complexPatterns.forEach(({ pattern, type }) => {
      let match
      while ((match = pattern.exec(description)) !== null) {
        const startPos = match.index
        const endPos = match.index + match[0].length
        
        // Vérifier si cette position n'est pas déjà utilisée
        let overlap = false
        for (let i = startPos; i < endPos; i++) {
          if (usedPositions.has(i)) {
            overlap = true
            break
          }
        }
        
        if (!overlap) {
          // Marquer les positions comme utilisées
          for (let i = startPos; i < endPos; i++) {
            usedPositions.add(i)
          }
          
          const cleaned = match[0].trim().toUpperCase()
          
          switch (type) {
            case 'usa-long': // 12345-6789 → 123
              departments.add(cleaned.substring(0, 3))
              break
            case 'brazil': // 01310-100 → 013
              departments.add(cleaned.substring(0, 3))
              break
            case 'portugal': // 4000-123 → 40
              departments.add(cleaned.substring(0, 2))
              break
            case 'japan': // 100-0001 → 100
              departments.add(cleaned.substring(0, 3))
              break
            case 'uk': // SW1A 1AA → SW1
              const ukMatch = cleaned.match(/^([A-Z]{1,2}\d{1,2})[A-Z]?/)
              if (ukMatch) departments.add(ukMatch[1])
              break
            case 'canada': // H2X 1Y7 → H2
              departments.add(cleaned.substring(0, 2))
              break
            case 'netherlands': // 1011 AB → 10
              departments.add(cleaned.substring(0, 2))
              break
            case 'five-digits': // 75001 → 75
              departments.add(cleaned.substring(0, 2))
              break
            case 'four-digits': // 1000 → 10
              departments.add(cleaned.substring(0, 2))
              break
            case 'three-digits': // 100 → 100
              departments.add(cleaned)
              break
            case 'two-digits': // 75 → 75
              departments.add(cleaned)
              break
          }
        }
      }
    })
    
    return Array.from(departments).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
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

  const getCountryFlagByName = (countryName) => {
    const countryFlags = {
      // Pays européens
      'france': '🇫🇷',
      'allemagne': '🇩🇪',
      'germany': '🇩🇪',
      'italie': '🇮🇹',
      'italy': '🇮🇹',
      'espagne': '🇪🇸',
      'spain': '🇪🇸',
      'portugal': '🇵🇹',
      'royaume-uni': '🇬🇧',
      'uk': '🇬🇧',
      'belgique': '🇧🇪',
      'belgium': '🇧🇪',
      'pays-bas': '🇳🇱',
      'netherlands': '🇳🇱',
      'suisse': '🇨🇭',
      'switzerland': '🇨🇭',
      'autriche': '🇦🇹',
      'austria': '🇦🇹',
      'luxembourg': '🇱🇺',
      'irlande': '🇮🇪',
      'ireland': '🇮🇪',
      'danemark': '🇩🇰',
      'denmark': '🇩🇰',
      'suède': '🇸🇪',
      'sweden': '🇸🇪',
      'norvège': '🇳🇴',
      'norway': '🇳🇴',
      'finlande': '🇫🇮',
      'finland': '🇫🇮',
      'islande': '🇮🇸',
      'iceland': '🇮🇸',
      'pologne': '🇵🇱',
      'poland': '🇵🇱',
      'république tchèque': '🇨🇿',
      'czech republic': '🇨🇿',
      'slovaquie': '🇸🇰',
      'slovakia': '🇸🇰',
      'hongrie': '🇭🇺',
      'hungary': '🇭🇺',
      'slovénie': '🇸🇮',
      'slovenia': '🇸🇮',
      'croatie': '🇭🇷',
      'croatia': '🇭🇷',
      'roumanie': '🇷🇴',
      'romania': '🇷🇴',
      'bulgarie': '🇧🇬',
      'bulgaria': '🇧🇬',
      'grèce': '🇬🇷',
      'greece': '🇬🇷',
      'chypre': '🇨🇾',
      'cyprus': '🇨🇾',
      'malte': '🇲🇹',
      'malta': '🇲🇹',
      'estonie': '🇪🇪',
      'estonia': '🇪🇪',
      'lettonie': '🇱🇻',
      'latvia': '🇱🇻',
      'lituanie': '🇱🇹',
      'lithuania': '🇱🇹',
      'monaco': '🇲🇨',
      'andorre': '🇦🇩',
      'andorra': '🇦🇩',
      'saint-marin': '🇸🇲',
      'san marino': '🇸🇲',
      'vatican': '🇻🇦',
      'liechtenstein': '🇱🇮',
      // Pays supplémentaires
      'maroc': '🇲🇦',
      'morocco': '🇲🇦',
      'canada': '🇨🇦',
      'usa': '🇺🇸',
      'états-unis': '🇺🇸',
      'united states': '🇺🇸',
      'thaïlande': '🇹🇭',
      'thailand': '🇹🇭',
      // Pays existants
      'tunisie': '🇹🇳',
      'tunisia': '🇹🇳',
      'algérie': '🇩🇿',
      'algeria': '🇩🇿',
      'autre': '🌍'
    };
    
    if (!countryName) return '🌍';
    const normalizedCountry = countryName.toLowerCase().trim();
    return countryFlags[normalizedCountry] || '🌍';
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
            <span style={{ fontSize: '16px' }}>
              {showCountry && filteredCountry 
                ? getCountryFlag(filteredCountry) 
                : (plug.countries && plug.countries.length > 0 
                  ? plug.countries.map(country => getCountryFlag(country)).join(' ')
                  : '🌍')
              }
            </span>
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

          {/* Services avec départements - Structure améliorée */}
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
                <span>🛵</span>
                <span>{translateService('delivery')}</span>
                {plug.services?.delivery?.description && (
                  <span style={{ opacity: 0.8, marginLeft: '2px' }}>
                    {(() => {
                      const codes = extractPostalCodes(plug.services.delivery.description)
                      if (codes.length > 0) {
                        return `(${codes.slice(0, 3).join(', ')}${codes.length > 3 ? '...' : ''})`
                      }
                      return ''
                    })()}
                  </span>
                )}
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
                {plug.services?.meetup?.description && (
                  <span style={{ opacity: 0.8, marginLeft: '2px' }}>
                    {(() => {
                      const codes = extractPostalCodes(plug.services.meetup.description)
                      if (codes.length > 0) {
                        return `(${codes.slice(0, 3).join(', ')}${codes.length > 3 ? '...' : ''})`
                      }
                      return ''
                    })()}
                  </span>
                )}
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