const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://teste:Junior@junior.jiy8uam.mongodb.net/?retryWrites=true&w=majority&appName=Junior';

// Définir le schéma User
const userSchema = new mongoose.Schema({
  telegramId: { type: Number, required: true, unique: true },
  username: String,
  firstName: String,
  lastName: String,
  language: { type: String, default: 'fr' },
  isActive: { type: Boolean, default: true },
  lastActivity: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function checkUsers() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Compter tous les utilisateurs
    const totalUsers = await User.countDocuments({});
    console.log(`\n📊 Nombre total d'utilisateurs: ${totalUsers}`);

    // Compter les utilisateurs actifs
    const activeUsers = await User.countDocuments({ isActive: true });
    console.log(`✅ Utilisateurs actifs: ${activeUsers}`);

    // Lister tous les utilisateurs
    const users = await User.find({}).select('telegramId username firstName lastName isActive lastActivity');
    console.log('\n👥 Liste des utilisateurs:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.telegramId} | Username: ${user.username || 'N/A'} | Nom: ${user.firstName || 'N/A'} ${user.lastName || ''} | Actif: ${user.isActive} | Dernière activité: ${user.lastActivity}`);
    });

    // Vérifier s'il y a des doublons
    const telegramIds = users.map(u => u.telegramId);
    const uniqueIds = [...new Set(telegramIds)];
    if (telegramIds.length !== uniqueIds.length) {
      console.log('\n⚠️ ATTENTION: Des doublons ont été détectés!');
    }

    // Afficher les collections disponibles
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections disponibles:');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

checkUsers();