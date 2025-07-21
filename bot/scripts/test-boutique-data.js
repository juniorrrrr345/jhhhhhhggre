#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-bot';

// Modèles
const PlugSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isVip: { type: Boolean, default: false },
  vipOrder: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: Number }],
  image: String,
  telegramLink: String,
  countries: [String],
  services: {
    delivery: {
      enabled: { type: Boolean, default: false },
      description: String,
      price: String
    },
    postal: {
      enabled: { type: Boolean, default: false },
      description: String,
      price: String
    },
    meetup: {
      enabled: { type: Boolean, default: false },
      description: String,
      price: String
    }
  },
  socialMedia: [{
    name: String,
    emoji: String,
    url: String,
    order: { type: Number, default: 0 }
  }],
  additionalInfo: String
}, {
  timestamps: true
});

const Plug = mongoose.model('Plug', PlugSchema);

async function testBoutiqueData() {
  try {
    console.log('🔌 Test des données de la boutique...\n');
    
    // Connexion à MongoDB
    console.log('📡 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');
    
    // 1. Vérifier tous les plugs
    console.log('📋 Récupération de tous les plugs:');
    const allPlugs = await Plug.find().sort({ createdAt: -1 });
    console.log(`Total: ${allPlugs.length} plugs trouvés`);
    
    if (allPlugs.length === 0) {
      console.log('❌ Aucun plug trouvé dans la base de données !');
      console.log('💡 Vérifiez que des plugs ont été ajoutés via le panel d\'administration.');
      return;
    }
    
    // 2. Vérifier les plugs actifs
    console.log('\n🟢 Plugs actifs (visibles sur la boutique):');
    const activePlugs = await Plug.find({ isActive: true }).sort({ likes: -1, isVip: -1 });
    console.log(`Total: ${activePlugs.length} plugs actifs`);
    
    activePlugs.forEach((plug, index) => {
      console.log(`  ${index + 1}. ${plug.name} ${plug.isVip ? '👑' : ''}`);
      console.log(`     Status: ${plug.isActive ? '✅ Actif' : '❌ Inactif'}`);
      console.log(`     Likes: ${plug.likes || 0}`);
      console.log(`     Pays: ${plug.countries?.join(', ') || 'Non spécifié'}`);
      console.log(`     Services: ${getEnabledServices(plug.services)}`);
      console.log('');
    });
    
    // 3. Vérifier les plugs VIP
    console.log('👑 Plugs VIP:');
    const vipPlugs = await Plug.find({ isActive: true, isVip: true }).sort({ vipOrder: 1 });
    console.log(`Total: ${vipPlugs.length} plugs VIP`);
    
    vipPlugs.forEach((plug, index) => {
      console.log(`  ${index + 1}. ${plug.name} (ordre: ${plug.vipOrder})`);
    });
    
    // 4. Simuler l'API endpoint
    console.log('\n🌐 Simulation de l\'endpoint API /api/public/plugs:');
    const apiResponse = {
      plugs: activePlugs.map(plug => ({
        _id: plug._id,
        name: plug.name,
        description: plug.description,
        isVip: plug.isVip,
        likes: plug.likes || 0,
        image: plug.image,
        countries: plug.countries || [],
        services: plug.services,
        isActive: plug.isActive
      })),
      pagination: {
        page: 1,
        total: activePlugs.length,
        pages: Math.ceil(activePlugs.length / 50)
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('Structure de réponse API:');
    console.log(JSON.stringify({
      plugs: `[${activePlugs.length} items]`,
      pagination: apiResponse.pagination,
      timestamp: apiResponse.timestamp
    }, null, 2));
    
    // 5. Vérifier les problèmes potentiels
    console.log('\n🔍 Vérification des problèmes potentiels:');
    
    const problemPlugs = allPlugs.filter(plug => !plug.name || !plug.description);
    if (problemPlugs.length > 0) {
      console.log(`⚠️  ${problemPlugs.length} plug(s) avec des données manquantes`);
    }
    
    const inactivePlugs = allPlugs.filter(plug => !plug.isActive);
    if (inactivePlugs.length > 0) {
      console.log(`📴 ${inactivePlugs.length} plug(s) inactifs (non visibles sur la boutique)`);
    }
    
    if (activePlugs.length > 0) {
      console.log('✅ Des plugs actifs sont disponibles pour la boutique');
    }
    
    console.log('\n🚀 Pour tester la boutique:');
    console.log('1. Démarrez le serveur bot: npm start');
    console.log('2. Démarrez le panel admin: cd admin-panel && npm run dev');
    console.log('3. Accédez à /shop pour voir les plugs');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

function getEnabledServices(services) {
  if (!services) return 'Aucun';
  
  const enabled = [];
  if (services.delivery?.enabled) enabled.push('Livraison');
  if (services.postal?.enabled) enabled.push('Postal');
  if (services.meetup?.enabled) enabled.push('Meetup');
  
  return enabled.length > 0 ? enabled.join(', ') : 'Aucun';
}

// Exécuter le test
if (require.main === module) {
  testBoutiqueData().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}