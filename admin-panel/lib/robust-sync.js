// Système de synchronisation robuste pour éviter les erreurs 429
class RobustSync {
  constructor() {
    this.isClient = typeof window !== 'undefined'
    this.pendingOperations = new Map()
    this.syncQueue = []
    this.isProcessing = false
    this.lastSync = null
    this.retryCount = 0
    this.maxRetries = 2 // Réduit de 3 à 2
    this.baseDelay = 5000 // Délai standard
    this.minInterval = 10000 // Intervalle standard
    
    if (this.isClient) {
      this.init()
    }
  }

  init() {
    console.log('🔄 RobustSync initialisé avec délais optimisés')
    // Traiter la queue toutes les 3 secondes pour les réseaux sociaux
    setInterval(() => this.processQueue(), 3000)
  }

  // Ajouter une opération à synchroniser
  addOperation(type, data, priority = 'normal') {
    const operation = {
      id: Date.now() + Math.random(),
      type, // 'create', 'update', 'delete', 'config'
      data,
      priority, // 'high', 'normal', 'low'
      timestamp: Date.now(),
      retries: 0
    }

    this.syncQueue.push(operation)
    console.log(`📝 Opération ajoutée: ${type}`, { id: operation.id, priority })

    // Pour les réseaux sociaux, traitement plus rapide
    if (priority === 'high') {
      setTimeout(() => this.processQueue(), 500) // Réduit à 500ms pour sync rapide
    }

    return operation.id
  }

  // Traiter la queue de synchronisation
  async processQueue() {
    if (this.isProcessing || this.syncQueue.length === 0) {
      return
    }

    // Vérifier l'intervalle minimum entre les syncs
    if (this.lastSync && (Date.now() - this.lastSync) < this.minInterval) {
      console.log('⏳ Intervalle minimum non respecté, report de la sync')
      return
    }

    this.isProcessing = true
    console.log(`🔄 Traitement queue: ${this.syncQueue.length} opérations`)

    try {
      // Trier par priorité
      this.syncQueue.sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })

      // Traiter une opération à la fois pour éviter le spam
      const operation = this.syncQueue.shift()
      if (operation) {
        await this.executeOperation(operation)
      }

    } catch (error) {
      console.error('❌ Erreur traitement queue:', error)
    } finally {
      this.isProcessing = false
    }
  }

  // Exécuter une opération de synchronisation
  async executeOperation(operation) {
    try {
      console.log(`🚀 Exécution: ${operation.type}`, { id: operation.id })

      switch (operation.type) {
        case 'shop_create':
        case 'shop_update':
        case 'shop_delete':
          await this.syncShopOperation(operation)
          break
        case 'config_update':
          await this.syncConfigOperation(operation)
          break
        case 'cache_refresh':
          await this.syncCacheRefresh(operation)
          break
        default:
          console.log(`❓ Type d'opération inconnu: ${operation.type}`)
      }

      console.log(`✅ Opération réussie: ${operation.type}`)
      this.lastSync = new Date()

    } catch (error) {
      console.error(`❌ Erreur opération ${operation.type}:`, error)
      
      // Retry logic
      operation.retries++
      if (operation.retries < this.maxRetries) {
        // Ajouter un délai exponentiel
        const delay = this.baseDelay * Math.pow(2, operation.retries)
        console.log(`🔄 Retry ${operation.retries}/${this.maxRetries} dans ${delay}ms`)
        
        setTimeout(() => {
          this.syncQueue.unshift(operation) // Remettre au début
        }, delay)
      } else {
        console.log(`🚫 Abandon opération ${operation.type} après ${this.maxRetries} tentatives`)
      }
    }
  }

  // Synchroniser les opérations de boutique
  async syncShopOperation(operation) {
    const botUrl = process.env.NEXT_PUBLIC_BOT_URL || 'https://findyourplug-bot.onrender.com'
    
    try {
      // Utiliser un endpoint direct pour éviter le proxy CORS
      const response = await fetch(`${botUrl}/api/cache/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'FindYourPlug-Sync/1.0'
        },
        body: JSON.stringify({
          operation: operation.type,
          data: operation.data,
          timestamp: operation.timestamp
        })
      })

      if (!response.ok) {
        throw new Error(`Bot sync failed: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Bot synchronisé:', result)

    } catch (error) {
      console.log('⚠️ Bot direct failed, trying alternative...')
      
      // Fallback : utiliser l'API locale
      try {
        const response = await fetch('/api/sync-bot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            operation: operation.type,
            data: operation.data
          })
        })

        if (response.ok) {
          console.log('✅ Sync via API locale réussie')
        } else {
          throw new Error('Local sync failed')
        }
      } catch (localError) {
        console.log('⚠️ Sync locale échouée, mise en attente')
        throw localError
      }
    }
  }

  // Synchroniser la configuration
  async syncConfigOperation(operation) {
    try {
      // Pour la config, on force juste un refresh cache
      await this.syncCacheRefresh(operation)
    } catch (error) {
      console.error('❌ Erreur sync config:', error)
      throw error
    }
  }

  // Refresh du cache bot
  async syncCacheRefresh(operation) {
    try {
      const response = await fetch('/api/sync-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Cache refresh failed')
      }

      const result = await response.json()
      console.log('✅ Cache refreshed:', result.message)

    } catch (error) {
      console.error('❌ Cache refresh error:', error)
      throw error
    }
  }

  // Interface publique pour déclencher une synchronisation
  syncShopCreate(shopData) {
    return this.addOperation('shop_create', shopData, 'high')
  }

  syncShopUpdate(shopData) {
    return this.addOperation('shop_update', shopData, 'high')
  }

  syncShopDelete(shopId) {
    return this.addOperation('shop_delete', { id: shopId }, 'high')
  }

  syncConfigUpdate(configData) {
    return this.addOperation('config_update', configData, 'normal')
  }

  forceCacheRefresh() {
    return this.addOperation('cache_refresh', {}, 'high')
  }

  // Obtenir le statut
  getStatus() {
    return {
      queueLength: this.syncQueue.length,
      isProcessing: this.isProcessing,
      lastSync: this.lastSync,
      pendingOperations: this.syncQueue.map(op => ({
        type: op.type,
        priority: op.priority,
        retries: op.retries
      }))
    }
  }

  // Clear queue
  clearQueue() {
    this.syncQueue = []
    console.log('🧹 Queue de synchronisation vidée')
  }
}

// Instance globale
let robustSyncInstance = null

export const getRobustSync = () => {
  if (typeof window !== 'undefined' && !robustSyncInstance) {
    robustSyncInstance = new RobustSync()
  }
  return robustSyncInstance
}

export default getRobustSync