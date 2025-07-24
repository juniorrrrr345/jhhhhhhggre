import { createContext, useContext } from 'react'
import { simpleApi as api } from '../lib/api-simple'

const ApiContext = createContext()

export const useApi = () => {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider')
  }
  return context
}

export const ApiProvider = ({ children }) => {
  // Wrapper functions that handle CORS automatically
  const apiMethods = {
    // Utilise le proxy pour éviter les problèmes CORS
    async fetchWithProxy(endpoint, options = {}) {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        throw new Error('No auth token')
      }
      
      try {
        // Essayer d'abord l'API proxy
        return await api.proxyCall(endpoint, options.method || 'GET', token, options.body)
      } catch (error) {
        console.error('API Proxy error:', error)
        throw error
      }
    },
    
    // Méthodes spécifiques
    getStats: () => api.getStats(localStorage.getItem('adminToken')),
    getConfig: () => api.getConfig(localStorage.getItem('adminToken')),
    updateConfig: (data) => api.updateConfig(localStorage.getItem('adminToken'), data),
    getPlugs: (params = {}) => api.getPlugs(localStorage.getItem('adminToken'), params),
    createPlug: (data) => api.createPlug(localStorage.getItem('adminToken'), data),
    updatePlug: (id, data) => api.updatePlug(localStorage.getItem('adminToken'), id, data),
    deletePlug: (id) => api.deletePlug(localStorage.getItem('adminToken'), id),
    broadcast: (data) => api.broadcast(localStorage.getItem('adminToken'), data),
    reloadBot: () => api.reloadBot(localStorage.getItem('adminToken'))
  }
  
  return (
    <ApiContext.Provider value={apiMethods}>
      {children}
    </ApiContext.Provider>
  )
}