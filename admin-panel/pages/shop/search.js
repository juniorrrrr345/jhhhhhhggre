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

  // Fonction simple pour extraire les codes postaux selon le pays
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

  // Récupérer les départements disponibles selon le pays sélectionné
  const getAvailableDepartments = () => {
    const departments = new Set()
    
    // Si aucun pays sélectionné, ne rien afficher
    if (!countryFilter) {
      return []
    }
    
    // Parcourir toutes les boutiques
    allPlugs.forEach(plug => {
      // Vérifier si la boutique livre dans le pays sélectionné
      if (!plug.countries || !plug.countries.includes(countryFilter)) {
        return
      }
      
      // Extraire les codes de la description de livraison
      if (plug.services?.delivery?.description) {
        const codes = extractCodesForCountry(plug.services.delivery.description, countryFilter)
        codes.forEach(code => departments.add(code))
      }
      
      // Extraire les codes de la description de meetup
      if (plug.services?.meetup?.description) {
        const codes = extractCodesForCountry(plug.services.meetup.description, countryFilter)
        codes.forEach(code => departments.add(code))
      }
    })
    
    // Retourner les départements triés
    return Array.from(departments).sort((a, b) => {
      const aNum = parseInt(a)
      const bNum = parseInt(b)
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum
      }
      return a.localeCompare(b, undefined, { numeric: true })
    })
  }
      
      // Fonction pour vérifier si un code correspond au format d'un pays
      const isValidCodeForCountry = (code, targetCountry) => {
        const cleanCode = code.trim().toUpperCase()
        
        switch(targetCountry) {
          case 'France':
            // France: départements 01-95 + DOM-TOM (971-978, 984-989)
            return /^(0[1-9]|[1-8][0-9]|9[0-5]|97[1-8]|98[4-9])$/.test(cleanCode) ||
                   /^(0[1-9]|[1-8][0-9]|9[0-5]|97[1-8]|98[4-9])\d{3}$/.test(cleanCode)
          
          case 'Suisse':
            // Suisse: 4 chiffres commençant par 1-9
            return /^[1-9]\d{3}$/.test(cleanCode)
          
          case 'Belgique':
            // Belgique: 4 chiffres commençant par 1-9
            return /^[1-9]\d{3}$/.test(cleanCode)
          
          case 'Allemagne':
            // Allemagne: 5 chiffres
            return /^[0-9]{5}$/.test(cleanCode)
          
          case 'Espagne':
            // Espagne: 5 chiffres commençant par 01-52
            return /^(0[1-9]|[1-4][0-9]|5[0-2])\d{3}$/.test(cleanCode)
          
          case 'Italie':
            // Italie: 5 chiffres
            return /^[0-9]{5}$/.test(cleanCode)
          
          case 'Thaïlande':
            // Thaïlande: 5 chiffres commençant par 1-9
            return /^[1-9]\d{4}$/.test(cleanCode)
          
          case 'Royaume-Uni':
            // UK: format alphanumérique
            return /^[A-Z]{1,2}\d{1,2}[A-Z]?(\s?\d[A-Z]{0,2})?$/i.test(cleanCode)
          
          case 'Canada':
            // Canada: format A1A 1A1
            return /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(cleanCode)
          
          case 'États-Unis':
          case 'USA':
            // USA: 5 chiffres ou 5+4
            return /^\d{5}(-\d{4})?$/.test(cleanCode)
          
          case 'Portugal':
            // Portugal: 4 chiffres-3 chiffres
            return /^\d{4}(-\d{3})?$/.test(cleanCode)
          
          case 'Pays-Bas':
            // Pays-Bas: 4 chiffres + 2 lettres
            return /^\d{4}\s?[A-Z]{2}$/i.test(cleanCode)
          
          case 'Japon':
            // Japon: 3 chiffres ou 3-4 format
            return /^\d{3}(-\d{4})?$/.test(cleanCode)
          
          case 'Brésil':
            // Brésil: 5 chiffres-3 chiffres
            return /^\d{5}-\d{3}$/.test(cleanCode)
          
          default:
            // Pour les autres pays, accepter uniquement les codes à 2 chiffres (départements génériques)
            return /^\d{2}$/.test(cleanCode)
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
            // France : 75001 → 75
            if (/^\d{5}$/.test(cleanCode)) {
              return cleanCode.substring(0, 2)
            }
            return cleanCode
          
          case 'Suisse':
          case 'Belgique':
            // Garder le code complet à 4 chiffres
            return cleanCode
          
          case 'Allemagne':
          case 'Espagne':
          case 'Italie':
          case 'Thaïlande':
            // Garder le code complet à 5 chiffres
            return cleanCode
          
          case 'Royaume-Uni':
            // UK : SW1A 1AA → SW1
            const ukMatch = cleanCode.match(/^([A-Z]{1,2}\d{1,2})[A-Z]?/)
            return ukMatch ? ukMatch[1] : null
          
          case 'Canada':
            // Canada : H2X 1Y7 → H2X
            return cleanCode.substring(0, 3)
          
          case 'États-Unis':
          case 'USA':
            // USA : garder les 5 chiffres
            return cleanCode.split('-')[0]
          
          case 'Portugal':
            // Portugal : 4000-123 → 4000
            return cleanCode.split('-')[0]
          
          case 'Pays-Bas':
            // Pays-Bas : 1011 AB → 1011
            return cleanCode.substring(0, 4)
          
          case 'Japon':
            // Japon : 100-0001 → 100
            return cleanCode.substring(0, 3)
          
          case 'Brésil':
            // Brésil : 01310-100 → 01310
            return cleanCode.split('-')[0]
          
          default:
            // Si pas de pays spécifié, ne retourner que les départements français (2 chiffres)
            if (/^(0[1-9]|[1-8][0-9]|9[0-5])$/.test(cleanCode)) {
              return cleanCode // Départements français uniquement
            }
            if (/^(0[1-9]|[1-8][0-9]|9[0-5])\d{3}$/.test(cleanCode)) {
              // Code postal français complet -> extraire le département
              return cleanCode.substring(0, 2)
            }
            // Ne pas retourner les codes qui ne correspondent pas à des départements français
            return null
        }
      }
      
      // Patterns pour tous les formats de codes postaux
      const patterns = [
        /\b\d{5}-\d{4}\b/g,     // USA long
        /\b\d{5}-\d{3}\b/g,     // Brésil
        /\b\d{4}-\d{3}\b/g,     // Portugal
        /\b\d{3}-\d{4}\b/g,     // Japon
        /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d?[A-Z]{0,2}\b/gi, // UK
        /\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/gi, // Canada
        /\b\d{4}\s?[A-Z]{2}\b/gi, // Pays-Bas
        /\b\d{5}\b/g,           // 5 chiffres
        /\b\d{4}\b/g,           // 4 chiffres
        /\b\d{3}\b/g,           // 3 chiffres
        /\b\d{2}\b/g            // 2 chiffres
      ]
      
      const allMatches = []
      
      patterns.forEach(pattern => {
        const matches = description.match(pattern) || []
        matches.forEach(match => {
          allMatches.push({
            value: match,
            index: description.indexOf(match)
          })
        })
      })
      
      // Trier par position pour éviter les doublons
      allMatches.sort((a, b) => a.index - b.index)
      
      // Éliminer les doublons par position
      const usedPositions = new Set()
      allMatches.forEach(match => {
        const start = match.index
        const end = match.index + match.value.length
        
        let overlap = false
        for (let i = start; i < end; i++) {
          if (usedPositions.has(i)) {
            overlap = true
            break
          }
        }
        
        if (!overlap) {
          for (let i = start; i < end; i++) {
            usedPositions.add(i)
          }
          
          // Si un pays est spécifié, vérifier que le code est valide pour ce pays
          if (country && !isValidCodeForCountry(match.value, country)) {
            return // Ignorer ce code s'il n'est pas valide pour le pays
          }
          
          const simplified = simplifyCodeByCountry(match.value, country)
          if (simplified) {
            departments.add(simplified)
          }
        }
      })
      
      return Array.from(departments).sort((a, b) => {
        // Trier numériquement si possible
        const aNum = parseInt(a)
        const bNum = parseInt(b)
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum
        }
        return a.localeCompare(b, undefined, { numeric: true })
      })
    }

    if (!countryFilter) {
      // Si aucun pays sélectionné, montrer les codes postaux trouvés dans les boutiques
      const departments = new Set()
      allPlugs.forEach(plug => {
        // Extraire les codes postaux des descriptions
        if (plug.services?.delivery?.description) {
          // Passer le premier pays de la boutique pour une extraction correcte
          const country = plug.countries && plug.countries.length > 0 ? plug.countries[0] : null
          extractPostalCodes(plug.services.delivery.description, country).forEach(code => departments.add(code))
        }
        if (plug.services?.meetup?.description) {
          const country = plug.countries && plug.countries.length > 0 ? plug.countries[0] : null
          extractPostalCodes(plug.services.meetup.description, country).forEach(code => departments.add(code))
        }
        // Simplifier aussi les codes postaux stockés
        if (plug.services?.delivery?.postalCodes && Array.isArray(plug.services.delivery.postalCodes)) {
          plug.services.delivery.postalCodes.forEach(code => {
            if (code && code.trim() !== '') {
              // Passer le pays pour validation
              const country = plug.countries && plug.countries.length > 0 ? plug.countries[0] : null
              extractPostalCodes(code, country).forEach(simplified => departments.add(simplified))
            }
          })
        }
        if (plug.services?.meetup?.postalCodes && Array.isArray(plug.services.meetup.postalCodes)) {
          plug.services.meetup.postalCodes.forEach(code => {
            if (code && code.trim() !== '') {
              const country = plug.countries && plug.countries.length > 0 ? plug.countries[0] : null
              extractPostalCodes(code, country).forEach(simplified => departments.add(simplified))
            }
          })
        }
        // Fallback sur departments pour compatibilité
        if (plug.services?.delivery?.departments && Array.isArray(plug.services.delivery.departments)) {
          plug.services.delivery.departments.forEach(dept => {
            if (dept && dept.trim() !== '') {
              const country = plug.countries && plug.countries.length > 0 ? plug.countries[0] : null
              extractPostalCodes(dept, country).forEach(simplified => departments.add(simplified))
            }
          })
        }
        if (plug.services?.meetup?.departments && Array.isArray(plug.services.meetup.departments)) {
          plug.services.meetup.departments.forEach(dept => {
            if (dept && dept.trim() !== '') {
              const country = plug.countries && plug.countries.length > 0 ? plug.countries[0] : null
              extractPostalCodes(dept, country).forEach(simplified => departments.add(simplified))
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
          const codes = extractPostalCodes(plug.services.delivery.description, countryFilter)
          if (codes && Array.isArray(codes)) {
            codes.forEach(code => countryDepartments.add(code))
          }
        }
        if (plug.services?.meetup?.description) {
          const codes = extractPostalCodes(plug.services.meetup.description, countryFilter)
          if (codes && Array.isArray(codes)) {
            codes.forEach(code => countryDepartments.add(code))
          }
        }
        // Simplifier aussi les codes postaux stockés
        if (plug.services?.delivery?.postalCodes && Array.isArray(plug.services.delivery.postalCodes)) {
          plug.services.delivery.postalCodes.forEach(code => {
            if (code && code.trim() !== '') {
              extractPostalCodes(code, countryFilter).forEach(simplified => countryDepartments.add(simplified))
            }
          })
        }
        if (plug.services?.meetup?.postalCodes && Array.isArray(plug.services.meetup.postalCodes)) {
          plug.services.meetup.postalCodes.forEach(code => {
            if (code && code.trim() !== '') {
              extractPostalCodes(code, countryFilter).forEach(simplified => countryDepartments.add(simplified))
            }
          })
        }
        if (plug.services?.delivery?.departments && Array.isArray(plug.services.delivery.departments)) {
          plug.services.delivery.departments.forEach(dept => {
            if (dept && dept.trim() !== '') {
              extractPostalCodes(dept, countryFilter).forEach(simplified => countryDepartments.add(simplified))
            }
          })
        }
        if (plug.services?.meetup?.departments && Array.isArray(plug.services.meetup.departments)) {
          plug.services.meetup.departments.forEach(dept => {
            if (dept && dept.trim() !== '') {
              extractPostalCodes(dept, countryFilter).forEach(simplified => countryDepartments.add(simplified))
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
