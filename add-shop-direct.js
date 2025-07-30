const mongoose = require('mongoose');
require('dotenv').config({ path: './bot/.env' });

// Script pour ajouter une boutique directement
async function addShop() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/findyourplug');
    console.log('✅ Connecté à MongoDB');
    
    const Plug = require('./bot/src/models/Plug');
    
    // ========================================
    // MODIFIEZ CES INFORMATIONS POUR VOTRE BOUTIQUE
    // ========================================
    const newShop = {
      name: 'Ma Nouvelle Boutique',  // 👈 Changez le nom ici
      description: 'Description de ma boutique',  // 👈 Changez la description
      countries: ['France', 'Belgique'],  // 👈 Changez les pays
      isVip: false,  // 👈 true pour VIP, false pour standard
      image: '',  // 👈 URL de l'image (optionnel)
      services: {
        delivery: {
          enabled: true,  // 👈 true pour activer la livraison
          description: 'Livraison rapide et discrète',
          departments: ['75', '92', '93', '94']  // 👈 Départements pour livraison
        },
        meetup: {
          enabled: true,  // 👈 true pour activer les rencontres
          description: 'Rencontre en personne',
          departments: ['75', '92']  // 👈 Départements pour rencontre
        },
        postal: {
          enabled: false,  // 👈 true pour activer le service postal
          description: '',
          countries: []  // 👈 Pays pour le service postal
        }
      },
      contact: {
        telegram: '@monusername',  // 👈 IMPORTANT: Votre username Telegram
        instagram: '',  // 👈 Instagram (optionnel)
        whatsapp: '',  // 👈 WhatsApp (optionnel)
        signal: '',  // 👈 Signal (optionnel)
        potato: '',  // 👈 Potato (optionnel)
        snapchat: '',  // 👈 Snapchat (optionnel)
        session: '',  // 👈 Session (optionnel)
        threema: '',  // 👈 Threema (optionnel)
        telegramChannel: '',  // 👈 Canal Telegram (optionnel)
        telegramBot: ''  // 👈 Bot Telegram (optionnel)
      },
      socialMedia: [
        // Ajoutez vos réseaux sociaux ici
        // { name: 'Telegram', emoji: '💬', url: 'https://t.me/monusername' },
        // { name: 'Instagram', emoji: '📸', url: 'https://instagram.com/monusername' }
      ],
      likes: 0,
      likedBy: []
    };
    
    // Créer et sauvegarder la boutique
    console.log('\n📝 Création de la boutique...');
    const plug = new Plug(newShop);
    
    // Générer le code de parrainage
    plug.referralCode = plug.generateReferralCode();
    plug.referralLink = plug.generateReferralLink('FindYourPlugBot'); // Remplacez par le nom de votre bot
    
    const saved = await plug.save();
    console.log('\n✅ Boutique créée avec succès !');
    console.log('🆔 ID:', saved._id);
    console.log('📱 Nom:', saved.name);
    console.log('🌍 Pays:', saved.countries.join(', '));
    console.log('🔗 Code parrainage:', saved.referralCode);
    console.log('🔗 Lien parrainage:', saved.referralLink);
    
    // Afficher les services actifs
    console.log('\n📦 Services actifs:');
    if (saved.services.delivery.enabled) {
      console.log('  ✅ Livraison - Départements:', saved.services.delivery.departments.join(', '));
    }
    if (saved.services.meetup.enabled) {
      console.log('  ✅ Rencontre - Départements:', saved.services.meetup.departments.join(', '));
    }
    if (saved.services.postal.enabled) {
      console.log('  ✅ Postal - Pays:', saved.services.postal.countries.join(', '));
    }
    
    console.log('\n✨ La boutique est maintenant visible sur le bot et le site !');
    
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
console.log('📝 SCRIPT D\'AJOUT DIRECT DE BOUTIQUE');
console.log('==============================================');
console.log('\n⚠️  IMPORTANT: Modifiez les informations de la boutique');
console.log('   dans ce fichier avant de l\'exécuter !');
console.log('\n📍 Lignes à modifier: 16-55');
console.log('\n🚀 Pour exécuter: node add-shop-direct.js');
console.log('==============================================\n');

// Demander confirmation
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Avez-vous modifié les informations de la boutique ? (oui/non) ', (answer) => {
  if (answer.toLowerCase() === 'oui' || answer.toLowerCase() === 'o') {
    rl.close();
    addShop();
  } else {
    console.log('\n❌ Modifiez d\'abord les informations de la boutique dans ce fichier.');
    console.log('📝 Ouvrez le fichier add-shop-direct.js et modifiez les lignes 16-55');
    rl.close();
    process.exit(0);
  }
});