require('dotenv').config();
const mongoose = require('mongoose');
const Plug = require('./src/models/Plug');

async function createTestShops() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion MongoDB réussie');

    // Boutique 1 - Paris (75)
    const shop1 = new Plug({
      name: "Boutique Test Paris",
      description: "Boutique de test pour Paris et région parisienne. Livraison rapide dans tous les arrondissements.",
      image: "https://i.imgur.com/placeholder1.jpg",
      category: "Test",
      location: "Paris",
      countries: ["France"],
      services: {
        delivery: {
          enabled: true,
          description: "Livraison dans Paris et banlieue",
          departments: ["75", "92", "93", "94"]
        },
        postal: {
          enabled: false
        },
        meetup: {
          enabled: true,
          description: "Rendez-vous possible dans Paris",
          departments: ["75"]
        }
      },
      telegramLink: "https://t.me/boutique_test_paris",
      socialMedia: [
        {
          name: "Telegram",
          emoji: "📱",
          url: "https://t.me/boutique_test_paris"
        }
      ],
      isVip: false,
      isActive: true,
      likes: 15,
      userId: "test_user_1"
    });

    // Boutique 2 - Lyon (69)
    const shop2 = new Plug({
      name: "Boutique Test Lyon",
      description: "Boutique de test pour Lyon et sa région. Service de qualité avec livraison et meetup.",
      image: "https://i.imgur.com/placeholder2.jpg", 
      category: "Test",
      location: "Lyon",
      countries: ["France"],
      services: {
        delivery: {
          enabled: true,
          description: "Livraison dans le Rhône",
          departments: ["69", "01", "42"]
        },
        postal: {
          enabled: true,
          description: "Envoi postal dans toute la France"
        },
        meetup: {
          enabled: true,
          description: "Meetup possible à Lyon",
          departments: ["69"]
        }
      },
      telegramLink: "https://t.me/boutique_test_lyon",
      socialMedia: [
        {
          name: "Telegram", 
          emoji: "📱",
          url: "https://t.me/boutique_test_lyon"
        }
      ],
      isVip: true,
      isActive: true,
      likes: 25,
      userId: "test_user_2"
    });

    // Sauvegarder les boutiques
    await shop1.save();
    console.log('✅ Boutique Test Paris créée');
    
    await shop2.save(); 
    console.log('✅ Boutique Test Lyon créée');

    console.log('\n🎯 BOUTIQUES DE TEST CRÉÉES AVEC SUCCÈS !');
    console.log('\n📋 Test à effectuer:');
    console.log('1. 🇫🇷 France → 🚚 Livraison → Devrait afficher les départements');
    console.log('2. Clic "75" → Devrait afficher "Boutique Test Paris"');
    console.log('3. Clic "69" → Devrait afficher "Boutique Test Lyon"');
    console.log('4. Clic "01" → Devrait afficher "Boutique Test Lyon"'); 
    console.log('5. Clic "13" → Devrait afficher "Aucune boutique"');

    await mongoose.disconnect();
    console.log('✅ Déconnexion MongoDB');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
  }
}

createTestShops();