const mongoose = require('mongoose');

// Connexion MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error.message);
    process.exit(1);
  }
};

// Schéma PlugApplication
const plugApplicationSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  username: { type: String, default: '' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    country: { type: String, required: true },
    city: { type: String, required: true }
  },
  services: [{ type: String, required: true }],
  contact: {
    telegram: { type: String, required: true },
    other: { type: String, default: '' }
  },
  photo: { type: String, default: '' },
  photoUrl: { type: String, default: null },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNotes: { type: String, default: '' }
}, { 
  timestamps: true 
});

const PlugApplication = mongoose.model('PlugApplication', plugApplicationSchema);

const createTestApplication = async () => {
  try {
    await connectDB();
    
    console.log('🔄 Création d\'une demande de test...');
    
    // Créer une demande de test
    const testApplication = new PlugApplication({
      userId: 123456789,
      username: 'testuser',
      firstName: 'Jean',
      lastName: 'Dupont',
      name: 'Plug Test Paris',
      description: 'Je propose des services de livraison rapide dans tout Paris. Expérience de 3 ans dans le domaine.',
      location: {
        country: 'France',
        city: 'Paris'
      },
      services: ['delivery', 'meetup'],
      contact: {
        telegram: '@testuser',
        other: ''
      },
      photo: '',
      photoUrl: null,
      status: 'pending',
      adminNotes: ''
    });
    
    await testApplication.save();
    
    // Créer une deuxième demande avec un autre statut
    const testApplication2 = new PlugApplication({
      userId: 987654321,
      username: 'marie_test',
      firstName: 'Marie',
      lastName: 'Martin',
      name: 'Plug Express Lyon',
      description: 'Services postaux et meetup disponibles sur Lyon et ses environs. Très fiable.',
      location: {
        country: 'France',
        city: 'Lyon'
      },
      services: ['postal', 'meetup'],
      contact: {
        telegram: '@marie_express',
        other: ''
      },
      photo: '',
      photoUrl: null,
      status: 'approved',
      adminNotes: 'Excellent profil, approuvé rapidement.'
    });
    
    await testApplication2.save();
    
    // Créer une troisième demande rejetée
    const testApplication3 = new PlugApplication({
      userId: 111222333,
      username: 'alex_test',
      firstName: 'Alex',
      lastName: 'Bernard',
      name: 'Plug Test Marseille',
      description: 'Test description courte.',
      location: {
        country: 'France',
        city: 'Marseille'
      },
      services: ['delivery'],
      contact: {
        telegram: '@alex_test',
        other: ''
      },
      photo: '',
      photoUrl: null,
      status: 'rejected',
      adminNotes: 'Description trop courte, manque de détails sur l\'expérience.'
    });
    
    await testApplication3.save();
    
    console.log('✅ Demandes de test créées avec succès !');
    console.log('📋 3 demandes créées:');
    console.log('   1. Jean Dupont (Paris) - En attente');
    console.log('   2. Marie Martin (Lyon) - Approuvée');
    console.log('   3. Alex Bernard (Marseille) - Rejetée');
    console.log('');
    console.log('🎛️ Tu peux maintenant tester l\'interface admin :');
    console.log('   👉 https://safeplugslink.vercel.app/admin/applications');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

// Lancer le script
require('dotenv').config();
createTestApplication();