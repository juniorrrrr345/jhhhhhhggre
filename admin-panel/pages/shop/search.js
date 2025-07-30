import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { simpleApi as api } from '../../lib/api-simple'
import { getProxiedImageUrl } from '../../lib/imageUtils'
import toast from 'react-hot-toast'
import Pagination from '../../components/Pagination'
import ShopCard from '../../components/ShopCard'
import LanguageSelector, { useTranslation, getCurrentLanguage } from '../../components/LanguageSelector'
import ShopNavigation from '../../components/ShopNavigation'
import postalCodeService from '../../lib/postalCodeService'
import { translateCountry, translateCountries, getCountryFlag } from '../../lib/country-translations'
import { useLanguage } from '../../hooks/useLanguage'

export default function ShopSearch() {
  const [plugs, setPlugs] = useState([])
  const [allPlugs, setAllPlugs] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [vipFilter, setVipFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const currentLanguage = useLanguage()
  const [, setCurrentLanguage] = useState('fr') // Gardé pour la compatibilité
  const [likesSync, setLikesSync] = useState({}) // Pour synchroniser les likes en temps réel
  const { t } = useTranslation(currentLanguage)
  const itemsPerPage = 20

  useEffect(() => {
    // Initialiser la langue depuis localStorage
    if (typeof window !== 'undefined') {
      setCurrentLanguage(getCurrentLanguage())
    }
    
    fetchConfig()
    fetchPlugs()
    
    // Marquer les boutiques comme chargées
    setTimeout(() => setInitialLoading(false), 1000)
    
    // SYSTÈME SIMPLE : Toujours refresh au retour dans recherche
    let lastVisibilityRefresh = 0;
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = Date.now();
        // Throttling: minimum 10 secondes entre chaque refresh
        if (now - lastVisibilityRefresh > 10000) {
          console.log('📱 Retour page recherche - FORCE refresh boutiques...');
          lastVisibilityRefresh = now;
          
          setTimeout(() => {
            console.log('🔄 FORCE fetch recherche après retour');
            fetchPlugs();
          }, 500);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // LISTENER pour signaux du panel admin
    const handleForceRefresh = (event) => {
      console.log('🚀 Signal panel admin reçu RECHERCHE - FORCE refresh boutiques...');
      console.log('📊 Détails:', event.detail);
      
      // Vider les filtres si c'est une suppression pour éviter les erreurs
      if (event.detail?.reason === 'shop_deleted') {
        console.log('🗑️ Boutique supprimée - Reset filtres pour éviter les erreurs');
        setSearch('')
        setCountryFilter('')
        setServiceFilter('')
        setDepartmentFilter('')
        setVipFilter('')
      }
      
      setTimeout(() => {
        fetchPlugs();
        console.log('🔄 RECHERCHE: Données mises à jour, classement par likes recalculé automatiquement');
      }, 200);
    };
    
    window.addEventListener('forceRefreshMiniApp', handleForceRefresh);
    
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('forceRefreshMiniApp', handleForceRefresh);
    };
  }, [])

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage)
  }

  // Récupérer SEULEMENT les pays des boutiques réelles du bot Telegram
  const getAvailableCountries = () => {
    const shopsCountries = new Set()
    allPlugs.forEach(plug => {
      if (plug.countries && Array.isArray(plug.countries)) {
        plug.countries.forEach(country => {
          if (country && country.trim() !== '') {
            shopsCountries.add(country)
          }
        })
      }
    })
    
    const countriesArray = Array.from(shopsCountries).sort()
    console.log('🌍 Pays auto-détectés depuis boutiques:', countriesArray.length, 'pays -', countriesArray)
    return countriesArray
  }

  // Utiliser le service postal partagé pour obtenir les départements corrects
  const getDepartmentsByCountry = () => {
    const countries = postalCodeService.getAvailableCountries()
    const departmentsByCountry = {}
    
    // Ajouter les pays avec leurs vrais codes postaux
    countries.forEach(country => {
      departmentsByCountry[country] = postalCodeService.getPostalCodes(country)
    })
    
    // SUPPRIMÉ: Plus de pays fallback hardcodés
    // Seulement les pays des vraies boutiques Telegram
    
    return departmentsByCountry
  }
  
  const departmentsByCountry = getDepartmentsByCountry()

  // Récupérer les départements disponibles selon le pays sélectionné
  const getAvailableDepartments = () => {
    // Fonction pour déterminer le pays d'un code postal
    const getCountryFromPostalCode = (code) => {
      const cleaned = code.trim().toUpperCase()
      
      // Patterns par pays
      if (/^[A-Z]{1,2}\d{1,2}[A-Z]?$/.test(cleaned)) return 'Royaume-Uni' // UK: SW1
      if (/^[A-Z]\d[A-Z]?$/.test(cleaned)) return 'Canada' // Canada: H2
      if (/^\d{3}$/.test(cleaned)) {
        const num = parseInt(cleaned)
        if (num >= 100 && num <= 199) return 'Japon'
        if (num >= 1 && num <= 99) return 'France' // Départements français
        return null
      }
      if (/^\d{2}$/.test(cleaned)) {
        const num = parseInt(cleaned)
        if (num >= 1 && num <= 95) return 'France' // Départements français
        if (num >= 97 && num <= 98) return 'France' // DOM-TOM
        return null
      }
      
      // Pour les codes simplifiés, on ne peut pas déterminer le pays avec certitude
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
      
      return Array.from(departments)
    }

    if (!countryFilter) {
      // Si aucun pays sélectionné, montrer les codes postaux trouvés dans les boutiques
      const departments = new Set()
      allPlugs.forEach(plug => {
        // Extraire les codes postaux des descriptions
        if (plug.services?.delivery?.description) {
          extractPostalCodes(plug.services.delivery.description).forEach(code => departments.add(code))
        }
        if (plug.services?.meetup?.description) {
          extractPostalCodes(plug.services.meetup.description).forEach(code => departments.add(code))
        }
        // Simplifier aussi les codes postaux stockés
        if (plug.services?.delivery?.postalCodes && Array.isArray(plug.services.delivery.postalCodes)) {
          plug.services.delivery.postalCodes.forEach(code => {
            if (code && code.trim() !== '') {
              // Utiliser extractPostalCodes pour simplifier
              extractPostalCodes(code).forEach(simplified => departments.add(simplified))
            }
          })
        }
        if (plug.services?.meetup?.postalCodes && Array.isArray(plug.services.meetup.postalCodes)) {
          plug.services.meetup.postalCodes.forEach(code => {
            if (code && code.trim() !== '') {
              extractPostalCodes(code).forEach(simplified => departments.add(simplified))
            }
          })
        }
        // Fallback sur departments pour compatibilité
        if (plug.services?.delivery?.departments && Array.isArray(plug.services.delivery.departments)) {
          plug.services.delivery.departments.forEach(dept => {
            if (dept && dept.trim() !== '') {
              extractPostalCodes(dept).forEach(simplified => departments.add(simplified))
            }
          })
        }
        if (plug.services?.meetup?.departments && Array.isArray(plug.services.meetup.departments)) {
          plug.services.meetup.departments.forEach(dept => {
            if (dept && dept.trim() !== '') {
              extractPostalCodes(dept).forEach(simplified => departments.add(simplified))
            }
          })
        }
      })
      const deptArray = Array.from(departments).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      console.log('🏢 Départements auto-détectés depuis boutiques:', deptArray.length, 'départements')
      return deptArray
    }

    // Si un pays est sélectionné, extraire les codes postaux des boutiques de ce pays
    const countryDepartments = new Set()
    console.log(`🌍 Filtrage départements pour pays: ${countryFilter}`)
    
    allPlugs.forEach(plug => {
      if (plug.countries && plug.countries.includes(countryFilter)) {
        console.log(`  📍 Boutique "${plug.name}" dans ${countryFilter}:`)
        // Extraire des descriptions
        if (plug.services?.delivery?.description) {
          extractPostalCodes(plug.services.delivery.description).forEach(code => countryDepartments.add(code))
        }
        if (plug.services?.meetup?.description) {
          extractPostalCodes(plug.services.meetup.description).forEach(code => countryDepartments.add(code))
        }
        // Simplifier aussi les codes postaux stockés
        if (plug.services?.delivery?.postalCodes && Array.isArray(plug.services.delivery.postalCodes)) {
          plug.services.delivery.postalCodes.forEach(code => {
            if (code && code.trim() !== '') {
              extractPostalCodes(code).forEach(simplified => countryDepartments.add(simplified))
            }
          })
        }
        if (plug.services?.meetup?.postalCodes && Array.isArray(plug.services.meetup.postalCodes)) {
          plug.services.meetup.postalCodes.forEach(code => {
            if (code && code.trim() !== '') {
              extractPostalCodes(code).forEach(simplified => countryDepartments.add(simplified))
            }
          })
        }
        if (plug.services?.delivery?.departments && Array.isArray(plug.services.delivery.departments)) {
          plug.services.delivery.departments.forEach(dept => {
            if (dept && dept.trim() !== '') {
              extractPostalCodes(dept).forEach(simplified => countryDepartments.add(simplified))
            }
          })
        }
        if (plug.services?.meetup?.departments && Array.isArray(plug.services.meetup.departments)) {
          plug.services.meetup.departments.forEach(dept => {
            if (dept && dept.trim() !== '') {
              extractPostalCodes(dept).forEach(simplified => countryDepartments.add(simplified))
            }
          })
        }
      }
    })
    
    // Retourner les départements trouvés, triés
    const deptArray = Array.from(countryDepartments).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    console.log(`🏢 Départements pour ${countryFilter}:`, deptArray.length, 'codes trouvés:', deptArray)
    return deptArray
  }

  useEffect(() => {
    filterPlugs()
  }, [search, countryFilter, serviceFilter, departmentFilter, vipFilter, allPlugs, likesSync])

  // Réinitialiser le filtre département si le pays change et que le département n'est plus disponible
  useEffect(() => {
    if (departmentFilter && countryFilter) {
      const availableDepartments = getAvailableDepartments()
      if (!availableDepartments.includes(departmentFilter)) {
        setDepartmentFilter('')
      }
    }
  }, [countryFilter, allPlugs])

  const fetchConfig = async () => {
    try {
      const data = await api.getPublicConfig()
      setConfig(data)
    } catch (error) {
      console.error('Erreur chargement config:', error)
      // Mode offline : config par défaut au lieu d'erreur
      setConfig({
        boutique: { name: 'FINDYOURPLUG', subtitle: 'Mode Offline' }
      })
      console.log('📱 Mode offline: Configuration par défaut')
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchPlugs = async () => {
    try {
      setLoading(true)
      console.log('🔍 SIMPLE - Chargement direct API locale (recherche)...')
      
      // STRATÉGIE SIMPLE : API LOCALE EN PREMIER
      const response = await fetch('/api/local-plugs', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error(`API locale failed: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ SIMPLE - Données API locale reçues (recherche):', data)

      if (data && data.plugs && Array.isArray(data.plugs)) {
        console.log('🔍 SIMPLE - Plugs recherche chargés:', data.plugs.length, 'boutiques')
        setAllPlugs(data.plugs)
        
        // Synchroniser les likes en temps réel
        const likesData = {}
        data.plugs.forEach(plug => {
          if (plug._id && plug.likes !== undefined) {
            likesData[plug._id] = plug.likes
          }
        })
        setLikesSync(likesData)
        console.log('❤️ SIMPLE - Likes synchronisés pour recherche:', Object.keys(likesData).length, 'boutiques')
      } else {
        console.log('⚠️ SIMPLE - Aucune boutique trouvée (recherche)')
        setAllPlugs([])
      }
      
    } catch (error) {
      console.error('❌ SIMPLE - Erreur recherche:', error)
      setAllPlugs([])
    } finally {
      setLoading(false)
    }
  }

  const filterPlugs = () => {
    console.log('🔍 Filtrage avec:', { 
      search, 
      countryFilter, 
      serviceFilter, 
      departmentFilter, 
      vipFilter, 
      totalPlugs: allPlugs.length,
      currentPage 
    })
    
    let filtered = allPlugs.filter(plug => {
      const matchesSearch = search === '' || 
        plug.name.toLowerCase().includes(search.toLowerCase()) ||
        plug.description.toLowerCase().includes(search.toLowerCase())
      
      const matchesCountry = countryFilter === '' || 
        (plug.countries && plug.countries.some(country => 
          country.toLowerCase() === countryFilter.toLowerCase()
        ))
      
      const matchesService = serviceFilter === '' || 
        (serviceFilter === 'delivery' && plug.services?.delivery?.enabled) ||
        (serviceFilter === 'postal' && plug.services?.postal?.enabled) ||
        (serviceFilter === 'meetup' && plug.services?.meetup?.enabled)
      
      const matchesDepartment = departmentFilter === '' || (() => {
        // Pour un filtre de département (ex: "75"), chercher tous les codes qui commencent par ce département
        const deptRegex = new RegExp(`\\b${departmentFilter}\\d*\\b`, 'i')
        
        return (
          // Chercher dans les descriptions des services
          (plug.services?.delivery?.description && deptRegex.test(plug.services.delivery.description)) ||
          (plug.services?.meetup?.description && deptRegex.test(plug.services.meetup.description)) ||
          // Chercher aussi dans postalCodes et departments pour compatibilité
          (plug.services?.delivery?.postalCodes && plug.services.delivery.postalCodes.some(code => 
            code.startsWith(departmentFilter) || code === departmentFilter)) ||
          (plug.services?.meetup?.postalCodes && plug.services.meetup.postalCodes.some(code => 
            code.startsWith(departmentFilter) || code === departmentFilter)) ||
          (plug.services?.delivery?.departments && plug.services.delivery.departments.some(dept =>
            dept.startsWith(departmentFilter) || dept === departmentFilter)) ||
          (plug.services?.meetup?.departments && plug.services.meetup.departments.some(dept =>
            dept.startsWith(departmentFilter) || dept === departmentFilter))
        )
      })()
      
      const matchesVip = vipFilter === '' || 
        (vipFilter === 'vip' && plug.isVip) ||
        (vipFilter === 'standard' && !plug.isVip)
      
      const matches = matchesSearch && matchesCountry && matchesService && matchesDepartment && matchesVip
      
      // Debug pour voir quelles boutiques passent les filtres
      if (!matches && (serviceFilter || vipFilter || departmentFilter)) {
        console.log(`❌ ${plug.name}: service=${matchesService}, vip=${matchesVip}, dept=${matchesDepartment}`)
      }
      
      return matches
    })

    // Tri intelligent par VIP puis par likes synchronisés
    filtered = filtered.sort((a, b) => {
      // 1. VIP en priorité absolue
      if (a.isVip && !b.isVip) return -1
      if (!a.isVip && b.isVip) return 1
      
      // 2. Ensuite par likes (utiliser likesSync pour les données temps réel)
      const aLikes = likesSync[a._id] !== undefined ? likesSync[a._id] : (a.likes || 0)
      const bLikes = likesSync[b._id] !== undefined ? likesSync[b._id] : (b.likes || 0)
      
      if (bLikes !== aLikes) {
        return bLikes - aLikes
      }
      
      // 3. En cas d'égalité de likes, trier par date de création (plus récent en premier)
      const aDate = new Date(a.createdAt || 0)
      const bDate = new Date(b.createdAt || 0)
      return bDate - aDate
    })

    console.log(`🎯 Résultats filtrés: ${filtered.length}/${allPlugs.length} boutiques`)
    
    // Afficher le TOP 5 du classement pour debug
    if (filtered.length > 0) {
      console.log('🏆 TOP 5 CLASSEMENT:')
      filtered.slice(0, 5).forEach((plug, index) => {
        const likes = likesSync[plug._id] !== undefined ? likesSync[plug._id] : (plug.likes || 0)
        const badge = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}°`
        console.log(`${badge} ${plug.name}: ${likes} likes ${plug.isVip ? '👑VIP' : ''}`)
      })
    }
    
    setPlugs(filtered)
    // Ne réinitialiser la page que si on est au-delà du nombre de pages disponibles
    const newTotalPages = Math.ceil(filtered.length / itemsPerPage)
    if (currentPage > newTotalPages) {
      setCurrentPage(1)
    }
  }

  const resetFilters = () => {
    setSearch('')
    setCountryFilter('')
    setServiceFilter('')
    setDepartmentFilter('')
    setVipFilter('')
    setCurrentPage(1)
  }

  const uniqueCountries = [...new Set(allPlugs.flatMap(plug => plug.countries || []))].sort()

  const currentPlugs = plugs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getPositionBadge = (index) => {
    const globalIndex = (currentPage - 1) * itemsPerPage + index
    if (globalIndex === 0) return '🥇'
    if (globalIndex === 1) return '🥈'
    if (globalIndex === 2) return '🥉'
    if (globalIndex < 10) return `${globalIndex + 1}⭐`
    return `${globalIndex + 1}°`
  }



  if (initialLoading) {
    return (
      <>
        <Head>
          <title>Chargement...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>
        <div style={{ 
          backgroundColor: '#1a1a1a',
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), 
            url("https://i.imgur.com/iISKonz.jpeg")
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
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
            <p style={{ color: '#ffffff', fontWeight: '500' }}>{t('search_loading')}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
              <Head>
          <title>{t('search')} - FindYourPlug</title>
          <meta name="description" content={t('search_desc') || 'Recherchez vos boutiques préférées par nom, pays ou service.'} />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>

      <div style={{ 
        backgroundColor: '#1a1a1a',
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), 
          url("https://i.imgur.com/iISKonz.jpeg")
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        color: '#ffffff',
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        {/* Header */}
        <header style={{ 
          backgroundColor: 'transparent',
          padding: '20px',
          textAlign: 'center',
          borderBottom: '1px solid #2a2a2a'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ flex: 1 }}></div>
            <LanguageSelector 
              onLanguageChange={handleLanguageChange} 
              currentLanguage={currentLanguage} 
              compact={true} 
            />
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(24px, 5vw, 32px)', 
            fontWeight: 'bold', 
            margin: '0 0 8px 0',
            color: '#ffffff',
            letterSpacing: '2px'
          }}>
            🔍 {t('search')}
          </h1>
          <p style={{ 
            margin: '16px auto 0',
            padding: '12px 16px',
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '500',
            textShadow: '0 1px 3px rgba(0,0,0,0.7)',
            lineHeight: '1.5',
            maxWidth: '450px',
            whiteSpace: 'pre-line'
          }}>
            {t('search_desc') || 'Recherchez vos boutiques préférées'}
          </p>
        </header>

        {/* Section Filtres de recherche */}
        <div style={{ 
          backgroundColor: '#1a1a1a',
          padding: '20px',
          margin: '20px',
          borderRadius: '12px',
          border: '1px solid #2a2a2a'
        }}>
          {/* Barre de recherche principale */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
                              placeholder={`🔍 ${t('search_placeholder') || 'Rechercher une boutique'}...`}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Filtres avancés */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '12px',
            marginBottom: '16px'
          }}>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">🌍 {t('search_all_countries')}</option>
              {getAvailableCountries().map(country => (
                <option key={country} value={country}>
                  {getCountryFlag(country)} {translateCountry(country, currentLanguage)}
                </option>
              ))}
            </select>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">🚀 {t('search_all_services')}</option>
              <option value="delivery">🛵 {t('delivery')}</option>
              <option value="postal">📬 {t('postal')}</option>
              <option value="meetup">🤝 {t('meetup')}</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              disabled={!countryFilter}
              style={{
                padding: '8px 12px',
                backgroundColor: countryFilter ? '#2a2a2a' : '#1a1a1a',
                border: `1px solid ${countryFilter ? '#3a3a3a' : '#2a2a2a'}`,
                borderRadius: '6px',
                color: countryFilter ? '#ffffff' : '#666666',
                fontSize: '14px',
                boxSizing: 'border-box',
                cursor: countryFilter ? 'pointer' : 'not-allowed',
                opacity: countryFilter ? 1 : 0.6
              }}
            >
              <option value="">
                🗺️ {countryFilter ? 
                  `${t('search_department')} (${countryFilter})` : 
                  t('search_select_country_first')
                }
              </option>
              {countryFilter && getAvailableDepartments().map(department => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>

            <select
              value={vipFilter}
              onChange={(e) => setVipFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
                              <option value="">🔍 {t('search_all_types')}</option>
              <option value="vip">👑 {t('vip')} {t('search_vip_only')}</option>
              <option value="standard">🔹 {t('standard')} {t('search_standard_only')}</option>
            </select>
          </div>

          {/* Bouton reset */}
          <button
            onClick={resetFilters}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007AFF',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🔄 {t('search_reset_filters')}
          </button>
        </div>

        {/* Résultats */}
        <main style={{ padding: '0 20px 90px', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Compteur de résultats */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '20px',
            color: '#8e8e93',
            fontSize: '14px'
          }}>
            {loading ? 
              `${t('search_loading_results')}` : 
              `${plugs.length} ${t('search_results_count')}`
            }
          </div>

          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '200px' 
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  border: '2px solid transparent',
                  borderTop: '2px solid #007AFF',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }}></div>
                <p style={{ color: '#ffffff' }}>{t('search_loading_results')}</p>
              </div>
            </div>
          ) : plugs.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '300px',
              textAlign: 'center'
            }}>
                              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
              <h3 style={{ 
                color: '#ffffff', 
                fontSize: '24px', 
                fontWeight: '600', 
                marginBottom: '12px'
              }}>
                {t('search_no_results')}
              </h3>
              <p style={{ 
                color: '#8e8e93', 
                marginBottom: '24px',
                fontSize: '16px',
                maxWidth: '400px',
                lineHeight: '1.5'
              }}>
                {t('search_no_results_desc')}
              </p>
            </div>
          ) : (
            <>
              {/* Grid des résultats */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '16px',
                marginBottom: '20px'
              }}>
                              {currentPlugs.map((plug, index) => (
                <ShopCard 
                  key={plug._id} 
                  plug={plug} 
                  config={config}
                  currentLanguage={currentLanguage}
                  showCountry={countryFilter ? true : false}
                  filteredCountry={countryFilter}
                  index={(currentPage - 1) * itemsPerPage + index}
                  likes={likesSync[plug._id] !== undefined ? likesSync[plug._id] : (plug.likes || 0)}
                  getPositionBadge={getPositionBadge}
                />
              ))}
              </div>

              {/* Pagination */}
              {plugs.length > itemsPerPage && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  marginTop: '32px'
                }}>
                  <Pagination
                    currentPage={currentPage}
                    totalItems={plugs.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </main>

        {/* Navigation */}
        <ShopNavigation currentLanguage={currentLanguage} currentPage="search" />
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Force white text for select options */
        select option {
          color: #ffffff !important;
          background-color: #2a2a2a !important;
        }
        
        select {
          color: #ffffff !important;
        }
      `}</style>
    </>
  )
}
