const mongoose = require('mongoose');
const User = require('./src/models/User');
const Plug = require('./src/models/Plug');

const MONGODB_URI = 'mongodb+srv://teste:Junior@junior.jiy8uam.mongodb.net/?retryWrites=true&w=majority&appName=Junior';

async function checkUsersCount() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Compter tous les utilisateurs
    const totalUsers = await User.countDocuments({});
    console.log(`\n📊 Nombre total d'utilisateurs: ${totalUsers}`);

    // Compter les utilisateurs actifs
    const activeUsers = await User.countDocuments({ isActive: true });
    console.log(`✅ Utilisateurs actifs (isActive: true): ${activeUsers}`);

    // Compter les utilisateurs inactifs
    const inactiveUsers = await User.countDocuments({ isActive: false });
    console.log(`❌ Utilisateurs inactifs (isActive: false): ${inactiveUsers}`);

    // Compter les utilisateurs sans statut défini
    const noStatusUsers = await User.countDocuments({ isActive: { $exists: false } });
    console.log(`❓ Utilisateurs sans statut isActive: ${noStatusUsers}`);

    // Afficher quelques exemples d'utilisateurs
    console.log('\n👥 Exemples d\'utilisateurs:');
    const sampleUsers = await User.find({}).limit(5);
    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.telegramId}, Username: ${user.username || 'N/A'}, Active: ${user.isActive}, Créé: ${user.createdAt}`);
    });

    // Compter les boutiques
    console.log('\n🏪 Boutiques:');
    const totalShops = await User.countDocuments({});
    const activeShops = await Plug.countDocuments({ isActive: true });
    console.log(`Total: ${totalShops}, Actives: ${activeShops}`);

    // Suggestion de correction
    if (noStatusUsers > 0 || totalUsers !== activeUsers) {
      console.log('\n⚠️ ATTENTION: Il semble y avoir des incohérences dans le comptage des utilisateurs.');
      console.log('Voulez-vous activer tous les utilisateurs existants? (Cela corrigera le comptage)');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter la vérification
checkUsersCount();