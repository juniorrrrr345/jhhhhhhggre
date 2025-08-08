import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { simpleApi as api } from '../../lib/api-simple'
import { getProxiedImageUrl } from '../../lib/imageUtils'
import toast from 'react-hot-toast'
import LanguageSelector, { useTranslation, getCurrentLanguage } from '../../components/LanguageSelector'
import ShopNavigation from '../../components/ShopNavigation'
import { useLanguage } from '../../hooks/useLanguage'
import { translateCountry, getCountryFlag } from '../../lib/country-translations'

export default function ShopPlugDetail() {
  const router = useRouter()
  const { id } = router.query
  const [plug, setPlug] = useState(null)
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [likes, setLikes] = useState(0)
  const [isVoting, setIsVoting] = useState(false)
  const currentLanguage = useLanguage()
  const [, setCurrentLanguage] = useState('fr') // Gardé pour la compatibilité
  const { t } = useTranslation(currentLanguage)

  // Fonction pour obtenir le texte des votes traduit
  const getVotesText = () => {
    const translations = {
      fr: likes === 1 ? 'vote' : 'votes',
      en: likes === 1 ? 'vote' : 'votes',
      it: likes === 1 ? 'voto' : 'voti',
      es: likes === 1 ? 'voto' : 'votos',
      de: likes === 1 ? 'Stimme' : 'Stimmen'
    }
    return translations[currentLanguage] || translations.fr
  }

  useEffect(() => {
    // Initialiser la langue depuis localStorage
    if (typeof window !== 'undefined') {
      setCurrentLanguage(getCurrentLanguage())
    }
  }, [])

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage)
  }

  useEffect(() => {
    if (router.isReady && id) {
      const loadData = async () => {
        try {
          setInitialLoading(true)
          await Promise.all([fetchConfig(), fetchPlug(id)])
        } catch (error) {
          console.error('❌ Erreur chargement données:', error)
        } finally {
          setInitialLoading(false)
        }
      }
      loadData()

      // SYNC TEMPS RÉEL avec panel admin
      const handleForceRefresh = (event) => {
        console.log('🚀 Signal panel admin reçu DÉTAILS BOUTIQUE - FORCE refresh...');
        console.log('📊 Détails:', event.detail);
        
        // Si c'est une suppression, on peut déjà savoir que la page va devenir invalide
        if (event.detail?.changeType === 'shop_deleted') {
          console.log('🗑️ Boutique supprimée - refresh pour vérifier si cette boutique existe encore');
        }
        
        setTimeout(() => {
          fetchPlug(id);
          fetchConfig();
          console.log('🔄 DÉTAILS: Boutique et config rechargées après modification panel admin');
        }, 200);
      };
      
      window.addEventListener('forceRefreshMiniApp', handleForceRefresh);
      
      // Cleanup
      return () => {
        window.removeEventListener('forceRefreshMiniApp', handleForceRefresh);
      };
    }
  }, [router.isReady, id])

  // Fonction pour extraire les codes postaux d'une description
  const extractPostalCodes = (description) => {
    if (!description) return []
    const departments = new Set()
    
    const complexPatterns = [
      { pattern: /\b\d{5}-\d{4}\b/g, type: 'usa-long' },
      { pattern: /\b\d{5}-\d{3}\b/g, type: 'brazil' },
      { pattern: /\b\d{4}-\d{3}\b/g, type: 'portugal' },
      { pattern: /\b\d{3}-\d{4}\b/g, type: 'japan' },
      { pattern: /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d?[A-Z]{0,2}\b/gi, type: 'uk' },
      { pattern: /\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/gi, type: 'canada' },
      { pattern: /\b\d{4}\s?[A-Z]{2}\b/gi, type: 'netherlands' },
      { pattern: /\b\d{5}\b/g, type: 'five-digits' },
      { pattern: /\b\d{4}\b/g, type: 'four-digits' },
      { pattern: /\b\d{3}\b/g, type: 'three-digits' },
      { pattern: /\b\d{2}\b/g, type: 'two-digits' }
    ]
    
    const usedPositions = new Set()
    
    complexPatterns.forEach(({ pattern, type }) => {
      let match
      while ((match = pattern.exec(description)) !== null) {
        const startPos = match.index
        const endPos = match.index + match[0].length
        
        let overlap = false
        for (let i = startPos; i < endPos; i++) {
          if (usedPositions.has(i)) {
            overlap = true
            break
          }
        }
        
        if (!overlap) {
          for (let i = startPos; i < endPos; i++) {
            usedPositions.add(i)
          }
          
          const cleaned = match[0].trim().toUpperCase()
          
          switch (type) {
            case 'usa-long':
              departments.add(cleaned.substring(0, 3))
              break
            case 'brazil':
              departments.add(cleaned.substring(0, 3))
              break
            case 'portugal':
              departments.add(cleaned.substring(0, 2))
              break
            case 'japan':
              departments.add(cleaned.substring(0, 3))
              break
            case 'uk':
              const ukMatch = cleaned.match(/^([A-Z]{1,2}\d{1,2})[A-Z]?/)
              if (ukMatch) departments.add(ukMatch[1])
              break
            case 'canada':
              departments.add(cleaned.substring(0, 2))
              break
            case 'netherlands':
              departments.add(cleaned.substring(0, 2))
              break
            case 'five-digits':
              departments.add(cleaned.substring(0, 2))
              break
            case 'four-digits':
              departments.add(cleaned.substring(0, 2))
              break
            case 'three-digits':
              departments.add(cleaned)
              break
            case 'two-digits':
              departments.add(cleaned)
              break
          }
        }
      }
    })
    
    return Array.from(departments).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  }

  // Fonction pour extraire et organiser les codes postaux par pays
  const extractPostalCodesByCountry = (description, countries) => {
    if (!description || !countries || countries.length === 0) return {}
    
    const codesByCountry = {}
    
    // Initialiser tous les pays
    countries.forEach(country => {
      codesByCountry[country] = []
    })
    
    // Extraire tous les codes
    const allCodes = extractPostalCodes(description)
    
    // Pour l'instant, assigner tous les codes à chaque pays
    // (l'utilisateur peut préciser dans la description si nécessaire)
    countries.forEach(country => {
      codesByCountry[country] = [...allCodes]
    })
    
    return codesByCountry
  }

  const fetchConfig = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://safepluglink-6hzr.onrender.com'
      const timestamp = new Date().getTime()
      
      let data
      try {
        const directResponse = await fetch(`${apiBaseUrl}/api/public/config?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        
        if (directResponse.ok) {
          data = await directResponse.json()
        } else {
          throw new Error(`Direct config failed: HTTP ${directResponse.status}`)
        }
      } catch (directError) {
        console.log('❌ Config détail directe échouée:', directError.message)
        
        try {
          const proxyResponse = await fetch(`/api/proxy?endpoint=/api/public/config&t=${new Date().getTime()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          })
          
          if (!proxyResponse.ok) {
            throw new Error(`Config proxy failed: HTTP ${proxyResponse.status}`)
          }
          
          data = await proxyResponse.json()
        } catch (proxyError) {
          console.log('❌ Config détail proxy échouée:', proxyError.message)
          throw proxyError
        }
      }

      setConfig(data)
    } catch (error) {
      console.log('❌ Erreur chargement config détail:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchPlug = async (id) => {
    try {
      setLoading(true)
      console.log('🔍 Recherche boutique ID:', id)
      
      let data = null
      
      // APPEL DIRECT au bot d'abord (même logique que la page principale)
      try {
        console.log('📡 Tentative connexion DIRECTE pour détail boutique...')
        const directResponse = await fetch('https://safepluglink-6hzr.onrender.com/api/public/plugs?limit=100', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(8000) // 8 secondes
        })
        
        if (directResponse.ok) {
          data = await directResponse.json()
          console.log('✅ Connexion DIRECTE détail réussie:', data.plugs?.length || 0, 'boutiques')
        } else {
          throw new Error(`Direct API failed: ${directResponse.status}`)
        }
      } catch (directError) {
        console.log('⚠️ Connexion directe détail échouée:', directError.message)
        
        // FALLBACK: Utiliser le proxy Vercel
        try {
          console.log('🔄 Tentative via PROXY Vercel pour détail...')
          const proxyResponse = await fetch('/api/cors-proxy?endpoint=/api/public/plugs&limit=100', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(8000)
          })
          
          if (proxyResponse.ok) {
            data = await proxyResponse.json()
            console.log('✅ Connexion PROXY détail réussie:', data.plugs?.length || 0, 'boutiques')
          } else {
            throw new Error(`Proxy failed: ${proxyResponse.status}`)
          }
        } catch (proxyError) {
          console.error('❌ Proxy détail aussi échoué:', proxyError.message)
          setNotFound(true)
          return
        }
      }

      // Traiter les données récupérées
      if (!data || (!data.plugs && !Array.isArray(data))) {
        console.error('❌ Aucune donnée de boutiques reçue:', data)
        setNotFound(true)
        return
      }

      let plugsArray = []
      if (data && Array.isArray(data.plugs)) {
        plugsArray = data.plugs
      } else if (Array.isArray(data)) {
        plugsArray = data
      } else {
        console.error('❌ Structure de données inattendue:', data)
        setNotFound(true)
        return
      }

      console.log('🔍 Recherche ID:', id, 'dans', plugsArray.length, 'boutiques')
      console.log('📋 IDs disponibles:', plugsArray.map(p => p._id).slice(0, 5))

      // Rechercher la boutique avec l'ID exact
      const foundPlug = plugsArray.find(p => p._id && p._id.toString() === id.toString())
      
      if (foundPlug) {
        console.log('✅ Boutique trouvée:', foundPlug.name)
        
        // S'assurer que les services existent
        if (!foundPlug.services) {
          foundPlug.services = {
            delivery: { enabled: false, departments: [] },
            postal: { enabled: false, description: '' },
            meetup: { enabled: false, departments: [] }
          }
        }
        
        setPlug(foundPlug)
        setLikes(foundPlug.likes || 0)
        setNotFound(false)
      } else {
        console.log('❌ Boutique non trouvée avec ID:', id)
        console.log('📋 Toutes les boutiques:', plugsArray.map(p => ({ id: p._id, name: p.name })))
        setNotFound(true)
      }
    } catch (error) {
      console.error('❌ Erreur chargement plug détail:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const formatText = (text) => {
    if (!text) return ''
    return text.split('\\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\\n').length - 1 && <br />}
      </span>
    ))
  }

  const getCountryFlags = (countries) => {
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
      'Pays-Bas': '🇳🇱',
      'Luxembourg': '🇱🇺',
      'Autriche': '🇦🇹',
      'Irlande': '🇮🇪',
      'Danemark': '🇩🇰',
      'Suède': '🇸🇪',
      'Norvège': '🇳🇴',
      'Finlande': '🇫🇮',
      'Islande': '🇮🇸',
      'Pologne': '🇵🇱',
      'République Tchèque': '🇨🇿',
      'Slovaquie': '🇸🇰',
      'Hongrie': '🇭🇺',
      'Slovénie': '🇸🇮',
      'Croatie': '🇭🇷',
      'Roumanie': '🇷🇴',
      'Bulgarie': '🇧🇬',
      'Grèce': '🇬🇷',
      'Chypre': '🇨🇾',
      'Malte': '🇲🇹',
      'Estonie': '🇪🇪',
      'Lettonie': '🇱🇻',
      'Lituanie': '🇱🇹',
      'Monaco': '🇲🇨',
      'Andorre': '🇦🇩',
      'Saint-Marin': '🇸🇲',
      'Liechtenstein': '🇱🇮',
      'États-Unis': '🇺🇸',
      'USA': '🇺🇸',
      'Brésil': '🇧🇷',
      'Japon': '🇯🇵',
      'Australie': '🇦🇺',
      'Thaïlande': '🇹🇭',
      'Maroc': '🇲🇦',
      'Tunisie': '🇹🇳',
      'Sénégal': '🇸🇳',
      'Algérie': '🇩🇿',
      'Madagascar': '🇲🇬',
      'Cameroun': '🇨🇲',
      'Autre': '🌍'
    }
    
    // Retourner tous les drapeaux
    return countries.map(country => countryFlagMap[country] || '🌍').join(' ')
  }

  const handleVote = async () => {
    if (isVoting || !plug) return
    
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
        toast.success(`${t('vote_added')} ! ${result.plugName} ${t('has_now')} ${result.likes} ${t('likes')}`)
        console.log(`✅ Vote réussi: ${result.plugName} - ${result.likes} likes`)
      } else {
        toast.error(result.error || t('error_voting'))
        console.error('❌ Erreur vote:', result.error)
      }
    } catch (error) {
      toast.error(t('error_connection'))
      console.error('❌ Erreur lors du vote:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const translateService = (serviceKey) => {
    const serviceMap = {
      'delivery': t('delivery'),
      'postal': t('postal'), 
      'meetup': t('meetup')
    }
    return serviceMap[serviceKey] || serviceKey
  }

  if (initialLoading) {
    return (
      <>
        <Head>
          <title>{t('loading') || 'Chargement'}...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>
        <div style={{ backgroundColor: '#000000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '60px', 
              height: '60px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}>
              <img 
                src="https://i.imgur.com/VwBPgtw.jpeg" 
                alt="FindYourPlug Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
            <p style={{ color: '#ffffff', fontWeight: '500' }}>{t('loading_shop') || 'Chargement de la boutique'}...</p>
          </div>
        </div>
      </>
    )
  }

  if (notFound) {
    return (
      <>
        <Head>
          <title>{t('shop_not_found') || 'Boutique non trouvée'}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>
        <div style={{ 
          backgroundColor: '#1a1a1a',
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), 
            url("https://i.imgur.com/VwBPgtw.jpeg")
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#ffffff',
          fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="https://i.imgur.com/VwBPgtw.jpeg" 
                alt="FindYourPlug Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#ffffff' }}>
              {t('shop_not_found') || 'Boutique non trouvée'}
            </h3>
            <p style={{ color: '#8e8e93', marginBottom: '32px', fontSize: '16px' }}>
              {t('shop_not_found_desc') || 'Cette boutique n\'existe pas ou a été supprimée.'}
            </p>
            <Link href="/shop" style={{ 
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#007AFF',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '500'
            }}>
              ← {t('back_to_shops') || 'Retour aux boutiques'}
            </Link>
          </div>
        </div>
      </>
    )
  }

  // Protection supplémentaire pour s'assurer que plug est défini
  if (!plug) {
    return (
      <>
        <Head>
          <title>{t('loading') || 'Chargement'}...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>
        <div style={{ backgroundColor: '#000000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '60px', 
              height: '60px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}>
              <img 
                src="https://i.imgur.com/VwBPgtw.jpeg" 
                alt="FindYourPlug Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
            <p style={{ color: '#ffffff', fontWeight: '500' }}>{t('loading_shop') || 'Chargement de la boutique'}...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
              <Head>
          <title>{plug?.name || 'Boutique'} - FindYourPlug</title>
          <meta name="description" content={plug?.description || ''} />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>

      <div style={{ 
        backgroundColor: '#000000', 
        minHeight: '100vh',
        color: '#ffffff',
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backgroundImage: config?.boutique?.backgroundImage ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("${config.boutique.backgroundImage}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        {/* Header */}
        <div style={{ 
          backgroundColor: '#000000',
          padding: '20px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <button 
              onClick={() => router.back()} 
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#333333',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                minWidth: 'fit-content'
              }}
            >
              ← {t('back') || 'Retour'}
            </button>
            
            <LanguageSelector 
              onLanguageChange={handleLanguageChange} 
              currentLanguage={currentLanguage} 
              compact={true} 
            />
            
            {plug && plug.isVip && (
              <div style={{
                backgroundColor: '#FFD700',
                color: '#000000',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap'
              }}>
                ⭐ VIP
              </div>
            )}
          </div>
          
          {plug && (
            <>
              <h1 style={{ 
                fontSize: 'clamp(24px, 5vw, 32px)', 
                fontWeight: 'bold', 
                margin: '0 0 8px 0',
                color: '#ffffff',
                letterSpacing: '1px',
                wordBreak: 'break-word',
                lineHeight: '1.2'
              }}>
                {plug.name}
              </h1>
              
              {plug.description && (
                <p style={{ 
                  color: '#8e8e93', 
                  fontSize: '14px',
                  margin: '0',
                  lineHeight: '1.4',
                  maxWidth: '600px',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}>
                  {plug.description}
                </p>
              )}
            </>
          )}
        </div>

        {/* Main Content */}
        <main style={{ padding: '20px', paddingBottom: '90px', maxWidth: '800px', margin: '0 auto' }}>
          {plug && (
            <>
              {/* Image principale */}
              <div style={{ 
                width: '100%', 
                height: '240px', 
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#2a2a2a',
                marginBottom: '20px',
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
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `
                        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px;">
                          ${plug.isVip ? '👑' : '🏪'}
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '48px'
                  }}>
                    {plug.isVip ? '👑' : '🏪'}
                  </div>
                )}
                
                {/* Badge VIP overlay */}
                {plug.isVip && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: '#FFD700',
                    color: '#000000',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    👑 VIP
                  </div>
                )}
              </div>

              {/* Statistiques principales */}
              <div style={{ 
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '16px',
                border: plug.isVip ? '2px solid #FFD700' : '1px solid #2a2a2a'
              }}>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                  gap: '20px',
                  textAlign: 'center',
                  alignItems: 'start'
                }}>
                  {/* Votes - AFFICHAGE SEULEMENT */}
                  <div style={{ 
                    padding: '12px',
                    minWidth: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      marginBottom: '12px',
                      padding: '8px',
                      color: '#ffffff',
                      textAlign: 'center'
                    }}>
                      👍
                    </div>
                    <div style={{ 
                      fontSize: 'clamp(18px, 4vw, 24px)', 
                      fontWeight: 'bold', 
                      color: plug.isVip ? '#FFD700' : '#ffffff',
                      marginBottom: '8px',
                      textAlign: 'center'
                    }}>
                      {likes}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#8e8e93',
                      wordBreak: 'break-word',
                      textAlign: 'center',
                      lineHeight: '1.4',
                      minHeight: '20px'
                    }}>
                      {getVotesText()}
                    </div>
                  </div>
                  
                  {/* Pays */}
                  <div style={{ 
                    padding: '12px',
                    minWidth: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start'
                  }}>
                    <div style={{ 
                      fontSize: '24px', 
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}>
                      {getCountryFlag(plug.countries)}
                    </div>
                    <div style={{ 
                      fontSize: 'clamp(18px, 4vw, 24px)', 
                      fontWeight: 'bold', 
                      color: '#ffffff',
                      marginBottom: '8px',
                      textAlign: 'center'
                    }}>
                      {plug.countries ? plug.countries.length : 0}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#8e8e93',
                      wordBreak: 'break-word',
                      textAlign: 'center',
                      lineHeight: '1.4',
                      minHeight: '20px'
                    }}>
                      {t('countries') || 'Pays'}
                    </div>
                  </div>

                  {/* Type */}
                  <div style={{ 
                    padding: '12px',
                    minWidth: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start'
                  }}>
                    <div style={{ 
                      fontSize: '24px', 
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}>⭐</div>
                    <div style={{ 
                      fontSize: 'clamp(14px, 3vw, 18px)', 
                      fontWeight: 'bold', 
                      color: plug.isVip ? '#FFD700' : '#ffffff',
                      marginBottom: '8px',
                      textAlign: 'center'
                    }}>
                      {plug.isVip ? 'VIP' : 'STD'}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#8e8e93',
                      wordBreak: 'break-word',
                      textAlign: 'center',
                      lineHeight: '1.4',
                      minHeight: '20px'
                    }}>
                      {t('type') || 'Type'}
                    </div>
                  </div>
                </div>

                {/* Localisation */}
                {plug?.countries && Array.isArray(plug.countries) && plug.countries.length > 0 && (
                  <div style={{ 
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid #2a2a2a'
                  }}>
                    <h3 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      marginBottom: '8px',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      📍 {t('location') || 'Localisation'}
                    </h3>
                    <p style={{ 
                      color: '#8e8e93', 
                      fontSize: '15px', 
                      margin: '0',
                      lineHeight: '1.4',
                      wordBreak: 'break-word'
                    }}>
                      {plug.countries.map(country => translateCountry(country, currentLanguage)).join(', ')}
                    </p>
                  </div>
                )}
              </div>

              {/* Services */}
              <div style={{ 
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '16px'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '16px',
                  color: '#ffffff'
                }}>
                  🚀 {t('detail_available_services')}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Livraison */}
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 100px',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: plug?.services?.delivery?.enabled ? '#0a4a2a' : '#2a2a2a',
                    borderRadius: '8px',
                    border: plug?.services?.delivery?.enabled ? '1px solid #22c55e' : '1px solid #3a3a3a',
                    minHeight: '70px'
                  }}>
                    {/* Emoji */}
                    <div style={{
                      fontSize: '22px',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      📦
                    </div>
                    
                    {/* Texte service centré */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      minHeight: '40px'
                    }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: '#ffffff',
                        fontSize: '16px',
                        lineHeight: '1.3',
                        wordBreak: 'break-word',
                        marginBottom: '4px'
                      }}>
                        {translateService('delivery') || 'Livraison'}
                      </div>
                      {/* Description ou départements livraison */}
                      {plug?.services?.delivery?.enabled && plug?.services?.delivery?.description && (
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#22c55e',
                          lineHeight: '1.2',
                          marginBottom: '2px',
                          fontWeight: '500'
                        }}>
                          📍 {plug.services.delivery.description}
                        </div>
                      )}
                      {plug?.services?.delivery?.price && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#8e8e93',
                          lineHeight: '1.2'
                        }}>
                          {plug.services.delivery.price}
                        </div>
                      )}
                    </div>
                    
                    {/* Statut */}
                    <div style={{ 
                      color: plug?.services?.delivery?.enabled ? '#22c55e' : '#ef4444',
                      fontWeight: '600',
                      fontSize: '12px',
                      textAlign: 'center',
                      lineHeight: '1.2',
                      padding: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {plug?.services?.delivery?.enabled ? `✓ ${t('detail_available') || 'Disponible'}` : `✗ ${t('detail_not_available') || 'Non disponible'}`}
                    </div>
                  </div>

                  {/* Postal */}
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 100px',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: plug?.services?.postal?.enabled ? '#1a3a4a' : '#2a2a2a',
                    borderRadius: '8px',
                    border: plug?.services?.postal?.enabled ? '1px solid #3b82f6' : '1px solid #3a3a3a',
                    minHeight: '70px'
                  }}>
                    {/* Emoji */}
                    <div style={{
                      fontSize: '22px',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      📬
                    </div>
                    
                    {/* Texte service centré */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      minHeight: '40px'
                    }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: '#ffffff',
                        fontSize: '16px',
                        lineHeight: '1.3',
                        wordBreak: 'break-word',
                        marginBottom: '4px'
                      }}>
                        {translateService('postal') || 'Envoi postal'}
                      </div>
                      {plug?.services?.postal?.price && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#8e8e93',
                          lineHeight: '1.2'
                        }}>
                          {plug.services.postal.price}
                        </div>
                      )}
                    </div>
                    
                    {/* Statut */}
                    <div style={{ 
                      color: plug?.services?.postal?.enabled ? '#3b82f6' : '#ef4444',
                      fontWeight: '600',
                      fontSize: '12px',
                      textAlign: 'center',
                      lineHeight: '1.2',
                      padding: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {plug?.services?.postal?.enabled ? `✓ ${t('detail_available') || 'Disponible'}` : `✗ ${t('detail_not_available') || 'Non disponible'}`}
                    </div>
                  </div>

                  {/* Meetup */}
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 100px',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: plug?.services?.meetup?.enabled ? '#4a2a1a' : '#2a2a2a',
                    borderRadius: '8px',
                    border: plug?.services?.meetup?.enabled ? '1px solid #f59e0b' : '1px solid #3a3a3a',
                    minHeight: '70px'
                  }}>
                    {/* Emoji */}
                    <div style={{
                      fontSize: '22px',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      🤝
                    </div>
                    
                    {/* Texte service centré */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      minHeight: '40px'
                    }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: '#ffffff',
                        fontSize: '16px',
                        lineHeight: '1.3',
                        wordBreak: 'break-word',
                        marginBottom: '4px'
                      }}>
                        {translateService('meetup') || 'Meetup'}
                      </div>
                      {/* Description ou départements meetup */}
                      {plug?.services?.meetup?.enabled && plug?.services?.meetup?.description && (
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#f59e0b',
                          lineHeight: '1.2',
                          marginBottom: '2px',
                          fontWeight: '500'
                        }}>
                          📍 {plug.services.meetup.description}
                        </div>
                      )}
                      {plug?.services?.meetup?.price && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#8e8e93',
                          lineHeight: '1.2'
                        }}>
                          {plug.services.meetup.price}
                        </div>
                      )}
                    </div>
                    
                    {/* Statut */}
                    <div style={{ 
                      color: plug?.services?.meetup?.enabled ? '#f59e0b' : '#ef4444',
                      fontWeight: '600',
                      fontSize: '12px',
                      textAlign: 'center',
                      lineHeight: '1.2',
                      padding: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {plug?.services?.meetup?.enabled ? `✓ ${t('detail_available') || 'Disponible'}` : `✗ ${t('detail_not_available') || 'Non disponible'}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Réseaux sociaux */}
              {plug?.socialMedia && Array.isArray(plug.socialMedia) && plug.socialMedia.length > 0 && (
                <div style={{ 
                  backgroundColor: '#1a1a1a',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    marginBottom: '16px',
                    color: '#ffffff'
                  }}>
                    🌐 {t('social_media') || 'Réseaux sociaux'}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {plug.socialMedia.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          backgroundColor: '#2a2a2a',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          color: '#ffffff',
                          border: '1px solid #3a3a3a',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#3a3a3a'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}
                      >
                        <span style={{ fontSize: '20px' }}>{social.emoji}</span>
                        <span style={{ fontWeight: '500' }}>{social.name}</span>
                        <span style={{ marginLeft: 'auto', color: '#8e8e93' }}>→</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Informations complémentaires */}
              {plug?.additionalInfo && (
                <div style={{ 
                  backgroundColor: '#1a1a1a',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    marginBottom: '12px',
                    color: '#ffffff'
                  }}>
                    ℹ️ {t('additional_info') || 'Informations complémentaires'}
                  </h3>
                  <div style={{ 
                    color: '#8e8e93', 
                    fontSize: '15px',
                    lineHeight: '1.5'
                  }}>
                    {formatText(plug.additionalInfo)}
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        {/* Navigation */}
        <ShopNavigation currentLanguage={currentLanguage} currentPage="detail" />
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