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
      console.log('🔐 Using token:', token ? `***${token.slice(-4)}` : 'Absent')
      
      const response = await fetch(`${apiBaseUrl}/api/config`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })

      console.log('⚙️ Config fetch response:', response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Config loaded:', Object.keys(data))
        
        // Merger avec la configuration par défaut pour éviter les champs manquants
        const mergedConfig = {
          welcome: { 
            text: '🎉 Bienvenue sur notre bot premium !', 
            image: 'https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Bot+Image',
            ...data.welcome
          },
          boutique: {
            name: '',
            subtitle: '',
            logo: '',
            vipTitle: '',
            vipSubtitle: '',
            searchTitle: '',
            searchSubtitle: '',
            backgroundImage: '',
            ...data.boutique
          },
          messages: {
            welcome: '',
            noPlugsFound: '',
            error: '',
            ...data.messages
          },
          socialMedia: {
            telegram: '',
            whatsapp: '',
            website: '',
            ...data.socialMedia
          },
          buttons: {
            topPlugs: { text: '🔌 Top Des Plugs' },
            vipPlugs: { text: '⭐ Boutiques VIP' },
            contact: { text: '📞 Contact', content: '' },
            info: { text: 'ℹ️ Info', content: '' },
            ...data.buttons
          },
          filters: {
            all: 'Tous les plugs',
            byService: 'Par service',
            byCountry: 'Par pays',
            ...data.filters
          },
          ...data
        }
        
        setConfig(mergedConfig)
        console.log('📊 Config merged successfully')
      } else {
        const errorText = await response.text()
        console.error('❌ Config fetch error:', response.status, errorText)
        toast.error(`Erreur lors du chargement: ${response.status}`)
      }
    } catch (error) {
      console.error('💥 Config fetch exception:', error)
      toast.error(`Erreur de connexion: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

        const saveConfig = async (retryCount = 0) => {
        const token = localStorage.getItem('adminToken')
        setSaving(true)

        try {
          console.log('💾 Sauvegarde configuration complète...', config)
          console.log('🔐 Token admin:', token ? `***${token.slice(-4)}` : 'Absent')
          console.log('🔄 Tentative:', retryCount + 1)
          
          // Valider le token
          if (!token) {
            throw new Error('Token d\'authentification manquant')
          }
          
          // Essayer l'API directe d'abord
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com'
          console.log('🌐 API Base URL:', apiBaseUrl)
          
          const response = await fetch(`${apiBaseUrl}/api/config`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            body: JSON.stringify(config),
            // Ajouter timeout et retry
            signal: AbortSignal.timeout(30000) // 30 secondes
          })

          console.log('📡 Réponse API:', response.status, response.statusText)

          if (response.ok) {
            const savedConfig = await response.json()
            console.log('✅ Configuration sauvegardée:', savedConfig)
            toast.success('Configuration sauvegardée avec succès !')
            
            // Forcer la synchronisation boutique
            forceBoutiqueSync()
            
            // Recharger le bot après sauvegarde
            setTimeout(() => {
              reloadBot();
            }, 1000);
            
          } else {
            const errorText = await response.text()
            console.error('❌ Erreur API directe:', response.status, errorText)
            
            // Fallback vers le proxy
            console.log('🔄 Tentative via proxy...')
            
            const proxyResponse = await fetch('/api/proxy?endpoint=/api/config', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
              },
              body: JSON.stringify({
                _method: 'PUT',
                ...config
              })
            })

            if (proxyResponse.ok) {
              console.log('✅ Configuration sauvegardée via proxy')
              toast.success('Configuration sauvegardée via proxy !')
              forceBoutiqueSync()
              setTimeout(() => {
                reloadBot();
              }, 1000);
            } else {
              const proxyError = await proxyResponse.text()
              console.error('❌ Erreur proxy:', proxyResponse.status, proxyError)
              throw new Error(`Erreur API et Proxy: ${response.status} / ${proxyResponse.status}`)
            }
          }
        } catch (error) {
          console.error('💥 Erreur sauvegarde config:', error)
          
          // Retry automatique pour les erreurs de réseau
          if ((error.message.includes('Load failed') || error.message.includes('fetch') || error.name === 'AbortError') 
              && retryCount < 2) {
            console.log('🔄 Retry automatique dans 2 secondes...')
            toast.info(`Retry ${retryCount + 1}/3 dans 2 secondes...`)
            
            setTimeout(() => {
              saveConfig(retryCount + 1)
            }, 2000)
            return
          }
          
          // Messages d'erreur spécifiques
          let errorMessage = 'Erreur lors de la sauvegarde'
          if (error.name === 'AbortError' || error.message.includes('timeout')) {
            errorMessage = 'Timeout: La sauvegarde a pris trop de temps'
          } else if (error.message.includes('Load failed') || error.message.includes('fetch')) {
            errorMessage = 'Erreur de connexion: Vérifiez votre réseau'
          } else if (error.message.includes('401')) {
            errorMessage = 'Erreur d\'authentification: Reconnectez-vous'
          } else if (error.message.includes('400')) {
            errorMessage = 'Données invalides: Vérifiez les champs'
          }
          
          toast.error(errorMessage)
        } finally {
          setSaving(false)
        }
      }

  // Fonction pour forcer la synchronisation avec la boutique
  const forceBoutiqueSync = async () => {
    try {
      console.log('🔄 Forcer la synchronisation boutique...');
      
      // Envoyer un signal aux pages boutique via localStorage
      const syncSignal = {
        timestamp: Date.now(),
        action: 'config_updated',
        config: config
      };
      
      localStorage.setItem('boutique_sync_signal', JSON.stringify(syncSignal));
      
      // Déclencher l'événement storage pour notifier les autres onglets
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'boutique_sync_signal',
        newValue: JSON.stringify(syncSignal)
      }));
      
      console.log('✅ Signal de synchronisation envoyé');
      toast.success('Synchronisation boutique déclenchée !');
      
    } catch (error) {
      console.error('❌ Erreur synchronisation boutique:', error);
    }
  };

  // Fonction pour tester la configuration boutique
  const testBoutiqueConfig = async () => {
    try {
      console.log('🧪 Test configuration boutique...');
      
      // Vérifier les éléments requis
      const requiredFields = {
        'Nom boutique': config?.boutique?.name,
        'Logo': config?.boutique?.logo,
        'Background': config?.boutique?.backgroundImage,
        'Message accueil': config?.welcome?.text
      };
      
      const missing = Object.entries(requiredFields)
        .filter(([key, value]) => !value)
        .map(([key]) => key);
      
      if (missing.length > 0) {
        toast.error(`Éléments manquants: ${missing.join(', ')}`);
        return false;
      }
      
      // Test de l'API publique
      const response = await fetch('/api/proxy?endpoint=/api/public/config', {
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const publicConfig = await response.json();
        console.log('✅ Configuration publique accessible:', publicConfig);
        toast.success('Configuration boutique testée avec succès !');
        return true;
      } else {
        throw new Error(`API publique: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Erreur test boutique:', error);
      toast.error('Erreur lors du test de la configuration boutique');
      return false;
    }
  };

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
      
      if (!token) {
        console.error('❌ Token manquant pour recharger le bot');
        return;
      }
      
      // Essayer l'API directe d'abord
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com';
        console.log('🌐 Rechargement bot via:', `${apiBaseUrl}/api/bot/reload`);
        
        const response = await fetch(`${apiBaseUrl}/api/bot/reload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Bot rechargé avec succès:', result);
          toast.success('Bot rechargé avec succès !');
        } else {
          const errorText = await response.text();
          console.error('❌ Erreur rechargement bot:', response.status, errorText);
          throw new Error(`Erreur ${response.status}: ${errorText}`);
        }
      } catch (directError) {
        console.log('❌ Rechargement direct échoué:', directError.message);
        console.log('🔄 Tentative proxy...');
        
        // Fallback vers le proxy
        const proxyResponse = await fetch('/api/reload-bot', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (proxyResponse.ok) {
          console.log('✅ Bot rechargé via proxy');
          toast.success('Bot rechargé via proxy !');
        } else {
          const proxyError = await proxyResponse.text();
          console.error('❌ Erreur proxy rechargement:', proxyResponse.status, proxyError);
          throw new Error(`Erreur proxy: ${proxyResponse.status}`);
        }
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
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-md">
              <p className="text-blue-800 text-sm">
                ℹ️ <strong>Info :</strong> Cette page configure uniquement le bot. Pour la boutique, utilisez <a href="/admin/configuration" className="underline font-medium">Configuration</a> dans le menu.
              </p>
            </div>
          </div>
        </div>

        {/* Contenu du mode visuel */}
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



               {/* Gestion des réseaux sociaux du message d'accueil */}
               <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                 <h3 className="text-lg font-medium text-purple-900 mb-3">📱 Réseaux Sociaux - Message d'Accueil</h3>
                 <p className="text-sm text-purple-700 mb-3">
                   Ajoutez des liens vers vos réseaux sociaux directement dans le message d'accueil du bot.
                 </p>
                 
                 <div className="space-y-2">
                   <a
                     href="/admin/config/welcome-social"
                     className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium inline-block text-center"
                   >
                     ⚙️ Gérer les réseaux sociaux d'accueil
                   </a>
                   
                   <button
                     onClick={() => editText('welcome', 'text', config.welcome?.text || '', 'Message d\'accueil du bot (/start)')}
                     className="w-full text-left bg-white border border-purple-300 rounded-lg p-3 hover:bg-purple-50 transition-colors"
                   >
                     <div className="text-sm font-medium text-purple-800">Message d'accueil Bot :</div>
                     <div className="text-purple-600 text-sm">{config.welcome?.text || '🌟 Bienvenue sur notre bot !'}</div>
                     <div className="text-xs text-purple-500 mt-1">Affiché quand on tape /start sur le bot</div>
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

        {/* Section de sauvegarde */}
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
                🔄 Recharger Bot
              </button>
              <button
                onClick={saveConfig}
                disabled={saving}
                className={`${saving ? 'bg-orange-500 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'} disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium transition-colors min-w-[120px]`}
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sauvegarde...
                  </span>
                ) : '💾 Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}