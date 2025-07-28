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
    
    // Charger immédiatement au démarrage avec un délai pour éviter les problèmes de mounting
    setTimeout(() => {
      loadInitialData()
    }, 100)
  }, [])

  // Sauvegarder automatiquement les modifications dans localStorage
  useEffect(() => {
    if (socialMedias.length > 0) {
      console.log('💾 Sauvegarde automatique des réseaux sociaux bot:', socialMedias.map(s => ({ id: s.id, name: s.name })))
      localStorage.setItem('botSocialMediaList', JSON.stringify(socialMedias))
    }
  }, [socialMedias])

  const loadInitialData = () => {
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }
    
    console.log('🔄 Début chargement réseaux sociaux bot...')
    setLoading(true)
    
    try {
      // Charger d'abord depuis localStorage (plus fiable)
      let socialMediasFromLocal = []
      try {
        const saved = localStorage.getItem('botSocialMediaList')
        if (saved) {
          socialMediasFromLocal = JSON.parse(saved)
          console.log('📱 Réseaux bot depuis localStorage:', socialMediasFromLocal)
        }
      } catch (e) {
        console.log('❌ Erreur lecture localStorage bot:', e)
      }

      if (socialMediasFromLocal && socialMediasFromLocal.length > 0) {
        // Utiliser les données localStorage en priorité
        const socialMediasWithIds = socialMediasFromLocal.map((item, index) => {
          if (!item.id) {
            const baseId = item.name ? item.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : `social_${index}`
            item.id = baseId
          }
          return item
        })
        setSocialMedias(socialMediasWithIds)
        console.log('✅ Réseaux sociaux bot chargés depuis localStorage:', socialMediasWithIds.map(s => ({ id: s.id, name: s.name })))
      } else {
        // Fallback : réseaux par défaut si rien en local
        const defaultSocialMedias = [
          { id: 'telegram', name: 'Telegram', emoji: '📱', url: 'https://t.me/+zcP68c4M_3NlM2Y0', enabled: true },
          { id: 'find_your_plug', name: 'Find Your Plug', emoji: '🌐', url: 'https://dym168.org/findyourplug', enabled: true },
          { id: 'instagram', name: 'Instagram', emoji: '📸', url: 'https://www.instagram.com/find.yourplug', enabled: true },
          { id: 'luffa', name: 'Luffa', emoji: '🧽', url: 'https://callup.luffa.im/c/EnvtiTHkbvP', enabled: true },
          { id: 'discord', name: 'Discord', emoji: '🎮', url: 'https://discord.gg/g2dACUC3', enabled: true },
          { id: 'contact', name: 'Contact', emoji: '📞', url: 'https://t.me/contact', enabled: true },
          { id: 'potato', name: 'Potato', emoji: '🏴‍☠️', url: 'https://dym168.org/findyourplug', enabled: true }
        ]
        setSocialMedias(defaultSocialMedias)
        // Sauvegarder immédiatement pour la prochaine fois
        localStorage.setItem('botSocialMediaList', JSON.stringify(defaultSocialMedias))
        console.log('🔧 Réseaux sociaux bot initialisés avec valeurs par défaut')
      }
    } catch (error) {
      console.error('❌ Erreur dans loadInitialData:', error)
    } finally {
      // S'assurer que loading est toujours mis à false
      console.log('✅ Fin chargement réseaux sociaux bot')
      setLoading(false)
    }
  }

  const loadSocialMedias = async () => {
    // Fonction remplacée par loadInitialData
    loadInitialData()
  }

  const saveSocialMedias = async () => {
    try {
      setSaving(true)
      
      // Sauvegarde LOCALE pour éviter les erreurs 429 (même système que réseaux shop)
      localStorage.setItem('botSocialMediaList', JSON.stringify(socialMedias))
      console.log('💾 Sauvegarde locale réseaux bot réussie:', socialMedias)
      
      // Essayer aussi de synchroniser avec le bot (sans bloquer si ça échoue)
      try {
        console.log('🤖 Tentative de synchronisation avec le bot...')
        const response = await fetch('/api/cors-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: 'updateConfig',
            data: { 
              configId: 'main',
              socialMediaList: socialMedias.filter(s => s.enabled !== false)
            }
          })
        })
        
        if (response.ok) {
          console.log('✅ Synchronisation bot réussie')
          toast.success('✅ Réseaux sociaux sauvegardés et synchronisés avec le bot !')
        } else {
          throw new Error('Erreur API')
        }
      } catch (syncError) {
        console.log('⚠️ Synchronisation bot échoué:', syncError.message)
        toast.success('✅ Réseaux sociaux sauvegardés localement ! (Sync bot: en attente)')
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
    console.log('📋 Liste complète après ajout:', updatedSocialMedias)
    setSocialMedias(updatedSocialMedias)
    setNewSocialMedia({ name: '', emoji: '', url: '', enabled: true })
    
    toast.success(`Réseau social "${newItem.name}" ajouté (cliquez "Sauvegarder" pour synchroniser)`)
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
      
      toast.success(`Réseau social "${itemToDelete.name}" supprimé (cliquez "Sauvegarder" pour synchroniser)`)
    }
  }

  const toggleEnabled = async (id) => {
    console.log('🔄 Toggle réseau social:', { id })
    const updatedSocialMedias = socialMedias.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    )
    
    setSocialMedias(updatedSocialMedias)
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
                    <div key={social.id} className={`border rounded-lg p-4 transition-all duration-200 ${
                      editingId === social.id 
                        ? 'border-blue-300 bg-blue-50 shadow-md' 
                        : social.enabled 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50'
                    }`}>
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
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                            title={editingId === social.id ? "Valider les modifications" : "Modifier ce réseau"}
                          >
                            {editingId === social.id ? '✅ Valider' : '✏️ Modifier'}
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