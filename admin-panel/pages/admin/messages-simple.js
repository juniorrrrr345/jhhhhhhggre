import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-hot-toast';

export default function MessagesSimplePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({
    welcome: { text: '', image: '' },
    botTexts: {
      topPlugsTitle: '',
      topPlugsDescription: ''
    },
    buttons: {
      topPlugs: { text: '' },
      contact: { text: '', content: '' }
    },
    filters: {
      all: '',
      byService: '',
      byCountry: ''
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

    // Simuler le chargement
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [mounted, router]);

  const updateConfig = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateNestedConfig = (section, subsection, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const saveConfig = () => {
    toast.success('Configuration sauvegardée (mode test)');
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
        <title>Messages (Simple) - Admin Panel</title>
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
                  <h1 className="text-2xl font-bold text-gray-900">💬 Messages (Simple)</h1>
                  <p className="text-sm text-gray-600">Version simplifiée pour test</p>
                </div>
              </div>
              <button
                onClick={saveConfig}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              </div>
            </div>

            {/* Textes des boutons */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">🔘 Textes des Boutons</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bouton "Top Des Plugs"
                  </label>
                  <input
                    type="text"
                    value={config.buttons?.topPlugs?.text || ''}
                    onChange={(e) => updateNestedConfig('buttons', 'topPlugs', 'text', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="🔌 Top Des Plugs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bouton "Tous les plugs"
                  </label>
                  <input
                    type="text"
                    value={config.filters?.all || ''}
                    onChange={(e) => updateConfig('filters', 'all', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="📋 Tous les plugs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bouton "Par service"
                  </label>
                  <input
                    type="text"
                    value={config.filters?.byService || ''}
                    onChange={(e) => updateConfig('filters', 'byService', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="🔍 Filtrer par service"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bouton "Par pays"
                  </label>
                  <input
                    type="text"
                    value={config.filters?.byCountry || ''}
                    onChange={(e) => updateConfig('filters', 'byCountry', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="🌍 Filtrer par pays"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-end">
                <button
                  onClick={saveConfig}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  💾 Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}