export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Récupérer la configuration depuis le bot
      const botApiUrl = 'https://jhhhhhhggre.onrender.com'
      
      const response = await fetch(`${botApiUrl}/api/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Retourner seulement les liens Telegram
        res.status(200).json({
          inscriptionTelegramLink: data.boutique?.inscriptionTelegramLink || 'https://t.me/FindYourPlugBot',
          servicesTelegramLink: data.boutique?.servicesTelegramLink || 'https://t.me/FindYourPlugBot'
        })
      } else {
        // Fallback si l'API du bot n'est pas disponible
        res.status(200).json({
          inscriptionTelegramLink: 'https://t.me/FindYourPlugBot',
          servicesTelegramLink: 'https://t.me/FindYourPlugBot'
        })
      }
    } catch (error) {
      console.error('Erreur API config:', error)
      // Fallback en cas d'erreur
      res.status(200).json({
        inscriptionTelegramLink: 'https://t.me/FindYourPlugBot',
        servicesTelegramLink: 'https://t.me/FindYourPlugBot'
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}