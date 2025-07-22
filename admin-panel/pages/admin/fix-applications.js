import { useState } from 'react';
import Layout from '../../components/Layout';

export default function FixApplications() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setResult('🔄 Test en cours...\n');
    
    try {
      // Test 1: Vérifier le token
      const token = localStorage.getItem('adminToken') || 'ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1';
      setResult(prev => prev + `✅ Token: ${token.substring(0, 10)}...\n`);
      
      // Test 2: API via proxy
      const response = await fetch('/api/cors-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: '/api/applications',
          method: 'GET',
          token: token,
          data: null
        })
      });
      
      setResult(prev => prev + `📡 Status: ${response.status}\n`);
      
      const data = await response.json();
      setResult(prev => prev + `📋 Response: ${JSON.stringify(data, null, 2)}\n`);
      
      if (data.success) {
        setResult(prev => prev + `✅ ${data.data?.applications?.length || 0} applications trouvées\n`);
      } else {
        setResult(prev => prev + `❌ Erreur: ${data.error}\n`);
      }
      
    } catch (error) {
      setResult(prev => prev + `💥 Erreur JavaScript: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  const fixToken = () => {
    localStorage.setItem('adminToken', 'ADMIN_TOKEN_F3F3FC574B8A95875449DBD68128C434CE3D7FB3F054567B0D3EAD3D9F1B01B1');
    setResult('🔧 Token fixé dans localStorage\n');
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold leading-6 text-gray-900">🔧 Fix Applications</h1>
            <p className="mt-2 text-sm text-gray-700">
              Page de diagnostic et correction pour l'API applications.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                🛠️ Actions
              </h3>
              
              <div className="space-y-4">
                <button
                  onClick={fixToken}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  🔧 Fixer le token localStorage
                </button>

                <button
                  onClick={testApi}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 ml-2 disabled:opacity-50"
                >
                  {loading ? '🔄 Test...' : '🧪 Tester API Applications'}
                </button>

                <a
                  href="/admin/applications"
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 ml-2 inline-block"
                >
                  📋 Aller aux Applications
                </a>
              </div>
            </div>
          </div>

          {/* Résultats */}
          {result && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  📋 Résultats
                </h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {result}
                </pre>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <p><strong>ℹ️ Instructions:</strong></p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Clique "🔧 Fixer le token" pour s'assurer que le token est bon</li>
                <li>Clique "🧪 Tester API" pour diagnostiquer l'erreur</li>
                <li>Si tout marche, va sur "📋 Aller aux Applications"</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}