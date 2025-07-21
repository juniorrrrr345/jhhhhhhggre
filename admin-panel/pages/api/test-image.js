// Test simple pour vérifier que les APIs fonctionnent
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { url } = req.query
  
  res.status(200).json({
    message: 'API Test fonctionne !',
    timestamp: new Date().toISOString(),
    url: url || 'Aucune URL fournie',
    method: req.method,
    headers: req.headers,
    query: req.query
  })
}