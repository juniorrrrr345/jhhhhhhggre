// Gestionnaire de synchronisation automatique entre Vercel et Bot Telegram
class SyncManager {
  constructor() {
    this.isClient = typeof window !== 'undefined'
    this.syncQueue = []
    this.isSyncing = false
    this.lastSync = null
    this.syncInterval = null
    
    if (this.isClient) {
      this.init()
    }
  }

  init() {
    // Démarrer la synchronisation automatique
    console.log('🔄 SyncManager initialisé')
    
    // Écouter les changements de stockage local (si plusieurs onglets)
    window.addEventListener('storage', this.handleStorageChange.bind(this))
    
    // Synchronisation périodique (toutes les 30 secondes)
    this.startPeriodicSync()
  }

  startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    
    this.syncInterval = setInterval(async () => {
      await this.syncIfNeeded()
    }, 30000) // 30 secondes
  }

  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  handleStorageChange(event) {
    if (event.key === 'findyourplug_sync_trigger') {
      console.log('🔄 Changement détecté, synchronisation demandée')
      this.triggerSync('storage_change')
    }
  }

  // Déclencher une synchronisation (appelé après modification de boutique)
  async triggerSync(reason = 'manual') {
    if (!this.isClient) return

    try {
      console.log(`🔄 Synchronisation déclenchée: ${reason}`)
      
      // Ajouter à la queue
      this.syncQueue.push({
        reason,
        timestamp: Date.now()
      })
      
      // Marquer qu'un sync est nécessaire
      localStorage.setItem('findyourplug_sync_needed', 'true')
      localStorage.setItem('findyourplug_sync_trigger', Date.now().toString())
      
      // Exécuter le sync
      return await this.performSync()
      
    } catch (error) {
      console.error('❌ Erreur triggerSync:', error)
      return false
    }
  }

  // Vérifier si un sync est nécessaire
  async syncIfNeeded() {
    if (!this.isClient) return

    const syncNeeded = localStorage.getItem('findyourplug_sync_needed')
    if (syncNeeded === 'true') {
      console.log('🔄 Synchronisation automatique nécessaire')
      return await this.performSync()
    }
  }

  // Exécuter la synchronisation
  async performSync() {
    if (this.isSyncing) {
      console.log('⏳ Synchronisation déjà en cours...')
      return false
    }

    try {
      this.isSyncing = true
      console.log('🚀 Début synchronisation bot...')
      
      const response = await fetch('/api/sync-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Synchronisation réussie:', result.message)
        
        // Marquer comme synchronisé
        localStorage.setItem('findyourplug_sync_needed', 'false')
        localStorage.setItem('findyourplug_last_sync', new Date().toISOString())
        
        this.lastSync = new Date()
        
        // Nettoyer la queue
        this.syncQueue = []
        
        // Notifier les autres composants
        window.dispatchEvent(new CustomEvent('findyourplug-synced', {
          detail: result.data
        }))
        
        return true
      } else {
        console.log('⚠️ Synchronisation partielle:', result.message)
        return false
      }
      
    } catch (error) {
      console.error('❌ Erreur performSync:', error)
      return false
    } finally {
      this.isSyncing = false
    }
  }

  // Obtenir le statut de synchronisation
  async getStatus() {
    try {
      const response = await fetch('/api/sync-bot')
      return await response.json()
    } catch (error) {
      console.error('❌ Erreur getStatus:', error)
      return {
        botOnline: false,
        syncAvailable: false,
        error: error.message
      }
    }
  }

  // Forcer une synchronisation manuelle
  async forcSync() {
    console.log('🔄 Synchronisation forcée demandée')
    return await this.triggerSync('manual_force')
  }

  // Méthodes pour les événements de boutique
  onShopUpdate(shopData) {
    console.log('🏪 Boutique mise à jour, sync nécessaire:', shopData.name || shopData.id)
    this.triggerSync('shop_update')
  }

  onShopCreate(shopData) {
    console.log('🆕 Nouvelle boutique créée, sync nécessaire:', shopData.name || shopData.id)
    this.triggerSync('shop_create')
  }

  onShopDelete(shopId) {
    console.log('🗑️ Boutique supprimée, sync nécessaire:', shopId)
    this.triggerSync('shop_delete')
  }

  onConfigUpdate(configData) {
    console.log('⚙️ Configuration mise à jour, sync nécessaire')
    this.triggerSync('config_update')
  }

  // Cleanup
  destroy() {
    this.stopPeriodicSync()
    if (this.isClient) {
      window.removeEventListener('storage', this.handleStorageChange.bind(this))
    }
  }
}

// Instance globale
let syncManagerInstance = null

export const getSyncManager = () => {
  if (typeof window !== 'undefined' && !syncManagerInstance) {
    syncManagerInstance = new SyncManager()
  }
  return syncManagerInstance
}

export default getSyncManager