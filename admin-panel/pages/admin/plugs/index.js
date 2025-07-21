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
  HomeIcon,
  GiftIcon
} from '@heroicons/react/24/outline'

export default function PlugsManagement() {
  const [plugs, setPlugs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState('plugs') // 'plugs', 'search', 'giveaway'
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
    setCurrentPage(1)
  }

  const renderPlugCard = (plug) => (
    <div key={plug._id} className="bg-gray-800 rounded-3xl p-5 mb-4 relative">
      {/* Actions admin cachées */}
      <div className="absolute top-3 right-3 opacity-20 hover:opacity-100 transition-opacity">
        <div className="flex space-x-1">
          <button
            onClick={() => router.push(`/admin/plugs/${plug._id}`)}
            className="text-blue-400 hover:text-blue-300 p-1"
          >
            <EyeIcon className="w-3 h-3" />
          </button>
          <button
            onClick={() => router.push(`/admin/plugs/${plug._id}/edit`)}
            className="text-yellow-400 hover:text-yellow-300 p-1"
          >
            <PencilIcon className="w-3 h-3" />
          </button>
          <button
            onClick={() => togglePlugStatus(plug._id, plug.isActive)}
            className={`${plug.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'} p-1`}
          >
            {plug.isActive ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={() => deletePlug(plug._id, plug.name)}
            className="text-red-400 hover:text-red-300 p-1"
          >
            <TrashIcon className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {/* Partie gauche avec image et infos */}
        <div className="flex items-center space-x-4">
          {/* Image */}
          <div className="flex-shrink-0">
            <img
              src={plug.image || '/placeholder.jpg'}
              alt={plug.name}
              className="w-20 h-20 rounded-2xl object-cover"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTYiIGZpbGw9IiM0Qjc2ODgiLz4KPHN2ZyB4PSIyMCIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMSA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDMgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+'
              }}
            />
          </div>

          {/* Infos */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">🇫🇷</span>
              <h3 className="text-white text-lg font-bold uppercase tracking-wider">
                {plug.name}
              </h3>
              {!plug.isActive && (
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                  OFF
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Icônes services */}
              <span className="text-xl">📦</span>
              <span className="text-xl">📍</span>
              <span className="text-xl">🚲</span>
            </div>
          </div>
        </div>

        {/* Partie droite avec badge et likes */}
        <div className="flex flex-col items-end space-y-2">
          {/* Badge warning pour VIP */}
          {plug.isVip && (
            <div className="bg-yellow-500 text-black rounded-full p-1">
              <span className="text-sm font-bold">⚠️</span>
            </div>
          )}
          
          {/* Likes */}
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400 text-xl">👍</span>
            <span className="text-white font-bold text-lg">{getRandomLikes()}</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black">
      {/* Header mobile style */}
      <div className="bg-gray-800 px-4 py-6 relative">
        {/* Bouton admin caché */}
        <button
          onClick={() => router.push('/admin/plugs/new')}
          className="absolute top-4 left-4 bg-blue-600 text-white p-2 rounded-full opacity-20 hover:opacity-100 transition-opacity z-10"
        >
          <PlusIcon className="w-4 h-4" />
        </button>

        {/* Titre principal */}
        <div className="text-center">
          <h1 className="text-white text-4xl font-bold tracking-wider mb-3">
            PLUGS FINDER
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-white text-sm font-medium">JUSTE UNE</span>
            <span className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded">
              MINI-APP TELEGRAM
            </span>
            <span className="text-white text-sm font-medium">CHILL</span>
          </div>
        </div>
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
              className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Rechercher un plug..."
            />
          </div>
        </div>
      )}

      {/* Liste des plugs */}
      <div className="px-4 py-4 pb-24">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Chargement...</p>
          </div>
        ) : plugs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {activeTab === 'search' ? 'Aucun résultat trouvé' : 'Aucun plug disponible'}
            </p>
          </div>
        ) : (
          <>
            {plugs.map(renderPlugCard)}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-3">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-3 bg-gray-800 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  ←
                </button>
                <span className="px-6 py-3 text-gray-400 font-medium">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 bg-gray-800 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigation bottom - exactement comme sur le screenshot */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700">
        <div className="flex justify-around items-center py-3">
          {/* Plugs */}
          <button
            onClick={() => handleTabChange('plugs')}
            className={`flex flex-col items-center space-y-1 px-4 py-2 ${
              activeTab === 'plugs' ? 'text-white' : 'text-gray-400'
            }`}
          >
            <HomeIcon className="w-7 h-7" />
            <span className="text-xs font-medium">Plugs</span>
          </button>
          
          {/* Rechercher */}
          <button
            onClick={() => handleTabChange('search')}
            className={`flex flex-col items-center space-y-1 px-4 py-2 ${
              activeTab === 'search' ? 'text-white' : 'text-gray-400'
            }`}
          >
            <MagnifyingGlassIcon className="w-7 h-7" />
            <span className="text-xs font-medium">Rechercher</span>
          </button>
          
          {/* Giveaway */}
          <button
            onClick={() => handleTabChange('giveaway')}
            className={`flex flex-col items-center space-y-1 px-4 py-2 ${
              activeTab === 'giveaway' ? 'text-white' : 'text-gray-400'
            }`}
          >
            <GiftIcon className="w-7 h-7" />
            <span className="text-xs font-medium">Giveaway</span>
          </button>
        </div>
      </div>
    </div>
  )
}