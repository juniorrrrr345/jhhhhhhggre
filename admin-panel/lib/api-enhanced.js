// API améliorée avec cache, gestion d'erreurs et retry
import { API_CONFIG, getBestApiUrl } from './api-config';
import { ApiError, handleApiError, retryWithBackoff } from './error-handler';
import { cache, CACHE_TYPES, cachedApiCall } from './unified-cache';

// Classe principale pour l'API
class EnhancedAPI {
  constructor() {
    this.baseUrl = getBestApiUrl();
    this.token = null;
  }
  
  // Définir le token d'authentification
  setToken(token) {
    this.token = token;
  }
  
  // Faire une requête avec toutes les améliorations
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      data = null,
      useCache = method === 'GET',
      cacheTTL = API_CONFIG.CACHE.DEFAULT_TTL,
      maxRetries = API_CONFIG.RETRY.MAX_ATTEMPTS,
      timeout = API_CONFIG.TIMEOUTS.DEFAULT
    } = options;
    
    // Fonction pour faire la requête
    const makeRequest = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch('/api/cors-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            endpoint,
            method,
            token: this.token,
            data
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new ApiError(
            errorData.error || `HTTP ${response.status}`,
            response.status,
            errorData
          );
        }
        
        const responseData = await response.json();
        return responseData;
        
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 0, { timeout });
        }
        
        throw error;
      }
    };
    
    // Utiliser le cache pour les GET
    if (useCache && method === 'GET') {
      return cachedApiCall(
        CACHE_TYPES.API_RESPONSE,
        () => retryWithBackoff(makeRequest, maxRetries),
        { endpoint, method },
        cacheTTL
      );
    }
    
    // Sans cache pour les autres méthodes
    return retryWithBackoff(makeRequest, maxRetries);
  }
  
  // Méthodes spécifiques
  async getConfig() {
    return this.request('/api/config', {
      useCache: true,
      cacheTTL: API_CONFIG.CACHE.CONFIG_TTL
    });
  }
  
  async updateConfig(data) {
    const result = await this.request('/api/config', {
      method: 'PUT',
      data
    });
    
    // Vider le cache après mise à jour
    cache.clearByType(CACHE_TYPES.CONFIG);
    
    return result;
  }
  
  async getPlugs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/plugs?${queryString}` : '/api/plugs';
    
    return this.request(endpoint, {
      useCache: true,
      cacheTTL: API_CONFIG.CACHE.PLUGS_TTL
    });
  }
  
  async getPlug(id) {
    return this.request(`/api/plugs/${id}`, {
      useCache: true,
      cacheTTL: API_CONFIG.CACHE.PLUGS_TTL
    });
  }
  
  async createPlug(data) {
    const result = await this.request('/api/plugs', {
      method: 'POST',
      data
    });
    
    // Vider le cache des plugs
    cache.clearByType(CACHE_TYPES.PLUGS);
    
    return result;
  }
  
  async updatePlug(id, data) {
    const result = await this.request(`/api/plugs/${id}`, {
      method: 'PUT',
      data
    });
    
    // Vider TOUS les caches pour garantir la fraîcheur des données
    cache.clear();
    
    // Vider aussi le localStorage et sessionStorage
    if (typeof window !== 'undefined') {
      const keysToRemove = ['plugsCache', 'apiCache', 'configCache', 'miniapp_last_fetch'];
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    }
    
    // Forcer le refresh du bot
    this.refreshBot().catch(console.error);
    
    return result;
  }
  
  async deletePlug(id) {
    const result = await this.request(`/api/plugs/${id}`, {
      method: 'DELETE'
    });
    
    // Vider le cache des plugs
    cache.clearByType(CACHE_TYPES.PLUGS);
    
    return result;
  }
  
  async refreshBot() {
    try {
      // Vider le cache du bot
      await fetch(`${this.baseUrl}/api/cache/refresh`, {
        method: 'POST'
      });
      
      // Forcer le rechargement des données publiques
      await fetch(`${this.baseUrl}/api/public/plugs?force=${Date.now()}`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      console.log('✅ Bot refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh bot:', error);
    }
  }
  
  // Méthodes publiques (sans auth)
  async getPublicPlugs(params = {}) {
    const queryString = new URLSearchParams({
      ...params,
      t: Date.now() // Cache busting
    }).toString();
    
    const endpoint = `/api/public/plugs?${queryString}`;
    
    // Pas de token pour les endpoints publics
    const savedToken = this.token;
    this.token = null;
    
    try {
      const result = await this.request(endpoint, {
        useCache: true,
        cacheTTL: API_CONFIG.CACHE.PLUGS_TTL
      });
      
      return result;
    } finally {
      this.token = savedToken;
    }
  }
  
  async getPublicConfig() {
    // Pas de token pour les endpoints publics
    const savedToken = this.token;
    this.token = null;
    
    try {
      const result = await this.request('/api/public/config', {
        useCache: true,
        cacheTTL: API_CONFIG.CACHE.CONFIG_TTL
      });
      
      return result;
    } finally {
      this.token = savedToken;
    }
  }
  
  // Obtenir les stats du cache
  getCacheStats() {
    return cache.getStats();
  }
  
  // Vider le cache
  clearCache() {
    cache.clear();
  }
}

// Instance singleton
export const api = new EnhancedAPI();

// Export par défaut
export default api;