import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { simpleApi } from '../../lib/api-simple'
import { getLocalApi } from '../../lib/local-storage-api'
import toast from 'react-hot-toast'

// Emojis par défaut pour les réseaux sociaux populaires
const getDefaultEmoji = (name) => {
  const emojis = {
    'instagram': '📸',
    'tiktok': '🎵',
    'youtube': '📺',
    'twitter': '🐦',
    'facebook': '📘',
    'linkedin': '💼',
    'telegram': '📱',
    'whatsapp': '💬',
    'snapchat': '👻',
    'discord': '🎮',
    'twitch': '🟣',
    'pinterest': '📌'
  }
  
  const lowerName = name.toLowerCase()
  return emojis[lowerName] || '🔗'
}

// Réseaux sociaux populaires prédéfinis
const popularSocialMedia = [
  { name: 'Instagram', emoji: '📸', placeholder: 'https://instagram.com/your_account' },
  { name: 'TikTok', emoji: '🎵', placeholder: 'https://tiktok.com/@your_account' },
  { name: 'YouTube', emoji: '📺', placeholder: 'https://youtube.com/c/YourChannel' },
  { name: 'Twitter', emoji: '🐦', placeholder: 'https://twitter.com/your_account' },
  { name: 'Facebook', emoji: '📘', placeholder: 'https://facebook.com/your_page' },
  { name: 'LinkedIn', emoji: '💼', placeholder: 'https://linkedin.com/in/your_profile' },
  { name: 'Telegram', emoji: '📱', placeholder: 'https://t.me/your_channel' },
  { name: 'WhatsApp', emoji: '💬', placeholder: 'https://wa.me/your_number' }
]

export default function SocialMediaManager() {
  const [socialMedias, setSocialMedias] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSocialMedia, setNewSocialMedia] = useState({
    name: '',
    emoji: '',
    url: ''
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
      
      if (typeof window === 'undefined') return
      
      const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
      const config = await simpleApi.getConfig(token)
      
      if (config && config.socialMedia) {
        // Utiliser socialMedia (pas socialMediaList) comme attendu par le bot
        const socialMediaArray = Array.isArray(config.socialMedia) ? config.socialMedia : []
        const socialMediasWithEmojis = socialMediaArray.map((item, index) => ({
          ...item,
          id: item.id || `social_${index}`,
          emoji: item.emoji || getDefaultEmoji(item.name || '')
        }))
        setSocialMedias(socialMediasWithEmojis)
        console.log('✅ Réseaux sociaux chargés depuis le serveur:', socialMediasWithEmojis)
      } else {
        // Initialiser avec des réseaux par défaut
        const defaultSocialMedias = [
          { id: 'telegram', name: 'Telegram', emoji: '📱', url: 'https://t.me/+zcP68c4M_3NlM2Y0' },
          { id: 'contact', name: 'Contact', emoji: '📞', url: 'https://t.me/findyourplugsav' }
        ]
        setSocialMedias(defaultSocialMedias)
        console.log('🔧 Réseaux sociaux initialisés avec valeurs par défaut')
      }
      
    } catch (error) {
      console.error('Erreur chargement réseaux sociaux:', error)
      
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') || 
          error.message.includes('offline')) {
        setIsLocalMode(true)
        
        try {
          const localApi = getLocalApi()
          if (localApi) {
            const localConfig = await localApi.getConfig()
            if (localConfig && localConfig.socialMedia) {
              const socialMediaArray = Array.isArray(localConfig.socialMedia) ? localConfig.socialMedia : []
              const socialMediasWithEmojis = socialMediaArray.map((item, index) => ({
                ...item,
                id: item.id || `social_${index}`,
                emoji: item.emoji || getDefaultEmoji(item.name || '')
              }))
              setSocialMedias(socialMediasWithEmojis)
              console.log('📁 Réseaux sociaux chargés depuis le stockage local')
            }
          }
        } catch (localError) {
          console.error('Erreur mode local:', localError)
          toast.error('Erreur de stockage local')
        }
      } else {
        toast.error('Erreur lors du chargement')
      }
    } finally {
      setLoading(false)
    }
  }

  const saveSocialMedias = async () => {
    try {
      setSaving(true)
      
      // Préparer les données pour le bot (format attendu)
      const socialMediaForBot = socialMedias.map(({ id, ...rest }) => rest)
      
      if (isLocalMode) {
        const localApi = getLocalApi()
        if (localApi) {
          await localApi.updateConfig({ socialMedia: socialMediaForBot })
          console.log('💾 Réseaux sociaux sauvegardés localement')
          toast.success('✅ Configuration sauvegardée localement')
        }
      } else {
        try {
          const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
          
          const configData = {
            socialMedia: socialMediaForBot
          }
          
          await simpleApi.updateConfig(token, configData)
          console.log('✅ Réseaux sociaux sauvegardés sur le serveur')
          toast.success('✅ Configuration sauvegardée avec succès')
        } catch (serverError) {
          console.log('Erreur sauvegarde serveur:', serverError.message)
          
          if (serverError.message.includes('Failed to fetch') || 
              serverError.message.includes('NetworkError') || 
              serverError.message.includes('offline')) {
            setIsLocalMode(true)
            const localApi = getLocalApi()
            if (localApi) {
              await localApi.updateConfig({ socialMedia: socialMediaForBot })
              toast.success('✅ Sauvegardé localement (serveur indisponible)')
            }
          } else {
            toast.error('Erreur lors de la sauvegarde')
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
    
    if (!newSocialMedia.url.trim()) {
      toast.error('URL est requise')
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
      id,
      name: newSocialMedia.name.trim(),
      emoji: newSocialMedia.emoji || getDefaultEmoji(newSocialMedia.name.trim()),
      url: newSocialMedia.url.trim()
    }
    
    const updatedSocialMedias = [...socialMedias, newItem]
    setSocialMedias(updatedSocialMedias)
    setNewSocialMedia({ name: '', emoji: '', url: '' })
    setShowAddForm(false)
    
    toast.success(`Réseau social "${newItem.name}" ajouté`)
  }

  const updateSocialMedia = (id, field, value) => {
    setSocialMedias(prevSocialMedias => 
      prevSocialMedias.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const deleteSocialMedia = (id) => {
    const itemToDelete = socialMedias.find(item => item.id === id)
    if (!itemToDelete) {
      toast.error('Réseau social non trouvé')
      return
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer "${itemToDelete.name}" ?`)) {
      const updatedSocialMedias = socialMedias.filter(item => item.id !== id)
      setSocialMedias(updatedSocialMedias)
      toast.success(`Réseau social "${itemToDelete.name}" supprimé`)
    }
  }

  const selectPopularSocial = (popular) => {
    setNewSocialMedia({
      name: popular.name,
      emoji: popular.emoji,
      url: ''
    })
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
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-2xl">📱</span>
              </div>
              <p className="text-gray-600">Chargement des réseaux sociaux...</p>
            </div>
          </div>
        </Layout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Gestion des Réseaux Sociaux - Admin Panel</title>
      </Head>
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Réseaux Sociaux</h1>
              <p className="text-gray-600">Gérez les réseaux sociaux affichés dans le bot Telegram</p>
            </div>

            {/* Bouton Sauvegarder */}
            <div className="mb-6">
              <button
                onClick={saveSocialMedias}
                disabled={saving}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="mr-2">💾</span>
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              
              {isLocalMode && (
                <div className="ml-4 inline-flex items-center px-3 py-2 bg-orange-100 text-orange-800 text-sm font-medium rounded-lg">
                  <span className="mr-1">📁</span>
                  Mode Local
                </div>
              )}
            </div>

            {/* Section Réseaux Sociaux Actuels */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">📱</span>
                  Réseaux Sociaux Actuels
                </h2>
              </div>

              {socialMedias.length > 0 ? (
                <div className="space-y-4">
                  {socialMedias.map((social) => (
                    <div key={social.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm">
                            {social.emoji}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{social.name}</h3>
                            <p className="text-sm text-gray-500 truncate max-w-xs">{social.url || 'Aucun lien'}</p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => deleteSocialMedia(social.id)}
                          className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <span className="mr-1">🗑️</span>
                          Supprimer
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Nom du réseau</label>
                          <input
                            type="text"
                            value={social.name}
                            onChange={(e) => updateSocialMedia(social.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Instagram"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Emoji</label>
                          <input
                            type="text"
                            value={social.emoji}
                            onChange={(e) => updateSocialMedia(social.id, 'emoji', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="📸"
                            maxLength="4"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">URL/Lien</label>
                          <input
                            type="url"
                            value={social.url}
                            onChange={(e) => updateSocialMedia(social.id, 'url', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://instagram.com/your_account"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-gray-400 text-4xl mb-4">📱</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun réseau social</h3>
                  <p className="text-gray-500 mb-4">Commencez par ajouter votre premier réseau social</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span className="mr-2">➕</span>
                    Ajouter un réseau social
                  </button>
                </div>
              )}
            </div>

            {/* Section Ajouter un Réseau Social */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">➕</span>
                  Ajouter un Réseau Social
                </h2>
                {!showAddForm && socialMedias.length > 0 && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center px-4 py-2 text-sm bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <span className="mr-2">➕</span>
                    Ajouter
                  </button>
                )}
              </div>

              {(showAddForm || socialMedias.length === 0) && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom du réseau</label>
                      <input
                        type="text"
                        value={newSocialMedia.name}
                        onChange={(e) => setNewSocialMedia({...newSocialMedia, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Instagram"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emoji</label>
                      <input
                        type="text"
                        value={newSocialMedia.emoji}
                        onChange={(e) => setNewSocialMedia({...newSocialMedia, emoji: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="📸"
                        maxLength="4"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL/Lien</label>
                      <input
                        type="url"
                        value={newSocialMedia.url}
                        onChange={(e) => setNewSocialMedia({...newSocialMedia, url: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://instagram.com/your_account"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={addSocialMedia}
                      disabled={!newSocialMedia.name.trim() || !newSocialMedia.url.trim()}
                      className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="mr-2">➕</span>
                      Ajouter
                    </button>
                    
                    {showAddForm && socialMedias.length > 0 && (
                      <button
                        onClick={() => {
                          setShowAddForm(false)
                          setNewSocialMedia({ name: '', emoji: '', url: '' })
                        }}
                        className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Réseaux populaires */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🌟</span>
                  Réseaux populaires
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {popularSocialMedia.map((popular) => (
                    <button
                      key={popular.name}
                      onClick={() => selectPopularSocial(popular)}
                      className="flex items-center p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <span className="text-xl mr-3">{popular.emoji}</span>
                      <span className="text-sm font-medium text-gray-900">{popular.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}