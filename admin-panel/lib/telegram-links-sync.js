// Système de synchronisation automatique des liens Telegram
class TelegramLinksSync {
  constructor() {
    this.syncInterval = null
    this.lastSync = null
    this.syncIntervalMs = 30000 // 30 secondes
  }

  // Démarrer la synchronisation automatique
  startAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(() => {
      this.syncLinks()
    }, this.syncIntervalMs)

    console.log('🔄 Synchronisation automatique des liens Telegram démarrée')
  }

  // Arrêter la synchronisation automatique
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
    console.log('⏹️ Synchronisation automatique des liens Telegram arrêtée')
  }

  // Synchroniser les liens depuis l'API publique
  async syncLinks() {
    try {
      const response = await fetch('https://jhhhhhhggre.onrender.com/api/public/config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const links = {
          inscriptionTelegramLink: data.boutique?.inscriptionTelegramLink || 'https://t.me/FindYourPlugBot',
          servicesTelegramLink: data.boutique?.servicesTelegramLink || 'https://t.me/FindYourPlugBot'
        }

        // Mettre à jour le localStorage
        localStorage.setItem('telegramLinks', JSON.stringify(links))
        
        this.lastSync = Date.now()
        console.log('✅ Liens Telegram synchronisés:', links)
        
        // Émettre un événement pour notifier les pages
        window.dispatchEvent(new CustomEvent('telegramLinksUpdated', { detail: links }))
      }
    } catch (error) {
      console.log('⚠️ Erreur synchronisation liens Telegram:', error)
    }
  }

  // Synchroniser immédiatement
  async syncNow() {
    await this.syncLinks()
  }

  // Obtenir les liens actuels
  getCurrentLinks() {
    const saved = localStorage.getItem('telegramLinks')
    if (saved) {
      return JSON.parse(saved)
    }
    return {
      inscriptionTelegramLink: 'https://t.me/FindYourPlugBot',
      servicesTelegramLink: 'https://t.me/FindYourPlugBot'
    }
  }

  // Écouter les changements de liens
  onLinksUpdate(callback) {
    window.addEventListener('telegramLinksUpdated', (event) => {
      callback(event.detail)
    })
  }
}

// Instance globale
const telegramLinksSync = new TelegramLinksSync()

// Démarrer automatiquement si on est sur une page publique
if (typeof window !== 'undefined' && window.location.pathname.includes('/shop/')) {
  telegramLinksSync.startAutoSync()
}

export default telegramLinksSync