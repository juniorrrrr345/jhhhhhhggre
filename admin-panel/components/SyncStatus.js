import { useState, useEffect } from 'react'
import { syncManager } from '../lib/sync'

export default function SyncStatus() {
  const [lastSync, setLastSync] = useState(null)
  const [isOnline, setIsOnline] = useState(true)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    // Écouter les signaux de synchronisation
    const handleSync = (syncData) => {
      setLastSync({
        timestamp: syncData.timestamp,
        source: syncData.source,
        type: syncData.type
      })
      setShowStatus(true)
      
      // Masquer le statut après 5 secondes
      setTimeout(() => {
        setShowStatus(false)
      }, 5000)
    }

    // Écouter les changements de connexion
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Enregistrer les listeners
    syncManager.addListener('*', handleSync)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // État initial
    setIsOnline(navigator.onLine)

    return () => {
      syncManager.removeListener('*', handleSync)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showStatus && isOnline) return null

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500'
    if (lastSync && Date.now() - lastSync.timestamp < 10000) return 'bg-green-500'
    return 'bg-yellow-500'
  }

  const getStatusText = () => {
    if (!isOnline) return 'Hors ligne'
    if (lastSync) {
      const timeDiff = Date.now() - lastSync.timestamp
      if (timeDiff < 10000) {
        return `Synchronisé (${lastSync.source})`
      }
    }
    return 'En attente de synchronisation'
  }

  const getStatusIcon = () => {
    if (!isOnline) return '🔴'
    if (lastSync && Date.now() - lastSync.timestamp < 10000) return '🟢'
    return '🟡'
  }

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-500 ${
      showStatus ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`${getStatusColor()} bg-opacity-90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2`}>
        <span className="text-lg">{getStatusIcon()}</span>
        <div>
          <div className="text-sm font-medium">{getStatusText()}</div>
          {lastSync && (
            <div className="text-xs opacity-75">
              {new Date(lastSync.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}