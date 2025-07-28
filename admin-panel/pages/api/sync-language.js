export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { language, userId } = req.body;
    
    if (!language || !userId) {
      return res.status(400).json({ error: 'Language and userId required' });
    }

    // Stocker la langue dans localStorage côté client via un cookie ou session
    // Pour l'instant, on retourne juste un succès
    console.log(`🌐 Synchronisation langue: ${language} pour user ${userId}`);
    
    res.status(200).json({ 
      success: true, 
      language,
      message: `Language synced to ${language}`
    });
  } catch (error) {
    console.error('Erreur sync langue:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}