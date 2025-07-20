// Utilitaire pour les appels API
const getApiBaseUrl = () => {
  // Priorité: NEXT_PUBLIC_API_BASE_URL > API_BASE_URL > fallback
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
                 process.env.API_BASE_URL || 
                 'https://jhhhhhhggre.onrender.com';
  
  console.log('🔗 API Base URL utilisée:', apiUrl);
  return apiUrl;
};

// Configuration pour tous les appels API
const getApiConfig = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return {
    headers,
    cache: 'no-cache'
  };
};

// Fonction utilitaire pour les appels API avec gestion d'erreur
export const apiCall = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  console.log('📡 API Call:', url);
  
  try {
    const response = await fetch(url, {
      ...getApiConfig(options.token),
      ...options,
    });
    
    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Data received:', data);
    return data;
  } catch (error) {
    console.error('💥 API Error:', error);
    throw error;
  }
};

// Fonctions spécifiques pour l'API
export const api = {
  // Configuration
  getConfig: (token) => apiCall('/api/config', { token }),
  updateConfig: (token, data) => apiCall('/api/config', { 
    method: 'PUT', 
    token, 
    body: JSON.stringify(data) 
  }),
  
  // Plugs admin
  getPlugs: (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/plugs?${queryString}`, { token });
  },
  createPlug: (token, data) => apiCall('/api/plugs', { 
    method: 'POST', 
    token, 
    body: JSON.stringify(data) 
  }),
  
  // Plugs publics (boutique)
  getPublicPlugs: (params = {}) => {
    const queryString = new URLSearchParams({
      ...params,
      t: new Date().getTime() // Cache busting
    }).toString();
    return apiCall(`/api/public/plugs?${queryString}`);
  },
  
  // Stats
  getStats: (token) => apiCall('/api/stats', { token })
};

export default api;