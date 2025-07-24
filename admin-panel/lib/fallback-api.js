// API de fallback utilisant localStorage quand l'API principale est indisponible
export class FallbackApi {
  constructor() {
    this.prefix = 'fallback_';
    this.maxAge = 300000; // 5 minutes
  }

  // Sauvegarder en fallback
  save(key, data) {
    try {
      const item = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
      console.log(`💾 Fallback saved: ${key}`);
    } catch (error) {
      console.error('❌ Fallback save error:', error);
    }
  }

  // Récupérer du fallback
  get(key) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const now = Date.now();
      
      // Vérifier si les données ne sont pas trop anciennes
      if ((now - parsed.timestamp) > this.maxAge) {
        this.remove(key);
        return null;
      }

      console.log(`💾 Fallback loaded: ${key}`);
      return parsed.data;
    } catch (error) {
      console.error('❌ Fallback get error:', error);
      return null;
    }
  }

  // Supprimer du fallback
  remove(key) {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('❌ Fallback remove error:', error);
    }
  }

  // Nettoyer tous les fallbacks
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      console.log('🧹 Fallback cache cleared');
    } catch (error) {
      console.error('❌ Fallback clear error:', error);
    }
  }

  // Nettoyer les anciens fallbacks
  cleanup() {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            if ((now - item.timestamp) > this.maxAge) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // Item corrompu, le supprimer
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('❌ Fallback cleanup error:', error);
    }
  }
}

// Instance globale
export const fallbackApi = new FallbackApi();

// Nettoyer automatiquement toutes les 5 minutes
setInterval(() => {
  fallbackApi.cleanup();
}, 300000);