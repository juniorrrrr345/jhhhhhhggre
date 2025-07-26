import { useState } from 'react'
import { simpleApi as api } from '../lib/api-simple'

export default function TestProxy() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testProxy = async () => {
    setLoading(true)
    try {
      console.log('🧪 Test du proxy...')
      const response = await api.get('/test-proxy')
      console.log('📊 Réponse test proxy:', response)
      setResult(JSON.stringify(response, null, 2))
    } catch (error) {
      console.error('❌ Erreur test proxy:', error)
      setResult(`Erreur: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testAnalytics = async () => {
    setLoading(true)
    try {
      console.log('🧪 Test analytics...')
      const token = 'ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1'
      const response = await api.get('/admin/user-analytics?timeRange=all', token)
      console.log('📊 Réponse analytics:', response)
      setResult(JSON.stringify(response, null, 2))
    } catch (error) {
      console.error('❌ Erreur analytics:', error)
      setResult(`Erreur: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🧪 Test Proxy Debug</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testProxy} 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          {loading ? 'Test...' : 'Test Proxy Simple'}
        </button>
        
        <button 
          onClick={testAnalytics} 
          disabled={loading}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          {loading ? 'Test...' : 'Test Analytics'}
        </button>
      </div>

      <h2>Résultat :</h2>
      <pre style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '4px',
        overflow: 'auto',
        minHeight: '200px'
      }}>
        {result || 'Cliquez sur un bouton pour tester...'}
      </pre>
    </div>
  )
}