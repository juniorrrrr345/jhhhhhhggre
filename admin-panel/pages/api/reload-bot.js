export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jhhhhhhggre.onrender.com';
    
    // Appeler l'endpoint de redémarrage du bot
    const response = await fetch(`${API_BASE_URL}/api/bot/reload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization,
      },
    });

    if (response.ok) {
      const data = await response.json();
      res.status(200).json({ success: true, message: 'Bot rechargé avec succès', data });
    } else {
      const error = await response.text();
      res.status(response.status).json({ error: `Erreur lors du rechargement: ${error}` });
    }
  } catch (error) {
    console.error('Erreur reload bot:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}