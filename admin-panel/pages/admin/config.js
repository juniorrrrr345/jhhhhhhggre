import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import toast from 'react-hot-toast'
import {
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  CheckIcon,
  EyeIcon,
  CogIcon
} from '@heroicons/react/24/outline'

export default function Config() {
  const [config, setConfig] = useState({
    welcome: { 
      text: '🎉 Bienvenue sur notre bot premium !', 
      image: 'https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Bot+Image' 
    },
    boutique: {
      name: '',
      subtitle: '',
      logo: '',
      vipTitle: '',
      vipSubtitle: '',
      searchTitle: '',
      searchSubtitle: ''
    },
    messages: {
      welcome: '',
      noPlugsFound: '',
      error: ''
    },
    socialMedia: {
      telegram: '',
      whatsapp: '',
      website: ''
    },
    buttons: {
      topPlugs: { text: '🔌 Top Des Plugs' },
      vipPlugs: { text: '⭐ Boutiques VIP' },
      contact: { text: '📞 Contact', content: '' },
      info: { text: 'ℹ️ Info', content: '' }
    },
    filters: {
      all: 'Tous les plugs',
      byService: 'Par service',
      byCountry: 'Par pays'
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState('visual') // 'visual' ou 'advanced'
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
    fetchConfig(token)
  }, [])

  const fetchConfig = async (token) => {
    try {
      setLoading(true)
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL
      console.log('🔍 Fetching config from:', apiBaseUrl)
      
      const response = await fetch(`${apiBaseUrl}/api/config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      console.log('⚙️ Config fetch response:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Config loaded:', data)
        setConfig(data)
      } else {
        console.error('❌ Config fetch error:', response.status, response.statusText)
        toast.error('Erreur lors du chargement')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

        const saveConfig = async () => {
        const token = localStorage.getItem('adminToken')
        setSaving(true)

        try {
          // Essayer d'abord l'API directe
          let success = false
          try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
            console.log('💾 Admin config tentative directe:', apiBaseUrl)
            
            const response = await fetch(`${apiBaseUrl}/api/config`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(config)
            })

            if (response.ok) {
              console.log('✅ Admin config direct réussi')
              success = true
              toast.success('Configuration sauvegardée !')
              
              // Recharger automatiquement le bot après sauvegarde
              setTimeout(() => {
                reloadBot();
              }, 1000);
            } else {
              throw new Error(`HTTP ${response.status}`)
            }
          } catch (directError) {
            console.log('❌ Admin config direct échoué:', directError.message)
            console.log('🔄 Admin config tentative via proxy...')
            
            // Fallback vers le proxy
            const proxyResponse = await fetch('/api/proxy?endpoint=/api/config', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token
              },
              body: JSON.stringify(config)
            })

            if (proxyResponse.ok) {
              console.log('✅ Admin config proxy réussi')
              success = true
              toast.success('Configuration sauvegardée via proxy !')
            } else {
              throw new Error(`Proxy failed: HTTP ${proxyResponse.status}`)
            }
          }

          if (!success) {
            toast.error('Erreur lors de la sauvegarde')
          }
        } catch (error) {
          console.error('💥 Admin config error final:', error)
          toast.error('Erreur de connexion')
        } finally {
          setSaving(false)
        }
      }

  const updateConfig = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const updateNestedConfig = (section, subsection, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section]?.[subsection],
          [field]: value
        }
      }
    }))
  }

  // Fonctions pour l'édition visuelle
  const editText = (section, field, currentValue, title) => {
    const newText = prompt(`${title}:`, currentValue);
    if (newText !== null && newText !== currentValue) {
      setConfig(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newText
        }
      }));
      toast.success('Texte mis à jour ! N\'oubliez pas de sauvegarder.');
    }
  };

  const editNestedText = (section, subsection, field, currentValue, title) => {
    const newText = prompt(`${title}:`, currentValue);
    if (newText !== null && newText !== currentValue) {
      setConfig(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subsection]: {
            ...prev[section][subsection],
            [field]: newText
          }
        }
      }));
      toast.success('Texte mis à jour ! N\'oubliez pas de sauvegarder.');
    }
  };

  const editImage = () => {
    const newUrl = prompt("URL de l'image d'accueil:", config.welcome?.image || '');
    if (newUrl !== null && newUrl !== (config.welcome?.image || '')) {
      setConfig(prev => ({
        ...prev,
        welcome: {
          ...prev.welcome,
          image: newUrl
        }
      }));
      toast.success('Image mise à jour ! N\'oubliez pas de sauvegarder.');
    }
  };

  // Fonction pour recharger le bot
  const reloadBot = async () => {
    const token = localStorage.getItem('adminToken');

    try {
      console.log('🔄 Rechargement du bot...');
      
      // Essayer l'API directe d'abord
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com';
        const response = await fetch(`${apiBaseUrl}/api/bot/reload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          console.log('✅ Bot rechargé avec succès');
        }
      } catch (directError) {
        console.log('❌ Rechargement direct échoué, tentative proxy...');
        
        // Fallback vers le proxy
        await fetch('/api/reload-bot', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('💥 Erreur rechargement bot:', error);
    }
  }

  if (loading) {
    return (
      <Layout title="Configuration Bot">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Configuration Bot">
      <div className="space-y-8">
        {/* Header avec sélecteur de mode */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuration du Bot</h1>
            <p className="text-gray-600">Personnalisez votre bot Telegram</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setViewMode('visual')}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'visual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                🎨 Mode Visuel
              </button>
              <button
                onClick={() => setViewMode('advanced')}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'advanced'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <CogIcon className="w-4 h-4 mr-2" />
                ⚙️ Mode Avancé
              </button>
            </div>
          </div>
        </div>

        {/* Contenu selon le mode */}
        {viewMode === 'visual' ? (
          /* Mode Visuel */
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Instructions */}
            <div className="lg:w-1/3 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-3">💡 Comment ça marche ?</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• 🖼️ Cliquez sur l'image pour la changer</li>
                  <li>• 📝 Cliquez sur le message pour l'éditer</li>
                  <li>• 🔘 Cliquez sur les boutons pour modifier leur texte</li>
                  <li>• 💾 N'oubliez pas de sauvegarder !</li>
                </ul>
              </div>

              {/* Configuration rapide boutique */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-green-900 mb-3">🏪 Boutique Vercel</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => editText('boutique', 'name', config.boutique?.name || '', 'Nom de la boutique')}
                    className="w-full text-left bg-white border border-green-300 rounded-lg p-3 hover:bg-green-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-green-800">Nom :</div>
                    <div className="text-green-600">{config.boutique?.name || 'Cliquez pour définir'}</div>
                  </button>
                  
                  <button
                    onClick={() => editText('boutique', 'subtitle', config.boutique?.subtitle || '', 'Sous-titre de la boutique')}
                    className="w-full text-left bg-white border border-green-300 rounded-lg p-3 hover:bg-green-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-green-800">Sous-titre :</div>
                    <div className="text-green-600">{config.boutique?.subtitle || 'Cliquez pour définir'}</div>
                  </button>
                  
                  <button
                    onClick={() => editText('boutique', 'logo', config.boutique?.logo || '', 'Logo de la boutique (URL)')}
                    className="w-full text-left bg-white border border-green-300 rounded-lg p-3 hover:bg-green-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-green-800">Logo :</div>
                    <div className="text-green-600 text-xs break-all">{config.boutique?.logo || 'Cliquez pour définir'}</div>
                  </button>

                  <button
                    onClick={() => editText('boutique', 'searchTitle', config.boutique?.searchTitle || '', 'Titre page Recherche')}
                    className="w-full text-left bg-white border border-green-300 rounded-lg p-3 hover:bg-green-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-green-800">Titre Recherche :</div>
                    <div className="text-green-600">{config.boutique?.searchTitle || 'Cliquez pour définir'}</div>
                  </button>

                  <button
                    onClick={() => editText('boutique', 'vipTitle', config.boutique?.vipTitle || '', 'Titre section VIP')}
                    className="w-full text-left bg-white border border-green-300 rounded-lg p-3 hover:bg-green-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-green-800">Titre VIP :</div>
                    <div className="text-green-600">{config.boutique?.vipTitle || 'Cliquez pour définir'}</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Simulation du bot Telegram */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md mx-auto">
                {/* Header du bot */}
                <div className="bg-blue-500 text-white p-4 text-center">
                  <h3 className="text-lg font-semibold">🤖 Aperçu Bot Telegram</h3>
                  <p className="text-blue-100 text-sm">Cliquez pour modifier</p>
                </div>
                
                {/* Image d'accueil */}
                <div className="relative group">
                  <img 
                    src={config.welcome?.image || 'https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Bot+Image'} 
                    alt="Accueil"
                    className="w-full h-48 object-cover cursor-pointer transition-all group-hover:brightness-75"
                    onClick={editImage}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <button 
                      onClick={editImage}
                      className="opacity-0 group-hover:opacity-100 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm transition-all"
                    >
                      ✏️ Changer l'image
                    </button>
                  </div>
                </div>

                {/* Message d'accueil */}
                <div className="p-4">
                  <div 
                    onClick={() => editText('welcome', 'text', config.welcome?.text || '', 'Message d\'accueil')}
                    className="bg-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors group relative"
                  >
                    <p className="text-gray-800">{config.welcome?.text || 'Cliquez pour ajouter un message d\'accueil'}</p>
                    <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity">
                      ✏️
                    </span>
                  </div>
                </div>

                {/* Boutons éditables */}
                <div className="p-4 space-y-3">
                  {Object.entries(config.buttons || {}).map(([key, button]) => {
                                         const buttonLabels = {
                       topPlugs: 'Bouton "Top Des Plugs"',
                       vipPlugs: 'Bouton "Boutiques VIP"',
                       contact: 'Bouton "Contact"',
                       info: 'Bouton "Informations"'
                     };

                     return (
                       <div key={key} className="space-y-2">
                         <button
                           onClick={() => editNestedText('buttons', key, 'text', button?.text || '', buttonLabels[key] || `Bouton ${key}`)}
                           className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors relative group"
                         >
                           {button?.text || `Bouton ${key}`}
                           <span className="opacity-0 group-hover:opacity-100 absolute right-3 top-1/2 transform -translate-y-1/2 transition-opacity">
                             ✏️
                           </span>
                         </button>
                         
                         {/* Bouton pour éditer le contenu des pages Contact et Info */}
                         {(key === 'contact' || key === 'info') && (
                           <button
                             onClick={() => editNestedText('buttons', key, 'content', button?.content || '', `Contenu page ${buttonLabels[key]}`)}
                             className="w-full bg-gray-500 text-white p-2 text-sm rounded hover:bg-gray-600 transition-colors"
                           >
                             ✏️ Éditer le contenu de la page
                           </button>
                         )}
                       </div>
                     );
                  })}
                </div>

                {/* Footer informatif */}
                <div className="bg-gray-50 p-3 text-center">
                  <p className="text-xs text-gray-500">
                    👆 Cliquez sur n'importe quel élément pour le modifier
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Mode Avancé */
          <div className="space-y-8">

        {/* Messages du bot */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
              Messages du Bot
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Message d'accueil */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message d'accueil (/start)
              </label>
              <textarea
                value={config.messages?.welcome || ''}
                onChange={(e) => updateConfig('messages', 'welcome', e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Bienvenue sur notre bot ! 🎉..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Message affiché quand un utilisateur tape /start
              </p>
            </div>

            {/* Message aucun plug trouvé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message "Aucun plug trouvé"
              </label>
              <textarea
                value={config.messages?.noPlugsFound || ''}
                onChange={(e) => updateConfig('messages', 'noPlugsFound', e.target.value)}
                rows={2}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="😅 Aucun plug trouvé pour vos critères..."
              />
            </div>

            {/* Message d'erreur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message d'erreur générique
              </label>
              <input
                type="text"
                value={config.messages?.error || ''}
                onChange={(e) => updateConfig('messages', 'error', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="❌ Une erreur est survenue..."
              />
            </div>
          </div>
        </div>

        {/* Configuration boutique Vercel */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">🏪 Boutique Vercel</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la boutique
              </label>
              <input
                type="text"
                value={config.boutique?.name || ''}
                onChange={(e) => updateConfig('boutique', 'name', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Boutique Premium"
              />
              <p className="text-sm text-gray-500 mt-1">Titre principal affiché sur le site web</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sous-titre de la boutique
              </label>
              <input
                type="text"
                value={config.boutique?.subtitle || ''}
                onChange={(e) => updateConfig('boutique', 'subtitle', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Classement par likes"
              />
              <p className="text-sm text-gray-500 mt-1">Sous-titre affiché sous le titre principal</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo de la boutique (URL)
              </label>
              <input
                type="url"
                value={config.boutique?.logo || ''}
                onChange={(e) => updateConfig('boutique', 'logo', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/logo.png"
              />
              <p className="text-sm text-gray-500 mt-1">URL du logo affiché en haut de la boutique</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre section VIP
              </label>
              <input
                type="text"
                value={config.boutique?.vipTitle || ''}
                onChange={(e) => updateConfig('boutique', 'vipTitle', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Boutiques VIP"
              />
              <p className="text-sm text-gray-500 mt-1">Titre de la section VIP sur le site</p>
            </div>

                         <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Sous-titre section VIP
               </label>
               <input
                 type="text"
                 value={config.boutique?.vipSubtitle || ''}
                 onChange={(e) => updateConfig('boutique', 'vipSubtitle', e.target.value)}
                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                 placeholder="Sélection premium exclusive"
               />
               <p className="text-sm text-gray-500 mt-1">Sous-titre de la section VIP</p>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Titre page Recherche
               </label>
               <input
                 type="text"
                 value={config.boutique?.searchTitle || ''}
                 onChange={(e) => updateConfig('boutique', 'searchTitle', e.target.value)}
                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                 placeholder="Recherche Boutiques"
               />
               <p className="text-sm text-gray-500 mt-1">Titre affiché sur la page de recherche</p>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Sous-titre page Recherche
               </label>
               <input
                 type="text"
                 value={config.boutique?.searchSubtitle || ''}
                 onChange={(e) => updateConfig('boutique', 'searchSubtitle', e.target.value)}
                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                 placeholder="Trouvez la boutique parfaite"
               />
               <p className="text-sm text-gray-500 mt-1">Sous-titre affiché sur la page de recherche</p>
             </div>
           </div>
         </div>

        {/* Textes des boutons */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Textes des Boutons</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bouton "Top Des Plugs"
                </label>
                <input
                  type="text"
                  value={config.buttons?.topPlugs?.text || ''}
                  onChange={(e) => updateNestedConfig('buttons', 'topPlugs', 'text', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="🔌 Top Des Plugs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bouton "Contact"
                </label>
                <input
                  type="text"
                  value={config.buttons?.contact?.text || ''}
                  onChange={(e) => updateNestedConfig('buttons', 'contact', 'text', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="📞 Contact"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu page "Contact"
                </label>
                <textarea
                  value={config.buttons?.contact?.content || ''}
                  onChange={(e) => updateNestedConfig('buttons', 'contact', 'content', e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contactez-nous pour plus d'informations..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bouton "Info"
                </label>
                <input
                  type="text"
                  value={config.buttons?.info?.text || ''}
                  onChange={(e) => updateNestedConfig('buttons', 'info', 'text', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ℹ️ Info"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu page "Info"
                </label>
                <textarea
                  value={config.buttons?.info?.content || ''}
                  onChange={(e) => updateNestedConfig('buttons', 'info', 'content', e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Informations sur notre plateforme..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Configuration des services et pays */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">🛠️ Services & Pays</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texte "Livraison"
                </label>
                <input
                  type="text"
                  value={config.botTexts?.deliveryServiceText || ''}
                  onChange={(e) => updateConfig('botTexts', 'deliveryServiceText', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="🚚 Livraison"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texte "Envoi postal"
                </label>
                <input
                  type="text"
                  value={config.botTexts?.postalServiceText || ''}
                  onChange={(e) => updateConfig('botTexts', 'postalServiceText', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="✈️ Envoi postal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texte "Meetup"
                </label>
                <input
                  type="text"
                  value={config.botTexts?.meetupServiceText || ''}
                  onChange={(e) => updateConfig('botTexts', 'meetupServiceText', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="🏠 Meetup"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <GlobeAltIcon className="w-5 h-5 mr-2" />
              Réseaux Sociaux
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telegram
              </label>
              <input
                type="url"
                value={config.socialMedia?.telegram || ''}
                onChange={(e) => updateConfig('socialMedia', 'telegram', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://t.me/votre_channel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp
              </label>
              <input
                type="url"
                value={config.socialMedia?.whatsapp || ''}
                onChange={(e) => updateConfig('socialMedia', 'whatsapp', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://wa.me/33123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Web
              </label>
              <input
                type="url"
                value={config.socialMedia?.website || ''}
                onChange={(e) => updateConfig('socialMedia', 'website', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://votre-site.com"
              />
            </div>
          </div>
        </div>

        {/* Textes des filtres */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Textes des Filtres</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  "Tous les plugs"
                </label>
                <input
                  type="text"
                  value={config.filters?.all || ''}
                  onChange={(e) => updateConfig('filters', 'all', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tous les plugs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  "Par service"
                </label>
                <input
                  type="text"
                  value={config.filters?.byService || ''}
                  onChange={(e) => updateConfig('filters', 'byService', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Par service"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  "Par pays"
                </label>
                <input
                  type="text"
                  value={config.filters?.byCountry || ''}
                  onChange={(e) => updateConfig('filters', 'byCountry', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Par pays"
                />
              </div>
            </div>
          </div>
        </div>

          </div>
        )}

        {/* Section de sauvegarde commune */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-medium text-gray-900">💾 Sauvegarde</h3>
              <p className="text-sm text-gray-500">Appliquez vos modifications</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={reloadBot}
                disabled={saving}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                🔄 Recharger
              </button>
              <button
                onClick={saveConfig}
                disabled={saving}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}