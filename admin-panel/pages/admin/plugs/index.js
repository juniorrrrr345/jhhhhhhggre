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
  }, [search, activeTab, currentPage])

  const fetchPlugs = async (token) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        search: activeTab === 'search' ? search : '',
        filter: activeTab === 'vip' ? 'vip' : 'all'
      })

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
      console.log('📋 Fetching plugs for tab:', activeTab, 'with params:', params.toString())

      const response = await fetch(`${apiBaseUrl}/api/plugs?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      console.log('📋 Plugs response:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Plugs loaded:', data.plugs?.length || 0, 'for tab:', activeTab)
        setPlugs(data.plugs || [])
        setTotalPages(Math.ceil((data.pagination?.total || data.total || 0) / 20))
      } else {
        console.error('❌ Plugs error:', response.status)
        toast.error('Erreur lors du chargement')
        setPlugs([])
        setTotalPages(1)
      }
    } catch (error) {
      console.error('💥 Plugs error:', error)
      toast.error('Erreur de connexion')
      setPlugs([])
      setTotalPages(1)
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

  const getRandomLikes = () => {
    return Math.floor(Math.random() * 1000) + 100
  }

  const handleTabChange = (tab) => {
    console.log('🔄 Changing tab to:', tab)
    setActiveTab(tab)
    setCurrentPage(1)
    
    // Reset search when changing tabs (except for search tab)
    if (tab !== 'search') {
      setSearch('')
    }
  }

  const handleSearchChange = (value) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const getPlaceholderImage = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTYiIGZpbGw9IiM0Qjc2ODgiLz4KPHN2ZyB4PSIyMCIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMSA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDMgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+'
  }

  // Style exact du screenshot
  const renderPlugCard = (plug) => (
    <div key={plug._id} className="bg-gray-800 rounded-2xl mx-4 mb-3 relative overflow-hidden">
      {/* Actions admin cachées - coin supérieur droit */}
      <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity z-10">
        <div className="flex space-x-1 bg-black bg-opacity-50 rounded-lg p-1">
          <button
            onClick={() => router.push(`/admin/plugs/${plug._id}`)}
            className="text-blue-400 hover:text-blue-300 p-1"
            title="Voir détails"
          >
            <EyeIcon className="w-3 h-3" />
          </button>
          <button
            onClick={() => router.push(`/admin/plugs/${plug._id}/edit`)}
            className="text-yellow-400 hover:text-yellow-300 p-1"
            title="Modifier"
          >
            <PencilIcon className="w-3 h-3" />
          </button>
          <button
            onClick={() => togglePlugStatus(plug._id, plug.isActive)}
            className={`${plug.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'} p-1`}
            title={plug.isActive ? 'Désactiver' : 'Activer'}
          >
            {plug.isActive ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={() => deletePlug(plug._id, plug.name)}
            className="text-red-400 hover:text-red-300 p-1"
            title="Supprimer"
          >
            <TrashIcon className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Contenu principal de la carte */}
      <div className="flex items-center p-4">
        {/* Image à gauche */}
        <div className="flex-shrink-0 mr-4">
          <img
            src={plug.image || getPlaceholderImage()}
            alt={plug.name}
            className="w-16 h-16 rounded-2xl object-cover"
            onError={(e) => {
              e.target.src = getPlaceholderImage()
            }}
          />
        </div>

        {/* Section centrale avec flag, nom et icônes */}
        <div className="flex-1">
          {/* Première ligne: Flag + Nom */}
          <div className="flex items-center mb-2">
            <span className="text-xl mr-2">🇫🇷</span>
            <h3 className="text-white text-base font-bold uppercase tracking-wider flex-1">
              {plug.name}
            </h3>
            {/* Badge VIP à droite du nom */}
            {plug.isVip && (
              <div className="bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center ml-2">
                <span className="text-xs font-bold">⚠️</span>
              </div>
            )}
          </div>

          {/* Deuxième ligne: Icônes services */}
          <div className="flex items-center space-x-3">
            <span className="text-lg">📦</span>
            <span className="text-lg">📍</span>
            <span className="text-lg">🚲</span>
          </div>
        </div>

        {/* Section droite avec likes */}
        <div className="flex flex-col items-center ml-4">
          <div className="flex items-center">
            <span className="text-yellow-400 text-lg mr-1">👍</span>
            <span className="text-white font-bold text-lg">{getRandomLikes()}</span>
          </div>
        </div>
      </div>

      {/* Badge "OFF" pour les boutiques inactives */}
      {!plug.isActive && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
          OFF
        </div>
      )}
    </div>
  )

  const getPageTitle = () => {
    switch (activeTab) {
      case 'search':
        return search ? `Résultats pour "${search}"` : 'Rechercher un plug'
      case 'vip':
        return 'Boutiques VIP'
      default:
        return 'Toutes les boutiques'
    }
  }

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'search':
        return search ? 'Aucun résultat trouvé pour votre recherche' : 'Tapez quelque chose pour rechercher'
      case 'vip':
        return 'Aucune boutique VIP disponible'
      default:
        return 'Aucune boutique disponible'
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header identique au screenshot */}
      <div className="bg-gray-800 px-4 py-6 relative">
        {/* Bouton admin caché */}
        <button
          onClick={() => router.push('/admin/plugs/new')}
          className="absolute top-4 left-4 bg-blue-600 text-white p-2 rounded-full opacity-20 hover:opacity-100 transition-opacity z-10"
          title="Ajouter une nouvelle boutique"
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
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Rechercher un plug..."
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Liste des plugs avec le style exact du screenshot */}
      <div className="py-4 pb-24">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Chargement des boutiques...</p>
          </div>
        ) : plugs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {activeTab === 'vip' ? '⭐' : activeTab === 'search' ? '🔍' : '🏪'}
            </div>
            <p className="text-gray-400 text-lg mb-2">{getEmptyMessage()}</p>
            {activeTab === 'search' && !search && (
              <p className="text-gray-500 text-sm">Utilisez la barre de recherche ci-dessus</p>
            )}
          </div>
        ) : (
          <>
            {plugs.map(renderPlugCard)}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-3 px-4">
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

      {/* Navigation bottom exactement comme sur le screenshot */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700">
        <div className="flex justify-around items-center py-3">
          {/* Plugs - Page d'accueil */}
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
          
          {/* VIP */}
          <button
            onClick={() => handleTabChange('vip')}
            className={`flex flex-col items-center space-y-1 px-4 py-2 ${
              activeTab === 'vip' ? 'text-white' : 'text-gray-400'
            }`}
          >
            <StarIcon className="w-7 h-7" />
            <span className="text-xs font-medium">VIP</span>
          </button>
        </div>
      </div>
    </div>
  )
}