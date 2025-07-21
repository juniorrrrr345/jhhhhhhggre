#!/usr/bin/env node

const mongoose = require('mongoose');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://junior:junior123456789@cluster0.dgqlo.mongodb.net/telegram-bot';

// Modèle Plug simplifié
const PlugSchema = new mongoose.Schema({
  name: String,
  description: String,
  isActive: { type: Boolean, default: true },
  isVip: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  countries: [String],
  services: {
    delivery: { enabled: Boolean },
    postal: { enabled: Boolean },
    meetup: { enabled: Boolean }
  }
}, { timestamps: true });

const Plug = mongoose.model('Plug', PlugSchema);

async function createTestPlugs() {
  try {
    console.log('🔌 Création de plugs de test...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    const testPlugs = [
      {
        name: "Boutique Premium",
        description: "Boutique de qualité supérieure avec des produits exclusifs",
        isActive: true,
        isVip: true,
        likes: 15,
        countries: ["France", "Belgique"],
        services: {
          delivery: { enabled: true },
          postal: { enabled: true },
          meetup: { enabled: true }
        }
      },
      {
        name: "Shop Express",
        description: "Boutique rapide et fiable pour tous vos besoins",
        isActive: true,
        isVip: false,
        likes: 8,
        countries: ["France"],
        services: {
          delivery: { enabled: true },
          postal: { enabled: false },
          meetup: { enabled: true }
        }
      }
    ];
    
    for (const plugData of testPlugs) {
      const existing = await Plug.findOne({ name: plugData.name });
      if (!existing) {
        const plug = new Plug(plugData);
        await plug.save();
        console.log(`✅ "${plugData.name}" créé`);
      } else {
        console.log(`⏭️  "${plugData.name}" existe déjà`);
      }
    }
    
    const total = await Plug.countDocuments({ isActive: true });
    console.log(`📊 Total plugs actifs: ${total}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestPlugs();