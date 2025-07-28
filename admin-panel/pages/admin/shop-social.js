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
  const [editingId, setEditingId] = useState(null)
  const [newSocialMedia, setNewSocialMedia] = useState({
    name: '',
    emoji: '',
    url: '',
    logo: '',
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
    
    // Cleanup du timeout au démontage
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
      
      if (typeof window === 'undefined') return
      
      const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
      const config = await simpleApi.getConfig(token)
      
      console.log('🔍 Config reçue:', config)
      console.log('🔍 shopSocialMediaList:', config?.shopSocialMediaList)
      
      if (config && config.shopSocialMediaList && config.shopSocialMediaList.length > 0) {
        setSocialMedias(config.shopSocialMediaList)
        console.log('✅ Réseaux sociaux shop chargés depuis le serveur:', config.shopSocialMediaList)
      } else {
        // Initialiser avec VOS réseaux de boutique avec logos
        const defaultShopSocialMedias = [
          { 
            id: 'telegram', 
            name: 'Telegram', 
            emoji: '📱', 
            url: 'https://t.me/+zcP68c4M_3NlM2Y0', 
            enabled: true,
            logo: 'https://i.imgur.com/telegram.png'
          },
          { 
            id: 'find_your_plug', 
            name: 'Find Your Plug', 
            emoji: '🌐', 
            url: 'https://dym168.org/findyourplug', 
            enabled: true,
            logo: 'https://i.imgur.com/VwBPgtw.jpeg'
          },
          { 
            id: 'instagram', 
            name: 'Instagram', 
            emoji: '📸', 
            url: 'https://www.instagram.com/find.yourplug?igsh=ajRwcjE1eGhoaXMz&utm_source=qr', 
            enabled: true,
            logo: 'https://i.imgur.com/instagram.png'
          },
          { 
            id: 'luffa', 
            name: 'Luffa', 
            emoji: '🧽', 
            url: 'https://callup.luffa.im/c/EnvtiTHkbvP', 
            enabled: true,
            logo: 'https://i.imgur.com/zkZtY0m.png'
          },
          { 
            id: 'discord', 
            name: 'Discord', 
            emoji: '🎮', 
            url: 'https://discord.gg/g2dACUC3', 
            enabled: true,
            logo: 'https://i.imgur.com/discord.png'
          },
          { 
            id: 'potato', 
            name: 'Potato', 
            emoji: '🥔', 
            url: 'https://potato.com', 
            enabled: true,
            logo: 'https://i.imgur.com/1iCRHRB.jpeg'
          }
        ]
        setSocialMedias(defaultShopSocialMedias)
        console.log('🔧 Réseaux sociaux shop initialisés avec valeurs par défaut')
      }
      
    } catch (error) {
      console.error('Erreur chargement réseaux sociaux shop:', error)
      setIsLocalMode(true)
      
      try {
        const localApi = getLocalApi()
        if (localApi) {
          const localConfig = await localApi.getConfig()
          if (localConfig && localConfig.shopSocialMediaList) {
            setSocialMedias(localConfig.shopSocialMediaList)
            console.log('📁 Réseaux sociaux shop chargés depuis le stockage local')
          } else {
            const defaultShopSocialMedias = [
              { 
                id: 'telegram', 
                name: 'Telegram', 
                emoji: '📱', 
                url: 'https://t.me/+zcP68c4M_3NlM2Y0', 
                enabled: true,
                logo: 'https://i.imgur.com/telegram.png'
              },
              { 
                id: 'find_your_plug', 
                name: 'Find Your Plug', 
                emoji: '🌐', 
                url: 'https://dym168.org/findyourplug', 
                enabled: true,
                logo: 'https://i.imgur.com/VwBPgtw.jpeg'
              },
              { 
                id: 'instagram', 
                name: 'Instagram', 
                emoji: '📸', 
                url: 'https://www.instagram.com/find.yourplug?igsh=ajRwcjE1eGhoaXMz&utm_source=qr', 
                enabled: true,
                logo: 'https://i.imgur.com/instagram.png'
              },
              { 
                id: 'luffa', 
                name: 'Luffa', 
                emoji: '🧽', 
                url: 'https://callup.luffa.im/c/EnvtiTHkbvP', 
                enabled: true,
                logo: 'https://i.imgur.com/zkZtY0m.png'
              },
              { 
                id: 'discord', 
                name: 'Discord', 
                emoji: '🎮', 
                url: 'https://discord.gg/g2dACUC3', 
                enabled: true,
                logo: 'https://i.imgur.com/discord.png'
              },
              { 
                id: 'potato', 
                name: 'Potato', 
                emoji: '🥔', 
                url: 'https://potato.com', 
                enabled: true,
                logo: 'https://i.imgur.com/1iCRHRB.jpeg'
              }
            ]
            setSocialMedias(defaultShopSocialMedias)
            await localApi.updateShopSocialMedia(defaultShopSocialMedias)
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
        const localApi = getLocalApi()
        if (localApi) {
          await localApi.updateShopSocialMedia(socialMedias)
          console.log('💾 Réseaux sociaux shop sauvegardés localement')
        }
      } else {
        try {
          const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
          
          const configData = {
            shopSocialMediaList: socialMedias
          }
          
          await simpleApi.updateConfig(token, configData)
          console.log('✅ Réseaux sociaux shop sauvegardés')
        } catch (serverError) {
          console.log('Erreur sauvegarde serveur:', serverError.message)
          setIsLocalMode(true)
          const localApi = getLocalApi()
          if (localApi) {
            await localApi.updateShopSocialMedia(socialMedias)
          }
        }
      }
      
      toast.success('🏪 Réseaux sociaux shop sauvegardés et synchronisés !')
      
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
    
    let baseId = newSocialMedia.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
    let id = baseId
    let counter = 1
    
    while (socialMedias.some(item => item.id === id)) {
      id = `${baseId}_${counter}`
      counter++
    }
    
    const newItem = {
      ...newSocialMedia,
      id,
      name: newSocialMedia.name.trim(),
      emoji: newSocialMedia.emoji || '🔗',
      url: newSocialMedia.url.trim() || '#',
      logo: newSocialMedia.logo.trim() || ''
    }
    
    const updatedSocialMedias = [...socialMedias, newItem]
    setSocialMedias(updatedSocialMedias)
    setNewSocialMedia({ name: '', emoji: '', url: '', logo: '', enabled: true })
    
    toast.success(`Réseau social shop "${newItem.name}" ajouté`)
  }

  const updateSocialMedia = async (id, field, value) => {
    const updatedSocialMedias = socialMedias.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    )
    setSocialMedias(updatedSocialMedias)
    
    // Synchroniser automatiquement après modification (avec debounce)
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    updateTimeoutRef.current = setTimeout(async () => {
      if (isLocalMode) {
        const localApi = getLocalApi()
        if (localApi) {
          await localApi.updateShopSocialMedia(updatedSocialMedias)
          console.log('💾 Modification sauvegardée localement')
        }
      } else {
        try {
          const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
          const configData = { shopSocialMediaList: updatedSocialMedias }
          await simpleApi.updateConfig(token, configData)
          console.log('✅ Modification synchronisée avec l\'accueil boutique')
        } catch (error) {
          console.log('⚠️ Erreur synchronisation modification:', error.message)
          // Fallback en mode local
          setIsLocalMode(true)
          const localApi = getLocalApi()
          if (localApi) {
            await localApi.updateShopSocialMedia(updatedSocialMedias)
            console.log('💾 Modification sauvegardée en mode local (fallback)')
          }
        }
      }
    }, 1500) // Attendre 1.5 seconde après la dernière modification
  }

  const deleteSocialMedia = async (id) => {
    alert(`Test suppression: ${id}`) // TEST TEMPORAIRE
    console.log('🗑️ Tentative de suppression:', id)
    console.log('📝 socialMedias actuels:', socialMedias)
    
    const itemToDelete = socialMedias.find(item => item.id === id)
    if (!itemToDelete) {
      console.log('❌ Élément non trouvé pour ID:', id)
      toast.error('Réseau social non trouvé')
      return
    }

    console.log('📋 Élément à supprimer:', itemToDelete)
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${itemToDelete.name}" ?`)) {
      const updatedSocialMedias = socialMedias.filter(item => item.id !== id)
      console.log('📝 Nouveaux socialMedias après suppression:', updatedSocialMedias)
      setSocialMedias(updatedSocialMedias)
      
      // Synchroniser automatiquement après suppression
      console.log('🔄 Début synchronisation suppression, isLocalMode:', isLocalMode)
      if (isLocalMode) {
        // Mode local : sauvegarde directe
        const localApi = getLocalApi()
        if (localApi) {
          await localApi.updateShopSocialMedia(updatedSocialMedias)
          console.log('💾 Suppression sauvegardée localement')
        }
      } else {
        // Mode serveur : essayer de sauvegarder sur le serveur
        try {
          const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
          const configData = { shopSocialMediaList: updatedSocialMedias }
          await simpleApi.updateConfig(token, configData)
          console.log('✅ Suppression synchronisée avec l\'accueil boutique')
        } catch (serverError) {
          console.log('Erreur suppression serveur:', serverError.message)
          // Fallback en mode local si erreur serveur
          setIsLocalMode(true)
          const localApi = getLocalApi()
          if (localApi) {
            await localApi.updateShopSocialMedia(updatedSocialMedias)
            console.log('💾 Suppression sauvegardée en mode local (fallback)')
          }
        }
      }
      
      toast.success(`Réseau social "${itemToDelete.name}" supprimé et synchronisé`)
    }
  }

  const toggleEnabled = async (id) => {
    const updatedSocialMedias = socialMedias.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    )
    setSocialMedias(updatedSocialMedias)
    
    // Synchroniser automatiquement après toggle
    if (isLocalMode) {
      const localApi = getLocalApi()
      if (localApi) {
        await localApi.updateShopSocialMedia(updatedSocialMedias)
        console.log('💾 Toggle sauvegardé localement')
      }
    } else {
      try {
        const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
        const configData = { shopSocialMediaList: updatedSocialMedias }
        await simpleApi.updateConfig(token, configData)
        console.log('✅ Toggle synchronisé avec l\'accueil boutique')
      } catch (error) {
        console.log('⚠️ Erreur synchronisation toggle:', error.message)
        // Fallback en mode local
        setIsLocalMode(true)
        const localApi = getLocalApi()
        if (localApi) {
          await localApi.updateShopSocialMedia(updatedSocialMedias)
          console.log('💾 Toggle sauvegardé en mode local (fallback)')
        }
      }
    }
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Réseaux Shop - Admin Panel</title>
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
              <p className="text-black">Chargement des réseaux sociaux shop...</p>
            </div>
          </div>
        </Layout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Réseaux Shop - Admin Panel</title>
      </Head>
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold leading-6 text-gray-900">Gestion des Réseaux Sociaux - Shop</h1>
              <p className="mt-2 text-sm text-gray-700">
                Gérez les réseaux sociaux affichés dans la boutique/shop
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-2">
              {isLocalMode && (
                <div className="flex items-center text-orange-600 text-sm bg-orange-100 px-2 py-1 rounded-md">
                  <span className="mr-1">📁</span>
                  Mode Local
                </div>
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
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  📱 Réseaux Sociaux Shop Actuels
                </h3>
                
                <div className="space-y-4">
                  {socialMedias.map((social, index) => (
                    <div key={social.id} className={`border rounded-lg p-4 ${social.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={social.logo || 'https://i.imgur.com/PP2GVMv.png'}
                            alt={social.name}
                            className="w-8 h-8 object-contain rounded"
                            onError={(e) => {
                              e.target.src = 'https://i.imgur.com/PP2GVMv.png';
                            }}
                          />
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
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteSocialMedia(social.id);
                            }}
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
                              value={social.emoji}
                              onChange={(e) => updateSocialMedia(social.id, 'emoji', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="🔗"
                            />
                          ) : (
                            <p className="text-sm text-gray-600">{social.emoji}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700">Logo (URL)</label>
                          {editingId === social.id ? (
                            <input
                              type="url"
                              value={social.logo || ''}
                              onChange={(e) => updateSocialMedia(social.id, 'logo', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="https://i.imgur.com/example.png"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 truncate">{social.logo || 'Aucun logo'}</p>
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
                              placeholder="https://exemple.com"
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
                  ➕ Ajouter un Réseau Social Shop
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
                      placeholder="📸"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Logo (URL)</label>
                    <input
                      type="url"
                      value={newSocialMedia.logo}
                      onChange={(e) => setNewSocialMedia({...newSocialMedia, logo: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://i.imgur.com/example.png"
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
                    ➕ Ajouter au Shop
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