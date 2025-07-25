import { useState, useEffect } from 'react'
import { getRobustSync } from '../lib/robust-sync'

export default function SyncStatus() {
  const [status, setStatus] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const robustSync = getRobustSync()
    if (!robustSync) return

    const updateStatus = () => {
      const currentStatus = robustSync.getStatus()
      setStatus(currentStatus)
      setIsVisible(currentStatus.queueLength > 0 || currentStatus.isProcessing)
    }

    // Mettre à jour le statut toutes les 2 secondes
    const interval = setInterval(updateStatus, 2000)
    updateStatus() // Initial load

    // Écouter les événements de synchronisation
    const handleSynced = () => {
      updateStatus()
      setTimeout(() => setIsVisible(false), 3000) // Masquer après 3 secondes
    }

    window.addEventListener('findyourplug-synced', handleSynced)

    return () => {
      clearInterval(interval)
      window.removeEventListener('findyourplug-synced', handleSynced)
    }
  }, [])

  if (!isVisible || !status) return null

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      backgroundColor: status.isProcessing ? '#3B82F6' : status.queueLength > 0 ? '#F59E0B' : '#10B981',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      maxWidth: '300px'
    }}>
      {status.isProcessing ? (
        <>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span>Synchronisation en cours...</span>
        </>
      ) : status.queueLength > 0 ? (
        <>
          <span>⏳</span>
          <span>{status.queueLength} opération(s) en attente</span>
        </>
      ) : (
        <>
          <span>✅</span>
          <span>Synchronisé avec le bot</span>
        </>
      )}

      <button
        onClick={() => setIsVisible(false)}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.7)',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '0',
          marginLeft: 'auto'
        }}
      >
        ×
      </button>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Composant pour afficher le statut détaillé
export function DetailedSyncStatus() {
  const [status, setStatus] = useState(null)
  const [lastSync, setLastSync] = useState(null)

  useEffect(() => {
    const robustSync = getRobustSync()
    if (!robustSync) return

    const updateStatus = () => {
      const currentStatus = robustSync.getStatus()
      setStatus(currentStatus)
      if (currentStatus.lastSync) {
        setLastSync(new Date(currentStatus.lastSync))
      }
    }

    const interval = setInterval(updateStatus, 1000)
    updateStatus()

    return () => clearInterval(interval)
  }, [])

  if (!status) return null

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      padding: '16px',
      margin: '16px 0'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
        🔄 Statut de Synchronisation
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <div>
          <strong>État:</strong> {
            status.isProcessing ? '🔄 En cours' : 
            status.queueLength > 0 ? '⏳ En attente' : 
            '✅ Synchronisé'
          }
        </div>
        
        <div>
          <strong>File d'attente:</strong> {status.queueLength} opération(s)
        </div>
        
        {lastSync && (
          <div style={{ gridColumn: 'span 2' }}>
            <strong>Dernière sync:</strong> {lastSync.toLocaleTimeString()}
          </div>
        )}
      </div>

      {status.pendingOperations.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <strong>Opérations en attente:</strong>
          <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '14px' }}>
            {status.pendingOperations.map((op, index) => (
              <li key={index}>
                {op.type} (priorité: {op.priority}, tentatives: {op.retries})
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => {
          const robustSync = getRobustSync()
          if (robustSync) {
            robustSync.forceCacheRefresh()
          }
        }}
        style={{
          marginTop: '12px',
          padding: '6px 12px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        🔄 Forcer la synchronisation
      </button>
    </div>
  )
}