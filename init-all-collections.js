const mongoose = require('mongoose');

// Configuration MongoDB
const MONGODB_URI = 'mongodb+srv://teste:Junior@junior.jiy8uam.mongodb.net/?retryWrites=true&w=majority&appName=Junior';

// Schémas nécessaires
const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: String,
  firstName: String,
  lastName: String,
  languageCode: String,
  isPremium: Boolean,
  location: String,
  isAdmin: { type: Boolean, default: false },
  lastActivity: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const PlugSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: String,
  location: String,
  postalCode: String,
  department: String,
  countries: [String],
  image: String,
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  isVip: { type: Boolean, default: false },
  vipUntil: Date,
  contact: {
    phone: String,
    email: String,
    website: String,
    telegram: String,
    whatsapp: String
  },
  socialLinks: [{
    platform: String,
    url: String
  }],
  enabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const VoteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  plugId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plug', required: true },
  voteType: { type: String, enum: ['like', 'dislike'], required: true },
  createdAt: { type: Date, default: Date.now }
});

const UserContextSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  currentContext: String,
  lastActivity: { type: Date, default: Date.now },
  contextData: mongoose.Schema.Types.Mixed
});

const NotificationSchema = new mongoose.Schema({
  userId: String,
  type: String,
  message: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const ReportSchema = new mongoose.Schema({
  userId: String,
  plugId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plug' },
  reason: String,
  description: String,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Modèles
const User = mongoose.model('User', UserSchema);
const Plug = mongoose.model('Plug', PlugSchema);
const Vote = mongoose.model('Vote', VoteSchema);
const UserContext = mongoose.model('UserContext', UserContextSchema);
const Notification = mongoose.model('Notification', NotificationSchema);
const Report = mongoose.model('Report', ReportSchema);

async function initializeCollections() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Créer les index nécessaires
    await User.createIndexes();
    await Plug.createIndexes();
    await Vote.createIndexes();
    await UserContext.createIndexes();
    
    console.log('✅ Toutes les collections ont été initialisées');
    console.log('📊 Collections créées:');
    console.log('  - users');
    console.log('  - plugs');
    console.log('  - votes');
    console.log('  - usercontexts');
    console.log('  - notifications');
    console.log('  - reports');
    console.log('  - configs (déjà créée)');
    
    // Vérifier les collections existantes
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections dans la base de données:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnecté de MongoDB');
  }
}

initializeCollections();