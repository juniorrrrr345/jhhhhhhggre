const mongoose = require('mongoose');
require('dotenv').config();

// Modèles
const Plug = require('../src/models/Plug');

const addDepartmentsData = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connecté à MongoDB');
    
    // Récupérer tous les plugs actifs
    const plugs = await Plug.find({ isActive: true });
    
    console.log(`📊 ${plugs.length} plugs trouvés`);
    
    // Départements d'exemple par pays
    const departmentsByCountry = {
      'France': ['69', '75', '92', '93', '94', '95', '77', '78', '91', '13', '33', '59', '31'],
      'Spain': ['28', '08', '41', '46', '48', '50'],
      'Switzerland': ['GE', 'VD', 'VS', 'FR', 'NE', 'JU'],
      'Italy': ['20', '10', '00', '40', '50', '80'],
      'Belgium': ['1000', '2000', '3000', '4000', '5000'],
      'Germany': ['10', '20', '30', '40', '50', '60']
    };
    
    let updateCount = 0;
    
    for (const plug of plugs) {
      let hasUpdates = false;
      
      // Si le plug a des services mais pas de départements, en ajouter
      if (plug.services) {
        
        // Livraison - ajouter départements si activé
        if (plug.services.delivery && plug.services.delivery.enabled) {
          if (!plug.services.delivery.departments || plug.services.delivery.departments.length === 0) {
            // Choisir des départements selon le premier pays du plug
            const firstCountry = plug.countries && plug.countries.length > 0 ? plug.countries[0] : 'France';
            const availableDepts = departmentsByCountry[firstCountry] || departmentsByCountry['France'];
            
            // Sélectionner 2-5 départements aléatoirement
            const numDepts = Math.floor(Math.random() * 4) + 2; // 2 à 5
            const selectedDepts = [];
            
            for (let i = 0; i < numDepts && i < availableDepts.length; i++) {
              const randomIndex = Math.floor(Math.random() * availableDepts.length);
              const dept = availableDepts[randomIndex];
              if (!selectedDepts.includes(dept)) {
                selectedDepts.push(dept);
              }
            }
            
            plug.services.delivery.departments = selectedDepts;
            hasUpdates = true;
            console.log(`📦 ${plug.name}: Ajout départements livraison: ${selectedDepts.join(', ')}`);
          }
        }
        
        // Meetup - ajouter départements si activé
        if (plug.services.meetup && plug.services.meetup.enabled) {
          if (!plug.services.meetup.departments || plug.services.meetup.departments.length === 0) {
            // Choisir des départements selon le premier pays du plug
            const firstCountry = plug.countries && plug.countries.length > 0 ? plug.countries[0] : 'France';
            const availableDepts = departmentsByCountry[firstCountry] || departmentsByCountry['France'];
            
            // Sélectionner 1-3 départements aléatoirement
            const numDepts = Math.floor(Math.random() * 3) + 1; // 1 à 3
            const selectedDepts = [];
            
            for (let i = 0; i < numDepts && i < availableDepts.length; i++) {
              const randomIndex = Math.floor(Math.random() * availableDepts.length);
              const dept = availableDepts[randomIndex];
              if (!selectedDepts.includes(dept)) {
                selectedDepts.push(dept);
              }
            }
            
            plug.services.meetup.departments = selectedDepts;
            hasUpdates = true;
            console.log(`🤝 ${plug.name}: Ajout départements meetup: ${selectedDepts.join(', ')}`);
          }
        }
      }
      
      // Sauvegarder si des modifications ont été faites
      if (hasUpdates) {
        await plug.save();
        updateCount++;
      }
    }
    
    console.log(`\n✅ Migration terminée !`);
    console.log(`📊 ${updateCount} plugs mis à jour avec des départements`);
    
    // Afficher un récap des départements par service
    const deliveryDepts = await Plug.distinct('services.delivery.departments', { 
      isActive: true, 
      'services.delivery.enabled': true 
    });
    
    const meetupDepts = await Plug.distinct('services.meetup.departments', { 
      isActive: true, 
      'services.meetup.enabled': true 
    });
    
    console.log(`\n📊 STATISTIQUES:`);
    console.log(`📦 Départements livraison: ${deliveryDepts.length} (${deliveryDepts.join(', ')})`);
    console.log(`🤝 Départements meetup: ${meetupDepts.length} (${meetupDepts.join(', ')})`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
  }
};

// Lancer le script
if (require.main === module) {
  addDepartmentsData();
}

module.exports = addDepartmentsData;