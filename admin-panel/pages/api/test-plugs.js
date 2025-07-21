// API de test pour retourner des plugs factices
export default function handler(req, res) {
  // Données de test simulées
  const testPlugs = [
    {
      _id: "507f1f77bcf86cd799439011",
      name: "Boutique Premium",
      description: "Boutique de qualité supérieure avec des produits exclusifs. Service client 24/7 et livraison rapide garantie.",
      isActive: true,
      isVip: true,
      vipOrder: 1,
      likes: 15,
      likedBy: [12345, 67890, 11111],
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
      countries: ["France", "Belgique", "Suisse"],
      services: {
        delivery: {
          enabled: true,
          description: "Livraison express en 24h",
          price: "5€"
        },
        postal: {
          enabled: true,
          description: "Envoi postal sécurisé",
          price: "8€"
        },
        meetup: {
          enabled: true,
          description: "Rendez-vous en centre-ville",
          price: "Gratuit"
        }
      },
      createdAt: "2024-01-15T10:30:00.000Z",
      updatedAt: "2024-01-20T14:45:00.000Z"
    },
    {
      _id: "507f1f77bcf86cd799439012",
      name: "Shop Express",
      description: "Boutique rapide et fiable pour tous vos besoins quotidiens. Large gamme de produits disponibles.",
      isActive: true,
      isVip: false,
      likes: 8,
      likedBy: [22222, 33333],
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
      countries: ["France", "Canada"],
      services: {
        delivery: {
          enabled: true,
          description: "Livraison standard",
          price: "3€"
        },
        postal: {
          enabled: false
        },
        meetup: {
          enabled: true,
          description: "Points de retrait disponibles",
          price: "Gratuit"
        }
      },
      createdAt: "2024-01-10T08:15:00.000Z",
      updatedAt: "2024-01-18T16:20:00.000Z"
    },
    {
      _id: "507f1f77bcf86cd799439013", 
      name: "Boutique Élite",
      description: "Collection exclusive de produits haut de gamme. Sélection rigoureuse et qualité irréprochable.",
      isActive: true,
      isVip: true,
      vipOrder: 2,
      likes: 12,
      likedBy: [44444, 55555, 66666],
      image: "https://images.unsplash.com/photo-1555529669-2269763671c0?w=400",
      countries: ["France", "Monaco", "Luxembourg"],
      services: {
        delivery: {
          enabled: true,
          description: "Livraison premium avec emballage soigné",
          price: "10€"
        },
        postal: {
          enabled: true,
          description: "Envoi postal premium", 
          price: "15€"
        },
        meetup: {
          enabled: false
        }
      },
      createdAt: "2024-01-12T12:00:00.000Z",
      updatedAt: "2024-01-19T10:30:00.000Z"
    },
    {
      _id: "507f1f77bcf86cd799439014",
      name: "Quick Store",
      description: "Votre boutique de proximité en ligne. Produits essentiels et livraison ultra-rapide.",
      isActive: true,
      isVip: false,
      likes: 5,
      likedBy: [77777],
      countries: ["France"],
      services: {
        delivery: {
          enabled: true,
          description: "Livraison en 2h en zone urbaine",
          price: "2€"
        },
        postal: {
          enabled: false
        },
        meetup: {
          enabled: true,
          description: "Point relais disponible",
          price: "Gratuit"
        }
      },
      createdAt: "2024-01-08T14:30:00.000Z",
      updatedAt: "2024-01-16T11:45:00.000Z"
    },
    {
      _id: "507f1f77bcf86cd799439015",
      name: "Global Shop",
      description: "Boutique internationale avec expédition mondiale. Large choix de produits importés.",
      isActive: true,
      isVip: false,
      likes: 3,
      countries: ["France", "USA", "Japon", "Allemagne"],
      services: {
        delivery: {
          enabled: false
        },
        postal: {
          enabled: true,
          description: "Expédition internationale",
          price: "20€"
        },
        meetup: {
          enabled: false
        }
      },
      createdAt: "2024-01-05T09:00:00.000Z",
      updatedAt: "2024-01-14T15:30:00.000Z"
    }
  ];

  // Filtrer selon les paramètres de la requête
  let filteredPlugs = testPlugs;
  
  const { filter, search, limit = 50 } = req.query;
  
  // Filtre VIP
  if (filter === 'vip') {
    filteredPlugs = testPlugs.filter(plug => plug.isVip);
  }
  
  // Recherche textuelle
  if (search) {
    filteredPlugs = filteredPlugs.filter(plug => 
      plug.name.toLowerCase().includes(search.toLowerCase()) ||
      plug.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Limiter le nombre de résultats
  filteredPlugs = filteredPlugs.slice(0, parseInt(limit));
  
  // Réponse au format attendu par l'API
  const response = {
    plugs: filteredPlugs,
    pagination: {
      page: 1,
      pages: 1,
      total: filteredPlugs.length
    },
    timestamp: new Date().toISOString()
  };
  
  // Headers pour éviter le cache
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  console.log(`🧪 API Test - Retour de ${filteredPlugs.length} plugs de test (filter: ${filter || 'none'})`);
  
  res.status(200).json(response);
}