const mongoose = require('mongoose');
require('dotenv').config({ path: './bot/.env' });

// Script pour modifier une boutique existante
async function modifyShop() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/findyourplug');
    console.log('✅ Connecté à MongoDB');
    
    const Plug = require('./bot/src/models/Plug');
    
    // ========================================
    // CONFIGURATION DE LA MODIFICATION
    // ========================================
    
    // 1. ID ou nom de la boutique à modifier
    const shopIdentifier = 'Ma Boutique';  // 👈 Mettez l'ID MongoDB ou le nom exact de la boutique
    
    // 2. Nouvelles informations (laissez null pour ne pas modifier)
    const updates = {
      name: null,  // 👈 Nouveau nom ou null pour garder l'ancien
      description: null,  // 👈 Nouvelle description ou null
      countries: null,  // 👈 Ex: ['France', 'Belgique', 'Suisse'] ou null
      isVip: null,  // 👈 true/false ou null pour ne pas changer
      image: null,  // 👈 Nouvelle URL d'image ou null
      services: {
        delivery: {
          enabled: null,  // 👈 true/false ou null
          description: null,  // 👈 Nouvelle description ou null
          departments: null  // 👈 Ex: ['75', '92', '93'] ou null
        },
        meetup: {
          enabled: null,  // 👈 true/false ou null
          description: null,  // 👈 Nouvelle description ou null
          departments: null  // 👈 Ex: ['75', '92'] ou null
        },
        postal: {
          enabled: null,  // 👈 true/false ou null
          description: null,  // 👈 Nouvelle description ou null
          countries: null  // 👈 Ex: ['Belgique', 'Suisse'] ou null
        }
      },
      contact: {
        telegram: null,  // 👈 Nouveau @username ou null
        instagram: null,  // 👈 Nouveau @username ou null
        whatsapp: null,  // 👈 Nouveau numéro ou null
        signal: null,
        potato: null,
        snapchat: null,
        session: null,
        threema: null,
        telegramChannel: null,
        telegramBot: null
      },
      socialMedia: null  // 👈 Ex: [{ name: 'Telegram', emoji: '💬', url: 'https://t.me/...' }] ou null
    };
    
    // Rechercher la boutique
    console.log('\n🔍 Recherche de la boutique...');
    let shop;
    
    // Si c'est un ID MongoDB (24 caractères hex)
    if (shopIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
      shop = await Plug.findById(shopIdentifier);
    } else {
      // Sinon chercher par nom
      shop = await Plug.findOne({ name: shopIdentifier });
    }
    
    if (!shop) {
      console.error('❌ Boutique non trouvée !');
      console.log('\n📋 Boutiques existantes:');
      const allShops = await Plug.find({}, 'name _id').limit(20);
      allShops.forEach(s => {
        console.log(`  - ${s.name} (ID: ${s._id})`);
      });
      process.exit(1);
    }
    
    console.log('✅ Boutique trouvée:', shop.name);
    console.log('🆔 ID:', shop._id);
    
    // Appliquer les modifications
    console.log('\n📝 Application des modifications...');
    let modified = false;
    
    // Informations de base
    if (updates.name !== null) {
      shop.name = updates.name;
      console.log('  ✏️ Nom:', updates.name);
      modified = true;
    }
    if (updates.description !== null) {
      shop.description = updates.description;
      console.log('  ✏️ Description mise à jour');
      modified = true;
    }
    if (updates.countries !== null) {
      shop.countries = updates.countries;
      console.log('  ✏️ Pays:', updates.countries.join(', '));
      modified = true;
    }
    if (updates.isVip !== null) {
      shop.isVip = updates.isVip;
      console.log('  ✏️ VIP:', updates.isVip ? 'Oui' : 'Non');
      modified = true;
    }
    if (updates.image !== null) {
      shop.image = updates.image;
      console.log('  ✏️ Image mise à jour');
      modified = true;
    }
    
    // Services
    ['delivery', 'meetup', 'postal'].forEach(service => {
      if (updates.services[service].enabled !== null) {
        shop.services[service].enabled = updates.services[service].enabled;
        console.log(`  ✏️ Service ${service}:`, updates.services[service].enabled ? 'Activé' : 'Désactivé');
        modified = true;
      }
      if (updates.services[service].description !== null) {
        shop.services[service].description = updates.services[service].description;
        console.log(`  ✏️ Description ${service} mise à jour`);
        modified = true;
      }
      if (service !== 'postal' && updates.services[service].departments !== null) {
        shop.services[service].departments = updates.services[service].departments;
        console.log(`  ✏️ Départements ${service}:`, updates.services[service].departments.join(', '));
        modified = true;
      }
      if (service === 'postal' && updates.services[service].countries !== null) {
        shop.services[service].countries = updates.services[service].countries;
        console.log(`  ✏️ Pays ${service}:`, updates.services[service].countries.join(', '));
        modified = true;
      }
    });
    
    // Contacts
    Object.keys(updates.contact).forEach(key => {
      if (updates.contact[key] !== null) {
        shop.contact[key] = updates.contact[key];
        console.log(`  ✏️ ${key}:`, updates.contact[key]);
        modified = true;
      }
    });
    
    // Réseaux sociaux
    if (updates.socialMedia !== null) {
      shop.socialMedia = updates.socialMedia;
      console.log('  ✏️ Réseaux sociaux mis à jour');
      modified = true;
    }
    
    if (!modified) {
      console.log('\n⚠️ Aucune modification détectée !');
      console.log('Modifiez les valeurs dans le fichier (mettez autre chose que null)');
      process.exit(0);
    }
    
    // Sauvegarder
    const saved = await shop.save();
    console.log('\n✅ Boutique modifiée avec succès !');
    console.log('🆔 ID:', saved._id);
    console.log('📱 Nom:', saved.name);
    
    console.log('\n✨ Les modifications sont maintenant visibles sur le bot et le site !');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(field => {
        console.error(`  - ${field}: ${error.errors[field].message}`);
      });
    }
    process.exit(1);
  }
}

// Instructions
console.log('==============================================');
console.log('📝 SCRIPT DE MODIFICATION DIRECTE DE BOUTIQUE');
console.log('==============================================');
console.log('\n⚠️  IMPORTANT:');
console.log('1. Mettez l\'ID ou le nom exact de la boutique ligne 18');
console.log('2. Modifiez uniquement les champs que vous voulez changer');
console.log('3. Laissez null pour ne pas modifier un champ');
console.log('\n📍 Lignes à modifier: 18-57');
console.log('\n🚀 Pour exécuter: node modify-shop-direct.js');
console.log('==============================================\n');

// Demander confirmation
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Avez-vous configuré les modifications ? (oui/non) ', (answer) => {
  if (answer.toLowerCase() === 'oui' || answer.toLowerCase() === 'o') {
    rl.close();
    modifyShop();
  } else {
    console.log('\n❌ Configurez d\'abord les modifications dans ce fichier.');
    console.log('📝 Ouvrez le fichier modify-shop-direct.js');
    rl.close();
    process.exit(0);
  }
});