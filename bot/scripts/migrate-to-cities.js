const mongoose = require('mongoose');
const Plug = require('../src/models/Plug');
const cityService = require('../src/services/cityService');
require('dotenv').config();

// Mapping des codes postaux vers les villes (exemples)
const postalToCity = {
  // France
  '75001': 'Paris', '75002': 'Paris', '75003': 'Paris', '75004': 'Paris',
  '75005': 'Paris', '75006': 'Paris', '75007': 'Paris', '75008': 'Paris',
  '75009': 'Paris', '75010': 'Paris', '75011': 'Paris', '75012': 'Paris',
  '75013': 'Paris', '75014': 'Paris', '75015': 'Paris', '75016': 'Paris',
  '75017': 'Paris', '75018': 'Paris', '75019': 'Paris', '75020': 'Paris',
  '13001': 'Marseille', '13002': 'Marseille', '13003': 'Marseille',
  '69001': 'Lyon', '69002': 'Lyon', '69003': 'Lyon',
  '31000': 'Toulouse', '31100': 'Toulouse', '31200': 'Toulouse',
  // Ajouter d'autres mappings selon les besoins
};

async function migrate() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-bot', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connecté à MongoDB');
    
    // Récupérer toutes les boutiques
    const plugs = await Plug.find({});
    console.log(`📊 ${plugs.length} boutiques trouvées`);
    
    let migratedCount = 0;
    
    for (const plug of plugs) {
      let modified = false;
      
      // Migrer delivery departments vers cities
      if (plug.services.delivery.enabled && plug.services.delivery.departments.length > 0) {
        const cities = new Set();
        
        plug.services.delivery.departments.forEach(dept => {
          // Si c'est un code postal, essayer de le convertir en ville
          if (/^\d{4,5}/.test(dept)) {
            const city = postalToCity[dept];
            if (city) {
              cities.add(city);
            }
          } else {
            // Si ce n'est pas un code postal, c'est peut-être déjà une ville
            cities.add(dept);
          }
        });
        
        if (cities.size > 0) {
          plug.services.delivery.cities = Array.from(cities);
          modified = true;
        }
      }
      
      // Migrer meetup departments vers cities
      if (plug.services.meetup.enabled && plug.services.meetup.departments.length > 0) {
        const cities = new Set();
        
        plug.services.meetup.departments.forEach(dept => {
          // Si c'est un code postal, essayer de le convertir en ville
          if (/^\d{4,5}/.test(dept)) {
            const city = postalToCity[dept];
            if (city) {
              cities.add(city);
            }
          } else {
            // Si ce n'est pas un code postal, c'est peut-être déjà une ville
            cities.add(dept);
          }
        });
        
        if (cities.size > 0) {
          plug.services.meetup.cities = Array.from(cities);
          modified = true;
        }
      }
      
      if (modified) {
        await plug.save();
        migratedCount++;
        console.log(`✅ Migré: ${plug.name}`);
      }
    }
    
    console.log(`\n✅ Migration terminée: ${migratedCount} boutiques migrées`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Lancer la migration
migrate();