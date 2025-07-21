import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { HeartIcon, PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

export default function PlugDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [plug, setPlug] = useState(null);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);

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
        setPlug(data);
        setLiked(data.liked || false);
      } catch (err) {
        console.error('Erreur chargement boutique:', err);
        setError(`Erreur lors du chargement: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadPlug();
  }, [id, router]);

  const handleLike = async () => {
    if (liking) return;
    
    try {
      setLiking(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      const response = await apiCall(`/api/plugs/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setPlug(prev => ({
          ...prev,
          likesCount: data.likesCount
        }));
      }
    } catch (err) {
      console.error('Erreur like:', err);
    } finally {
      setLiking(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/plugs');
  };

  const handleEdit = () => {
    router.push(`/admin/plugs/${id}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <Head>
          <title>Détails boutique - Admin</title>
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

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <Head>
          <title>Erreur - Admin</title>
        </Head>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="text-gray-400 hover:text-white mb-4 flex items-center"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Retour aux boutiques
          </button>
          
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Erreur</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!plug) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <Head>
          <title>Boutique introuvable - Admin</title>
        </Head>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="text-gray-400 hover:text-white mb-4 flex items-center"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Retour aux boutiques
          </button>
          
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-400">Boutique introuvable</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <Head>
        <title>{plug.name} - Admin</title>
      </Head>
      
      <div className="max-w-4xl mx-auto">
        {/* Header avec boutons */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleBack}
            className="text-gray-400 hover:text-white flex items-center transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Retour aux boutiques
          </button>
          
          <button
            onClick={handleEdit}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Modifier
          </button>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image et infos principales */}
          <div className="lg:col-span-1">
            {plug.image && (
              <div className="mb-6">
                <img
                  src={plug.image}
                  alt={plug.name}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Statut et badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {plug.vip && (
                  <span className="bg-yellow-600 text-yellow-100 px-3 py-1 rounded-full text-sm font-medium">
                    VIP
                  </span>
                )}
                {plug.featured && (
                  <span className="bg-purple-600 text-purple-100 px-3 py-1 rounded-full text-sm font-medium">
                    Mise en avant
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  plug.active 
                    ? 'bg-green-600 text-green-100' 
                    : 'bg-red-600 text-red-100'
                }`}>
                  {plug.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              {plug.category && (
                <p className="text-gray-400">
                  <span className="font-medium">Catégorie:</span> {plug.category}
                </p>
              )}
              
              {plug.price && (
                <p className="text-gray-400">
                  <span className="font-medium">Prix:</span> {plug.price}
                </p>
              )}
              
              {plug.location && (
                <p className="text-gray-400">
                  <span className="font-medium">Localisation:</span> {plug.location}
                </p>
              )}
            </div>
          </div>

          {/* Détails */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-4">{plug.name}</h1>
              <p className="text-gray-300 leading-relaxed">{plug.description}</p>
            </div>

            {/* Services */}
            {(plug.services?.livraison || plug.services?.postal || plug.services?.meetup) && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3">Services :</h3>
                <div className="space-y-2">
                  {plug.services?.livraison && (
                    <div className="flex items-center">
                      <span className="w-24 text-gray-400">Livraison:</span>
                      <span>{plug.services.livraison}</span>
                    </div>
                  )}
                  {plug.services?.postal && (
                    <div className="flex items-center">
                      <span className="w-24 text-gray-400">Envoi postal:</span>
                      <span>{plug.services.postal}</span>
                    </div>
                  )}
                  {plug.services?.meetup && (
                    <div className="flex items-center">
                      <span className="w-24 text-gray-400">Meetup:</span>
                      <span>{plug.services.meetup}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pays desservis */}
            {plug.countries && plug.countries.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3">Pays desservis :</h3>
                <p>{plug.countries.join(', ')}</p>
              </div>
            )}

            {/* Tags */}
            {plug.tags && plug.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3">Tags :</h3>
                <div className="flex flex-wrap gap-2">
                  {plug.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            {plug.contact && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3">Contact :</h3>
                <p className="text-gray-300">{plug.contact}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-700">
              {plug.telegramLink && (
                <a
                  href={plug.telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Voir sur Telegram
                </a>
              )}
              
              <button
                onClick={handleLike}
                disabled={liking}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  liked
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {liked ? (
                  <HeartSolidIcon className="h-5 w-5 mr-2" />
                ) : (
                  <HeartIcon className="h-5 w-5 mr-2" />
                )}
                {liking ? 'Chargement...' : (liked ? 'Aimé' : 'Liker cette boutique')}
                {plug.likesCount > 0 && (
                  <span className="ml-2 text-sm">({plug.likesCount})</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bouton de retour en bas */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <button
            onClick={handleBack}
            className="w-full bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            BACK - Retour aux boutiques
          </button>
        </div>
      </div>
    </div>
  );
}