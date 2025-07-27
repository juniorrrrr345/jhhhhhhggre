import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { simpleApi } from '../../lib/api-simple'
import { getLocalApi } from '../../lib/local-storage-api'
import toast from 'react-hot-toast'

export default function ShopSocialMediaManager() {
  const [socialMedias, setSocialMedias] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [newSocialMedia, setNewSocialMedia] = useState({
    name: '',
    emoji: '',
    url: '',
    enabled: true
  })
  const [isLocalMode, setIsLocalMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
    fetchSocialMedias()
  }, [])

  const fetchSocialMedias = async () => {
    try {
      setLoading(true)
      setIsLocalMode(false)
      
      // Vérifier si on est côté client
      if (typeof window === 'undefined') return
      
      // Essayer d'abord le serveur
      const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
      const config = await simpleApi.getConfig(token)
      
      if (config && config.shopSocialMediaList) {
        // S'assurer que tous les réseaux sociaux ont un ID unique
        const socialMediasWithIds = config.shopSocialMediaList.map((item, index) => {
          if (!item.id) {
            // Générer un ID basé sur le nom ou l'index
            const baseId = item.name ? item.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : `social_${index}`
            item.id = baseId
          }
          return item
        })
        setSocialMedias(socialMediasWithIds)
        console.log('✅ Réseaux sociaux shop chargés depuis le serveur avec IDs:', socialMediasWithIds.map(s => ({ id: s.id, name: s.name })))
      } else {
        throw new Error('Configuration serveur vide')
      }
      
    } catch (error) {
      console.error('Erreur chargement réseaux sociaux shop:', error)
      
      // Ne basculer en mode local que pour des erreurs critiques
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') || 
          error.message.includes('offline') ||
          error.message.includes('502') ||
          error.message.includes('503') ||
          error.message.includes('504')) {
        console.log('Basculement en mode local à cause de:', error.message)
        setIsLocalMode(true)
      } else {
        // Pour les autres erreurs, ne pas activer le mode local
        console.log('Erreur non critique, pas de mode local:', error.message)
        setIsLocalMode(false)
      }
      
      try {
        const localApi = getLocalApi()
        if (localApi) {
          const localConfig = await localApi.getConfig()
          if (localConfig && localConfig.shopSocialMediaList) {
            // S'assurer que tous les réseaux sociaux ont un ID unique
            const socialMediasWithIds = localConfig.shopSocialMediaList.map((item, index) => {
              if (!item.id) {
                // Générer un ID basé sur le nom ou l'index
                const baseId = item.name ? item.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : `social_${index}`
                item.id = baseId
              }
              return item
            })
            setSocialMedias(socialMediasWithIds)
            console.log('📁 Réseaux sociaux shop chargés depuis le stockage local avec IDs:', socialMediasWithIds.map(s => ({ id: s.id, name: s.name })))
          } else {
            // Initialiser avec des données par défaut pour la boutique
            const defaultSocialMedias = [
              { id: 'telegram', name: 'Telegram', emoji: '📱', url: 'https://t.me/FindYourPlugBot', enabled: true },
              { id: 'potato', name: 'Potato', emoji: '🥔', url: '#', enabled: true },
              { id: 'instagram', name: 'Instagram', emoji: '📸', url: '#', enabled: true },
              { id: 'luffa', name: 'Luffa', emoji: '🧽', url: '#', enabled: true },
              { id: 'discord', name: 'Discord', emoji: '🎮', url: '#', enabled: true }
            ]
            setSocialMedias(defaultSocialMedias)
            await localApi.updateShopSocialMedia(defaultSocialMedias)
            console.log('🔧 Réseaux sociaux shop initialisés en mode local')
          }
        }
      } catch (localError) {
        console.error('Erreur mode local:', localError)
        toast.error('Erreur de stockage local')
      }
    } finally {
      setLoading(false)
    }
  }

  const saveSocialMedias = async () => {
    try {
      setSaving(true)
      
      if (isLocalMode) {
        // Mode local : sauvegarde directe
        const localApi = getLocalApi()
        if (localApi) {
          await localApi.updateShopSocialMedia(socialMedias)
          console.log('💾 Réseaux sociaux shop sauvegardés localement')
        }
      } else {
        // Mode serveur : essayer de sauvegarder sur le serveur
        try {
          const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
          
          const configData = {
            shopSocialMediaList: socialMedias
          }
          
          await simpleApi.updateConfig(token, configData)
          
          console.log('✅ Réseaux sociaux shop sauvegardés')
        } catch (serverError) {
          console.log('Serveur indisponible, sauvegarde locale de secours')
          // Fallback en mode local
          setIsLocalMode(true)
          const localApi = getLocalApi()
          if (localApi) {
            await localApi.updateShopSocialMedia(socialMedias)
          }
        }
      }
      
      toast.success('Réseaux sociaux shop sauvegardés avec succès')
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const addSocialMedia = () => {
    if (!newSocialMedia.name.trim() || !newSocialMedia.emoji.trim()) {
      toast.error('Nom et emoji sont requis')
      return
    }
    
    // Générer un ID unique basé sur le nom + timestamp pour éviter les doublons
    let baseId = newSocialMedia.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
    let id = baseId
    let counter = 1
    
    // Vérifier que l'ID n'existe pas déjà
    while (socialMedias.find(s => s.id === id)) {
      id = `${baseId}_${counter}`
      counter++
    }
    
    const newSocial = {
      id,
      name: newSocialMedia.name.trim(),
      emoji: newSocialMedia.emoji.trim(),
      url: newSocialMedia.url.trim(),
      enabled: newSocialMedia.enabled
    }
    
    setSocialMedias([...socialMedias, newSocial])
    setNewSocialMedia({
      name: '',
      emoji: '',
      url: '',
      enabled: true
    })
    
    toast.success('Réseau social ajouté')
  }

  const updateSocialMedia = (id, field, value) => {
    setSocialMedias(socialMedias.map(social => 
      social.id === id ? { ...social, [field]: value } : social
    ))
  }

  const deleteSocialMedia = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce réseau social ?')) {
      setSocialMedias(socialMedias.filter(social => social.id !== id))
      toast.success('Réseau social supprimé')
    }
  }

  const toggleEnabled = (id) => {
    setSocialMedias(socialMedias.map(social => 
      social.id === id ? { ...social, enabled: !social.enabled } : social
    ))
  }

  if (loading) {
    return (
      <Layout title="Réseaux Shop">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <img 
              src="https://i.imgur.com/VwBPgtw.jpeg" 
              alt="Loading..." 
              className="h-12 w-12 mx-auto animate-pulse"
              style={{ borderRadius: '50%' }}
            />
            <p className="text-black mt-4">Chargement des réseaux sociaux shop...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <>
      <Head>
        <title>Réseaux Shop - Admin Panel</title>
      </Head>
      
      <Layout title="Réseaux Shop">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold text-gray-900">Réseaux Sociaux de la Boutique</h1>
              <p className="mt-2 text-sm text-gray-700">
                Gérez les réseaux sociaux qui apparaissent sur la page de recherche de la boutique.
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <button
                onClick={saveSocialMedias}
                disabled={saving}
                className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>

          {/* Mode local indicator */}
          {isLocalMode && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Mode local</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Les modifications sont sauvegardées localement car le serveur est indisponible.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Liste des réseaux sociaux */}
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Réseau
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          URL
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {socialMedias.map((social) => (
                        <tr key={social.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{social.emoji}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{social.name}</div>
                                <div className="text-sm text-gray-500">ID: {social.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="url"
                              value={social.url}
                              onChange={(e) => updateSocialMedia(social.id, 'url', e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              placeholder="https://..."
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleEnabled(social.id)}
                              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                social.enabled
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {social.enabled ? 'Actif' : 'Inactif'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => deleteSocialMedia(social.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire d'ajout */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ajouter un réseau social</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  value={newSocialMedia.name}
                  onChange={(e) => setNewSocialMedia({...newSocialMedia, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Telegram"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Emoji</label>
                <input
                  type="text"
                  value={newSocialMedia.emoji}
                  onChange={(e) => setNewSocialMedia({...newSocialMedia, emoji: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="📱"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">URL</label>
                <input
                  type="url"
                  value={newSocialMedia.url}
                  onChange={(e) => setNewSocialMedia({...newSocialMedia, url: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addSocialMedia}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}