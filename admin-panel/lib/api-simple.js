// API simplifiée utilisant directement le proxy CORS avec cache anti-spam, retry intelligent et fallback
import apiCache from './api-cache';
import { fallbackApi } from './fallback-api';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const makeProxyCall = async (endpoint, method = 'GET', token = null, data = null, retryCount = 0) => {
  const maxRetries = 3;
  const cacheKey = `${method}:${endpoint}:${token?.substring(0,10) || 'no-token'}`;
  const fallbackKey = `${method}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
  
  // Vérifier le cache d'abord (sauf pour les mutations)
  if (method === 'GET') {
    const cached = apiCache.get(cacheKey, 30000); // 30 secondes pour GET
    if (cached) {
      console.log(`💾 Cache hit pour: ${endpoint}`);
      // Sauvegarder en fallback aussi
      fallbackApi.save(fallbackKey, cached);
      return cached;
    }
  }
  
  // Vérifier l'anti-spam seulement pour le premier essai
  if (retryCount === 0 && !apiCache.canMakeCall(cacheKey)) {
    console.log(`⏳ Rate limit local - attente pour: ${endpoint}`);
    await sleep(3000); // Attendre 3 secondes
  }
  
  console.log(`🔄 Simple Proxy Call (tentative ${retryCount + 1}): ${method} ${endpoint}`);
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  try {
    // Marquer l'appel pour l'anti-spam
    apiCache.markCall(cacheKey);
    
    const response = await fetch('/api/cors-proxy', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        endpoint: endpoint,
        method: method,
        token: token,
        data: data
      })
    });
    
    console.log('📡 Simple proxy response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      
      // Gestion spéciale pour 429 avec fallback intelligent
      if (response.status === 429) {
        // Essayer de récupérer depuis le fallback
        if (method === 'GET') {
          const fallbackData = fallbackApi.get(fallbackKey);
          if (fallbackData) {
            console.log(`💾 Utilisation fallback pour ${endpoint} (429)`);
            return fallbackData;
          }
        }
        
        if (retryCount < maxRetries) {
          const backoffDelay = Math.pow(2, retryCount) * 3000; // Délai exponentiel: 3s, 6s, 12s
          console.log(`🔄 Erreur 429 - Retry dans ${backoffDelay}ms (tentative ${retryCount + 1}/${maxRetries})`);
          await sleep(backoffDelay);
          return makeProxyCall(endpoint, method, token, data, retryCount + 1);
        } else {
          // Dernière tentative avec fallback
          if (method === 'GET') {
            const fallbackData = fallbackApi.get(fallbackKey);
            if (fallbackData) {
              console.log(`💾 Utilisation fallback final pour ${endpoint}`);
              return fallbackData;
            }
          }
          throw new Error('Serveur surchargé. Données en cache disponibles sous peu.');
        }
      }
      
      // Autres erreurs serveur avec retry
      if (response.status >= 500 && retryCount < maxRetries) {
        const retryDelay = 3000; // 3 secondes pour erreurs serveur
        console.log(`🔄 Erreur ${response.status} - Retry dans ${retryDelay}ms`);
        await sleep(retryDelay);
        return makeProxyCall(endpoint, method, token, data, retryCount + 1);
      }
      
      throw new Error(`Erreur API: ${response.status} - ${errorData.error || 'Erreur inconnue'}`);
    }
    
    const responseData = await response.json();
    console.log('✅ Simple proxy data received');
    
    // Mettre en cache et en fallback les réponses GET réussies
    if (method === 'GET') {
      apiCache.set(cacheKey, responseData);
      fallbackApi.save(fallbackKey, responseData);
    }
    
    return responseData;
    
  } catch (error) {
    console.error('💥 Simple Proxy Error:', error);
    
    // Essayer le fallback pour les erreurs de réseau sur GET
    if (method === 'GET' && retryCount === maxRetries) {
      const fallbackData = fallbackApi.get(fallbackKey);
      if (fallbackData) {
        console.log(`💾 Utilisation fallback pour erreur réseau: ${endpoint}`);
        return fallbackData;
      }
    }
    
    // Retry pour les erreurs de réseau
    if (error.name === 'TypeError' && retryCount < maxRetries) {
      const retryDelay = 2000;
      console.log(`🔄 Erreur réseau - Retry dans ${retryDelay}ms`);
      await sleep(retryDelay);
      return makeProxyCall(endpoint, method, token, data, retryCount + 1);
    }
    
    throw error;
  }
};

// API simple et directe
export const simpleApi = {
  getConfig: async (token) => {
    return await makeProxyCall('/api/config', 'GET', token);
  },
  
  updateConfig: async (token, data) => {
    return await makeProxyCall('/api/config', 'PUT', token, data);
  },
  
  getStats: async (token) => {
    return await makeProxyCall('/api/stats', 'GET', token);
  },
  
  getPlugs: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/plugs?${queryString}` : '/api/plugs';
    return await makeProxyCall(endpoint, 'GET', token);
  },
  
  createPlug: async (token, data) => {
    return await makeProxyCall('/api/plugs', 'POST', token, data);
  },
  
  updatePlug: async (token, id, data) => {
    return await makeProxyCall(`/api/plugs/${id}`, 'PUT', token, data);
  },
  
  deletePlug: async (token, id) => {
    return await makeProxyCall(`/api/plugs/${id}`, 'DELETE', token);
  },
  
  reloadBot: async (token) => {
    return await makeProxyCall('/api/bot/reload', 'POST', token);
  },

  // Fonction pour envoyer des messages de diffusion
  broadcast: async (token, data) => {
    return await makeProxyCall('/api/broadcast', 'POST', token, data);
  },

  // Fonction pour récupérer les demandes d'inscription avec cache
  getApplications: async (token) => {
    return await makeProxyCall('/api/applications', 'GET', token);
  },

  // Fonction pour mettre à jour le statut d'une demande
  updateApplicationStatus: async (token, applicationId, status, adminNotes = '') => {
    return await makeProxyCall(`/api/applications/${applicationId}`, 'PATCH', token, { status, adminNotes });
  },

  // Fonction pour nettoyer le cache manuellement
  clearCache: () => {
    apiCache.clear();
    fallbackApi.clear();
    console.log('🧹 Cache API et fallback nettoyés');
  }
};

export default simpleApi;