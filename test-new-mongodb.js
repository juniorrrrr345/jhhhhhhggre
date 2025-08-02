const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

// Nouvelle URI MongoDB
const NEW_URI = 'mongodb+srv://teste:Junior@junior.jiy8uam.mongodb.net/?retryWrites=true&w=majority&appName=Junior';

async function testAndInitialize() {
  console.log('🚀 Configuration de la nouvelle base MongoDB\n');
  
  try {
    // Test de connexion avec MongoClient
    console.log('📡 Test de connexion...');
    const client = new MongoClient(NEW_URI);
    await client.connect();
    console.log('✅ Connexion réussie !');
    
    // Lister les bases de données
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log('\n📊 Bases de données existantes:');
    dbs.databases.forEach(db => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    await client.close();
    
    // Connexion avec Mongoose pour créer la structure
    console.log('\n🔧 Initialisation de la structure de base...');
    await mongoose.connect(NEW_URI);
    
    // Créer le modèle Config
    const ConfigSchema = new mongoose.Schema({
      _id: { type: String, default: 'main' },
      welcomeMessage: { type: String, default: 'Bienvenue sur FindYourPlug!' },
      contactMessage: { type: String, default: 'Contactez-nous' },
      infoMessage: { type: String, default: 'Information' },
      supportLink: { type: String, default: '' },
      image: { type: String, default: '' },
      socialMedia: [{
        name: String,
        url: String,
        icon: String
      }],
      languages: {
        available: { type: [String], default: ['fr', 'en', 'es', 'ar'] },
        currentLanguage: { type: String, default: 'fr' },
        translations: { type: mongoose.Schema.Types.Mixed, default: {} }
      },
      shopConfig: {
        name: { type: String, default: 'FINDYOURPLUG' },
        logo: { type: String, default: '' },
        backgroundImage: { type: String, default: '' },
        customization: {
          primaryColor: { type: String, default: '#4F46E5' },
          secondaryColor: { type: String, default: '#10B981' },
          fontFamily: { type: String, default: 'Inter' }
        }
      }
    }, { timestamps: true });
    
    const Config = mongoose.models.Config || mongoose.model('Config', ConfigSchema);
    
    // Vérifier si une config existe déjà
    let config = await Config.findById('main');
    
    if (!config) {
      console.log('📝 Création de la configuration initiale...');
      config = await Config.create({
        _id: 'main',
        welcomeMessage: '🎉 Bienvenue sur FindYourPlug!\n\nDécouvrez les meilleures boutiques près de chez vous.',
        contactMessage: '📞 Pour nous contacter, utilisez le bouton ci-dessous.',
        infoMessage: 'ℹ️ FindYourPlug - Votre plateforme de confiance pour trouver les meilleures boutiques.',
        languages: {
          available: ['fr', 'en', 'es', 'ar'],
          currentLanguage: 'fr',
          translations: {}
        },
        shopConfig: {
          name: 'FINDYOURPLUG',
          logo: 'https://i.imgur.com/VQ3GZYM.png',
          backgroundImage: 'https://i.imgur.com/iISKonz.jpeg'
        }
      });
      console.log('✅ Configuration créée avec succès');
    } else {
      console.log('✅ Configuration existante trouvée');
    }
    
    // Afficher les collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('\n📚 Collections dans la base:');
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`   - ${col.name}: ${count} documents`);
    }
    
    await mongoose.disconnect();
    
    console.log('\n✅ Base de données prête à l\'emploi !');
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Allez sur Render Dashboard');
    console.log('2. Dans votre service bot, allez dans "Environment"');
    console.log('3. Mettez à jour MONGODB_URI avec:');
    console.log(`   ${NEW_URI}`);
    console.log('4. Cliquez sur "Save Changes"');
    console.log('5. Le bot redémarrera automatiquement avec la nouvelle base');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Lancer le test et l'initialisation
testAndInitialize();