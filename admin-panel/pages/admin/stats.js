import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-hot-toast';

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Essayer d'abord l'API directe
      let data;
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com';
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch(`${apiBaseUrl}/api/stats`, {
          headers: {
            'Authorization': token // Proxy gère Bearer automatiquement,
            'Cache-Control': 'no-cache'
          }
        });

        if (response.ok) {
          data = await response.json();
          console.log('✅ Stats API directe réussie');
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (directError) {
        console.log('❌ Stats API directe échouée:', directError.message);
        console.log('🔄 Stats tentative via proxy...');
        
        // Fallback vers le proxy
        const token = localStorage.getItem('adminToken');
        const proxyResponse = await fetch('/api/proxy?endpoint=/api/stats', {
          headers: {
            'Authorization': token,
            'Cache-Control': 'no-cache'
          }
        });

        if (proxyResponse.ok) {
          data = await proxyResponse.json();
          console.log('✅ Stats proxy réussi');
        } else {
          throw new Error(`Stats proxy failed: HTTP ${proxyResponse.status}`);
        }
      }

      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Statistiques - Admin Panel</title>
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
                  <h1 className="text-2xl font-bold text-gray-900">📊 Statistiques</h1>
                  <p className="text-sm text-gray-600">Aperçu des performances</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Plugs */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">🔌</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Plugs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPlugs || 0}</p>
                  </div>
                </div>
              </div>

              {/* Plugs Actifs */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">✅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Plugs Actifs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activePlugs || 0}</p>
                  </div>
                </div>
              </div>

              {/* Plugs VIP */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">⭐</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Plugs VIP</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.vipPlugs || 0}</p>
                  </div>
                </div>
              </div>

              {/* Total Likes */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">❤️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Likes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalLikes || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Erreur de chargement</h3>
              <p className="text-gray-500 mb-4">Impossible de charger les statistiques</p>
              <button
                onClick={fetchStats}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}