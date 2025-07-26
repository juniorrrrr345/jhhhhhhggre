// Service pour gérer les codes postaux par pays - VERSION VERCEL (dynamique depuis boutiques_locales.json)
const fs = require('fs');
const path = require('path');

class PostalCodeServiceVercel {
  constructor() {
    this.postalCodes = {};
    this.lastReload = new Date();
    this.loadPostalCodesFromBoutiques();
  }

  // Charger dynamiquement depuis boutiques_locales.json
  loadPostalCodesFromBoutiques() {
    try {
      const boutiquesPath = path.join(__dirname, '../../boutiques_locales.json');
      
      if (!fs.existsSync(boutiquesPath)) {
        console.log('⚠️ Fichier boutiques_locales.json non trouvé, utilisation des données par défaut');
        this.postalCodes = {};
        return;
      }

      const data = JSON.parse(fs.readFileSync(boutiquesPath, 'utf8'));
      const countryDepartments = {};

      if (data.plugs && Array.isArray(data.plugs)) {
        // Prendre TOUTES les boutiques actives du bot Telegram
        const activePlugs = data.plugs.filter(plug => plug.isActive === true);

        console.log(`🔍 Chargement: ${data.plugs.length} boutiques totales → ${activePlugs.length} boutiques actives du Telegram`);
        
        activePlugs.forEach(plug => {
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

      console.log(`✅ Codes postaux chargés dynamiquement pour ${Object.keys(this.postalCodes).length} pays`);
      console.log(`📦 Pays disponibles:`, Object.keys(this.postalCodes));
      
      // Log des départements par pays pour debug
      Object.keys(this.postalCodes).forEach(country => {
        console.log(`🏴 ${country}: ${this.postalCodes[country].length} départements [${this.postalCodes[country].join(', ')}]`);
      });

    } catch (error) {
      console.error('❌ Erreur lors du chargement des codes postaux:', error);
      this.postalCodes = {};
    }
  }

  // Recharger les données depuis le fichier
  reloadData() {
    this.loadPostalCodesFromBoutiques();
    this.lastReload = new Date();
  }

  // Récupérer les codes postaux d'un pays
  getPostalCodes(country) {
    // Recharger automatiquement si les données sont anciennes (plus de 5 minutes)
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    if (this.lastReload < fiveMinutesAgo) {
      console.log('🔄 Rechargement automatique des codes postaux...');
      this.reloadData();
    }

    return this.postalCodes[country] || [];
  }

  // Récupérer les pays disponibles (avec rechargement automatique)
  getAvailableCountries() {
    // Recharger automatiquement si les données sont anciennes (plus de 5 minutes)
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    if (this.lastReload < fiveMinutesAgo) {
      console.log('🔄 Rechargement automatique des pays disponibles...');
      this.reloadData();
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