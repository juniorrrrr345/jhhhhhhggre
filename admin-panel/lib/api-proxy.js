// Utilitaire API utilisant le proxy CORS
const useProxy = true; // Force l'utilisation du proxy

// Fonction pour faire des appels via le proxy
const proxyCall = async (endpoint, method = 'GET', token = null, body = null) => {
  console.log(`🔄 Proxy API Call: ${method} ${endpoint}`);
  console.log(`🔑 Token fourni: ${token ? 'Oui' : 'Non'}`);
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  try {
    const response = await fetch('/api/cors-proxy', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        endpoint: endpoint,
        method: method,
        token: token, // Le token doit être dans le body, pas dans les headers
        data: body
      })
    });
    
    console.log('📡 Proxy response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Proxy error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log('✅ Proxy data received');
    return data;
    
  } catch (error) {
    console.error('💥 Proxy API Error:', error);
    throw error;
  }
};

// Fonction direct call (fallback)
const directCall = async (endpoint, options = {}) => {
  const baseUrl = 'https://jhhhhhhggre.onrender.com';
  const url = `${baseUrl}${endpoint}`;
  
  console.log('📡 Direct API Call:', url);
  
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };
  
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {})
      }
    });
    
    console.log('📊 Direct response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Direct data received');
    return data;
  } catch (error) {
    console.error('💥 Direct API Error:', error);
    throw error;
  }
};

// Fonction principale qui choisit entre proxy et direct
export const apiCall = async (endpoint, options = {}) => {
  if (useProxy) {
    return proxyCall(
      endpoint, 
      options.method || 'GET', 
      options.token, 
      options.body ? JSON.parse(options.body) : null
    );
  } else {
    return directCall(endpoint, options);
  }
};

// Export de la fonction proxy pour usage direct
export { proxyCall };

// API functions optimisées pour le proxy
export const api = {
  // Configuration
  getConfig: (token) => proxyCall('/api/config', 'GET', token),
  
  updateConfig: (token, data) => proxyCall('/api/config', 'PUT', token, data),
  
  // Health check
  getHealth: () => proxyCall('/health', 'GET'),
  
  // Plugs admin
  getPlugs: (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/plugs?${queryString}` : '/api/plugs';
    return proxyCall(endpoint, 'GET', token);
  },
  
  getPlug: (token, id) => proxyCall(`/api/plugs/${id}`, 'GET', token),
  
  createPlug: (token, data) => proxyCall('/api/plugs', 'POST', token, data),
  
  updatePlug: (token, id, data) => proxyCall(`/api/plugs/${id}`, 'PUT', token, data),
  
  deletePlug: (token, id) => proxyCall(`/api/plugs/${id}`, 'DELETE', token),
  
  // Stats
  getStats: (token) => proxyCall('/api/stats', 'GET', token),
  
  // Broadcast
  broadcast: (token, data) => proxyCall('/api/broadcast', 'POST', token, data),
  
  // Bot reload
  reloadBot: (token) => proxyCall('/api/bot/reload', 'POST', token),
  
  // Plugs publics (pour la boutique) - utilise directCall car pas d'auth nécessaire
  getPublicPlugs: async (params = {}) => {
    try {
      // Essayer d'abord en direct pour les données publiques
      const queryString = new URLSearchParams({
        ...params,
        t: new Date().getTime()
      }).toString();
      return await directCall(`/api/public/plugs?${queryString}`);
    } catch (error) {
      // Fallback sur le proxy si nécessaire
      console.log('🔄 Fallback vers proxy pour public plugs');
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/api/public/plugs?${queryString}` : '/api/public/plugs';
      return await proxyCall(endpoint, 'GET');
    }
  },
  
  getPublicConfig: async () => {
    try {
      return await directCall('/api/public/config');
    } catch (error) {
      console.log('🔄 Fallback vers proxy pour public config');
      return await proxyCall('/api/public/config', 'GET');
    }
  }
};

export default api;