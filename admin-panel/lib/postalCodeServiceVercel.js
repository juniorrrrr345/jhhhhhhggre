// Service pour gérer les codes postaux par pays - VERSION VERCEL (sync avec API bot)
class PostalCodeServiceVercel {
  constructor() {
    this.postalCodes = {};
    this.lastReload = new Date(0); // Force le premier chargement
    this.isLoading = false;
  }

  // Charger dynamiquement depuis l'API du bot (comme le fait le reste de Vercel)
  async loadPostalCodesFromBotAPI() {
    if (this.isLoading) {
      console.log('⏳ Chargement déjà en cours...');
      return;
    }

    try {
      this.isLoading = true;
      console.log('🔍 Chargement codes postaux depuis API bot...');
      
      const response = await fetch('https://jhhhhhhggre.onrender.com/api/public/plugs?limit=50', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      const countryDepartments = {};

      if (data && data.plugs && Array.isArray(data.plugs)) {
        console.log(`📦 ${data.plugs.length} boutiques trouvées via API`);
        
        data.plugs.forEach(plug => {
          console.log(`📍 Boutique: ${plug.name} (Pays: ${plug.countries ? plug.countries.join(', ') : 'Aucun'})`);
          
          // Extraire les pays de cette boutique ACTIVE
          if (plug.countries && Array.isArray(plug.countries)) {
            plug.countries.forEach(country => {
              if (!countryDepartments[country]) {
                countryDepartments[country] = new Set();
              }

              // Extraire les départements de livraison
              if (plug.services?.delivery?.departments) {
                plug.services.delivery.departments.forEach(dept => {
                  countryDepartments[country].add(dept);
                });
              }

              // Extraire les départements de meetup
              if (plug.services?.meetup?.departments) {
                plug.services.meetup.departments.forEach(dept => {
                  countryDepartments[country].add(dept);
                });
              }
            });
          }
        });
      }

      // Convertir les Sets en Arrays et trier
      this.postalCodes = {};
      Object.keys(countryDepartments).forEach(country => {
        this.postalCodes[country] = Array.from(countryDepartments[country]).sort();
      });

      console.log(`✅ Codes postaux chargés pour ${Object.keys(this.postalCodes).length} pays réels`);
      console.log(`📦 Pays disponibles:`, Object.keys(this.postalCodes));
      
      // Log des départements par pays pour debug
      Object.keys(this.postalCodes).forEach(country => {
        console.log(`🏴 ${country}: ${this.postalCodes[country].length} départements [${this.postalCodes[country].join(', ')}]`);
      });

      this.lastReload = new Date();

    } catch (error) {
      console.error('❌ Erreur lors du chargement des codes postaux depuis API:', error);
      // En cas d'erreur, garder les données précédentes
    } finally {
      this.isLoading = false;
    }
  }

  // Recharger les données depuis l'API
  async reloadData() {
    await this.loadPostalCodesFromBotAPI();
  }

  // Récupérer les codes postaux d'un pays (avec rechargement automatique)
  async getPostalCodes(country) {
    // Recharger automatiquement si les données sont anciennes (plus de 5 minutes)
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    if (this.lastReload < fiveMinutesAgo) {
      console.log('🔄 Rechargement automatique des codes postaux...');
      await this.reloadData();
    }

    return this.postalCodes[country] || [];
  }

  // Récupérer les pays disponibles (avec rechargement automatique)
  async getAvailableCountries() {
    // Recharger automatiquement si les données sont anciennes (plus de 5 minutes)
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    if (this.lastReload < fiveMinutesAgo) {
      console.log('🔄 Rechargement automatique des pays disponibles...');
      await this.reloadData();
    }

    return Object.keys(this.postalCodes);
  }

  // Obtenir les statistiques
  getStats() {
    const countries = Object.keys(this.postalCodes);
    const totalDepartments = countries.reduce((total, country) => {
      return total + this.postalCodes[country].length;
    }, 0);

    return {
      countries: countries.length,
      totalDepartments,
      lastReload: this.lastReload,
      countriesDetail: countries.map(country => ({
        name: country,
        departments: this.postalCodes[country].length,
        codes: this.postalCodes[country]
      }))
    };
  }
}

module.exports = new PostalCodeServiceVercel();