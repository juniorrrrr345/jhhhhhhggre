const mongoose = require('mongoose');
const Plug = require('../src/models/Plug');

async function debugVerel() {
  try {
    console.log('🔍 Recherche de la boutique Verel...');
    
    // Connexion à MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-vip-bot';
    await mongoose.connect(mongoURI);
    console.log('✅ Connecté à MongoDB');
    
    // Recherche de Verel (différentes variantes possibles)
    const searchTerms = ['verel', 'Verel', 'VEREL'];
    let verelShop = null;
    
    for (const term of searchTerms) {
      const shops = await Plug.find({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } }
        ]
      });
      
      if (shops.length > 0) {
        console.log(`📋 Trouvé ${shops.length} boutique(s) avec le terme "${term}":`);
        shops.forEach((shop, index) => {
          console.log(`  ${index + 1}. ${shop.name} (ID: ${shop._id})`);
          if (!verelShop) verelShop = shop;
        });
      }
    }
    
    if (!verelShop) {
      console.log('❌ Aucune boutique "Verel" trouvée');
      
      // Lister toutes les boutiques pour aider à identifier
      const allShops = await Plug.find({}).select('name _id image').limit(20);
      console.log('\n📋 Premières 20 boutiques dans la base:');
      allShops.forEach((shop, index) => {
        console.log(`  ${index + 1}. ${shop.name} (ID: ${shop._id}) - Image: ${shop.image ? 'OUI' : 'NON'}`);
      });
      
      return;
    }
    
    console.log(`\n🔍 Diagnostic de la boutique: ${verelShop.name}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Informations générales
    console.log(`📋 Nom: ${verelShop.name}`);
    console.log(`🆔 ID: ${verelShop._id}`);
    console.log(`📝 Description: ${verelShop.description?.substring(0, 100)}...`);
    console.log(`⭐ VIP: ${verelShop.isVip ? 'OUI' : 'NON'}`);
    console.log(`🟢 Actif: ${verelShop.isActive ? 'OUI' : 'NON'}`);
    
    // Analyse de l'image
    console.log(`\n🖼️ ANALYSE DE L'IMAGE:`);
    if (!verelShop.image) {
      console.log('❌ Aucune image définie');
    } else {
      console.log(`📸 URL: ${verelShop.image}`);
      console.log(`📏 Longueur URL: ${verelShop.image.length} caractères`);
      
      // Validation de l'URL
      const isValidUrl = verelShop.image.startsWith('http://') || verelShop.image.startsWith('https://');
      console.log(`🔗 URL valide: ${isValidUrl ? 'OUI' : 'NON'}`);
      
      // Extensions d'images
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const hasExtension = imageExtensions.some(ext => 
        verelShop.image.toLowerCase().includes(ext.toLowerCase())
      );
      console.log(`🖼️ Extension d'image détectée: ${hasExtension ? 'OUI' : 'NON'}`);
      
      // Test de l'URL (sans télécharger)
      if (isValidUrl) {
        try {
          const url = new URL(verelShop.image);
          console.log(`🌐 Domaine: ${url.hostname}`);
          console.log(`📁 Chemin: ${url.pathname}`);
        } catch (urlError) {
          console.log(`❌ Erreur parsing URL: ${urlError.message}`);
        }
      }
    }
    
    // Services
    console.log(`\n📦 SERVICES:`);
    console.log(`🚚 Livraison: ${verelShop.services?.delivery?.enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
    if (verelShop.services?.delivery?.enabled && verelShop.services.delivery.description) {
      console.log(`   Description: ${verelShop.services.delivery.description}`);
    }
    
    console.log(`✈️ Postal: ${verelShop.services?.postal?.enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
    if (verelShop.services?.postal?.enabled && verelShop.services.postal.description) {
      console.log(`   Description: ${verelShop.services.postal.description}`);
    }
    
    console.log(`🏠 Meetup: ${verelShop.services?.meetup?.enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
    if (verelShop.services?.meetup?.enabled && verelShop.services.meetup.description) {
      console.log(`   Description: ${verelShop.services.meetup.description}`);
    }
    
    // Réseaux sociaux
    console.log(`\n📱 RÉSEAUX SOCIAUX:`);
    if (!verelShop.socialMedia || verelShop.socialMedia.length === 0) {
      console.log('❌ Aucun réseau social configuré');
    } else {
      verelShop.socialMedia.forEach((social, index) => {
        console.log(`  ${index + 1}. ${social.emoji || '❓'} ${social.name || 'Sans nom'}: ${social.url || 'Pas d\'URL'}`);
      });
    }
    
    // Telegram
    console.log(`\n📱 TELEGRAM:`);
    console.log(`🔗 Lien: ${verelShop.telegramLink || 'Aucun'}`);
    
    // Statistiques
    console.log(`\n📊 STATISTIQUES:`);
    console.log(`❤️ Likes: ${verelShop.likes || 0}`);
    console.log(`👥 Aimé par: ${verelShop.likedBy?.length || 0} utilisateur(s)`);
    
    // Pays
    console.log(`\n🌍 PAYS:`);
    if (!verelShop.countries || verelShop.countries.length === 0) {
      console.log('❌ Aucun pays configuré');
    } else {
      console.log(`📍 ${verelShop.countries.join(', ')}`);
    }
    
    // Recommandations pour corriger les problèmes
    console.log(`\n💡 RECOMMANDATIONS:`);
    
    if (!verelShop.image) {
      console.log('🔧 1. Ajouter une URL d\'image valide');
    } else if (!verelShop.image.startsWith('http')) {
      console.log('🔧 1. Corriger l\'URL d\'image (doit commencer par http:// ou https://)');
    }
    
    if (!verelShop.countries || verelShop.countries.length === 0) {
      console.log('🔧 2. Configurer au moins un pays');
    }
    
    if (!verelShop.services?.delivery?.enabled && !verelShop.services?.postal?.enabled && !verelShop.services?.meetup?.enabled) {
      console.log('🔧 3. Activer au moins un service (livraison, postal ou meetup)');
    }
    
    console.log('\n✅ Diagnostic terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le diagnostic
debugVerel().catch(console.error);