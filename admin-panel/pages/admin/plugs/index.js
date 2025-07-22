import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import toast from 'react-hot-toast'
import { simpleApi } from '../../../lib/api-simple'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const router = useRouter()

  useEffect(() => {
    let token = localStorage.getItem('adminToken')
    if (!token) {
      // Utiliser le token par défaut temporairement
      token = 'JuniorAdmon123'
      localStorage.setItem('adminToken', token)
    }
    fetchData(token)
  }, [search, filter, currentPage])

  const fetchData = async (token) => {
    try {
      setLoading(true)
      
      // Récupérer seulement les plugs
      await fetchPlugs(token)
      
    } catch (error) {
      console.error('❌ Erreur chargement données:', error)
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const fetchPlugs = async (token) => {
    try {
      console.log('🔄 Chargement des boutiques...')
      console.log('🔑 Token:', token?.substring(0, 10) + '...')
      console.log('📋 Params:', { page: currentPage, limit: 6, search, filter })
      
      const data = await simpleApi.getPlugs(token, {
        page: currentPage,
        limit: 6,
        search,
        filter
      })
      
      console.log('✅ Données reçues:', data)
      console.log('📦 Plugs count:', data.plugs?.length)
      
      setPlugs(data.plugs || [])
      setTotalPages(data.totalPages || 1)
      
      // Calculer les stats
      const totalPlugs = data.total || 0
      const activePlugs = (data.plugs || []).filter(p => p.isActive).length
      const vipPlugs = (data.plugs || []).filter(p => p.isVip).length
      
      setStats(prev => ({
        ...prev,
        totalPlugs,
        activePlugs,
        vipPlugs
      }))
      
      console.log('✅ Boutiques chargées:', data.plugs?.length)
      return data
    } catch (error) {
      console.error('❌ Erreur chargement plugs:', error)
      throw error
    }
  }

  const deletePlug = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      console.log('🗑️ Suppression de la boutique...')
      
      await simpleApi.deletePlug(token, id)
      
      toast.success('Boutique supprimée')
      fetchData(token)
      console.log('✅ Boutique supprimée')
    } catch (error) {
      console.error('❌ Erreur suppression:', error)
      toast.error('Erreur lors de la suppression')
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
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => router.push('/admin/plugs/new')}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Nouvelle boutique
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Boutiques
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalPlugs}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 text-green-400">✅</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Boutiques Actives
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.activePlugs}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <StarIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Boutiques VIP
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.vipPlugs}
                    </dd>
                  </dl>
                </div>
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
                <div key={plug._id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {plug.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {plug.description}
                      </p>
                      <div className="mt-2">
                        <StatusBadge isActive={plug.isActive} isVip={plug.isVip} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-end space-x-2">
                    <button
                      onClick={() => router.push(`/admin/plugs/${plug._id}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => router.push(`/admin/plugs/${plug._id}/edit`)}
                      className="text-yellow-600 hover:text-yellow-800 text-sm"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deletePlug(plug._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
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