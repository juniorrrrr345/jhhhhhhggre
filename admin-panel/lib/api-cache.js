// Système de cache pour éviter les appels API répétés et les erreurs 429
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.lastCall = new Map();
    this.minInterval = 2000; // 2 secondes minimum entre les appels
  }

  // Vérifier si on peut faire l'appel (anti-spam)
  canMakeCall(key) {
    const lastTime = this.lastCall.get(key);
    const now = Date.now();
    
    if (!lastTime) return true;
    return (now - lastTime) >= this.minInterval;
  }

  // Marquer qu'un appel a été fait
  markCall(key) {
    this.lastCall.set(key, Date.now());
  }

  // Obtenir depuis le cache
  get(key, maxAge = 30000) { // 30 secondes par défaut
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if ((now - cached.timestamp) > maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  // Sauvegarder en cache
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Nettoyer le cache
  clear() {
    this.cache.clear();
    this.lastCall.clear();
  }

  // Nettoyer les entrées expirées
  cleanup(maxAge = 300000) { // 5 minutes
    const now = Date.now();
    
    for (const [key, value] of this.cache.entries()) {
      if ((now - value.timestamp) > maxAge) {
        this.cache.delete(key);
      }
    }
    
    for (const [key, timestamp] of this.lastCall.entries()) {
      if ((now - timestamp) > maxAge) {
        this.lastCall.delete(key);
      }
    }
  }
}

// Instance globale
const apiCache = new ApiCache();

// Nettoyer automatiquement toutes les 5 minutes
setInterval(() => {
  apiCache.cleanup();
}, 300000);

export default apiCache;