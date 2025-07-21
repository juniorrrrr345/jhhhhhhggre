import { useState, useEffect } from 'react'

export default function TestShop() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/proxy?endpoint=/api/public/config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
        console.log('Config reçue:', data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Chargement...</div>

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Test Configuration Boutique</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={fetchConfig} style={{ padding: '10px 20px', background: '#007AFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          🔄 Recharger Config
        </button>
      </div>

      {config ? (
        <div>
          <h2>Configuration actuelle :</h2>
          <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
            <strong>Nom boutique:</strong> {config.boutique?.name || 'Non défini'}<br/>
            <strong>Sous-titre:</strong> {config.boutique?.subtitle || 'Non défini'}<br/>
            <strong>Image de fond:</strong> {config.boutique?.backgroundImage || 'Non défini'}
          </div>

          <h2>Aperçu boutique :</h2>
          <div style={{ 
            background: 'black', 
            color: 'white', 
            padding: '20px', 
            textAlign: 'center',
            backgroundImage: config.boutique?.backgroundImage ? `url("${config.boutique.backgroundImage}")` : 'none',
            backgroundSize: 'cover'
          }}>
            <h1 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>
              {config.boutique?.name || 'PlugsFinder Bot'}
            </h1>
            <p style={{ fontSize: '16px', margin: '0' }}>
              {config.boutique?.subtitle || ''}
            </p>
          </div>

          <h2>Données brutes :</h2>
          <pre style={{ background: '#f0f0f0', padding: '10px', overflow: 'auto', fontSize: '12px' }}>
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      ) : (
        <p>Aucune configuration chargée</p>
      )}
    </div>
  )
}