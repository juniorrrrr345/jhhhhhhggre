export default function handler(req, res) {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Dashboard shops fix deployed',
    version: '1.0.1'
  });
}