import { useState, useEffect } from 'react';

export default function DebugLogin() {
  const [envVars, setEnvVars] = useState({});
  const [apiTest, setApiTest] = useState(null);

  useEffect(() => {
    // Variables d'environnement côté client
    setEnvVars({
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'Non défini',
      NODE_ENV: process.env.NODE_ENV || 'Non défini'
    });

    // Test de l'API
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jhhhhhhggre.onrender.com';
      
      console.log('🧪 Test API URL:', apiBaseUrl);
      
      const response = await fetch(`${apiBaseUrl}/api/config`, {
        headers: {
          'Authorization': 'Bearer test',
          'Cache-Control': 'no-cache'
        }
      });

      setApiTest({
        url: apiBaseUrl,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setApiTest({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Debug Login Admin</h1>
        
        {/* Variables d'environnement */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📋 Variables d'environnement</h2>
          <div className="space-y-2">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex">
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mr-4 min-w-0 flex-shrink-0">
                  {key}
                </span>
                <span className="font-mono text-sm break-all">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Test API */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🌐 Test API</h2>
          <button
            onClick={testAPI}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
          >
            🔄 Retester API
          </button>
          
          {apiTest && (
            <div className="bg-gray-50 p-4 rounded">
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(apiTest, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Test Proxy */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔄 Test Proxy</h2>
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/proxy?endpoint=/api/config', {
                  headers: {
                    'Authorization': 'test',
                    'Cache-Control': 'no-cache'
                  }
                });
                
                const result = {
                  status: response.status,
                  statusText: response.statusText,
                  ok: response.ok,
                  url: '/api/proxy?endpoint=/api/config',
                  timestamp: new Date().toISOString()
                };

                if (response.ok) {
                  try {
                    const data = await response.json();
                    result.hasData = true;
                    result.dataPreview = typeof data;
                  } catch (e) {
                    result.hasData = false;
                  }
                }
                
                setApiTest(result);
              } catch (error) {
                setApiTest({
                  error: error.message,
                  type: 'proxy',
                  timestamp: new Date().toISOString()
                });
              }
            }}
            className="bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600"
          >
            🧪 Tester Proxy
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">💡 Instructions</h2>
          <ul className="space-y-2 text-yellow-700">
            <li>• Vérifiez que NEXT_PUBLIC_API_BASE_URL pointe vers votre API Render</li>
            <li>• Le status 401 est normal avec "Bearer test" - cela signifie que l'API répond</li>
            <li>• Le status 500+ indique un problème serveur</li>
            <li>• Une erreur de réseau indique un problème de connectivité</li>
            <li>• Si l'API directe échoue, le proxy devrait fonctionner</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
          >
            ← Retour au login
          </a>
        </div>
      </div>
    </div>
  );
}