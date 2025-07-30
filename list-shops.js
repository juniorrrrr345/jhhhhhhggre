const mongoose = require('mongoose');
require('dotenv').config({ path: './bot/.env' });

// Script pour lister toutes les boutiques
async function listShops() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/findyourplug');
    console.log('✅ Connecté à MongoDB\n');
    
    const Plug = require('./bot/src/models/Plug');
    
    // Récupérer toutes les boutiques
    const shops = await Plug.find({}).sort({ createdAt: -1 });
    
    console.log('==============================================');
    console.log(`📋 LISTE DES BOUTIQUES (Total: ${shops.length})`);
    console.log('==============================================\n');
    
    if (shops.length === 0) {
      console.log('❌ Aucune boutique trouvée dans la base de données.');
      process.exit(0);
    }
    
    // Afficher chaque boutique
    shops.forEach((shop, index) => {
      console.log(`${index + 1}. ${shop.isVip ? '⭐' : '📦'} ${shop.name}`);
      console.log(`   🆔 ID: ${shop._id}`);
      console.log(`   🌍 Pays: ${shop.countries.join(', ') || 'Non défini'}`);
      console.log(`   💬 Telegram: ${shop.contact?.telegram || 'Non défini'}`);
      
      // Services actifs
      const activeServices = [];
      if (shop.services?.delivery?.enabled) {
        const deps = shop.services.delivery.departments?.length || 0;
        activeServices.push(`📦 Livraison (${deps} dép.)`);
      }
      if (shop.services?.meetup?.enabled) {
        const deps = shop.services.meetup.departments?.length || 0;
        activeServices.push(`🤝 Rencontre (${deps} dép.)`);
      }
      if (shop.services?.postal?.enabled) {
        const countries = shop.services.postal.countries?.length || 0;
        activeServices.push(`📬 Postal (${countries} pays)`);
      }
      
      if (activeServices.length > 0) {
        console.log(`   📍 Services: ${activeServices.join(', ')}`);
      }
      
      console.log(`   ❤️  Likes: ${shop.likes || 0}`);
      console.log(`   📅 Créée le: ${shop.createdAt ? new Date(shop.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}`);
      
      if (shop.referralCode) {
        console.log(`   🔗 Code parrainage: ${shop.referralCode}`);
      }
      
      console.log('');
    });
    
    // Statistiques
    console.log('==============================================');
    console.log('📊 STATISTIQUES');
    console.log('==============================================');
    
    const vipCount = shops.filter(s => s.isVip).length;
    const withDelivery = shops.filter(s => s.services?.delivery?.enabled).length;
    const withMeetup = shops.filter(s => s.services?.meetup?.enabled).length;
    const withPostal = shops.filter(s => s.services?.postal?.enabled).length;
    
    console.log(`⭐ Boutiques VIP: ${vipCount}`);
    console.log(`📦 Avec livraison: ${withDelivery}`);
    console.log(`🤝 Avec rencontre: ${withMeetup}`);
    console.log(`📬 Avec postal: ${withPostal}`);
    
    // Pays les plus représentés
    const countryCounts = {};
    shops.forEach(shop => {
      (shop.countries || []).forEach(country => {
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      });
    });
    
    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    if (topCountries.length > 0) {
      console.log('\n🌍 Top 5 des pays:');
      topCountries.forEach(([country, count]) => {
        console.log(`   - ${country}: ${count} boutique(s)`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter directement
listShops();