const https = require('https');

/**
 * Service de géolocalisation pour détecter le pays des utilisateurs
 */
class LocationService {
  constructor() {
    this.cache = new Map(); // Cache pour éviter les appels répétés
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24h en millisecondes
  }

  /**
   * Obtenir l'IP publique du serveur (approximation pour les utilisateurs)
   * Note: Pour une vraie géolocalisation, il faudrait l'IP de l'utilisateur
   */
  async getPublicIP() {
    return new Promise((resolve, reject) => {
      const req = https.get('https://api.ipify.org?format=json', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result.ip);
          } catch (error) {
            reject(error);
          }
        });
      });
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
    });
  }

  /**
   * Obtenir les informations de géolocalisation à partir d'une IP
   */
  async getLocationFromIP(ip) {
    // Vérifier le cache
    const cacheKey = `ip_${ip}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`📍 Location cache hit pour IP ${ip}: ${cached.data.country}`);
        return cached.data;
      }
    }

    try {
      console.log(`🌍 Détection localisation pour IP: ${ip}`);
      
      const locationData = await this.fetchLocationData(ip);
      
      // Mettre en cache
      this.cache.set(cacheKey, {
        data: locationData,
        timestamp: Date.now()
      });
      
      console.log(`✅ Location détectée: ${locationData.country} (${locationData.countryCode})`);
      return locationData;
      
    } catch (error) {
      console.error(`❌ Erreur géolocalisation IP ${ip}:`, error.message);
      return this.getDefaultLocation();
    }
  }

  /**
   * Appel API pour obtenir les données de localisation
   */
  async fetchLocationData(ip) {
    return new Promise((resolve, reject) => {
      // Utiliser ip-api.com (gratuit, 1000 requêtes/jour)
      const url = `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,city,query`;
      
      const req = https.get(url.replace('http://', 'https://'), (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            
            if (result.status === 'success') {
              resolve({
                country: result.country || 'Unknown',
                countryCode: result.countryCode || 'XX',
                region: result.region || 'Unknown',
                city: result.city || 'Unknown',
                ip: result.query || ip
              });
            } else {
              reject(new Error(result.message || 'API Error'));
            }
          } catch (error) {
            reject(error);
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
    });
  }

  /**
   * Fallback : utiliser un service alternatif
   */
  async fallbackLocationService(ip) {
    return new Promise((resolve, reject) => {
      // ipinfo.io comme fallback (50k requêtes/mois gratuites)
      const url = `https://ipinfo.io/${ip}/json`;
      
      const req = https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve({
              country: result.country || 'Unknown',
              countryCode: result.country || 'XX',
              region: result.region || 'Unknown',
              city: result.city || 'Unknown',
              ip: result.ip || ip
            });
          } catch (error) {
            reject(error);
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
    });
  }

  /**
   * Localisation par défaut en cas d'échec
   */
  getDefaultLocation() {
    return {
      country: 'Unknown',
      countryCode: 'XX',
      region: 'Unknown',
      city: 'Unknown',
      ip: 'Unknown'
    };
  }

  /**
   * Générer une localisation aléatoire pour les tests/démonstration
   */
  getRandomLocation() {
    const locations = [
      { country: 'France', countryCode: 'FR', region: 'Île-de-France', city: 'Paris' },
      { country: 'Belgium', countryCode: 'BE', region: 'Brussels', city: 'Brussels' },
      { country: 'Switzerland', countryCode: 'CH', region: 'Geneva', city: 'Geneva' },
      { country: 'Canada', countryCode: 'CA', region: 'Quebec', city: 'Montreal' },
      { country: 'Germany', countryCode: 'DE', region: 'Bavaria', city: 'Munich' },
      { country: 'Spain', countryCode: 'ES', region: 'Madrid', city: 'Madrid' },
      { country: 'Italy', countryCode: 'IT', region: 'Lombardy', city: 'Milan' },
      { country: 'Netherlands', countryCode: 'NL', region: 'North Holland', city: 'Amsterdam' },
      { country: 'Portugal', countryCode: 'PT', region: 'Lisbon', city: 'Lisbon' },
      { country: 'United Kingdom', countryCode: 'GB', region: 'England', city: 'London' }
    ];
    
    return locations[Math.floor(Math.random() * locations.length)];
  }

  /**
   * Détecter et sauvegarder la localisation d'un utilisateur
   */
  async detectAndSaveUserLocation(user) {
    try {
      // Si la localisation est déjà détectée récemment, on skip
      if (user.location?.detectedAt) {
        const timeSinceDetection = Date.now() - new Date(user.location.detectedAt).getTime();
        if (timeSinceDetection < this.cacheTimeout) {
          console.log(`📍 Location déjà détectée pour user ${user.telegramId}: ${user.location.country}`);
          return user.location;
        }
      }

      let location;
      
      // EN MODE TEST: Utiliser une localisation aléatoire pour démonstration
      if (process.env.NODE_ENV === 'development' || process.env.DEMO_MODE === 'true') {
        console.log(`🎲 Mode démo activé - génération localisation aléatoire pour user ${user.telegramId}`);
        location = this.getRandomLocation();
        location.ip = 'demo-ip';
      } else {
        // MODE PRODUCTION: Utiliser la vraie géolocalisation
        try {
          const ip = await this.getPublicIP();
          location = await this.getLocationFromIP(ip);
        } catch (error) {
          console.log(`⚠️ Erreur géolocalisation réelle, fallback aléatoire: ${error.message}`);
          location = this.getRandomLocation();
          location.ip = 'fallback-ip';
        }
      }
      
      // Sauvegarder dans l'utilisateur
      user.location = {
        ...location,
        detectedAt: new Date()
      };
      
      await user.save();
      
      console.log(`✅ Location sauvegardée pour user ${user.telegramId}: ${location.country} (${location.city})`);
      return location;
      
    } catch (error) {
      console.error(`❌ Erreur détection location user ${user.telegramId}:`, error.message);
      
      // Fallback final: localisation aléatoire
      const fallbackLocation = this.getRandomLocation();
      fallbackLocation.ip = 'error-fallback';
      
      try {
        user.location = {
          ...fallbackLocation,
          detectedAt: new Date()
        };
        await user.save();
        console.log(`🔄 Fallback location sauvegardée: ${fallbackLocation.country}`);
        return fallbackLocation;
      } catch (saveError) {
        console.error(`❌ Erreur sauvegarde fallback:`, saveError.message);
        return this.getDefaultLocation();
      }
    }
  }

  /**
   * Obtenir les statistiques par pays
   */
  async getCountryStats(User) {
    try {
      const stats = await User.aggregate([
        {
          $match: {
            'location.country': { $exists: true, $ne: null, $ne: 'Unknown' }
          }
        },
        {
          $group: {
            _id: {
              country: '$location.country',
              countryCode: '$location.countryCode'
            },
            count: { $sum: 1 },
            latestUser: { $max: '$createdAt' }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $project: {
            country: '$_id.country',
            countryCode: '$_id.countryCode',
            count: 1,
            latestUser: 1,
            _id: 0
          }
        }
      ]);

      console.log(`📊 Statistiques pays générées: ${stats.length} pays détectés`);
      return stats;
    } catch (error) {
      console.error('❌ Erreur génération stats pays:', error);
      return [];
    }
  }

  /**
   * Nettoyer le cache ancien
   */
  cleanOldCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }
}

module.exports = new LocationService();