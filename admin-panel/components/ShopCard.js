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

  // Fonction pour extraire les codes postaux selon le pays
  const extractCodesForCountry = (text, country) => {
    if (!text) return []
    const codes = new Set()
    
    switch(country) {
      case 'France':
        // Pour la France: chercher les départements (2 chiffres) ou codes postaux (5 chiffres)
        const frenchCodes = text.match(/\b(0[1-9]|[1-8][0-9]|9[0-5])(\d{3})?\b/g) || []
        frenchCodes.forEach(code => {
          // Si c'est un code postal complet, extraire le département
          if (code.length === 5) {
            codes.add(code.substring(0, 2))
          } else {
            codes.add(code)
          }
        })
        break
        
      case 'Belgique':
      case 'Suisse':
        // Pour Belgique/Suisse: codes à 4 chiffres
        const fourDigitCodes = text.match(/\b[1-9]\d{3}\b/g) || []
        fourDigitCodes.forEach(code => codes.add(code))
        break
        
      case 'Allemagne':
      case 'Espagne':
      case 'Italie':
      case 'Thaïlande':
        // Codes à 5 chiffres
        const fiveDigitCodes = text.match(/\b\d{5}\b/g) || []
        fiveDigitCodes.forEach(code => codes.add(code))
        break
        
      case 'Royaume-Uni':
        // Format UK: lettres et chiffres
        const ukCodes = text.match(/\b[A-Z]{1,2}\d{1,2}[A-Z]?\b/gi) || []
        ukCodes.forEach(code => codes.add(code.toUpperCase()))
        break
        
      case 'Canada':
        // Format Canada: A1A
        const canadaCodes = text.match(/\b[A-Z]\d[A-Z]\b/gi) || []
        canadaCodes.forEach(code => codes.add(code.toUpperCase()))
        break
        
      case 'États-Unis':
      case 'USA':
        // USA: 5 chiffres
        const usaCodes = text.match(/\b\d{5}\b/g) || []
        usaCodes.forEach(code => codes.add(code))
        break
        
      default:
        // Par défaut: chercher des nombres de 2 à 5 chiffres
        const defaultCodes = text.match(/\b\d{2,5}\b/g) || []
        defaultCodes.forEach(code => codes.add(code))
    }
    
    return Array.from(codes)
  }

  // Fonction pour extraire les codes postaux d'une description
  const extractPostalCodes = (description, countries) => {
    if (!description) return []
    const departments = new Set()
    const country = countries && countries.length > 0 ? countries[0] : null
    
    // Fonction pour vérifier si un code correspond au format d'un pays
    const isValidCodeForCountry = (code, targetCountry) => {
      const cleanCode = code.trim().toUpperCase()
      
      switch(targetCountry) {
        case 'France':
          return /^(0[1-9]|[1-8][0-9]|9[0-5]|97[1-8]|98[4-9])$/.test(cleanCode) ||
                 /^(0[1-9]|[1-8][0-9]|9[0-5]|97[1-8]|98[4-9])\d{3}$/.test(cleanCode)
        case 'Suisse':
          return /^[1-9]\d{3}$/.test(cleanCode)
        case 'Belgique':
          return /^[1-9]\d{3}$/.test(cleanCode)
        case 'Allemagne':
          return /^[0-9]{5}$/.test(cleanCode)
        case 'Espagne':
          return /^(0[1-9]|[1-4][0-9]|5[0-2])\d{3}$/.test(cleanCode)
        case 'Italie':
          return /^[0-9]{5}$/.test(cleanCode)
        case 'Thaïlande':
          return /^[1-9]\d{4}$/.test(cleanCode)
        default:
          return /^\d{2,5}$/.test(cleanCode)
      }
    }
    
    // Fonction pour simplifier selon le pays
    const simplifyCodeByCountry = (code, detectedCountry) => {
      const cleanCode = code.trim().toUpperCase()
      
      // Ne traiter que si le code est valide pour ce pays
      if (detectedCountry && !isValidCodeForCountry(cleanCode, detectedCountry)) {
        return null
      }
      
      switch(detectedCountry) {
        case 'France':
          if (/^\d{5}$/.test(cleanCode)) {
            return cleanCode.substring(0, 2)
          }
          return cleanCode
        case 'Suisse':
        case 'Belgique':
          return cleanCode
        case 'Allemagne':
        case 'Espagne':
        case 'Italie':
        case 'Thaïlande':
          return cleanCode
        default:
          if (/^\d{2}$/.test(cleanCode)) {
            return cleanCode
          }
          if (/^\d{3,5}$/.test(cleanCode)) {
            // Si ressemble à un code français
            if (/^(0[1-9]|[1-8][0-9]|9[0-5])\d{3}$/.test(cleanCode)) {
              return cleanCode.substring(0, 2)
            }
            return cleanCode
          }
          return cleanCode
      }
    }
    
    // Extraire tous les codes numériques
    const patterns = [
      /\b\d{5}\b/g,  // 5 chiffres
      /\b\d{4}\b/g,  // 4 chiffres
      /\b\d{3}\b/g,  // 3 chiffres
      /\b\d{2}\b/g   // 2 chiffres
    ]
    
    patterns.forEach(pattern => {
      const matches = description.match(pattern) || []
      matches.forEach(match => {
        const simplified = simplifyCodeByCountry(match, country)
        if (simplified) {
          departments.add(simplified)
        }
      })
    })
    
    return Array.from(departments).sort((a, b) => {
      const aNum = parseInt(a)
      const bNum = parseInt(b)
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum
      }
      return a.localeCompare(b, undefined, { numeric: true })
    })
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
      'japon': '🇯🇵',
      'japan': '🇯🇵',
      'brésil': '🇧🇷',
      'brazil': '🇧🇷',
      'cameroun': '🇨🇲',
      'cameroon': '🇨🇲',
      'sénégal': '🇸🇳',
      'senegal': '🇸🇳',
      'madagascar': '🇲🇬',
      'australie': '🇦🇺',
      'australia': '🇦🇺',
      'côte d\'ivoire': '🇨🇮',
      'ivory coast': '🇨🇮',
      // Pays existants
      'tunisie': '🇹🇳',
      'tunisia': '🇹🇳',
      'algérie': '🇩🇿',
      'algeria': '🇩🇿',
      'autre': '🌍',
      'other': '🌍'
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
                      // Si un pays est filtré, n'afficher que les codes de ce pays
                      const countryToUse = filteredCountry || (plug.countries && plug.countries[0])
                      const codes = filteredCountry 
                        ? extractCodesForCountry(plug.services.delivery.description, filteredCountry)
                        : extractPostalCodes(plug.services.delivery.description, plug.countries)
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
                      // Si un pays est filtré, n'afficher que les codes de ce pays
                      const countryToUse = filteredCountry || (plug.countries && plug.countries[0])
                      const codes = filteredCountry 
                        ? extractCodesForCountry(plug.services.meetup.description, filteredCountry)
                        : extractPostalCodes(plug.services.meetup.description, plug.countries)
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