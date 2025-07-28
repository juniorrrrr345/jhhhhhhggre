// API locale de fallback pour les boutiques quand le serveur principal est down
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const LOCAL_DATA_FILE = join(process.cwd(), 'data', 'local-plugs.json');

// Créer le dossier data s'il n'existe pas
const dataDir = join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  require('fs').mkdirSync(dataDir, { recursive: true });
}

// Données par défaut
const DEFAULT_DATA = {
  plugs: [],
  lastUpdate: new Date().toISOString()
};

// Lire les données locales
function readLocalData() {
  try {
    if (existsSync(LOCAL_DATA_FILE)) {
      const data = readFileSync(LOCAL_DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erreur lecture données locales:', error);
  }
  return DEFAULT_DATA;
}

// Sauvegarder les données locales
function saveLocalData(data) {
  try {
    writeFileSync(LOCAL_DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde données locales:', error);
    return false;
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

  const { method, query, body } = req;
  const { id } = query;

  try {
    const localData = readLocalData();

    switch (method) {
      case 'GET':
        if (id) {
          // Récupérer une boutique spécifique
          const plug = localData.plugs.find(p => p._id === id || p.id === id);
          if (!plug) {
            return res.status(404).json({ error: 'Boutique non trouvée' });
          }
          res.status(200).json(plug);
        } else {
          // Récupérer toutes les boutiques
          res.status(200).json({
            success: true,
            plugs: localData.plugs,
            count: localData.plugs.length,
            source: 'local'
          });
        }
        break;

      case 'POST':
        // Créer une nouvelle boutique
        const newPlug = {
          _id: Date.now().toString(),
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likes: 0,
          likedBy: [],
          isActive: body.isActive !== undefined ? body.isActive : true
        };
        
        localData.plugs.push(newPlug);
        localData.lastUpdate = new Date().toISOString();
        
        if (saveLocalData(localData)) {
          res.status(201).json({
            success: true,
            plug: newPlug,
            message: 'Boutique créée localement'
          });
        } else {
          res.status(500).json({ error: 'Erreur sauvegarde locale' });
        }
        break;

      case 'PUT':
        // Modifier une boutique existante
        if (!id) {
          return res.status(400).json({ error: 'ID requis pour la modification' });
        }
        
        const plugIndex = localData.plugs.findIndex(p => p._id === id || p.id === id);
        if (plugIndex === -1) {
          return res.status(404).json({ error: 'Boutique non trouvée' });
        }
        
        localData.plugs[plugIndex] = {
          ...localData.plugs[plugIndex],
          ...body,
          _id: id,
          updatedAt: new Date().toISOString()
        };
        localData.lastUpdate = new Date().toISOString();
        
        if (saveLocalData(localData)) {
          res.status(200).json({
            success: true,
            plug: localData.plugs[plugIndex],
            message: 'Boutique modifiée localement'
          });
        } else {
          res.status(500).json({ error: 'Erreur sauvegarde locale' });
        }
        break;

      case 'DELETE':
        // Supprimer une boutique
        if (!id) {
          return res.status(400).json({ error: 'ID requis pour la suppression' });
        }
        
        const deleteIndex = localData.plugs.findIndex(p => p._id === id || p.id === id);
        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Boutique non trouvée' });
        }
        
        const deletedPlug = localData.plugs.splice(deleteIndex, 1)[0];
        localData.lastUpdate = new Date().toISOString();
        
        if (saveLocalData(localData)) {
          res.status(200).json({
            success: true,
            plug: deletedPlug,
            message: 'Boutique supprimée localement'
          });
        } else {
          res.status(500).json({ error: 'Erreur sauvegarde locale' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Méthode ${method} non autorisée` });
        break;
    }
  } catch (error) {
    console.error('Erreur API locale:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur local',
      details: error.message 
    });
  }
}