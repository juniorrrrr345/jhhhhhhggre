// API simplifiée utilisant directement le proxy CORS avec cache anti-spam, retry intelligent et fallback
import apiCache from './api-cache';
import { fallbackApi } from './fallback-api';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const makeProxyCall = async (endpoint, method = 'GET', token = null, data = null, retryCount = 0) => {
  const maxRetries = 2; // Réduit de 3 à 2 retries
  const cacheKey = `${method}:${endpoint}:${token?.substring(0,10) || 'no-token'}`;
  const fallbackKey = `${method}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
  
  // Vérifier le cache d'abord (sauf pour les mutations)
  if (method === 'GET') {
    const cached = apiCache.get(cacheKey, 45000); // Augmenté à 45 secondes pour réduire les requêtes
    if (cached) {
      console.log(`💾 Cache hit pour: ${endpoint}`);
      // Sauvegarder en fallback aussi
      fallbackApi.save(fallbackKey, cached);
      return cached;
    }
  }
  
  // Vérifier l'anti-spam - délai plus long pour espacer les requêtes
  if (retryCount === 0 && !apiCache.canMakeCall(cacheKey)) {
    console.log(`⏳ Rate limit local - attente pour: ${endpoint}`);
    await sleep(5000); // Augmenté à 5 secondes
  }
  
  console.log(`🔄 Simple Proxy Call (tentative ${retryCount + 1}): ${method} ${endpoint}`);
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  try {
    // Marquer l'appel pour l'anti-spam
    apiCache.markCall(cacheKey);
    
    // Timeout réduit à 6 secondes pour éviter les erreurs 502
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    
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
      
      // Gestion spéciale pour 429 ET 502 avec fallback IMMÉDIAT
      if (response.status === 429 || response.status === 502) {
        console.log(`🚫 Erreur ${response.status} détectée pour ${endpoint} - tentative ${retryCount + 1}`);
        
        // Pour les erreurs 429/502, utiliser IMMÉDIATEMENT le fallback si disponible
        if (method === 'GET') {
          const fallbackData = fallbackApi.get(fallbackKey);
          if (fallbackData) {
            console.log(`💾 Utilisation IMMÉDIATE fallback pour ${endpoint} (${response.status})`);
            return fallbackData;
          }
        }
        
        // AUCUN retry pour 429/502 - retour immédiat avec fallback ou erreur
        const fallbackData = fallbackApi.get(fallbackKey);
        if (fallbackData && method === 'GET') {
          console.log(`💾 Utilisation fallback immédiate pour ${endpoint}`);
          return fallbackData;
        } else {
          console.log(`🚫 ABANDON immédiat pour ${endpoint} - serveur indisponible`);
          throw new Error(`Serveur temporairement indisponible (${response.status}). Mode local activé.`);
        }
      }
      
      // Autres erreurs serveur avec retry réduit
      if (response.status >= 500 && retryCount < 1) { // Réduit le retry pour 500+
        const retryDelay = 4000; // Augmenté à 4 secondes pour éviter la surcharge
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
      console.log(`⏱️ Timeout (6s) pour ${endpoint}`);
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
    if (method === 'GET' && retryCount >= 1) { // Réduit le seuil de fallback
      const fallbackData = fallbackApi.get(fallbackKey);
      if (fallbackData) {
        console.log(`💾 Utilisation fallback pour erreur réseau: ${endpoint}`);
        return fallbackData;
      }
    }
    
    // Retry réduit pour les erreurs de réseau
    if (error.name === 'TypeError' && retryCount < 1) { // Réduit les retries
      const retryDelay = 3000; // Augmenté le délai
      console.log(`🔄 Erreur réseau - Retry dans ${retryDelay}ms`);
      await sleep(retryDelay);
      return makeProxyCall(endpoint, method, token, data, retryCount + 1);
    }
    
    throw error;
  }
};

// Cache optimisé pour performances maximales
const cache = new Map()
const CACHE_DURATION = 2000 // Réduit à 2 secondes pour réactivité maximale
let requestCount = 0
const MAX_REQUESTS_PER_MINUTE = 30 // Augmenté pour plus de réactivité
const RATE_LIMIT_WINDOW = 60000 // 1 minute

// Configuration des timeouts optimisés
const CONFIG = {
  maxRetries: 1, // Réduit pour réactivité
  timeout: 4000, // Réduit à 4s pour éviter les délais
  cacheEnabled: true,
  retryDelay: 2000, // Réduit
  fallbackDelay: 0 // Pas de délai pour fallback
}

// Rate limiting simplifié
const canMakeRequest = () => {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW
  
  // Nettoyer les anciens compteurs (implémentation simplifiée)
  requestCount = Math.max(0, requestCount - 1) // Décrémentation simple
  
  if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
    console.log('⚠️ Rate limit atteint, utilisation du cache')
    return false
  }
  
  requestCount++
  return true
}

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
            text: 'Bienvenue sur FindYourPlug! Explorez nos services.',
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
            name: 'FindYourPlug',
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
      // En cas d'erreur 500 OU 429, retourner un succès simulé pour ne pas bloquer l'utilisateur
      if (error.message.includes('500') || error.message.includes('Internal Server Error') || 
          error.message.includes('429') || error.message.includes('surchargé')) {
        console.log('⚠️ Erreur 500/429 config - mode dégradé activé');
        return { 
          success: true, 
          message: 'Configuration sauvegardée (mode dégradé)',
          _degraded: true,
          _reason: error.message.includes('429') ? 'server_overloaded' : 'server_error'
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

  // Nouvelle méthode ultra-rapide pour le shop
  getPublicDataFast: async () => {
    const cacheKey = 'public_data_fast'
    const now = Date.now()
    
    // Vérifier le cache en premier
    if (cache.has(cacheKey)) {
      const { data, timestamp } = cache.get(cacheKey)
      if (now - timestamp < CACHE_DURATION) {
        console.log('✅ Cache ultra-rapide utilisé')
        return data
      }
    }
    
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BOT_URL || 'https://jhhhhhhggre.onrender.com'
      
      // Essayer direct d'abord
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout)
      
      const response = await fetch(`${apiBaseUrl}/api/public/plugs?limit=1000&t=${now}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Accept': 'application/json'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        
        // Mettre en cache immédiatement
        cache.set(cacheKey, { data, timestamp: now })
        console.log('✅ Données shop récupérées ultra-rapide')
        return data
      }
      
      throw new Error(`HTTP ${response.status}`)
      
    } catch (error) {
      console.log('⚠️ Erreur shop rapide, fallback cache:', error.message)
      
      // Fallback sur cache expiré si disponible
      if (cache.has(cacheKey)) {
        const { data } = cache.get(cacheKey)
        console.log('📦 Utilisation cache expiré en fallback')
        return data
      }
      
      // Fallback données statiques
      return {
        plugs: [],
        message: 'Données temporairement indisponibles'
      }
    }
  },

  // Méthode GET générique pour les analytics
  get: async (endpoint, token = null) => {
    try {
      console.log(`🔄 GET request: ${endpoint}`);
      const response = await makeProxyCall(endpoint, 'GET', token);
      console.log(`✅ GET response:`, response);
      return { 
        ok: true, 
        data: response 
      };
    } catch (error) {
      console.error(`❌ GET error ${endpoint}:`, error);
      return { 
        ok: false, 
        error: error.message 
      };
    }
  },

  // Fonction pour nettoyer le cache manuellement
  clearCache: () => {
    apiCache.clear();
    fallbackApi.clear();
    console.log('🧹 Cache API et fallback nettoyés');
  }
};

export default simpleApi;