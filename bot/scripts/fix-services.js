require('dotenv').config();
const mongoose = require('mongoose');
const Plug = require('../src/models/Plug');

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boutique_vip', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixServices() {
  try {
    console.log('🔧 Correction des services des plugs...');
    
    // Trouver tous les plugs
    const plugs = await Plug.find({});
    console.log(`📊 Total plugs trouvés: ${plugs.length}`);
    
    let fixed = 0;
    
    for (const plug of plugs) {
      let needsUpdate = false;
      
      // Vérifier si le plug a une structure de services
      if (!plug.services) {
        plug.services = {
          delivery: { enabled: false, description: '' },
          postal: { enabled: false, description: '' },
          meetup: { enabled: false, description: '' }
        };
        needsUpdate = true;
      } else {
        // Vérifier chaque service individuellement
        if (!plug.services.delivery) {
          plug.services.delivery = { enabled: false, description: '' };
          needsUpdate = true;
        }
        if (!plug.services.postal) {
          plug.services.postal = { enabled: false, description: '' };
          needsUpdate = true;
        }
        if (!plug.services.meetup) {
          plug.services.meetup = { enabled: false, description: '' };
          needsUpdate = true;
        }
        
        // Vérifier les sous-propriétés
        ['delivery', 'postal', 'meetup'].forEach(service => {
          if (typeof plug.services[service].enabled === 'undefined') {
            plug.services[service].enabled = false;
            needsUpdate = true;
          }
          if (!plug.services[service].description) {
            plug.services[service].description = '';
            needsUpdate = true;
          }
        });
      }
      
      // Activer au moins un service pour les plugs VIP
      if (plug.isVip && plug.services) {
        const hasEnabledService = plug.services.delivery.enabled || 
                                 plug.services.postal.enabled || 
                                 plug.services.meetup.enabled;
        
        if (!hasEnabledService) {
          // Activer livraison par défaut pour les VIP
          plug.services.delivery.enabled = true;
          plug.services.delivery.description = 'Service de livraison premium';
          needsUpdate = true;
          console.log(`⭐ Service livraison activé pour VIP: ${plug.name}`);
        }
      }
      
      if (needsUpdate) {
        await plug.save();
        fixed++;
        console.log(`✅ Services corrigés pour: ${plug.name}`);
      }
    }
    
    console.log(`\n🎉 Migration terminée! ${fixed} plugs corrigés.`);
    
    // Vérification finale
    console.log('\n📊 Statistiques des services:');
    const deliveryCount = await Plug.countDocuments({ 'services.delivery.enabled': true });
    const postalCount = await Plug.countDocuments({ 'services.postal.enabled': true });
    const meetupCount = await Plug.countDocuments({ 'services.meetup.enabled': true });
    
    console.log(`- Livraison: ${deliveryCount} plugs`);
    console.log(`- Postal: ${postalCount} plugs`);
    console.log(`- Meetup: ${meetupCount} plugs`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration
fixServices();