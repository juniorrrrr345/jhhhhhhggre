import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Fonction utilitaire pour appeler l'API avec fallback proxy
const apiCall = async (endpoint, options = {}) => {
  try {
    // Essai direct
    const directResponse = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (directResponse.ok) {
      return directResponse;
    }
  } catch (error) {
    console.log('API directe échouée, tentative avec proxy...');
  }

  // Fallback avec proxy
  try {
    const proxyResponse = await fetch(`/api/proxy?endpoint=${encodeURIComponent(endpoint)}`, {
      ...options,
      headers: {
        ...options.headers,
        'X-Proxy-Method': options.method || 'GET',
      },
    });
    return proxyResponse;
  } catch (error) {
    console.error('Échec API et proxy:', error);
    throw error;
  }
};

export default function EditPlug() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    telegramLink: '',
    vip: false,
    category: '',
    location: '',
    featured: false,
    active: true
  });

  // Charger les données de la boutique
  useEffect(() => {
    if (!id) return;
    
    const loadPlug = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        if (!token) {
          router.push('/');
          return;
        }

        const response = await apiCall(`/api/plugs/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (data && typeof data === 'object') {
          setFormData({
            name: data.name || '',
            description: data.description || '',
            image: data.image || '',
            telegramLink: data.telegramLink || '',
            vip: Boolean(data.vip),
            category: data.category || '',
            location: data.location || '',
            featured: Boolean(data.featured),
            active: data.active !== false
          });
        } else {
          throw new Error('Données invalides reçues du serveur');
        }
      } catch (err) {
        console.error('Erreur chargement boutique:', err);
        setError(`Erreur lors du chargement: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadPlug();
  }, [id, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    try {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du formulaire:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      const submitData = {
        ...formData
      };

      const response = await apiCall(`/api/plugs/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      setSuccess('Boutique modifiée avec succès !');
      setTimeout(() => {
        router.push(`/admin/plugs/${id}`);
      }, 2000);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      setError(`Erreur lors de la sauvegarde: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) {
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      const response = await apiCall(`/api/plugs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      setSuccess('Boutique supprimée avec succès !');
      setTimeout(() => {
        router.push('/admin/plugs');
      }, 1500);
    } catch (err) {
      console.error('Erreur suppression:', err);
      setError(`Erreur lors de la suppression: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <Head>
          <title>Modification boutique - Admin</title>
        </Head>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <Head>
        <title>Modifier boutique - Admin</title>
      </Head>
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/plugs')}
            className="text-gray-400 hover:text-white mb-4 flex items-center"
          >
            ← Retour aux boutiques
          </button>
          <h1 className="text-3xl font-bold">Modifier la boutique</h1>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/50 border border-green-500 text-green-200 p-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nom de la boutique *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom de la boutique"
              />
            </div>


          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Description de la boutique"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div>
              <label className="block text-sm font-medium mb-2">
                URL de l'image
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Lien Telegram */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Lien Telegram *
              </label>
              <input
                type="url"
                name="telegramLink"
                value={formData.telegramLink}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://t.me/boutique"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Localisation */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Localisation
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Paris, France, Online..."
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="vip"
                checked={formData.vip}
                onChange={handleInputChange}
                className="mr-2 rounded"
              />
              Boutique VIP
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="mr-2 rounded"
              />
              Boutique mise en avant
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="mr-2 rounded"
              />
              Boutique active
            </label>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b border-gray-600 pb-2">Services disponibles</h3>
            
            {/* Livraison */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="delivery-enabled"
                  checked={formData.services?.delivery?.enabled || false}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      services: {
                        ...prev.services,
                        delivery: {
                          ...prev.services?.delivery,
                          enabled: e.target.checked
                        }
                      }
                    }))
                  }}
                  className="mr-3 rounded"
                />
                <label htmlFor="delivery-enabled" className="text-lg font-medium">
                  🚚 Livraison
                </label>
              </div>
              {formData.services?.delivery?.enabled && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description du service de livraison
                  </label>
                  <input
                    type="text"
                    value={formData.services?.delivery?.description || ''}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        services: {
                          ...prev.services,
                          delivery: {
                            ...prev.services?.delivery,
                            description: e.target.value
                          }
                        }
                      }))
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Livraison rapide en moins de 2h dans Paris"
                  />
                </div>
              )}
            </div>

            {/* Envoi postal */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="postal-enabled"
                  checked={formData.services?.postal?.enabled || false}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      services: {
                        ...prev.services,
                        postal: {
                          ...prev.services?.postal,
                          enabled: e.target.checked
                        }
                      }
                    }))
                  }}
                  className="mr-3 rounded"
                />
                <label htmlFor="postal-enabled" className="text-lg font-medium">
                  ✈️ Envoi postal
                </label>
              </div>
              {formData.services?.postal?.enabled && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description du service d'envoi postal
                  </label>
                  <input
                    type="text"
                    value={formData.services?.postal?.description || ''}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        services: {
                          ...prev.services,
                          postal: {
                            ...prev.services?.postal,
                            description: e.target.value
                          }
                        }
                      }))
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Envoi postal sécurisé dans toute la France"
                  />
                </div>
              )}
            </div>

            {/* Meetup */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="meetup-enabled"
                  checked={formData.services?.meetup?.enabled || false}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      services: {
                        ...prev.services,
                        meetup: {
                          ...prev.services?.meetup,
                          enabled: e.target.checked
                        }
                      }
                    }))
                  }}
                  className="mr-3 rounded"
                />
                <label htmlFor="meetup-enabled" className="text-lg font-medium">
                  🏠 Meetup
                </label>
              </div>
              {formData.services?.meetup?.enabled && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description du service de meetup
                  </label>
                  <input
                    type="text"
                    value={formData.services?.meetup?.description || ''}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        services: {
                          ...prev.services,
                          meetup: {
                            ...prev.services?.meetup,
                            description: e.target.value
                          }
                        }
                      }))
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Rendez-vous possible dans les lieux publics"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/admin/plugs')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
            
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {saving ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}