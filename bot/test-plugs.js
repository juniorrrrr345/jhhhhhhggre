require('dotenv').config();
const mongoose = require('mongoose');
const Plug = require('./src/models/Plug');

const testPlugs = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');
    
    // Récupérer tous les plugs
    const plugs = await Plug.find({ isActive: true }).sort({ likes: -1 });
    console.log(`📊 ${plugs.length} plugs trouvés`);
    
    // Afficher les détails de chaque plug
    plugs.forEach((plug, index) => {
      console.log(`\n${index + 1}. ${plug.name}`);
      console.log(`   ID: ${plug._id}`);
      console.log(`   VIP: ${plug.isVip ? 'Oui' : 'Non'}`);
      console.log(`   Likes: ${plug.likes || 0}`);
      console.log(`   Services: ${Object.keys(plug.services).filter(s => plug.services[s].enabled).join(', ')}`);
      
      // Test des callback IDs
      console.log(`   Callback details: plug_${plug._id}_from_all`);
      console.log(`   Callback service delivery: plug_service_${plug._id}_delivery`);
    });
    
    // Vérifier si les IDs sont valides
    const sampleId = plugs[0]?._id;
    if (sampleId) {
      console.log(`\n🔍 Test de validation ID: ${sampleId}`);
      console.log(`   Type: ${typeof sampleId}`);
      console.log(`   String: ${sampleId.toString()}`);
      console.log(`   Valid ObjectId: ${mongoose.Types.ObjectId.isValid(sampleId)}`);
      
      // Test de recherche
      const foundPlug = await Plug.findById(sampleId);
      console.log(`   Trouvé par ID: ${foundPlug ? 'Oui' : 'Non'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

testPlugs();