// API simplifiée utilisant directement le proxy CORS avec cache anti-spam
import apiCache from './api-cache';

const makeProxyCall = async (endpoint, method = 'GET', token = null, data = null) => {
  const cacheKey = `${method}:${endpoint}:${token?.substring(0,10) || 'no-token'}`;
  
  // Vérifier le cache d'abord (sauf pour les mutations)
  if (method === 'GET') {
    const cached = apiCache.get(cacheKey, 15000); // 15 secondes pour GET
    if (cached) {
      console.log(`💾 Cache hit pour: ${endpoint}`);
      return cached;
    }
  }
  
  // Vérifier l'anti-spam
  if (!apiCache.canMakeCall(cacheKey)) {
    console.log(`⏳ Rate limit - attente pour: ${endpoint}`);
    throw new Error('Trop de tentatives d\'authentification. Veuillez patienter quelques secondes.');
  }
  
  console.log(`🔄 Simple Proxy Call: ${method} ${endpoint}`);
  
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
      
      // Gestion spéciale pour 429
      if (response.status === 429) {
        throw new Error('Trop de tentatives d\'authentification');
      }
      
      throw new Error(`Proxy error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }
    
    const responseData = await response.json();
    console.log('✅ Simple proxy data received');
    
    // Mettre en cache les réponses GET réussies
    if (method === 'GET') {
      apiCache.set(cacheKey, responseData);
    }
    
    return responseData;
    
  } catch (error) {
    console.error('💥 Simple Proxy Error:', error);
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
    console.log('🧹 Cache API nettoyé');
  }
};

export default simpleApi;