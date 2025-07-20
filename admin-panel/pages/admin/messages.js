import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-hot-toast';

export default function MessagesPage() {
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    
    fetchConfig();
  }, [router]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      
      // Essayer d'abord l'API directe
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
          console.log('✅ Messages config API directe réussie');
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (directError) {
        console.log('❌ Messages config API directe échouée:', directError.message);
        console.log('🔄 Messages config tentative via proxy...');
        
        // Fallback vers le proxy
        const token = localStorage.getItem('adminToken');
        const proxyResponse = await fetch('/api/proxy?endpoint=/api/config', {
          headers: {
            'Authorization': token,
            'Cache-Control': 'no-cache'
          }
        });

        if (proxyResponse.ok) {
          data = await proxyResponse.json();
          console.log('✅ Messages config proxy réussi');
        } else {
          throw new Error(`Messages config proxy failed: HTTP ${proxyResponse.status}`);
        }
      }

      setConfig(data);
    } catch (error) {
      console.error('Erreur lors du chargement de la config:', error);
      toast.error('Erreur lors du chargement de la configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    const token = localStorage.getItem('adminToken');
    setSaving(true);

    try {
      // Essayer d'abord l'API directe
      let success = false;
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com';
        console.log('💾 Messages config tentative directe:', apiBaseUrl);
        
        const response = await fetch(`${apiBaseUrl}/api/config`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(config)
        });

        if (response.ok) {
          console.log('✅ Messages config direct réussi');
          success = true;
          toast.success('Messages sauvegardés !');
          
          // Recharger automatiquement le bot après sauvegarde
          setTimeout(() => {
            reloadBot();
          }, 1000);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (directError) {
        console.log('❌ Messages config direct échoué:', directError.message);
        console.log('🔄 Messages config tentative via proxy...');
        
        // Fallback vers le proxy
        const proxyResponse = await fetch('/api/proxy?endpoint=/api/config', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify(config)
        });

        if (proxyResponse.ok) {
          console.log('✅ Messages config proxy réussi');
          success = true;
          toast.success('Messages sauvegardés via proxy !');
          
          // Recharger automatiquement le bot après sauvegarde
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
      console.error('💥 Messages config error final:', error);
      toast.error('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Fonction pour recharger le bot
  const reloadBot = async () => {
    const token = localStorage.getItem('adminToken');
    setSaving(true);

    try {
      console.log('🔄 Rechargement du bot...');
      
      // Essayer l'API directe d'abord
      let success = false;
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
          success = true;
          toast.success('Bot rechargé avec succès !');
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (directError) {
        console.log('❌ Rechargement direct échoué:', directError.message);
        
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
          success = true;
          toast.success('Bot rechargé via proxy !');
        } else {
          throw new Error(`Proxy failed: HTTP ${proxyResponse.status}`);
        }
      }

      if (!success) {
        toast.error('Erreur lors du rechargement du bot');
      }
    } catch (error) {
      console.error('💥 Erreur rechargement bot:', error);
      toast.error('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-gray-600">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Messages - Admin Panel</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/admin')}
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">💬 Messages</h1>
                  <p className="text-sm text-gray-600">Configuration des messages du bot</p>
                </div>
              </div>
              <button
                onClick={saveConfig}
                disabled={saving}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {config && (
            <div className="space-y-8">
              {/* Message d'accueil */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">🌟 Message d'accueil</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texte du message d'accueil
                    </label>
                    <textarea
                      value={config.welcome?.text || ''}
                      onChange={(e) => updateConfig('welcome', 'text', e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Bienvenue sur notre bot..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image d'accueil (URL)
                    </label>
                    <input
                      type="url"
                      value={config.welcome?.image || ''}
                      onChange={(e) => updateConfig('welcome', 'image', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Configuration boutique */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">🏪 Configuration Boutique</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la boutique
                    </label>
                    <input
                      type="text"
                      value={config.boutique?.name || ''}
                      onChange={(e) => updateConfig('boutique', 'name', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ma Boutique VIP"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo de la boutique (URL)
                    </label>
                    <input
                      type="url"
                      value={config.boutique?.logo || ''}
                      onChange={(e) => updateConfig('boutique', 'logo', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sous-titre de la boutique
                    </label>
                    <input
                      type="text"
                      value={config.boutique?.subtitle || ''}
                      onChange={(e) => updateConfig('boutique', 'subtitle', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Votre sélection de boutiques premium"
                    />
                  </div>
                </div>
              </div>

              {/* Textes du bot */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">🤖 Textes du Bot</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre VIP
                    </label>
                    <input
                      type="text"
                      value={config.botTexts?.vipTitle || ''}
                      onChange={(e) => updateConfig('botTexts', 'vipTitle', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="👑 Boutiques VIP Premium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description VIP
                    </label>
                    <input
                      type="text"
                      value={config.botTexts?.vipDescription || ''}
                      onChange={(e) => updateConfig('botTexts', 'vipDescription', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="✨ Découvrez nos boutiques sélectionnées"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre Top Plugs
                    </label>
                    <input
                      type="text"
                      value={config.botTexts?.topPlugsTitle || ''}
                      onChange={(e) => updateConfig('botTexts', 'topPlugsTitle', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="🔌 Top Des Plugs"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description Top Plugs
                    </label>
                    <input
                      type="text"
                      value={config.botTexts?.topPlugsDescription || ''}
                      onChange={(e) => updateConfig('botTexts', 'topPlugsDescription', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Choisissez une option pour découvrir nos plugs :"
                    />
                  </div>
                </div>
              </div>

              {/* Textes des boutons */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">🔘 Textes des Boutons</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bouton Top Plugs
                    </label>
                    <input
                      type="text"
                      value={config.buttons?.topPlugs?.text || ''}
                      onChange={(e) => updateConfig('buttons', 'topPlugs', { 
                        ...config.buttons?.topPlugs, 
                        text: e.target.value 
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="🔌 Top Des Plugs"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bouton Boutiques VIP
                    </label>
                    <input
                      type="text"
                      value={config.buttons?.vipPlugs?.text || ''}
                      onChange={(e) => updateConfig('buttons', 'vipPlugs', { 
                        ...config.buttons?.vipPlugs, 
                        text: e.target.value 
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="🛍️ Boutiques VIP"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bouton Contact
                    </label>
                    <input
                      type="text"
                      value={config.buttons?.contact?.text || ''}
                      onChange={(e) => updateConfig('buttons', 'contact', { 
                        ...config.buttons?.contact, 
                        text: e.target.value 
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="📞 Contact"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bouton Info
                    </label>
                    <input
                      type="text"
                      value={config.buttons?.info?.text || ''}
                      onChange={(e) => updateConfig('buttons', 'info', { 
                        ...config.buttons?.info, 
                        text: e.target.value 
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ℹ️ Info"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre Tous les Plugs
                    </label>
                    <input
                      type="text"
                      value={config.botTexts?.allPlugsTitle || ''}
                      onChange={(e) => updateConfig('botTexts', 'allPlugsTitle', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="📋 Tous nos plugs :"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre Filtrer par Service
                    </label>
                    <input
                      type="text"
                      value={config.botTexts?.filterServiceTitle || ''}
                      onChange={(e) => updateConfig('botTexts', 'filterServiceTitle', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="🔍 Filtrer par service"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description Filtrer par Service
                    </label>
                    <input
                      type="text"
                      value={config.botTexts?.filterServiceDescription || ''}
                      onChange={(e) => updateConfig('botTexts', 'filterServiceDescription', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Choisissez le type de service :"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre Filtrer par Pays
                    </label>
                    <input
                      type="text"
                      value={config.botTexts?.filterCountryTitle || ''}
                      onChange={(e) => updateConfig('botTexts', 'filterCountryTitle', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="🌍 Filtrer par pays"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description Filtrer par Pays
                    </label>
                    <input
                      type="text"
                      value={config.botTexts?.filterCountryDescription || ''}
                      onChange={(e) => updateConfig('botTexts', 'filterCountryDescription', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Choisissez un pays :"
                    />
                  </div>
                </div>
              </div>

              {/* Messages de contact et info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">📞 Messages Contact & Info</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message de contact
                    </label>
                    <textarea
                      value={config.buttons?.contact?.content || ''}
                      onChange={(e) => updateConfig('buttons', 'contact', { 
                        ...config.buttons?.contact, 
                        content: e.target.value 
                      })}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Contactez-nous pour plus d'informations..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message d'information
                    </label>
                    <textarea
                      value={config.buttons?.info?.content || ''}
                      onChange={(e) => updateConfig('buttons', 'info', { 
                        ...config.buttons?.info, 
                        content: e.target.value 
                      })}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Informations sur notre service..."
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={reloadBot}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    🔄 Recharger Bot
                  </button>
                  <button
                    onClick={saveConfig}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}