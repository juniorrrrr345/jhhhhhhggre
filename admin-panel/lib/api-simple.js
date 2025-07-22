// API simplifiée utilisant directement le proxy CORS

const makeProxyCall = async (endpoint, method = 'GET', token = null, data = null) => {
  console.log(`🔄 Simple Proxy Call: ${method} ${endpoint}`);
  
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
        token: token,
        data: data
      })
    });
    
    console.log('📡 Simple proxy response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Proxy error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }
    
    const responseData = await response.json();
    console.log('✅ Simple proxy data received');
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

  // Fonction pour récupérer les demandes d'inscription
  getApplications: async (token) => {
    return await makeProxyCall('/api/applications', 'GET', token);
  },

  // Fonction pour mettre à jour le statut d'une demande
  updateApplicationStatus: async (token, applicationId, status, adminNotes = '') => {
    return await makeProxyCall(`/api/applications/${applicationId}`, 'PATCH', token, { status, adminNotes });
  }
};

export default simpleApi;