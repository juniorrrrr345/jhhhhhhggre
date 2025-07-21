import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function WelcomeSocialMedia() {
  const [socialMedia, setSocialMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    emoji: '',
    url: '',
    order: 0
  })
  const router = useRouter()

  // Charger les réseaux sociaux
  const loadSocialMedia = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/')
        return
      }

      // Essayer d'abord l'API directe
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
      
      try {
        const response = await fetch(`${apiBaseUrl}/api/config/welcome/social-media`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setSocialMedia(data)
          return
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (directError) {
        console.log('API directe échouée, tentative proxy...', directError.message)
        
        // Fallback vers le proxy
        const response = await fetch('/api/proxy?endpoint=/api/config/welcome/social-media', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setSocialMedia(data)
        } else {
          throw new Error('Erreur lors du chargement')
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des réseaux sociaux')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSocialMedia()
  }, [])

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({ name: '', emoji: '', url: '', order: 0 })
    setEditingItem(null)
    setShowForm(false)
  }

  // Ouvrir le formulaire d'édition
  const openEditForm = (item) => {
    setFormData({
      name: item.name,
      emoji: item.emoji,
      url: item.url,
      order: item.order
    })
    setEditingItem(item)
    setShowForm(true)
  }

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('adminToken')
      const method = editingItem ? 'PUT' : 'POST'
      const endpoint = editingItem 
        ? `/api/config/welcome/social-media/${editingItem._id}`
        : '/api/config/welcome/social-media'

      // Essayer d'abord l'API directe
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
      
      try {
        const response = await fetch(`${apiBaseUrl}${endpoint}`, {
          method: method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          toast.success(editingItem ? 'Réseau social modifié !' : 'Réseau social ajouté !')
          resetForm()
          loadSocialMedia()
          return
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (directError) {
        console.log('API directe échouée, tentative proxy...', directError.message)
        
        // Fallback vers le proxy
        const response = await fetch(`/api/proxy?endpoint=${endpoint}`, {
          method: 'POST', // Le proxy utilise toujours POST
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            _method: method, // Indiquer la vraie méthode
            ...formData
          })
        })

        if (response.ok) {
          toast.success(editingItem ? 'Réseau social modifié !' : 'Réseau social ajouté !')
          resetForm()
          loadSocialMedia()
        } else {
          const error = await response.json()
          throw new Error(error.error || 'Erreur lors de la sauvegarde')
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error.message)
    }
  }

  // Supprimer un réseau social
  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce réseau social ?')) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
      
      try {
        const response = await fetch(`${apiBaseUrl}/api/config/welcome/social-media/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          toast.success('Réseau social supprimé !')
          loadSocialMedia()
          return
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (directError) {
        console.log('API directe échouée, tentative proxy...', directError.message)
        
        // Fallback vers le proxy
        const response = await fetch(`/api/proxy?endpoint=/api/config/welcome/social-media/${id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ _method: 'DELETE' })
        })

        if (response.ok) {
          toast.success('Réseau social supprimé !')
          loadSocialMedia()
        } else {
          throw new Error('Erreur lors de la suppression')
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Réseaux Sociaux - Message d'Accueil</h1>
            <p className="text-gray-600 mt-1">Gérez les liens des réseaux sociaux affichés dans le message d'accueil du bot</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Ajouter</span>
          </button>
        </div>

        {/* Liste des réseaux sociaux */}
        <div className="bg-white rounded-lg shadow">
          {socialMedia.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Aucun réseau social configuré</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-blue-500 hover:text-blue-600"
              >
                Ajouter le premier réseau social
              </button>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Réseau Social
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lien
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ordre
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {socialMedia.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{item.emoji}</span>
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 truncate block max-w-xs"
                        >
                          {item.url}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditForm(item)}
                            className="text-blue-500 hover:text-blue-600 p-1"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Formulaire Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingItem ? 'Modifier' : 'Ajouter'} un réseau social
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du réseau social
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Ex: Instagram, Twitter..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) => setFormData({...formData, emoji: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="📸 💬 🐦 📘"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL du lien
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="https://instagram.com/votre_compte"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Plus le nombre est petit, plus l'élément apparaît en premier</p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                  >
                    {editingItem ? 'Modifier' : 'Ajouter'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Aperçu */}
        {socialMedia.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Aperçu dans le message d'accueil</h3>
            <div className="bg-white rounded p-4 border">
              <p className="mb-3 text-gray-700">Votre message d'accueil...</p>
              <div className="border-t pt-3">
                <p className="font-medium mb-2">📱 <strong>Suivez-nous :</strong></p>
                {socialMedia.map((item) => (
                  <p key={item._id} className="text-blue-500">
                    {item.emoji} {item.name}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}