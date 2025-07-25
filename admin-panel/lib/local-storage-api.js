// API de stockage local pour fonctionner sans dépendre du serveur bot
class LocalStorageAPI {
  constructor() {
    this.storageKey = 'findyourplug_config'
    this.init()
  }

  init() {
    // Initialiser la config par défaut si elle n'existe pas
    if (!localStorage.getItem(this.storageKey)) {
      const defaultConfig = {
        boutique: {
          name: 'FINDYOURPLUG',
          subtitle: 'Trouvez vos boutiques facilement'
        },
        welcome: {
          text: 'Bienvenue sur FindYourPlug!',
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
        socialMediaList: [],
        languages: {
          enabled: false,
          currentLanguage: 'fr',
          availableLanguages: [
            { code: 'fr', name: 'Français', flag: '🇫🇷', enabled: true },
            { code: 'en', name: 'English', flag: '🇬🇧', enabled: true },
            { code: 'it', name: 'Italiano', flag: '🇮🇹', enabled: true },
            { code: 'es', name: 'Español', flag: '🇪🇸', enabled: true },
            { code: 'de', name: 'Deutsch', flag: '🇩🇪', enabled: true }
          ],
          translations: {}
        },
        _isLocal: true,
        _lastSaved: new Date().toISOString()
      }
      
      this.save(defaultConfig)
    }
  }

  save(config) {
    config._lastSaved = new Date().toISOString()
    config._isLocal = true
    localStorage.setItem(this.storageKey, JSON.stringify(config))
    console.log('💾 Configuration sauvegardée localement')
    return config
  }

  load() {
    try {
      const data = localStorage.getItem(this.storageKey)
      if (data) {
        const config = JSON.parse(data)
        console.log('📁 Configuration chargée depuis le stockage local')
        return config
      }
    } catch (error) {
      console.error('Erreur lecture config locale:', error)
    }
    return null
  }

  // API compatible avec le système existant
  async getConfig() {
    return this.load()
  }

  async updateConfig(configData) {
    const currentConfig = this.load() || {}
    const updatedConfig = { ...currentConfig, ...configData }
    return this.save(updatedConfig)
  }

  async updateSocialMedia(socialMediaList) {
    const config = this.load() || {}
    config.socialMediaList = socialMediaList
    return this.save(config)
  }

  async updateLanguages(languagesConfig) {
    const config = this.load() || {}
    config.languages = { ...config.languages, ...languagesConfig }
    return this.save(config)
  }

  // Méthode pour essayer de synchroniser avec le serveur (optionnel)
  async syncWithServer(serverApi) {
    try {
      const localConfig = this.load()
      if (localConfig && localConfig._isLocal) {
        console.log('🔄 Tentative de synchronisation avec le serveur...')
        
        // Essayer d'envoyer la config locale au serveur
        const token = localStorage.getItem('adminToken') || 'JuniorAdmon123'
        await serverApi.updateConfig(token, localConfig)
        
        // Marquer comme synchronisé
        localConfig._isLocal = false
        localConfig._lastSynced = new Date().toISOString()
        this.save(localConfig)
        
        console.log('✅ Synchronisation réussie')
        return true
      }
    } catch (error) {
      console.log('⚠️ Synchronisation échouée, mode local maintenu')
      return false
    }
  }

  clear() {
    localStorage.removeItem(this.storageKey)
    this.init()
  }

  // Status de la configuration
  getStatus() {
    const config = this.load()
    if (!config) return 'empty'
    if (config._isLocal) return 'local'
    return 'synced'
  }
}

export const localApi = new LocalStorageAPI()
export default localApi