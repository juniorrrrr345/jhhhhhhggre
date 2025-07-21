import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

export default function PlugsManagement() {
  const [plugs, setPlugs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState('plugs') // 'plugs', 'search', 'vip'
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
        limit: 20,
        search,
        filter: activeTab === 'vip' ? 'vip' : filter
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
        setTotalPages(Math.ceil((data.pagination?.total || data.total || 0) / 20))
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
        fetchPlugs(localStorage.getItem('adminToken'))
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

  const getRandomLikes = () => {
    return Math.floor(Math.random() * 1000) + 100
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'vip') {
      setFilter('vip')
    } else {
      setFilter('all')
    }
    setCurrentPage(1)
  }

  const renderPlugCard = (plug) => (
    <div key={plug._id} className="bg-gray-800 rounded-2xl p-4 mb-4 relative">
      {/* Header avec actions admin cachées */}
      <div className="absolute top-2 right-2 opacity-30 hover:opacity-100 transition-opacity">
        <div className="flex space-x-1">
          <button
            onClick={() => router.push(`/admin/plugs/${plug._id}`)}
            className="text-blue-400 hover:text-blue-300 text-xs"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push(`/admin/plugs/${plug._id}/edit`)}
            className="text-yellow-400 hover:text-yellow-300 text-xs"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => togglePlugStatus(plug._id, plug.isActive)}
            className={`${plug.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'} text-xs`}
          >
            {plug.isActive ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={() => deletePlug(plug._id, plug.name)}
            className="text-red-400 hover:text-red-300 text-xs"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Image du plug */}
        <div className="flex-shrink-0">
          <img
            src={plug.image || '/placeholder.jpg'}
            alt={plug.name}
            className="w-16 h-16 rounded-2xl object-cover"
          />
        </div>

        {/* Informations du plug */}
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-white text-lg font-bold">🇫🇷</span>
            <h3 className="text-white text-lg font-bold uppercase tracking-wide">
              {plug.name}
            </h3>
            {!plug.isActive && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                INACTIF
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3 mt-2">
            {/* Services */}
            {plug.services?.delivery?.enabled && (
              <span className="text-orange-400" title="Livraison">📦</span>
            )}
            {plug.services?.postal?.enabled && (
              <span className="text-red-400" title="Postal">📍</span>
            )}
            {plug.services?.meetup?.enabled && (
              <span className="text-yellow-400" title="Meetup">🚲</span>
            )}
          </div>
        </div>

        {/* Badge VIP et likes */}
        <div className="flex flex-col items-end">
          {plug.isVip && (
            <div className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full mb-2 flex items-center">
              <span className="text-sm">⚠️</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400">👍</span>
            <span className="text-white font-bold">{getRandomLikes()}</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">PLUGS FINDER</h1>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-sm text-gray-300">JUSTE UNE</span>
          <span className="bg-blue-500 text-white text-sm px-2 py-1 rounded">MINI-APP TELEGRAM</span>
          <span className="text-sm text-gray-300">CHILL</span>
        </div>
        
        {/* Bouton admin caché */}
        <button
          onClick={() => router.push('/admin/plugs/new')}
          className="absolute top-4 left-4 bg-blue-600 text-white p-2 rounded-full opacity-30 hover:opacity-100 transition-opacity"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Barre de recherche (affichée seulement sur l'onglet recherche) */}
      {activeTab === 'search' && (
        <div className="px-4 py-4 bg-gray-900">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Rechercher un plug..."
            />
          </div>
        </div>
      )}

      {/* Liste des plugs */}
      <div className="px-4 py-4 pb-20">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement...</p>
          </div>
        ) : plugs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">
              {activeTab === 'vip' ? 'Aucun plug VIP trouvé' : 
               activeTab === 'search' ? 'Aucun résultat pour votre recherche' : 
               'Aucun plug trouvé'}
            </p>
          </div>
        ) : (
          <>
            {plugs.map(renderPlugCard)}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <span className="px-4 py-2 text-gray-400">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigation du bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700">
        <div className="flex justify-around py-2">
          <button
            onClick={() => handleTabChange('plugs')}
            className={`flex flex-col items-center py-2 px-4 ${
              activeTab === 'plugs' ? 'text-white' : 'text-gray-400'
            }`}
          >
            <HomeIcon className="w-6 h-6 mb-1" />
            <span className="text-xs">Plugs</span>
          </button>
          
          <button
            onClick={() => handleTabChange('search')}
            className={`flex flex-col items-center py-2 px-4 ${
              activeTab === 'search' ? 'text-white' : 'text-gray-400'
            }`}
          >
            <MagnifyingGlassIcon className="w-6 h-6 mb-1" />
            <span className="text-xs">Rechercher</span>
          </button>
          
          <button
            onClick={() => handleTabChange('vip')}
            className={`flex flex-col items-center py-2 px-4 ${
              activeTab === 'vip' ? 'text-white' : 'text-gray-400'
            }`}
          >
            <StarIcon className="w-6 h-6 mb-1" />
            <span className="text-xs">VIP</span>
          </button>
        </div>
      </div>
    </div>
  )
}