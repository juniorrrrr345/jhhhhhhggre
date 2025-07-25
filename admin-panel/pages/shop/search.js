import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { simpleApi as api } from '../../lib/api-simple'
import { getProxiedImageUrl } from '../../lib/imageUtils'
import toast from 'react-hot-toast'
import Pagination from '../../components/Pagination'
import ShopCard from '../../components/ShopCard'

export default function ShopSearch() {
  const [plugs, setPlugs] = useState([])
  const [allPlugs, setAllPlugs] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [vipFilter, setVipFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    fetchConfig()
    fetchPlugs()
    
    // Plus de refresh automatique - utiliser le bouton "Actualiser" si besoin
    
    const handleStorageChange = (event) => {
      if (event?.key === 'boutique_sync_signal' || event?.key === 'global_sync_signal') {
        console.log('🔄 Signal de synchronisation reçu:', event.key)
        setTimeout(() => {
          fetchConfig()
          fetchPlugs()
        }, 500)
        if (typeof toast !== 'undefined') {
          toast.success('🔄 Données synchronisées!', {
            duration: 2000,
            icon: '🔄'
          })
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    filterPlugs()
  }, [search, countryFilter, serviceFilter, vipFilter, allPlugs])

  const fetchConfig = async () => {
    try {
      const data = await api.getPublicConfig()
      setConfig(data)
    } catch (error) {
      console.error('❌ Erreur chargement config:', error)
      toast.error('Erreur de connexion')
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchPlugs = async () => {
    try {
      setLoading(true)
      const data = await api.getPublicPlugs({ limit: 100 })

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
      console.error('❌ Erreur chargement plugs recherche:', error)
      setAllPlugs([])
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
      
      const matchesVip = vipFilter === '' || 
        (vipFilter === 'vip' && plug.isVip) ||
        (vipFilter === 'standard' && !plug.isVip)
      
      return matchesSearch && matchesCountry && matchesService && matchesVip
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
        <title>Recherche - {config?.boutique?.name || 'FINDYOURPLUG'}</title>
        <meta name="description" content="Recherchez vos boutiques préférées par nom, pays ou service." />
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
        {/* Header Titre Principal Recherche */}
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
            {config?.boutique?.searchTitle || config?.boutique?.name || 'RECHERCHE'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ color: '#ffffff', fontSize: '14px' }}>
              {config?.boutique?.searchSubtitle || ''}
            </span>
            <span style={{ 
              backgroundColor: '#007AFF', 
              color: '#ffffff', 
              padding: '4px 8px', 
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {config?.boutique?.searchBlueText || 'RECHERCHE'}
            </span>
          </div>
        </div>



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
              placeholder="🔍 Rechercher une boutique..."
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '16px',
                outline: 'none'
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
                fontSize: '14px'
              }}
            >
              <option value="">🌍 Tous pays</option>
              {uniqueCountries.map(country => (
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
                fontSize: '14px'
              }}
            >
              <option value="">🚀 Tous services</option>
              <option value="delivery">📦 Livraison</option>
              <option value="postal">📍 Postal</option>
              <option value="meetup">💰 Meetup</option>
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
                fontSize: '14px'
              }}
            >
              <option value="">⭐ Tous types</option>
              <option value="vip">👑 VIP uniquement</option>
              <option value="standard">🔹 Standard uniquement</option>
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
            🔄 Réinitialiser
          </button>
        </div>

        {/* Résultats */}
        <main style={{ padding: '0 20px 90px' }}>
          {/* Compteur de résultats */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '20px',
            color: '#8e8e93',
            fontSize: '14px'
          }}>
            {loading ? 'Recherche en cours...' : `${plugs.length} boutique(s) trouvée(s)`}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                border: '2px solid transparent',
                borderTop: '2px solid #007AFF',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: '#ffffff' }}>Recherche en cours...</p>
            </div>
          ) : plugs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '500', marginBottom: '8px' }}>
                Aucune boutique trouvée
              </h3>
              <p style={{ color: '#8e8e93', marginBottom: '24px' }}>Essayez de modifier vos critères de recherche.</p>
            </div>
          ) : (
            <>
              {/* Liste des résultats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {currentPlugs.map((plug, index) => (
                  <ShopCard key={plug._id || index} plug={plug} index={index} />
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

        {/* Navigation en bas */}
        <nav style={{ 
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          backgroundColor: '#000000',
          padding: '12px 0',
          borderTop: '1px solid #2a2a2a',
          zIndex: 1000
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
            maxWidth: '100%'
          }}>
            <Link href="/shop" style={{ 
              color: '#8e8e93', 
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
              color: '#007AFF', 
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
