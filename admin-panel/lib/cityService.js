// Service pour gérer les villes dans le panel admin
class CityService {
  constructor() {
    // Cache des villes par pays
    this.citiesCache = {};
  }

  // Récupérer les villes depuis l'API
  async fetchCities(country, token) {
    // Vérifier le cache d'abord
    if (this.citiesCache[country]) {
      return this.citiesCache[country];
    }

    try {
      const response = await fetch('/api/cors-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: `/api/cities/${country}`,
          method: 'GET',
          token: token
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        this.citiesCache[country] = data.cities || [];
        return data.cities || [];
      } else if (response.status === 404) {
        // Pays non trouvé, c'est normal
        console.log(`Pas de villes disponibles pour ${country}`);
        this.citiesCache[country] = [];
        return [];
      } else {
        throw new Error(`Erreur API: ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des villes:', error);
      throw error;
    }
  }

  // Rechercher des villes
  searchCities(cities, searchTerm) {
    if (!searchTerm) return cities;
    
    const term = searchTerm.toLowerCase();
    return cities.filter(city => city.toLowerCase().includes(term));
  }

  // Vider le cache
  clearCache() {
    this.citiesCache = {};
  }

  // Récupérer toutes les villes en cache
  getCachedCities(country) {
    return this.citiesCache[country] || [];
  }
}

export default new CityService();