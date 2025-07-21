export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com';
    
    console.log('🔍 Diagnostic de connexion vers:', API_BASE_URL);
    
    // Test de connectivité de base
    const healthResponse = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    });
    
    const healthData = await healthResponse.json();
    
    // Test d'authentification si token fourni
    let authTest = null;
    if (req.headers.authorization) {
      try {
        const authResponse = await fetch(`${API_BASE_URL}/api/config`, {
          method: 'GET',
          headers: {
            'Authorization': req.headers.authorization,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(15000)
        });
        
        authTest = {
          status: authResponse.status,
          ok: authResponse.ok,
          statusText: authResponse.statusText
        };
      } catch (authError) {
        authTest = {
          error: authError.message
        };
      }
    }
    
    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      api_url: API_BASE_URL,
      health: {
        status: healthResponse.status,
        data: healthData
      },
      auth_test: authTest,
      environment: {
        node_env: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
        has_api_url: !!process.env.API_BASE_URL
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur diagnostic:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}