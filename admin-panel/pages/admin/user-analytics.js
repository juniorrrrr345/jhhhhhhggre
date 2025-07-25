import { useState, useEffect } from 'react'
import Head from 'next/head'
import AdminLayout from '../../components/AdminLayout'
import { simpleApi as api } from '../../lib/api-simple'

export default function UserAnalytics() {
  const [stats, setStats] = useState({
    countryStats: [],
    totalUsers: 0,
    usersWithLocation: 0,
    loading: true,
    lastUpdate: null
  })
  const [timeRange, setTimeRange] = useState('all') // all, 30d, 7d, 1d

  useEffect(() => {
    fetchUserStats()
    
    // Rafraîchissement automatique toutes les 30 secondes
    const interval = setInterval(() => {
      console.log('🔄 Rafraîchissement automatique des stats...')
      fetchUserStats()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [timeRange])

  const fetchUserStats = async () => {
    try {
      console.log(`🔄 Chargement stats utilisateurs pour période: ${timeRange}`)
      setStats(prev => ({ ...prev, loading: true }))
      
      const response = await api.get(`/admin/user-analytics?timeRange=${timeRange}`)
      console.log('📊 Response API user-analytics:', response)
      
      if (response.ok) {
        console.log('✅ Stats reçues:', response.data)
        setStats({
          ...response.data,
          loading: false,
          lastUpdate: new Date()
        })
      } else {
        console.error('❌ Erreur lors du chargement des stats utilisateurs:', response)
        setStats(prev => ({ ...prev, loading: false }))
      }
    } catch (error) {
      console.error('❌ Erreur stats utilisateurs:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  const getCountryFlag = (countryCode) => {
    const flagMap = {
      'FR': '🇫🇷', 'BE': '🇧🇪', 'CH': '🇨🇭', 'CA': '🇨🇦', 
      'DE': '🇩🇪', 'ES': '🇪🇸', 'IT': '🇮🇹', 'PT': '🇵🇹',
      'GB': '🇬🇧', 'NL': '🇳🇱', 'US': '🇺🇸', 'MA': '🇲🇦',
      'DZ': '🇩🇿', 'TN': '🇹🇳', 'LU': '🇱🇺', 'AT': '🇦🇹'
    }
    return flagMap[countryCode] || '🌍'
  }

  const getLocationCoverage = () => {
    if (stats.totalUsers === 0) return 0
    return Math.round((stats.usersWithLocation / stats.totalUsers) * 100)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
  }

  if (stats.loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96 text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <div>⏳ Chargement des statistiques utilisateurs...</div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Head>
        <title>Analyse Géographique - Administration</title>
      </Head>

      <div className="p-4 lg:p-6 text-white min-h-screen">
        {/* Header Mobile-First */}
        <div className="mb-6">
          <div className="bg-gray-800 rounded-xl border-2 border-green-500 p-4 mb-4">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white text-center">
              🌍 📊 ANALYSE GÉOGRAPHIQUE 🌍
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={fetchUserStats}
              disabled={stats.loading}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {stats.loading ? '⏳ Chargement...' : '🔄 Actualiser'}
            </button>
            
            {stats.lastUpdate && (
              <div className="text-gray-400 text-sm text-center sm:text-left">
                📅 MAJ: {stats.lastUpdate.toLocaleTimeString('fr-FR')}
              </div>
            )}
          </div>
        </div>

        {/* Filtres temporels - Mobile Responsive */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3 text-center sm:text-left">Période :</h3>
          <div className="grid grid-cols-2 sm:flex gap-2">
            {[
              { value: 'all', label: 'Tout' },
              { value: '30d', label: '30 jours' },
              { value: '7d', label: '7 jours' },
              { value: '1d', label: '24h' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  timeRange === option.value 
                    ? 'bg-green-600 text-white font-bold' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques générales - Cards responsives */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
            <h4 className="text-green-500 mb-2 font-semibold">👥 Total Utilisateurs</h4>
            <div className="text-3xl font-bold text-white">{stats.totalUsers || 0}</div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
            <h4 className="text-blue-500 mb-2 font-semibold">📍 Localisés</h4>
            <div className="text-3xl font-bold text-white">{stats.usersWithLocation || 0}</div>
            <div className="text-sm text-blue-400 mt-1">
              {getLocationCoverage()}% de couverture
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center sm:col-span-2 lg:col-span-1">
            <h4 className="text-yellow-500 mb-2 font-semibold">🌍 Pays Détectés</h4>
            <div className="text-3xl font-bold text-white">{stats.countryStats?.length || 0}</div>
          </div>
        </div>

        {/* Barre de progression de couverture */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
          <h3 className="mb-4 text-white font-semibold text-center sm:text-left">📈 Couverture Géolocalisation</h3>
          
          <div className="bg-gray-700 rounded-lg overflow-hidden h-6 mb-3">
            <div 
              className="bg-green-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${getLocationCoverage()}%` }}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-400 gap-2">
            <span className="text-center sm:text-left">{stats.usersWithLocation} utilisateurs localisés</span>
            <span className="text-center sm:text-right">{getLocationCoverage()}% de couverture</span>
          </div>
        </div>

        {/* Graphique par pays - Mobile optimisé */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
          <h3 className="mb-4 text-white font-semibold text-center sm:text-left">🗺️ Répartition par Pays</h3>
          
          {stats.countryStats?.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">🌍</div>
              <div>Aucune donnée de géolocalisation disponible</div>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.countryStats?.map((country, index) => {
                const percentage = Math.round((country.count / stats.usersWithLocation) * 100)
                
                return (
                  <div key={`${country.countryCode}-${index}`} className={`
                    flex flex-col sm:flex-row items-start sm:items-center justify-between 
                    p-4 rounded-lg transition-all
                    ${index < 3 ? 'bg-gray-700 border border-green-500' : 'bg-gray-700 border border-gray-600'}
                  `}>
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      <span className="text-2xl">{getCountryFlag(country.countryCode)}</span>
                      <div>
                        <div className="font-semibold text-white text-sm sm:text-base">
                          {country.country}
                        </div>
                        {country.latestUser && (
                          <div className="text-xs text-gray-400">
                            Dernier: {formatDate(country.latestUser)}
                          </div>
                        )}
                      </div>
                      
                      {/* Badge TOP mobile */}
                      {index < 3 && (
                        <div className="bg-green-500 text-black px-2 py-1 rounded-full text-xs font-bold ml-auto sm:hidden">
                          TOP {index + 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                      <div className="text-right">
                        <div className={`text-lg font-bold ${index < 3 ? 'text-green-500' : 'text-white'}`}>
                          {country.count}
                        </div>
                        <div className="text-xs text-gray-400">
                          {percentage}%
                        </div>
                      </div>
                      
                      {/* Badge TOP desktop */}
                      {index < 3 && (
                        <div className="hidden sm:block bg-green-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                          TOP {index + 1}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Note technique */}
        <div className="bg-blue-900 border border-blue-700 p-4 rounded-lg text-blue-200 text-sm">
          <div className="font-semibold mb-2">ℹ️ Note technique</div>
          <div>
            La géolocalisation est détectée via l'IP du serveur (approximation). 
            Pour une précision optimale, il faudrait l'IP réelle des utilisateurs via une intégration Telegram Web App.
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}