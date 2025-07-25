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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          color: '#ffffff'
        }}>
          <div>⏳ Chargement des statistiques utilisateurs...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Head>
        <title>Analyse Géographique - Administration</title>
      </Head>

      <div style={{ padding: '20px', color: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#ffffff',
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#1f2937',
            borderRadius: '12px',
            border: '2px solid #22c55e',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            flex: 1
          }}>
            🌍 📊 ANALYSE GÉOGRAPHIQUE DES UTILISATEURS 🌍
          </h1>
          
          <button
            onClick={fetchUserStats}
            disabled={stats.loading}
            style={{
              marginLeft: '20px',
              padding: '12px 20px',
              backgroundColor: '#22c55e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: stats.loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              opacity: stats.loading ? 0.5 : 1
            }}
          >
            {stats.loading ? '⏳ Chargement...' : '🔄 Actualiser'}
          </button>
        </div>

        {/* Filtres temporels */}
        <div style={{ 
          marginBottom: '30px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <h3 style={{ 
            marginRight: '15px', 
            color: '#ffffff', 
            fontSize: '16px',
            marginBottom: '0',
            minWidth: 'fit-content'
          }}>Période :</h3>
          {[
            { value: 'all', label: 'Tout' },
            { value: '30d', label: '30 jours' },
            { value: '7d', label: '7 jours' },
            { value: '1d', label: '24h' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: timeRange === option.value ? '#22c55e' : '#374151',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: timeRange === option.value ? 'bold' : 'normal',
                transition: 'all 0.2s ease',
                minWidth: '80px'
              }}
            >
              {option.label}
            </button>
          ))}
          
          {stats.lastUpdate && (
            <div style={{ 
              color: '#9ca3af', 
              fontSize: '12px', 
              alignSelf: 'center',
              marginLeft: '20px'
            }}>
              📅 Dernière maj: {stats.lastUpdate.toLocaleTimeString('fr-FR')}
            </div>
          )}
        </div>

        {/* Statistiques générales */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: '#1f2937',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #374151',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#22c55e', marginBottom: '10px', fontSize: '16px' }}>👥 Total Utilisateurs</h4>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff' }}>{stats.totalUsers || 0}</div>
          </div>

          <div style={{
            backgroundColor: '#1f2937',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #374151',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#3b82f6', marginBottom: '10px', fontSize: '16px' }}>📍 Localisés</h4>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff' }}>{stats.usersWithLocation || 0}</div>
            <div style={{ fontSize: '14px', color: '#3b82f6', marginTop: '5px' }}>
              {getLocationCoverage()}% de couverture
            </div>
          </div>

          <div style={{
            backgroundColor: '#1f2937',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #374151',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#f59e0b', marginBottom: '10px', fontSize: '16px' }}>🌍 Pays Détectés</h4>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff' }}>{stats.countryStats?.length || 0}</div>
          </div>
        </div>

        {/* Graphique par pays */}
        <div style={{
          backgroundColor: '#1f2937',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #374151',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#ffffff' }}>🗺️ Répartition par Pays</h3>
          
          {stats.countryStats.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#9ca3af'
            }}>
              Aucune donnée de géolocalisation disponible
            </div>
          ) : (
            <div style={{ 
              display: 'grid',
              gap: '10px'
            }}>
              {stats.countryStats.map((country, index) => {
                const percentage = Math.round((country.count / stats.usersWithLocation) * 100)
                
                return (
                  <div key={`${country.countryCode}-${index}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: '#374151',
                    borderRadius: '6px',
                    border: index < 3 ? '1px solid #22c55e' : '1px solid #4b5563'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>
                        {getCountryFlag(country.countryCode)}
                      </span>
                      <div>
                        <div style={{ fontWeight: '600', color: '#ffffff' }}>
                          {country.country}
                        </div>
                        {country.latestUser && (
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                            Dernier: {formatDate(country.latestUser)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold',
                        color: index < 3 ? '#22c55e' : '#ffffff'
                      }}>
                        {country.count} utilisateurs
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {percentage}%
                      </div>
                    </div>
                    
                    {/* Badge top 3 */}
                    {index < 3 && (
                      <div style={{
                        backgroundColor: '#22c55e',
                        color: '#000000',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        TOP {index + 1}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Barre de progression de couverture */}
        <div style={{
          backgroundColor: '#1f2937',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #374151'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#ffffff' }}>📈 Couverture Géolocalisation</h3>
          
          <div style={{
            backgroundColor: '#374151',
            borderRadius: '8px',
            overflow: 'hidden',
            height: '20px',
            marginBottom: '10px'
          }}>
            <div style={{
              backgroundColor: '#22c55e',
              height: '100%',
              width: `${getLocationCoverage()}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '14px',
            color: '#9ca3af'
          }}>
            <span>{stats.usersWithLocation} utilisateurs localisés</span>
            <span>{getLocationCoverage()}% de couverture</span>
          </div>
        </div>

        {/* Note technique */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#1e40af',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#bfdbfe'
        }}>
          <strong>ℹ️ Note technique :</strong> La géolocalisation est détectée via l'IP du serveur (approximation). 
          Pour une précision optimale, il faudrait l'IP réelle des utilisateurs via une intégration Telegram Web App.
        </div>
      </div>
    </AdminLayout>
  )
}