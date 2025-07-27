import { useState, useEffect, useRef } from 'react'
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
  const [isSyncing, setIsSyncing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [newSocialMedia, setNewSocialMedia] = useState({
    name: '',
    emoji: '',
    url: '',
    enabled: true
  })
  const [isLocalMode, setIsLocalMode] = useState(false)
  const router = useRouter()
  const updateTimeoutRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
    fetchSocialMedias()
  }, [])

  // Cleanup du timeout au démontage
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])

  const fetchSocialMedias = async () => {
    try {
      setLoading(true)
      setIsLocalMode(false)
      
      // Vérifier si on est côté client
      if (typeof window === 'undefined') return
      
      // INITIALISATION FORCÉE: Vos 5 réseaux sociaux complets
      const yourCompleteSocialMedias = [
        { 
          id: 'telegram', 
          name: 'Telegram', 
          emoji: '📱', 
          url: 'https://t.me/+zcP68c4M_3NlM2Y0', 
          enabled: true 
        },
        { 
          id: 'find_your_plug', 
          name: 'Find Your Plug', 
          emoji: '🌐', 
          url: 'https://dym168.org/findyourplug', 
          enabled: true 
        },
        { 
          id: 'instagram', 
          name: 'Instagram', 
          emoji: '📸', 
          url: 'https://www.instagram.com/find.yourplug?igsh=ajRwcjE1eGhoaXMz&utm_source=qr', 
          enabled: true 
        },
        { 
          id: 'luffa', 
          name: 'Luffa', 
          emoji: '🧽', 
          url: 'https://callup.luffa.im/c/EnvtiTHkbvP', 
          enabled: true 
        },
        { 
          id: 'discord', 
          name: 'Discord', 
          emoji: '🎮', 
          url: 'https://discord.gg/g2dACUC3', 
          enabled: true 
        }
      ]
      
      // PRIORITÉ 1: Vérifier le localStorage (vos modifications)
      let savedSocialMedias = null
      try {
        const shopSocialBackup = localStorage.getItem('shopSocialMediaBackup')
        if (shopSocialBackup) {
          savedSocialMedias = JSON.parse(shopSocialBackup)
          console.log('💾 Réseaux sociaux trouvés dans localStorage:', savedSocialMedias)
          
          // Vérifier que toutes vos plateformes sont présentes
          const savedIds = savedSocialMedias.map(s => s.id)
          const yourIds = yourCompleteSocialMedias.map(s => s.id)
          const missingNetworks = yourCompleteSocialMedias.filter(network => !savedIds.includes(network.id))
          
          if (missingNetworks.length > 0) {
            console.log('🔧 Ajout des réseaux manquants:', missingNetworks.map(n => n.name))
            savedSocialMedias = [...savedSocialMedias, ...missingNetworks]
          }
        }
      } catch (e) {
        console.log('❌ Erreur lecture localStorage:', e)
      }
      
      // Si on a des réseaux sauvegardés complets, les utiliser
      if (savedSocialMedias && savedSocialMedias.length >= 5) {
        console.log('✅ Utilisation de VOS réseaux sociaux sauvegardés (complets)')
        setSocialMedias(savedSocialMedias)
        return
      }
      
      // SINON: Utiliser vos réseaux complets et les sauvegarder
      console.log('🔧 Initialisation complète avec VOS 5 réseaux sociaux')
      setSocialMedias(yourCompleteSocialMedias)
      
      // Sauvegarder immédiatement dans localStorage
      localStorage.setItem('shopSocialMediaBackup', JSON.stringify(yourCompleteSocialMedias))
      console.log('💾 Sauvegarde automatique dans localStorage terminée')
      
    } catch (error) {
      console.error('❌ Erreur chargement réseaux sociaux shop:', error)
      
      // En cas d'erreur: au minimum votre Telegram
      const fallbackSocialMedias = [
                       { id: 'telegram', name: 'Telegram', emoji: '📱', url: 'https://t.me/+zcP68c4M_3NlM2Y0', enabled: true, verified: true }
      ]
      setSocialMedias(fallbackSocialMedias)
      console.log('🆘 Fallback avec Telegram')
      
    } finally {
      setLoading(false)
    }
  }

  // Fonction de synchronisation automatique pour la boutique
  const syncShopToBoutique = async (shopSocialMediasToSync) => {
    try {
      setIsSyncing(true)
      const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'

      const configData = {
        shopSocialMediaList: shopSocialMediasToSync
      }

      console.log('🏪 Synchronisation réseaux sociaux boutique vers accueil:', configData)
      await simpleApi.updateConfig(token, configData)
      console.log('✅ Réseaux sociaux boutique synchronisés vers accueil Vercel')

      // Notification discrète
      toast.success('🏪 Synchronisé avec l\'accueil boutique', {
        duration: 2000,
        icon: '✅'
      })

      // Sauvegarder localement
      localStorage.setItem('shopSocialMediaBackup', JSON.stringify(shopSocialMediasToSync))

    } catch (error) {
      console.log('⚠️ Erreur synchronisation accueil boutique:', error.message)
      toast.error('⚠️ Erreur synchronisation accueil', { duration: 3000 })
    } finally {
      setIsSyncing(false)
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

  const addSocialMedia = async () => {
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
    
    const updatedSocialMedias = [...socialMedias, newSocial]
    setSocialMedias(updatedSocialMedias)
    setNewSocialMedia({
      name: '',
      emoji: '',
      url: '',
      enabled: true
    })
    
    toast.success('Réseau social ajouté')
    
    // Synchronisation automatique immédiate
    await syncShopToBoutique(updatedSocialMedias)
  }

  const updateSocialMedia = (id, field, value) => {
    const updatedSocialMedias = socialMedias.map(social => 
      social.id === id ? { ...social, [field]: value } : social
    )
    setSocialMedias(updatedSocialMedias)
    
    // Synchronisation automatique avec debounce
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    updateTimeoutRef.current = setTimeout(() => {
      syncShopToBoutique(updatedSocialMedias)
    }, 1500) // 1.5 secondes de debounce pour les modifications
  }

  const deleteSocialMedia = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce réseau social ?')) {
      const updatedSocialMedias = socialMedias.filter(social => social.id !== id)
      setSocialMedias(updatedSocialMedias)
      toast.success('Réseau social supprimé')
      
      // Synchronisation automatique immédiate
      await syncShopToBoutique(updatedSocialMedias)
    }
  }

  const toggleEnabled = (id) => {
    const updatedSocialMedias = socialMedias.map(social => 
      social.id === id ? { ...social, enabled: !social.enabled } : social
    )
    setSocialMedias(updatedSocialMedias)
    
    // Synchronisation automatique avec debounce
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    updateTimeoutRef.current = setTimeout(() => {
      syncShopToBoutique(updatedSocialMedias)
    }, 1000) // 1 seconde pour les toggles
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
              <div className="mt-3 bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      <strong>Synchronisation automatique :</strong> Les modifications se synchronisent automatiquement avec l'accueil de la boutique Vercel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-2">
              <button
                onClick={() => syncShopToBoutique(socialMedias)}
                disabled={isSyncing}
                className="inline-flex items-center px-3 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isSyncing ? '🔄 Synchronisation...' : '🏪 Sync Accueil'}
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