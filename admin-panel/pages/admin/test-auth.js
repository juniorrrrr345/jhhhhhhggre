import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { simpleApi } from '../../lib/api-simple';

export default function TestAuth() {
  const [results, setResults] = useState({
    token: null,
    configTest: null,
    applicationsTest: null,
    error: null
  });

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const token = localStorage.getItem('adminToken');
    console.log('🔍 Token trouvé:', token ? 'OUI' : 'NON');
    console.log('🔍 Token value:', token?.substring(0, 20) + '...');

    setResults(prev => ({ ...prev, token }));

    if (!token) {
      setResults(prev => ({ ...prev, error: 'Pas de token dans localStorage' }));
      return;
    }

    // Test 1: API Config (qui fonctionne)
    try {
      console.log('🧪 Test API Config...');
      const configData = await simpleApi.getConfig(token);
      console.log('✅ Config API OK:', !!configData);
      setResults(prev => ({ ...prev, configTest: 'SUCCESS' }));
    } catch (error) {
      console.error('❌ Config API Error:', error);
      setResults(prev => ({ ...prev, configTest: `ERROR: ${error.message}` }));
    }

    // Test 2: API Applications (qui ne fonctionne pas)
    try {
      console.log('🧪 Test API Applications...');
      const appsData = await simpleApi.getApplications(token);
      console.log('✅ Applications API OK:', !!appsData);
      setResults(prev => ({ ...prev, applicationsTest: 'SUCCESS' }));
    } catch (error) {
      console.error('❌ Applications API Error:', error);
      setResults(prev => ({ ...prev, applicationsTest: `ERROR: ${error.message}` }));
    }
  };

  const testDirectCall = async () => {
    const token = localStorage.getItem('adminToken');
    
    try {
      console.log('🧪 Test direct vers API...');
      const response = await fetch('/api/cors-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: '/api/applications',
          method: 'GET',
          token: token,
          data: null
        })
      });

      const result = await response.json();
      console.log('📡 Direct API Response:', result);
      
      if (result.success) {
        setResults(prev => ({ ...prev, applicationsTest: `DIRECT SUCCESS: ${result.data?.applications?.length || 0} applications` }));
      } else {
        setResults(prev => ({ ...prev, applicationsTest: `DIRECT ERROR: ${result.error}` }));
      }
    } catch (error) {
      console.error('❌ Direct API Error:', error);
      setResults(prev => ({ ...prev, applicationsTest: `DIRECT ERROR: ${error.message}` }));
    }
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold leading-6 text-gray-900">Test Authentification</h1>
            <p className="mt-2 text-sm text-gray-700">
              Diagnostic des problèmes d'authentification et d'API.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* Résultats des tests */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                🧪 Résultats des tests
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Token localStorage:</span>
                  <span className={`px-2 py-1 rounded text-sm ${results.token ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {results.token ? '✅ Présent' : '❌ Absent'}
                  </span>
                  {results.token && (
                    <span className="text-xs text-gray-500">
                      {results.token.substring(0, 20)}...
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-medium">API Config:</span>
                  <span className={`px-2 py-1 rounded text-sm ${results.configTest === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {results.configTest || 'En cours...'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-medium">API Applications:</span>
                  <span className={`px-2 py-1 rounded text-sm ${results.applicationsTest?.startsWith('SUCCESS') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {results.applicationsTest || 'En cours...'}
                  </span>
                </div>
              </div>

              {results.error && (
                <div className="mt-4 rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-800">{results.error}</div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                🔧 Actions de test
              </h3>
              
              <div className="space-y-4">
                <button
                  onClick={runTests}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  🔄 Relancer les tests
                </button>

                <button
                  onClick={testDirectCall}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 ml-2"
                >
                  🧪 Test appel direct
                </button>

                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Debug info:</strong></p>
                  <p>• Token localStorage key: 'adminToken'</p>
                  <p>• API endpoint: /api/applications</p>
                  <p>• Method: GET</p>
                  <p>• Via proxy: /api/cors-proxy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}