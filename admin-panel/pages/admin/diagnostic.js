import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../../components/Layout'
import toast from 'react-hot-toast'

export default function Diagnostic() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [restarting, setRestarting] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/')
      return
    }
    
    // Lancer le diagnostic automatiquement
    runDiagnostic()
  }, [])

  useEffect(() => {
    let interval
    if (autoRefresh) {
      interval = setInterval(() => {
        runDiagnostic(false) // Pas de toast pour l'auto-refresh
      }, 10000) // Toutes les 10 secondes
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const runDiagnostic = async (showToast = true) => {
    try {
      setLoading(true)
      if (showToast) {
        toast.info('🔍 Diagnostic en cours...', { duration: 1000 })
      }
      
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/diagnostic', {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setResults(data)
        
        if (showToast) {
          if (data.overall === 'SUCCESS') {
            toast.success('✅ Diagnostic réussi')
          } else if (data.overall === 'PARTIAL') {
            toast.error('⚠️ Problèmes détectés')
          } else {
            toast.error('❌ Échec du diagnostic')
          }
        }
      } else {
        toast.error('Erreur lors du diagnostic')
      }
    } catch (error) {
      console.error('Erreur diagnostic:', error)
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const emergencyRestart = async () => {
    try {
      setRestarting(true)
      toast.info('🚨 Redémarrage d\'urgence en cours...', { duration: 3000 })
      
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/emergency-restart', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('🚨 Résultat redémarrage urgence:', data)
        
        if (data.success) {
          toast.success('✅ Redémarrage d\'urgence réussi !', { duration: 5000 })
          // Relancer le diagnostic après le redémarrage
          setTimeout(() => {
            runDiagnostic()
          }, 2000)
        } else {
          toast.error(`⚠️ Redémarrage partiel: ${data.recommendations?.[0] || 'Voir détails'}`, { duration: 6000 })
        }
      } else {
        toast.error('❌ Échec redémarrage d\'urgence')
      }
    } catch (error) {
      console.error('Erreur redémarrage urgence:', error)
      toast.error('❌ Erreur redémarrage d\'urgence')
    } finally {
      setRestarting(false)
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      'SUCCESS': 'bg-green-100 text-green-800',
      'FAILED': 'bg-red-100 text-red-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PARTIAL': 'bg-orange-100 text-orange-800',
      'ERROR': 'bg-red-100 text-red-800'
    }
    
    const icons = {
      'SUCCESS': '✅',
      'FAILED': '❌',
      'PENDING': '🔄',
      'PARTIAL': '⚠️',
      'ERROR': '💥'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.PENDING}`}>
        <span className="mr-1">{icons[status] || icons.PENDING}</span>
        {status}
      </span>
    )
  }

  const formatDuration = (ms) => {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)}s`
    }
    return `${ms}ms`
  }

  return (
    <>
      <Head>
        <title>Diagnostic Connectivité - Administration</title>
      </Head>

      <Layout>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">🔍 Diagnostic Connectivité</h1>
                <p className="text-gray-600 mt-2">
                  Test de la connexion entre le panel admin et le serveur bot
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-refresh (10s)</span>
                </label>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => runDiagnostic()}
                    disabled={loading || restarting}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    {loading ? '🔄 Test...' : '🔍 Relancer Test'}
                  </button>
                  
                  {results?.overall === 'FAILED' && (
                    <button
                      onClick={emergencyRestart}
                      disabled={loading || restarting}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      {restarting ? '🚨 Redémarrage...' : '🚨 Urgence'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Statut Global */}
          {results && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Statut Global</h2>
                  <p className="text-gray-600 text-sm">
                    Dernière vérification: {new Date(results.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(results.overall)}
                  <div className="text-sm text-gray-500 mt-1">
                    {results.tests?.length || 0} tests effectués
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tests Détaillés */}
          {results?.tests && results.tests.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Tests de Connectivité</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {results.tests.map((test, index) => (
                  <div key={index} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{test.name}</h3>
                        <p className="text-sm text-gray-600">{test.url}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(test.status)}
                        <div className="text-sm text-gray-500 mt-1">
                          {formatDuration(test.duration)}
                        </div>
                      </div>
                    </div>
                    
                    {test.httpStatus && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Status HTTP:</span>
                          <span className={`ml-1 font-medium ${test.httpStatus < 400 ? 'text-green-600' : 'text-red-600'}`}>
                            {test.httpStatus}
                          </span>
                        </div>
                        
                        {test.configExists !== undefined && (
                          <div>
                            <span className="text-gray-500">Config:</span>
                            <span className={`ml-1 font-medium ${test.configExists ? 'text-green-600' : 'text-red-600'}`}>
                              {test.configExists ? 'Existe' : 'Manquante'}
                            </span>
                          </div>
                        )}
                        
                        {test.boutiqueName && (
                          <div className="col-span-2">
                            <span className="text-gray-500">Boutique:</span>
                            <span className="ml-1 font-medium text-blue-600">
                              {test.boutiqueName}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {test.error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm font-medium">Erreur:</p>
                        <p className="text-red-700 text-sm">{test.error}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommandations */}
          {results?.recommendations && results.recommendations.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-yellow-800 mb-4">💡 Recommandations</h2>
              <ul className="list-disc list-inside space-y-2">
                {results.recommendations.map((rec, index) => (
                  <li key={index} className="text-yellow-700">{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions Rapides */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🛠️ Actions Rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => window.open('https://jhhhhhhggre.onrender.com/health', '_blank')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center"
              >
                🌐 Ouvrir API Bot
              </button>
              
              <button
                onClick={() => router.push('/admin/config')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center"
              >
                ⚙️ Configuration Bot
              </button>
              
              <button
                onClick={() => router.push('/shop')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-center"
              >
                🏪 Tester Boutique
              </button>
            </div>
          </div>

          {/* Debug Info */}
          {results && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <details>
                <summary className="cursor-pointer text-gray-700 font-medium">
                  🔧 Informations de Debug (cliquer pour développer)
                </summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}