import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Instance axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Intercepteur pour ajouter l'authentification
api.interceptors.request.use((config) => {
  const password = localStorage.getItem('admin_password');
  if (password) {
    config.headers.Authorization = `Bearer ${password}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_password');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== API CONFIGURATION =====

export const configAPI = {
  // Récupérer la configuration
  get: async () => {
    const response = await api.get('/api/config');
    return response.data;
  },

  // Mettre à jour la configuration
  update: async (config) => {
    const response = await api.put('/api/config', config);
    return response.data;
  }
};

// ===== API PLUGS =====

export const plugsAPI = {
  // Récupérer tous les plugs
  getAll: async (params = {}) => {
    const response = await api.get('/api/plugs', { params });
    return response.data;
  },

  // Récupérer un plug par ID
  getById: async (id) => {
    const response = await api.get(`/api/plugs/${id}`);
    return response.data;
  },

  // Créer un nouveau plug
  create: async (plug) => {
    const response = await api.post('/api/plugs', plug);
    return response.data;
  },

  // Mettre à jour un plug
  update: async (id, plug) => {
    const response = await api.put(`/api/plugs/${id}`, plug);
    return response.data;
  },

  // Supprimer un plug
  delete: async (id) => {
    const response = await api.delete(`/api/plugs/${id}`);
    return response.data;
  }
};

// ===== API UPLOADS =====

export const uploadAPI = {
  // Upload d'image
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// ===== API STATISTIQUES =====

export const statsAPI = {
  // Récupérer les statistiques
  get: async () => {
    const response = await api.get('/api/stats');
    return response.data;
  }
};

// ===== API SYSTÈME =====

export const systemAPI = {
  // Vérifier la santé de l'API
  health: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Authentification
  authenticate: async (password) => {
    // Test avec une requête simple
    const testApi = axios.create({
      baseURL: API_BASE_URL,
      headers: { Authorization: `Bearer ${password}` }
    });
    
    const response = await testApi.get('/api/config');
    return response.status === 200;
  }
};

export default api;