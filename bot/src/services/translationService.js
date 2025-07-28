const fetch = require('node-fetch');

class TranslationService {
  constructor() {
    this.supportedLanguages = ['fr', 'en', 'it', 'es', 'de'];
    this.cache = new Map();
    this.apiUrl = 'https://api.mymemory.translated.net/get';
  }

  // Traduire un texte dans toutes les langues supportées
  async translateText(text, sourceLanguage = 'fr') {
    if (!text || typeof text !== 'string') return {};

    const cacheKey = `${text}_${sourceLanguage}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const translations = { [sourceLanguage]: text };

    for (const targetLang of this.supportedLanguages) {
      if (targetLang === sourceLanguage) continue;

      try {
        const translation = await this.translateToLanguage(text, sourceLanguage, targetLang);
        translations[targetLang] = translation;
        
        // Petite pause pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Erreur traduction ${sourceLanguage}->${targetLang}:`, error.message);
        translations[targetLang] = text; // Fallback sur le texte original
      }
    }

    // Mettre en cache pendant 1 heure
    this.cache.set(cacheKey, translations);
    setTimeout(() => this.cache.delete(cacheKey), 3600000);

    return translations;
  }

  // Traduire vers une langue spécifique
  async translateToLanguage(text, sourceLang, targetLang) {
    if (sourceLang === targetLang) return text;

    const params = new URLSearchParams({
      q: text,
      langpair: `${sourceLang}|${targetLang}`,
      de: 'findyourplug@gmail.com' // Email pour MyMemory API
    });

    const response = await fetch(`${this.apiUrl}?${params}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'FindYourPlug Bot v1.0'
      },
      timeout: 5000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData) {
      return data.responseData.translatedText;
    }

    throw new Error('Translation failed');
  }

  // Traduire un objet boutique complet
  async translateShop(shop, sourceLanguage = 'fr') {
    try {
      console.log(`🌍 Traduction automatique de la boutique: ${shop.name}`);

      const translatedShop = {
        ...shop,
        translations: {}
      };

      // Traduire le nom
      const nameTranslations = await this.translateText(shop.name, sourceLanguage);
      translatedShop.translations.name = nameTranslations;

      // Traduire la description
      if (shop.description) {
        const descriptionTranslations = await this.translateText(shop.description, sourceLanguage);
        translatedShop.translations.description = descriptionTranslations;
      }

      // Traduire les services
      if (shop.services) {
        translatedShop.translations.services = {};

        for (const [serviceType, serviceData] of Object.entries(shop.services)) {
          if (serviceData.description) {
            const serviceTranslations = await this.translateText(serviceData.description, sourceLanguage);
            translatedShop.translations.services[serviceType] = {
              description: serviceTranslations
            };
          }
        }
      }

      console.log(`✅ Traduction terminée pour: ${shop.name}`);
      return translatedShop;

    } catch (error) {
      console.error('❌ Erreur traduction boutique:', error);
      return shop; // Retourner la boutique originale en cas d'erreur
    }
  }

  // Obtenir le texte traduit pour une langue donnée
  getTranslatedText(translations, language, fallbackText = '') {
    if (!translations || typeof translations !== 'object') {
      return fallbackText;
    }

    return translations[language] || translations['fr'] || fallbackText;
  }

  // Traduire une liste de boutiques
  async translateShops(shops, sourceLanguage = 'fr') {
    const translatedShops = [];

    for (let i = 0; i < shops.length; i++) {
      const shop = shops[i];
      console.log(`🔄 Traduction ${i + 1}/${shops.length}: ${shop.name}`);
      
      const translatedShop = await this.translateShop(shop, sourceLanguage);
      translatedShops.push(translatedShop);

      // Pause entre les boutiques pour éviter le rate limiting
      if (i < shops.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return translatedShops;
  }

  // Nettoyer le cache
  clearCache() {
    this.cache.clear();
    console.log('🧹 Cache de traduction vidé');
  }
}

// Instance globale
const translationService = new TranslationService();

module.exports = translationService;