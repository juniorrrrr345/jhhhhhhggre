import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import toast, { Toaster } from 'react-hot-toast'
import { simpleApi } from '../../lib/api-simple'
import Layout from '../../components/Layout'

export default function ConfigurationSimple() {
  const [error, setError] = useState(null)
  const [config, setConfig] = useState({
    // Configuration Boutique
    boutique: {
      name: 'PlugsFinder Bot',
      subtitle: '',
      taglineHighlight: 'MINI-APP TELEGRAM',
      tagline2: 'CHILL',
      backgroundImage: '',
      vipTitle: '',
      vipSubtitle: '',
      vipBlueText: '',
      vipFinalText: '',
      searchTitle: '',
      searchSubtitle: '',
      searchBlueText: '',
      searchFinalText: ''
    },
    // Configuration Messages d'accueil
    welcome: {
      text: 'Bienvenue sur notre bot !',
      image: ''
    },
    // Configuration Boutons
    buttons: {
      contact: {
        enabled: true,
        text: 'Contact',
        content: 'Contactez-nous pour plus d\'informations'
      },
      info: {
        enabled: true,
        text: 'Informations',
        content: 'Voici les informations importantes'
      }
    },
    // Configuration Réseaux Sociaux
    socialMedia: [
      // { name: 'Telegram', emoji: '📱', url: '' }
    ]
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      console.log('🔄 Chargement configuration...')
      
      const token = localStorage.getItem('adminToken')
      const data = await simpleApi.getConfig(token)
        console.log('✅ Configuration chargée')
        
        setConfig({
          boutique: {
            name: data.boutique?.name || 'PlugsFinder Bot',
            subtitle: data.boutique?.subtitle || '',
            taglineHighlight: data.boutique?.taglineHighlight || 'MINI-APP TELEGRAM',
            tagline2: data.boutique?.tagline2 || 'CHILL',
            backgroundImage: data.boutique?.backgroundImage || '',
            vipTitle: data.boutique?.vipTitle || '',
            vipSubtitle: data.boutique?.vipSubtitle || '',
            vipBlueText: data.boutique?.vipBlueText || '',
            vipFinalText: data.boutique?.vipFinalText || '',
            searchTitle: data.boutique?.searchTitle || '',
            searchSubtitle: data.boutique?.searchSubtitle || '',
            searchBlueText: data.boutique?.searchBlueText || '',
            searchFinalText: data.boutique?.searchFinalText || ''
          },
          welcome: {
            text: data.welcome?.text || 'Bienvenue sur notre bot !',
            image: data.welcome?.image || ''
          },
          buttons: {
            contact: {
              enabled: data.buttons?.contact?.enabled ?? true,
              text: data.buttons?.contact?.text || 'Contact',
              content: data.buttons?.contact?.content || 'Contactez-nous pour plus d\'informations'
            },
            info: {
              enabled: data.buttons?.info?.enabled ?? true,
              text: data.buttons?.info?.text || 'Informations',
              content: data.buttons?.info?.content || 'Voici les informations importantes'
            }
          },
          socialMedia: Array.isArray(data.socialMedia) 
            ? data.socialMedia 
            : data.socialMedia && typeof data.socialMedia === 'object'
              ? Object.entries(data.socialMedia)
                  .filter(([key, value]) => value && value.trim())
                  .map(([key, value]) => ({
                    name: key === 'telegram' ? 'Telegram' : key === 'whatsapp' ? 'WhatsApp' : key,
                    emoji: key === 'telegram' ? '📱' : key === 'whatsapp' ? '💬' : '🌐',
                    url: value
                  }))
              : []
        })
        
        console.log('✅ Configuration chargée')
        toast.success('Configuration chargée')
        setError(null) // Réinitialiser l'erreur en cas de succès
    } catch (error) {
      console.error('❌ Erreur:', error)
      setError('Erreur lors du chargement de la configuration')
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      toast.error('Non authentifié')
      return
    }

    setSaving(true)

    try {
      console.log('💾 Sauvegarde...')
      
      await simpleApi.updateConfig(token, config)
      toast.success('Configuration sauvée !')
      
      // Optionnel: Recharger le bot
      try {
        await simpleApi.reloadBot(token)
        console.log('✅ Bot rechargé')
      } catch (e) {
        console.log('Reload bot ignoré')
      }
    } catch (error) {
      console.error('❌ Erreur:', error)
      toast.error('Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const updateBoutique = (field, value) => {
    setConfig(prev => ({
      ...prev,
      boutique: { ...prev.boutique, [field]: value }
    }))
  }

  const updateWelcome = (field, value) => {
    setConfig(prev => ({
      ...prev,
      welcome: { ...prev.welcome, [field]: value }
    }))
  }

  const updateButton = (buttonType, field, value) => {
    setConfig(prev => ({
      ...prev,
      buttons: {
        ...prev.buttons,
        [buttonType]: { ...prev.buttons[buttonType], [field]: value }
      }
    }))
  }

  const addSocialMedia = () => {
    setConfig(prev => ({
      ...prev,
      socialMedia: [...prev.socialMedia, { name: '', emoji: '🌐', url: '' }]
    }))
  }

  const updateSocialMedia = (index, field, value) => {
    setConfig(prev => ({
      ...prev,
      socialMedia: Array.isArray(prev.socialMedia) 
        ? prev.socialMedia.map((item, i) => 
            i === index ? { ...item, [field]: value } : item
          )
        : []
    }))
  }

  const removeSocialMedia = (index) => {
    setConfig(prev => ({
      ...prev,
      socialMedia: Array.isArray(prev.socialMedia) 
        ? prev.socialMedia.filter((_, i) => i !== index)
        : []
    }))
  }



  if (loading) {
    return (
      <Layout title="Configuration">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="Configuration">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null)
                fetchConfig()
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Configuration">
      <Head>
        <title>Configuration - Admin Panel</title>
      </Head>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">⚙️ Configuration</h1>
            <p className="mt-1 text-sm text-gray-500">
              Configurez votre boutique et votre bot Telegram
            </p>
          </div>
          <button
            onClick={saveConfig}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
          </button>
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Interface */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  🎨 Configuration Boutique
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom de la boutique</label>
                    <input
                      type="text"
                      value={config.boutique.name}
                      onChange={(e) => updateBoutique('name', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nom de votre boutique"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sous-titre</label>
                    <input
                      type="text"
                      value={config.boutique.subtitle}
                      onChange={(e) => updateBoutique('subtitle', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Description courte"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Texte en surbrillance</label>
                    <input
                      type="text"
                      value={config.boutique.taglineHighlight}
                      onChange={(e) => updateBoutique('taglineHighlight', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="MINI-APP TELEGRAM"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Texte final</label>
                    <input
                      type="text"
                      value={config.boutique.tagline2}
                      onChange={(e) => updateBoutique('tagline2', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="CHILL"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image de fond (URL)</label>
                    <input
                      type="url"
                      value={config.boutique.backgroundImage}
                      onChange={(e) => updateBoutique('backgroundImage', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Page VIP</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Titre VIP</label>
                        <input
                          type="text"
                          value={config.boutique.vipTitle}
                          onChange={(e) => updateBoutique('vipTitle', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="tous service tous pays"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Sous-titre VIP</label>
                        <input
                          type="text"
                          value={config.boutique.vipSubtitle}
                          onChange={(e) => updateBoutique('vipSubtitle', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="en blanc"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Texte bleu VIP</label>
                        <input
                          type="text"
                          value={config.boutique.vipBlueText}
                          onChange={(e) => updateBoutique('vipBlueText', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Texte en bleu pour la page VIP"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Texte final VIP</label>
                        <input
                          type="text"
                          value={config.boutique.vipFinalText}
                          onChange={(e) => updateBoutique('vipFinalText', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Texte final affiché en bas de la page VIP"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Page Recherche</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Titre Recherche</label>
                        <input
                          type="text"
                          value={config.boutique.searchTitle}
                          onChange={(e) => updateBoutique('searchTitle', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Titre pour la page recherche"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Sous-titre Recherche</label>
                        <input
                          type="text"
                          value={config.boutique.searchSubtitle}
                          onChange={(e) => updateBoutique('searchSubtitle', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Sous-titre pour la page recherche"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Texte bleu Recherche</label>
                        <input
                          type="text"
                          value={config.boutique.searchBlueText}
                          onChange={(e) => updateBoutique('searchBlueText', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Texte en bleu pour la page recherche"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Texte final Recherche</label>
                        <input
                          type="text"
                          value={config.boutique.searchFinalText}
                          onChange={(e) => updateBoutique('searchFinalText', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Texte final affiché en bas de la page recherche"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Message d'accueil Bot */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  🤖 Message d'Accueil Bot
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Texte de bienvenue</label>
                    <textarea
                      value={config.welcome.text}
                      onChange={(e) => updateWelcome('text', e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Message de bienvenue pour les nouveaux utilisateurs..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image d'accueil (URL)</label>
                    <input
                      type="url"
                      value={config.welcome.image}
                      onChange={(e) => updateWelcome('image', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/welcome.jpg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons du Bot */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  🔘 Boutons du Bot
                </h3>
                
                <div className="space-y-6">
                  {/* Bouton Contact */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Bouton Contact</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.buttons.contact.enabled}
                          onChange={(e) => updateButton('contact', 'enabled', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Activé</span>
                      </label>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Texte du bouton</label>
                        <input
                          type="text"
                          value={config.buttons.contact.text}
                          onChange={(e) => updateButton('contact', 'text', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Contenu</label>
                        <textarea
                          value={config.buttons.contact.content}
                          onChange={(e) => updateButton('contact', 'content', e.target.value)}
                          rows={2}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bouton Info */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Bouton Info</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.buttons.info.enabled}
                          onChange={(e) => updateButton('info', 'enabled', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Activé</span>
                      </label>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Texte du bouton</label>
                        <input
                          type="text"
                          value={config.buttons.info.text}
                          onChange={(e) => updateButton('info', 'text', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Contenu</label>
                        <textarea
                          value={config.buttons.info.content}
                          onChange={(e) => updateButton('info', 'content', e.target.value)}
                          rows={2}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Réseaux Sociaux */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    📱 Réseaux Sociaux
                  </h3>
                  <button
                    onClick={addSocialMedia}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                  >
                    + Ajouter
                  </button>
                </div>
                
                <div className="space-y-4">
                  {!Array.isArray(config.socialMedia) || config.socialMedia.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      Aucun réseau social configuré. Cliquez sur "Ajouter" pour en créer un.
                    </p>
                  ) : (
                    config.socialMedia.map((social, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            Réseau Social #{index + 1}
                          </h4>
                          <button
                            onClick={() => removeSocialMedia(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            ✕ Supprimer
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Nom du réseau</label>
                            <input
                              type="text"
                              value={social.name}
                              onChange={(e) => updateSocialMedia(index, 'name', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Ex: Telegram, Discord, etc."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Emoji</label>
                            <input
                              type="text"
                              value={social.emoji}
                              onChange={(e) => updateSocialMedia(index, 'emoji', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="📱"
                              maxLength="2"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700">URL/Lien</label>
                            <input
                              type="text"
                              value={social.url}
                              onChange={(e) => updateSocialMedia(index, 'url', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="https://... ou @username"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Aperçu Boutique */}
            <div className="bg-white shadow rounded-lg lg:col-span-2">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  👁️ Aperçu Boutique
                </h3>
                
                <div className="bg-black text-white p-6 rounded-lg" style={{
                  backgroundImage: config.boutique.backgroundImage ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("${config.boutique.backgroundImage}")` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">
                      {config.boutique.name || 'PLUGS FINDER'}
                    </h2>
                    <div className="text-lg">
                      <span className="text-white mr-2">
                        {config.boutique.subtitle || 'Votre boutique'}
                      </span>
                      <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold mr-2">
                        {config.boutique.taglineHighlight || 'MINI-APP TELEGRAM'}
                      </span>
                      <span className="text-white">
                        {config.boutique.tagline2 || 'CHILL'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    onClick={() => window.open('/shop', '_blank')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    🔗 Ouvrir la boutique
                  </button>
                </div>
              </div>
            </div>
        </div>
      </div>
      
      <Toaster position="top-right" />
    </Layout>
  )
}