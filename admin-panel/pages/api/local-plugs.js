// API locale de fallback pour les boutiques
export default function handler(req, res) {
  // Simuler une réponse vide en cas d'erreur API principale
  res.status(200).json({
    plugs: [],
    success: true,
    source: 'local-fallback'
  })
}