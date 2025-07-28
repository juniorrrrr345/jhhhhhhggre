// Système de cache unifié

class UnifiedCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
    
    // Nettoyer le cache périodiquement
    setInterval(() => this.cleanup(), 60000); // Toutes les minutes
  }
  
  // Générer une clé unique pour le cache
  generateKey(type, params = {}) {
    const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});
    
    return `${type}:${JSON.stringify(sortedParams)}`;
  }
  
  // Mettre en cache avec TTL
  set(key, data, ttl = 60000) {
    // Annuler le timer existant
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    // Stocker les données
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    });
    
    // Programmer la suppression
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);
    
    this.timers.set(key, timer);
    
    console.log(`💾 Cache set: ${key} (TTL: ${ttl}ms)`);
  }
  
  // Récupérer du cache
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Vérifier si expiré
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }
    
    // Incrémenter les hits
    entry.hits++;
    
    console.log(`💾 Cache hit: ${key} (hits: ${entry.hits})`);
    return entry.data;
  }
  
  // Supprimer du cache
  delete(key) {
    // Annuler le timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    
    this.cache.delete(key);
    console.log(`🗑️ Cache delete: ${key}`);
  }
  
  // Vider tout le cache
  clear() {
    // Annuler tous les timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    
    this.cache.clear();
    console.log('🧹 Cache cleared');
  }
  
  // Vider le cache par type
  clearByType(type) {
    const keysToDelete = [];
    
    this.cache.forEach((_, key) => {
      if (key.startsWith(`${type}:`)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.delete(key));
    console.log(`🧹 Cache cleared for type: ${type} (${keysToDelete.length} entries)`);
  }
  
  // Nettoyer les entrées expirées
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cache cleanup: ${keysToDelete.length} expired entries removed`);
    }
  }
  
  // Obtenir les statistiques du cache
  getStats() {
    const stats = {
      size: this.cache.size,
      entries: [],
      totalHits: 0,
      totalSize: 0
    };
    
    this.cache.forEach((entry, key) => {
      const size = JSON.stringify(entry.data).length;
      stats.entries.push({
        key,
        hits: entry.hits,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
        size
      });
      stats.totalHits += entry.hits;
      stats.totalSize += size;
    });
    
    return stats;
  }
}

// Instance singleton
export const cache = new UnifiedCache();

// Types de cache prédéfinis
export const CACHE_TYPES = {
  CONFIG: 'config',
  PLUGS: 'plugs',
  USER: 'user',
  IMAGE: 'image',
  API_RESPONSE: 'api_response'
};

// Wrapper pour les appels API avec cache
export const cachedApiCall = async (
  cacheType,
  apiFunction,
  params = {},
  ttl = 60000
) => {
  const cacheKey = cache.generateKey(cacheType, params);
  
  // Vérifier le cache d'abord
  const cachedData = cache.get(cacheKey);
  if (cachedData !== null) {
    return cachedData;
  }
  
  // Faire l'appel API
  try {
    const data = await apiFunction();
    
    // Mettre en cache seulement si succès
    if (data) {
      cache.set(cacheKey, data, ttl);
    }
    
    return data;
  } catch (error) {
    // En cas d'erreur, essayer de retourner une version expirée du cache
    const expiredData = cache.cache.get(cacheKey);
    if (expiredData) {
      console.log(`⚠️ Utilisation du cache expiré suite à une erreur: ${cacheKey}`);
      return expiredData.data;
    }
    
    throw error;
  }
};

// Export par défaut
export default cache;