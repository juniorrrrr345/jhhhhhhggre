// Utilitaire de synchronisation globale pour l'administration
export class SyncManager {
  constructor() {
    this.listeners = new Map()
    this.isListening = false
  }

  // Démarrer l'écoute des signaux de synchronisation
  startListening() {
    if (this.isListening) return

    this.isListening = true
    window.addEventListener('storage', this.handleStorageChange.bind(this))
    console.log('🔄 SyncManager démarré')
  }

  // Arrêter l'écoute
  stopListening() {
    if (!this.isListening) return

    this.isListening = false
    window.removeEventListener('storage', this.handleStorageChange.bind(this))
    console.log('⏹️ SyncManager arrêté')
  }

  // Gérer les changements de localStorage
  handleStorageChange(event) {
    if (!event?.key || !event?.newValue) return

    // Écouter les signaux de synchronisation
    if (event.key === 'global_sync_signal' || event.key === 'boutique_sync_signal') {
      try {
        const syncData = JSON.parse(event.newValue)
        console.log('📡 Signal de synchronisation reçu:', {
          key: event.key,
          type: syncData.type,
          source: syncData.source,
          timestamp: new Date(syncData.timestamp).toLocaleTimeString()
        })

        // Notifier tous les listeners enregistrés
        this.notifyListeners(syncData)
      } catch (error) {
        console.error('❌ Erreur parsing signal sync:', error)
      }
    }
  }

  // Ajouter un listener pour un type d'événement
  addListener(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType).add(callback)
    console.log(`📝 Listener ajouté pour: ${eventType}`)
  }

  // Retirer un listener
  removeListener(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback)
    }
  }

  // Notifier tous les listeners d'un type d'événement
  notifyListeners(syncData) {
    const eventType = syncData.type || 'config_updated'
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        try {
          callback(syncData)
        } catch (error) {
          console.error('❌ Erreur dans listener:', error)
        }
      })
    }

    // Notifier aussi les listeners globaux
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(callback => {
        try {
          callback(syncData)
        } catch (error) {
          console.error('❌ Erreur dans listener global:', error)
        }
      })
    }
  }

  // Envoyer un signal de synchronisation
  broadcastSync(type, source, data = {}) {
    const syncSignal = {
      type,
      source,
      timestamp: Date.now(),
      data
    }

    try {
      // Signal global
      localStorage.setItem('global_sync_signal', JSON.stringify(syncSignal))
      
      // Signal spécifique selon le type
      if (type === 'boutique_config_updated') {
        localStorage.setItem('boutique_sync_signal', JSON.stringify(syncSignal))
      }

      // Déclencher les événements
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'global_sync_signal',
        newValue: JSON.stringify(syncSignal)
      }))

      if (type === 'boutique_config_updated') {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'boutique_sync_signal',
          newValue: JSON.stringify(syncSignal)
        }))
      }

      console.log('📡 Signal de synchronisation envoyé:', {
        type,
        source,
        timestamp: new Date(syncSignal.timestamp).toLocaleTimeString()
      })

      return true
    } catch (error) {
      console.error('❌ Erreur envoi signal sync:', error)
      return false
    }
  }

  // Nettoyer les anciens signaux (plus de 5 minutes)
  cleanup() {
    try {
      const keys = ['global_sync_signal', 'boutique_sync_signal']
      keys.forEach(key => {
        const stored = localStorage.getItem(key)
        if (stored) {
          const data = JSON.parse(stored)
          if (Date.now() - data.timestamp > 5 * 60 * 1000) {
            localStorage.removeItem(key)
            console.log(`🧹 Signal expiré supprimé: ${key}`)
          }
        }
      })
    } catch (error) {
      console.error('❌ Erreur nettoyage signaux:', error)
    }
  }
}

// Instance globale
export const syncManager = new SyncManager()

// Démarrer automatiquement si on est dans un environnement browser
if (typeof window !== 'undefined') {
  syncManager.startListening()
  
  // TEMPORAIREMENT DÉSACTIVÉ pour éviter les erreurs 429
  // Nettoyage automatique toutes les 5 minutes
  // setInterval(() => {
  //   syncManager.cleanup()
  // }, 5 * 60 * 1000)
}

// Hook React pour faciliter l'utilisation
export function useSyncListener(eventType, callback) {
  const { useEffect } = require('react')
  
  useEffect(() => {
    syncManager.addListener(eventType, callback)
    return () => {
      syncManager.removeListener(eventType, callback)
    }
  }, [eventType, callback])
}