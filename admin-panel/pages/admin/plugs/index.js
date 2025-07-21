import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import Pagination from '../../../components/Pagination'
import toast from 'react-hot-toast'
import {
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  StarIcon
} from '@heroicons/react/24/outline'

// Composant card responsive pour mobile
const PlugCard = ({ plug, onView, onEdit, onToggleStatus, onToggleVip, onDelete }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
    {/* En-tête avec image et nom */}
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        {plug.image ? (
          <img
            src={plug.image}
            alt={plug.name}
            className="w-12 h-12 rounded-lg object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
        ) : null}
        <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center ${plug.image ? 'hidden' : 'block'}`}>
          <span className="text-xs text-gray-400">IMG</span>
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{plug.name}</h3>
          {plug.isVip && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
              <StarIcon className="w-3 h-3 mr-1" />
              VIP
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{plug.description}</p>
      </div>
    </div>

    {/* Services et pays */}
    <div className="space-y-2">
      {/* Services */}
      <div className="flex flex-wrap gap-1">
        {plug.services?.delivery?.enabled && (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            🚚 Livraison
          </span>
        )}
        {plug.services?.postal?.enabled && (
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
            ✈️ Postal
          </span>
        )}
        {plug.services?.meetup?.enabled && (
          <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
            🏠 Meetup
          </span>
        )}
      </div>

      {/* Pays */}
      {plug.countries && plug.countries.length > 0 && (
        <div className="text-xs text-gray-500">
          📍 {plug.countries.slice(0, 2).join(', ')}
          {plug.countries.length > 2 && ` +${plug.countries.length - 2}`}
        </div>
      )}
    </div>

    {/* Statut et actions */}
    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          plug.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {plug.isActive ? '🟢 Actif' : '🔴 Inactif'}
        </span>
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={() => onView(plug._id)}
          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
          title="Voir"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(plug._id)}
          className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
          title="Modifier"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onToggleStatus(plug._id, plug.isActive)}
          className={`p-1.5 rounded ${
            plug.isActive 
              ? 'text-red-600 hover:text-red-800 hover:bg-red-50' 
              : 'text-green-600 hover:text-green-800 hover:bg-green-50'
          }`}
          title={plug.isActive ? 'Désactiver' : 'Activer'}
        >
          {plug.isActive ? '⏸️' : '▶️'}
        </button>
        <button
          onClick={() => onToggleVip(plug._id, plug.isVip)}
          className={`p-1.5 rounded ${
            plug.isVip 
              ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50' 
              : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
          }`}
          title={plug.isVip ? 'Retirer VIP' : 'Marquer VIP'}
        >
          <StarIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(plug)}
          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
          title="Supprimer"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
)

export default function PlugsManagement() {
  const [plugs, setPlugs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
    fetchPlugs(token)
  }, [search, filter, currentPage])

  const fetchPlugs = async (token) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search,
        filter
      })

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
      console.log('📋 Fetching admin plugs from:', apiBaseUrl)

      const response = await fetch(`${apiBaseUrl}/api/plugs?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      console.log('📋 Admin plugs response:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Admin plugs loaded:', data.plugs?.length || 0)
        setPlugs(data.plugs || [])
        setTotalPages(Math.ceil((data.pagination?.total || data.total || 0) / 10))
      } else {
        console.error('❌ Admin plugs error:', response.status)
        toast.error('Erreur lors du chargement')
      }
    } catch (error) {
      console.error('💥 Admin plugs error:', error)
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const togglePlugStatus = async (plugId, currentStatus) => {
    const token = localStorage.getItem('adminToken')
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/plugs/${plugId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        toast.success(`Boutique ${!currentStatus ? 'activée' : 'désactivée'}`)
        fetchPlugs(token)
      } else {
        toast.error('Erreur lors de la modification')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }



  const deletePlug = async (plugId, plugName) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${plugName}" ?`)) return

    const token = localStorage.getItem('adminToken')
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/plugs/${plugId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('Boutique supprimée')
        fetchPlugs(token)
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    }
  }

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Actif
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactif
      </span>
    )
  }

  const getVipBadge = (isVip) => {
    if (!isVip) return null
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        <StarIcon className="w-3 h-3 mr-1" />
        VIP
      </span>
    )
  }

  return (
    <Layout title="Gestion des Boutiques">
      <div className="space-y-6">
        {/* Header avec actions */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Boutiques & Plugs</h1>
            <p className="text-gray-600">Gérez vos boutiques et leurs informations</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => router.push('/admin/plugs/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nouvelle boutique
            </button>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nom ou description..."
                />
              </div>
            </div>

            {/* Filtre statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous</option>
                <option value="active">Actifs seulement</option>
                <option value="inactive">Inactifs seulement</option>
                <option value="vip">VIP seulement</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des boutiques */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Chargement...</p>
            </div>
          ) : plugs.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">Aucune boutique trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Boutique
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Services
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pays
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plugs.map((plug) => (
                    <tr key={plug._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={plug.image || '/placeholder.jpg'}
                              alt={plug.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {plug.name}
                              </div>
                              {getVipBadge(plug.isVip)}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {plug.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          {plug.services?.delivery?.enabled && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              🚚 Livraison
                            </span>
                          )}
                          {plug.services?.postal?.enabled && (
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              ✈️ Postal
                            </span>
                          )}
                          {plug.services?.meetup?.enabled && (
                            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                              🏠 Meetup
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {plug.countries?.join(', ') || 'Non défini'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(plug.isActive)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => router.push(`/admin/plugs/${plug._id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/plugs/${plug._id}/edit`)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => togglePlugStatus(plug._id, plug.isActive)}
                            className={`${plug.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          >
                            {plug.isActive ? '⏸️' : '▶️'}
                          </button>
                          <button
                            onClick={() => deletePlug(plug._id, plug.name)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> sur{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}