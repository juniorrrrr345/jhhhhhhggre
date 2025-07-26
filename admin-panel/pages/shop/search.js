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
  const [currentLanguage, setCurrentLanguage] = useState('fr')
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
  }, [])

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage)
  }

  // Récupérer TOUS les pays européens + extras (même s'il n'y a pas de boutiques)
  const getAvailableCountries = () => {
    // D'abord, récupérer tous les pays définis dans departmentsByCountry
    const allDefinedCountries = Object.keys(departmentsByCountry)
    
    // Ensuite, ajouter les pays des boutiques existantes
    const shopsCountries = new Set()
    allPlugs.forEach(plug => {
      if (plug.countries && Array.isArray(plug.countries)) {
        plug.countries.forEach(country => {
          if (country && country.trim() !== '' && country.toLowerCase() !== 'autre') {
            shopsCountries.add(country)
          }
        })
      }
    })
    
    // Combiner les deux listes et supprimer les doublons
    const allCountries = new Set([...allDefinedCountries, ...Array.from(shopsCountries)])
    return Array.from(allCountries).sort()
  }

  // Définition des départements corrects par pays (TOUS LES PAYS EUROPÉENS + EXTRA - même que le bot)
  const departmentsByCountry = {
    // Europe Occidentale
    'France': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '2A', '2B', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95'],
    'Allemagne': ['01000', '10000', '20000', '30000', '40000', '50000', '60000', '70000', '80000', '90000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '21000', '22000', '23000', '24000', '25000', '26000', '27000', '28000', '29000', '31000', '32000', '33000'],
    'Espagne': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50'],
    'Italie': ['00100', '10100', '20100', '30100', '40100', '50100', '60100', '70100', '80100', '90100', '16100', '37100', '43100', '56100', '70200', '80200', '95100', '98100', '00200', '35100', '84100', '87100', '73100', '63100', '47100', '55100', '67100'],
    'Royaume-Uni': ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12', 'B13', 'B14', 'B15', 'B16', 'B17', 'B18', 'B19', 'B20', 'B21', 'B22', 'B23', 'B24', 'B25', 'B26', 'B27', 'B28', 'B29', 'B30'],
    'Pays-Bas': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1100', '1200', '1300', '1400', '1500', '2100', '2200', '2300', '2400', '2500', '3100', '3200', '3300', '3400', '3500', '4100', '4200', '4300', '4400', '4500'],
    'Belgique': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1500', '1200', '1400', '1300', '1600', '1800', '2500', '3500', '4500', '5500', '6500', '7500', '8500', '9500'],
    'Suisse': ['1000', '1200', '1300', '2000', '2500', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1400', '1700', '2600', '3200', '3900', '4600', '5200', '6200', '6300', '6400', '6500', '6600', '6700', '6800'],
    'Autriche': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2100', '2200', '2300', '2400', '2500', '3100', '3200'],
    'Portugal': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1100', '1200', '1300', '1400', '1500', '2100', '2200', '2300', '2400', '2500', '3100', '3200', '4100', '4200', '4300', '4400'],

    // Europe du Nord
    'Suède': ['10000', '20000', '30000', '40000', '50000', '60000', '70000', '80000', '90000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '21000', '22000'],
    'Norvège': ['0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000'],
    'Danemark': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2100', '2200'],
    'Finlande': ['00100', '00200', '00300', '00400', '00500', '00600', '00700', '00800', '00900', '01000', '01100', '01200', '01300', '01400', '01500', '01600', '01700', '01800', '01900', '02000'],

    // Europe de l'Est
    'Pologne': ['00100', '10000', '20000', '30000', '40000', '50000', '60000', '70000', '80000', '90000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '21000'],
    'République Tchèque': ['10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '21000', '22000', '23000', '24000', '25000', '26000', '27000', '28000', '29000'],
    'Hongrie': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2100', '2200'],
    'Slovaquie': ['80000', '81000', '82000', '83000', '84000', '85000', '86000', '87000', '88000', '89000', '90000', '91000', '92000', '93000', '94000', '95000', '96000', '97000', '98000', '99000'],
    'Roumanie': ['010000', '020000', '030000', '040000', '050000', '060000', '070000', '080000', '090000', '100000', '110000', '120000', '130000', '140000', '150000', '160000', '170000', '180000', '190000', '200000'],
    'Bulgarie': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2100', '2200'],

    // Europe du Sud
    'Grèce': ['10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '21000', '22000', '23000', '24000', '25000', '26000', '27000', '28000', '29000'],
    'Croatie': ['10000', '20000', '21000', '22000', '23000', '31000', '32000', '33000', '34000', '35000', '40000', '42000', '43000', '44000', '47000', '48000', '49000', '51000', '52000', '53000'],
    'Slovénie': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2100', '2200'],
    'Serbie': ['10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '21000', '22000', '23000', '24000', '25000', '26000', '27000', '28000', '29000'],

    // Autres pays européens
    'Irlande': ['D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15', 'D16', 'D17', 'D18', 'D19', 'D20'],
    'Luxembourg': ['1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2100', '2200'],
    'Islande': ['100', '200', '300', '400', '500', '600', '700', '800', '900', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111'],

    // Hors Europe
    'Maroc': ['10000', '20000', '30000', '40000', '50000', '60000', '70000', '80000', '90000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '21000', '22000'],
    'Canada': ['A0A', 'A1A', 'B0A', 'B1A', 'C0A', 'C1A', 'E0A', 'E1A', 'G0A', 'G1A', 'H0A', 'H1A', 'J0A', 'J1A', 'K0A', 'K1A', 'L0A', 'L1A', 'M0A', 'M1A', 'N0A', 'N1A', 'P0A', 'P1A', 'R0A', 'R1A', 'S0A', 'S1A', 'T0A', 'T1A', 'V0A', 'V1A', 'X0A', 'X1A', 'Y0A', 'Y1A'],
    'USA': ['10001', '20001', '30001', '40001', '50001', '60001', '70001', '80001', '90001', '11001', '12001', '13001', '14001', '15001', '16001', '17001', '18001', '19001', '21001', '22001', '30301', '33101', '34101', '35101', '36101', '37101', '38101', '39101', '44101', '45101'],
    'Thailand': ['10100', '10200', '10300', '10400', '10500', '20100', '20200', '30100', '30200', '40100', '40200', '50100', '50200', '60100', '60200', '70100', '70200', '80100', '80200', '90100']
  }

  // Récupérer les départements disponibles selon le pays sélectionné
  const getAvailableDepartments = () => {
    if (!countryFilter) {
      // Si aucun pays sélectionné, montrer les départements trouvés dans les boutiques
      const departments = new Set()
      allPlugs.forEach(plug => {
        if (plug.services?.delivery?.departments && Array.isArray(plug.services.delivery.departments)) {
          plug.services.delivery.departments.forEach(dept => {
            if (dept && dept.trim() !== '') departments.add(dept)
          })
        }
        if (plug.services?.meetup?.departments && Array.isArray(plug.services.meetup.departments)) {
          plug.services.meetup.departments.forEach(dept => {
            if (dept && dept.trim() !== '') departments.add(dept)
          })
        }
      })
      return Array.from(departments).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    }

    // Si un pays est sélectionné, utiliser la définition correcte des départements
    const countryDepartments = departmentsByCountry[countryFilter] || []
    
    // Filtrer pour ne montrer que les départements qui ont des boutiques
    const availableDepartments = countryDepartments.filter(dept => {
      return allPlugs.some(plug => {
        const matchesCountry = plug.countries && plug.countries.some(country => 
          country.toLowerCase().includes(countryFilter.toLowerCase())
        )
        const hasDepartment = 
          (plug.services?.delivery?.departments && plug.services.delivery.departments.includes(dept)) ||
          (plug.services?.meetup?.departments && plug.services.meetup.departments.includes(dept))
        return matchesCountry && hasDepartment
      })
    })

    return availableDepartments.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  }

  useEffect(() => {
    filterPlugs()
  }, [search, countryFilter, serviceFilter, departmentFilter, vipFilter, allPlugs])

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
      // APPEL DIRECT au bot pour récupérer les VRAIES boutiques
      const response = await fetch('https://jhhhhhhggre.onrender.com/api/public/plugs?limit=100', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()

      let plugsArray = []
      if (data && Array.isArray(data.plugs)) {
        plugsArray = data.plugs
      } else if (Array.isArray(data)) {
        plugsArray = data
      } else {
        console.error('❌ Structure de données recherche inattendue:', data)
        plugsArray = []
      }

      console.log('🔍 Plugs recherche chargés:', plugsArray.length, 'boutiques')
      setAllPlugs(plugsArray)
    } catch (error) {
      console.error('Erreur chargement plugs recherche:', error)
      // Mode offline : données par défaut
      const fallbackPlugs = [
        {
          _id: 'fallback_search_1',
          name: 'Boutique Recherche',
          description: 'Serveur temporairement indisponible',
          image: 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Recherche',
          isActive: true,
          isVip: false,
          likes: 0,
          countries: ['France'],
          services: ['Livraison'],
          departments: ['75']
        }
      ]
      setAllPlugs(fallbackPlugs)
      console.log('📱 Mode offline recherche: Données par défaut')
    } finally {
      setLoading(false)
    }
  }

  const filterPlugs = () => {
    let filtered = allPlugs.filter(plug => {
      const matchesSearch = search === '' || 
        plug.name.toLowerCase().includes(search.toLowerCase()) ||
        plug.description.toLowerCase().includes(search.toLowerCase())
      
      const matchesCountry = countryFilter === '' || 
        (plug.countries && plug.countries.some(country => 
          country.toLowerCase().includes(countryFilter.toLowerCase())
        ))
      
      const matchesService = serviceFilter === '' || 
        (serviceFilter === 'delivery' && plug.services?.delivery?.enabled) ||
        (serviceFilter === 'postal' && plug.services?.postal?.enabled) ||
        (serviceFilter === 'meetup' && plug.services?.meetup?.enabled)
      
      const matchesDepartment = departmentFilter === '' || 
        (plug.services?.delivery?.departments && plug.services.delivery.departments.includes(departmentFilter)) ||
        (plug.services?.meetup?.departments && plug.services.meetup.departments.includes(departmentFilter))
      
      const matchesVip = vipFilter === '' || 
        (vipFilter === 'vip' && plug.isVip) ||
        (vipFilter === 'standard' && !plug.isVip)
      
      return matchesSearch && matchesCountry && matchesService && matchesDepartment && matchesVip
    })

    filtered = filtered.sort((a, b) => {
      if (a.isVip && !b.isVip) return -1
      if (!a.isVip && b.isVip) return 1
      return (b.likes || 0) - (a.likes || 0)
    })

    setPlugs(filtered)
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setSearch('')
    setCountryFilter('')
    setServiceFilter('')
    setDepartmentFilter('')
    setVipFilter('')
  }

  const uniqueCountries = [...new Set(allPlugs.flatMap(plug => plug.countries || []))].sort()

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

  if (initialLoading) {
    return (
      <>
        <Head>
          <title>Chargement...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>
        <div style={{ backgroundColor: '#000000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              border: '2px solid transparent',
              borderTop: '2px solid #ffffff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#ffffff', fontWeight: '500' }}>Chargement de la recherche...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{t('search')} - {config?.boutique?.name || 'FINDYOURPLUG'}</title>
        <meta name="description" content={t('search_desc') || 'Recherchez vos boutiques préférées par nom, pays ou service.'} />
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
        {/* Header */}
        <header style={{ 
          backgroundColor: '#000000',
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
            color: '#8e8e93', 
            fontSize: '16px',
            margin: '0',
            fontWeight: '400'
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
              <option value="">🌍 {t('all_countries') || 'Tous pays'}</option>
              {getAvailableCountries().map(country => (
                <option key={country} value={country}>{country}</option>
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
              <option value="">🚀 {t('all_services') || 'Tous services'}</option>
              <option value="delivery">🛵 {t('delivery') || 'Livraison'}</option>
              <option value="postal">📬 {t('postal') || 'Postal'}</option>
              <option value="meetup">🤝 {t('meetup') || 'Meetup'}</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
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
              <option value="">
                🗺️ {countryFilter ? 
                  `Département (${countryFilter})` : 
                  'Département 🗺️'
                }
              </option>
              {getAvailableDepartments().map(department => (
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
              <option value="">⭐ {t('all_types') || 'Tous types'}</option>
              <option value="vip">👑 {t('vip') || 'VIP'} {t('only') || 'uniquement'}</option>
              <option value="standard">🔹 {t('standard') || 'Standard'} {t('only') || 'uniquement'}</option>
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
            🔄 {t('reset') || 'Réinitialiser'}
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
              `${t('searching') || 'Recherche en cours'}...` : 
              `${plugs.length} ${t('shops') || 'boutique(s)'} ${t('found') || 'trouvée(s)'}`
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
                <p style={{ color: '#ffffff' }}>{t('searching') || 'Recherche en cours'}...</p>
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
                {t('no_shops_found') || 'Aucune boutique trouvée'}
              </h3>
              <p style={{ 
                color: '#8e8e93', 
                marginBottom: '24px',
                fontSize: '16px',
                maxWidth: '400px',
                lineHeight: '1.5'
              }}>
                {t('try_different_criteria') || 'Essayez de modifier vos critères de recherche.'}
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
                {currentPlugs.map((plug) => (
                  <ShopCard 
                    key={plug._id} 
                    plug={plug} 
                    config={config}
                    currentLanguage={currentLanguage}
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
