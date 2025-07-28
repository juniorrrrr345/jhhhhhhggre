// Gestionnaire d'erreurs centralisé

export class ApiError extends Error {
  constructor(message, status, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Types d'erreurs
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR'
};

// Messages d'erreur user-friendly
const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Problème de connexion. Vérifiez votre connexion internet.',
  [ERROR_TYPES.TIMEOUT]: 'La requête a pris trop de temps. Réessayez plus tard.',
  [ERROR_TYPES.AUTH]: 'Problème d\'authentification. Reconnectez-vous.',
  [ERROR_TYPES.VALIDATION]: 'Les données fournies sont invalides.',
  [ERROR_TYPES.SERVER]: 'Erreur serveur. Nous travaillons sur le problème.',
  [ERROR_TYPES.RATE_LIMIT]: 'Trop de requêtes. Attendez quelques instants.',
  [ERROR_TYPES.NOT_FOUND]: 'Ressource introuvable.'
};

// Analyser et classifier l'erreur
export const classifyError = (error) => {
  if (!error) return ERROR_TYPES.SERVER;
  
  // Erreur réseau
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return ERROR_TYPES.NETWORK;
  }
  
  // Timeout
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return ERROR_TYPES.TIMEOUT;
  }
  
  // Erreur HTTP
  if (error.status) {
    if (error.status === 401 || error.status === 403) return ERROR_TYPES.AUTH;
    if (error.status === 404) return ERROR_TYPES.NOT_FOUND;
    if (error.status === 429) return ERROR_TYPES.RATE_LIMIT;
    if (error.status === 400) return ERROR_TYPES.VALIDATION;
    if (error.status >= 500) return ERROR_TYPES.SERVER;
  }
  
  return ERROR_TYPES.SERVER;
};

// Gestionnaire principal d'erreurs
export const handleApiError = (error, context = {}) => {
  const errorType = classifyError(error);
  const userMessage = ERROR_MESSAGES[errorType] || 'Une erreur inattendue s\'est produite.';
  
  // Logger l'erreur
  console.error(`[${errorType}] ${context.operation || 'API'}:`, {
    message: error.message,
    status: error.status,
    details: error.details || {},
    context,
    timestamp: new Date().toISOString()
  });
  
  // Retourner une erreur structurée
  return {
    success: false,
    error: userMessage,
    errorType,
    technical: error.message,
    retry: errorType !== ERROR_TYPES.AUTH && errorType !== ERROR_TYPES.VALIDATION
  };
};

// Wrapper pour les appels API avec gestion d'erreur
export const safeApiCall = async (apiFunction, context = {}) => {
  try {
    const result = await apiFunction();
    return { success: true, data: result };
  } catch (error) {
    return handleApiError(error, context);
  }
};

// Retry avec backoff exponentiel
export const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Ne pas retry pour certaines erreurs
      const errorType = classifyError(error);
      if ([ERROR_TYPES.AUTH, ERROR_TYPES.VALIDATION, ERROR_TYPES.NOT_FOUND].includes(errorType)) {
        throw error;
      }
      
      // Attendre avant de réessayer
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`🔄 Retry ${i + 1}/${maxRetries} dans ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};