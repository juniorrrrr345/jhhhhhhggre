import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-hot-toast';

export default function VisualConfig() {
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [editingField, setEditingField] = useState(null);

  // Structure par défaut
  const getDefaultConfig = () => ({
    welcome: { 
      text: '🎉 Bienvenue sur notre bot premium !', 
      image: 'https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Bot+Image' 
    },
    buttons: {
      topPlugs: { text: '🔌 Top Des Plugs' },
      vipPlugs: { text: '⭐ Boutiques VIP' },
      contact: { text: '💬 Contact', content: 'Contactez-nous pour plus d\'informations !' },
      info: { text: 'ℹ️ Informations', content: 'Découvrez notre plateforme premium.' }
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    
    fetchConfig();
  }, [router, mounted]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      
      let data;
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com';
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch(`${apiBaseUrl}/api/config`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        });

        if (response.ok) {
          data = await response.json();
          console.log('✅ Visual config API directe réussie');
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (directError) {
        console.log('❌ Visual config API directe échouée, tentative proxy...');
        
        const token = localStorage.getItem('adminToken');
        const proxyResponse = await fetch('/api/proxy?endpoint=/api/config', {
          headers: {
            'Authorization': token,
            'Cache-Control': 'no-cache'
          }
        });

        if (proxyResponse.ok) {
          data = await proxyResponse.json();
          console.log('✅ Visual config proxy réussi');
        } else {
          throw new Error(`Visual config proxy failed: HTTP ${proxyResponse.status}`);
        }
      }

      if (data && typeof data === 'object') {
        const defaultConfig = getDefaultConfig();
        const mergedConfig = {
          ...defaultConfig,
          ...data,
          welcome: { ...defaultConfig.welcome, ...(data.welcome || {}) },
          buttons: {
            ...defaultConfig.buttons,
            ...(data.buttons || {}),
            topPlugs: { ...defaultConfig.buttons.topPlugs, ...(data.buttons?.topPlugs || {}) },
            vipPlugs: { ...defaultConfig.buttons.vipPlugs, ...(data.buttons?.vipPlugs || {}) },
            contact: { ...defaultConfig.buttons.contact, ...(data.buttons?.contact || {}) },
            info: { ...defaultConfig.buttons.info, ...(data.buttons?.info || {}) }
          }
        };
        setConfig(mergedConfig);
      } else {
        setConfig(getDefaultConfig());
        toast.error('Utilisation de la configuration par défaut');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la config:', error);
      setConfig(getDefaultConfig());
      toast.error('Erreur lors du chargement, configuration par défaut utilisée');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    const token = localStorage.getItem('adminToken');
    setSaving(true);

    try {
      let success = false;
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com';
        console.log('💾 Visual config tentative directe:', apiBaseUrl);
        
        const response = await fetch(`${apiBaseUrl}/api/config`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(config)
        });

        if (response.ok) {
          console.log('✅ Visual config direct réussi');
          success = true;
          toast.success('Configuration sauvegardée !');
          
          setTimeout(() => {
            reloadBot();
          }, 1000);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (directError) {
        console.log('❌ Visual config direct échoué, tentative proxy...');
        
        const proxyResponse = await fetch('/api/proxy?endpoint=/api/config', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify(config)
        });

        if (proxyResponse.ok) {
          console.log('✅ Visual config proxy réussi');
          success = true;
          toast.success('Configuration sauvegardée via proxy !');
          
          setTimeout(() => {
            reloadBot();
          }, 1500);
        } else {
          throw new Error(`Proxy failed: HTTP ${proxyResponse.status}`);
        }
      }

      if (!success) {
        toast.error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('💥 Visual config error final:', error);
      toast.error('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const reloadBot = async () => {
    const token = localStorage.getItem('adminToken');

    try {
      console.log('🔄 Rechargement du bot...');
      
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
          toast.success('Bot rechargé avec succès !');
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (directError) {
        console.log('❌ Rechargement direct échoué, tentative proxy...');
        
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
          throw new Error(`Proxy failed: HTTP ${proxyResponse.status}`);
        }
      }
    } catch (error) {
      console.error('💥 Erreur rechargement bot:', error);
      toast.error('Erreur de connexion');
    }
  };

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
    const newUrl = prompt("URL de l'image d'accueil:", config.welcome.image);
    if (newUrl !== null && newUrl !== config.welcome.image) {
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Initialisation...</p>
        </div>
      </div>
    );
  }

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎨</div>
          <p className="text-gray-600">Chargement de l'éditeur visuel...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Éditeur Visuel - Admin Panel</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/admin')}
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">🎨 Éditeur Visuel</h1>
                  <p className="text-sm text-gray-600">Modifiez votre bot en cliquant directement sur les éléments</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={reloadBot}
                  disabled={saving}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  🔄 Recharger Bot
                </button>
                <button
                  onClick={saveConfig}
                  disabled={saving}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Instructions */}
            <div className="lg:w-1/3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-3">💡 Comment ça marche ?</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• 🖼️ Cliquez sur l'image pour la changer</li>
                  <li>• 📝 Cliquez sur le message pour l'éditer</li>
                  <li>• 🔘 Cliquez sur les boutons pour modifier leur texte</li>
                  <li>• 💾 N'oubliez pas de sauvegarder !</li>
                </ul>
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
                    src={config.welcome.image} 
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
                    onClick={() => editText('welcome', 'text', config.welcome.text, 'Message d\'accueil')}
                    className="bg-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors group relative"
                  >
                    <p className="text-gray-800">{config.welcome.text}</p>
                    <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity">
                      ✏️
                    </span>
                  </div>
                </div>

                {/* Boutons éditables */}
                <div className="p-4 space-y-3">
                  {Object.entries(config.buttons).map(([key, button]) => {
                    const buttonLabels = {
                      topPlugs: 'Bouton "Top Des Plugs"',
                      vipPlugs: 'Bouton "Boutiques VIP"',
                      contact: 'Bouton "Contact"',
                      info: 'Bouton "Informations"'
                    };

                    return (
                      <button
                        key={key}
                        onClick={() => editNestedText('buttons', key, 'text', button.text, buttonLabels[key])}
                        className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors relative group"
                      >
                        {button.text}
                        <span className="opacity-0 group-hover:opacity-100 absolute right-3 top-1/2 transform -translate-y-1/2 transition-opacity">
                          ✏️
                        </span>
                      </button>
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
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">💾 Sauvegarde</h3>
                <p className="text-sm text-gray-600">Appliquez vos modifications au bot Telegram</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={reloadBot}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  🔄 Recharger Bot
                </button>
                <button
                  onClick={saveConfig}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {saving ? 'Sauvegarde...' : '💾 Sauvegarder & Appliquer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}