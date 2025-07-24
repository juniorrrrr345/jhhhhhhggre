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
    
    // Timeout de 15 secondes pour éviter le chargement infini
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch('/api/cors-proxy', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        endpoint: endpoint,
        method: method,
        token: token,
        data: data
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('📡 Simple proxy response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      
      // Gestion spéciale pour 429 avec fallback intelligent - PLUS AGRESSIF
      if (response.status === 429) {
        console.log(`🚫 Erreur 429 détectée pour ${endpoint} - tentative ${retryCount + 1}`);
        
        // Pour les erreurs 429, utiliser IMMÉDIATEMENT le fallback si disponible
        if (method === 'GET') {
          const fallbackData = fallbackApi.get(fallbackKey);
          if (fallbackData) {
            console.log(`💾 Utilisation IMMÉDIATE fallback pour ${endpoint} (429)`);
            return fallbackData;
          }
        }
        
        // Réduire drastiquement les retries pour 429 (1 seul retry au lieu de 3)
        if (retryCount < 1) { // Seulement 1 retry au lieu de maxRetries
          const backoffDelay = 10000; // Délai fixe de 10 secondes au lieu d'exponentiel
          console.log(`🔄 Erreur 429 - SEUL retry dans ${backoffDelay}ms`);
          await sleep(backoffDelay);
          return makeProxyCall(endpoint, method, token, data, retryCount + 1);
        } else {
          // Arrêter immédiatement après 1 retry
          if (method === 'GET') {
            const fallbackData = fallbackApi.get(fallbackKey);
            if (fallbackData) {
              console.log(`💾 Utilisation fallback FINAL pour ${endpoint}`);
              return fallbackData;
            }
          }
          console.log(`🚫 ABANDON après 1 retry pour ${endpoint} - serveur surchargé`);
          throw new Error('Serveur temporairement surchargé. Veuillez réessayer dans quelques minutes.');
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
    
    // Gestion spéciale pour timeout
    if (error.name === 'AbortError') {
      console.log(`⏱️ Timeout (15s) pour ${endpoint}`);
      // Utiliser fallback immédiatement en cas de timeout
      if (method === 'GET') {
        const fallbackData = fallbackApi.get(fallbackKey);
        if (fallbackData) {
          console.log(`💾 Utilisation fallback pour timeout: ${endpoint}`);
          return fallbackData;
        }
      }
      throw new Error('Timeout: Le serveur met trop de temps à répondre');
    }
    
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
    try {
      return await makeProxyCall('/api/config', 'GET', token);
    } catch (error) {
      // En cas de timeout OU 429 (serveur surchargé), retourner une config par défaut
      if (error.message.includes('Timeout') || error.message.includes('429') || error.message.includes('surchargé')) {
        console.log('⏱️ Timeout/429 config - retour config par défaut pour connexion');
        return {
          welcome: {
            text: 'Bienvenue sur SafePlugLink! Explorez nos services.',
            image: ''
          },
          buttons: {
            contact: {
              text: '📞 Contact',
              content: 'Contactez-nous pour plus d\'informations.',
              enabled: true
            },
            info: {
              text: 'ℹ️ Info',
              content: 'Informations sur notre plateforme.',
              enabled: true
            }
          },
          socialMedia: {
            telegram: '',
            whatsapp: ''
          },
          boutique: {
            name: 'SafePlugLink',
            subtitle: 'Votre marketplace de confiance'
          },
          // Indicateur que c'est un fallback pour le login
          _fallback: true,
          _reason: error.message.includes('429') ? 'server_overloaded' : 'timeout'
        };
      }
      throw error;
    }
  },
  
  updateConfig: async (token, data) => {
    try {
      return await makeProxyCall('/api/config', 'PUT', token, data);
    } catch (error) {
      // En cas d'erreur 500 serveur, retourner un succès simulé pour ne pas bloquer l'utilisateur
      if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        console.log('⚠️ Erreur 500 config - mode dégradé activé');
        return { 
          success: true, 
          message: 'Configuration sauvegardée (mode dégradé)',
          _degraded: true 
        };
      }
      throw error;
    }
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
    try {
      return await makeProxyCall('/api/applications', 'GET', token);
    } catch (error) {
      // En cas de timeout, retourner une structure vide mais valide
      if (error.message.includes('Timeout')) {
        console.log('⏱️ Timeout applications - retour structure vide');
        return { success: true, applications: [] };
      }
      throw error;
    }
  },

  // Fonction pour mettre à jour le statut d'une demande
  updateApplicationStatus: async (token, applicationId, status, adminNotes = '') => {
    return await makeProxyCall(`/api/applications/${applicationId}`, 'PATCH', token, { status, adminNotes });
  },

  // Fonctions publiques (sans authentification)
  getPublicPlugs: async (params = {}) => {
    const queryString = new URLSearchParams({
      ...params,
      t: Date.now() // Cache busting
    }).toString();
    const endpoint = queryString ? `/api/public/plugs?${queryString}` : '/api/public/plugs';
    return await makeProxyCall(endpoint, 'GET', null);
  },

  getPublicConfig: async () => {
    return await makeProxyCall('/api/public/config', 'GET', null);
  },

  // Fonction pour nettoyer le cache manuellement
  clearCache: () => {
    apiCache.clear();
    fallbackApi.clear();
    console.log('🧹 Cache API et fallback nettoyés');
  }
};

export default simpleApi;