// API locale de fallback pour les boutiques quand le serveur principal est down
// Version adaptée pour Vercel (serverless) - stockage en mémoire

// Stockage en mémoire (temporaire par session)
let memoryData = {
  plugs: [],
  lastUpdate: new Date().toISOString(),
  synced: false
};

// Données par défaut simulées pour les tests
const DEFAULT_PLUGS = [
  {
    _id: 'local_1',
    name: 'Boutique Test Local',
    description: 'Boutique de test pour mode local',
    image: '',
    telegramLink: '',
    countries: ['France'],
    isActive: true,
    isVip: false,
    vipOrder: 1,
    services: {
      delivery: {
        enabled: true,
        description: 'Livraison Paris',
        departments: ['75']
      },
      postal: {
        enabled: true,
        description: 'Expédition France',
        countries: ['France']
      },
      meetup: {
        enabled: false,
        description: '',
        departments: []
      }
    },
    socialMedia: [],
    likes: 0,
    likedBy: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Fonction pour synchroniser avec le serveur principal
async function syncWithMainServer() {
  if (memoryData.synced) return; // Déjà synchronisé
  
  try {
    console.log('🔄 Tentative de synchronisation avec le serveur principal...');
    const apiUrl = process.env.BOT_API_URL || 'https://jhhhhhhggre.onrender.com';
    
    const response = await fetch(`${apiUrl}/api/public/plugs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Local-API-Sync/1.0'
      },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.plugs && Array.isArray(data.plugs)) {
        memoryData.plugs = [...data.plugs];
        memoryData.synced = true;
        memoryData.lastUpdate = new Date().toISOString();
        console.log(`✅ Synchronisation réussie: ${data.plugs.length} boutiques récupérées`);
        return;
      }
    }
  } catch (error) {
    console.log('⚠️ Sync échouée, utilisation des données par défaut:', error.message);
  }
  
  // Fallback: utiliser les données par défaut
  if (memoryData.plugs.length === 0) {
    memoryData.plugs = [...DEFAULT_PLUGS];
    console.log('📦 Utilisation des données par défaut');
  }
}

export default async function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Synchroniser au premier appel
  await syncWithMainServer();

  const { method, query, body } = req;
  const { id } = query;

  try {
    console.log(`🔧 API locale: ${method} ${id ? `- ID: ${id}` : ''}`);

    switch (method) {
      case 'GET':
        if (id) {
          // Récupérer une boutique spécifique
          const plug = memoryData.plugs.find(p => p._id === id || p.id === id);
          if (!plug) {
            console.log(`❌ Boutique ${id} non trouvée`);
            return res.status(404).json({ error: 'Boutique non trouvée' });
          }
          console.log(`✅ Boutique ${id} trouvée localement`);
          res.status(200).json(plug);
        } else {
          // Récupérer toutes les boutiques
          console.log(`📦 Retour de ${memoryData.plugs.length} boutiques locales`);
          res.status(200).json({
            success: true,
            plugs: memoryData.plugs,
            count: memoryData.plugs.length,
            source: 'local-memory',
            synced: memoryData.synced
          });
        }
        break;

      case 'POST':
        // Créer une nouvelle boutique
        const newPlug = {
          _id: `local_${Date.now()}`,
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likes: body.likes || 0,
          likedBy: body.likedBy || [],
          isActive: body.isActive !== undefined ? body.isActive : true
        };
        
        memoryData.plugs.push(newPlug);
        memoryData.lastUpdate = new Date().toISOString();
        
        console.log(`✅ Nouvelle boutique créée localement: ${newPlug.name}`);
        res.status(201).json({
          success: true,
          plug: newPlug,
          message: 'Boutique créée localement (mémoire)'
        });
        break;

      case 'PUT':
        // Modifier une boutique existante
        if (!id) {
          return res.status(400).json({ error: 'ID requis pour la modification' });
        }
        
        const plugIndex = memoryData.plugs.findIndex(p => p._id === id || p.id === id);
        if (plugIndex === -1) {
          console.log(`❌ Boutique ${id} non trouvée pour modification`);
          console.log(`📋 Boutiques disponibles: ${memoryData.plugs.map(p => p._id).join(', ')}`);
          return res.status(404).json({ 
            error: 'Boutique non trouvée',
            availableIds: memoryData.plugs.map(p => p._id),
            requestedId: id
          });
        }
        
        memoryData.plugs[plugIndex] = {
          ...memoryData.plugs[plugIndex],
          ...body,
          _id: id,
          updatedAt: new Date().toISOString()
        };
        memoryData.lastUpdate = new Date().toISOString();
        
        console.log(`✅ Boutique ${id} modifiée localement`);
        res.status(200).json({
          success: true,
          plug: memoryData.plugs[plugIndex],
          message: 'Boutique modifiée localement (mémoire)'
        });
        break;

      case 'DELETE':
        // Supprimer une boutique
        if (!id) {
          return res.status(400).json({ error: 'ID requis pour la suppression' });
        }
        
        const deleteIndex = memoryData.plugs.findIndex(p => p._id === id || p.id === id);
        if (deleteIndex === -1) {
          console.log(`❌ Boutique ${id} non trouvée pour suppression`);
          return res.status(404).json({ error: 'Boutique non trouvée' });
        }
        
        const deletedPlug = memoryData.plugs.splice(deleteIndex, 1)[0];
        memoryData.lastUpdate = new Date().toISOString();
        
        console.log(`✅ Boutique ${id} supprimée localement`);
        res.status(200).json({
          success: true,
          plug: deletedPlug,
          message: 'Boutique supprimée localement (mémoire)'
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Méthode ${method} non autorisée` });
        break;
    }
  } catch (error) {
    console.error('❌ Erreur API locale:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur local',
      details: error.message 
    });
  }
}