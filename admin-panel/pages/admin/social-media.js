import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { simpleApi } from '../../lib/api-simple'
import { getLocalApi } from '../../lib/local-storage-api'
import { getRobustSync } from '../../lib/robust-sync'
import toast from 'react-hot-toast'

export default function SocialMediaManager() {
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
  const [isSyncing, setIsSyncing] = useState(false)
  const updateTimeoutRef = useRef(null)
  const router = useRouter()



  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
    fetchSocialMedias()
    
    // Nettoyage du timeout lors du démontage
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
      
      // Essayer d'abord le serveur
      const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
      const config = await simpleApi.getConfig(token)
      
      if (config && config.socialMediaList) {
                     // S'assurer que tous les réseaux sociaux ont un ID unique
             const socialMediasWithIds = config.socialMediaList.map((item, index) => {
               if (!item.id) {
                 // Générer un ID basé sur le nom ou l'index
                 const baseId = item.name ? item.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : `social_${index}`
                 item.id = baseId
               }
               return item
             })
        setSocialMedias(socialMediasWithIds)
        console.log('✅ Réseaux sociaux chargés depuis le serveur avec IDs:', socialMediasWithIds.map(s => ({ id: s.id, name: s.name })))
      } else {
        throw new Error('Configuration serveur vide')
      }
      
    } catch (error) {
      console.error('Erreur chargement réseaux sociaux:', error)
      
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
           if (localConfig && localConfig.socialMediaList) {
             // S'assurer que tous les réseaux sociaux ont un ID unique
             const socialMediasWithIds = localConfig.socialMediaList.map((item, index) => {
               if (!item.id) {
                 // Générer un ID basé sur le nom ou l'index
                 const baseId = item.name ? item.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : `social_${index}`
                 item.id = baseId
               }
               return item
             })
             setSocialMedias(socialMediasWithIds)
             console.log('📁 Réseaux sociaux chargés depuis le stockage local avec IDs:', socialMediasWithIds.map(s => ({ id: s.id, name: s.name })))
           } else {
             // Initialiser avec des données par défaut pour le bot Telegram
             const defaultSocialMedias = [
               { id: 'telegram', name: 'Telegram', emoji: '📱', url: '', enabled: true },
               { id: 'whatsapp', name: 'WhatsApp', emoji: '💬', url: '', enabled: false },
               { id: 'discord', name: 'Discord', emoji: '🎮', url: '', enabled: false },
               { id: 'instagram', name: 'Instagram', emoji: '📸', url: '', enabled: false }
             ]
             setSocialMedias(defaultSocialMedias)
             await localApi.updateSocialMedia(defaultSocialMedias)
             console.log('🔧 Réseaux sociaux initialisés en mode local')
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
          await localApi.updateSocialMedia(socialMedias)
          console.log('💾 Réseaux sociaux sauvegardés localement')
        }
      } else {
        // Mode serveur : essayer de sauvegarder sur le serveur
        try {
          const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
          
          const configData = {
            socialMediaList: socialMedias,
            // Maintenir compatibilité avec l'ancien format pour le bot Telegram
            socialMedia: {
              telegram: socialMedias.find(s => s.id === 'telegram')?.url || '',
              whatsapp: socialMedias.find(s => s.id === 'whatsapp')?.url || ''
            }
          }
          
                    await simpleApi.updateConfig(token, configData)
          
          // Synchroniser avec le bot
          const robustSync = getRobustSync()
          if (robustSync) {
            robustSync.syncConfigUpdate(configData)
          }
          
          console.log('✅ Réseaux sociaux sauvegardés et synchronisés')
        } catch (serverError) {
            console.log('Erreur sauvegarde serveur:', serverError.message)
            
            // Ne basculer en mode local que pour des erreurs critiques de réseau
            if (serverError.message.includes('Failed to fetch') || 
                serverError.message.includes('NetworkError') || 
                serverError.message.includes('offline') ||
                serverError.message.includes('502') ||
                serverError.message.includes('503') ||
                serverError.message.includes('504')) {
              console.log('Basculement en mode local à cause de:', serverError.message)
              setIsLocalMode(true)
            } else {
              console.log('Erreur sauvegarde non critique, pas de mode local:', serverError.message)
            }
            const localApi = getLocalApi()
            if (localApi) {
              await localApi.updateSocialMedia(socialMedias)
            }
          }
      }
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const addSocialMedia = () => {
    if (!newSocialMedia.name.trim()) {
      toast.error('Nom du réseau est requis')
      return
    }
    
    // Générer un ID unique basé sur le nom + timestamp pour éviter les doublons
    let baseId = newSocialMedia.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
    let id = baseId
    let counter = 1
    
    // Vérifier que l'ID n'existe pas déjà
    while (socialMedias.some(item => item.id === id)) {
      id = `${baseId}_${counter}`
      counter++
    }
    
    console.log('➕ Ajout nouveau réseau social avec ID:', id)
    
    const newItem = {
      ...newSocialMedia,
      id,
      name: newSocialMedia.name.trim(),
      emoji: newSocialMedia.emoji.trim() || '🔗', // Emoji saisi ou par défaut
      url: newSocialMedia.url.trim()
    }
    
    const updatedSocialMedias = [...socialMedias, newItem]
    setSocialMedias(updatedSocialMedias)
    setNewSocialMedia({ name: '', emoji: '', url: '', enabled: true })
    
    // Synchronisation automatique après ajout
    syncToBotAPI(updatedSocialMedias)
    
    toast.success(`Réseau social "${newItem.name}" ajouté et synchronisé`)
  }

  const updateSocialMedia = (id, field, value) => {
    console.log('🔄 Mise à jour réseau social:', { id, field, value })
    if (!id) {
      console.error('❌ ID manquant pour la mise à jour')
      toast.error('Erreur: ID manquant pour la mise à jour')
      return
    }
    
    setSocialMedias(prevSocialMedias => {
      const updated = prevSocialMedias.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
      console.log('📝 Réseaux sociaux après mise à jour:', updated.map(s => ({ id: s.id, name: s.name, [field]: s[field] })))
      
      // Synchronisation automatique après modification (avec debounce)
      clearTimeout(updateTimeoutRef.current)
      updateTimeoutRef.current = setTimeout(() => {
        syncToBotAPI(updated)
      }, 1500) // Attendre 1.5 seconde après la dernière modification
      
      return updated
    })
  }

  const deleteSocialMedia = async (id) => {
    if (!id) {
      console.error('❌ ID manquant pour la suppression')
      toast.error('Erreur: ID manquant')
      return
    }

    const itemToDelete = socialMedias.find(item => item.id === id)
    if (!itemToDelete) {
      console.error('❌ Réseau social non trouvé:', id)
      toast.error('Réseau social non trouvé')
      return
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer "${itemToDelete.name}" ?`)) {
      console.log('🗑️ Suppression demandée pour:', { id, name: itemToDelete.name })
      console.log('📝 socialMedias avant suppression:', socialMedias.map(s => ({ id: s.id, name: s.name })))
      
      // Supprimer UNIQUEMENT l'élément avec cet ID
      const updatedSocialMedias = socialMedias.filter(item => {
        const keep = item.id !== id
        if (!keep) {
          console.log('❌ Suppression de:', { id: item.id, name: item.name })
        }
        return keep
      })
      
      const previousSocialMedias = [...socialMedias] // Backup pour restaurer en cas d'erreur
      
      console.log('📝 socialMedias après filtrage:', updatedSocialMedias.map(s => ({ id: s.id, name: s.name })))
      console.log('📊 Longueur avant/après:', socialMedias.length, '→', updatedSocialMedias.length)
      
      if (updatedSocialMedias.length === socialMedias.length) {
        console.error('❌ ERREUR: Aucun élément supprimé!')
        toast.error('Erreur: Aucun élément supprimé')
        return
      }
      
      // Mettre à jour l'état d'abord
      setSocialMedias(updatedSocialMedias)
      
      // Sauvegarder automatiquement selon le mode
      try {
        setSaving(true)
        
                 if (isLocalMode) {
           // Mode local : sauvegarde directe
           const localApi = getLocalApi()
           if (localApi) {
             await localApi.updateSocialMedia(updatedSocialMedias)
             console.log('💾 Réseau social supprimé et sauvegardé localement')
           }
        } else {
          // Mode serveur : essayer de sauvegarder sur le serveur
          try {
            const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
            
                         const configData = {
               socialMediaList: updatedSocialMedias
             }
             
             console.log('📤 Envoi au serveur - configData:', configData)
             await simpleApi.updateConfig(token, configData)
            console.log('✅ Réseau social supprimé et sauvegardé sur le serveur')
                       } catch (serverError) {
               console.log('Erreur suppression serveur:', serverError.message)
               
               // Ne basculer en mode local que pour des erreurs critiques de réseau
               if (serverError.message.includes('Failed to fetch') || 
                   serverError.message.includes('NetworkError') || 
                   serverError.message.includes('offline') ||
                   serverError.message.includes('502') ||
                   serverError.message.includes('503') ||
                   serverError.message.includes('504')) {
                 console.log('Basculement en mode local à cause de:', serverError.message)
                 setIsLocalMode(true)
               } else {
                 console.log('Erreur suppression non critique, pas de mode local:', serverError.message)
               }
               const localApi = getLocalApi()
               if (localApi) {
                 await localApi.updateSocialMedia(updatedSocialMedias)
               }
             }
        }
      } catch (error) {
        console.error('Erreur suppression:', error)
        // Restaurer l'état en cas d'erreur
        setSocialMedias(previousSocialMedias)
        toast.error('Erreur lors de la suppression')
      } finally {
        setSaving(false)
      }
    }
  }

  const toggleEnabled = async (id) => {
    console.log('🔄 Toggle réseau social:', { id })
    const updatedSocialMedias = socialMedias.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    )
    
    setSocialMedias(updatedSocialMedias)
    
    // Synchronisation automatique avec la boutique
    await syncToBotAPI(updatedSocialMedias)
  }

  // Fonction utilitaire pour synchroniser avec l'API du bot
  const syncToBotAPI = async (socialMediasToSync) => {
    try {
      setIsSyncing(true)
      const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
      
      const configData = {
        socialMediaList: socialMediasToSync,
        socialMedia: {
          telegram: socialMediasToSync.find(s => s.id === 'telegram')?.url || '',
          whatsapp: socialMediasToSync.find(s => s.id === 'whatsapp')?.url || ''
        }
      }
      
      await simpleApi.updateConfig(token, configData)
      console.log('🔄 Synchronisation automatique réussie')
      console.log('📤 Données envoyées:', JSON.stringify(configData, null, 2))
      
      // Notification discrète pour confirmer la sync
      toast.success('🔄 Synchronisé sur le bot', { 
        duration: 2000,
        icon: '✅'
      })
      
    } catch (error) {
      console.log('⚠️ Erreur synchronisation automatique:', error.message)
      toast.error('⚠️ Erreur de synchronisation', { duration: 3000 })
    } finally {
      setIsSyncing(false)
    }
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Réseaux Sociaux - Admin Panel</title>
        </Head>
        <Layout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <img 
              src="https://i.imgur.com/VwBPgtw.jpeg" 
              alt="Loading..." 
              className="h-12 w-12 mx-auto mb-4 animate-pulse"
              style={{ borderRadius: '50%' }}
            />
                              <p className="text-black">Chargement des réseaux sociaux...</p>
            </div>
          </div>
        </Layout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Gestion Réseaux Sociaux - Admin Panel</title>
      </Head>
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold leading-6 text-gray-900">Gestion des Réseaux Sociaux</h1>
              <p className="mt-2 text-sm text-gray-700">
                Gérez les réseaux sociaux affichés dans le bot Telegram et la boutique
              </p>

            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-2">
              {isLocalMode && (
                <button
                  onClick={async () => {
                    try {
                      setSaving(true)
                      const localApi = getLocalApi()
                      if (localApi) {
                        const synced = await localApi.syncWithServer(simpleApi)
                        if (synced) {
                          setIsLocalMode(false)
                          toast.success('✅ Synchronisé avec le serveur')
                        } else {
                          toast.error('Serveur encore indisponible')
                        }
                      }
                    } catch (error) {
                      toast.error('Erreur de synchronisation')
                    } finally {
                      setSaving(false)
                    }
                  }}
                  disabled={saving}
                  className="inline-flex items-center px-3 py-2 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  🔄 Synchroniser
                </button>
              )}

              <button
                onClick={saveSocialMedias}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50"
              >
                {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Liste des réseaux sociaux existants */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    📱 Réseaux Sociaux Actuels
                  </h3>
                  <div className="flex items-center space-x-2">
                    {isSyncing && (
                      <div className="flex items-center text-blue-600 text-sm bg-blue-100 px-2 py-1 rounded-md">
                        <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Synchronisation...
                      </div>
                    )}
                    {isLocalMode && (
                      <div className="flex items-center text-orange-600 text-sm bg-orange-100 px-2 py-1 rounded-md">
                        <span className="mr-1">📁</span>
                        Mode Local
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {socialMedias.map((social, index) => (
                    <div key={social.id} className={`border rounded-lg p-4 ${social.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{social.emoji || '🔗'}</span>
                          <div className="flex-1">
                            {editingId === social.id ? (
                              <input
                                type="text"
                                value={social.name}
                                onChange={(e) => updateSocialMedia(social.id, 'name', e.target.value)}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            ) : (
                              <h4 className="font-medium text-gray-900">{social.name}</h4>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleEnabled(social.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              social.enabled 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {social.enabled ? 'Activé' : 'Désactivé'}
                          </button>
                          
                          <button
                            onClick={() => setEditingId(editingId === social.id ? null : social.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            {editingId === social.id ? '✅' : '✏️'}
                          </button>
                          
                          <button
                            onClick={() => deleteSocialMedia(social.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Emoji</label>
                          {editingId === social.id ? (
                            <input
                              type="text"
                              value={social.emoji || ''}
                              onChange={(e) => updateSocialMedia(social.id, 'emoji', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="📱"
                              maxLength="4"
                            />
                          ) : (
                            <p className="text-sm text-gray-600">{social.emoji || '🔗'}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700">URL/Lien</label>
                          {editingId === social.id ? (
                            <input
                              type="url"
                              value={social.url}
                              onChange={(e) => updateSocialMedia(social.id, 'url', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="https://t.me/your_channel"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 truncate">{social.url || 'Aucun lien'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ajouter un nouveau réseau social */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  ➕ Ajouter un Réseau Social
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom du réseau</label>
                    <input
                      type="text"
                      value={newSocialMedia.name}
                      onChange={(e) => setNewSocialMedia({...newSocialMedia, name: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Instagram"
                    />
                  </div>
                  

                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emoji</label>
                    <input
                      type="text"
                      value={newSocialMedia.emoji}
                      onChange={(e) => setNewSocialMedia({...newSocialMedia, emoji: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="📱"
                      maxLength="4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL/Lien</label>
                    <input
                      type="url"
                      value={newSocialMedia.url}
                      onChange={(e) => setNewSocialMedia({...newSocialMedia, url: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://instagram.com/your_account"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newSocialMedia.enabled}
                      onChange={(e) => setNewSocialMedia({...newSocialMedia, enabled: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Activé par défaut
                    </label>
                  </div>
                  
                  <button
                    onClick={addSocialMedia}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    ➕ Ajouter
                  </button>
                </div>
                
                {/* Exemples populaires */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">🌟 Réseaux populaires</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Instagram', emoji: '📸' },
                      { name: 'TikTok', emoji: '🎵' },
                      { name: 'YouTube', emoji: '📺' },
                      { name: 'Twitter', emoji: '🐦' },
                      { name: 'Facebook', emoji: '📘' },
                      { name: 'LinkedIn', emoji: '💼' }
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => setNewSocialMedia({
                          ...newSocialMedia,
                          name: preset.name,
                          emoji: preset.emoji
                        })}
                        className="text-left px-3 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {preset.emoji} {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}