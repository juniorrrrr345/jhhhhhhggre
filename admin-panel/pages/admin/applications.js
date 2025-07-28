import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { simpleApi } from '../../lib/api-simple';
import toast from 'react-hot-toast';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [authStatus, setAuthStatus] = useState('checking');

  useEffect(() => {
    checkAuthAndFetchApplications();
  }, []);

  const checkAuthAndFetchApplications = async () => {
    // Vérifier l'authentification
    let token = localStorage.getItem('adminToken');
    
    if (!token) {
      console.log('❌ Pas de token, redirection vers login');
      setAuthStatus('no-token');
      setError('Vous devez vous connecter pour accéder à cette page');
      setLoading(false);
      return;
    }

    console.log('🔍 Token trouvé:', token.substring(0, 10) + '...');
    setAuthStatus('authenticated');
    await fetchApplications();
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      
      let token = localStorage.getItem('adminToken');
      
      // Utiliser le bon token (JuniorAdmon123 qui fonctionne)
      if (!token) {
        console.log('⚠️ Pas de token, utilisation token par défaut');
        token = 'JuniorAdmon123';
        localStorage.setItem('adminToken', token);
      }

      console.log('📡 Récupération des demandes avec token:', token.substring(0, 10) + '...');
      
      const data = await simpleApi.getApplications(token);
      console.log('✅ Données reçues:', data);
      
      setApplications(data.applications || []);
      setError('');
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des demandes:', error);
      
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setError('Token d\'authentification invalide. Veuillez vous reconnecter.');
        setAuthStatus('invalid-token');
        // Rediriger vers la page de login après 3 secondes
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else if (error.message.includes('429')) {
        setError('Trop de tentatives. Veuillez attendre quelques secondes avant de réessayer.');
        // Retry après 5 secondes
        setTimeout(() => {
          fetchApplications();
        }, 5000);
      } else if (error.message.includes('Timeout')) {
        setError('Le serveur met trop de temps à répondre. Vérifiez que le serveur bot est démarré.');
        setApplications([]); // Afficher liste vide plutôt que rester bloqué
      } else {
        setError(`Erreur lors de la récupération des demandes: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (applicationId, action, adminNotes = '') => {
    try {
      setActionLoading(applicationId);
      let token = localStorage.getItem('adminToken');
      
      if (!token) {
        token = 'JuniorAdmon123';
        localStorage.setItem('adminToken', token);
      }
      
      await simpleApi.updateApplicationStatus(token, applicationId, action, adminNotes);
      
      // MISE À JOUR IMMÉDIATE dans l'état local (plus rapide que recharger)
      setApplications(prevApps => 
        prevApps.map(app => 
          app._id === applicationId 
            ? { ...app, status: action, adminNotes: adminNotes || app.adminNotes }
            : app
        )
      );
      
      // Mettre à jour la modal si ouverte
      if (selectedApp && selectedApp._id === applicationId) {
        setSelectedApp({ ...selectedApp, status: action, adminNotes: adminNotes || selectedApp.adminNotes });
      }
      
      // Toast de succès
      if (action === 'approved') {
        toast.success('Demande approuvée');
      } else {
        toast.success('Demande refusée');
      }
      
      setError('');
    } catch (error) {
      console.error(`Erreur lors de l'action ${action}:`, error);
      setError(`Erreur lors de l'action ${action}: ${error.message}`);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    const labels = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Refusé'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getServicesBadges = (services) => {
    if (!services) return null;
    
    const serviceLabels = {
      delivery: 'Livraison',
      postal: 'Postal', 
      meetup: 'Meetup',
      shipping: 'Envoi'
    };

    let servicesList = [];
    
    // Gérer les deux formats : array et object
    if (Array.isArray(services)) {
      // Format nouveau (array)
      servicesList = services;
    } else if (typeof services === 'object') {
      // Format ancien (object)
      servicesList = Object.keys(services).filter(key => 
        services[key] && 
        (services[key] === true || (services[key].enabled === true))
      );
    }
    
    if (servicesList.length === 0) return null;
    
    return servicesList.map(service => (
      <span key={service} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 mr-1 mb-1">
        {serviceLabels[service] || service}
      </span>
    ));
  };

  // Nouvelle fonction pour afficher les détails complets des services
  const getServicesDetails = (app) => {
    if (!app) return null;

    const servicesData = [];
    
    // Vérifier les nouveaux services avec codes postaux
    if (app.selectedServices && Array.isArray(app.selectedServices)) {
      app.selectedServices.forEach(service => {
        if (service === 'meetup' && app.meetupPostalCodes) {
          servicesData.push({
            type: 'meetup',
            name: '🤝 Meet Up',
            data: app.meetupPostalCodes
          });
        }
        if (service === 'delivery' && app.deliveryPostalCodes) {
          servicesData.push({
            type: 'delivery', 
            name: '🚚 Livraison',
            data: app.deliveryPostalCodes
          });
        }
        if (service === 'shipping') {
          servicesData.push({
            type: 'shipping',
            name: '📦 Envoi postal',
            data: app.workingCountries || ['Tous les pays sélectionnés']
          });
        }
      });
    }

    // Vérifier l'ancien format
    if (app.services && typeof app.services === 'object') {
      if (app.services.meetup && app.departments?.meetup) {
        servicesData.push({
          type: 'meetup',
          name: '🤝 Meet Up',
          data: { [app.country || 'Pays']: app.departments.meetup }
        });
      }
      if (app.services.delivery && app.departments?.delivery) {
        servicesData.push({
          type: 'delivery',
          name: '🚚 Livraison', 
          data: { [app.country || 'Pays']: app.departments.delivery }
        });
      }
      if (app.services.shipping) {
        servicesData.push({
          type: 'shipping',
          name: '📦 Envoi postal',
          data: [app.country || 'Pays principal']
        });
      }
    }

    if (servicesData.length === 0) return null;

    return (
      <div className="space-y-3">
        {servicesData.map((service, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <h4 className="font-medium text-sm mb-2">{service.name}</h4>
            {service.type === 'shipping' ? (
              <div className="text-sm text-gray-600">
                {Array.isArray(service.data) ? (
                  <div>Pays: {service.data.join(', ')}</div>
                ) : (
                  <div>Service disponible dans tous les pays sélectionnés</div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(service.data).map(([country, codes]) => (
                  <div key={country} className="text-sm">
                    <span className="font-medium text-gray-700">{country}:</span>
                    <span className="ml-2 text-gray-600">
                      {Array.isArray(codes) ? codes.join(', ') : codes}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Interface d'authentification
  if (authStatus === 'no-token' || authStatus === 'invalid-token') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">🔐 Authentification requise</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <a 
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Se connecter
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Chargement des demandes...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold leading-6 text-gray-900">Demandes d'inscription</h1>
            <p className="mt-2 text-sm text-gray-700">
              Gérez les demandes d'inscription pour devenir plug.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              onClick={() => {
                simpleApi.clearCache(); // Nettoyer le cache
                fetchApplications();
              }}
              className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Actualiser
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
            {error.includes('Token') && (
              <div className="mt-2">
                <button
                  onClick={() => window.location.href = '/'}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Se reconnecter
                </button>
              </div>
            )}
          </div>
        )}

        {/* Debug info */}
        <div className="mt-4 rounded-md bg-blue-50 p-4">
          <div className="text-sm text-blue-800">
            <strong>Debug:</strong> {applications.length} demandes trouvées
            {authStatus === 'authenticated' && (
              <span className="ml-2 text-green-600">✅ Authentifié</span>
            )}
          </div>
        </div>

        {/* Filtres - Responsive */}
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:space-x-4">
            {[
              { key: 'all', label: 'Toutes', count: applications.length },
              { key: 'pending', label: 'En attente', count: applications.filter(a => a.status === 'pending').length },
              { key: 'approved', label: 'Approuvées', count: applications.filter(a => a.status === 'approved').length },
              { key: 'rejected', label: 'Refusées', count: applications.filter(a => a.status === 'rejected').length }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  filter === filterOption.key
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="block sm:inline">{filterOption.label}</span>
                <span className="block sm:inline sm:ml-1">({filterOption.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Liste des demandes - Mobile Cards + Desktop Table */}
        {filteredApplications.length === 0 ? (
          <div className="mt-6 text-center py-12">
            <div className="text-gray-500 text-lg">📭</div>
            <div className="mt-2 text-sm text-gray-500">Aucune demande trouvée</div>
          </div>
        ) : (
          <>
            {/* Vue Mobile (cartes) */}
            <div className="mt-6 space-y-4 sm:hidden">
              {filteredApplications.map((app) => (
                <div key={app._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  {/* En-tête de la carte */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {app.name || app.plugName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {app.firstName} {app.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        @{app.username || app.userId}
                      </p>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      {getStatusBadge(app.status)}
                    </div>
                  </div>

                  {/* Localisation et pays de travail */}
                  <div className="mb-3 space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>📍</span>
                      <span className="ml-1">{app.location?.city || app.city}, {app.location?.country || app.country}</span>
                    </div>
                    {app.workingCountries && app.workingCountries.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span>🌍</span>
                        <span className="ml-1">Travaille en: {app.workingCountries.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Services */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {getServicesBadges(app.services || app.selectedServices)}
                    </div>
                  </div>

                  {/* Description */}
                  {app.description && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {app.description}
                      </p>
                    </div>
                  )}

                  {/* Date et actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {formatDate(app.createdAt)}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        Voir
                      </button>
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(app._id, 'approved')}
                            disabled={actionLoading === app._id}
                            className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleAction(app._id, 'rejected')}
                            disabled={actionLoading === app._id}
                            className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            ✗
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vue Desktop (tableau) - Responsive amélioré */}
            <div className="mt-6 hidden sm:block overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                      Plug
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Utilisateur
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Localisation
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                      Services
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">{app.name || app.plugName}</div>
                            {app.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs mt-1">
                                {app.description}
                              </div>
                            )}
                          </div>
                          {(app.photo || app.photoUrl) && (
                            <div className="ml-2 flex-shrink-0">
                              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {app.firstName} {app.lastName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          @{app.username || app.userId}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{app.location?.country || app.country}</div>
                        <div className="text-xs text-gray-500">{app.location?.city || app.city}</div>
                        {app.workingCountries && app.workingCountries.length > 0 && (
                          <div className="text-xs text-blue-600 mt-1 truncate" title={`Travaille en: ${app.workingCountries.join(', ')}`}>
                            🌍 {app.workingCountries.length} pays
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {getServicesBadges(app.services || app.selectedServices)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs text-gray-500">
                          {formatDate(app.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                          >
                            Détails
                          </button>
                          {app.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(app._id, 'approved')}
                                disabled={actionLoading === app._id}
                                className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-2 py-1 rounded transition-colors disabled:opacity-50"
                              >
                                ✓ Approuver
                              </button>
                              <button
                                onClick={() => handleAction(app._id, 'rejected')}
                                disabled={actionLoading === app._id}
                                className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded transition-colors disabled:opacity-50"
                              >
                                ✗ Refuser
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Modal de détails */}
        {selectedApp && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Détails de la demande
                  </h3>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom du plug</label>
                      <p className="text-sm text-gray-900">{selectedApp.plugName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Statut</label>
                      {getStatusBadge(selectedApp.status)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-900">{selectedApp.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pays</label>
                      <p className="text-sm text-gray-900">{selectedApp.country}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ville</label>
                      <p className="text-sm text-gray-900">{selectedApp.city}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Services proposés</label>
                    <div className="space-y-2">
                      {/* Badges des services */}
                      <div className="flex flex-wrap gap-1">
                        {getServicesBadges(selectedApp.services || selectedApp.selectedServices)}
                      </div>
                      
                      {/* Détails complets des services */}
                      <div className="mt-3">
                        {getServicesDetails(selectedApp)}
                      </div>
                    </div>
                  </div>

                  {/* Contacts et réseaux sociaux */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contacts et réseaux sociaux</label>
                    <div className="space-y-2">
                      {selectedApp.contact?.telegram && (
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-600 font-medium">📱 Telegram:</span>
                          <span className="text-sm text-gray-900">{selectedApp.contact.telegram}</span>
                        </div>
                      )}
                      {selectedApp.contact?.telegramChannel && (
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-600 font-medium">📢 Canal Telegram:</span>
                          <span className="text-sm text-gray-900">{selectedApp.contact.telegramChannel}</span>
                        </div>
                      )}
                      {selectedApp.contact?.telegramBot && (
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-600 font-medium">🤖 Bot Telegram:</span>
                          <span className="text-sm text-gray-900">{selectedApp.contact.telegramBot}</span>
                        </div>
                      )}
                      {selectedApp.contact?.instagram && (
                        <div className="flex items-center space-x-2">
                          <span className="text-pink-600 font-medium">📷 Instagram:</span>
                          <span className="text-sm text-gray-900">{selectedApp.contact.instagram}</span>
                        </div>
                      )}
                      {selectedApp.contact?.potato && (
                        <div className="flex items-center space-x-2">
                          <span className="text-yellow-600 font-medium">🏴‍☠️ Potato:</span>
                          <span className="text-sm text-gray-900">{selectedApp.contact.potato}</span>
                        </div>
                      )}
                      {selectedApp.contact?.snapchat && (
                        <div className="flex items-center space-x-2">
                          <span className="text-yellow-500 font-medium">👻 Snapchat:</span>
                          <span className="text-sm text-gray-900">{selectedApp.contact.snapchat}</span>
                        </div>
                      )}
                      {selectedApp.contact?.whatsapp && (
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600 font-medium">💬 WhatsApp:</span>
                          <span className="text-sm text-gray-900">{selectedApp.contact.whatsapp}</span>
                        </div>
                      )}
                      {selectedApp.contact?.signal && (
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-700 font-medium">🔒 Signal:</span>
                          <span className="text-sm text-gray-900">{selectedApp.contact.signal}</span>
                        </div>
                      )}
                      {selectedApp.contact?.session && (
                        <div className="flex items-center space-x-2">
                          <span className="text-purple-600 font-medium">🛡️ Session:</span>
                          <span className="text-sm text-gray-900">{selectedApp.contact.session}</span>
                        </div>
                      )}
                      {selectedApp.contact?.threema && (
                        <div className="flex items-center space-x-2">
                          <span className="text-green-700 font-medium">🔐 Threema:</span>
                          <span className="text-sm text-gray-900">{selectedApp.contact.threema}</span>
                        </div>
                      )}
                      {!selectedApp.contact?.telegram && !selectedApp.telegramContact && (
                        <div className="text-gray-500 text-sm">Aucune information de contact disponible</div>
                      )}
                      {/* Fallback pour ancienne structure */}
                      {selectedApp.telegramContact && !selectedApp.contact?.telegram && (
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-600 font-medium">📱 Telegram:</span>
                          <span className="text-sm text-gray-900">{selectedApp.telegramContact}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {(selectedApp.photo || selectedApp.photoUrl) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Photo du plug</label>
                      <div className="mt-2">
                        <img 
                          src={selectedApp.photo ? 
                            `${process.env.NEXT_PUBLIC_API_URL || 'https://jhhhhhhggre.onrender.com'}/api/photo/${selectedApp.photo}` : 
                            selectedApp.photoUrl
                          } 
                          alt="Photo du plug" 
                          className="h-48 w-48 object-cover rounded-lg border border-gray-300 shadow-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div 
                          className="h-48 w-48 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg text-gray-500"
                          style={{display: 'none'}}
                        >
                          <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-2 text-sm">Photo non disponible</p>
                          </div>
                        </div>
                        {selectedApp.photo && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">
                              ID: {selectedApp.photo}
                              <br />
                              <a 
                                href={`${process.env.NEXT_PUBLIC_API_URL || 'https://jhhhhhhggre.onrender.com'}/api/photo/${selectedApp.photo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Ouvrir l'image dans un nouvel onglet
                              </a>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Utilisateur</label>
                      <p className="text-sm text-gray-900">
                        {selectedApp.userFirstName} {selectedApp.userLastName}
                      </p>
                      <p className="text-sm text-gray-500">@{selectedApp.userUsername || selectedApp.userId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date de demande</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedApp.createdAt)}</p>
                    </div>
                  </div>

                  {selectedApp.adminNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes admin</label>
                      <p className="text-sm text-gray-900">{selectedApp.adminNotes}</p>
                    </div>
                  )}

                  {selectedApp.status === 'pending' && (
                    <div className="flex space-x-4 pt-4 border-t">
                      <button
                        onClick={() => handleAction(selectedApp._id, 'approved')}
                        disabled={actionLoading === selectedApp._id}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading === selectedApp._id ? 'Traitement...' : 'Approuver'}
                      </button>
                      <button
                        onClick={() => handleAction(selectedApp._id, 'rejected')}
                        disabled={actionLoading === selectedApp._id}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoading === selectedApp._id ? 'Traitement...' : 'Refuser'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}