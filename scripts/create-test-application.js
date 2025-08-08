require('dotenv').config();
const mongoose = require('mongoose');

const PlugApplication = require('../bot/src/models/PlugApplication');

async function createTestApplication() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI non défini dans les variables d\'environnement');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    // Créer une application test avec photo
    const testApplication = new PlugApplication({
      userId: 123456789,
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      name: 'Boutique Test Photo',
      description: 'Une boutique de test avec photo pour vérifier le système d\'images',
      location: {
        country: 'France',
        city: 'Paris'
      },
      services: ['delivery', 'postal'],
      contact: {
        telegram: '@testuser',
        other: ''
      },
      // Simuler un file_id Telegram réel (format typique)
      photo: 'AgACAgIAAxkBAAIBY2ZxcGVkZXJfdGVzdF9waG90b19pZAACqsMxGwABOvFJAAEwNzQ1Nzk4OTAy',
      photoUrl: `${process.env.BOT_URL || 'https://safepluglink-6hzr.onrender.com'}/api/photo/AgACAgIAAxkBAAIBY2ZxcGVkZXJfdGVzdF9waG90b19pZAACqsMxGwABOvFJAAEwNzQ1Nzk4OTAy`,
      status: 'pending'
    });

    await testApplication.save();
    console.log('✅ Application test créée avec photo:', testApplication._id);
    console.log('📸 Photo URL:', testApplication.photoUrl);
    
    // Créer une seconde application sans photo
    const testApplication2 = new PlugApplication({
      userId: 987654321,
      username: 'testuser2',
      firstName: 'Test2',
      lastName: 'User2',
      name: 'Boutique Test Sans Photo',
      description: 'Une boutique de test sans photo',
      location: {
        country: 'Belgique',
        city: 'Bruxelles'
      },
      services: ['meetup'],
      contact: {
        telegram: '@testuser2',
        other: ''
      },
      photo: '',
      photoUrl: null,
      status: 'pending'
    });

    await testApplication2.save();
    console.log('✅ Application test créée sans photo:', testApplication2._id);

    console.log('\n🎯 Tests à effectuer:');
    console.log('1. Aller sur le panel admin > Demandes');
    console.log('2. Vérifier que les 2 nouvelles demandes apparaissent');
    console.log('3. Cliquer sur "Boutique Test Photo" pour voir les détails');
    console.log('4. Vérifier si l\'image s\'affiche correctement');
    console.log('5. URL de test photo:', testApplication.photoUrl);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB');
  }
}

// Exécuter le script
if (require.main === module) {
  createTestApplication();
}

module.exports = { createTestApplication };