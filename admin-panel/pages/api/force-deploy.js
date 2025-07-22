export default function handler(req, res) {
  res.status(200).json({
    status: 'DASHBOARD_RESTORED',
    timestamp: new Date().toISOString(),
    message: 'Dashboard avec simpleApi restauré - Boutiques devraient s\'afficher',
    version: '1.0.2',
    method: 'simpleApi_proxy_cors'
  });
}