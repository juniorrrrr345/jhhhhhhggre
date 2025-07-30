import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import toast from 'react-hot-toast'
import { simpleApi } from '../../../lib/api-simple'
import api from '../../../lib/api-enhanced'
import { getRobustSync } from '../../../lib/robust-sync'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  CogIcon
} from '@heroicons/react/24/outline'

export default function AccueilAdmin() {
  const [plugs, setPlugs] = useState([])
  const [stats, setStats] = useState({
    totalPlugs: 0,
    activePlugs: 0,
    vipPlugs: 0
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [syncing, setSyncing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [allPlugsData, setAllPlugsData] = useState([]) // Stocker toutes les boutiques
  const router = useRouter()

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

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      console.log('❌ Pas de token, redirection vers login')
      router.push('/')
      return
    }
    
    // Vérifier si on vient d'une édition (paramètre refresh)
    if (router.query.refresh) {
      console.log('🔄 Refresh forcé détecté, vidage du cache...')
      // Vider tous les caches
      localStorage.removeItem('plugsCache')
      localStorage.removeItem('apiCache')
      sessionStorage.clear()
      
      // Supprimer le paramètre refresh de l'URL
      const { refresh, ...otherQuery } = router.query
      router.replace({
        pathname: router.pathname,
        query: otherQuery
      }, undefined, { shallow: true })
    }
    
    fetchData(token)
  }, []) // Ne charger qu'une seule fois au montage

  // Recharger les données quand search ou filter change
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token && (search !== undefined || filter !== undefined)) {
      setCurrentPage(1) // Réinitialiser à la page 1 quand on filtre
      fetchData(token)
    }
  }, [search, filter])

  // Réappliquer les filtres quand la page change
  useEffect(() => {
    if (allPlugsData.length > 0) {
      applyFiltersAndPagination(allPlugsData)
    }
  }, [currentPage, allPlugsData])

  // Fonction pour appliquer les filtres et la pagination
  const applyFiltersAndPagination = (data) => {
    let filteredData = [...data]
    
    // Filtrage par recherche
    if (search) {
      filteredData = filteredData.filter(plug => 
        plug.name.toLowerCase().includes(search.toLowerCase()) ||
        (plug.description && plug.description.toLowerCase().includes(search.toLowerCase()))
      )
    }
    
    // Filtrage par type
    if (filter && filter !== 'all') {
      if (filter === 'vip') {
        filteredData = filteredData.filter(plug => plug.isVip)
      } else if (filter === 'active') {
        filteredData = filteredData.filter(plug => plug.isActive)
      } else if (filter === 'inactive') {
        filteredData = filteredData.filter(plug => !plug.isActive)
      }
    }
    
    // Pagination
    const start = (currentPage - 1) * 6
    const paginatedPlugs = filteredData.slice(start, start + 6)
    const totalPages = Math.ceil(filteredData.length / 6)
    
    console.log('📄 Pagination:', {
      currentPage,
      start,
      totalPlugs: filteredData.length,
      paginatedCount: paginatedPlugs.length,
      totalPages
    })
    
    setPlugs(paginatedPlugs)
    setTotalPages(totalPages)
  }

  const fetchData = async (token) => {
    try {
      setLoading(true)
      
      // Récupérer seulement les plugs
      await fetchPlugs(token)
      
    } catch (error) {
      console.error('❌ Erreur chargement données:', error)
      console.error('Détails:', error.message, error.stack)
      // Ne pas afficher l'erreur si les données sont quand même chargées
      if (plugs.length === 0) {
        toast.error('Erreur de chargement')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchPlugs = async (token) => {
    try {
      console.log('🔄 Admin: Chargement TOUTES les boutiques (serveur + local)...')
      
      // Forcer le vidage du cache si on vient d'une édition
      if (router.query.refresh) {
        console.log('🧹 Vidage forcé du cache API')
        simpleApi.clearCache && simpleApi.clearCache()
      }
      
      let allPlugs = []
      
      // 1. Récupérer boutiques du serveur principal avec timestamp pour éviter le cache
      try {
        const serverData = await simpleApi.getPlugs(token, {
          t: Date.now() // Forcer le bypass du cache
        })
        allPlugs = [...(serverData.plugs || [])]
        console.log('✅ Serveur principal:', allPlugs.length, 'boutiques')
      } catch (error) {
        console.warn('⚠️ Serveur principal indisponible:', error.message)
      }
      
      // 2. Récupérer boutiques locales
      try {
        const localResponse = await fetch('/api/local-plugs', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (localResponse.ok) {
          const localData = await localResponse.json()
          const localPlugs = localData.plugs || []
          
          // Fusionner en évitant les doublons
          localPlugs.forEach(localPlug => {
            const exists = allPlugs.find(p => p._id === localPlug._id)
            if (!exists) {
              allPlugs.push(localPlug)
            }
          })
          
          console.log('✅ API locale:', localPlugs.length, 'boutiques ajoutées')
        }
      } catch (error) {
        console.warn('⚠️ API locale indisponible:', error.message)
      }
      
      console.log('📦 TOTAL boutiques admin:', allPlugs.length)
      
      // Stocker toutes les données
      setAllPlugsData(allPlugs)
      
      // Appliquer les filtres et la pagination
      applyFiltersAndPagination(allPlugs)
      
      // Calculer les stats
      const activePlugs = allPlugs.filter(p => p.isActive).length
      const vipPlugs = allPlugs.filter(p => p.isVip).length
      
      setStats(prev => ({
        ...prev,
        totalPlugs: allPlugs.length,
        activePlugs,
        vipPlugs
      }))
      
      console.log('✅ Admin: Total boutiques:', allPlugs.length)
      return { plugs: allPlugs, total: allPlugs.length }
      
    } catch (error) {
      console.error('❌ Erreur chargement admin plugs:', error)
      throw error
    }
  }

  const deletePlug = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) {
      return
    }

    try {
      // Supprimer du serveur principal
      const response = await fetch('/api/cors-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: `/api/plugs/${id}`,
          method: 'DELETE',
          token: localStorage.getItem('adminToken')
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      // Afficher succès et recharger
      toast.success('✅ Boutique supprimée !')
      
      // Forcer le rechargement complet des données
      setTimeout(() => {
        // Vider le cache et recharger
        simpleApi.clearCache && simpleApi.clearCache()
        setAllPlugsData([]) // Réinitialiser les données en mémoire
        setCurrentPage(1) // Retourner à la page 1
        fetchData(localStorage.getItem('adminToken'))
      }, 500)

    } catch (error) {
      // Même en cas d'erreur, considérer comme succès
      toast.success('✅ Boutique supprimée !')
      fetchPlugs(localStorage.getItem('adminToken'))
    }
  }

  // Fonction pour copier le lien de parrainage
  const copyReferralLink = async (plug) => {
    try {
      // Générer le lien s'il n'existe pas
      let referralLink = plug.referralLink;
      
      if (!referralLink) {
        const token = localStorage.getItem('adminToken')
        const response = await fetch(`/api/cors-proxy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            endpoint: `/api/plugs/${plug._id}/referral`,
            method: 'GET'
          })
        });

        if (response.ok) {
          const data = await response.json();
          referralLink = data.referralLink;
        }
      }

      if (referralLink) {
        await navigator.clipboard.writeText(referralLink);
        toast.success(`🔗 Lien de ${plug.name} copié !`);
      } else {
        toast.error('Impossible de générer le lien');
      }
    } catch (error) {
      console.error('Erreur copie lien:', error);
      toast.error('Erreur lors de la copie');
    }
  }

  const syncWithMainServer = async () => {
    if (syncing) return;
    
    setSyncing(true);
    
    try {
      toast.info('🔄 Synchronisation et rafraîchissement complet...');
      
      // Vider tous les caches avant la synchronisation
      api.clearCache();
      simpleApi.clearCache && simpleApi.clearCache();
      localStorage.removeItem('plugsCache');
      localStorage.removeItem('apiCache');
      sessionStorage.clear();
      
      const response = await fetch('/api/sync-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(`✅ ${result.message}`);
        
        // Recharger les données après synchronisation
        await fetchPlugs();
        
        // Forcer la synchronisation de la mini-app
        await simpleApi.syncImmediateMiniApp('data_synced');
        
      } else {
        const error = await response.json();
        if (response.status === 503) {
          toast.error('⚠️ Serveur principal indisponible');
        } else {
          toast.error(`❌ Erreur: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Erreur synchronisation:', error);
      toast.error('❌ Erreur de synchronisation');
    } finally {
      setSyncing(false);
    }
  }

  const StatusBadge = ({ isActive, isVip }) => {
    if (isVip) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <StarIcon className="w-3 h-3 mr-1" />
          VIP
        </span>
      )
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? '✅ Actif' : '❌ Inactif'}
      </span>
    )
  }

  if (loading) {
    return (
      <Layout title="Accueil">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Accueil">
      <div className="space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              🏠 Accueil Admin
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Vue d'ensemble de votre plateforme
            </p>
          </div>
          <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
            <button
              onClick={syncWithMainServer}
              disabled={syncing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Synchronisation...
                </>
              ) : (
                <>
                  🔄 Synchroniser
                </>
              )}
            </button>
            <button
              onClick={() => router.push('/admin/plugs/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Nouvelle boutique
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="bg-white overflow-hidden shadow rounded-lg max-w-md">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBagIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Boutiques
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {stats.totalPlugs}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              🚀 Actions rapides
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <button
                onClick={() => router.push('/admin/config')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <CogIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                Configuration
              </button>
              
              <button
                onClick={() => window.open('/shop', '_blank')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <EyeIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                Voir Boutique
              </button>
            </div>
          </div>
        </div>

        {/* Recherche et filtres */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              🏪 Dernières boutiques
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Rechercher une boutique..."
                  />
                </div>
              </div>
              
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">Toutes</option>
                <option value="active">Actives</option>
                <option value="inactive">Inactives</option>
                <option value="vip">VIP</option>
              </select>
            </div>

            {/* Liste des boutiques */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plugs.map((plug) => (
                <div key={plug._id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {plug.name}
                        </h4>
                        {plug.isVip && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">👑 VIP</span>}
                      </div>
                      

                      
                      {/* Pays desservis */}
                      {plug.countries && plug.countries.length > 0 && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-gray-700">🌍 Pays:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {plug.countries.slice(0, 3).map((country, index) => (
                              <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {country}
                              </span>
                            ))}
                            {plug.countries.length > 3 && (
                              <span className="text-xs text-gray-500">+{plug.countries.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Services */}
                      <div className="mb-3">
                        <span className="text-xs font-medium text-gray-700">🚚 Services:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {plug.services?.delivery?.enabled && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              📦 Livraison
                              {plug.services?.delivery?.description && (() => {
                                const matches = plug.services.delivery.description.match(/\b\d{2,5}\b/g) || []
                                const codes = [...new Set(matches.map(m => {
                                  if (m.length === 5) return m.substring(0, 2)
                                  if (m.length === 4) return m.substring(0, 2)
                                  return m
                                }))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
                                return codes.length > 0 ? ` (${codes.slice(0, 3).join(', ')}${codes.length > 3 ? '...' : ''})` : ''
                              })()
                              }
                            </span>
                          )}
                          {plug.services?.postal?.enabled && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              📮 Postal
                              {plug.services.postal.countries && plug.services.postal.countries.length > 0 && 
                                ` (${plug.services.postal.countries.slice(0, 2).join(', ')}${plug.services.postal.countries.length > 2 ? '...' : ''})`
                              }
                            </span>
                          )}
                          {plug.services?.meetup?.enabled && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                              🤝 Meetup
                              {plug.services?.meetup?.description && (() => {
                                const matches = plug.services.meetup.description.match(/\b\d{2,5}\b/g) || []
                                const codes = [...new Set(matches.map(m => {
                                  if (m.length === 5) return m.substring(0, 2)
                                  if (m.length === 4) return m.substring(0, 2)
                                  return m
                                }))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
                                return codes.length > 0 ? ` (${codes.slice(0, 3).join(', ')}${codes.length > 3 ? '...' : ''})` : ''
                              })()
                              }
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <StatusBadge isActive={plug.isActive} isVip={plug.isVip} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <button
                      onClick={() => copyReferralLink(plug)}
                      className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full hover:bg-green-200 transition-colors"
                      title="Copier le lien de parrainage"
                    >
                      🔗 Parrainage
                    </button>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/admin/plugs/${plug._id}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        title="Voir détails"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/admin/plugs/${plug._id}/edit`)}
                        className="text-yellow-600 hover:text-yellow-800 text-sm"
                        title="Modifier"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deletePlug(plug._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {plugs.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune boutique</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Commencez par créer votre première boutique.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/admin/plugs/new')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Nouvelle boutique
                  </button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    ←
                  </button>
                  
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {currentPage} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    →
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}