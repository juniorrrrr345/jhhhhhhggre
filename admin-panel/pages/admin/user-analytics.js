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
  const [nextUpdateIn, setNextUpdateIn] = useState(30)

  useEffect(() => {
    fetchUserStats()
    
    // Rafraîchissement automatique toutes les 30 secondes
    const interval = setInterval(() => {
      console.log('🔄 Rafraîchissement automatique des stats...')
      fetchUserStats()
      setNextUpdateIn(30) // Reset le compteur
    }, 30000)
    
    // Compteur pour la prochaine mise à jour
    const countdownInterval = setInterval(() => {
      setNextUpdateIn(prev => prev > 0 ? prev - 1 : 30)
    }, 1000)
    
    return () => {
      clearInterval(interval)
      clearInterval(countdownInterval)
    }
  }, [timeRange])

  const fetchUserStats = async () => {
    try {
      console.log(`🔄 Chargement stats utilisateurs pour période: ${timeRange}`)
      setStats(prev => ({ ...prev, loading: true }))
      setNextUpdateIn(30) // Reset le compteur lors de l'actualisation manuelle
      
      // Bypass du proxy - appel direct à l'API bot
      const botApiUrl = 'https://jhhhhhhggre.onrender.com'
      const response = await fetch(`${botApiUrl}/api/admin/user-analytics?timeRange=${timeRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      console.log('📊 Response direct API:', data)
      
      const apiResponse = {
        ok: response.ok,
        data: data
      }
              console.log('📊 Response API user-analytics:', apiResponse)
        
        if (apiResponse.ok) {
          console.log('✅ Stats reçues:', apiResponse.data)
        setStats({
          ...apiResponse.data,
          loading: false,
          lastUpdate: new Date()
        })
      } else {
        console.error('❌ Erreur lors du chargement des stats utilisateurs:', apiResponse)
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

      <div className="p-4 lg:p-6 text-white min-h-screen bg-gray-900">
        {/* Header Mobile-First */}
        <div className="mb-6">
          <div className="bg-gray-800 rounded-xl border-2 border-green-500 p-4 mb-4">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-black text-center bg-white rounded-lg p-2">
              🌍 📊 ANALYSE GÉOGRAPHIQUE 🌍
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={fetchUserStats}
              disabled={stats.loading}
              className="w-full sm:w-auto px-4 py-2 bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors border-2 border-white"
            >
              {stats.loading ? '⏳ Chargement...' : '🔄 Actualiser'}
            </button>
            
            {stats.lastUpdate && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="text-black bg-white rounded px-2 py-1 text-sm text-center sm:text-left">
                  📅 MAJ: {stats.lastUpdate.toLocaleTimeString('fr-FR')}
                </div>
                <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1 bg-white rounded px-2 py-1 border border-black">
                      <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                      <span className="text-black text-xs font-medium">TEMPS RÉEL</span>
                    </div>
                    <div className="text-white bg-black rounded px-2 py-1 text-xs font-medium border border-white">
                      ⏱️ {nextUpdateIn}s
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filtres temporels - Mobile Responsive */}
        <div className="mb-6">
          <h3 className="text-black font-semibold mb-3 text-center sm:text-left bg-white rounded px-3 py-1 inline-block">Période :</h3>
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
                    ? 'bg-black text-white font-bold border-2 border-white' 
                    : 'bg-white text-black border-2 border-black hover:bg-gray-100'
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
            <h4 className="text-black mb-2 font-semibold bg-white rounded px-2 py-1 inline-block">👥 Total Utilisateurs</h4>
            <div className="text-3xl font-bold text-white bg-black rounded px-3 py-2 inline-block border-2 border-white">{stats.totalUsers || 0}</div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
            <h4 className="text-black mb-2 font-semibold bg-white rounded px-2 py-1 inline-block">📍 Localisés</h4>
            <div className="text-3xl font-bold text-white bg-black rounded px-3 py-2 inline-block border-2 border-white">{stats.usersWithLocation || 0}</div>
            <div className="text-sm text-white bg-black rounded px-2 py-1 mt-2 inline-block">
              {getLocationCoverage()}% de couverture
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center sm:col-span-2 lg:col-span-1">
            <h4 className="text-black mb-2 font-semibold bg-white rounded px-2 py-1 inline-block">🌍 Pays Détectés</h4>
            <div className="text-3xl font-bold text-white bg-black rounded px-3 py-2 inline-block border-2 border-white">{stats.countryStats?.length || 0}</div>
          </div>
        </div>

        {/* Barre de progression de couverture */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
          <h3 className="mb-4 text-black font-semibold text-center sm:text-left bg-white rounded px-3 py-1 inline-block">📈 Couverture Géolocalisation</h3>
          
                      <div className="bg-white rounded-lg overflow-hidden h-6 mb-3 border-2 border-black">
              <div 
                className="bg-black h-full transition-all duration-300 ease-out"
                style={{ width: `${getLocationCoverage()}%` }}
              />
            </div>
          
          <div className="flex flex-col sm:flex-row justify-between text-sm gap-2">
            <span className="text-center sm:text-left text-black bg-white rounded px-2 py-1">{stats.usersWithLocation} utilisateurs localisés</span>
            <span className="text-center sm:text-right text-black bg-white rounded px-2 py-1">{getLocationCoverage()}% de couverture</span>
          </div>
        </div>

        {/* Graphique par pays - Mobile optimisé */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
          <h3 className="mb-4 text-black font-semibold text-center sm:text-left bg-white rounded px-3 py-1 inline-block">🗺️ Répartition par Pays</h3>
          
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
                        <div className="font-semibold text-black bg-white rounded px-2 py-1 text-sm sm:text-base inline-block">
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
                        <div className={`text-lg font-bold text-black bg-white rounded px-2 py-1 inline-block ${index < 3 ? 'border-2 border-green-500' : ''}`}>
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