const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://teste:Junior@junior.jiy8uam.mongodb.net/?retryWrites=true&w=majority&appName=Junior';

// Définir le schéma User (même que dans le bot)
const userSchema = new mongoose.Schema({
  telegramId: { type: Number, required: true, unique: true },
  username: String,
  firstName: String,
  lastName: String,
  language: { type: String, default: 'fr' },
  isActive: { type: Boolean, default: true },
  lastActivity: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  location: {
    country: String,
    city: String,
    detectedAt: Date
  }
});

const User = mongoose.model('User', userSchema);

async function testUserRegistration() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Simuler l'enregistrement de 3 utilisateurs différents
    const testUsers = [
      {
        telegramId: 123456789,
        username: 'testuser1',
        firstName: 'Test',
        lastName: 'User 1',
        isActive: true
      },
      {
        telegramId: 987654321,
        username: 'testuser2',
        firstName: 'Test',
        lastName: 'User 2',
        isActive: true
      },
      {
        telegramId: 555555555,
        username: 'testuser3',
        firstName: 'Test',
        lastName: 'User 3',
        isActive: true
      }
    ];

    console.log('\n📝 Test d\'enregistrement des utilisateurs...');
    
    for (const userData of testUsers) {
      try {
        // Utiliser findOneAndUpdate comme dans le bot
        const user = await User.findOneAndUpdate(
          { telegramId: userData.telegramId },
          {
            ...userData,
            lastActivity: new Date()
          },
          { upsert: true, new: true }
        );
        
        console.log(`✅ Utilisateur enregistré: ${user.username} (ID: ${user.telegramId})`);
      } catch (error) {
        console.error(`❌ Erreur pour ${userData.username}:`, error.message);
      }
    }

    // Vérifier le nombre total d'utilisateurs
    const totalUsers = await User.countDocuments({});
    console.log(`\n📊 Nombre total d'utilisateurs après test: ${totalUsers}`);

    // Lister tous les utilisateurs
    const allUsers = await User.find({}).select('telegramId username firstName');
    console.log('\n👥 Tous les utilisateurs:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (ID: ${user.telegramId})`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

testUserRegistration();